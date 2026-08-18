-- Ensure memories are readable for family members on legacy schemas.

alter table public.memories enable row level security;

do $$ begin
  if to_regclass('public.memories') is not null then
    alter table public.memories add column if not exists memory_date date;
    alter table public.memories add column if not exists deleted_at timestamptz;
    alter table public.memories add column if not exists is_private boolean default true;
    alter table public.memories add column if not exists status public.memory_status default 'published';

    update public.memories
    set memory_date = coalesce(memory_date, created_at::date, current_date)
    where memory_date is null;

    update public.memories
    set is_private = coalesce(is_private, true)
    where is_private is null;

    update public.memories
    set status = coalesce(status, 'published'::public.memory_status)
    where status is null;
  end if;
end $$;

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
