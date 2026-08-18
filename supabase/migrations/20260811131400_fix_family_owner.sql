-- Repair missing owner membership for family creators (legacy rows / failed triggers).

create or replace function public.ensure_family_owner(p_family_id uuid)
returns void
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1
    from public.families f
    where f.id = p_family_id
      and f.created_by = v_user_id
      and f.deleted_at is null
  ) then
    return;
  end if;

  insert into public.family_members (family_id, user_id, role, status, joined_at)
  values (
    p_family_id,
    v_user_id,
    'owner'::public.family_role,
    'active'::public.member_status,
    now()
  )
  on conflict (family_id, user_id) do update
    set role = 'owner'::public.family_role,
        status = 'active'::public.member_status,
        removed_at = null;
end;
$$;

grant execute on function public.ensure_family_owner(uuid) to authenticated;

-- Backfill any creators still missing an active owner row
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
      and fm.removed_at is null
      and coalesce(fm.status, 'active'::public.member_status) = 'active'::public.member_status
  );
