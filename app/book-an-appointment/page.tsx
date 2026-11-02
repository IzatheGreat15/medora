import { Suspense } from "react";
import BookingWizard from "@/components/booking/BookingWizard";
import { getPublicBookingOptions } from "./actions";

type PageProps = {
  searchParams: Promise<{
    clinic?: string;
  }>;
};

export default function BookAppointmentPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<BookingLoading />}>
      <BookingContent searchParams={searchParams} />
    </Suspense>
  );
}

async function BookingContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const clinicId = params.clinic ?? "";

  try {
    const options = await getPublicBookingOptions(clinicId);
    return <BookingWizard options={options} />;
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
}

function BookingLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F9F6] px-4 py-10">
      <div className="w-full max-w-3xl animate-pulse space-y-5">
        <div className="h-12 w-48 rounded-xl bg-slate-200" />
        <div className="h-32 rounded-2xl bg-white" />
        <div className="h-64 rounded-2xl bg-white" />
      </div>
    </main>
  );
}