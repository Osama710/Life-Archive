-- Life Archive: upgrade legacy Supabase schema + add missing feature tables.
-- Run ONCE in Supabase SQL Editor on projects that already had an older schema.
--
-- Order:
--   1) extensions + enums
--   2) upgrade existing core tables (add missing columns / convert types)
--   3) shared RLS helper functions
--   4) missing feature tables + memory_media upgrades
--   5) triggers, RLS policies, invite RPC

-- ============================================================================
-- 1) Extensions + enums
-- ============================================================================
create extension if not exists citext;
create extension if not exists pgcrypto;

do $$ begin create type public.family_role as enum ('owner', 'editor', 'viewer');
exception when duplicate_object then null; end $$;

do $$ begin create type public.member_status as enum ('pending', 'active', 'removed');
exception when duplicate_object then null; end $$;

do $$ begin create type public.memory_status as enum ('draft', 'published', 'archived', 'deleted');
exception when duplicate_object then null; end $$;

do $$ begin create type public.media_type as enum ('photo', 'video', 'audio', 'document');
exception when duplicate_object then null; end $$;

do $$ begin create type public.sync_status as enum ('pending', 'syncing', 'synced', 'failed', 'conflict');
exception when duplicate_object then null; end $$;

do $$ begin create type public.job_status as enum ('pending', 'processing', 'completed', 'failed', 'expired');
exception when duplicate_object then null; end $$;

-- ============================================================================
-- 2) Upgrade existing core tables to match current app models
-- ============================================================================

-- profiles (legacy projects often never created this table)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  timezone text not null default 'UTC',
  locale text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

insert into public.profiles (id, display_name)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'display_name', split_part(u.email, '@', 1))
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);

insert into public.profiles (id, display_name)
select distinct fm.user_id, 'Member'
from public.family_members fm
where fm.user_id is not null
  and exists (select 1 from auth.users u where u.id = fm.user_id)
  and not exists (select 1 from public.profiles p where p.id = fm.user_id);

insert into public.profiles (id, display_name)
select distinct f.created_by, 'Owner'
from public.families f
where f.created_by is not null
  and exists (select 1 from auth.users u where u.id = f.created_by)
  and not exists (select 1 from public.profiles p where p.id = f.created_by);

alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists timezone text default 'UTC';
alter table public.profiles add column if not exists locale text default 'en';
alter table public.profiles add column if not exists created_at timestamptz default now();
alter table public.profiles add column if not exists updated_at timestamptz default now();
alter table public.profiles add column if not exists deleted_at timestamptz;
update public.profiles set timezone = coalesce(timezone, 'UTC') where timezone is null;
update public.profiles set locale = coalesce(locale, 'en') where locale is null;
update public.profiles set created_at = coalesce(created_at, now()) where created_at is null;
update public.profiles set updated_at = coalesce(updated_at, now()) where updated_at is null;

-- families
do $$ begin
  if to_regclass('public.families') is not null then
    alter table public.families add column if not exists slug text;
    alter table public.families add column if not exists created_at timestamptz default now();
    alter table public.families add column if not exists updated_at timestamptz default now();
    alter table public.families add column if not exists deleted_at timestamptz;
  end if;
end $$;

