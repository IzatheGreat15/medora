"use client";
import { Suspense, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { Branch, BranchSchedule, DayKey, DoctorForm, DoctorStatus, getDoctorEditData, saveDoctorEdit, Service, ServiceAssignment, WorkingHourRule } from "./actions";
import {
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Save,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";
import Toast from "@/components/shared/Toast";
const days: { key: DayKey; label: string; short: string }[] = [
  { key: "monday", label: "Monday", short: "Mon" },
  { key: "tuesday", label: "Tuesday", short: "Tue" },
  { key: "wednesday", label: "Wednesday", short: "Wed" },
  { key: "thursday", label: "Thursday", short: "Thu" },
  { key: "friday", label: "Friday", short: "Fri" },
  { key: "saturday", label: "Saturday", short: "Sat" },
  { key: "sunday", label: "Sunday", short: "Sun" },
];
let ruleCounter = 0;
function createRule(
  selectedDays: DayKey[] = [],
  startTime = "08:30",
  endTime = "17:00",
): WorkingHourRule {
  ruleCounter += 1;
  return {
    id: `hours-${Date.now()}-${ruleCounter}`,
    selectedDays,
    startTime,
    endTime,
  };
}
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-[#263B33] outline-none transition placeholder:text-slate-400 focus:border-[#82A995] focus:ring-4 focus:ring-[#DDF3E7] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";
const labelClass = "mb-2 block text-sm font-medium text-slate-700";
const cardClass =
  "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6";
function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}
function LoadingDoctorForm() {
  return (
    <div
      className="mx-auto animate-pulse space-y-6 pb-10"
      aria-label="Loading doctor details"
    >
      <div className="h-5 w-32 rounded bg-slate-200" />
      <div className="h-24 rounded-2xl bg-white" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)\_340px]">
        <div className="h-80 rounded-2xl bg-white" />
        <div className="h-80 rounded-2xl bg-white" />
      </div>
      <div className="h-96 rounded-2xl bg-white" />
    </div>
  );
}
export default function EditDoctorPage() {
  return (
    <Suspense fallback={<LoadingDoctorForm />}>
      <EditDoctorForm />
    </Suspense>
  );
}
function EditDoctorForm() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const doctorId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;
  const [form, setForm] = useState<DoctorForm | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [schedules, setSchedules] = useState<BranchSchedule[]>([]);
  const [assignments, setAssignments] = useState<ServiceAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  useEffect(() => {
    let cancelled = false;
    async function loadDoctor() {
      setIsLoading(true);
      try {
        const data = await getDoctorEditData(doctorId);
        if (cancelled) return;
        setForm(data.doctor);
        setBranches(data.branches);
        setServices(data.services);
        setSchedules(data.schedules.map((schedule) => ({
          ...schedule,
          rules: schedule.rules.map((rule) => ({ ...rule, id: createRule(rule.selectedDays, rule.startTime, rule.endTime).id })),
        })));
        setAssignments(data.assignments);
      } catch (error) {
        if (!cancelled) {
          setForm(null);
          setSavedMessage(error instanceof Error ? error.message : "Unable to load doctor details.");
          setMessageType("error");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    void loadDoctor();
    return () => { cancelled = true; };
  }, [doctorId]);
  const assignedBranchIds = useMemo(
    () => [...new Set(schedules.map((schedule) => schedule.branchId))],
    [schedules],
  );
  function updateField<K extends keyof DoctorForm>(
    key: K,
    value: DoctorForm[K],
  ) {
    setForm((current) =>
      current ? { ...current, [key]: value } : current,
    );
    setSavedMessage("");
  }
  function toggleBranch(branchId: string) {
    setSchedules((current) => {
      const existing = current.find(
        (schedule) => schedule.branchId === branchId,
      );
      if (existing) {
        return current.filter(
          (schedule) => schedule.branchId !== branchId,
        );
      }
      return [
        ...current,
        {
          branchId,
          rules: [createRule()],
        },
      ];
    });
    setSavedMessage("");
  }
  function updateRule(
    branchId: string,
    ruleId: string,
    patch: Partial<WorkingHourRule>,
  ) {
    setSchedules((current) =>
      current.map((schedule) =>
        schedule.branchId === branchId
          ? {
              ...schedule,
              rules: schedule.rules.map((rule) =>
                rule.id === ruleId
                  ? { ...rule, ...patch }
                  : rule,
              ),
            }
          : schedule,
      ),
    );
    setSavedMessage("");
  }
  function addWorkingHours(branchId: string) {
    setSchedules((current) =>
      current.map((schedule) =>
        schedule.branchId === branchId
          ? {
              ...schedule,
              rules: [...schedule.rules, createRule()],
            }
          : schedule,
      ),
    );
    setSavedMessage("");
  }
  function removeWorkingHours(
    branchId: string,
    ruleId: string,
  ) {
    setSchedules((current) =>
      current.map((schedule) =>
        schedule.branchId === branchId
          ? {
              ...schedule,
              rules: schedule.rules.filter(
                (rule) => rule.id !== ruleId,
              ),
            }
          : schedule,
      ),
    );
    setSavedMessage("");
  }
  function updateAssignment(
    branchId: string,
    serviceId: string,
    patch: Partial<ServiceAssignment>,
  ) {
    setAssignments((current) => {
      const exists = current.some(
        (item) =>
          item.branchId === branchId &&
          item.serviceId === serviceId,
      );
      if (!exists) {
        return [
          ...current,
          {
            branchId,
            serviceId,
            assigned: true,
            priceOverride: "",
            durationOverride: "",
            ...patch,
          },
        ];
      }
      return current.map((item) =>
        item.branchId === branchId &&
        item.serviceId === serviceId
          ? { ...item, ...patch }
          : item,
      );
    });
    setSavedMessage("");
  }
  function getAssignment(
    branchId: string,
    serviceId: string,
  ): ServiceAssignment {
    return (
      assignments.find(
        (item) =>
          item.branchId === branchId &&
          item.serviceId === serviceId,
      ) ?? {
        branchId,
        serviceId,
        assigned: false,
        priceOverride: "",
        durationOverride: "",
      }
    );
  }
  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;
    const invalidSchedule = schedules.some((schedule) =>
      schedule.rules.some((rule) => rule.selectedDays.length > 0 && rule.startTime >= rule.endTime),
    );
    const missingDays = schedules.some((schedule) =>
      schedule.rules.some((rule) => rule.selectedDays.length === 0),
    );
    const invalidOverride = assignments.some((item) => item.assigned && (
      (item.priceOverride.trim() !== "" && (!Number.isFinite(Number(item.priceOverride)) || Number(item.priceOverride) < 0)) ||
      (item.durationOverride.trim() !== "" && (!Number.isInteger(Number(item.durationOverride)) || Number(item.durationOverride) <= 0))
    ));
    if (invalidSchedule || missingDays || invalidOverride) {
      setMessageType("error");
      setSavedMessage(invalidSchedule
        ? "Please ensure each working-hours rule ends later than it starts."
        : missingDays
          ? "Please select at least one day for each working-hours rule."
          : "Please enter a valid non-negative rate and a positive whole-number duration.");
      return;
    }
    setIsSaving(true);
    setSavedMessage("");
    try {
      await saveDoctorEdit({ doctor: form, schedules, assignments });
      setMessageType("success");
      setSavedMessage("Doctor profile, branch hours, and service assignments saved successfully.");
      router.refresh();
    } catch (error) {
      setMessageType("error");
      setSavedMessage(error instanceof Error ? error.message : "Unable to save doctor changes.");
    } finally {
      setIsSaving(false);
    }
  }
  if (isLoading) {
    return <LoadingDoctorForm />;
  }
  if (!form) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DDF3E7] text-[#176B55]">
          <UserRound className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-[#173F35]">
          Doctor not found
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {savedMessage || "This doctor could not be found in your clinic."}
        </p>
        <button
          type="button"
          onClick={() => router.push("/doctors")}
          className="mt-5 rounded-xl bg-[#176B55] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#125744]"
        >
          Back to doctors
        </button>
      </div>
    );
  }
  const enabledDayCount = schedules.reduce(
    (count, schedule) =>
      count +
      schedule.rules.reduce(
        (total, rule) => total + rule.selectedDays.length,
        0,
      ),
    0,
  );
  const assignedServiceCount = assignments.filter(
    (item) =>
      item.assigned &&
      assignedBranchIds.includes(item.branchId),
  ).length;
  return (
    <form
      onSubmit={handleSave}
      className="mx-auto space-y-6 pb-10"
    >
      {savedMessage && (
        <Toast
          message={savedMessage}
          type={messageType}
          onClose={() => setSavedMessage("")}
        />
      )}
      {/* Doctor summary */}
      <section className="rounded-2xl border border-[#DDE9E1] bg-gradient-to-r from-[#F0F8F2] via-white to-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#176B55] text-xl font-bold text-white">
            {form.name
              .replace(/^Dr\.?\s*/i, "")
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0])
              .join("")
              .toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-[#173F35]">
              {form.name || "Doctor name"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {form.specialty || "Specialty not set"}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                {assignedBranchIds.length} branches
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                {enabledDayCount} scheduled branch-days
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Stethoscope className="h-4 w-4" />
                {assignedServiceCount} service assignments
              </span>
            </div>
          </div>
        </div>
      </section>
      {/* Personal information */}
      <section className={cardClass}>
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DDF3E7] text-[#176B55]">
            <UserRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-[#173F35]">
              Personal information
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              The doctor’s profile and contact details.
            </p>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name *">
            <input
              required
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className={inputClass}
              placeholder="e.g. Dr. Maria Santos"
            />
          </Field>
          <Field label="Specialty *">
            <input
              required
              value={form.specialty}
              onChange={(e) => updateField("specialty", e.target.value)}
              className={inputClass}
              placeholder="e.g. General Practitioner"
            />
          </Field>
          <Field label="Email address *">
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className={`${inputClass} pl-10`}
                placeholder="doctor@clinic.com"
              />
            </div>
          </Field>
          <Field label="Phone number">
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className={`${inputClass} pl-10`}
                placeholder="+63 917 000 0000"
              />
            </div>
          </Field>
          <Field label="PRC license number">
            <input
              value={form.licenseNumber}
              onChange={(e) =>
                updateField("licenseNumber", e.target.value)
              }
              className={inputClass}
              placeholder="License number"
            />
          </Field>
          <Field label="Account status">
            <div className="relative">
              <select
                value={form.status}
                onChange={(e) =>
                  updateField(
                    "status",
                    e.target.value as DoctorStatus,
                  )
                }
                className={`${inputClass} appearance-none pr-10`}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Short biography">
              <textarea
                rows={4}
                value={form.bio}
                onChange={(e) => updateField("bio", e.target.value)}
                className={inputClass}
                placeholder="Introduce the doctor to patients..."
              />
            </Field>
          </div>
        </div>
      </section>
      {/* Branch assignments */}
      <section className={cardClass}>
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DDF3E7] text-[#176B55]">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-[#173F35]">
              Branch assignments
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Enable a branch to configure its working hours and
              services directly underneath it.
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {branches.map((branch) => {
            const checked = assignedBranchIds.includes(branch.id);
            const schedule = schedules.find(
              (item) => item.branchId === branch.id,
            );
            return (
              <div
                key={branch.id}
                className={`overflow-hidden rounded-2xl border transition ${
                  checked
                    ? "border-[#B8D8C7]"
                    : "border-slate-200"
                }`}
              >
                <label
                  className={`flex cursor-pointer items-center gap-3 p-4 ${
                    checked
                      ? "bg-[#F0F8F2]"
                      : "bg-white hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleBranch(branch.id)}
                    className="h-4 w-4 accent-[#176B55]"
                  />
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#176B55] ring-1 ring-slate-200">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-[#173F35]">
                      {branch.name}
                    </span>
                    <span className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5" />
                      {branch.address}
                    </span>
                  </span>
                  {checked ? (
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#176B55] ring-1 ring-[#B8D8C7]">
                      Enabled
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">
                      Disabled
                    </span>
                  )}
                </label>
                {checked && schedule && (
                  <div className="border-t border-[#DDE9E1] p-4 sm:p-5">
                    <div className="grid gap-6 xl:grid-cols-2">
                      {/* Working hours */}
                      <div className="min-w-0">
                        <div className="mb-4 flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#DDF3E7] text-[#176B55]">
                            <Clock3 className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-[#173F35]">
                              Working hours
                            </h3>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              Set the days and times this doctor works
                              at {branch.name}.
                            </p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          {schedule.rules.map((rule, ruleIndex) => (
                            <div
                              key={rule.id}
                              className="rounded-xl border border-[#DDE9E1] bg-white p-4"
                            >
                              <div className="mb-3 flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold text-[#173F35]">
                                  Working hours {ruleIndex + 1}
                                </p>
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeWorkingHours(
                                      branch.id,
                                      rule.id,
                                    )
                                  }
                                  className="text-xs font-medium text-rose-600 hover:text-rose-700"
                                >
                                  Remove
                                </button>
                              </div>
                              <p className="mb-2 text-xs font-medium text-slate-500">
                                Select days
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {days.map(({ key, short }) => {
                                  const selected =
                                    rule.selectedDays.includes(key);
                                  return (
                                    <label
                                      key={key}
                                      className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium ${
                                        selected
                                          ? "border-[#82A995] bg-[#F0F8F2] text-[#176B55]"
                                          : "border-slate-200 text-slate-500 hover:bg-slate-50"
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={selected}
                                        onChange={(e) =>
                                          updateRule(
                                            branch.id,
                                            rule.id,
                                            {
                                              selectedDays: e.target
                                                .checked
                                                ? [
                                                    ...rule.selectedDays,
                                                    key,
                                                  ]
                                                : rule.selectedDays.filter(
                                                    (day) =>
                                                      day !== key,
                                                  ),
                                            },
                                          )
                                        }
                                        className="h-3.5 w-3.5 accent-[#176B55]"
                                      />
                                      {short}
                                    </label>
                                  );
                                })}
                              </div>
                              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <Field label="Start time">
                                  <input
                                    type="time"
                                    required
                                    value={rule.startTime}
                                    onChange={(e) =>
                                      updateRule(
                                        branch.id,
                                        rule.id,
                                        {
                                          startTime: e.target.value,
                                        },
                                      )
                                    }
                                    className={inputClass}
                                  />
                                </Field>
                                <Field label="End time">
                                  <input
                                    type="time"
                                    required
                                    value={rule.endTime}
                                    onChange={(e) =>
                                      updateRule(
                                        branch.id,
                                        rule.id,
                                        {
                                          endTime: e.target.value,
                                        },
                                      )
                                    }
                                    className={inputClass}
                                  />
                                </Field>
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              addWorkingHours(branch.id)
                            }
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#82A995] bg-[#F8FCF9] px-4 py-3 text-sm font-semibold text-[#176B55] transition hover:bg-[#F0F8F2]"
                          >
                            <span className="text-lg leading-none">
                              +
                            </span>
                            Add new working hours
                          </button>
                        </div>
                        <div className="mt-3 rounded-xl bg-[#F0F8F2] p-3 text-xs leading-5 text-[#53645D]">
                          {schedule.rules.some(
                            (rule) => rule.selectedDays.length > 0,
                          )
                            ? schedule.rules
                                .filter(
                                  (rule) =>
                                    rule.selectedDays.length > 0,
                                )
                                .map(
                                  (rule) =>
                                    `${rule.selectedDays
                                      .map(
                                        (dayKey) =>
                                          days.find(
                                            (day) =>
                                              day.key === dayKey,
                                          )?.short,
                                      )
                                      .join(", ")} ${rule.startTime}–${rule.endTime}`,
                                )
                                .join(" · ")
                            : "No working hours configured for this branch yet."}
                        </div>
                      </div>
                      {/* Services */}
                      <div className="min-w-0">
                        <div className="mb-4 flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#DDF3E7] text-[#176B55]">
                            <Stethoscope className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-[#173F35]">
                              Services at {branch.name}
                            </h3>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              Assign services for this branch. Leave
                              overrides blank to use default values.
                            </p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {services.map((service) => {
                            const assignment = getAssignment(
                              branch.id,
                              service.id,
                            );
                            return (
                              <div
                                key={service.id}
                                className={`rounded-xl border p-3.5 ${
                                  assignment.assigned
                                    ? "border-[#B8D8C7] bg-white"
                                    : "border-slate-200 bg-slate-50/50"
                                }`}
                              >
                                <label className="flex cursor-pointer items-start gap-3">
                                  <input
                                    type="checkbox"
                                    checked={assignment.assigned}
                                    onChange={(e) =>
                                      updateAssignment(
                                        branch.id,
                                        service.id,
                                        {
                                          assigned: e.target.checked,
                                        },
                                      )
                                    }
                                    className="mt-1 h-4 w-4 accent-[#176B55]"
                                  />
                                  <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-semibold text-slate-800">
                                      {service.name}
                                    </span>
                                    <span className="mt-1 block text-xs text-slate-500">
                                      Default: ₱
                                      {service.defaultPrice.toLocaleString()}
                                      {" · "}
                                      {service.defaultDuration} min
                                    </span>
                                    {assignment.assigned && (
                                      <span className="mt-1 block text-xs font-medium text-[#176B55]">
                                        Applied: ₱
                                        {assignment.priceOverride.trim()
                                          ? Number(
                                              assignment.priceOverride,
                                            ).toLocaleString()
                                          : service.defaultPrice.toLocaleString()}
                                        {" · "}
                                        {assignment.durationOverride.trim()
                                          ? Number(
                                              assignment.durationOverride,
                                            )
                                          : service.defaultDuration}{" "}
                                        min
                                      </span>
                                    )}
                                  </span>
                                </label>
                                {assignment.assigned && (
                                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <Field label="Rate override (₱)">
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={assignment.priceOverride}
                                        onChange={(e) =>
                                          updateAssignment(
                                            branch.id,
                                            service.id,
                                            {
                                              priceOverride:
                                                e.target.value,
                                            },
                                          )
                                        }
                                        placeholder={`Default ₱${service.defaultPrice}`}
                                        className={inputClass}
                                      />
                                    </Field>
                                    <Field label="Duration override (min)">
                                      <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={
                                          assignment.durationOverride
                                        }
                                        onChange={(e) =>
                                          updateAssignment(
                                            branch.id,
                                            service.id,
                                            {
                                              durationOverride:
                                                e.target.value,
                                            },
                                          )
                                        }
                                        placeholder={`Default ${service.defaultDuration} min`}
                                        className={inputClass}
                                      />
                                    </Field>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {assignedBranchIds.length === 0 && (
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
            Assign at least one branch and set its working hours before
            enabling appointment booking.
          </p>
        )}
        <p className="mt-4 rounded-xl bg-[#F0F8F2] p-3.5 text-xs leading-5 text-[#53645D]">
          Each enabled branch has independent working hours and service
          assignments. Changes remain local until database persistence
          is connected.
        </p>
      </section>
      {/* Form actions  */}
      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-400">
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/doctors")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#176B55] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#125744] focus:outline-none focus:ring-4 focus:ring-[#DDF3E7]"
          >
            <Save className="h-4 w-4" />
            {isSaving ? '...Saving' : 'Save changes'}
          </button>
        </div>
      </div>
    </form>
  );
}
