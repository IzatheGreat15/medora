
import DashboardPageContent from "@/components/dashboard/DashboardPageClient";
import { requireClinicUser } from "@/lib/auth/require-clinic-user";

export default async function DashboardPage() {
  const { staff } = await requireClinicUser();

  return <DashboardPageContent staff={staff} />;
}
