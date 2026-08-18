-- Step 1: run this FIRST if patch failed mid-way.
-- Creates enums + fixes family_members.role, then run the full patch again.

create extension if not exists citext;

do $$ begin
  create type public.family_role as enum ('owner', 'editor', 'viewer');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.member_status as enum ('pending', 'active', 'removed');
exception when duplicate_object then null;
end $$;

-- Add status column if legacy table never had it
alter table public.family_members
  add column if not exists status public.member_status default 'active';

alter table public.family_members
  add column if not exists removed_at timestamptz;

alter table public.family_members
  add column if not exists joined_at timestamptz default now();

update public.family_members
set status = 'active'::public.member_status
where status is null;

update public.family_members
set joined_at = coalesce(joined_at, now())
where joined_at is null;

-- Normalize legacy role text values
update public.family_members
set role = 'viewer'
where lower(role::text) not in ('owner', 'editor', 'viewer');

-- Convert role text -> enum (must drop default first)
do $$ begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'family_members'
      and column_name = 'role'
      and udt_name <> 'family_role'
  ) then
    alter table public.family_members alter column role drop default;
    alter table public.family_members
      alter column role type public.family_role
      using lower(trim(role::text))::public.family_role;
  end if;
end $$;

alter table public.family_members
  alter column role set default 'viewer'::public.family_role;

alter table public.family_members
  alter column status set default 'active'::public.member_status;

alter table public.family_members
  alter column status set not null;
