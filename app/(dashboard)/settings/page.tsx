
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Building2,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  Check,
  ChevronDown,
  Clock,
  ImagePlus,
  Mail,
  MessageSquare,
  Save,
  Upload,
  X,
} from "lucide-react";
import StaffSection from "@/components/settings/StaffSection";

type NotificationEvent = {
  id: string;
  title: string;
  description: string;
  icon: typeof CalendarCheck;
  email: boolean;
};

type ClinicSettings = {
  clinicName: string;
  logo: string;
};

const initialNotifications: NotificationEvent[] = [
  {
    id: "booking_received",
    title: "Booking received",
    description: "Notify patients when their booking request is received.",
    icon: CalendarCheck,
    email: true,
  },
  {
    id: "booking_confirmed",
    title: "Booking confirmed",
    description: "Notify patients when their appointment is approved.",
    icon: Check,
    email: true,
  },
  {
    id: "booking_cancelled",
    title: "Booking cancelled",
    description: "Notify patients when their appointment is cancelled.",
    icon: CalendarX,
    email: true,
  },
  {
    id: "booking_rescheduled",
    title: "Booking rescheduled",
    description: "Send the updated appointment date and time.",
    icon: CalendarClock,
    email: true,
  },
  {
    id: "appointment_reminder",
    title: "Appointment reminder",
    description: "Remind patients before their scheduled appointment.",
    icon: Bell,
    email: true,
  },
];

const reminderOptions = [
  { label: "1 day before", value: 1 },
  { label: "2 days before", value: 2 },
  { label: "3 days before", value: 3 },
  { label: "7 days before", value: 7 },
];

