"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarCheck2, HeartPulse } from "lucide-react";
import BookingProgress from "./BookingProgress";
import BookingSummary from "./BookingSummary";
import BranchStep from "./steps/BranchStep";
import ServiceStep from "./steps/ServiceStep";
import DoctorStep from "./steps/DoctorStep";
import DateTimeStep from "./steps/DateTimeStep";
import PatientDetailsStep from "./steps/PatientDetailsStep";
import ReviewStep from "./steps/ReviewStep";
import {
  createPublicBooking,
  getAvailableBookingSlots,
  type BookingOptions,
} from "@/app/book-an-appointment/actions";
import type { BookingState } from "@/lib/booking/types";

const initialState: BookingState = {
  branchId: "",
  serviceId: "",
  doctorId: "",
  date: "",
  time: "",
  patient: {
    fullName: "",
    email: "",
    phone: "",
    notes: "",
  },
};

export default function BookingWizard({
  options,
}: {
  options: BookingOptions;
}) {
  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState<BookingState>(initialState);
  const [submitted, setSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const branches = options.branches;
  const services = options.services;
  const doctors = options.doctors;

  const branch = branches.find((item) => item.id === booking.branchId);
  const selectedService = services.find((item) => item.id === booking.serviceId);
  const doctor = doctors.find((item) => item.id === booking.doctorId);

  // Only show services offered by a doctor at the selected branch.
  const availableServices = useMemo(() => {
    if (!booking.branchId) return [];

    return services.filter((service) =>
      doctors.some((candidate) =>
        candidate.branchServices.some(
          (assignment) =>
            assignment.branchId === booking.branchId &&
            assignment.serviceId === service.id,
        ),
      ),
    );
  }, [services, doctors, booking.branchId]);

  // Only show doctors offering the selected service at that branch.
  const availableDoctors = useMemo(() => {
    if (!booking.branchId || !booking.serviceId) return [];

    return doctors.filter((candidate) =>
      candidate.branchServices.some(
        (assignment) =>
          assignment.branchId === booking.branchId &&
          assignment.serviceId === booking.serviceId,
      ),
    );
  }, [doctors, booking.branchId, booking.serviceId]);

  const doctorService = doctor?.branchServices.find(
    (assignment) =>
      assignment.branchId === booking.branchId &&
      assignment.serviceId === booking.serviceId,
  );

  // Apply the selected doctor's branch-specific overrides.
  const service = selectedService
    ? {
        ...selectedService,
        price: doctorService?.price ?? selectedService.price,
        durationMinutes:
          doctorService?.durationMinutes ?? selectedService.durationMinutes,
      }
    : undefined;

  const update = (patch: Partial<BookingState>) => {
    setBooking((current) => ({ ...current, ...patch }));
    setError("");
  };

  const changeBranch = (branchId: string) => {
    update({
      branchId,
      serviceId: "",
      doctorId: "",
      date: "",
      time: "",
    });
  };

  const changeService = (serviceId: string) => {
    update({
      serviceId,
      doctorId: "",
      date: "",
      time: "",
    });
  };

  const changeDoctor = (doctorId: string) => {
    update({
      doctorId,
      date: "",
      time: "",
    });
  };

  const canContinue = () => {
    if (step === 1) return Boolean(booking.branchId);
    if (step === 2) return Boolean(booking.serviceId);
    if (step === 3) return Boolean(booking.doctorId);

    if (step === 4) {
      return Boolean(booking.date && booking.time);
    }

    if (step === 5) {
      return Boolean(
        booking.patient.fullName.trim() &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.patient.email.trim()) &&
          booking.patient.phone.trim(),
      );
    }

    return true;
  };

  const next = async () => {
    if (!canContinue() || isSubmitting) return;

    setError("");

    if (step < 6) {
      setStep((current) => current + 1);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createPublicBooking({
        clinicId: options.clinicId,
        branchId: booking.branchId,
        serviceId: booking.serviceId,
        doctorId: booking.doctorId,
        date: booking.date,
        time: booking.time,
        patient: booking.patient,
      });

      setBookingId(result.bookingId);
      setSubmitted(true);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to submit your booking. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBooking = () => {
    setBooking(initialState);
    setStep(1);
    setSubmitted(false);
    setBookingId("");
    setError("");
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#F7F9F6] px-4 py-8 sm:px-6 sm:py-12">
        <section className="mx-auto w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#DDF3E7] text-[#176B55]">
            <CalendarCheck2 size={30} />
          </div>

          <h1 className="mt-5 text-2xl font-bold tracking-tight text-[#173F35] sm:text-3xl">
            Booking request received
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500 sm:text-base">
            Thank you for booking with {options.clinicName}. Your appointment
            request has been submitted and is awaiting confirmation from the
            clinic.
          </p>

          <div className="mt-7 space-y-2 rounded-2xl border border-slate-100 bg-[#F7F9F6] p-5 text-left">
            <p className="font-semibold text-slate-900">{service?.name}</p>
            <p className="text-sm text-slate-600">
              {branch?.name} · {doctor?.name}
            </p>
            <p className="text-sm text-slate-600">
              {booking.date} · {booking.time}
            </p>
            <p className="text-sm text-slate-600">
              Patient: {booking.patient.fullName}
            </p>
            <p className="text-sm text-slate-600">Reference: {bookingId}</p>
            <p className="mt-3 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              Pending approval
            </p>
          </div>

          <button
            type="button"
            onClick={resetBooking}
            className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#176B55] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#125642]"
          >
            Make another booking
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F9F6] px-3 py-5 sm:px-6 sm:py-8 lg:py-10">
      <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm sm:rounded-3xl">
        <header className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <a
            href="/"
            className="flex min-w-0 items-center gap-3 rounded-lg text-lg font-bold tracking-tight text-[#173F35]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-white">
              {options.clinicLogoUrl ? (
                <img
                  src={options.clinicLogoUrl}
                  alt={`${options.clinicName} logo`}
                  className="h-full w-full object-contain"
                />
              ) : (
                <HeartPulse size={22} className="text-[#176B55]" />
              )}
            </span>
            <span className="truncate">{options.clinicName}</span>
          </a>

          <p className="text-sm font-medium text-slate-500">
            Book your appointment online
          </p>
        </header>

        <BookingProgress currentStep={step} />

        <div className="grid min-w-0 grid-cols-1 items-start gap-5 p-3 sm:gap-6 sm:p-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6 lg:p-8">
          <section className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 lg:p-7">
            {error && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {step === 1 && (
              <BranchStep
                branches={branches}
                selectedId={booking.branchId}
                onSelect={changeBranch}
              />
            )}

            {step === 2 && (
              <ServiceStep
                services={availableServices}
                selectedId={booking.serviceId}
                onSelect={changeService}
              />
            )}

            {step === 3 && (
              <DoctorStep
                doctors={availableDoctors}
                selectedId={booking.doctorId}
                onSelect={changeDoctor}
              />
            )}

            {step === 4 && (
              <DateTimeStep
                clinicId={options.clinicId}
                branchId={booking.branchId}
                serviceId={booking.serviceId}
                doctorId={booking.doctorId}
                date={booking.date}
                time={booking.time}
                onDateChange={(date) => update({ date, time: "" })}
                onTimeChange={(time) => update({ time })}
                getAvailableSlots={getAvailableBookingSlots}
              />
            )}

            {step === 5 && (
              <PatientDetailsStep
                patient={booking.patient}
                onChange={(patient) => update({ patient })}
              />
            )}

            {step === 6 && (
              <ReviewStep
                branch={branch}
                service={service}
                doctor={doctor}
                date={booking.date}
                time={booking.time}
                patient={booking.patient}
              />
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setError("");

                  if (step === 1) {
                    window.location.assign("/");
                  } else {
                    setStep((current) => current - 1);
                  }
                }}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
              >
                <ArrowLeft size={16} />
                {step === 1 ? "Cancel" : "Back"}
              </button>

              <button
                type="button"
                onClick={next}
                disabled={!canContinue() || isSubmitting}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#176B55] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#125642] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                {isSubmitting
                  ? "Submitting..."
                  : step === 6
                    ? "Confirm booking"
                    : step === 5
                      ? "Review booking"
                      : "Continue"}
                {!isSubmitting && <ArrowRight size={16} />}
              </button>
            </div>

            {!canContinue() && (
              <p className="mt-3 text-right text-xs text-slate-400">
                Complete the required selections or fields to continue.
              </p>
            )}
          </section>

          <div className="min-w-0 lg:sticky lg:top-6">
            <BookingSummary
              branch={branch}
              service={service}
              doctor={doctor}
              date={booking.date}
              time={booking.time}
              patientName={booking.patient.fullName}
            />
          </div>
        </div>

        <footer className="flex w-full justify-center gap-2 border-t border-slate-100 px-5 py-4 text-center text-xs text-slate-400">
          Appointment booking made simple · Powered by
          <img
            src="/full-logo.webp"
            alt="Medora"
            className="w-16"
          />
        </footer>
      </div>
    </main>
  );
}