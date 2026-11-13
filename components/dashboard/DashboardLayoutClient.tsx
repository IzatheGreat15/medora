
"use client";

import { Suspense, useState } from "react";
import { usePathname } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/Sidebar";
import DashboardNavbar from "@/components/dashboard/Navbar";
import AuthProvider from "@/components/providers/AuthProvider";
import type { DashboardStaff } from "@/lib/auth/types";

export type { DashboardStaff } from "@/lib/auth/types";

export default function DashboardLayoutClient({
  children,
  staff
}: Readonly<{
  children: React.ReactNode;
  staff: DashboardStaff;
}>) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <AuthProvider initialStaff={staff}>
    <div className="min-h-screen bg-[#F7F9F6]">
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <div className="sticky top-0 hidden h-screen shrink-0 lg:block">
          <Suspense
            fallback={<div className="h-screen w-64 bg-[#173F35]" />}
          >
            <DashboardSidebar
              staff={staff}
              collapsed={collapsed}
              onToggle={() => setCollapsed((value) => !value)}
            />
          </Suspense>
        </div>

        {/* Mobile sidebar overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={closeMobileMenu}
              className="absolute inset-0 h-full w-full bg-black/40"
            />

            <div className="absolute inset-y-0 left-0 z-10 h-full shadow-2xl">
              <Suspense
                fallback={
                  <div className="h-screen w-64 bg-[#173F35]" />
                }
              >
                <DashboardSidebar
                  staff={staff}
                  collapsed={false}
                  onToggle={closeMobileMenu}
                  onNavigate={closeMobileMenu}
                />
              </Suspense>
            </div>
          </div>
        )}

        {/* Main workspace */}
        <div className="flex min-w-0 flex-1 flex-col">
          <Suspense
            fallback={
              <div className="h-16 shrink-0 border-b border-slate-200 bg-white" />
            }
          >
            <DashboardNavbarWithPathname
              staff={staff}
              onMenuClick={() => setMobileMenuOpen(true)}
            />
          </Suspense>

          <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
      </div>
    </AuthProvider>
  );
}

function DashboardNavbarWithPathname({
  staff,
  onMenuClick,
}: {
  staff: DashboardStaff;
  onMenuClick: () => void;
}) {
  const pathname = usePathname();

  return (
    <DashboardNavbar
      key={pathname}
      staff={staff}
      onMenuClick={onMenuClick}
    />
  );
}
