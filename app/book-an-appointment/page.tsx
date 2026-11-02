
import BookingWizard from "@/components/booking/BookingWizard";
import { getPublicBookingOptions } from "./actions";

type PageProps = {
  searchParams: Promise<{
    clinic?: string;
  }>;
};

export default async function BookAppointmentPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const clinicId = params.clinic ?? "";

  let options;

  try {
    options = await getPublicBookingOptions(clinicId);
  } catch {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F9F6] px-4 py-10">
        <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-bold text-[#173F35]">
            Booking page unavailable
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Please use the appointment booking link provided by your clinic,
            or contact the clinic directly for assistance.
          </p>
        </section>
      </main>
    );
  }

  return <BookingWizard options={options} />;
}
