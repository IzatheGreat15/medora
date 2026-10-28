
import PlatformAdminLayout from "@/components/admin/PlatformAdminLayout";
import { requirePlatformAdmin } from "@/lib/auth/require-platform-admin";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
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