-- family_members (legacy often had: id, family_id, user_id, role text, joined_at)
do $$ begin
  if to_regclass('public.family_members') is not null then
    alter table public.family_members add column if not exists joined_at timestamptz default now();
    alter table public.family_members add column if not exists removed_at timestamptz;
    alter table public.family_members add column if not exists status public.member_status default 'active';

    update public.family_members set joined_at = coalesce(joined_at, now()) where joined_at is null;
    update public.family_members set status = 'active'::public.member_status where status is null;

    -- Normalize legacy role values before enum conversion
    update public.family_members
    set role = 'viewer'
    where lower(role::text) not in ('owner', 'editor', 'viewer');

    update public.family_members
    set role = 'viewer'
    where lower(role::text) = 'guest';

    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'family_members'
        and column_name = 'role' and udt_name <> 'family_role'
    ) then
      alter table public.family_members alter column role drop default;
      alter table public.family_members
        alter column role type public.family_role
        using lower(trim(role::text))::public.family_role;
      alter table public.family_members
        alter column role set default 'viewer'::public.family_role;
    end if;

    alter table public.family_members alter column role set default 'viewer'::public.family_role;
    alter table public.family_members alter column status set default 'active'::public.member_status;
    alter table public.family_members alter column status set not null;

    if not exists (
      select 1 from pg_constraint
      where conname = 'family_members_family_id_user_id_key'
    ) then
      alter table public.family_members
        add constraint family_members_family_id_user_id_key unique (family_id, user_id);
    end if;
  end if;
end $$;

-- children
do $$ begin
  if to_regclass('public.children') is not null then
    alter table public.children add column if not exists conception_date date;
    alter table public.children add column if not exists journey_type text default 'childhood';
    alter table public.children add column if not exists photo_url text;
    alter table public.children add column if not exists gender text;
    alter table public.children add column if not exists created_by uuid;
    alter table public.children add column if not exists created_at timestamptz default now();
    alter table public.children add column if not exists updated_at timestamptz default now();
    alter table public.children add column if not exists deleted_at timestamptz;
    update public.children set journey_type = coalesce(journey_type, 'childhood') where journey_type is null;
    update public.children c
    set created_by = f.created_by
    from public.families f
    where c.family_id = f.id and c.created_by is null;
  end if;
end $$;

-- memories
do $$ begin
  if to_regclass('public.memories') is not null then
    alter table public.memories add column if not exists milestone_id uuid;
    alter table public.memories add column if not exists memory_time time;
    alter table public.memories add column if not exists location text;
    alter table public.memories add column if not exists mood text;
    alter table public.memories add column if not exists is_favorite boolean default false;
    alter table public.memories add column if not exists is_private boolean default true;
    alter table public.memories add column if not exists updated_by uuid;
    alter table public.memories add column if not exists version integer default 1;
    alter table public.memories add column if not exists created_at timestamptz default now();
    alter table public.memories add column if not exists updated_at timestamptz default now();
    alter table public.memories add column if not exists deleted_at timestamptz;
    alter table public.memories add column if not exists purge_after timestamptz;
    alter table public.memories add column if not exists status public.memory_status default 'published';

    update public.memories set is_favorite = coalesce(is_favorite, false) where is_favorite is null;
    update public.memories set is_private = coalesce(is_private, true) where is_private is null;
    update public.memories set version = coalesce(version, 1) where version is null;
    update public.memories set status = 'published'::public.memory_status where status is null;

    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'memories'
        and column_name = 'status' and udt_name <> 'memory_status'
    ) then
      update public.memories
      set status = 'published'
      where lower(status::text) not in ('draft', 'published', 'archived', 'deleted');

      alter table public.memories alter column status drop default;
      alter table public.memories
        alter column status type public.memory_status
        using lower(trim(status::text))::public.memory_status;
      alter table public.memories
        alter column status set default 'published'::public.memory_status;
    end if;
  end if;
end $$;

-- collections
do $$ begin
  if to_regclass('public.collections') is not null then
    alter table public.collections add column if not exists description text;
    alter table public.collections add column if not exists cover_media_id uuid;
    alter table public.collections add column if not exists collection_type text default 'manual';
    alter table public.collections add column if not exists criteria jsonb default '{}'::jsonb;
    alter table public.collections add column if not exists sort_order integer default 0;
    alter table public.collections add column if not exists created_by uuid;
    alter table public.collections add column if not exists created_at timestamptz default now();
    alter table public.collections add column if not exists updated_at timestamptz default now();
    alter table public.collections add column if not exists deleted_at timestamptz;
    update public.collections c
    set created_by = f.created_by
    from public.families f
    where c.family_id = f.id and c.created_by is null;
  end if;
