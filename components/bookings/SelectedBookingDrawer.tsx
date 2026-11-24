
"use client";

import { useState } from "react";
import type { DashboardBooking } from "@/app/(dashboard)/bookings/actions";
import {
  CalendarDays,
  Clock3,
  Check,
  X,
  Phone,
  Mail,
  Building2,
  Stethoscope,
  ClipboardList,
  StickyNote,
  Pencil,
} from "lucide-react";

type BookingStatus = "Pending" | "Confirmed" | "Declined" | "Completed";

type SelectedBookingDrawerProps = {
  booking: DashboardBooking;
  isUpdatingStatus: boolean;
  onClose: () => void;
  onEdit: (booking: DashboardBooking) => void;
  onUpdateStatus: (
    booking: DashboardBooking,
    status: "Confirmed" | "Declined",
  ) => void;
};

function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getStatusClasses(status: BookingStatus) {
  switch (status) {
    case "Pending":
      return "bg-amber-50 text-amber-700 ring-amber-600/20";
    case "Confirmed":
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
    case "Declined":
      return "bg-rose-50 text-rose-700 ring-rose-600/20";
    case "Completed":
      return "bg-slate-100 text-slate-600 ring-slate-500/20";
  }
}

function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusClasses(status)}`}
    >
      {status}
    </span>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DDF3E7] text-[#176B55]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-[#173F35]">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function SelectedBookingDrawer({
  booking,
  isUpdatingStatus,
  onClose,
  onEdit,
  onUpdateStatus,
}: SelectedBookingDrawerProps) {
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);

  const handleDecline = () => {
    onUpdateStatus(booking, "Declined");
    setShowDeclineModal(false);
  };

  const handleApprove = () => {
    onUpdateStatus(booking, "Confirmed");
    setShowApproveModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Drawer backdrop */}
      <button
        type="button"
        aria-label="Close booking details"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]"
      />

      {/* Booking drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-detail-title"
        className="relative flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Booking details
            </p>

            <h3
              id="booking-detail-title"
              className="mt-1 text-xl font-bold text-[#173F35]"
            >
              {booking.patient}
            </h3>

            <p className="mt-1 text-sm text-slate-500">{booking.id}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Booking details */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-slate-500">
              Booking status
            </span>
            <StatusBadge status={booking.status} />
          </div>

          {/* Patient information */}
          <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Patient information
            </p>

            <p className="mt-3 font-semibold text-[#173F35]">
              {booking.patient}
            </p>

            <div className="mt-3 space-y-2">
              <p className="flex items-center gap-2 break-all text-sm text-slate-600">
                <Mail size={15} className="shrink-0 text-slate-400" />
                {booking.email || "No email provided"}
              </p>

              <p className="flex items-center gap-2 text-sm text-slate-600">
                <Phone size={15} className="shrink-0 text-slate-400" />
                {booking.phone || "No phone provided"}
              </p>
            </div>
          </section>

          {/* Appointment information */}
          <section>
            <h4 className="font-semibold text-[#173F35]">
              Appointment information
            </h4>

            <div className="mt-4 space-y-5">
              <DetailRow
                icon={<CalendarDays size={19} />}
                label="Date"
                value={formatDate(booking.date)}
              />

              <DetailRow
                icon={<Clock3 size={19} />}
                label="Time"
                value={`${formatTime(booking.time)} · ${booking.duration} minutes`}
              />

              <DetailRow
                icon={<Building2 size={19} />}
                label="Branch"
                value={booking.branch}
              />

              <DetailRow
                icon={<Stethoscope size={19} />}
                label="Doctor"
                value={booking.doctor}
              />

              <DetailRow
                icon={<ClipboardList size={19} />}
                label="Service"
                value={booking.service}
              />
            </div>
          </section>

          {/* Patient notes */}
          <section>
            <div className="flex items-center gap-2">
              <StickyNote size={17} className="text-[#176B55]" />
              <h4 className="font-semibold text-[#173F35]">
                Patient notes
              </h4>
            </div>

            <div className="mt-3 rounded-xl border border-slate-200 p-4 text-sm leading-6 text-slate-600">
              {booking.notes || "No notes provided."}
            </div>
          </section>
        </div>

        {/* Footer actions */}
        <div className="border-t border-slate-100 bg-white px-6 py-5">
          {booking.status === "Pending" ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                {/* Decline */}
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => setShowDeclineModal(true)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X size={17} />
                  Decline
                </button>

                {/* Edit */}
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => onEdit(booking)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#176B55]/30 px-4 py-3 text-sm font-semibold text-[#176B55] transition hover:bg-[#DDF3E7]/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Pencil size={17} />
                  Edit
                </button>

                {/* Approve */}
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => setShowApproveModal(true)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#176B55] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#173F35] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Check size={17} />
                  Approve
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-[#176B55] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#173F35]"
            >
              Done
            </button>
          )}

          <p className="mt-3 text-center text-xs text-slate-400">
            Booking changes are saved to your clinic.
          </p>
        </div>
      </aside>

      {/* Decline confirmation modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-[2px]">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="decline-modal-title"
            aria-describedby="decline-modal-description"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <X size={24} />
            </div>

            <h3
              id="decline-modal-title"
              className="mt-4 text-lg font-bold text-[#173F35]"
            >
              Decline this booking?
            </h3>

            <p
              id="decline-modal-description"
              className="mt-2 text-sm leading-6 text-slate-500"
            >
              Are you sure you want to decline this appointment request from{" "}
              <span className="font-semibold text-slate-700">
                {booking.patient}
              </span>
              ? The booking status will be updated and the patient will be
              notified.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => setShowDeclineModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={handleDecline}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={16} />
                {isUpdatingStatus ? "Declining..." : "Yes, decline booking"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve confirmation modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-[2px]">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="approve-modal-title"
            aria-describedby="approve-modal-description"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Check size={24} />
            </div>

            <h3
              id="approve-modal-title"
              className="mt-4 text-lg font-bold text-[#173F35]"
            >
              Approve this booking?
            </h3>

            <p
              id="approve-modal-description"
              className="mt-2 text-sm leading-6 text-slate-500"
            >
              Are you sure you want to approve the appointment request from{" "}
              <span className="font-semibold text-slate-700">
                {booking.patient}
              </span>
              ? The booking status will be updated and the patient will be
              notified. Once approved, you can no longer edit the booking details.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => setShowApproveModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={handleApprove}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#176B55] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#173F35] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check size={16} />
                {isUpdatingStatus ? "Approving..." : "Yes, approve booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
