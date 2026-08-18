-- Family invites: create invitation, list members & pending invites.

create or replace function public.get_family_members(p_family_id uuid)
returns table (
  id uuid,
  user_id uuid,
  role public.family_role,
  status public.member_status,
  joined_at timestamptz,
  display_name text
)
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
    raise exception 'Not allowed to view members for this family';
  end if;

  return query
  select
    fm.id,
    fm.user_id,
    fm.role,
    coalesce(fm.status, 'active'::public.member_status) as status,
    fm.joined_at,
    coalesce(nullif(trim(p.display_name), ''), 'Family member') as display_name
  from public.family_members fm
  left join public.profiles p on p.id = fm.user_id
  where fm.family_id = p_family_id
    and fm.removed_at is null
    and coalesce(fm.status, 'active'::public.member_status) = 'active'::public.member_status
  order by
    case fm.role
      when 'owner' then 0
      when 'editor' then 1
      else 2
    end,
    fm.joined_at asc nulls last;
end;
$$;

grant execute on function public.get_family_members(uuid) to authenticated;

create or replace function public.get_family_invitations(p_family_id uuid)
returns table (
  id uuid,
  email text,
  role public.family_role,
  expires_at timestamptz,
  created_at timestamptz
)
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

  if not public.has_family_role(
    p_family_id,
    array['owner']::public.family_role[]
  ) then
    raise exception 'Only the family owner can view invitations';
  end if;

  return query
  select
    fi.id,
    fi.email::text,
    fi.role,
    fi.expires_at,
    fi.created_at
  from public.family_invitations fi
  where fi.family_id = p_family_id
    and fi.accepted_at is null
    and fi.revoked_at is null
    and fi.expires_at > now()
  order by fi.created_at desc;
end;
$$;

grant execute on function public.get_family_invitations(uuid) to authenticated;

create or replace function public.create_family_invitation(
  p_family_id uuid,
  p_email text,
  p_role public.family_role default 'editor'
)
returns text
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text := lower(trim(p_email));
  v_token text := gen_random_uuid()::text;
  v_hash text;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if v_email = '' or position('@' in v_email) = 0 then
    raise exception 'A valid email is required';
  end if;

  if not public.has_family_role(
    p_family_id,
    array['owner']::public.family_role[]
  ) then
    raise exception 'Only the family owner can invite members';
  end if;

  if p_role not in ('owner', 'editor', 'viewer') then
    raise exception 'Invalid role';
  end if;

  v_hash := encode(digest(v_token, 'sha256'), 'hex');

  update public.family_invitations fi
  set revoked_at = now()
  where fi.family_id = p_family_id
    and lower(fi.email::text) = v_email
    and fi.accepted_at is null
    and fi.revoked_at is null;

  insert into public.family_invitations (
    family_id,
    email,
    role,
    token_hash,
    invited_by,
    expires_at
  )
  values (
    p_family_id,
    v_email,
    coalesce(p_role, 'editor'::public.family_role),
    v_hash,
    v_user_id,
    now() + interval '7 days'
  );

  return v_token;
end;
$$;

grant execute on function public.create_family_invitation(uuid, text, public.family_role) to authenticated;
