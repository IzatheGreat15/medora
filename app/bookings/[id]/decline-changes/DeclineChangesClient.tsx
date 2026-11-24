"use client";

import { useState, useTransition } from "react";
import { cancelUpdatedBooking } from "./actions";

interface Booking {
  id: string;
  clinicId: string;
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceName: string;
  status: string;
  isUpdated: boolean;
}

interface Props {
  booking: Booking | null;
  initialError: string | null;
}

export default function DeclineChangesClient({
  booking,
  initialError,
}: Props) {
  const [cancelled, setCancelled] = useState(
    booking?.status === "Cancelled",
  );

  const [error, setError] = useState(initialError);
  const [isPending, startTransition] = useTransition();

  const handleCancellation = () => {
    if (!booking) return;

    setError(null);

    startTransition(async () => {
      const result = await cancelUpdatedBooking(booking.id);

      if (!result.success) {
        setError(result.message || "Something went wrong.");
        return;
      }

      setCancelled(true);
    });
  };

  const formattedDate = booking
    ? new Date(
        `${booking.appointmentDate}T00:00:00`,
      ).toLocaleDateString("en-PH", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const formattedTime = booking?.appointmentTime
    ? booking.appointmentTime.slice(0, 5)
    : "";

  const bookingUrl = booking
    ? `/book-an-appointment?clinic=${encodeURIComponent(booking.clinicId)}`
    : "/";

  return (
    <main className="min-h-screen bg-[#F3F6F3] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-[#E5EBE5] p-6 sm:p-8">

        {/* Cancelled state */}
        {cancelled ? (
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F1E9]">
              <svg
                className="h-8 w-8 text-[#52765E]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-semibold text-[#34483A]">
              Your appointment has been cancelled.
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Your appointment is no longer reserved.
              If you would still like to visit the clinic,
              please book another appointment.
            </p>

            <a
              href={bookingUrl}
              className="mt-7 inline-flex w-full items-center justify-center rounded-lg bg-[#52765E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#405E49]"
            >
              Book Another Appointment
            </a>

            <p className="mt-5 text-xs text-gray-400">
              Powered by Medora
            </p>
          </div>
        ) : (
          /* Confirmation state */
          <div>
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#FDF3E7]">
                <svg
                  className="h-8 w-8 text-[#B77936]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  />
                </svg>
              </div>

              <h1 className="text-2xl font-semibold text-[#34483A]">
                Decline appointment changes?
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                Are you sure you want to cancel your updated appointment?
              </p>
            </div>

            {booking && (
              <div className="mt-6 rounded-xl bg-[#F5F8F5] p-5">
                <h2 className="mb-3 text-sm font-semibold text-[#34483A]">
                  Appointment Details
                </h2>

                <p className="text-sm text-gray-700">
                  <span className="font-medium">Patient:</span>{" "}
                  {booking.patientName}
                </p>

                <p className="mt-2 text-sm text-gray-700">
                  <span className="font-medium">Service:</span>{" "}
                  {booking.serviceName}
                </p>

                <p className="mt-2 text-sm text-gray-700">
                  <span className="font-medium">Date:</span>{" "}
                  {formattedDate}
                </p>

                <p className="mt-2 text-sm text-gray-700">
                  <span className="font-medium">Time:</span>{" "}
                  {formattedTime}
                </p>
              </div>
            )}

            <div className="mt-5 rounded-lg border border-[#F0E2CE] bg-[#FFFAF3] p-4">
              <p className="text-sm leading-6 text-[#805D35]">
                If you cancel, your appointment will no longer be reserved.
                You will need to book a new appointment if you still wish
                to visit the clinic.
              </p>
            </div>

            {error && (
              <div className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {booking && !initialError && (
              <button
                type="button"
                onClick={handleCancellation}
                disabled={isPending}
                className="mt-6 w-full rounded-lg bg-[#52765E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#405E49] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending
                  ? "Cancelling Appointment..."
                  : "Confirm Cancellation"}
              </button>
            )}

            <p className="mt-5 text-center text-xs text-gray-400">
              Powered by Medora
            </p>
          </div>
        )}
      </div>
    </main>
  );
}