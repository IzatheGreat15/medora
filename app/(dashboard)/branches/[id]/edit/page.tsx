"use client";

import { Suspense, type FormEvent, type ReactNode, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Check,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Save,
  Trash2,
  Users,
} from "lucide-react";
import DoctorsTable, { DoctorTableItem } from "@/components/doctor/DoctorsTable";

type BranchStatus = "Active" | "Inactive";
type BranchForm = {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  status: BranchStatus;
  openingHours: Record<string, { open: boolean; start: string; end: string }>;
};

const defaultHours = {
  Monday: { open: true, start: "09:00", end: "17:00" },
  Tuesday: { open: true, start: "09:00", end: "17:00" },
  Wednesday: { open: true, start: "09:00", end: "17:00" },
  Thursday: { open: true, start: "09:00", end: "17:00" },
  Friday: { open: true, start: "09:00", end: "17:00" },
  Saturday: { open: true, start: "09:00", end: "13:00" },
  Sunday: { open: false, start: "09:00", end: "17:00" },
};

const branchData: Record<string, Omit<BranchForm, "openingHours">> = {
  "branch-cebu": { id: "branch-cebu", name: "Cebu Branch", code: "CEB-001", address: "Cebu City, Cebu", phone: "+63 32 123 4567", email: "cebu@example.com", status: "Active" },
  "branch-mandaue": { id: "branch-mandaue", name: "Mandaue Branch", code: "MAN-002", address: "Mandaue City, Cebu", phone: "+63 32 234 5678", email: "mandaue@example.com", status: "Active" },
  "branch-lapu-lapu": { id: "branch-lapu-lapu", name: "Lapu-Lapu Branch", code: "LLC-003", address: "Lapu-Lapu City, Cebu", phone: "+63 32 345 6789", email: "lapulapu@example.com", status: "Inactive" },
};

const sampleDoctors: DoctorTableItem[] = [
  { id: "doctor-maria-santos", name: "Dr. Maria Santos", specialty: "General Practitioner", email: "maria.santos@example.com", phone: "+63 917 123 4567", status: "Active", branches: ["Cebu Branch", "Mandaue Branch"] },
  { id: "doctor-angela-reyes", name: "Dr. Angela Reyes", specialty: "Dermatologist", email: "angela.reyes@example.com", phone: "+63 918 234 5678", status: "Active", branches: ["Cebu Branch"] },
  { id: "doctor-john-cruz", name: "Dr. John Cruz", specialty: "Dentist", email: "john.cruz@example.com", phone: "+63 919 345 6789", status: "Inactive", branches: ["Cebu Branch"] },
  { id: "doctor-paolo-lim", name: "Dr. Paolo Lim", specialty: "Pediatrician", email: "paolo.lim@example.com", phone: "+63 920 456 7890", status: "Active", branches: ["Mandaue Branch"] },
];

function Field({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">{icon}{label}</span>
      {children}
    </label>
  );
}

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#82A995] focus:ring-4 focus:ring-[#DDF3E7]";

export default function EditBranchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl animate-pulse space-y-6 pb-10">
          <div className="h-8 w-48 rounded-lg bg-slate-200" />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-80 rounded-2xl bg-white" />
            <div className="h-80 rounded-2xl bg-white" />
          </div>
          <div className="h-48 rounded-2xl bg-white" />
        </div>
      }
    >
      <EditBranchForm />
    </Suspense>
  );
}

