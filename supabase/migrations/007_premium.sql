-- Sprint 7: Stripe + Premium

-- ─── subscriptions ─────────────────────────────────────────────
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade unique not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text default 'free',
  status text default 'inactive',
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table subscriptions enable row level security;

-- Users can only read their own subscription
create policy "subscriptions_select_own" on subscriptions
  for select using (auth.uid() = user_id);

-- Users can only update their own subscription (for client-side status checks)
create policy "subscriptions_update_own" on subscriptions
  for update using (auth.uid() = user_id);

-- Service role inserts (from edge functions) — no insert policy for anon
-- Edge functions use service_role key which bypasses RLS

-- Index for fast lookup
create index if not exists idx_subscriptions_user on subscriptions(user_id);
create index if not exists idx_subscriptions_stripe_customer on subscriptions(stripe_customer_id);

-- ─── Add is_premium to profiles ────────────────────────────────
alter table profiles add column if not exists is_premium boolean default false;

-- ─── Add is_premium_only to communities ────────────────────────
alter table communities add column if not exists is_premium_only boolean default false;
