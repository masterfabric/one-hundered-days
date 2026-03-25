-- =============================================
-- FinderDev - Phase A Profiles Schema Patch
-- =============================================
-- Goal:
--   Align `public.profiles` with currently shipped app fields
--   without breaking existing data.
--
-- Notes:
--   - Safe to run multiple times (idempotent).
--   - Keeps badge/achievement system modeling out of scope for now
--     to unblock go-live quickly.

begin;

-- 1) Add missing profile columns used by current app screens
alter table if exists public.profiles
  add column if not exists about text,
  add column if not exists linkedin_url text,
  add column if not exists user_tag text,
  add column if not exists visibility text default 'public',
  add column if not exists achievement_count integer default 0,
  add column if not exists achievements_count integer default 0,
  add column if not exists achievements text;

-- 2) Backfill existing rows safely
update public.profiles
set visibility = 'public'
where visibility is null;

update public.profiles
set achievement_count = 0
where achievement_count is null or achievement_count < 0;

update public.profiles
set achievements_count = coalesce(achievement_count, 0)
where achievements_count is null or achievements_count < 0;

-- 3) Enforce constraints for runtime consistency
alter table public.profiles
  alter column visibility set default 'public',
  alter column visibility set not null,
  alter column achievement_count set default 0,
  alter column achievement_count set not null,
  alter column achievements_count set default 0,
  alter column achievements_count set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_visibility_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_visibility_check
      check (visibility in ('public', 'members_only'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_achievement_count_non_negative'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_achievement_count_non_negative
      check (achievement_count >= 0);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_achievements_count_non_negative'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_achievements_count_non_negative
      check (achievements_count >= 0);
  end if;
end $$;

-- 4) Helpful index for visibility-based reads
create index if not exists idx_profiles_visibility
  on public.profiles (visibility);

commit;

