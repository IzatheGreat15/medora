
"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";

type Staff = {
  first_name: string;
  last_name: string;
  role: string;
  clinic_role: string | null;
};

const pageDetails: Record<
  string,
  { title: string; subtitle: string }
> = {
  "/admin": {
    title: "Overview",
    subtitle: "Manage your Medora platform",
  },
  "/admin/clinics": {
    title: "Clinics",
    subtitle: "Manage registered clinics and their subscriptions",
  },
  "/admin/subscription-plans": {
    title: "Subscription Plans",
    subtitle: "Configure pricing, limits, and plan availability",
  },
};

export default function PlatformAdminHeader({
  staff,
}: {
  staff: Staff;
}) {
  const pathname = usePathname();

  const page = pageDetails[pathname] ?? {
    title: "Platform Administration",
    subtitle: "Manage your Medora platform",
  };

  const fullName =
    `${staff.first_name} ${staff.last_name}`.trim() || "Admin";

  const initials =
    `${staff.first_name?.[0] ?? ""}${staff.last_name?.[0] ?? ""}`
      .toUpperCase() || "AD";

  const roleLabel =
    staff.role === "platform_admin"
      ? "Platform Administrator"
      : staff.clinic_role
        ? staff.clinic_role.charAt(0).toUpperCase() +
          staff.clinic_role.slice(1)
        : "Administrator";

  return (
    <header
      className="flex h-[70px] shrink-0 items-center
        justify-between border-b border-slate-200 bg-white px-6 lg:px-8"
    >
      <div>
        <h1 className="text-lg font-bold text-[#173F35]">
          {page.title}
        </h1>
        <p className="text-xs text-slate-500">
          {page.subtitle}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-lg p-2 text-slate-600
            transition hover:bg-slate-100"
        >
          <Bell size={20} />
        </button>

        <div className="h-8 border-l border-slate-200" />

        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center
              rounded-full bg-[#DDF3E7] text-xs font-bold text-[#176B55]"
          >
            {initials}
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-[#173F35]">
              {fullName}
            </p>
            <p className="text-xs text-slate-500">
              {roleLabel}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
