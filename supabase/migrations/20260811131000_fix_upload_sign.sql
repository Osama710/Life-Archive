-- Allow upload sign route to resolve memories without client RLS edge cases.

create or replace function public.get_memory_for_upload(p_memory_id uuid)
returns table (id uuid, family_id uuid)
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

  return query
  select m.id, m.family_id
  from public.memories m
  where m.id = p_memory_id
    and m.deleted_at is null
    and public.is_family_member(m.family_id);
end;
$$;

grant execute on function public.get_memory_for_upload(uuid) to authenticated;
