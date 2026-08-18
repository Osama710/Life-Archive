create extension if not exists pgcrypto;
create extension if not exists citext;

create type public.family_role as enum ('owner', 'editor', 'viewer');
create type public.member_status as enum ('pending', 'active', 'removed');
create type public.memory_status as enum ('draft', 'published', 'archived', 'deleted');
create type public.media_type as enum ('photo', 'video', 'audio', 'document');
create type public.sync_status as enum ('pending', 'syncing', 'synced', 'failed', 'conflict');
create type public.job_status as enum ('pending', 'processing', 'completed', 'failed', 'expired');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  timezone text not null default 'UTC',
  locale text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  slug text unique,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.family_role not null default 'viewer',
  status public.member_status not null default 'active',
  joined_at timestamptz not null default now(),
  removed_at timestamptz,
  unique (family_id, user_id)
);

create table public.family_invitations (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  email citext not null,
  role public.family_role not null default 'viewer',
  token_hash text not null unique,
  invited_by uuid not null references public.profiles(id),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.children (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120),
  birth_date date,
  conception_date date,
  gender text,
  photo_url text,
  journey_type text not null default 'childhood',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (birth_date is not null or conception_date is not null)
);

create table public.templates (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text,
  category text not null,
  is_system boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.child_templates (
  child_id uuid not null references public.children(id) on delete cascade,
  template_id uuid not null references public.templates(id) on delete cascade,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (child_id, template_id)
);

create table public.milestones (
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

create table public.memories (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  child_id uuid references public.children(id) on delete set null,
  milestone_id uuid references public.milestones(id) on delete set null,
  title text not null check (char_length(trim(title)) between 1 and 200),
  description text,
  memory_date date not null,
  memory_time time,
  location text,
  mood text,
  status public.memory_status not null default 'published',
  is_favorite boolean not null default false,
  is_private boolean not null default true,
  created_by uuid not null references public.profiles(id),
  updated_by uuid references public.profiles(id),
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  purge_after timestamptz
);

alter table public.milestones
  add constraint milestones_completed_memory_fk
  foreign key (completed_memory_id) references public.memories(id) on delete set null;

create table public.memory_prompt_answers (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories(id) on delete cascade,
  prompt_key text not null,
  prompt_text text not null,
  answer text not null,
  sort_order integer not null default 0,
  unique (memory_id, prompt_key)
);

create table public.memory_media (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories(id) on delete cascade,
  media_type public.media_type not null,
  provider text not null default 'cloudinary',
  provider_asset_id text not null,
  url text not null,
  secure_url text not null,
  thumbnail_url text,
  file_name text,
  mime_type text,
  bytes bigint check (bytes is null or bytes >= 0),
  width integer,
  height integer,
  duration_seconds numeric,
  metadata jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (provider, provider_asset_id)
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  name citext not null,
  created_at timestamptz not null default now(),
  unique (family_id, name)
);

create table public.memory_tags (
  memory_id uuid not null references public.memories(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (memory_id, tag_id)
);

create table public.memory_people (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  child_id uuid references public.children(id) on delete set null,
  display_name text,
  check (num_nonnulls(profile_id, child_id, display_name) = 1)
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120),
  description text,
  cover_media_id uuid references public.memory_media(id) on delete set null,
  collection_type text not null default 'manual' check (collection_type in ('manual', 'year', 'month', 'smart')),
  criteria jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.memory_collections (
  collection_id uuid not null references public.collections(id) on delete cascade,
  memory_id uuid not null references public.memories(id) on delete cascade,
  sort_order integer not null default 0,
  added_at timestamptz not null default now(),
  primary key (collection_id, memory_id)
);

create table public.growth_records (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  measurement_date date not null,
  height_cm numeric check (height_cm is null or height_cm between 10 and 300),
  weight_kg numeric check (weight_kg is null or weight_kg between 0.1 and 500),
  head_circumference_cm numeric check (head_circumference_cm is null or head_circumference_cm between 10 and 100),
  notes text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (child_id, measurement_date)
);

create table public.health_records (
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

create table public.time_capsules (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  child_id uuid references public.children(id) on delete set null,
  title text not null,
  encrypted_content text not null,
  encryption_version integer not null default 1,
  unlock_at timestamptz not null,
  created_by uuid not null references public.profiles(id),
  recipient_user_id uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  font_scale text not null default 'default' check (font_scale in ('default', 'large')),
  notifications jsonb not null default '{}'::jsonb,
  privacy jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.notifications (
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

create table public.export_jobs (
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

create table public.sync_operations (
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

create table public.audit_events (
  id bigint generated always as identity primary key,
  family_id uuid references public.families(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index memories_family_date_idx on public.memories (family_id, memory_date desc) where deleted_at is null;
create index memories_child_date_idx on public.memories (child_id, memory_date desc) where deleted_at is null;
create index memories_search_idx on public.memories using gin (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, '')));
create index media_memory_order_idx on public.memory_media (memory_id, sort_order) where deleted_at is null;
create index collections_family_order_idx on public.collections (family_id, sort_order) where deleted_at is null;
create index notifications_user_unread_idx on public.notifications (user_id, created_at desc) where read_at is null;
create index audit_family_created_idx on public.audit_events (family_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  insert into public.user_preferences (user_id) values (new.id);
  return new;
end;
$$;

create or replace function public.add_family_owner()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.family_members (family_id, user_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end;
$$;

create or replace function public.is_family_member(target_family_id uuid)
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.family_members
    where family_id = target_family_id
      and user_id = auth.uid()
      and status = 'active'
  );
$$;

create or replace function public.has_family_role(target_family_id uuid, allowed_roles public.family_role[])
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.family_members
    where family_id = target_family_id
      and user_id = auth.uid()
      and status = 'active'
      and role = any(allowed_roles)
  );
$$;

create trigger auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();
create trigger family_created
  after insert on public.families for each row execute function public.add_family_owner();

create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger families_updated before update on public.families for each row execute function public.set_updated_at();
create trigger children_updated before update on public.children for each row execute function public.set_updated_at();
create trigger milestones_updated before update on public.milestones for each row execute function public.set_updated_at();
create trigger memories_updated before update on public.memories for each row execute function public.set_updated_at();
create trigger collections_updated before update on public.collections for each row execute function public.set_updated_at();
create trigger growth_updated before update on public.growth_records for each row execute function public.set_updated_at();
create trigger health_updated before update on public.health_records for each row execute function public.set_updated_at();
create trigger capsules_updated before update on public.time_capsules for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.family_invitations enable row level security;
alter table public.children enable row level security;
alter table public.templates enable row level security;
alter table public.child_templates enable row level security;
alter table public.milestones enable row level security;
alter table public.memories enable row level security;
alter table public.memory_prompt_answers enable row level security;
alter table public.memory_media enable row level security;
alter table public.tags enable row level security;
alter table public.memory_tags enable row level security;
alter table public.memory_people enable row level security;
alter table public.collections enable row level security;
alter table public.memory_collections enable row level security;
alter table public.growth_records enable row level security;
alter table public.health_records enable row level security;
alter table public.time_capsules enable row level security;
alter table public.user_preferences enable row level security;
alter table public.notifications enable row level security;
alter table public.export_jobs enable row level security;
alter table public.sync_operations enable row level security;
alter table public.audit_events enable row level security;

create policy "profiles read self" on public.profiles for select using (id = auth.uid());
create policy "profiles update self" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "preferences own" on public.user_preferences for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "families member read" on public.families for select using (public.is_family_member(id));
create policy "families authenticated create" on public.families for insert to authenticated with check (created_by = auth.uid());
create policy "families owner update" on public.families for update using (public.has_family_role(id, array['owner']::public.family_role[]));

create policy "members family read" on public.family_members for select using (public.is_family_member(family_id));
create policy "members owner insert" on public.family_members for insert with check (public.has_family_role(family_id, array['owner']::public.family_role[]));
create policy "members owner update" on public.family_members for update using (public.has_family_role(family_id, array['owner']::public.family_role[]));
create policy "members owner delete" on public.family_members for delete using (public.has_family_role(family_id, array['owner']::public.family_role[]));

create policy "invitations owner manage" on public.family_invitations for all
using (public.has_family_role(family_id, array['owner']::public.family_role[]))
with check (public.has_family_role(family_id, array['owner']::public.family_role[]) and invited_by = auth.uid());

create policy "templates authenticated read" on public.templates for select to authenticated using (true);

create policy "children family read" on public.children for select using (public.is_family_member(family_id));
create policy "children editors insert" on public.children for insert with check (public.has_family_role(family_id, array['owner','editor']::public.family_role[]) and created_by = auth.uid());
create policy "children editors update" on public.children for update using (public.has_family_role(family_id, array['owner','editor']::public.family_role[]));

create policy "child templates family read" on public.child_templates for select
using (exists (select 1 from public.children c where c.id = child_id and public.is_family_member(c.family_id)));
create policy "child templates editors manage" on public.child_templates for all
using (exists (select 1 from public.children c where c.id = child_id and public.has_family_role(c.family_id, array['owner','editor']::public.family_role[])))
with check (exists (select 1 from public.children c where c.id = child_id and public.has_family_role(c.family_id, array['owner','editor']::public.family_role[])));

create policy "milestones family read" on public.milestones for select
using (exists (select 1 from public.children c where c.id = child_id and public.is_family_member(c.family_id)));
create policy "milestones editors manage" on public.milestones for all
using (exists (select 1 from public.children c where c.id = child_id and public.has_family_role(c.family_id, array['owner','editor']::public.family_role[])))
with check (exists (select 1 from public.children c where c.id = child_id and public.has_family_role(c.family_id, array['owner','editor']::public.family_role[])));

create policy "memories family read" on public.memories for select
using (
  public.is_family_member(family_id)
  and (not is_private or created_by = auth.uid() or public.has_family_role(family_id, array['owner']::public.family_role[]))
);
create policy "memories editors insert" on public.memories for insert
with check (public.has_family_role(family_id, array['owner','editor']::public.family_role[]) and created_by = auth.uid());
create policy "memories editors update" on public.memories for update
using (public.has_family_role(family_id, array['owner','editor']::public.family_role[]));

create policy "prompt answers family read" on public.memory_prompt_answers for select
using (exists (select 1 from public.memories m where m.id = memory_id and public.is_family_member(m.family_id)));
create policy "prompt answers editors manage" on public.memory_prompt_answers for all
using (exists (select 1 from public.memories m where m.id = memory_id and public.has_family_role(m.family_id, array['owner','editor']::public.family_role[])))
with check (exists (select 1 from public.memories m where m.id = memory_id and public.has_family_role(m.family_id, array['owner','editor']::public.family_role[])));

create policy "media family read" on public.memory_media for select
using (exists (select 1 from public.memories m where m.id = memory_id and public.is_family_member(m.family_id)));
create policy "media editors manage" on public.memory_media for all
using (exists (select 1 from public.memories m where m.id = memory_id and public.has_family_role(m.family_id, array['owner','editor']::public.family_role[])))
with check (exists (select 1 from public.memories m where m.id = memory_id and public.has_family_role(m.family_id, array['owner','editor']::public.family_role[])));

create policy "tags family read" on public.tags for select using (public.is_family_member(family_id));
create policy "tags editors manage" on public.tags for all
using (public.has_family_role(family_id, array['owner','editor']::public.family_role[]))
with check (public.has_family_role(family_id, array['owner','editor']::public.family_role[]));

create policy "memory tags family read" on public.memory_tags for select
using (exists (select 1 from public.memories m where m.id = memory_id and public.is_family_member(m.family_id)));
create policy "memory tags editors manage" on public.memory_tags for all
using (exists (select 1 from public.memories m where m.id = memory_id and public.has_family_role(m.family_id, array['owner','editor']::public.family_role[])))
with check (exists (select 1 from public.memories m where m.id = memory_id and public.has_family_role(m.family_id, array['owner','editor']::public.family_role[])));

create policy "memory people family read" on public.memory_people for select
using (exists (select 1 from public.memories m where m.id = memory_id and public.is_family_member(m.family_id)));
create policy "memory people editors manage" on public.memory_people for all
using (exists (select 1 from public.memories m where m.id = memory_id and public.has_family_role(m.family_id, array['owner','editor']::public.family_role[])))
with check (exists (select 1 from public.memories m where m.id = memory_id and public.has_family_role(m.family_id, array['owner','editor']::public.family_role[])));

create policy "collections family read" on public.collections for select using (public.is_family_member(family_id));
create policy "collections editors insert" on public.collections for insert
with check (public.has_family_role(family_id, array['owner','editor']::public.family_role[]) and created_by = auth.uid());
create policy "collections editors update" on public.collections for update
using (public.has_family_role(family_id, array['owner','editor']::public.family_role[]));

create policy "memory collections family read" on public.memory_collections for select
using (exists (select 1 from public.collections c where c.id = collection_id and public.is_family_member(c.family_id)));
create policy "memory collections editors manage" on public.memory_collections for all
using (exists (select 1 from public.collections c where c.id = collection_id and public.has_family_role(c.family_id, array['owner','editor']::public.family_role[])))
with check (exists (select 1 from public.collections c where c.id = collection_id and public.has_family_role(c.family_id, array['owner','editor']::public.family_role[])));

create policy "growth family read" on public.growth_records for select
using (exists (select 1 from public.children c where c.id = child_id and public.is_family_member(c.family_id)));
create policy "growth editors manage" on public.growth_records for all
using (exists (select 1 from public.children c where c.id = child_id and public.has_family_role(c.family_id, array['owner','editor']::public.family_role[])))
with check (exists (select 1 from public.children c where c.id = child_id and public.has_family_role(c.family_id, array['owner','editor']::public.family_role[])));

create policy "health family read" on public.health_records for select
using (exists (select 1 from public.children c where c.id = child_id and public.is_family_member(c.family_id)));
create policy "health editors manage" on public.health_records for all
using (exists (select 1 from public.children c where c.id = child_id and public.has_family_role(c.family_id, array['owner','editor']::public.family_role[])))
with check (exists (select 1 from public.children c where c.id = child_id and public.has_family_role(c.family_id, array['owner','editor']::public.family_role[])));

create policy "capsules creator or unlocked recipient read" on public.time_capsules for select
using (created_by = auth.uid() or (recipient_user_id = auth.uid() and unlock_at <= now()));
create policy "capsules editors insert" on public.time_capsules for insert
with check (public.has_family_role(family_id, array['owner','editor']::public.family_role[]) and created_by = auth.uid());
create policy "capsules creator update" on public.time_capsules for update
using (created_by = auth.uid() and unlock_at > now());

create policy "notifications own" on public.notifications for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "exports family read" on public.export_jobs for select
using (requested_by = auth.uid() or public.has_family_role(family_id, array['owner']::public.family_role[]));
create policy "exports member create" on public.export_jobs for insert
with check (public.is_family_member(family_id) and requested_by = auth.uid());
create policy "sync own" on public.sync_operations for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "audit owners read" on public.audit_events for select
using (public.has_family_role(family_id, array['owner']::public.family_role[]));

insert into public.templates (key, name, description, category) values
  ('pregnancy', 'Pregnancy Journey', 'Weekly moments, ultrasounds, and preparations.', 'journey'),
  ('birth-first-days', 'Birth & First Days', 'Birth story and the first days together.', 'journey'),
  ('first-year', 'First Year Milestones', 'First smile, laugh, steps, words, and more.', 'milestone'),
  ('islamic-milestones', 'Islamic Milestones', 'Adhan, Aqiqah, Tahneek, and family traditions.', 'faith'),
  ('monthly-growth', 'Monthly Growth', 'Monthly reflections and growth moments.', 'growth'),
  ('school', 'School & Education', 'First days, achievements, projects, and friendships.', 'education'),
  ('achievements', 'Achievements & Firsts', 'Skills, celebrations, and proud moments.', 'milestone'),
  ('family-events', 'Family Events', 'Gatherings, holidays, travel, and traditions.', 'family');
