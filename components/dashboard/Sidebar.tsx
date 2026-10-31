
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Building2,
  Stethoscope,
  ClipboardList,
  Settings,
  HelpCircle,
  HeartPulse,
  ChevronLeft,
} from "lucide-react";
import { DashboardStaff } from "./DashboardLayoutClient";

const mainNavigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Bookings",
    href: "/bookings",
    icon: CalendarDays,
  },
  {
    label: "Branches",
    href: "/branches",
    icon: Building2,
  },
  {
    label: "Doctors",
    href: "/doctors",
    icon: Stethoscope,
  },
  {
    label: "Services",
    href: "/services",
    icon: ClipboardList,
  },
];

const bottomNavigation = [
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    label: "Help & support",
    href: "/help",
    icon: HelpCircle,
  },
];

type DashboardSidebarProps = {
  staff: DashboardStaff;
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
};

export default function DashboardSidebar({
  staff,
  collapsed,
  onToggle,
  onNavigate,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const clinicName = staff.clinic_name;

  function isActive(href: string) {
    if (href === "/dashboard") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside
      className={`relative flex h-full shrink-0 flex-col bg-[#173F35] text-white transition-[width] duration-200 ${collapsed ? "w-[76px]" : "w-[260px]"
        }`}
    >
      {/* Brand */}
      <div
        className={`flex h-[76px] shrink-0 items-center border-b border-white/10 ${collapsed ? "justify-center px-2" : "justify-between px-6"
          }`}
      >
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-3 overflow-hidden"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#176B55]">
            <img src="/logo.webp" />
          </span>

          {!collapsed && (
            <span className="text-[23px] font-extrabold tracking-tight">
              medora
            </span>
          )}
        </Link>

        {!collapsed && (
          <button
            type="button"
            onClick={onToggle}
            aria-label="Collapse sidebar"
            className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Main navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-6">
        {!collapsed && (
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
            Workspace
          </p>
        )}

        <nav className="space-y-1.5">
          {mainNavigation.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);

            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                title={collapsed ? label : undefined}
                aria-current={active ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-white/65 hover:bg-white/8 hover:text-white"
                  } ${collapsed ? "justify-center" : ""}`}
              >
                <Icon
                  size={19}
                  strokeWidth={active ? 2.2 : 1.8}
                  className={`shrink-0 ${active
                      ? "text-[#B8E6D0]"
                      : "text-white/60 group-hover:text-white"
                    }`}
                />

                {!collapsed && <span>{label}</span>}

                {active && !collapsed && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#B8E6D0]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="my-6 border-t border-white/10" />

        {!collapsed && (
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
            Preferences
          </p>
        )}

        <nav className="space-y-1.5">
          {bottomNavigation.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);

            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                title={collapsed ? label : undefined}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active
                    ? "bg-white/15 text-white"
                    : "text-white/65 hover:bg-white/8 hover:text-white"
                  } ${collapsed ? "justify-center" : ""}`}
              >
                <Icon size={19} className="shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Clinic account card */}
      {!collapsed && (
        <div className="shrink-0 border-t border-white/10 p-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="truncate text-sm font-semibold">{clinicName}</p>
            <p className="mt-1 text-xs text-white/55">
              Clinic workspace
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#82D5AC]" />
              <span className="text-[11px] text-white/65">
                Workspace active
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          type="button"
          onClick={onToggle}
          aria-label="Expand sidebar"
          title="Expand sidebar"
          className="absolute -right-3 top-[86px] z-20 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-[#173F35] shadow-sm"
        >
          <ChevronLeft size={14} className="rotate-180" />
        </button>
      )}
    </aside>
  );
}
