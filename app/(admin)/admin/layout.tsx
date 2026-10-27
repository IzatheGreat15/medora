import PlatformAdminLayout from "@/components/admin/PlatformAdminLayout";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PlatformAdminLayout>{children}</PlatformAdminLayout>;
}