export default function SettingsPage() {
  const [clinicName, setClinicName] = useState("Medora Family Clinic");
  const [logo, setLogo] = useState("");
  const [notifications, setNotifications] =
    useState<NotificationEvent[]>(initialNotifications);
  const [reminderDays, setReminderDays] = useState(1);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [logoError, setLogoError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (logo.startsWith("blob:")) {
        URL.revokeObjectURL(logo);
      }
    };
  }, [logo]);

  const reminderEnabled =
    notifications.find((item) => item.id === "appointment_reminder")
      ?.email ?? false;

  function handleLogoChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setLogoError("");

    if (!file.type.startsWith("image/")) {
      setLogoError("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setLogoError("The logo must be 2 MB or smaller.");
      event.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setLogo(previewUrl);
    setMessage("");
  }

  function toggleEmail(eventId: string) {
    setNotifications((current) =>
      current.map((item) =>
        item.id === eventId
          ? { ...item, email: !item.email }
          : item,
      ),
    );
    setMessage("");
  }

  async function handleSave() {
    setIsSaving(true);
    setMessage("");

    try {
      // TODO: Persist clinic information, logo, notification preferences,
      // and reminderDays to Supabase.
      // Upload the selected logo to Supabase Storage before saving its URL.

      await new Promise((resolve) => setTimeout(resolve, 300));

      setMessage(
        "Changes are ready in this preview. Connect Supabase to save them permanently.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Page heading */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#173F35] sm:text-3xl">
            Settings
          </h1>
          <p className="mt-1 text-sm text-[#53645D]">
            Manage your clinic information, notifications, and staff.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#176B55] px-5 text-sm font-semibold text-white transition hover:bg-[#173F35] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={17} />
          {isSaving ? "Saving..." : "Save changes"}
        </button>
      </div>

      {message && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-xl border border-[#B9DCC8] bg-[#DDF3E7] p-4 text-sm text-[#173F35]"
        >
          <Check size={18} className="mt-0.5 shrink-0" />
          <p>{message}</p>
        </div>
      )}

      {/* Clinic information */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-start gap-3 border-b border-slate-100 p-5 sm:p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DDF3E7] text-[#176B55]">
            <Building2 size={21} />
          </div>

          <div>
            <h2 className="font-semibold text-[#173F35]">
              Clinic information
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Customize how your clinic appears to patients.
            </p>
          </div>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          {/* Logo */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-[#F7F9F6]">
              {logo ? (
                <img
                  src={logo}
                  alt="Clinic logo preview"
                  className="h-full w-full object-contain"
                />
              ) : (
                <ImagePlus size={30} className="text-[#82A995]" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#173F35]">
                Clinic logo
              </p>
              <p className="mt-1 text-sm text-slate-500">
                This logo can be used on your booking page and patient
                notifications.
              </p>
              <p className="mt-1 text-xs text-slate-400">
                PNG, JPG, or WebP · Maximum 2 MB
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleLogoChange}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-medium text-[#173F35] transition hover:bg-slate-50"
                >
                  <Upload size={16} />
                  Upload logo
                </button>

                {logo && (
                  <button
                    type="button"
                    onClick={() => {
                      setLogo("");
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                      setMessage("");
                    }}
                    className="text-sm font-medium text-slate-500 transition hover:text-red-600"
                  >
                    Remove logo
                  </button>
                )}
              </div>

              {logoError && (
                <p className="mt-2 text-sm text-red-600">{logoError}</p>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Clinic name */}
          <div className="max-w-xl space-y-2">
            <label
              htmlFor="clinicName"
              className="block text-sm font-semibold text-[#173F35]"
            >
              Clinic name
            </label>
            <input
              id="clinicName"
              type="text"
              value={clinicName}
              onChange={(event) => {
                setClinicName(event.target.value);
                setMessage("");
              }}
              placeholder="Enter your clinic name"
              maxLength={120}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#82A995] focus:ring-2 focus:ring-[#DDF3E7]"
            />
            <p className="text-xs text-slate-400">
              This name identifies your clinic throughout Medora.
            </p>
          </div>
        </div>
      </section>

      {/* Notification settings */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-start gap-3 border-b border-slate-100 p-5 sm:p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DDF3E7] text-[#176B55]">
            <Bell size={21} />
          </div>

          <div>
            <h2 className="font-semibold text-[#173F35]">
              Notification settings
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose how patients receive appointment updates.
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* Channel headings */}
          <div className="grid grid-cols-[minmax(0,1fr)_64px_100px] items-center gap-2 border-b border-slate-100 px-2 pb-3 sm:grid-cols-[minmax(0,1fr)_88px_120px] sm:gap-4 sm:px-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Notification event
            </span>
            <span className="text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
              Email
            </span>
            <span className="text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
              SMS
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {notifications.map((item) => {
              const Icon = item.icon;
              const isReminder = item.id === "appointment_reminder";

              return (
                <div key={item.id}>
                  <div className="grid grid-cols-[minmax(0,1fr)_64px_100px] items-center gap-2 px-2 py-4 sm:grid-cols-[minmax(0,1fr)_88px_120px] sm:gap-4 sm:px-3">
                    <div className="flex min-w-0 items-start gap-2.5 sm:gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#DDF3E7] text-[#176B55]">
                        <Icon size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#173F35]">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Email switch */}
                    <div className="flex justify-center">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={item.email}
                        aria-label={`${item.title}: email notifications`}
                        onClick={() => toggleEmail(item.id)}
                        className={`relative h-6 w-11 shrink-0 rounded-full transition focus:outline-none focus:ring-2 focus:ring-[#82A995] focus:ring-offset-2 ${
                          item.email ? "bg-[#176B55]" : "bg-slate-200"
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
                            item.email ? "left-6" : "left-1"
                          }`}
                        />
                      </button>
                    </div>

                    {/* SMS unavailable in Phase 1 */}
                    <div className="flex justify-center">
                      <span className="rounded-md bg-slate-100 px-2 py-1.5 text-center text-[10px] font-medium leading-tight text-slate-500 sm:text-xs">
                        Coming soon
                      </span>
                    </div>
                  </div>

                  {/* Reminder timing */}
                  {isReminder && reminderEnabled && (
                    <div className="mb-4 ml-0 rounded-xl border border-[#DDECE2] bg-[#F7F9F6] p-4 sm:ml-12">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#176B55]">
                          <Clock size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <label
                            htmlFor="reminderDays"
                            className="block text-sm font-semibold text-[#173F35]"
                          >
                            Send reminder
                          </label>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            Choose how far in advance to email the patient.
                          </p>

                          <div className="relative mt-3 max-w-xs">
                            <select
                              id="reminderDays"
                              value={reminderDays}
                              onChange={(event) => {
                                setReminderDays(Number(event.target.value));
                                setMessage("");
                              }}
                              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-700 outline-none focus:border-[#82A995] focus:ring-2 focus:ring-[#DDF3E7]"
                            >
                              {reminderOptions.map((option) => (
                                <option
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown
                              size={16}
                              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
            <MessageSquare size={16} className="mt-0.5 shrink-0" />
            <p>
              SMS notifications are planned for a future release. Email
              preferences can be configured here, but actual delivery
              requires an email provider and notification backend.
            </p>
          </div>
        </div>
      </section>

      {/* Staff section is maintained as a separate component */}
      <StaffSection />
    </div>
  );
}
