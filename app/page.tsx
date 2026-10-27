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
  MessageCircle,
  LayoutDashboard,
  Globe,
  Bell,
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
      "Add your branches, doctors, services, and opening hours.",
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
    description: "Perfect for solo doctors and small clinics.",
    price: "₱999",
    period: "/ month",
    highlighted: true,
    features: [
      "1 doctor",
      "1 branch",
      "Unlimited appointments",
      "Online booking page",
      "Appointment management",
      "Ongoing Support",
    ],
    cta: "Get started",
    href: "/signup",
  },
  {
    name: "Professional",
    description: "For clinics with growing teams.",
    price: "₱1,999",
    period: "/ month",
    highlighted: false,
    features: [
      "Up to 3 doctors",
      "1 branch",
      "Unlimited appointments",
      "Online booking page",
      "Centralized scheduling",
      "Doctor management",
      "Ongoing Support",
    ],
    cta: "Get started",
    href: "/signup",
  },
  {
    name: "Clinic Plus",
    description: "For established clinics managing multiple locations.",
    price: "₱2,999",
    period: "/ month",
    highlighted: false,
    features: [
      "4–6 doctors",
      "Up to 3 branches",
      "Unlimited appointments",
      "Online booking page",
      "Centralized scheduling",
      "Multi-branch management",
      "Ongoing Support",
    ],
    cta: "Get started",
    href: "/signup",
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
      <img src="/full-logo.webp" className="w-36" />
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

function MessageCircleIcon() {
  return <MessageCircle size={15} />;
}

function ConversationProblemSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = document.getElementById("problem");
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const conversations = [
    {
      label: "Availability",
      message: "Hi po, may slot pa po si Dr. Santos today?",
      reply: "I-check ko po muna ang schedule niya.",
      note: "Staff has to stop and check the doctor's calendar.",
    },
    {
      label: "Specific doctor",
      message: "Available po ba si Dra. Reyes sa Saturday?",
      reply: "Wait lang po, I'll confirm with the branch.",
      note: "Availability questions repeat across doctors and branches.",
    },
    {
      label: "Price and duration",
      message: "How much po ang consultation? How long will it take?",
      reply: "I'll send you the details po.",
      note: "The same service questions take time to answer again and again.",
    },
  ];

  return (
    <section id="problem" className="scroll-mt-24 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#DDF3E7] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#173F35]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#176B55]" />
            The everyday problem
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#173F35] sm:text-4xl">
            Your clinic shouldn’t run on endless chat messages.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
            “Is there a slot for this doctor?” “What time are they available?”
            “How much is the consultation?” Your staff shouldn’t have to
            answer every question manually just to get an appointment booked.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {conversations.map((conversation, index) => (
            <article
              key={conversation.label}
              style={{ transitionDelay: isVisible ? `${index * 180}ms` : "0ms" }}
              className={`rounded-2xl border border-slate-200 bg-[#F7F9F6] p-5 shadow-sm transition-all duration-700 ease-out ${isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
                }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-[#32866B]">
                  {conversation.label}
                </span>
                <MessageCircleIcon />
              </div>

              <div className="space-y-3">
                <div className="flex justify-start">
                  <p className="max-w-[95%] rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm">
                    {conversation.message}
                  </p>
                </div>
                <div className="flex justify-end">
                  <p className="max-w-[95%] rounded-2xl rounded-tr-sm bg-[#DDF3E7] px-4 py-3 text-sm leading-6 text-[#173F35]">
                    {conversation.reply}
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-200 pt-4">
                <p className="text-sm font-semibold leading-6 text-[#173F35]">
                  {conversation.note}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div
          style={{ transitionDelay: isVisible ? "620ms" : "0ms" }}
          className={`mt-8 flex flex-col items-start gap-4 rounded-2xl bg-[#173F35] p-6 text-white transition-all duration-700 ease-out sm:flex-row sm:items-center sm:justify-between sm:p-8 ${isVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-8 opacity-0"
            }`}
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#B8E8D0]">
              <CalendarCheck size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">
                Replace the back-and-forth with a clearer booking process.
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                Let patients send appointment requests online while your team
                manages doctors, branches, services, and schedules from one place.
              </p>
            </div>
          </div>
          <Link
            href="#how-it-works"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#173F35] transition hover:bg-[#DDF3E7]"
          >
            See how Medora helps <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [year, setYear] = useState(0);
  useEffect(() => {
    setYear(new Date().getFullYear());
  });

  const benefits = [
    { icon: Building2, text: "Organize your clinic" },
    { icon: Stethoscope, text: "Manage your doctors" },
    { icon: CalendarDays, text: "Simplify scheduling" },
    { icon: Users, text: "Help patients book" },
    { icon: MessageCircle, text: "Reduce scheduling back-and-forth" },
  ];


  const [visibleMessages, setVisibleMessages] = useState(1);

  useEffect(() => {
    const messageCount = 4;
    const messageDelay = 2200;
    const resetDelay = 3000;

    const timer = window.setInterval(() => {
      setVisibleMessages((current) => {
        if (current >= messageCount) {
          return 0;
        }

        return current + 1;
      });
    }, messageDelay);

    return () => window.clearInterval(timer);
  }, []);


  return (
    <main className="overflow-clip bg-[#F7F9F6] text-slate-700">
      {/* Navigation */}
      <header className="sticky top-0 z-[100] w-full border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <Logo />

          <div className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm hover:text-brand">
              Features
            </Link>
            <Link href="#pricing" className="text-sm hover:text-brand">
              Pricing
            </Link>
            <Link href="#clinics" className="text-sm hover:text-brand">
              For clinics
            </Link>
            <Link href="#how-it-works" className="text-sm hover:text-brand">
              How it works
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


      {/* Hero: lead with the problem Medora solves */}
      <section className="relative isolate overflow-hidden bg-[#F7F9F6]">
        {/* Background photo with layered green/white gradients for readability */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1777269749032-d8d458ae594d?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#F7F9F6]/95 via-[#F7F9F6]/85 to-[#DDF3E7]/55" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-[#DDF3E7]/45" />
          <div className="absolute -right-32 -top-24 h-[420px] w-[420px] rounded-full bg-[#DDF3E7]/65 blur-3xl" />
          <div className="absolute -bottom-40 left-[28%] h-[360px] w-[520px] rounded-full bg-[#E8F4EC]/70 blur-3xl" />
        </div>

        <div className="mx-auto grid min-h-[680px] max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:min-h-[720px] lg:grid-cols-[0.95fr_1.05fr] lg:px-10 lg:py-20">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#B8D8C7] bg-white/90 px-4 py-2 text-xs font-bold text-[#176B55] shadow-sm sm:text-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#4D9F82]" />
              Built for busy clinics and their patients
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-[#173F35] sm:text-5xl lg:text-6xl">
              All-In-One Solution
              <span className="mt-2 block text-[#4D9F82]">
                For Your Clinic
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Medora gives patients a clearer way to request appointments and helps your team manage availability and booking requests in one place, with less back-and-forth.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="https://forms.gle/vG84rE2R7oKT7DBu6"
                target="_blank"
                className="inline-flex items-center gap-2 rounded-xl bg-[#176B55] px-6 py-4 font-semibold text-white shadow-lg shadow-[#176B55]/20 transition hover:-translate-y-0.5 hover:bg-[#173F35]"
              >
                {/* Simplify appointment booking <ArrowRight size={18} /> */}
                Join the Pilot Program <ArrowRight size={18} />
              </Link>

              <Link
                href="#problem"
                className="inline-flex items-center gap-2 rounded-xl border border-[#C9D8CF] bg-white/90 px-6 py-4 font-semibold text-[#173F35] transition hover:bg-white"
              >
                See what changes <ChevronRight size={18} />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-slate-600">
              {[
                "Online appointment requests",
                "Doctor availability in one place",
                "Multi-branch scheduling",
              ].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-[#32866B]" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Conversation pain point visual */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-[#DDF3E7] via-white to-[#B8D8C7] blur-xl" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white bg-white/95 p-4 shadow-2xl shadow-[#173F35]/10 backdrop-blur sm:p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#DDF3E7] text-[#176B55]">
                    <Users size={21} />
                  </div>
                  <div>
                    <p className="font-bold text-[#173F35]">Clinic inbox</p>
                    <p className="mt-0.5 text-xs text-slate-500">A familiar busy day</p>
                  </div>
                </div>

                <span className="animate-pulse rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  12 unread
                </span>

              </div>

              <div className="space-y-4 py-5">
                <div
                  className={`flex justify-start transition-all duration-700 ease-out ${visibleMessages >= 1
                    ? "translate-y-0 opacity-100"
                    : "translate-y-5 opacity-0"
                    }`}
                >
                  <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Patient · 9:12 AM
                    </p>
                    <p className="mt-1.5 text-sm leading-6 text-slate-700">
                      Hi! Is there an available slot for Dr. Santos tomorrow?
                    </p>
                  </div>
                </div>

                <div
                  className={`flex justify-end transition-all duration-700 ease-out ${visibleMessages >= 2
                    ? "translate-y-0 opacity-100"
                    : "translate-y-5 opacity-0"
                    }`}
                >
                  <div className="max-w-[88%] rounded-2xl rounded-tr-sm bg-[#DDF3E7] px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#32866B]">Reception · 9:16 AM</p>
                    <p className="mt-1.5 text-sm leading-6 text-[#173F35]">
                      Let me check the schedule first. One moment, please.
                    </p>
                  </div>
                </div>
                <div
                  className={`flex justify-start transition-all duration-700 ease-out ${visibleMessages >= 3
                    ? "translate-y-0 opacity-100"
                    : "translate-y-5 opacity-0"
                    }`}
                >
                  <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Another patient · 9:18 AM</p>
                    <p className="mt-1.5 text-sm leading-6 text-slate-700">
                      How about Friday? And how much is the consultation?
                    </p>
                  </div>
                </div>
                <div
                  className={`flex items-center gap-2 rounded-xl border border-dashed border-[#B8D8C7] bg-[#F7FBF8] px-3 py-3 text-xs font-medium text-[#53645D] transition-all duration-700 ${visibleMessages >= 4
                    ? "translate-y-0 opacity-100"
                    : "translate-y-3 opacity-0"
                    }`}
                >

                  <Clock3 size={16} className="shrink-0 text-[#176B55]" />
                  Your staff is checking schedules instead of helping the next patient.
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-[#173F35] p-4 text-white">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <CalendarCheck size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">With Medora</p>
                  <p className="mt-1 text-xs leading-5 text-white/75">
                    Patients send requests online. Your team reviews them in one organized schedule.
                  </p>
                </div>
                <CheckCircle2 size={21} className="shrink-0 text-[#B8E8D0]" />
              </div>
            </div>
            <div className="absolute -right-2 -top-4 hidden items-center gap-2 rounded-xl border border-white bg-white px-3 py-2.5 text-xs font-semibold text-[#176B55] shadow-lg sm:flex">
              <MessageCircleIcon />
              Same questions, every day
            </div>
          </div>
        </div>
      </section>

      {/* The problem: conversation bubbles reveal as you scroll */}
      <ConversationProblemSection />


      {/* Patient booking */}

      <section id="features" className="scroll-mt-24 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            {/* Section introduction */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <SectionLabel>Features</SectionLabel>

              <h2 className="mt-5 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
                Everything your clinic needs to stay organized.
              </h2>

              <p className="mt-5 leading-7 text-slate-600">
                From appointment requests to managing doctors and branches,
                Medora brings your clinic's daily operations into one simple
                workspace.
              </p>

              <Link
                href="/signup"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
              >
                Get started <ArrowRight size={16} />
              </Link>
            </div>

            {/* Feature grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: LayoutDashboard,
                  title: "Clinic dashboard",
                  description:
                    "Get an overview of appointments and your clinic's activity.",
                },
                {
                  icon: CalendarCheck,
                  title: "Appointment management",
                  description:
                    "Review requests, approve or decline bookings, and manage appointments.",
                },
                {
                  icon: Building2,
                  title: "Multi-branch management",
                  description:
                    "Organize clinic locations and manage each branch in one place.",
                },
                {
                  icon: Stethoscope,
                  title: "Doctor management",
                  description:
                    "Manage doctor profiles, availability, and working schedules.",
                },
                {
                  icon: ClipboardList,
                  title: "Service management",
                  description:
                    "Configure your clinic's services and appointment durations.",
                },
                {
                  icon: Globe,
                  title: "Online booking page",
                  description:
                    "Give patients a convenient way to request appointments online.",
                },
                {
                  icon: Bell,
                  title: "Email notifications",
                  description:
                    "Keep patients informed about booking confirmations and updates.",
                },
                {
                  icon: Users,
                  title: "Staff management",
                  description:
                    "Organize your clinic team and manage staff access.",
                },
              ].map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5 sm:p-6"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light text-brand">
                    <Icon size={21} strokeWidth={1.8} />
                  </div>

                  <h3 className="mt-4 font-bold text-brand-dark">
                    {title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="relative isolate scroll-mt-24 overflow-hidden bg-gradient-to-br from-[#F7F9F6] via-[#DDF3E7] to-[#82A995]/50 py-20 sm:py-24"
      >
        {/* Soft gradient shapes */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute -left-40 -top-24 h-[500px] w-[700px] rounded-[45%] bg-[#B8E8D0]/60 blur-3xl" />

          <div className="absolute -right-40 top-0 h-[450px] w-[600px] rounded-full bg-[#82A995]/30 blur-3xl" />

          <div className="absolute -bottom-72 left-[15%] h-[500px] w-[1000px] rounded-[50%] bg-gradient-to-r from-[#DDF3E7]/80 via-[#B8E8D0]/70 to-[#F7F9F6]/90 blur-2xl" />
        </div>

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
                className="rounded-2xl border border-white/80 bg-white/90 p-7 shadow-lg shadow-[#173F35]/5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#173F35]/10"
              >
                <span className="text-sm font-extrabold tracking-widest text-[#32866B]">
                  {step.number}
                </span>

                <h3 className="mt-5 text-xl font-bold text-[#173F35]">
                  {step.title}
                </h3>

                <p className="mt-3 leading-7 text-[#53645D]">
                  {step.description}
                </p>
              </div>
            ))}
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
              Give your staff a clear overview of appointments, doctors,
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
              href="mailto:meitanteistudios@gmail.com"
              className="font-semibold text-brand underline underline-offset-4"
            >
              Talk to our team.
            </a>
          </p>
        </div>
      </section>

      {/* Quick benefits */}
      <section className="overflow-hidden border-y border-slate-200/70 bg-[#173F35] text-white">
        <div className="group relative py-6">
          <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
            {[...benefits, ...benefits].map(({ icon: Icon, text }, index) => (
              <div
                key={`${text}-${index}`}
                className="flex shrink-0 items-center gap-3 px-7 py-2 sm:px-10"
              >
                <Icon size={25} className="shrink-0 text-[#DDF3E7]" />
                <span className="whitespace-nowrap text-sm font-semibold text-white sm:text-base">
                  {text}
                </span>
                <span className="ml-5 h-1.5 w-1.5 rounded-full bg-[#82A995]" />
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
            <a href="mailto:meitanteistudios@gmail.com" className="hover:text-brand">
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
