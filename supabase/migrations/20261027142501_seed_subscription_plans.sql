
insert into public.subscription_plans (
  name,
  description,
  price,
  billing_interval,
  features,
  max_doctors,
  max_branches,
  is_active
)
values
(
  'Starter',
  'Perfect for solo doctors and small clinics.',
  999,
  'monthly',
  '[
    "1 doctor",
    "1 branch",
    "Unlimited appointments",
    "Online booking page",
    "Appointment management",
    "Ongoing Support"
  ]'::jsonb,
  1,
  1,
  true
),
(
  'Professional',
  'For clinics with growing teams.',
  1999,
  'monthly',
  '[
    "Up to 3 doctors",
    "1 branch",
    "Unlimited appointments",
    "Online booking page",
    "Centralized scheduling",
    "Doctor management",
    "Ongoing Support"
  ]'::jsonb,
  3,
  1,
  true
),
(
  'Clinic Plus',
  'For established clinics managing multiple locations.',
  2999,
  'monthly',
  '[
    "4–6 doctors",
    "Up to 3 branches",
    "Unlimited appointments",
    "Online booking page",
    "Centralized scheduling",
    "Multi-branch management",
    "Ongoing Support"
  ]'::jsonb,
  6,
  3,
  true
);
