
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Building2,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarX,
  Check,
  ChevronDown,
  CreditCard,
  Clock,
  ImagePlus,
  Mail,
  MessageSquare,
  Save,
  Upload,
  Users,
  X,
} from "lucide-react";
import StaffSection from "@/components/settings/StaffSection";
import { ClinicSubscription, getClinicSubscription } from "@/components/settings/actions";
import {
  getClinicSettings,
  saveClinicSettings,
  type ClinicNotificationPreference,
} from "@/components/settings/settings-data-actions";

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
  const [clinicName, setClinicName] = useState("");
  const [logo, setLogo] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [settingsError, setSettingsError] = useState("");
  const [notifications, setNotifications] =
    useState<NotificationEvent[]>(initialNotifications);
  const [reminderDays, setReminderDays] = useState(1);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [logoError, setLogoError] = useState("");
  const [planRequestMessage, setPlanRequestMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [subscription, setSubscription] =
    useState<ClinicSubscription | null>(null);

  const [isLoadingSubscription, setIsLoadingSubscription] =
    useState(true);

  const [subscriptionError, setSubscriptionError] =
    useState("");

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        const data = await getClinicSettings();
        if (!active) return;

        setClinicName(data.clinicName);
        setLogo(data.logo ?? "");
        setNotifications((current) =>
          current.map((item) => ({
            ...item,
            email: data.notifications[item.id] ?? item.email,
          })),
        );
        setReminderDays(data.reminderDays);
      } catch (error) {
        console.error("Failed to load clinic settings:", error);
        if (active) {
          setSettingsError(
            error instanceof Error ? error.message : "Failed to load clinic settings.",
          );
        }
      } finally {
        if (active) setIsLoadingSettings(false);
      }
    }

    loadSettings();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    async function loadSubscription() {
      try {
        const data = await getClinicSubscription();
        setSubscription(data);
      } catch (error) {
        console.error("Failed to load subscription:", error);
        setSubscriptionError(
          error instanceof Error
            ? error.message
            : "Failed to load subscription.",
        );
      } finally {
        setIsLoadingSubscription(false);
      }
    }

    loadSubscription();
  }, []);

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
    setLogoFile(file);
    setRemoveLogo(false);
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
    setSettingsError("");

    try {
      const preferences: ClinicNotificationPreference = Object.fromEntries(
        notifications.map((item) => [item.id, item.email]),
      );

      const result = await saveClinicSettings({
        clinicName,
        notifications: preferences,
        reminderDays,
        logoFile,
        removeLogo,
      });

      setLogo(result.logo ?? "");
      setLogoFile(null);
      setRemoveLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setMessage("Your clinic settings have been saved.");
    } catch (error) {
      console.error("Failed to save clinic settings:", error);
      setSettingsError(
        error instanceof Error ? error.message : "Failed to save clinic settings.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full space-y-6">
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
          disabled={isSaving || isLoadingSettings}
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

      {settingsError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {settingsError}
        </div>
      )}

      {isLoadingSettings && (
        <p className="text-sm text-slate-500">Loading clinic settings...</p>
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
                      setLogoFile(null);
                      setRemoveLogo(true);
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
                        className={`relative h-6 w-11 shrink-0 rounded-full transition focus:outline-none focus:ring-2 focus:ring-[#82A995] focus:ring-offset-2 ${item.email ? "bg-[#176B55]" : "bg-slate-200"
                          }`}
                      >
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${item.email ? "left-6" : "left-1"
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
              preferences can be configured here.
            </p>
          </div>
        </div>
      </section>

      {/* Staff section is maintained as a separate component */}
      <StaffSection />

      {/* Current subscription plan */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="space-y-5 p-5 sm:p-6">
          {isLoadingSubscription ? (
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-sm text-slate-500">
                Loading subscription...
              </p>
            </div>
          ) : subscriptionError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {subscriptionError}
            </div>
          ) : subscription?.plan ? (
            <>
              {/* Current plan */}
              <div className="flex flex-col gap-4 rounded-2xl border border-[#DDECE2] bg-[#F7F9F6] p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-[#53645D]">
                    Current plan
                  </p>

                  <h3 className="mt-1 text-2xl font-bold tracking-tight text-[#173F35]">
                    {subscription.plan.name}
                  </h3>

                  <p className="mt-1 text-sm text-[#53645D]">
                    {subscription.plan.description}
                  </p>
                </div>

                <div className="sm:text-right">
                  <p className="text-3xl font-bold tracking-tight text-[#173F35]">
                    ₱{Number(subscription.plan.price).toLocaleString("en-PH")}
                    <span className="text-sm font-medium text-[#53645D]">
                      {" "}/ {subscription.plan.billing_interval}
                    </span>
                  </p>

                  <p className="mt-1 text-xs text-[#53645D]">
                    Billed {subscription.plan.billing_interval}
                  </p>
                </div>
              </div>

              {/* Plan limits */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-xl border border-slate-200 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#DDF3E7] text-[#176B55]">
                    <Users size={18} />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Doctor limit
                    </p>

                    <p className="mt-1 font-semibold text-[#173F35]">
                      {subscription.plan.max_doctors === -1
                        ? "Unlimited doctors"
                        : `Up to ${subscription.plan.max_doctors} doctors`}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-slate-200 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#DDF3E7] text-[#176B55]">
                    <Building2 size={18} />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Branch limit
                    </p>

                    <p className="mt-1 font-semibold text-[#173F35]">
                      {subscription.plan.max_branches === -1
                        ? "Unlimited branches"
                        : `${subscription.plan.max_branches} ${subscription.plan.max_branches === 1
                          ? "branch"
                          : "branches"
                        }`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Plan features */}
              {Array.isArray(subscription.plan.features) &&
                subscription.plan.features.length > 0 && (
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-sm font-semibold text-[#173F35]">
                      Included features
                    </p>

                    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                      {subscription.plan.features.map(
                        (feature: string, index: number) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm text-slate-600"
                          >
                            <Check
                              size={16}
                              className="mt-0.5 shrink-0 text-[#176B55]"
                            />
                            {feature}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}
            </>
          ) : (
            <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-500">
              No subscription plan is assigned to this clinic.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
