
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getBookingEditOptions,
  getPendingBookingEditSlots,
  updatePendingBooking,
  type BookingEditOptions,
  type DashboardBooking,
} from "@/app/(dashboard)/bookings/actions";
import { X, Loader2, CalendarDays, Clock3 } from "lucide-react";

type Props = {
  booking: DashboardBooking;
  onClose: () => void;
  onSaved: () => Promise<void>;
  onMessage: (message: string, type: "success" | "error") => void;
};

export default function EditBookingModal({
  booking,
  onClose,
  onSaved,
  onMessage,
}: Props) {
  const [options, setOptions] = useState<BookingEditOptions | null>(null);
  const [branchId, setBranchId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState(booking.date);
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [fullName, setFullName] = useState(booking.patient);
  const [email, setEmail] = useState(booking.email);
  const [phone, setPhone] = useState(booking.phone);
  const [notes, setNotes] = useState(booking.notes);

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      try {
        const result = await getBookingEditOptions();

        if (!active) return;

        setOptions(result);

        const initialBranch = result.branches.find(
          (item) => item.name === booking.branch,
        );

        const initialService = result.services.find(
          (item) => item.name === booking.service,
        );

        const initialDoctor = result.doctors.find(
          (item) => item.name === booking.doctor,
        );

        setBranchId(initialBranch?.id ?? "");
        setServiceId(initialService?.id ?? "");
        setDoctorId(initialDoctor?.id ?? "");
      } catch (error) {
        onMessage(
          error instanceof Error ? error.message : "Unable to load booking options.",
          "error",
        );
      } finally {
        if (active) setLoadingOptions(false);
      }
    }

    void loadOptions();

    return () => {
      active = false;
    };
  }, [booking, onMessage]);

  const branchServices = useMemo(
    () =>
      options?.doctors.find((doctor) => doctor.id === doctorId)
        ?.branchServices ?? [],
    [options, doctorId],
  );

  const availableServices = useMemo(() => {
    if (!options || !branchId) return [];

    return options.services.filter((service) =>
      options.doctors.some((doctor) =>
        doctor.branchServices.some(
          (item) =>
            item.branchId === branchId &&
            item.serviceId === service.id,
        ),
      ),
    );
  }, [options, branchId]);

  const availableDoctors = useMemo(() => {
    return (
      options?.doctors.filter((doctor) =>
        doctor.branchServices.some(
          (item) =>
            item.branchId === branchId &&
            item.serviceId === serviceId,
        ),
      ) ?? []
    );
  }, [options, branchId, serviceId]);

  const selectedService = options?.services.find(
    (item) => item.id === serviceId,
  );

  const selectedDoctorService = branchServices.find(
    (item) =>
      item.branchId === branchId &&
      item.serviceId === serviceId,
  );

  const duration =
    selectedDoctorService?.durationMinutes ??
    selectedService?.durationMinutes ??
    0;

  const price =
    selectedDoctorService?.price ??
    selectedService?.price ??
    0;

  useEffect(() => {
    if (!branchId || !serviceId || !doctorId || !date) {
      setSlots([]);
      setTime("");
      return;
    }

    let active = true;

    async function loadSlots() {
      setLoadingSlots(true);
      setSlots([]);
      setTime("");

      try {
        const result = await getPendingBookingEditSlots(booking.id, {
          branchId,
          serviceId,
          doctorId,
          date,
        });

        if (active) {
          setSlots(result);
        }
      } catch (error) {
        if (active) {
          onMessage(
            error instanceof Error
              ? error.message
              : "Unable to load available times.",
            "error",
          );
        }
      } finally {
        if (active) setLoadingSlots(false);
      }
    }

    void loadSlots();

    return () => {
      active = false;
    };
  }, [booking.id, branchId, serviceId, doctorId, date, onMessage]);

  function handleBranchChange(value: string) {
    setBranchId(value);
    setServiceId("");
    setDoctorId("");
    setTime("");
  }

  function handleServiceChange(value: string) {
    setServiceId(value);
    setDoctorId("");
    setTime("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!time) {
      onMessage("Please select an available appointment time.", "error");
      return;
    }

    setSaving(true);

    try {
      await updatePendingBooking({
        bookingId: booking.id,
        branchId,
        serviceId,
        doctorId,
        date,
        time,
        patient: {
          fullName,
          email,
          phone,
          notes,
        },
      });

      onMessage("Booking updated successfully.", "success");
      await onSaved();
    } catch (error) {
      onMessage(
        error instanceof Error ? error.message : "Unable to update booking.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loadingOptions) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4">
        <div className="rounded-xl bg-white px-6 py-5 text-sm text-slate-600 shadow-xl">
          <Loader2 className="mr-2 inline animate-spin" size={17} />
          Loading booking details...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pending booking
            </p>
            <h2 className="mt-1 text-xl font-bold text-[#173F35]">
              Edit booking
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              You can make changes while this booking is pending.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close edit form"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <section>
              <h3 className="mb-3 text-sm font-semibold text-[#173F35]">
                Patient information
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-medium text-slate-600">
                    Full name
                  </span>
                  <input
                    required
                    maxLength={150}
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#176B55]"
                  />
                </label>

                <label>
                  <span className="mb-1.5 block text-sm font-medium text-slate-600">
                    Email
                  </span>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#176B55]"
                  />
                </label>

                <label>
                  <span className="mb-1.5 block text-sm font-medium text-slate-600">
                    Phone
                  </span>
                  <input
                    required
                    maxLength={40}
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#176B55]"
                  />
                </label>
              </div>
            </section>

            <section className="border-t border-slate-100 pt-5">
              <h3 className="mb-3 text-sm font-semibold text-[#173F35]">
                Appointment details
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="mb-1.5 block text-sm font-medium text-slate-600">
                    Branch
                  </span>
                  <select
                    required
                    value={branchId}
                    onChange={(event) => handleBranchChange(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#176B55]"
                  >
                    <option value="">Select branch</option>
                    {options?.branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="mb-1.5 block text-sm font-medium text-slate-600">
                    Service
                  </span>
                  <select
                    required
                    value={serviceId}
                    onChange={(event) => handleServiceChange(event.target.value)}
                    disabled={!branchId}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#176B55] disabled:bg-slate-50"
                  >
                    <option value="">Select service</option>
                    {availableServices.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-medium text-slate-600">
                    Doctor
                  </span>
                  <select
                    required
                    value={doctorId}
                    onChange={(event) => setDoctorId(event.target.value)}
                    disabled={!serviceId}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#176B55] disabled:bg-slate-50"
                  >
                    <option value="">Select doctor</option>
                    {availableDoctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-600">
                    <CalendarDays size={15} />
                    Appointment date
                  </span>
                  <input
                    required
                    type="date"
                    min={new Date().toLocaleDateString("en-CA", {
                      timeZone: "Asia/Manila",
                    })}
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#176B55]"
                  />
                </label>

                <label>
                  <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-600">
                    <Clock3 size={15} />
                    Appointment time
                  </span>
                  <select
                    required
                    value={time}
                    onChange={(event) => setTime(event.target.value)}
                    disabled={!doctorId || loadingSlots || slots.length === 0}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#176B55] disabled:bg-slate-50"
                  >
                    <option value="">
                      {loadingSlots
                        ? "Loading available times..."
                        : slots.length
                          ? "Select time"
                          : "No available times"}
                    </option>
                    {slots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {selectedService && selectedDoctorService && (
                <div className="mt-4 rounded-xl bg-[#DDF3E7]/50 p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Duration</span>
                    <strong className="text-[#173F35]">
                      {duration} minutes
                    </strong>
                  </div>
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-slate-600">Service price</span>
                    <strong className="text-[#173F35]">
                      ₱{price.toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </strong>
                  </div>
                </div>
              )}
            </section>

            <section className="border-t border-slate-100 pt-5">
              <label>
                <span className="mb-1.5 block text-sm font-medium text-slate-600">
                  Patient notes
                </span>
                <textarea
                  rows={4}
                  maxLength={1000}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#176B55]"
                  placeholder="Additional notes..."
                />
              </label>
            </section>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || loadingSlots || !time}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#176B55] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#173F35] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? "Saving changes..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