end $$;

-- Add profile FK constraints after profiles table exists
do $$ begin
  if to_regclass('public.profiles') is not null and to_regclass('public.children') is not null
     and not exists (select 1 from pg_constraint where conname = 'children_created_by_fkey') then
    alter table public.children
      add constraint children_created_by_fkey foreign key (created_by) references public.profiles(id);
  end if;

  if to_regclass('public.profiles') is not null and to_regclass('public.memories') is not null
     and not exists (select 1 from pg_constraint where conname = 'memories_updated_by_fkey') then
    alter table public.memories
      add constraint memories_updated_by_fkey foreign key (updated_by) references public.profiles(id);
  end if;

  if to_regclass('public.profiles') is not null and to_regclass('public.collections') is not null
     and not exists (select 1 from pg_constraint where conname = 'collections_created_by_fkey') then
    alter table public.collections
      add constraint collections_created_by_fkey foreign key (created_by) references public.profiles(id);
  end if;
end $$;

-- ============================================================================
-- 3) Shared functions (after family_members has status/role columns)
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_family_member(target_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.family_members fm
    where fm.family_id = target_family_id
      and fm.user_id = auth.uid()
      and fm.status = 'active'::public.member_status
      and fm.removed_at is null
  );
$$;

create or replace function public.has_family_role(
  target_family_id uuid,
  allowed_roles public.family_role[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.family_members fm
    where fm.family_id = target_family_id
      and fm.user_id = auth.uid()
      and fm.status = 'active'::public.member_status
      and fm.removed_at is null
      and fm.role = any(allowed_roles)
  );
$$;

-- ============================================================================
-- 4) memory_media + missing feature tables
-- ============================================================================
create table if not exists public.memory_media (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories(id) on delete cascade,
  media_type public.media_type not null default 'photo',
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

do $$ begin
  if to_regclass('public.memory_media') is not null then
    alter table public.memory_media add column if not exists secure_url text;
    alter table public.memory_media add column if not exists thumbnail_url text;
    alter table public.memory_media add column if not exists file_name text;
    alter table public.memory_media add column if not exists mime_type text;
    alter table public.memory_media add column if not exists bytes bigint;
    alter table public.memory_media add column if not exists width integer;
    alter table public.memory_media add column if not exists height integer;
    alter table public.memory_media add column if not exists duration_seconds numeric;
    alter table public.memory_media add column if not exists metadata jsonb default '{}'::jsonb;
    alter table public.memory_media add column if not exists sort_order integer default 0;
    alter table public.memory_media add column if not exists deleted_at timestamptz;
    alter table public.memory_media add column if not exists provider text default 'cloudinary';
    alter table public.memory_media add column if not exists provider_asset_id text;
    alter table public.memory_media add column if not exists created_at timestamptz default now();
    alter table public.memory_media add column if not exists media_type public.media_type default 'photo';

    update public.memory_media set secure_url = coalesce(secure_url, url) where secure_url is null and url is not null;
    update public.memory_media set metadata = coalesce(metadata, '{}'::jsonb) where metadata is null;
    update public.memory_media set sort_order = coalesce(sort_order, 0) where sort_order is null;
    update public.memory_media set media_type = 'photo'::public.media_type where media_type is null;

    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'memory_media'
        and column_name = 'media_type' and udt_name <> 'media_type'
    ) then
      alter table public.memory_media
        alter column media_type type public.media_type
        using lower(media_type::text)::public.media_type;
    end if;
  end if;
end $$;

create index if not exists media_memory_order_idx
  on public.memory_media (memory_id, sort_order);

