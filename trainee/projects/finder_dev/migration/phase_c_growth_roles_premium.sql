-- Phase C: Growth (level/achievement), roles/permissions model, premium foundation.
-- Safe to run multiple times.

create extension if not exists pgcrypto;

-- =====================================================
-- 1) Gamification tables
-- =====================================================

create table if not exists public.achievement_definitions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text not null,
  category text not null default 'general',
  xp_reward integer not null default 0,
  is_repeatable boolean not null default false,
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.user_progress (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  xp_total integer not null default 0,
  level integer not null default 1,
  updated_at timestamptz not null default now()
);

create table if not exists public.progress_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_code text not null,
  xp_delta integer not null default 0,
  project_id uuid references public.projects(id) on delete set null,
  source_id text not null default '',
  created_at timestamptz not null default now(),
  constraint uq_progress_event_idempotent unique (event_code, user_id, source_id)
);

create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id uuid not null references public.achievement_definitions(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  earned_at timestamptz not null default now(),
  meta jsonb not null default '{}'::jsonb
);

create unique index if not exists idx_user_achievements_once_per_project
  on public.user_achievements(user_id, achievement_id, coalesce(project_id, '00000000-0000-0000-0000-000000000000'::uuid));

create index if not exists idx_progress_events_user_created
  on public.progress_events(user_id, created_at desc);

create index if not exists idx_user_achievements_user_earned
  on public.user_achievements(user_id, earned_at desc);

-- Seed baseline achievements (idempotent)
insert into public.achievement_definitions (code, title, description, category, xp_reward, is_repeatable, is_visible)
values
  ('first_project_created', 'Project Starter', 'Create your first project.', 'projects', 40, false, true),
  ('first_request_sent', 'Explorer', 'Send your first join request.', 'collaboration', 20, false, true),
  ('first_request_accepted', 'Teammate', 'Get accepted into a project team.', 'collaboration', 50, false, true),
  ('first_project_completed', 'Closer', 'Complete your first owned project.', 'projects', 120, false, true),
  ('profile_completed', 'Identity Complete', 'Complete key profile fields.', 'profile', 30, false, true)
on conflict (code) do update
set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  xp_reward = excluded.xp_reward,
  is_repeatable = excluded.is_repeatable,
  is_visible = excluded.is_visible;

-- =====================================================
-- 2) Roles model for project_members
-- =====================================================

alter table public.project_members
  add column if not exists team_role text not null default 'member',
  add column if not exists granted_by uuid references public.profiles(id) on delete set null,
  add column if not exists granted_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'project_members_team_role_check'
  ) then
    alter table public.project_members
      add constraint project_members_team_role_check
      check (team_role in ('leader', 'co_leader', 'member'));
  end if;
end $$;

create index if not exists idx_project_members_team_role
  on public.project_members(project_id, team_role);

-- =====================================================
-- 3) Premium membership foundation
-- =====================================================

create table if not exists public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  price_monthly numeric(10,2) not null default 0,
  currency text not null default 'USD',
  project_limit integer not null default 3,
  advanced_filters boolean not null default false,
  priority_visibility boolean not null default false,
  analytics_enabled boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid not null references public.subscription_plans(id) on delete restrict,
  provider text not null default 'manual',
  provider_subscription_id text,
  status text not null default 'inactive',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'user_subscriptions_status_check'
  ) then
    alter table public.user_subscriptions
      add constraint user_subscriptions_status_check
      check (status in ('active', 'trialing', 'past_due', 'cancelled', 'inactive'));
  end if;
end $$;

create unique index if not exists idx_user_subscriptions_one_active
  on public.user_subscriptions(user_id)
  where status in ('active', 'trialing', 'past_due');

create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint uq_billing_provider_event unique (provider, provider_event_id)
);

insert into public.subscription_plans
  (code, name, price_monthly, currency, project_limit, advanced_filters, priority_visibility, analytics_enabled, is_active)
values
  ('free', 'Free', 0, 'USD', 3, false, false, false, true),
  ('premium', 'Premium', 7.99, 'USD', 15, true, true, true, true)
on conflict (code) do update
set
  name = excluded.name,
  price_monthly = excluded.price_monthly,
  currency = excluded.currency,
  project_limit = excluded.project_limit,
  advanced_filters = excluded.advanced_filters,
  priority_visibility = excluded.priority_visibility,
  analytics_enabled = excluded.analytics_enabled,
  is_active = excluded.is_active;

