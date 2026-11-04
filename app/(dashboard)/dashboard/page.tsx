
import DashboardPageContent from "@/components/dashboard/DashboardPageClient";
import { requireClinicUser } from "@/lib/auth/require-clinic-user";
import { getDashboardData } from "@/lib/dashboard/get-dashboard-data";

export default async function DashboardPage() {
  const { staff, clinicId } = await requireClinicUser();

  const dashboardData = await getDashboardData(clinicId);

  return (
    <DashboardPageContent
      staff={staff}
      data={dashboardData}
    />
  );
}
