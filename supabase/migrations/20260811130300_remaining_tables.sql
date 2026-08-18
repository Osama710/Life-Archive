-- Patch part 2: create the 13 remaining tables missing from legacy schema.
-- Run AFTER 20260811130200_patch_missing_tables.sql succeeded.
-- Target: present_count = 24, missing_count = 0

create extension if not exists citext;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text,
  category text not null,
  is_system boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.child_templates (
  child_id uuid not null references public.children(id) on delete cascade,
  template_id uuid not null references public.templates(id) on delete cascade,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (child_id, template_id)
);

create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  template_id uuid references public.templates(id) on delete set null,
  title text not null,
  description text,
  suggested_date date,
  completed_memory_id uuid,
  status text not null default 'upcoming' check (status in ('upcoming', 'completed', 'skipped')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'milestones_completed_memory_fk'
  ) then
    alter table public.milestones
      add constraint milestones_completed_memory_fk
      foreign key (completed_memory_id) references public.memories(id) on delete set null;
  end if;
end $$;

create table if not exists public.memory_prompt_answers (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories(id) on delete cascade,
  prompt_key text not null,
  prompt_text text not null,
  answer text not null,
  sort_order integer not null default 0,
  unique (memory_id, prompt_key)
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  name citext not null,
  created_at timestamptz not null default now(),
  unique (family_id, name)
);