create table if not exists public.family_invitations (
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

create table if not exists public.growth_records (
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

create table if not exists public.time_capsules (
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

-- ============================================================================
-- 5) Triggers
-- ============================================================================
drop trigger if exists growth_updated on public.growth_records;
create trigger growth_updated
  before update on public.growth_records
  for each row execute function public.set_updated_at();

drop trigger if exists capsules_updated on public.time_capsules;
create trigger capsules_updated
  before update on public.time_capsules
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 6) RLS on patched tables
-- ============================================================================
alter table public.memory_media enable row level security;
alter table public.family_invitations enable row level security;
alter table public.growth_records enable row level security;
alter table public.time_capsules enable row level security;

drop policy if exists "media family read" on public.memory_media;
create policy "media family read" on public.memory_media for select
using (
  exists (
    select 1 from public.memories m
    where m.id = memory_id and public.is_family_member(m.family_id)
  )
);

drop policy if exists "media editors manage" on public.memory_media;
create policy "media editors manage" on public.memory_media for all
using (
  exists (
    select 1 from public.memories m
    where m.id = memory_id
      and public.has_family_role(m.family_id, array['owner','editor']::public.family_role[])
  )
)
with check (
  exists (
    select 1 from public.memories m
    where m.id = memory_id
      and public.has_family_role(m.family_id, array['owner','editor']::public.family_role[])
  )
);

drop policy if exists "invitations owner manage" on public.family_invitations;
create policy "invitations owner manage" on public.family_invitations for all
using (public.has_family_role(family_id, array['owner']::public.family_role[]))
with check (
  public.has_family_role(family_id, array['owner']::public.family_role[])
  and invited_by = auth.uid()
);

drop policy if exists "growth family read" on public.growth_records;
create policy "growth family read" on public.growth_records for select
using (
  exists (
    select 1 from public.children c
    where c.id = child_id and public.is_family_member(c.family_id)
  )
);

drop policy if exists "growth editors manage" on public.growth_records;
create policy "growth editors manage" on public.growth_records for all
using (
  exists (
    select 1 from public.children c
    where c.id = child_id
      and public.has_family_role(c.family_id, array['owner','editor']::public.family_role[])
  )
)
with check (
  exists (
    select 1 from public.children c
    where c.id = child_id
      and public.has_family_role(c.family_id, array['owner','editor']::public.family_role[])
  )
);

drop policy if exists "capsules creator or unlocked recipient read" on public.time_capsules;
create policy "capsules creator or unlocked recipient read" on public.time_capsules for select
using (
  created_by = auth.uid()
  or (recipient_user_id = auth.uid() and unlock_at <= now())
);

drop policy if exists "capsules editors insert" on public.time_capsules;
create policy "capsules editors insert" on public.time_capsules for insert
with check (
  public.has_family_role(family_id, array['owner','editor']::public.family_role[])
  and created_by = auth.uid()
);

drop policy if exists "capsules creator update" on public.time_capsules;
create policy "capsules creator update" on public.time_capsules for update
using (created_by = auth.uid() and unlock_at > now());

-- ============================================================================
-- 7) Invite acceptance RPC
-- ============================================================================
create or replace function public.accept_family_invitation(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hash text;
  v_invite public.family_invitations%rowtype;
  v_email text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  v_email := lower(coalesce(auth.jwt() ->> 'email', ''));
  if v_email = '' then
    raise exception 'Missing user email';
  end if;

  v_hash := encode(digest(p_token, 'sha256'), 'hex');

  select *
  into v_invite
  from public.family_invitations
  where token_hash = v_hash
    and accepted_at is null
    and revoked_at is null
    and expires_at > now()
  limit 1;

  if not found then
    raise exception 'Invite not found or expired';
  end if;

  if lower(v_invite.email::text) <> v_email then
    raise exception 'Invite email does not match signed-in user';
  end if;

  insert into public.family_members (family_id, user_id, role, status, joined_at)
  values (v_invite.family_id, auth.uid(), v_invite.role, 'active', now())
  on conflict (family_id, user_id) do update
    set role = excluded.role,
        status = 'active'::public.member_status,
        removed_at = null;

  update public.family_invitations
  set accepted_at = now()
  where id = v_invite.id;

  return v_invite.family_id;
end;
$$;

grant execute on function public.accept_family_invitation(text) to authenticated;
