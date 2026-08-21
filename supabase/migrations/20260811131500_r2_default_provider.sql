-- Default new media uploads to Cloudflare R2 (replaces Cloudinary)
create or replace function public.attach_memory_media(
  p_memory_id uuid,
  p_media_type public.media_type default 'photo',
  p_provider text default 'r2',
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
    coalesce(nullif(trim(p_provider), ''), 'r2'),
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
