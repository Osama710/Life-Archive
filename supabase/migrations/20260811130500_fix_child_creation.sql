-- Fix onboarding child step: RLS on public.children blocks insert on legacy schemas.

alter table public.children enable row level security;

do $$ begin
  if to_regclass('public.children') is not null then
    alter table public.children add column if not exists conception_date date;
    alter table public.children add column if not exists journey_type text default 'childhood';
    alter table public.children add column if not exists photo_url text;
    alter table public.children add column if not exists gender text;
    alter table public.children add column if not exists created_by uuid;
    alter table public.children add column if not exists created_at timestamptz default now();
    alter table public.children add column if not exists updated_at timestamptz default now();
    alter table public.children add column if not exists deleted_at timestamptz;

    update public.children
    set journey_type = coalesce(journey_type, 'childhood')
    where journey_type is null;
  end if;
end $$;

drop policy if exists "children family read" on public.children;
create policy "children family read" on public.children
  for select
  using (public.is_family_member(family_id));

drop policy if exists "children editors insert" on public.children;
create policy "children editors insert" on public.children
  for insert
  to authenticated
  with check (
    public.has_family_role(family_id, array['owner', 'editor']::public.family_role[])
    and created_by = auth.uid()
  );

drop policy if exists "children editors update" on public.children;
create policy "children editors update" on public.children
  for update
  using (public.has_family_role(family_id, array['owner', 'editor']::public.family_role[]));

create or replace function public.create_child(
  p_family_id uuid,
  p_name text,
  p_birth_date date default null,
  p_conception_date date default null,
  p_gender text default null,
  p_photo_url text default null,
  p_journey_type text default 'childhood'
)
returns public.children
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_name text := trim(p_name);
  v_journey text := coalesce(nullif(trim(p_journey_type), ''), 'childhood');
  v_child public.children%rowtype;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if char_length(v_name) < 1 or char_length(v_name) > 120 then
    raise exception 'Child name must be between 1 and 120 characters';
  end if;

  if not public.has_family_role(
    p_family_id,
    array['owner', 'editor']::public.family_role[]
  ) and not exists (
    select 1
    from public.families f
    where f.id = p_family_id
      and f.created_by = v_user_id
      and f.deleted_at is null
  ) then
    raise exception 'Not allowed to add children to this family';
  end if;

  -- Ensure owner membership exists for family creators on legacy rows
  insert into public.family_members (family_id, user_id, role, status, joined_at)
  select p_family_id, v_user_id, 'owner'::public.family_role, 'active'::public.member_status, now()
  from public.families f
  where f.id = p_family_id
    and f.created_by = v_user_id
  on conflict (family_id, user_id) do update
    set role = 'owner'::public.family_role,
        status = 'active'::public.member_status,
        removed_at = null;

  if p_birth_date is null and p_conception_date is null then
    raise exception 'Birth date or conception date is required';
  end if;

  insert into public.profiles (id, display_name)
  select
    u.id,
    coalesce(
      nullif(trim(u.raw_user_meta_data ->> 'display_name'), ''),
      split_part(u.email, '@', 1)
    )
  from auth.users u
  where u.id = v_user_id
  on conflict (id) do nothing;

  insert into public.children (
    family_id,
    name,
    birth_date,
    conception_date,
    gender,
    photo_url,
    journey_type,
    created_by
  )
  values (
    p_family_id,
    v_name,
    p_birth_date,
    p_conception_date,
    p_gender,
    p_photo_url,
    v_journey,
    v_user_id
  )
  returning * into v_child;

  return v_child;
end;
$$;

grant execute on function public.create_child(
  uuid,
  text,
  date,
  date,
  text,
  text,
  text
) to authenticated;
