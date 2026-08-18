-- Fix onboarding "Could not create family" on legacy/partial Supabase schemas.
-- Ensures profile exists, owner membership is created, and exposes create_family RPC.

create extension if not exists citext;

do $$ begin
  create type public.family_role as enum ('owner', 'editor', 'viewer');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.member_status as enum ('pending', 'active', 'removed');
exception when duplicate_object then null;
end $$;

-- Backfill profiles for auth users (missed signup trigger)
insert into public.profiles (id, display_name)
select
  u.id,
  coalesce(
    nullif(trim(u.raw_user_meta_data ->> 'display_name'), ''),
    split_part(u.email, '@', 1)
  )
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);

do $$ begin
  if to_regclass('public.user_preferences') is not null then
    insert into public.user_preferences (user_id)
    select p.id
    from public.profiles p
    where not exists (
      select 1 from public.user_preferences up where up.user_id = p.id
    );
  end if;
end $$;

-- families.created_by on legacy DBs
do $$ begin
  if to_regclass('public.families') is not null then
    alter table public.families add column if not exists created_by uuid;
    alter table public.families add column if not exists slug text;
    alter table public.families add column if not exists created_at timestamptz default now();
    alter table public.families add column if not exists updated_at timestamptz default now();
    alter table public.families add column if not exists deleted_at timestamptz;
  end if;
end $$;

create or replace function public.add_family_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.family_members (family_id, user_id, role, status, joined_at)
  values (
    new.id,
    new.created_by,
    'owner'::public.family_role,
    'active'::public.member_status,
    now()
  )
  on conflict (family_id, user_id) do update
    set role = 'owner'::public.family_role,
        status = 'active'::public.member_status,
        removed_at = null;

  return new;
end;
$$;

drop trigger if exists family_created on public.families;
create trigger family_created
  after insert on public.families
  for each row
  execute function public.add_family_owner();

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

alter table public.families enable row level security;

do $$ begin
  if to_regclass('public.family_members') is not null then
    alter table public.family_members add column if not exists joined_at timestamptz default now();
    alter table public.family_members add column if not exists removed_at timestamptz;
    alter table public.family_members add column if not exists status public.member_status default 'active';

    if not exists (
      select 1 from pg_constraint
      where conname = 'family_members_family_id_user_id_key'
    ) then
      alter table public.family_members
        add constraint family_members_family_id_user_id_key unique (family_id, user_id);
    end if;
  end if;
end $$;

drop policy if exists "families member read" on public.families;
create policy "families member read" on public.families
  for select
  using (public.is_family_member(id));

drop policy if exists "families authenticated create" on public.families;
create policy "families authenticated create" on public.families
  for insert
  to authenticated
  with check (created_by = auth.uid());

drop policy if exists "families owner update" on public.families;
create policy "families owner update" on public.families
  for update
  using (public.has_family_role(id, array['owner']::public.family_role[]));

create or replace function public.create_family(p_name text)
returns public.families
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_name text := trim(p_name);
  v_family public.families%rowtype;
  v_display_name text;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if char_length(v_name) < 1 or char_length(v_name) > 120 then
    raise exception 'Family name must be between 1 and 120 characters';
  end if;

  select coalesce(
    nullif(trim(u.raw_user_meta_data ->> 'display_name'), ''),
    split_part(u.email, '@', 1)
  )
  into v_display_name
  from auth.users u
  where u.id = v_user_id;

  insert into public.profiles (id, display_name)
  values (v_user_id, coalesce(v_display_name, 'Member'))
  on conflict (id) do nothing;

  if to_regclass('public.user_preferences') is not null then
    insert into public.user_preferences (user_id)
    values (v_user_id)
    on conflict do nothing;
  end if;

  insert into public.families (name, created_by)
  values (v_name, v_user_id)
  returning * into v_family;

  insert into public.family_members (family_id, user_id, role, status, joined_at)
  values (
    v_family.id,
    v_user_id,
    'owner'::public.family_role,
    'active'::public.member_status,
    now()
  )
  on conflict (family_id, user_id) do update
    set role = 'owner'::public.family_role,
        status = 'active'::public.member_status,
        removed_at = null;

  return v_family;
end;
$$;

grant execute on function public.create_family(text) to authenticated;
