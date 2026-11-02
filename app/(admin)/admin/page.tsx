import { requirePlatformAdmin } from "@/lib/auth/require-platform-admin";

export default async function PlatformOverviewPage() {
  const { staff } = await requirePlatformAdmin();

  const staffName = staff.first_name;

  return (
    <section>
      <h2 className="mt-2 text-3xl font-bold text-[#173F35]">
        Welcome back, {staffName}!
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Here's what's happening across your clinics.
      </p>
    </section>
  );
}