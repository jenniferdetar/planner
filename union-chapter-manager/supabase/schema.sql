-- ============================================================================
-- Union Chapter Manager — multi-tenant database schema
-- ----------------------------------------------------------------------------
-- Run this whole file once in the Supabase SQL editor (SQL → New query → Run).
-- It is idempotent: re-running it is safe.
--
-- TENANCY MODEL
--   * An `organization` is a single union local/chapter (the tenant).
--   * A `membership` links an app user (an officer/steward who logs in) to an
--     organization, with a role (owner/admin/member).
--   * Every domain table carries an `org_id`. Row-Level Security (RLS) makes a
--     row visible ONLY to app users who belong to that org, so two chapters
--     using the same deployment can never see each other's data.
--   * Users create a chapter with the `create_organization()` RPC, or join an
--     existing one with `join_organization(join_code)`.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Core tenancy tables
-- ----------------------------------------------------------------------------

create table if not exists organizations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  -- Short human-shareable code officers use to invite co-admins.
  join_code  text not null unique default encode(gen_random_bytes(4), 'hex'),
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

create table if not exists memberships (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references organizations (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

create index if not exists memberships_user_idx on memberships (user_id);
create index if not exists memberships_org_idx on memberships (org_id);

-- ----------------------------------------------------------------------------
-- Domain tables (the reusable core extracted from the CSEA tracker)
-- ----------------------------------------------------------------------------

-- Worksites / buildings the local represents (schools, yards, offices, ...).
create table if not exists worksites (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references organizations (id) on delete cascade,
  name       text not null,
  created_at timestamptz not null default now()
);

-- The union members being represented/tracked.
create table if not exists members (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references organizations (id) on delete cascade,
  first_name      text not null,
  last_name       text not null,
  employee_number text,
  email           text,
  phone           text,
  worksite_id     uuid references worksites (id) on delete set null,
  -- Role within the local. Drives the roster filters in the UI.
  member_role     text not null default 'member'
                    check (member_role in ('member', 'steward', 'eboard', 'officer', 'labor_rep')),
  status          text not null default 'active' check (status in ('active', 'inactive')),
  notes           text,
  created_at      timestamptz not null default now()
);

-- Logged contacts/conversations with members.
create table if not exists interactions (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations (id) on delete cascade,
  member_id   uuid references members (id) on delete set null,
  member_name text not null,
  topic       text,
  notes       text,
  date_spoke  date not null default current_date,
  archived    boolean not null default false,
  created_by  uuid references auth.users (id),
  created_at  timestamptz not null default now()
);

-- Grievances / issues / cases tracked to resolution.
create table if not exists issues (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations (id) on delete cascade,
  title       text not null,
  member_name text,
  category    text,
  status      text not null default 'open'
                check (status in ('open', 'in_progress', 'resolved', 'closed')),
  priority    text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  created_by  uuid references auth.users (id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- A running timeline of notes attached to an issue.
create table if not exists issue_notes (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references organizations (id) on delete cascade,
  issue_id   uuid not null references issues (id) on delete cascade,
  note_text  text not null,
  note_date  date,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

-- Free-form chapter notes / topics (meeting takeaways, contract questions, ...).
create table if not exists notes (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references organizations (id) on delete cascade,
  topic      text,
  source     text,
  body       text not null,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

-- Quick links (contract PDF, benefits portal, state site, ...).
create table if not exists links (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references organizations (id) on delete cascade,
  title      text not null,
  url        text not null,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create index if not exists worksites_org_idx    on worksites (org_id);
create index if not exists members_org_idx      on members (org_id);
create index if not exists interactions_org_idx on interactions (org_id);
create index if not exists issues_org_idx       on issues (org_id);
create index if not exists issue_notes_org_idx  on issue_notes (org_id);
create index if not exists issue_notes_issue_idx on issue_notes (issue_id);
create index if not exists notes_org_idx        on notes (org_id);
create index if not exists links_org_idx        on links (org_id);

-- ----------------------------------------------------------------------------
-- keep issues.updated_at fresh
-- ----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists issues_touch_updated_at on issues;
create trigger issues_touch_updated_at
  before update on issues
  for each row execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- Membership helpers (SECURITY DEFINER so they bypass RLS and never recurse
-- when referenced inside the policies below).
-- ----------------------------------------------------------------------------
create or replace function public.is_org_member(target_org uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from memberships m
    where m.org_id = target_org and m.user_id = auth.uid()
  );
$$;

create or replace function public.is_org_admin(target_org uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from memberships m
    where m.org_id = target_org
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
  );
$$;

-- ----------------------------------------------------------------------------
-- Enable Row-Level Security everywhere
-- ----------------------------------------------------------------------------
alter table organizations enable row level security;
alter table memberships   enable row level security;
alter table worksites     enable row level security;
alter table members       enable row level security;
alter table interactions  enable row level security;
alter table issues        enable row level security;
alter table issue_notes   enable row level security;
alter table notes         enable row level security;
alter table links         enable row level security;

-- organizations: members can read their orgs; admins can rename/delete.
drop policy if exists org_select on organizations;
create policy org_select on organizations
  for select using (public.is_org_member(id));

drop policy if exists org_update on organizations;
create policy org_update on organizations
  for update using (public.is_org_admin(id));

drop policy if exists org_delete on organizations;
create policy org_delete on organizations
  for delete using (public.is_org_admin(id));

-- memberships: you can see the roster of app users in your own orgs, and you
-- can always see your own membership rows. Inserts go through the RPCs below.
drop policy if exists membership_select on memberships;
create policy membership_select on memberships
  for select using (user_id = auth.uid() or public.is_org_member(org_id));

drop policy if exists membership_admin_write on memberships;
create policy membership_admin_write on memberships
  for all using (public.is_org_admin(org_id)) with check (public.is_org_admin(org_id));

-- Domain tables: one policy each — full access iff you belong to the org.
do $$
declare t text;
begin
  foreach t in array array[
    'worksites', 'members', 'interactions', 'issues', 'issue_notes', 'notes', 'links'
  ]
  loop
    execute format('drop policy if exists %I_all on %I;', t, t);
    execute format(
      'create policy %I_all on %I for all using (public.is_org_member(org_id)) with check (public.is_org_member(org_id));',
      t, t
    );
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- Onboarding RPCs (SECURITY DEFINER: create the first membership atomically).
-- ----------------------------------------------------------------------------
create or replace function public.create_organization(org_name text)
returns organizations
language plpgsql
security definer
set search_path = public
as $$
declare new_org organizations;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if org_name is null or length(trim(org_name)) = 0 then
    raise exception 'Organization name is required';
  end if;

  insert into organizations (name, created_by)
    values (trim(org_name), auth.uid())
    returning * into new_org;

  insert into memberships (org_id, user_id, role)
    values (new_org.id, auth.uid(), 'owner');

  return new_org;
end;
$$;

create or replace function public.join_organization(code text)
returns organizations
language plpgsql
security definer
set search_path = public
as $$
declare target organizations;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into target from organizations
    where join_code = lower(trim(code));

  if target.id is null then
    raise exception 'Invalid join code';
  end if;

  insert into memberships (org_id, user_id, role)
    values (target.id, auth.uid(), 'member')
    on conflict (org_id, user_id) do nothing;

  return target;
end;
$$;

grant execute on function public.create_organization(text) to authenticated;
grant execute on function public.join_organization(text) to authenticated;

-- ----------------------------------------------------------------------------
-- OPTIONAL: enable Supabase Realtime for live-updating interaction/issue feeds.
-- Uncomment if you want multiple officers to see each other's edits instantly.
-- ----------------------------------------------------------------------------
-- alter publication supabase_realtime add table interactions;
-- alter publication supabase_realtime add table issues;
