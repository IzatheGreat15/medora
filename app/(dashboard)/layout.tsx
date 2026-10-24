
"use client";

import { useState } from "react";
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
  const pathname = usePathname();

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#F7F9F6]">
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <div className="sticky top-0 hidden h-screen shrink-0 lg:block">
          <DashboardSidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed((value) => !value)}
          />
        </div>

        {/* Mobile sidebar */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close navigation"
              onClick={closeMobileMenu}
              className="absolute inset-0 bg-slate-950/40"
            />
            <div className="absolute inset-y-0 left-0">
              <DashboardSidebar
                collapsed={false}
                onToggle={closeMobileMenu}
                onNavigate={closeMobileMenu}
              />
            </div>
          </div>
        )}

        {/* Main workspace */}
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardNavbar
            key={pathname}
            onMenuClick={() => setMobileMenuOpen(true)}
          />

          <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
