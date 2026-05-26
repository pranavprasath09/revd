-- Migration 011: Create profile rows server-side on signup
--
-- Why: the client-side profile upsert in useAuth ran *after* supabase.auth.signUp.
-- Under email confirmation there is no session at that point, so the insert was
-- blocked by RLS (auth.uid() is null) and confirmed users landed with no profile
-- row — breaking tier lookups, display names, and every joined query. Moving it to
-- a SECURITY DEFINER trigger on auth.users guarantees a profile for every user, in
-- every auth flow (email confirm, auto-confirm, OAuth).
--
-- Idempotent: create or replace function, drop trigger if exists, on conflict do nothing.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      split_part(new.email, '@', 1),
      'User'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: give any existing auth user that is missing a profile row one now.
insert into public.profiles (id, display_name)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'display_name', split_part(u.email, '@', 1), 'User')
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;
