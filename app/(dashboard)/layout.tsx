
"use client";

import { Suspense, useState } from "react";
import { usePathname } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/Sidebar";
import DashboardNavbar from "@/components/dashboard/Navbar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#F7F9F6]">
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <div className="sticky top-0 hidden h-screen shrink-0 lg:block">
          <Suspense
            fallback={<div className="h-screen w-64 bg-[#173F35]" />}
          >
            <DashboardSidebar
              collapsed={collapsed}
              onToggle={() => setCollapsed((value) => !value)}
            />
          </Suspense>
        </div>

        {/* Mobile sidebar overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={closeMobileMenu}
              className="absolute inset-0 h-full w-full bg-black/40"
            />

            {/* Sidebar panel */}
            <div className="absolute inset-y-0 left-0 z-10 h-full shadow-2xl">
              <Suspense
                fallback={
                  <div className="h-screen w-64 bg-[#173F35]" />
                }
              >
                <DashboardSidebar
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
              onMenuClick={() => setMobileMenuOpen(true)}
            />
          </Suspense>

          <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

function DashboardNavbarWithPathname({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  const pathname = usePathname();

  return (
    <DashboardNavbar
      key={pathname}
      onMenuClick={onMenuClick}
    />
  );
}
