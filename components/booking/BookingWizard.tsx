'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarCheck2, Leaf } from 'lucide-react';
import BookingProgress from './BookingProgress';
import BookingSummary from './BookingSummary';
import BranchStep from './steps/BranchStep';
import ServiceStep from './steps/ServiceStep';
import DoctorStep from './steps/DoctorStep';
import DateTimeStep from './steps/DateTimeStep';
import PatientDetailsStep from './steps/PatientDetailsStep';
import ReviewStep from './steps/ReviewStep';
import { branches, doctors, services } from '@/lib/booking/mock-data';
import type { BookingState } from '@/lib/booking/types';

const initialState: BookingState = {
  branchId: '',
  serviceId: '',
  doctorId: '',
  date: '',
  time: '',
  patient: { fullName: '', email: '', phone: '', notes: '' },
};

export default function BookingWizard() {
  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState<BookingState>(initialState);
  const [submitted, setSubmitted] = useState(false);

  const branch = branches.find((item) => item.id === booking.branchId);
  const service = services.find((item) => item.id === booking.serviceId);
  const doctor = doctors.find((item) => item.id === booking.doctorId);

  const availableDoctors = useMemo(
    () =>
      doctors.filter(
        (item) =>
          (!booking.branchId || item.branchIds.includes(booking.branchId)) &&
          (!booking.serviceId || item.serviceIds.includes(booking.serviceId)),
      ),
    [booking.branchId, booking.serviceId],
  );

  const update = (patch: Partial<BookingState>) => {
    setBooking((current) => ({ ...current, ...patch }));
  };

  const changeBranch = (branchId: string) => {
    const nextDoctors = doctors.filter(
      (item) =>
        item.branchIds.includes(branchId) &&
        (!booking.serviceId || item.serviceIds.includes(booking.serviceId)),
    );

    update({
      branchId,
      doctorId: nextDoctors.some((item) => item.id === booking.doctorId)
        ? booking.doctorId
        : '',
    });
  };

  const changeService = (serviceId: string) => {
    const nextDoctors = doctors.filter(
      (item) =>
        item.serviceIds.includes(serviceId) &&
        (!booking.branchId || item.branchIds.includes(booking.branchId)),
    );

    update({
      serviceId,
      doctorId: nextDoctors.some((item) => item.id === booking.doctorId)
        ? booking.doctorId
        : '',
    });
  };

  const canContinue = () => {
    if (step === 1) return Boolean(booking.branchId);
    if (step === 2) return Boolean(booking.serviceId);
    if (step === 3) return Boolean(booking.doctorId);
    if (step === 4) return Boolean(booking.date && booking.time);
    if (step === 5) {
      return Boolean(
        booking.patient.fullName.trim() &&
          /^\S+@\S+\.\S+$/.test(booking.patient.email.trim()) &&
          booking.patient.phone.trim(),
      );
    }
    return true;
  };

  const next = () => {
    if (!canContinue()) return;
    if (step < 6) setStep((current) => current + 1);
    else setSubmitted(true);
  };

  const resetBooking = () => {
    setBooking(initialState);
    setStep(1);
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#F7F9F6] px-4 py-8 sm:px-6 sm:py-12">
        <section className="mx-auto w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#DDF3E7] text-[#176B55]">
            <CalendarCheck2 size={30} />
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-[#173F35] sm:text-3xl">
            Your booking details are ready
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500 sm:text-base">
            Thank you for trusting us with your health and well-being! We look forward to welcoming you and providing you with the care you deserve.
          </p>
          <div className="mt-7 space-y-1 rounded-2xl border border-slate-100 bg-[#F7F9F6] p-5 text-left">
            <p className="font-semibold text-slate-900">{service?.name}</p>
            <p className="text-sm text-slate-600">{branch?.name} · {doctor?.name}</p>
            <p className="text-sm text-slate-600">{booking.date} · {booking.time}</p>
            <p className="text-sm text-slate-600">Patient: {booking.patient.fullName}</p>
            <p className="text-sm text-slate-600">Email: {booking.patient.email}</p>
          </div>
          <button
            type="button"
            onClick={resetBooking}
            className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#176B55] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#125642] focus:outline-none focus:ring-2 focus:ring-[#176B55] focus:ring-offset-2"
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
          <a href="/" className="flex w-fit items-center gap-2.5 rounded-lg text-lg font-bold tracking-tight text-[#173F35] focus:outline-none focus:ring-2 focus:ring-[#176B55] focus:ring-offset-2">
            <img src="/full-logo.webp" className="w-36" />
          </a>
        </header>

        <BookingProgress currentStep={step} />

        <div className="grid min-w-0 grid-cols-1 items-start gap-5 p-3 sm:gap-6 sm:p-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6 lg:p-8">
          <section className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 lg:p-7">
            <div className="min-w-0">
              {step === 1 && (
                <BranchStep branches={branches} selectedId={booking.branchId} onSelect={changeBranch} />
              )}
              {step === 2 && (
                <ServiceStep services={services} selectedId={booking.serviceId} onSelect={changeService} />
              )}
              {step === 3 && (
                <DoctorStep doctors={availableDoctors} selectedId={booking.doctorId} onSelect={(doctorId) => update({ doctorId })} />
              )}
              {step === 4 && (
                <DateTimeStep
                  date={booking.date}
                  time={booking.time}
                  onDateChange={(date) => update({ date })}
                  onTimeChange={(time) => update({ time })}
                />
              )}
              {step === 5 && (
                <PatientDetailsStep patient={booking.patient} onChange={(patient) => update({ patient })} />
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
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => step === 1 ? window.location.assign('/') : setStep((current) => current - 1)}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#176B55] focus:ring-offset-2 sm:w-auto"
              >
                <ArrowLeft size={16} />
                {step === 1 ? 'Cancel' : 'Back'}
              </button>
              <button
                type="button"
                onClick={next}
                disabled={!canContinue()}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#176B55] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#125642] focus:outline-none focus:ring-2 focus:ring-[#176B55] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                {step === 6 ? 'Confirm booking' : step === 5 ? 'Review booking' : 'Continue'}
                <ArrowRight size={16} />
              </button>
            </div>
            {!canContinue() && (
              <p className="mt-3 text-right text-xs text-slate-400">
                Complete the required selection or fields to continue.
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

        <footer className="border-t border-slate-100 px-5 py-4 text-center text-xs text-slate-400 flex gap-2 w-full justify-center">
          Appointment booking made simple · Powered by <img src="/full-logo.webp" className="w-16" />
        </footer>
      </div>
    </main>
  );
}