function EditBranchForm() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const branchId = Array.isArray(params.id) ? params.id[0] : params.id;
  const initialBranch = branchData[branchId];
  const [form, setForm] = useState<BranchForm | null>(() => initialBranch ? { ...initialBranch, openingHours: structuredClone(defaultHours) } : null);
  const [savedMessage, setSavedMessage] = useState("");

  const doctors = useMemo(() => {
    if (!form) return [];
    return sampleDoctors.filter((doctor) => doctor.branches?.includes(form.name));
  }, [form]);

  if (!form) {
    return (
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <Building2 className="mx-auto h-8 w-8 text-slate-400" />
        <h2 className="mt-3 text-xl font-bold text-[#173F35]">Branch not found</h2>
        <p className="mt-1 text-sm text-slate-500">This branch isn't in the current sample data.</p>
        <button onClick={() => router.push("/branches")} className="mt-5 rounded-xl bg-[#176B55] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#125744]">Back to branches</button>
      </div>
    );
  }

  function updateField<K extends keyof BranchForm>(key: K, value: BranchForm[K]) {
    setForm((current) => current ? { ...current, [key]: value } : current);
    setSavedMessage("");
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Demo only: persist to your database/API when the backend is connected.
    setSavedMessage("Branch details saved in this demo session.");
  }

  function handleRemoveDoctorFromBranch(doctor: DoctorTableItem) {
    alert('Remove doctor from branch');
  }

  function handleHoursChange(day: string, key: "open" | "start" | "end", value: boolean | string) {
    setForm((current) => {
      if (!current) return current;
      return {
        ...current,
        openingHours: {
          ...current.openingHours,
          [day]: { ...current.openingHours[day], [key]: value },
        },
      };
    });
    setSavedMessage("");
  }

  function handleDeleteBranch() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this branch? This action cannot be undone.",
    );

    if (!confirmed) return;

    // Call your delete API or server action here.
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10">
      {savedMessage && <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"><Check className="h-4 w-4" />{savedMessage}</div>}

      <form id="branch-edit-form" onSubmit={handleSave} className="space-y-6 flex flex-col md:flex-row gap-6">
        <section className="rounded-2xl w-full md:w-1/2 border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DDF3E7] text-[#176B55]"><Building2 className="h-5 w-5" /></div>
            <div><h2 className="font-semibold text-[#173F35]">Branch details</h2><p className="mt-1 text-sm text-slate-500">The basic information patients use to identify and contact this location.</p></div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Branch name *" icon={<Building2 className="h-4 w-4 text-slate-400" />}><input required value={form.name} onChange={(e) => updateField("name", e.target.value)} className={inputClass} placeholder="e.g. Cebu Branch" /></Field>
            <Field label="Branch code" icon={<Building2 className="h-4 w-4 text-slate-400" />}><input value={form.code} readOnly className={`${inputClass} bg-slate-50 text-slate-500`} /><span className="mt-1.5 block text-xs text-slate-400">Branch code is read-only.</span></Field>
            <div className="sm:col-span-2"><Field label="Address *" icon={<MapPin className="h-4 w-4 text-slate-400" />}><input required value={form.address} onChange={(e) => updateField("address", e.target.value)} className={inputClass} placeholder="Street, city, province" /></Field></div>
            <Field label="Contact phone *" icon={<Phone className="h-4 w-4 text-slate-400" />}><input required type="tel" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} className={inputClass} placeholder="+63..." /></Field>
            <Field label="Contact email" icon={<Mail className="h-4 w-4 text-slate-400" />}><input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} className={inputClass} placeholder="branch@clinic.com" /></Field>
            <Field label="Branch status" icon={<Check className="h-4 w-4 text-slate-400" />}>
              <select value={form.status} onChange={(e) => updateField("status", e.target.value as BranchStatus)} className={inputClass}><option value="Active">Active</option><option value="Inactive">Inactive</option></select>
            </Field>
          </div>
        </section>

        <section className="rounded-2xl w-full md:w-1/2 border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DDF3E7] text-[#176B55]"><Clock3 className="h-5 w-5" /></div>
            <div><h2 className="font-semibold text-[#173F35]">Opening hours</h2><p className="mt-1 text-sm text-slate-500">Set the hours this branch is open to patients. Doctor schedules are managed separately.</p></div>
          </div>
          <div className="divide-y divide-slate-100">
            {Object.entries(form.openingHours).map(([day, hours]) => (
              <div key={day} className="grid gap-3 py-3 sm:grid-cols-[140px_100px_1fr] sm:items-center">
                <span className={`text-sm font-medium ${hours.open ? "text-slate-700" : "text-slate-400"}`}>{day}</span>
                <label className="inline-flex w-fit cursor-pointer items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" checked={hours.open} onChange={(e) => handleHoursChange(day, "open", e.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-[#176B55]" />
                  Open
                </label>
                {hours.open ? <div className="flex items-center gap-2"><input aria-label={`${day} opening time`} type="time" value={hours.start} onChange={(e) => handleHoursChange(day, "start", e.target.value)} className={`${inputClass} max-w-[150px]`} /><span className="text-sm text-slate-400">to</span><input aria-label={`${day} closing time`} type="time" value={hours.end} onChange={(e) => handleHoursChange(day, "end", e.target.value)} className={`${inputClass} max-w-[150px]`} /></div> : <span className="text-sm text-slate-400">Closed</span>}
              </div>
            ))}
          </div>
        </section>
      </form>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDeleteBranch}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
          <button form="branch-edit-form" type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#176B55] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#125744] focus:outline-none focus:ring-4 focus:ring-[#DDF3E7]">
            <Save className="h-4 w-4" /> Save changes
          </button>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2"><Users className="h-5 w-5 text-[#176B55]" /><h2 className="text-lg font-semibold text-[#173F35]">Doctors at this branch</h2></div>
            <p className="mt-1 text-sm text-slate-500">Doctors assigned to this location. Open a doctor to manage their profile, services, and schedule.</p>
          </div>
          <button type="button" onClick={() => router.push("/doctors")} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#82A995] hover:text-[#176B55]">Manage doctors</button>
        </div>
        <DoctorsTable
          doctors={doctors}
          title="Doctors at this branch"
          description="Manage doctors assigned to this location."
          emptyMessage="Assign doctors to this branch to see them here."
          onDoctorEdit={(doctor) =>
            router.push(`/doctors/${doctor.id}/edit`)
          }
          onDoctorDelete={(doctor) =>
            handleRemoveDoctorFromBranch(doctor)
          }
        />
      </section>
    </div>
  );
}
