-- Fix single-memory reads failing while timeline list works (RLS / embed issues).

create or replace function public.get_memory(p_id uuid)
returns public.memories
language plpgsql
stable
security definer
set search_path = public
set row_security = off
as $$
declare
  v_user_id uuid := auth.uid();
  v_memory public.memories%rowtype;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select *
  into v_memory
  from public.memories m
  where m.id = p_id
    and m.deleted_at is null;

  if not found then
    raise exception 'Memory not found';
  end if;

  if not public.is_family_member(v_memory.family_id) then
    raise exception 'Not allowed to read this memory';
  end if;

  if coalesce(v_memory.is_private, true)
     and v_memory.created_by is distinct from v_user_id
     and not public.has_family_role(
       v_memory.family_id,
       array['owner']::public.family_role[]
     ) then
    raise exception 'Not allowed to read this memory';
  end if;

  return v_memory;
end;
$$;

grant execute on function public.get_memory(uuid) to authenticated;

create or replace function public.get_memory_media(p_memory_id uuid)
returns setof public.memory_media
language plpgsql
stable
security definer
set search_path = public
set row_security = off
as $$
declare
  v_user_id uuid := auth.uid();
  v_memory public.memories%rowtype;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select *
  into v_memory
  from public.memories m
  where m.id = p_memory_id
    and m.deleted_at is null;

  if not found then
    raise exception 'Memory not found';
  end if;

  if not public.is_family_member(v_memory.family_id) then
    raise exception 'Not allowed to read media for this memory';
  end if;

  if coalesce(v_memory.is_private, true)
     and v_memory.created_by is distinct from v_user_id
     and not public.has_family_role(
       v_memory.family_id,
       array['owner']::public.family_role[]
     ) then
    raise exception 'Not allowed to read media for this memory';
  end if;

  return query
  select mm.*
  from public.memory_media mm
  where mm.memory_id = p_memory_id
    and mm.deleted_at is null
  order by mm.sort_order nulls last, mm.created_at asc;
end;
$$;

grant execute on function public.get_memory_media(uuid) to authenticated;
