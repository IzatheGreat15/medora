
"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  LoaderCircle,
} from "lucide-react";

import type {
  AvailableBookingSlotsInput,
} from "@/app/book-an-appointment/actions";

type DateTimeStepProps = {
  clinicId: string;
  branchId: string;
  serviceId: string;
  doctorId: string;
  date: string;
  time: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  getAvailableSlots: (
    input: AvailableBookingSlotsInput,
  ) => Promise<string[]>;
};

export default function DateTimeStep({
  clinicId,
  branchId,
  serviceId,
  doctorId,
  date,
  time,
  onDateChange,
  onTimeChange,
  getAvailableSlots,
}: DateTimeStepProps) {
  const [slots, setSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const today = new Date();

  const minDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  useEffect(() => {
    let cancelled = false;

    if (
      !date ||
      !clinicId ||
      !branchId ||
      !serviceId ||
      !doctorId
    ) {
      setSlots([]);
      setLoadError("");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError("");

    getAvailableSlots({
      clinicId,
      branchId,
      serviceId,
      doctorId,
      date,
    })
      .then((available) => {
        if (!cancelled) {
          setSlots(available);

          if (time && !available.includes(time)) {
            onTimeChange("");
          }
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setSlots([]);

          setLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load available times. Please try again.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    clinicId,
    branchId,
    serviceId,
    doctorId,
    date,
    getAvailableSlots,
  ]);

  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Step 4 of 6
      </p>

      <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Pick a date and time
      </h1>

      <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
        Choose an available appointment slot based on the doctor&apos;s schedule.
      </p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <label
          htmlFor="appointment-date"
          className="flex items-center gap-2 font-semibold text-slate-900"
        >
          <CalendarDays
            size={18}
            className="shrink-0 text-[#176B55]"
          />
          Appointment date
        </label>

        <input
          id="appointment-date"
          type="date"
          min={minDate}
          value={date}
          onChange={(event) => {
            onDateChange(event.target.value);
            onTimeChange("");
          }}
          className="mt-3 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-[#176B55] focus:ring-2 focus:ring-[#176B55]/15 sm:max-w-sm"
        />

        <div className="mt-7 flex items-center gap-2 font-semibold text-slate-900">
          <Clock3
            size={18}
            className="shrink-0 text-[#176B55]"
          />
          Available times
        </div>

        {!date ? (
          <p className="mt-3 rounded-lg bg-[#F7F9F6] px-3 py-3 text-sm leading-5 text-slate-500">
            Select a date to view available times.
          </p>
        ) : isLoading ? (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#F7F9F6] px-3 py-4 text-sm text-slate-500">
            <LoaderCircle size={17} className="animate-spin" />
            Checking the doctor&apos;s availability…
          </div>
        ) : loadError ? (
          <p
            role="alert"
            className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700"
          >
            {loadError}
          </p>
        ) : slots.length ? (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {slots.map((slot) => {
              const selected = time === slot;

              return (
                <button
                  key={slot}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onTimeChange(slot)}
                  className={`min-w-0 rounded-xl border px-2 py-3 text-sm font-medium transition sm:px-3 ${
                    selected
                      ? "border-[#176B55] bg-[#176B55] text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-[#82A995] hover:bg-[#F7F9F6]"
                  }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="mt-3 rounded-lg bg-[#F7F9F6] px-3 py-3 text-sm leading-5 text-slate-500">
            No available times for this date. Please choose another date.
          </p>
        )}
      </div>
    </section>
  );
}
