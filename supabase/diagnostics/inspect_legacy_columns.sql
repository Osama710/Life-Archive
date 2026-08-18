-- Inspect your LIVE Supabase columns before/after patching.
select table_name, column_name, data_type, udt_name, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name in (
    'profiles',
    'families',
    'family_members',
    'children',
    'memories',
    'memory_media',
    'collections'
  )
order by table_name, ordinal_position;
