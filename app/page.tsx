"use client"

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  HeartPulse,
  MapPin,
  Menu,
  ShieldCheck,
  Stethoscope,
  Users,
  CalendarCheck,
  ClipboardList,
  Building2,
  ChartNoAxesCombined,
  Headset,
  Infinity,
  Ban,
  CreditCard,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";

const features = [
  {
    icon: CalendarCheck,
    title: "Appointment management",
    description:
      "Confirm, reschedule, and cancel appointments from one organized dashboard.",
  },
  {
    icon: Stethoscope,
    title: "Doctor scheduling",
    description:
      "Manage doctor availability across branches without overlapping schedules.",
  },
  {
    icon: Building2,
    title: "Multiple branches",
    description:
      "Keep every location organized while managing your clinic in one place.",
  },
  {
    icon: Clock3,
    title: "Flexible scheduling",
    description:
      "Configure service durations, clinic hours, and provider availability.",
  },
];

const steps = [
  {
    number: "01",
    title: "Set up your clinic",
    description:
      "Add your branches, practitioners, services, and opening hours.",
  },
  {
    number: "02",
    title: "Share your booking page",
    description:
      "Give patients an easy way to request appointments online.",
  },
  {
    number: "03",
    title: "Manage everything",
    description:
      "Review requests and keep your team and schedules organized.",
  },
];

const plans = [
  {
    name: "Starter",
    description: "Perfect for small clinics getting started.",
    price: "₱999",
    period: "/ month",
    highlighted: true,
    features: [
      "0–3 practitioners",
      "1 branch",
      "Unlimited appointments",
      "Online booking page",
      "Appointment management",
    ],
    cta: "Get started",
    href: "/signup",
  },
  {
    name: "Professional",
    description: "For growing clinics with bigger teams.",
    price: "₱1,999",
    period: "/ month",
    highlighted: false,
    features: [
      "4–6 practitioners",
      "Up to 3 branches",
      "Unlimited appointments",
      "Online booking page",
      "Centralized scheduling",
      "Multi-branch management",
    ],
    cta: "Get started",
    href: "/signup",
  },
  {
    name: "Enterprise",
    description: "For larger clinics and clinic networks.",
    price: "Custom pricing",
    period: "",
    highlighted: false,
    features: [
      "7+ practitioners",
      "More than 3 branches",
      "Unlimited appointments",
      "Custom requirements",
      "Tailored onboarding",
      "Priority support",
    ],
    cta: "Contact us",
    href: "mailto:hello@medora.ph",
  },
];

const benefits = [
  { icon: Infinity, text: "Unlimited appointments" },
  { icon: Ban, text: "No per-booking fees" },
  { icon: ShieldCheck, text: "Secure access" },
  { icon: Headset, text: "Friendly support" },
];

function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-brand-dark"
      aria-label="Medora home"
    >
      <img src="/full-logo.png" className="w-36" />
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-brand-light px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-dark">
      <span className="h-1.5 w-1.5 rounded-full bg-brand" />
      {children}
    </span>
  );
}

function SectionHeading({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <SectionLabel>{label}</SectionLabel>
      <h2 className="mt-5 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 leading-7 text-slate-600">{description}</p>
      )}
    </div>
  );
}