create table if not exists public.memory_tags (
  memory_id uuid not null references public.memories(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (memory_id, tag_id)
);

create table if not exists public.memory_people (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  child_id uuid references public.children(id) on delete set null,
  display_name text,
  check (num_nonnulls(profile_id, child_id, display_name) = 1)
);

create table if not exists public.memory_collections (
  collection_id uuid not null references public.collections(id) on delete cascade,
  memory_id uuid not null references public.memories(id) on delete cascade,
  sort_order integer not null default 0,
  added_at timestamptz not null default now(),
  primary key (collection_id, memory_id)
);

create table if not exists public.health_records (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  record_type text not null check (record_type in ('vaccination', 'visit', 'medicine', 'allergy', 'procedure')),
  title text not null,
  event_date date not null,
  details jsonb not null default '{}'::jsonb,
  notes text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  font_scale text not null default 'default' check (font_scale in ('default', 'large')),
  notifications jsonb not null default '{}'::jsonb,
  privacy jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  family_id uuid references public.families(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.export_jobs (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  requested_by uuid not null references public.profiles(id),
  status public.job_status not null default 'pending',
  artifact_url text,
  error_message text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.sync_operations (
  id uuid primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  operation text not null check (operation in ('insert', 'update', 'delete', 'upload')),
  base_version integer,
  payload jsonb not null,
  status public.sync_status not null default 'pending',
  error_message text,
  created_at timestamptz not null default now(),
  synced_at timestamptz
);

create table if not exists public.audit_events (
  id bigint generated always as identity primary key,
  family_id uuid references public.families(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists memories_family_date_idx
  on public.memories (family_id, memory_date desc);

create index if not exists memories_child_date_idx
  on public.memories (child_id, memory_date desc);

create index if not exists memories_search_idx
  on public.memories using gin (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, '')));

create index if not exists collections_family_order_idx
  on public.collections (family_id, sort_order);

create index if not exists notifications_user_unread_idx
  on public.notifications (user_id, created_at desc);

create index if not exists audit_family_created_idx
  on public.audit_events (family_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
drop trigger if exists milestones_updated on public.milestones;
create trigger milestones_updated
  before update on public.milestones
  for each row execute function public.set_updated_at();

drop trigger if exists health_updated on public.health_records;
create trigger health_updated
  before update on public.health_records
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Seed data
-- ---------------------------------------------------------------------------
insert into public.templates (key, name, description, category) values
  ('pregnancy', 'Pregnancy Journey', 'Weekly moments, ultrasounds, and preparations.', 'journey'),
  ('birth-first-days', 'Birth & First Days', 'Birth story and the first days together.', 'journey'),
  ('first-year', 'First Year Milestones', 'First smile, laugh, steps, words, and more.', 'milestone'),
  ('islamic-milestones', 'Islamic Milestones', 'Adhan, Aqiqah, Tahneek, and family traditions.', 'faith'),
  ('monthly-growth', 'Monthly Growth', 'Monthly reflections and growth moments.', 'growth'),
  ('school', 'School & Education', 'First days, achievements, projects, and friendships.', 'education'),
  ('achievements', 'Achievements & Firsts', 'Skills, celebrations, and proud moments.', 'milestone'),
  ('family-events', 'Family Events', 'Gatherings, holidays, travel, and traditions.', 'family')
on conflict (key) do nothing;

insert into public.user_preferences (user_id)
select p.id
from public.profiles p
where not exists (
  select 1 from public.user_preferences up where up.user_id = p.id
);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.templates enable row level security;
alter table public.child_templates enable row level security;
alter table public.milestones enable row level security;
alter table public.memory_prompt_answers enable row level security;
alter table public.tags enable row level security;
alter table public.memory_tags enable row level security;
alter table public.memory_people enable row level security;
alter table public.memory_collections enable row level security;
alter table public.health_records enable row level security;
alter table public.user_preferences enable row level security;
alter table public.notifications enable row level security;
alter table public.export_jobs enable row level security;
alter table public.sync_operations enable row level security;
alter table public.audit_events enable row level security;

drop policy if exists "profiles read self" on public.profiles;
create policy "profiles read self" on public.profiles for select using (id = auth.uid());

drop policy if exists "profiles update self" on public.profiles;
create policy "profiles update self" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "preferences own" on public.user_preferences;
create policy "preferences own" on public.user_preferences for all
using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "templates authenticated read" on public.templates;
create policy "templates authenticated read" on public.templates for select to authenticated using (true);

drop policy if exists "child templates family read" on public.child_templates;
create policy "child templates family read" on public.child_templates for select
using (exists (select 1 from public.children c where c.id = child_id and public.is_family_member(c.family_id)));

drop policy if exists "child templates editors manage" on public.child_templates;
create policy "child templates editors manage" on public.child_templates for all
using (exists (select 1 from public.children c where c.id = child_id and public.has_family_role(c.family_id, array['owner','editor']::public.family_role[])))
with check (exists (select 1 from public.children c where c.id = child_id and public.has_family_role(c.family_id, array['owner','editor']::public.family_role[])));

drop policy if exists "milestones family read" on public.milestones;
create policy "milestones family read" on public.milestones for select
using (exists (select 1 from public.children c where c.id = child_id and public.is_family_member(c.family_id)));

drop policy if exists "milestones editors manage" on public.milestones;
create policy "milestones editors manage" on public.milestones for all
using (exists (select 1 from public.children c where c.id = child_id and public.has_family_role(c.family_id, array['owner','editor']::public.family_role[])))
with check (exists (select 1 from public.children c where c.id = child_id and public.has_family_role(c.family_id, array['owner','editor']::public.family_role[])));

drop policy if exists "prompt answers family read" on public.memory_prompt_answers;
create policy "prompt answers family read" on public.memory_prompt_answers for select
using (exists (select 1 from public.memories m where m.id = memory_id and public.is_family_member(m.family_id)));

drop policy if exists "prompt answers editors manage" on public.memory_prompt_answers;
create policy "prompt answers editors manage" on public.memory_prompt_answers for all
using (exists (select 1 from public.memories m where m.id = memory_id and public.has_family_role(m.family_id, array['owner','editor']::public.family_role[])))
with check (exists (select 1 from public.memories m where m.id = memory_id and public.has_family_role(m.family_id, array['owner','editor']::public.family_role[])));

drop policy if exists "tags family read" on public.tags;
create policy "tags family read" on public.tags for select using (public.is_family_member(family_id));

drop policy if exists "tags editors manage" on public.tags;
create policy "tags editors manage" on public.tags for all
using (public.has_family_role(family_id, array['owner','editor']::public.family_role[]))
with check (public.has_family_role(family_id, array['owner','editor']::public.family_role[]));

drop policy if exists "memory tags family read" on public.memory_tags;
create policy "memory tags family read" on public.memory_tags for select
using (exists (select 1 from public.memories m where m.id = memory_id and public.is_family_member(m.family_id)));

drop policy if exists "memory tags editors manage" on public.memory_tags;
create policy "memory tags editors manage" on public.memory_tags for all
using (exists (select 1 from public.memories m where m.id = memory_id and public.has_family_role(m.family_id, array['owner','editor']::public.family_role[])))
with check (exists (select 1 from public.memories m where m.id = memory_id and public.has_family_role(m.family_id, array['owner','editor']::public.family_role[])));

drop policy if exists "memory people family read" on public.memory_people;
create policy "memory people family read" on public.memory_people for select
using (exists (select 1 from public.memories m where m.id = memory_id and public.is_family_member(m.family_id)));

drop policy if exists "memory people editors manage" on public.memory_people;
create policy "memory people editors manage" on public.memory_people for all
using (exists (select 1 from public.memories m where m.id = memory_id and public.has_family_role(m.family_id, array['owner','editor']::public.family_role[])))
with check (exists (select 1 from public.memories m where m.id = memory_id and public.has_family_role(m.family_id, array['owner','editor']::public.family_role[])));

drop policy if exists "memory collections family read" on public.memory_collections;
create policy "memory collections family read" on public.memory_collections for select
using (exists (select 1 from public.collections c where c.id = collection_id and public.is_family_member(c.family_id)));

drop policy if exists "memory collections editors manage" on public.memory_collections;
create policy "memory collections editors manage" on public.memory_collections for all
using (exists (select 1 from public.collections c where c.id = collection_id and public.has_family_role(c.family_id, array['owner','editor']::public.family_role[])))
with check (exists (select 1 from public.collections c where c.id = collection_id and public.has_family_role(c.family_id, array['owner','editor']::public.family_role[])));

drop policy if exists "health family read" on public.health_records;
create policy "health family read" on public.health_records for select
using (exists (select 1 from public.children c where c.id = child_id and public.is_family_member(c.family_id)));

drop policy if exists "health editors manage" on public.health_records;
create policy "health editors manage" on public.health_records for all
using (exists (select 1 from public.children c where c.id = child_id and public.has_family_role(c.family_id, array['owner','editor']::public.family_role[])))
with check (exists (select 1 from public.children c where c.id = child_id and public.has_family_role(c.family_id, array['owner','editor']::public.family_role[])));

drop policy if exists "notifications own" on public.notifications;
create policy "notifications own" on public.notifications for all
using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "exports family read" on public.export_jobs;
create policy "exports family read" on public.export_jobs for select
using (requested_by = auth.uid() or public.has_family_role(family_id, array['owner']::public.family_role[]));

drop policy if exists "exports member create" on public.export_jobs;
create policy "exports member create" on public.export_jobs for insert
with check (public.is_family_member(family_id) and requested_by = auth.uid());

drop policy if exists "sync own" on public.sync_operations;
create policy "sync own" on public.sync_operations for all
using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "audit owners read" on public.audit_events;
create policy "audit owners read" on public.audit_events for select
using (public.has_family_role(family_id, array['owner']::public.family_role[]));
