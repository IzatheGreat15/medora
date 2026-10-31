
import { Suspense } from "react";
import { connection } from "next/server";

import { requireClinicUser } from "@/lib/auth/require-clinic-user";
import DashboardLayoutClient from "@/components/dashboard/DashboardLayoutClient";

async function AuthenticatedDashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();

  const { staff, clinicName } = await requireClinicUser();

  return (
    <DashboardLayoutClient
      staff={{
        id: staff.id,
        first_name: staff.first_name,
        last_name: staff.last_name,
        role: "clinic_user",
        clinic_role: staff.clinic_role,
        clinic_id: staff.clinic_id!,
        clinic_name: clinicName,
      }}
    >
      {children}
    </DashboardLayoutClient>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-slate-500">
            Loading dashboard...
          </p>
        </div>
      }
    >
      <AuthenticatedDashboard>{children}</AuthenticatedDashboard>
    </Suspense>
  );
}
