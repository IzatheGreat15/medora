
"use client";

import { useState } from "react";
import PlatformAdminSidebar from "./PlatformAdminSidebar";
import PlatformAdminHeader from "./PlatformAdminHeader";

type Staff = {
  first_name: string;
  last_name: string;
  role: string;
  clinic_role: string | null;
};

export default function PlatformAdminLayout({
  children,
  staff,
}: {
  children: React.ReactNode;
  staff: Staff;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-[#F7F9F6]">
      <div className="hidden h-full shrink-0 md:block">
        <PlatformAdminSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((value) => !value)}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <PlatformAdminHeader staff={staff} />

        <main className="flex-1 overflow-y-auto p-5 md:p-7 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
