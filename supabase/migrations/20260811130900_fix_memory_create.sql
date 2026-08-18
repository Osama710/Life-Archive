-- Fix memory creation failing from client (RLS / select embed issues).

do $$ begin
  create type public.media_type as enum ('photo', 'video', 'audio', 'document');
exception when duplicate_object then null;
end $$;

create table if not exists public.memory_media (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories(id) on delete cascade,
  media_type public.media_type not null default 'photo',
  provider text not null default 'cloudinary',
  provider_asset_id text not null,
  url text not null,
  secure_url text not null,
  created_at timestamptz not null default now()
);

do $$ begin
  if to_regclass('public.memory_media') is not null then
    alter table public.memory_media add column if not exists thumbnail_url text;
    alter table public.memory_media add column if not exists file_name text;
    alter table public.memory_media add column if not exists mime_type text;
    alter table public.memory_media add column if not exists bytes bigint;
    alter table public.memory_media add column if not exists width integer;
    alter table public.memory_media add column if not exists height integer;
    alter table public.memory_media add column if not exists sort_order integer default 0;
    alter table public.memory_media add column if not exists deleted_at timestamptz;
  end if;
end $$;

alter table public.memory_media enable row level security;

drop policy if exists "media family read" on public.memory_media;
create policy "media family read" on public.memory_media
  for select
  using (
    exists (
      select 1
      from public.memories m
      where m.id = memory_id
        and public.is_family_member(m.family_id)
    )
  );

drop policy if exists "media editors manage" on public.memory_media;
create policy "media editors manage" on public.memory_media
  for all
  using (
    exists (
      select 1
      from public.memories m
      where m.id = memory_id
        and public.has_family_role(m.family_id, array['owner', 'editor']::public.family_role[])
    )
  )
  with check (
    exists (
      select 1
      from public.memories m
      where m.id = memory_id
        and public.has_family_role(m.family_id, array['owner', 'editor']::public.family_role[])
    )
  );

create or replace function public.create_memory(
  p_family_id uuid,
  p_title text,
  p_description text default null,
  p_memory_date date default current_date,
  p_memory_time time default null,
  p_location text default null,
  p_mood text default null,
  p_child_id uuid default null,
  p_milestone_id uuid default null,
  p_status public.memory_status default 'published',
  p_is_favorite boolean default false,
  p_is_private boolean default true
)
returns public.memories
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  v_user_id uuid := auth.uid();
  v_title text := trim(p_title);
  v_memory public.memories%rowtype;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if char_length(v_title) < 1 or char_length(v_title) > 200 then
    raise exception 'Memory title must be between 1 and 200 characters';
  end if;

  if not public.has_family_role(
    p_family_id,
    array['owner', 'editor']::public.family_role[]
  ) then
    raise exception 'Not allowed to add memories to this family';
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

  insert into public.memories (
    family_id,
    child_id,
    milestone_id,
    title,
    description,
    memory_date,
    memory_time,
    location,
    mood,
    status,
    is_favorite,
    is_private,
    created_by
  )
  values (
    p_family_id,
    p_child_id,
    p_milestone_id,
    v_title,
    nullif(trim(p_description), ''),
    coalesce(p_memory_date, current_date),
    p_memory_time,
    nullif(trim(p_location), ''),
    nullif(trim(p_mood), ''),
    coalesce(p_status, 'published'::public.memory_status),
    coalesce(p_is_favorite, false),
    coalesce(p_is_private, true),
    v_user_id
  )
  returning * into v_memory;

  return v_memory;
end;
$$;

grant execute on function public.create_memory(
  uuid,
  text,
  text,
  date,
  time,
  text,
  text,
  uuid,
  uuid,
  public.memory_status,
  boolean,
  boolean
) to authenticated;

create or replace function public.attach_memory_media(
  p_memory_id uuid,
  p_media_type public.media_type default 'photo',
  p_provider text default 'cloudinary',
  p_provider_asset_id text default null,
  p_url text default null,
  p_secure_url text default null,
  p_thumbnail_url text default null,
  p_file_name text default null,
  p_mime_type text default null,
  p_bytes bigint default null,
  p_width integer default null,
  p_height integer default null
)
returns public.memory_media
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  v_user_id uuid := auth.uid();
  v_memory public.memories%rowtype;
  v_media public.memory_media%rowtype;
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

  if not public.has_family_role(
    v_memory.family_id,
    array['owner', 'editor']::public.family_role[]
  ) then
    raise exception 'Not allowed to attach media to this memory';
  end if;

  if p_provider_asset_id is null or p_url is null or p_secure_url is null then
    raise exception 'Missing required media fields';
  end if;

  insert into public.memory_media (
    memory_id,
    media_type,
    provider,
    provider_asset_id,
    url,
    secure_url,
    thumbnail_url,
    file_name,
    mime_type,
    bytes,
    width,
    height
  )
  values (
    p_memory_id,
    coalesce(p_media_type, 'photo'::public.media_type),
    coalesce(nullif(trim(p_provider), ''), 'cloudinary'),
    p_provider_asset_id,
    p_url,
    p_secure_url,
    coalesce(p_thumbnail_url, p_secure_url),
    p_file_name,
    p_mime_type,
    p_bytes,
    p_width,
    p_height
  )
  returning * into v_media;

  return v_media;
end;
$$;

grant execute on function public.attach_memory_media(
  uuid,
  public.media_type,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  bigint,
  integer,
  integer
) to authenticated;
