
"use client";

import {
  Suspense,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
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

type DoctorStatus = "Active" | "Inactive";

type DoctorForm = {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  licenseNumber: string;
  status: DoctorStatus;
  bio: string;
};

type Branch = {
  id: string;
  name: string;
  address: string;
};

type Service = {
  id: string;
  name: string;
  defaultPrice: number;
  defaultDuration: number;
};

type ServiceAssignment = {
  branchId: string;
  serviceId: string;
  assigned: boolean;
  priceOverride: string;
  durationOverride: string;
};

const branches: Branch[] = [
  {
    id: "branch-cebu",
    name: "Cebu Branch",
    address: "Cebu City, Cebu",
  },
  {
    id: "branch-mandaue",
    name: "Mandaue Branch",
    address: "Mandaue City, Cebu",
  },
  {
    id: "branch-lapu-lapu",
    name: "Lapu-Lapu Branch",
    address: "Lapu-Lapu City, Cebu",
  },
];

const services: Service[] = [
  {
    id: "service-general",
    name: "General Consultation",
    defaultPrice: 500,
    defaultDuration: 30,
  },
  {
    id: "service-followup",
    name: "Follow-up Consultation",
    defaultPrice: 350,
    defaultDuration: 20,
  },
  {
    id: "service-physical",
    name: "Physical Examination",
    defaultPrice: 800,
    defaultDuration: 45,
  },
];

const doctorData: Record<string, DoctorForm> = {
  "doctor-maria-santos": {
    id: "doctor-maria-santos",
    name: "Dr. Maria Santos",
    specialty: "General Practitioner",
    email: "maria.santos@example.com",
    phone: "+63 917 123 4567",
    licenseNumber: "PRC-1234567",
    status: "Active",
    bio: "General practitioner focused on accessible, patient-centered care.",
  },
  "doctor-angela-reyes": {
    id: "doctor-angela-reyes",
    name: "Dr. Angela Reyes",
    specialty: "Dermatologist",
    email: "angela.reyes@example.com",
    phone: "+63 918 234 5678",
    licenseNumber: "PRC-2345678",
    status: "Active",
    bio: "",
  },
};

const initialBranchIds: Record<string, string[]> = {
  "doctor-maria-santos": ["branch-cebu", "branch-mandaue"],
  "doctor-angela-reyes": ["branch-cebu"],
};

const initialAssignments: Record<string, ServiceAssignment[]> = {
  "doctor-maria-santos": [
    {
      branchId: "branch-cebu",
      serviceId: "service-general",
      assigned: true,
      priceOverride: "",
      durationOverride: "",
    },
    {
      branchId: "branch-cebu",
      serviceId: "service-followup",
      assigned: true,
      priceOverride: "400",
      durationOverride: "",
    },
    {
      branchId: "branch-cebu",
      serviceId: "service-physical",
      assigned: true,
      priceOverride: "",
      durationOverride: "60",
    },
    {
      branchId: "branch-mandaue",
      serviceId: "service-general",
      assigned: true,
      priceOverride: "600",
      durationOverride: "",
    },
  ],
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-[#263B33] outline-none transition placeholder:text-slate-400 focus:border-[#82A995] focus:ring-4 focus:ring-[#DDF3E7]";

const labelClass =
  "mb-2 block text-sm font-medium text-slate-700";

const cardClass =
  "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
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
      className="mx-auto max-w-7xl animate-pulse space-y-6 pb-10"
      aria-label="Loading doctor details"
    >
      <div className="h-5 w-32 rounded bg-slate-200" />
      <div className="h-24 rounded-2xl bg-white" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
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

  const initialDoctor = doctorData[doctorId];

  const [form, setForm] = useState<DoctorForm | null>(() =>
    initialDoctor ? { ...initialDoctor } : null
  );

  const [branchIds, setBranchIds] = useState<string[]>(
    () => initialBranchIds[doctorId] ?? []
  );

  const [assignments, setAssignments] = useState<
    ServiceAssignment[]
  >(() => initialAssignments[doctorId] ?? []);

  const [savedMessage, setSavedMessage] = useState("");

  const selectedBranches = useMemo(
    () => branches.filter((branch) => branchIds.includes(branch.id)),
    [branchIds]
  );

  function updateField<K extends keyof DoctorForm>(
    key: K,
    value: DoctorForm[K]
  ) {
    setForm((current) =>
      current ? { ...current, [key]: value } : current
    );
    setSavedMessage("");
  }

  function toggleBranch(branchId: string) {
    setBranchIds((current) => {
      const next = current.includes(branchId)
        ? current.filter((id) => id !== branchId)
        : [...current, branchId];

      return next;
    });

    setSavedMessage("");
  }

  function updateAssignment(
    branchId: string,
    serviceId: string,
    patch: Partial<ServiceAssignment>
  ) {
    setAssignments((current) => {
      const exists = current.some(
        (item) =>
          item.branchId === branchId &&
          item.serviceId === serviceId
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
          : item
      );
    });

    setSavedMessage("");
  }

  function getAssignment(
    branchId: string,
    serviceId: string
  ) {
    return assignments.find(
      (item) =>
        item.branchId === branchId &&
        item.serviceId === serviceId
    ) ?? {
      branchId,
      serviceId,
      assigned: false,
      priceOverride: "",
      durationOverride: "",
    };
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Demo only. Replace with your API or Supabase mutations.
    setSavedMessage(
      "Doctor details saved in this demo session."
    );
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
          This doctor does not exist in the current demo data.
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

  const assignedServiceCount = assignments.filter(
    (item) => item.assigned && branchIds.includes(item.branchId)
  ).length;

  return (
    <form
      onSubmit={handleSave}
      className="mx-auto max-w-7xl space-y-6 pb-10"
    >
      {savedMessage && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
        >
          <Check className="h-4 w-4" />
          {savedMessage}
        </div>
      )}

      {/* Profile summary */}
      <section className="rounded-2xl border border-[#DDE9E1] bg-gradient-to-r from-[#F0F8F2] via-white to-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#176B55] text-xl font-bold text-white">
            {form.name
              .replace(/^Dr\.\s*/i, "")
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
                {branchIds.length} branches
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                {assignedServiceCount} service assignments
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Profile + branch assignments */}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
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
                onChange={(e) =>
                  updateField("specialty", e.target.value)
                }
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
                    updateField("status", e.target.value as DoctorStatus)
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

        <section className={cardClass}>
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DDF3E7] text-[#176B55]">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-[#173F35]">
                Branch assignments
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Select where this doctor accepts appointments.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {branches.map((branch) => {
              const checked = branchIds.includes(branch.id);

              return (
                <label
                  key={branch.id}
                  className={`flex cursor-pointer gap-3 rounded-xl border p-3.5 transition ${
                    checked
                      ? "border-[#82A995] bg-[#F0F8F2]"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleBranch(branch.id)}
                    className="mt-1 h-4 w-4 accent-[#176B55]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-[#173F35]">
                      {branch.name}
                    </span>
                    <span className="mt-1 flex items-start gap-1.5 text-xs leading-5 text-slate-500">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {branch.address}
                    </span>
                  </span>
                  {checked && (
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#176B55]" />
                  )}
                </label>
              );
            })}
          </div>

          {branchIds.length === 0 && (
            <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
              Assign at least one branch before enabling appointment booking.
            </p>
          )}
        </section>
      </div>

      {/* Service assignments */}
      <section className={cardClass}>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DDF3E7] text-[#176B55]">
              <Clock3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-[#173F35]">
                Services and consultation rates
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                Choose which services this doctor provides at each assigned
                branch. Leave overrides empty to use the service defaults.
              </p>
            </div>
          </div>
        </div>

        {selectedBranches.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 px-5 py-10 text-center">
            <Building2 className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-700">
              No branches selected
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Select a branch above to configure services.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {selectedBranches.map((branch) => (
              <div
                key={branch.id}
                className="overflow-hidden rounded-xl border border-slate-200"
              >
                <div className="flex items-center gap-3 border-b border-slate-200 bg-[#F7F9F6] px-4 py-3.5">
                  <Building2 className="h-4 w-4 text-[#176B55]" />
                  <div>
                    <h3 className="text-sm font-semibold text-[#173F35]">
                      {branch.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Configure this doctor’s services at this location.
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {services.map((service) => {
                    const assignment = getAssignment(
                      branch.id,
                      service.id
                    );

                    return (
                      <div
                        key={service.id}
                        className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_145px_145px] lg:items-center"
                      >
                        <label className="flex cursor-pointer items-start gap-3">
                          <input
                            type="checkbox"
                            checked={assignment.assigned}
                            onChange={(e) =>
                              updateAssignment(branch.id, service.id, {
                                assigned: e.target.checked,
                              })
                            }
                            className="mt-1 h-4 w-4 accent-[#176B55]"
                          />
                          <span>
                            <span className="block text-sm font-semibold text-slate-800">
                              {service.name}
                            </span>
                            <span className="mt-1 block text-xs text-slate-500">
                              Default: ₱{service.defaultPrice.toLocaleString()}{" "}
                              · {service.defaultDuration} min
                            </span>
                          </span>
                        </label>

                        <Field label="Price override (₱)">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            disabled={!assignment.assigned}
                            value={assignment.priceOverride}
                            onChange={(e) =>
                              updateAssignment(branch.id, service.id, {
                                priceOverride: e.target.value,
                              })
                            }
                            placeholder={`${service.defaultPrice}`}
                            className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400`}
                          />
                        </Field>

                        <Field label="Duration override">
                          <div className="relative">
                            <input
                              type="number"
                              min="1"
                              step="1"
                              disabled={!assignment.assigned}
                              value={assignment.durationOverride}
                              onChange={(e) =>
                                updateAssignment(branch.id, service.id, {
                                  durationOverride: e.target.value,
                                })
                              }
                              placeholder={`${service.defaultDuration}`}
                              className={`${inputClass} pr-12 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400`}
                            />
                            <span className="pointer-events-none absolute right-3 top-3 text-xs text-slate-400">
                              min
                            </span>
                          </div>
                        </Field>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="mt-4 rounded-xl bg-[#F0F8F2] p-3.5 text-xs leading-5 text-[#53645D]">
          <strong className="text-[#176B55]">How overrides work:</strong>{" "}
          Empty fields use the service’s default price and duration.
          Overrides apply only to this doctor at the selected branch.
        </p>
      </section>

      {/* Bottom actions */}
      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-400">
          Changes are local to this demo until database persistence is connected.
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
            Save changes
          </button>
        </div>
      </div>
    </form>
  );
}
