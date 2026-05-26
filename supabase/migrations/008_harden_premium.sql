-- Sprint 8: Harden Premium — prevent client-side self-promotion
-- ──────────────────────────────────────────────────────────────

-- 1. Remove the subscriptions UPDATE policy that lets users modify their own row
--    Subscriptions should ONLY be written by service_role (webhook / edge functions)
drop policy if exists "subscriptions_update_own" on subscriptions;

-- 2. Explicitly deny client INSERT on subscriptions (defense-in-depth)
--    Service role bypasses RLS, so this blocks anon/authenticated but not webhook
drop policy if exists "subscriptions_insert_denied" on subscriptions;
create policy "subscriptions_insert_denied" on subscriptions
  for insert with check (false);

-- 3. Protect is_premium and tier columns on profiles via trigger
--    Only service_role can flip these — prevents users from self-promoting
create or replace function profiles_protect_premium()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  -- If the caller is not service_role, revert premium fields to their old values
  if current_setting('request.jwt.claim.role', true) is distinct from 'service_role' then
    new.is_premium := old.is_premium;
    new.tier := old.tier;
  end if;
  return new;
end $$;

drop trigger if exists profiles_protect_premium_trg on profiles;
create trigger profiles_protect_premium_trg
  before update on profiles
  for each row execute function profiles_protect_premium();

-- 4. Idempotency table for Stripe webhook events
create table if not exists processed_stripe_events (
  event_id text primary key,
  processed_at timestamptz default now()
);

-- No RLS needed — this table is only accessed by service_role from the webhook
alter table processed_stripe_events enable row level security;

-- Deny all client access
drop policy if exists "processed_stripe_events_deny_all" on processed_stripe_events;
create policy "processed_stripe_events_deny_all" on processed_stripe_events
  for all using (false);

-- 5. Add increment_build_cost RPC so clients don't directly update total_cost
create or replace function increment_build_cost(log_id uuid, amount integer)
returns void language plpgsql security definer set search_path = '' as $$
begin
  -- Only the build log owner can increment cost
  if not exists (
    select 1 from public.build_logs
    where id = log_id and owner_id = auth.uid()
  ) then
    raise exception 'Not authorized';
  end if;

  update public.build_logs
  set total_cost = coalesce(total_cost, 0) + amount,
      updated_at = now()
  where id = log_id;
end $$;
