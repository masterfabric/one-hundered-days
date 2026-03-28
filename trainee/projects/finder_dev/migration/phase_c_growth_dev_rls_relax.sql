-- Development helper: relax growth RLS until final policy rollout.
-- Run once in Supabase SQL editor.

alter table if exists public.achievement_definitions disable row level security;
alter table if exists public.user_progress disable row level security;
alter table if exists public.progress_events disable row level security;
alter table if exists public.user_achievements disable row level security;

-- Optional visibility grants in case your project removed defaults.
grant select on public.achievement_definitions to authenticated;
grant select, insert, update on public.user_progress to authenticated;
grant select, insert on public.progress_events to authenticated;
grant select, insert on public.user_achievements to authenticated;