function DashboardPreview() {
  const appointments = [
    ["09:00 AM", "Maria Santos", "Consultation", "Confirmed"],
    ["10:30 AM", "Juan Dela Cruz", "Dental cleaning", "Pending"],
    ["11:00 AM", "Ana Reyes", "Follow-up visit", "Confirmed"],
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-brand-dark/10">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <Logo />
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-light text-sm font-bold text-brand-dark">
          A
        </div>
      </div>

      <div className="grid grid-cols-[92px_1fr] sm:grid-cols-[120px_1fr]">
        <aside className="space-y-4 border-r border-slate-100 bg-slate-50/80 p-3 sm:p-4">
          {[
            "Dashboard",
            "Bookings",
            "Branches",
            "Doctors",
            "Services",
            "Settings",
          ].map((item, index) => (
            <div
              key={item}
              className={`flex items-center gap-2 rounded-lg px-2 py-2 text-[10px] font-medium sm:text-xs ${index === 0
                ? "bg-brand-light text-brand-dark"
                : "text-slate-500"
                }`}
            >
              {index === 0 ? (
                <ChartNoAxesCombined size={14} />
              ) : index === 1 ? (
                <CalendarDays size={14} />
              ) : index === 2 ? (
                <Building2 size={14} />
              ) : index === 3 ? (
                <Users size={14} />
              ) : index === 4 ? (
                <ClipboardList size={14} />
              ) : (
                <ShieldCheck size={14} />
              )}
              <span className="hidden sm:inline">{item}</span>
            </div>
          ))}
        </aside>

        <div className="min-w-0 p-4 sm:p-6">
          <p className="text-xs text-slate-500">Your clinic at a glance</p>
          <h3 className="mt-1 text-lg font-bold text-brand-dark sm:text-xl">
            Good morning!
          </h3>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              ["24", "Appointments"],
              ["6", "Pending"],
              ["12", "Completed"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-xl border border-slate-100 p-2.5 sm:p-3"
              >
                <p className="text-xl font-bold text-brand">{value}</p>
                <p className="mt-1 text-[9px] text-slate-500 sm:text-xs">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-brand-dark">
                Today&apos;s appointments
              </h4>
              <span className="text-xs font-semibold text-brand">View all</span>
            </div>

            <div className="space-y-1">
              {appointments.map((appointment) => (
                <div
                  key={appointment[0]}
                  className="grid grid-cols-[55px_1fr_auto] items-center gap-2 rounded-lg px-2 py-3 odd:bg-slate-50 sm:grid-cols-[70px_1fr_1fr_auto]"
                >
                  <span className="text-[10px] text-slate-500">
                    {appointment[0]}
                  </span>
                  <span className="truncate text-[10px] font-semibold text-slate-700 sm:text-xs">
                    {appointment[1]}
                  </span>
                  <span className="hidden truncate text-xs text-slate-500 sm:block">
                    {appointment[2]}
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 text-[9px] font-semibold ${appointment[3] === "Confirmed"
                      ? "bg-brand-light text-brand-dark"
                      : "bg-amber-50 text-amber-700"
                      }`}
                  >
                    {appointment[3]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [year, setYear] = useState(0);
  useEffect(() => {
    setYear(new Date().getFullYear());
  });

  return (
    <main className="overflow-hidden bg-[#F7F9F6] text-slate-700">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <Logo />

          <div className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm hover:text-brand">
              Features
            </Link>
            <Link href="#pricing" className="text-sm hover:text-brand">
              Pricing
            </Link>
            <Link href="#how-it-works" className="text-sm hover:text-brand">
              How it works
            </Link>
            <Link href="#clinics" className="text-sm hover:text-brand">
              For clinics
            </Link>
          </div>

          <div className="hidden items-center gap-4 sm:flex">
            <Link
              href="/login"
              className="px-3 py-2 text-sm font-semibold text-brand-dark"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              Get started <ArrowRight size={16} />
            </Link>
          </div>

          <Link
            href="/signup"
            aria-label="Get started"
            className="rounded-xl bg-brand p-2.5 text-white sm:hidden"
          >
            <Menu size={21} />
          </Link>
        </nav>
      </header>


      {/* Hero */}
      <section className="relative isolate min-h-[680px] overflow-hidden bg-[#F7F9F6] lg:min-h-[760px]">
        {/* Background image */}
        <img
          src="https://pidswebs.pids.gov.ph/CDN/featured-image/Thumbnail_PR30-24.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />

        {/* Fade the image to white on the left for readable text */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#F7F9F6] via-[#F7F9F6]/95 to-[#F7F9F6]/10" />

        {/* Additional soft overlay on smaller screens */}
        <div className="absolute inset-0 -z-10 bg-white/10 lg:bg-transparent" />

        <div className="mx-auto grid min-h-[680px] max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:min-h-[760px] lg:grid-cols-2 lg:px-10 lg:py-20">
          {/* Left: Hero copy */}
          <div className="relative z-10 max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#DDF3E7]/95 px-4 py-2 text-xs font-semibold text-[#173F35] sm:text-sm">
              <span className="h-2 w-2 rounded-full bg-[#176B55]" />
              Clinic management, made simpler
            </span>

            <h1 className="mt-6 text-5xl font-extrabold leading-[1.08] tracking-tight text-[#173F35] sm:text-6xl lg:text-7xl">
              More time for{" "}
              <span className="text-[#4D9F82]">better care.</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Manage appointments, doctors, and clinic schedules in one simple
              workspace. Let patients book online while your team focuses on
              what matters.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-[#176B55] px-6 py-4 font-semibold text-white shadow-lg shadow-[#176B55]/20 transition hover:bg-[#173F35]"
              >
                Get started <ArrowRight size={18} />
              </Link>

              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white/90 px-6 py-4 font-semibold text-[#173F35] transition hover:bg-white"
              >
                See how it works
              </Link>
            </div>

            <div className="mt-8 space-y-3">
              {[
                "Online appointment requests",
                "Multi-branch support",
                "Flexible scheduling",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4D9F82] text-white">
                    <Check size={15} strokeWidth={3} />
                  </span>
                  <span className="text-sm font-medium text-slate-700 sm:text-base">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Floating appointment cards */}
          <div className="relative hidden min-h-[500px] lg:block">
            {/* Upcoming appointments */}
            <div className="absolute left-0 top-[8%] z-20 w-[310px] rounded-2xl border border-white/80 bg-white/95 p-5 shadow-xl shadow-slate-900/10 backdrop-blur-md">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-bold text-[#173F35]">
                  Upcoming appointments
                </h3>
                <CalendarDays size={19} className="text-[#176B55]" />
              </div>

              <div className="mt-2 flex justify-between text-xs text-slate-500">
                <span>Today&apos;s schedule</span>
                <span className="font-semibold text-[#176B55]">View all</span>
              </div>

              {[
                ["09:00", "Maria Santos", "General consultation"],
                ["10:30", "Juan Dela Cruz", "Dental cleaning"],
                ["11:00", "Ana Reyes", "Follow-up visit"],
              ].map(([time, name, service]) => (
                <div
                  key={time}
                  className="mt-4 flex gap-3 border-t border-slate-100 pt-3"
                >
                  <span className="text-xs font-bold text-[#176B55]">{time}</span>
                  <div>
                    <p className="text-sm font-semibold text-[#173F35]">{name}</p>
                    <p className="mt-1 text-xs text-slate-500">{service}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Appointment request */}
            <div className="absolute bottom-[4%] left-[18%] z-30 w-[300px] rounded-2xl border border-white/80 bg-white/95 p-5 shadow-xl shadow-slate-900/10 backdrop-blur-md">
              <h3 className="font-bold text-[#173F35]">
                New appointment request
              </h3>

              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#DDF3E7] text-[#176B55]">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#173F35]">
                    New patient
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Consultation request
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                <CalendarDays size={16} className="text-[#176B55]" />
                Appointment details
              </div>

              <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <Clock3 size={16} className="text-[#176B55]" />
                Requested time
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600"
                >
                  Decline
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-lg bg-[#176B55] px-3 py-2.5 text-sm font-semibold text-white"
                >
                  Approve
                </button>
              </div>
            </div>

            {/* Floating calendar icon */}
            <div className="absolute right-0 top-[35%] z-20 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/80 bg-white/95 text-[#176B55] shadow-xl">
              <CalendarCheck size={30} />
            </div>
          </div>
        </div>
      </section>


      {/* Quick benefits */}
      <section className="border-y border-slate-200/70 bg-[#173F35] text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 px-5 py-8 sm:px-8 md:grid-cols-4 lg:px-10">
          {[
            { icon: Building2, text: "Organize your clinic" },
            { icon: Stethoscope, text: "Manage your doctors" },
            { icon: CalendarDays, text: "Simplify scheduling" },
            { icon: Users, text: "Help patients book" },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center justify-center gap-3 py-2"
            >
              <Icon size={27} className="shrink-0 text-white" />
              <span className="text-sm font-semibold text-white">
                {text}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Patient booking */}
      <section id="features" className="scroll-mt-24 py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:px-10">
          <div className="relative min-h-[320px] overflow-hidden rounded-3xl sm:min-h-[440px]">
            <img
              src="https://myoona.ph/content/dam/oona/aem-images/blog-ph/health-insurance-philippines-guide.webp"
              alt="Patient having a consultation with a healthcare professional"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/30 to-transparent" />

            <div className="absolute bottom-4 left-4 right-4 max-w-xs rounded-2xl border border-white/70 bg-white/95 p-4 shadow-xl backdrop-blur">
              <div className="flex items-center gap-2">
                <CalendarCheck size={19} className="text-brand" />
                <p className="font-bold text-brand-dark">
                  Book an appointment
                </p>
              </div>
              <div className="mt-4 space-y-2">
                {["Choose a service", "Select a date", "Pick a time"].map(
                  (item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-500"
                    >
                      {item}
                      <ChevronRight size={14} />
                    </div>
                  ),
                )}
                <div className="rounded-lg bg-brand px-3 py-2.5 text-center text-xs font-semibold text-white">
                  Request appointment
                </div>
              </div>
            </div>
          </div>

          <div>
            <SectionLabel>For your patients</SectionLabel>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
              An easier way to book appointments.
            </h2>
            <p className="mt-5 leading-7 text-slate-600">
              Give patients a convenient way to find your services, choose a
              suitable time, and send an appointment request without the
              back-and-forth.
            </p>

            <div className="mt-8 space-y-6">
              {[
                {
                  icon: CalendarDays,
                  title: "Your own booking page",
                  description:
                    "Share a simple, professional page for your clinic.",
                },
                {
                  icon: ClipboardList,
                  title: "Easy service selection",
                  description:
                    "Let patients choose the service they need.",
                },
                {
                  icon: Clock3,
                  title: "Availability-based booking",
                  description:
                    "Show available slots based on clinic and doctor schedules.",
                },
              ].map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-brand">
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-dark">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Clinic team and dashboard */}
      <section id="clinics" className="scroll-mt-24 bg-white py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-10">
          <div>
            <SectionLabel>For your team</SectionLabel>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
              Everything you need in one place.
            </h2>
            <p className="mt-5 leading-7 text-slate-600">
              Give your staff a clear overview of appointments, practitioners,
              branches, and schedules with one easy-to-use workspace.
            </p>

            <div className="mt-8 space-y-5">
              {features.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
                    <Icon size={21} />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-dark">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DashboardPreview />
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="scroll-mt-24 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <SectionHeading
            label="Simple setup"
            title="Get your clinic ready in three steps."
            description="Spend less time organizing appointments and more time looking after patients."
          />

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-dark/5"
              >
                <span className="text-sm font-extrabold tracking-widest text-brand">
                  {step.number}
                </span>
                <h3 className="mt-5 text-xl font-bold text-brand-dark">
                  {step.title}
                </h3>
                <p className="mt-3 leading-7 text-slate-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="scroll-mt-24 border-y border-slate-200/70 bg-white py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <SectionHeading
            label="Simple, transparent pricing"
            title="Plans for clinics of every size."
            description="Unlimited appointments on every plan. Choose the plan that fits your clinic today and upgrade as you grow."
          />

          <div className="mx-auto mt-14 grid max-w-6xl gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`relative flex flex-col rounded-3xl border p-7 ${plan.highlighted
                  ? "border-brand/30 bg-brand-light/40 shadow-xl shadow-brand/5"
                  : "border-slate-200 bg-white"
                  }`}
              >
                {plan.highlighted && (
                  <span className="absolute right-5 top-5 rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    Great for small clinics
                  </span>
                )}

                <h3 className="text-lg font-bold text-brand-dark">
                  {plan.name}
                </h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">
                  {plan.description}
                </p>

                <div className="mt-5 flex flex-wrap items-baseline gap-2">
                  <span
                    className={`font-extrabold tracking-tight text-brand-dark ${plan.name === "Enterprise"
                      ? "text-2xl"
                      : "text-4xl"
                      }`}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm text-slate-500">
                      {plan.period}
                    </span>
                  )}
                </div>

                <div className="my-6 border-t border-slate-200" />

                <ul className="flex-1 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check
                        size={18}
                        className="mt-0.5 shrink-0 text-brand"
                      />
                      <span className="text-sm text-slate-700">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`mt-8 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold transition ${plan.highlighted
                    ? "bg-brand text-white hover:bg-brand-dark"
                    : "border border-slate-300 bg-white text-brand-dark hover:border-brand hover:bg-brand-light/40"
                    }`}
                >
                  {plan.cta}
                  <ArrowRight size={16} />
                </Link>
              </article>
            ))}
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Need a custom setup?{" "}
            <a
              href="mailto:hello@medora.ph"
              className="font-semibold text-brand underline underline-offset-4"
            >
              Talk to our team.
            </a>
          </p>

          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-5 sm:grid-cols-4">
            {benefits.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center justify-center gap-2 text-center text-xs font-medium text-slate-600 sm:text-sm"
              >
                <Icon size={20} className="shrink-0 text-brand" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-brand-dark">
          <div className="grid items-center lg:grid-cols-2">
            <div className="relative z-10 p-8 sm:p-12 lg:p-14">
              <SectionLabel>Better care starts here</SectionLabel>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to simplify your clinic management?
              </h2>
              <p className="mt-5 max-w-lg leading-7 text-white/75">
                Join clinics that want a simpler way to manage appointments
                and give patients a better booking experience.
              </p>
              <Link
                href="/signup"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-bold text-brand-dark transition hover:bg-brand-light"
              >
                Get started <ArrowRight size={18} />
              </Link>
            </div>

            <div className="relative min-h-[280px] lg:min-h-[400px]">
              <img
                src="https://plus.unsplash.com/premium_photo-1675686363443-30a885f063c2?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D"
                alt="Welcoming and modern clinic reception"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/30 to-transparent lg:from-brand-dark/70 hidden sm:block" />
              <div className="absolute bottom-8 right-8 hidden max-w-[210px] rounded-2xl border border-white/20 bg-white/90 p-5 backdrop-blur-sm sm:block">
                <Sparkles size={22} className="text-brand" />
                <p className="mt-3 font-bold text-brand-dark">
                  Better appointments. Brighter smiles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <div>
            <Logo />
            <p className="mt-2 text-sm text-slate-500">
              Clinic management, made simpler.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
            <Link href="#features" className="hover:text-brand">
              Features
            </Link>
            <Link href="#pricing" className="hover:text-brand">
              Pricing
            </Link>
            <Link href="#how-it-works" className="hover:text-brand">
              How it works
            </Link>
            <a href="mailto:hello@medora.ph" className="hover:text-brand">
              Contact
            </a>
          </div>

          <p className="text-xs text-slate-500">
            © {year} Medora. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
