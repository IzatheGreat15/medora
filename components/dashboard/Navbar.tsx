
"use client";

import { usePathname } from "next/navigation";
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  Command,
} from "lucide-react";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/bookings": "Bookings",
  "/branches": "Branches",
  "/doctors": "Doctors",
  "/services": "Services",
  "/settings": "Settings",
  "/support": "Help & support",
};

type DashboardNavbarProps = {
  onMenuClick: () => void;
};

export default function DashboardNavbar({
  onMenuClick,
}: DashboardNavbarProps) {
  const pathname = usePathname();

  const title =
    pageTitles[pathname] ??
    Object.entries(pageTitles).find(
      ([path]) => path !== "/dashboard" && pathname.startsWith(`${path}/`),
    )?.[1] ??
    "Dashboard";

  return (
    <header className="sticky top-0 z-30 flex h-[76px] shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      {/* Left */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
        >
          <Menu size={21} />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg font-bold text-[#173F35] sm:text-xl">
              {title}
            </h1>
          </div>
          <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">
            Manage your clinic with Medora
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        {/* Search */}
        {/* <button
          type="button"
          aria-label="Search"
          className="hidden items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 transition hover:border-[#82A995] sm:flex sm:min-w-[190px] lg:min-w-[230px]"
        >
          <Search size={17} />
          <span>Search...</span>
          <span className="ml-auto flex items-center gap-1 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px]">
            <Command size={10} /> K
          </span>
        </button> */}

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100"
        >
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-[#176B55]" />
        </button>

        <div className="hidden h-8 w-px bg-slate-200 sm:block" />

        {/* Account menu placeholder */}
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-50 sm:gap-3 sm:px-2"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DDF3E7] text-sm font-bold text-[#176B55]">
            AD
          </span>

          <span className="hidden text-left sm:block">
            <span className="block text-sm font-semibold text-[#173F35]">
              Admin
            </span>
            <span className="mt-0.5 block text-xs text-slate-500">
              Clinic administrator
            </span>
          </span>

          <ChevronDown
            size={16}
            className="hidden text-slate-400 sm:block"
          />
        </button>
      </div>
    </header>
  );
}
