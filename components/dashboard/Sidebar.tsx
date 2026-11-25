
"use client";

import { useEffect, useState } from "react";
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
  ChevronLeft,
  ChevronDown,
  LogOut,
  Users,
  Mail,
} from "lucide-react";

import { DashboardStaff } from "./DashboardLayoutClient";
import { logout } from "@/app/actions/auth";

type NavigationChild = {
  label: string;
  href: string;
  icon: React.ElementType;
};

type NavigationItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  children?: NavigationChild[];
};

const mainNavigation: NavigationItem[] = [
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

const bottomNavigation: NavigationItem[] = [
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    children: [
      {
        label: "Staff",
        href: "/settings/staff",
        icon: Users,
      },
      {
        label: "Email Templates",
        href: "/settings/email-templates",
        icon: Mail,
      },
    ],
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
      className={`relative flex h-full shrink-0 flex-col bg-[#173F35] text-white transition-[width] duration-200 ${
        collapsed ? "w-[76px]" : "w-[260px]"
      }`}
    >
      {/* Brand */}
      <div
        className={`flex h-[76px] shrink-0 items-center border-b border-white/10 ${
          collapsed ? "justify-center px-2" : "justify-between px-6"
        }`}
      >
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-3 overflow-hidden"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#176B55]">
            <img src="/logo.webp" alt="Medora logo" />
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
          {mainNavigation.map((item) => (
            <SidebarNavigationItem
              key={item.href}
              item={item}
              pathname={pathname}
              collapsed={collapsed}
              onNavigate={onNavigate}
              isActive={isActive}
            />
          ))}
        </nav>

        <div className="my-6 border-t border-white/10" />

        {!collapsed && (
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
            Preferences
          </p>
        )}

        <nav className="space-y-1.5">
          {bottomNavigation.map((item) => (
            <SidebarNavigationItem
              key={item.href}
              item={item}
              pathname={pathname}
              collapsed={collapsed}
              onNavigate={onNavigate}
              isActive={isActive}
            />
          ))}
        </nav>
      </div>

      {/* Clinic account and logout */}
      <div className="shrink-0 border-t border-white/10 p-4">
        {!collapsed && (
          <div className="mb-3 rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="truncate text-sm font-semibold">
              {clinicName}
            </p>

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
        )}

        <form action={logout}>
          <button
            type="submit"
            title={collapsed ? "Log out" : undefined}
            className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/65 transition hover:bg-rose-500/15 hover:text-rose-200 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <LogOut
              size={19}
              className="shrink-0 transition group-hover:text-rose-300"
            />

            {!collapsed && <span>Log out</span>}
          </button>
        </form>
      </div>

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

// Reusable navigation item with optional dropdown children.
type SidebarNavigationItemProps = {
  item: NavigationItem;
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
  isActive: (href: string) => boolean;
};

function SidebarNavigationItem({
  item,
  pathname,
  collapsed,
  onNavigate,
  isActive,
}: SidebarNavigationItemProps) {
  const [expanded, setExpanded] = useState(false);

  const hasChildren = Boolean(item.children?.length);

  const childIsActive = item.children?.some((child) =>
    isActive(child.href),
  );

  const active = isActive(item.href) || Boolean(childIsActive);

  // Automatically expand when one of its child routes is active.
  useEffect(() => {
    if (childIsActive) {
      setExpanded(true);
    }
  }, [childIsActive, pathname]);

  const Icon = item.icon;

  return (
    <div>
      <div
        className={`group flex items-center rounded-xl transition ${
          active
            ? "bg-white/15 text-white shadow-sm"
            : "text-white/65 hover:bg-white/8 hover:text-white"
        } ${collapsed ? "justify-center" : ""}`}
      >
        <Link
          href={item.href}
          onClick={onNavigate}
          title={collapsed ? item.label : undefined}
          aria-current={isActive(item.href) ? "page" : undefined}
          className={`flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-sm font-medium ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <Icon
            size={19}
            strokeWidth={active ? 2.2 : 1.8}
            className={`shrink-0 ${
              active
                ? "text-[#B8E6D0]"
                : "text-white/60 group-hover:text-white"
            }`}
          />

          {!collapsed && <span className="truncate">{item.label}</span>}
        </Link>

        {hasChildren && !collapsed && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-label={`${expanded ? "Collapse" : "Expand"} ${item.label}`}
            aria-expanded={expanded}
            className="mr-2 rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </button>
        )}
      </div>

      {/* Dropdown children */}
      {hasChildren && expanded && (
        <div
          className={`mt-1 space-y-1 ${
            collapsed ? "pl-0" : "ml-6 border-l border-white/15 pl-3"
          }`}
        >
          {item.children!.map((child) => {
            const ChildIcon = child.icon;
            const childActive = isActive(child.href);

            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={onNavigate}
                title={collapsed ? child.label : undefined}
                aria-current={childActive ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  childActive
                    ? "bg-white/15 text-[#B8E6D0]"
                    : "text-white/55 hover:bg-white/8 hover:text-white"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <ChildIcon size={17} className="shrink-0" />
                {!collapsed && <span>{child.label}</span>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
