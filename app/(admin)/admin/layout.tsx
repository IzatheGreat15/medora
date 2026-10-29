
import { Suspense } from "react";
import { connection } from "next/server";

import PlatformAdminLayout from "@/components/admin/PlatformAdminLayout";
import { requirePlatformAdmin } from "@/lib/auth/require-platform-admin";

async function AuthenticatedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authentication depends on the current request and its cookies.
  await connection();

  const { staff } = await requirePlatformAdmin();

  return (
    <PlatformAdminLayout
      staff={{
        first_name: staff.first_name,
        last_name: staff.last_name,
        role: staff.role,
        clinic_role: null,
      }}
    >
      {children}
    </PlatformAdminLayout>
  );
}

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-slate-500">
            Loading admin dashboard...
          </p>
        </div>
      }
    >
      <AuthenticatedAdminLayout>
        {children}
      </AuthenticatedAdminLayout>
    </Suspense>
  );
}
