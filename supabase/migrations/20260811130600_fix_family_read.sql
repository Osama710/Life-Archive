-- Fix app not seeing families/children after onboarding (RLS + legacy member rows).

update public.family_members
set status = 'active'::public.member_status
where status is null;

update public.family_members
set joined_at = coalesce(joined_at, now())
where joined_at is null;

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

alter table public.family_members enable row level security;

drop policy if exists "members read own" on public.family_members;
create policy "members read own" on public.family_members
  for select
  using (user_id = auth.uid());

drop policy if exists "members family read" on public.family_members;
create policy "members family read" on public.family_members
  for select
  using (public.is_family_member(family_id));

create or replace function public.get_my_families()
returns setof public.families
language sql
stable
security definer
set search_path = public
as $$
  select f.*
  from public.families f
  inner join public.family_members fm on fm.family_id = f.id
  where fm.user_id = auth.uid()
    and coalesce(fm.status, 'active'::public.member_status) = 'active'::public.member_status
    and fm.removed_at is null
    and f.deleted_at is null
  order by f.created_at desc nulls last;
$$;

grant execute on function public.get_my_families() to authenticated;

-- Repair memberships for family creators missing an owner row
insert into public.family_members (family_id, user_id, role, status, joined_at)
select f.id, f.created_by, 'owner'::public.family_role, 'active'::public.member_status, now()
from public.families f
where f.created_by is not null
  and f.deleted_at is null
  and not exists (
    select 1
    from public.family_members fm
    where fm.family_id = f.id
      and fm.user_id = f.created_by
  );
