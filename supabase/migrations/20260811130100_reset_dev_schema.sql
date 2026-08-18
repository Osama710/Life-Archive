-- DEV ONLY: wipes Life Archive public schema objects and re-applies the full migration.
-- Do NOT run if you have real family data you want to keep.
--
-- Steps:
-- 1) Run this file in Supabase SQL Editor
-- 2) Then run: supabase/migrations/20260811130000_initial_schema.sql

begin;

-- Drop triggers on auth.users if they exist (from prior partial runs)
drop trigger if exists auth_user_created on auth.users;

-- Drop app triggers/functions/policies/tables in dependency-safe order
drop policy if exists "audit owners read" on public.audit_events;
drop policy if exists "sync own" on public.sync_operations;
drop policy if exists "exports member create" on public.export_jobs;
drop policy if exists "exports family read" on public.export_jobs;
drop policy if exists "notifications own" on public.notifications;
drop policy if exists "capsules creator update" on public.time_capsules;
drop policy if exists "capsules editors insert" on public.time_capsules;
drop policy if exists "capsules creator or unlocked recipient read" on public.time_capsules;
drop policy if exists "health editors manage" on public.health_records;
drop policy if exists "health family read" on public.health_records;
drop policy if exists "growth editors manage" on public.growth_records;
drop policy if exists "growth family read" on public.growth_records;
drop policy if exists "memory collections editors manage" on public.memory_collections;
drop policy if exists "memory collections family read" on public.memory_collections;
drop policy if exists "collections editors update" on public.collections;
drop policy if exists "collections editors insert" on public.collections;
drop policy if exists "collections family read" on public.collections;
drop policy if exists "memory people editors manage" on public.memory_people;
drop policy if exists "memory people family read" on public.memory_people;
drop policy if exists "memory tags editors manage" on public.memory_tags;
drop policy if exists "memory tags family read" on public.memory_tags;
drop policy if exists "tags editors manage" on public.tags;
drop policy if exists "tags family read" on public.tags;
drop policy if exists "media editors manage" on public.memory_media;
drop policy if exists "media family read" on public.memory_media;
drop policy if exists "prompt answers editors manage" on public.memory_prompt_answers;
drop policy if exists "prompt answers family read" on public.memory_prompt_answers;
drop policy if exists "memories editors update" on public.memories;
drop policy if exists "memories editors insert" on public.memories;
drop policy if exists "memories family read" on public.memories;
drop policy if exists "milestones editors manage" on public.milestones;
drop policy if exists "milestones family read" on public.milestones;
drop policy if exists "child templates editors manage" on public.child_templates;
drop policy if exists "child templates family read" on public.child_templates;
drop policy if exists "children editors update" on public.children;
drop policy if exists "children editors insert" on public.children;
drop policy if exists "children family read" on public.children;
drop policy if exists "templates authenticated read" on public.templates;
drop policy if exists "invitations owner manage" on public.family_invitations;
drop policy if exists "members owner delete" on public.family_members;
drop policy if exists "members owner update" on public.family_members;
drop policy if exists "members owner insert" on public.family_members;
drop policy if exists "members family read" on public.family_members;
drop policy if exists "families owner update" on public.families;
drop policy if exists "families authenticated create" on public.families;
drop policy if exists "families member read" on public.families;
drop policy if exists "preferences own" on public.user_preferences;
drop policy if exists "profiles update self" on public.profiles;
drop policy if exists "profiles read self" on public.profiles;

drop table if exists public.audit_events cascade;
drop table if exists public.sync_operations cascade;
drop table if exists public.export_jobs cascade;
drop table if exists public.notifications cascade;
drop table if exists public.user_preferences cascade;
drop table if exists public.time_capsules cascade;
drop table if exists public.health_records cascade;
drop table if exists public.growth_records cascade;
drop table if exists public.memory_collections cascade;
drop table if exists public.collections cascade;
drop table if exists public.memory_people cascade;
drop table if exists public.memory_tags cascade;
drop table if exists public.tags cascade;
drop table if exists public.memory_media cascade;
drop table if exists public.memory_prompt_answers cascade;
drop table if exists public.memories cascade;
drop table if exists public.milestones cascade;
drop table if exists public.child_templates cascade;
drop table if exists public.templates cascade;
drop table if exists public.children cascade;
drop table if exists public.family_invitations cascade;
drop table if exists public.family_members cascade;
drop table if exists public.families cascade;
drop table if exists public.profiles cascade;

drop function if exists public.has_family_role(uuid, public.family_role[]) cascade;
drop function if exists public.is_family_member(uuid) cascade;
drop function if exists public.add_family_owner() cascade;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.set_updated_at() cascade;

drop type if exists public.job_status cascade;
drop type if exists public.sync_status cascade;
drop type if exists public.media_type cascade;
drop type if exists public.memory_status cascade;
drop type if exists public.member_status cascade;
drop type if exists public.family_role cascade;

commit;

-- After this succeeds, paste and run:
-- supabase/migrations/20260811130000_initial_schema.sql
