-- Fix "infinite recursion detected in policy for relation family_members"
-- and timeline failing to load memories (even when the list is empty).

create or replace function public.is_family_member(target_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1
    from public.family_members fm
    where fm.family_id = target_family_id
      and fm.user_id = auth.uid()
      and coalesce(fm.status, 'active'::public.member_status) = 'active'::public.member_status
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
set row_security = off
as $$
  select exists (
    select 1
    from public.family_members fm
    where fm.family_id = target_family_id
      and fm.user_id = auth.uid()
      and coalesce(fm.status, 'active'::public.member_status) = 'active'::public.member_status
      and fm.removed_at is null
      and fm.role = any(allowed_roles)
  );
$$;

-- Replace recursive family_members read policy (is_family_member -> family_members -> is_family_member)
drop policy if exists "members family read" on public.family_members;
create policy "members family read" on public.family_members
  for select
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.family_members self
      where self.family_id = family_members.family_id
        and self.user_id = auth.uid()
        and coalesce(self.status, 'active'::public.member_status) = 'active'::public.member_status
        and self.removed_at is null
    )
  );

-- Ensure memories table + columns exist for timeline queries
do $$ begin
  create type public.memory_status as enum ('draft', 'published', 'archived', 'deleted');
exception when duplicate_object then null;
end $$;

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  child_id uuid references public.children(id) on delete set null,
  title text not null,
  description text,
  memory_date date not null default current_date,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$ begin
  if to_regclass('public.memories') is not null then
    alter table public.memories add column if not exists child_id uuid;
    alter table public.memories add column if not exists milestone_id uuid;
    alter table public.memories add column if not exists memory_date date default current_date;
    alter table public.memories add column if not exists memory_time time;
    alter table public.memories add column if not exists location text;
    alter table public.memories add column if not exists mood text;
    alter table public.memories add column if not exists status public.memory_status default 'published';
    alter table public.memories add column if not exists is_favorite boolean default false;
    alter table public.memories add column if not exists is_private boolean default true;
    alter table public.memories add column if not exists updated_by uuid;
    alter table public.memories add column if not exists version integer default 1;
    alter table public.memories add column if not exists created_at timestamptz default now();
    alter table public.memories add column if not exists updated_at timestamptz default now();
    alter table public.memories add column if not exists deleted_at timestamptz;
    alter table public.memories add column if not exists purge_after timestamptz;

    update public.memories
    set memory_date = coalesce(memory_date, created_at::date, current_date)
    where memory_date is null;

    update public.memories
    set status = coalesce(status, 'published'::public.memory_status)
    where status is null;

    update public.memories
    set is_favorite = coalesce(is_favorite, false)
    where is_favorite is null;

    update public.memories
    set is_private = coalesce(is_private, true)
    where is_private is null;

    update public.memories
    set version = coalesce(version, 1)
    where version is null;
  end if;
end $$;

alter table public.memories enable row level security;

drop policy if exists "memories family read" on public.memories;
create policy "memories family read" on public.memories
  for select
  using (
    public.is_family_member(family_id)
    and (
      coalesce(is_private, true) = false
      or created_by = auth.uid()
      or public.has_family_role(family_id, array['owner']::public.family_role[])
    )
  );

drop policy if exists "memories editors insert" on public.memories;
create policy "memories editors insert" on public.memories
  for insert
  to authenticated
  with check (
    public.has_family_role(family_id, array['owner', 'editor']::public.family_role[])
    and created_by = auth.uid()
  );

drop policy if exists "memories editors update" on public.memories;
create policy "memories editors update" on public.memories
  for update
  using (public.has_family_role(family_id, array['owner', 'editor']::public.family_role[]));

create or replace function public.get_family_memories(
  p_family_id uuid,
  p_limit integer default 20,
  p_offset integer default 0
)
returns setof public.memories
language plpgsql
stable
security definer
set search_path = public
set row_security = off
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_family_member(p_family_id) then
    raise exception 'Not allowed to read memories for this family';
  end if;

  return query
  select m.*
  from public.memories m
  where m.family_id = p_family_id
    and m.deleted_at is null
  order by m.memory_date desc nulls last, m.created_at desc nulls last
  limit greatest(p_limit, 0)
  offset greatest(p_offset, 0);
end;
$$;

grant execute on function public.get_family_memories(uuid, integer, integer) to authenticated;
