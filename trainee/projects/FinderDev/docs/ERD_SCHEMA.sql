-- Supabase schema generated from the ERD (projects, profiles, skills, etc.)
-- Çalıştırma yeri: Supabase Dashboard -> SQL Editor

-- PROFILES
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  full_name text,
  avatar_url text,
  bio text,
  updated_at timestamptz default now(),
  -- auth.users.id ile ilişki
  constraint profiles_auth_user_fkey
    foreign key (id) references auth.users (id) on delete cascade
);

-- SKILLS
create table if not exists public.skills (
  id serial primary key,
  name text not null unique
);

-- PROFILE_SKILLS (N-N)
create table if not exists public.profile_skills (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  skill_id int not null references public.skills (id) on delete cascade,
  primary key (profile_id, skill_id)
);

-- PROJECTS
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  tech_stack text[] default '{}',
  created_at timestamptz default now()
);

-- PROJECT_MEMBERS
create table if not exists public.project_members (
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text,
  status text,
  primary key (project_id, user_id)
);

-- DIRECT MESSAGES
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles (id) on delete cascade,
  receiver_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- GENERIC LOG TABLE (table_name)
create table if not exists public.table_name (
  id bigserial primary key,
  inserted_at timestamptz default now(),
  updated_at timestamptz default now(),
  data jsonb,
  name text
);

-- INDEXES
create index if not exists idx_projects_owner_id on public.projects(owner_id);
create index if not exists idx_messages_sender_id on public.messages(sender_id);
create index if not exists idx_messages_receiver_id on public.messages(receiver_id);

-- updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers (örnek olarak profiles ve table_name)
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'set_profiles_updated_at'
  ) then
    create trigger set_profiles_updated_at
    before update on public.profiles
    for each row execute function public.set_updated_at();
  end if;

  if not exists (
    select 1 from pg_trigger where tgname = 'set_table_name_updated_at'
  ) then
    create trigger set_table_name_updated_at
    before update on public.table_name
    for each row execute function public.set_updated_at();
  end if;
end;
$$;

