-- Run in Supabase SQL Editor to see what already exists.
-- Expected app tables from Life Archive rebuild:

-- Summary: you need 24 present. If any say "missing", run remaining_tables patch.
select
  expected.table_name,
  case when t.table_name is not null then 'present' else 'MISSING' end as status
from (
  values
    ('profiles'),
    ('families'),
    ('family_members'),
    ('family_invitations'),
    ('children'),
    ('templates'),
    ('child_templates'),
    ('milestones'),
    ('memories'),
    ('memory_prompt_answers'),
    ('memory_media'),
    ('tags'),
    ('memory_tags'),
    ('memory_people'),
    ('collections'),
    ('memory_collections'),
    ('growth_records'),
    ('health_records'),
    ('time_capsules'),
    ('user_preferences'),
    ('notifications'),
    ('export_jobs'),
    ('sync_operations'),
    ('audit_events')
) as expected(table_name)
left join information_schema.tables t
  on t.table_schema = 'public'
 and t.table_name = expected.table_name
order by status desc, expected.table_name;

-- Summary counts (target: present_count = 24, missing_count = 0)
select
  count(*) filter (where t.table_name is not null) as present_count,
  count(*) filter (where t.table_name is null) as missing_count,
  24 as expected_count
from (
  values
    ('profiles'),
    ('families'),
    ('family_members'),
    ('family_invitations'),
    ('children'),
    ('templates'),
    ('child_templates'),
    ('milestones'),
    ('memories'),
    ('memory_prompt_answers'),
    ('memory_media'),
    ('tags'),
    ('memory_tags'),
    ('memory_people'),
    ('collections'),
    ('memory_collections'),
    ('growth_records'),
    ('health_records'),
    ('time_capsules'),
    ('user_preferences'),
    ('notifications'),
    ('export_jobs'),
    ('sync_operations'),
    ('audit_events')
) as expected(table_name)
left join information_schema.tables t
  on t.table_schema = 'public'
 and t.table_name = expected.table_name;

-- Quick 5-table check (should be present_count = 5)
select
  expected.table_name,
  case when t.table_name is not null then 'ok' else 'MISSING' end as status
from (
  values
    ('profiles'),
    ('families'),
    ('memories'),
    ('memory_media'),
    ('time_capsules')
) as expected(table_name)
left join information_schema.tables t
  on t.table_schema = 'public'
 and t.table_name = expected.table_name
order by expected.table_name;

select count(*) filter (where t.table_name is not null) as present_count
from (
  values ('profiles'),('families'),('memories'),('memory_media'),('time_capsules')
) as expected(table_name)
left join information_schema.tables t
  on t.table_schema = 'public' and t.table_name = expected.table_name;