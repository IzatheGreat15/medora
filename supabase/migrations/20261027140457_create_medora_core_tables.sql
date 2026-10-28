
-- Medora core database schema
-- Tables: subscription_plans, clinics, staff

create extension if not exists pgcrypto;

-- 1. Subscription plans

create table public.subscription_plans (
  id uuid primary key default gen_random_uuid(),

  name text not null unique,
  description text,

  price numeric(12, 2) not null default 0
    check (price >= 0),

  billing_interval text not null default 'monthly'
    check (billing_interval in ('monthly', 'yearly')),

  features jsonb not null default '[]'::jsonb
    check (jsonb_typeof(features) = 'array'),

  max_doctors integer,
  max_branches integer,

  is_active boolean not null default true,

  id_user_created uuid,
  id_user_last_modified uuid,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Clinics

create table public.clinics (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  contact_email text not null,
  phone text,

  subscription_plan_id uuid
    references public.subscription_plans(id)
    on delete restrict,

  status text not null default 'trial'
    check (status in ('trial', 'active', 'inactive', 'past_due')),

  trial_ends_at timestamptz,

  id_user_created uuid,
  id_user_last_modified uuid,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Staff
-- Platform admins have no clinic.
-- Clinic users belong to exactly one clinic.

create table public.staff (
  id uuid primary key
    references auth.users(id) on delete cascade,

  clinic_id uuid
    references public.clinics(id) on delete restrict,

  first_name text,
  last_name text,

  role text not null default 'clinic_user'
    check (role in ('platform_admin', 'clinic_user')),

  clinic_role text
    check (clinic_role in ('owner', 'manager', 'staff')),

  id_user_created uuid,
  id_user_last_modified uuid,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint staff_clinic_role_consistency check (
    (
      role = 'platform_admin'
      and clinic_id is null
      and clinic_role is null
    )
    or
    (
      role = 'clinic_user'
      and clinic_id is not null
      and clinic_role is not null
    )
  )
);

-- 4. Audit user references
-- These reference staff.id, which itself references auth.users.id.
-- SET NULL preserves the business record if the actor's staff row is removed.

alter table public.staff
  add constraint staff_created_by_fk
  foreign key (id_user_created)
  references public.staff(id)
  on delete set null;

alter table public.staff
  add constraint staff_modified_by_fk
  foreign key (id_user_last_modified)
  references public.staff(id)
  on delete set null;

alter table public.subscription_plans
  add constraint subscription_plans_created_by_fk
  foreign key (id_user_created)
  references public.staff(id)
  on delete set null;

alter table public.subscription_plans
  add constraint subscription_plans_modified_by_fk
  foreign key (id_user_last_modified)
  references public.staff(id)
  on delete set null;

alter table public.clinics
  add constraint clinics_created_by_fk
  foreign key (id_user_created)
  references public.staff(id)
  on delete set null;

alter table public.clinics
  add constraint clinics_modified_by_fk
  foreign key (id_user_last_modified)
  references public.staff(id)
  on delete set null;

-- 5. Indexes

create index clinics_status_idx
  on public.clinics(status);

create index clinics_subscription_plan_idx
  on public.clinics(subscription_plan_id);

create index staff_clinic_idx
  on public.staff(clinic_id);

create index staff_role_idx
  on public.staff(role);

create index clinics_created_by_idx
  on public.clinics(id_user_created);

create index clinics_modified_by_idx
  on public.clinics(id_user_last_modified);

create index plans_created_by_idx
  on public.subscription_plans(id_user_created);

create index plans_modified_by_idx
  on public.subscription_plans(id_user_last_modified);

-- 6. Row Level Security

alter table public.staff enable row level security;
alter table public.clinics enable row level security;
alter table public.subscription_plans enable row level security;

-- Restrict direct client access for initial development.

revoke all on public.staff from anon, authenticated;
revoke all on public.clinics from anon, authenticated;
revoke all on public.subscription_plans from anon, authenticated;

grant all on public.staff to service_role;
grant all on public.clinics to service_role;
grant all on public.subscription_plans to service_role;
