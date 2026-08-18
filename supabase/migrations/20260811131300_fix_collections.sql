-- Collections: list/add/remove memories reliably (RLS-safe RPCs).

create or replace function public.get_collection_memories(p_collection_id uuid)
returns setof public.memories
language plpgsql
stable
security definer
set search_path = public
set row_security = off
as $$
declare
  v_family_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select c.family_id
  into v_family_id
  from public.collections c
  where c.id = p_collection_id
    and c.deleted_at is null;

  if not found then
    raise exception 'Collection not found';
  end if;

  if not public.is_family_member(v_family_id) then
    raise exception 'Not allowed to read this collection';
  end if;

  return query
  select m.*
  from public.memory_collections mc
  join public.memories m on m.id = mc.memory_id
  where mc.collection_id = p_collection_id
    and m.deleted_at is null
  order by mc.sort_order nulls last, mc.added_at desc nulls last, m.memory_date desc nulls last;
end;
$$;

grant execute on function public.get_collection_memories(uuid) to authenticated;

create or replace function public.get_memory_collection_ids(p_memory_id uuid)
returns setof uuid
language plpgsql
stable
security definer
set search_path = public
set row_security = off
as $$
declare
  v_family_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select m.family_id
  into v_family_id
  from public.memories m
  where m.id = p_memory_id
    and m.deleted_at is null;

  if not found then
    raise exception 'Memory not found';
  end if;

  if not public.is_family_member(v_family_id) then
    raise exception 'Not allowed';
  end if;

  return query
  select mc.collection_id
  from public.memory_collections mc
  where mc.memory_id = p_memory_id;
end;
$$;

grant execute on function public.get_memory_collection_ids(uuid) to authenticated;

create or replace function public.add_memory_to_collection(
  p_collection_id uuid,
  p_memory_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  v_collection_family uuid;
  v_memory_family uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select c.family_id
  into v_collection_family
  from public.collections c
  where c.id = p_collection_id
    and c.deleted_at is null;

  if not found then
    raise exception 'Collection not found';
  end if;

  select m.family_id
  into v_memory_family
  from public.memories m
  where m.id = p_memory_id
    and m.deleted_at is null;

  if not found then
    raise exception 'Memory not found';
  end if;

  if v_collection_family is distinct from v_memory_family then
    raise exception 'Memory and collection must belong to the same family';
  end if;

  if not public.has_family_role(
    v_collection_family,
    array['owner', 'editor']::public.family_role[]
  ) then
    raise exception 'Not allowed to update this collection';
  end if;

  insert into public.memory_collections (collection_id, memory_id)
  values (p_collection_id, p_memory_id)
  on conflict (collection_id, memory_id) do nothing;
end;
$$;

grant execute on function public.add_memory_to_collection(uuid, uuid) to authenticated;

create or replace function public.remove_memory_from_collection(
  p_collection_id uuid,
  p_memory_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  v_family_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select c.family_id
  into v_family_id
  from public.collections c
  where c.id = p_collection_id
    and c.deleted_at is null;

  if not found then
    raise exception 'Collection not found';
  end if;

  if not public.has_family_role(
    v_family_id,
    array['owner', 'editor']::public.family_role[]
  ) then
    raise exception 'Not allowed to update this collection';
  end if;

  delete from public.memory_collections mc
  where mc.collection_id = p_collection_id
    and mc.memory_id = p_memory_id;
end;
$$;

grant execute on function public.remove_memory_from_collection(uuid, uuid) to authenticated;
