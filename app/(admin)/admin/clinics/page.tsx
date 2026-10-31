"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Building2,
  Mail,
  Phone,
  Users,
  Check,
  CalendarDays,
  UserRound,
  Send,
  LoaderCircle,
} from "lucide-react";

type ClinicStatus = "Trial" | "Active" | "Inactive" | "Past due";

type SubscriptionPlan = {
  id: string;
  name: string;
  price: number;
  maxDoctors: number;
  maxBranches: number;
};

type Clinic = {
  id: string;
  name: string;
  email: string;
  phone: string;
  planId: string;
  status: ClinicStatus;
  trialEndsAt: string;
  doctorCount: number;
  branchCount: number;
  administrator: {
    firstName: string;
    lastName: string;
    email: string;
  };
};

type ClinicForm = {
  name: string;
  email: string;
  phone: string;
  planId: string;
  status: ClinicStatus;
  trialEndsAt: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
};

const statusOptions: ClinicStatus[] = [
  "Trial",
  "Active",
  "Inactive",
  "Past due",
];

const emptyForm: ClinicForm = {
  name: "",
  email: "",
  phone: "",
  planId: "",
  status: "Trial",
  trialEndsAt: "",
  adminFirstName: "",
  adminLastName: "",
  adminEmail: "",
};

function getStatusClasses(status: ClinicStatus) {
  switch (status) {
    case "Active":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "Trial":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "Past due":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "Inactive":
      return "border-slate-200 bg-slate-100 text-slate-600";
  }
}

export default function ClinicsPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [toast, setToast] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Clinic | null>(null);

  const [form, setForm] = useState<ClinicForm>(emptyForm);
  const [sendInvitation, setSendInvitation] = useState(true);
  const [error, setError] = useState("");

  const loadClinics = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const response = await fetch("/api/admin/clinics", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to load clinics.");
      }

      setClinics(result.clinics ?? []);
      setPlans(result.plans ?? []);
    } catch (loadError) {
      setPageError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load clinics.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadClinics();
  }, [loadClinics]);

  useEffect(() => {
    if (!toast) return;

    const timeout = window.setTimeout(() => setToast(""), 4000);

    return () => window.clearTimeout(timeout);
  }, [toast]);

  const filteredClinics = useMemo(() => {
    const query = search.trim().toLowerCase();

    return clinics.filter((clinic) => {
      const matchesSearch =
        clinic.name.toLowerCase().includes(query) ||
        clinic.email.toLowerCase().includes(query) ||
        clinic.id.toLowerCase().includes(query) ||
        clinic.administrator.email.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" || clinic.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [clinics, search, statusFilter]);

  const selectedPlan = plans.find((plan) => plan.id === form.planId);

  function updateField<K extends keyof ClinicForm>(
    key: K,
    value: ClinicForm[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function openAddModal() {
    setEditingClinic(null);
    setForm({
      ...emptyForm,
      planId: plans[0]?.id ?? "",
    });
    setSendInvitation(true);
    setError("");
    setModalOpen(true);
  }

  function openEditModal(clinic: Clinic) {
    setEditingClinic(clinic);

    setForm({
      name: clinic.name,
      email: clinic.email,
      phone: clinic.phone,
      planId: clinic.planId,
      status: clinic.status,
      trialEndsAt: clinic.trialEndsAt,
      adminFirstName: clinic.administrator.firstName,
      adminLastName: clinic.administrator.lastName,
      adminEmail: clinic.administrator.email,
    });

    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingClinic(null);
    setError("");
  }

  async function saveClinic(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.planId) {
      setError("Please complete all required clinic fields.");
      return;
    }

    if (form.status === "Trial" && !form.trialEndsAt) {
      setError("Please select an end date for the trial.");
      return;
    }

    if (!editingClinic) {
      if (
        !form.adminFirstName.trim() ||
        !form.adminLastName.trim() ||
        !form.adminEmail.trim()
      ) {
        setError("Please complete all administrator details.");
        return;
      }
    }

    setSaving(true);

    try {
      const payload = {
        ...(editingClinic ? { id: editingClinic.id } : {}),
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        planId: form.planId,
        status: form.status,
        trialEndsAt: form.status === "Trial" ? form.trialEndsAt : null,
        ...(!editingClinic
          ? {
            adminFirstName: form.adminFirstName.trim(),
            adminLastName: form.adminLastName.trim(),
            adminEmail: form.adminEmail.trim(),
            sendInvitation,
          }
          : {}),
      };

      const response = await fetch("/api/admin/clinics", {
        method: editingClinic ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to save the clinic.");
      }

      const wasEditing = Boolean(editingClinic);

      await loadClinics();
      closeModal();

      setToast(
        wasEditing
          ? "Clinic updated successfully."
          : sendInvitation
            ? "Clinic created. Administrator invitation sent."
            : "Clinic created successfully.",
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save the clinic.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteClinic() {
    if (!deleteTarget) return;

    setPageError("");
    setSaving(true);

    try {
      const response = await fetch(
        `/api/admin/clinics?id=${encodeURIComponent(deleteTarget.id)}`,
        { method: "DELETE" },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to deactivate clinic.");
      }

      const deletedName = deleteTarget.name;

      setDeleteTarget(null);
      await loadClinics();
      setToast(`${deletedName} has been deactivated.`);
    } catch (deleteError) {
      setPageError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to deactivate clinic.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div
          role="status"
          className="fixed right-4 top-4 z-[100] rounded-xl bg-[#173F35] px-5 py-3 text-sm font-medium text-white shadow-lg"
        >
          {toast}
          <button
            type="button"
            onClick={() => setToast("")}
            aria-label="Dismiss notification"
            className="ml-4"
          >
            ×
          </button>
        </div>
      )}

      {pageError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {pageError}
          <button
            type="button"
            onClick={() => void loadClinics()}
            className="ml-3 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="rounded-[20px] border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
          <LoaderCircle
            className="mx-auto animate-spin text-[#176B55]"
            size={26}
          />
          Loading clinics...
        </div>
      ) : clinics.length === 0 ? (
        <div className="rounded-[20px] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <Building2 className="mx-auto mb-3 text-slate-400" size={28} />

          <p className="font-semibold text-[#173F35]">No clinics yet</p>

          <p className="mt-1 text-sm text-slate-500">
            Add your first clinic to get started.
          </p>

          <button
            type="button"
            onClick={openAddModal}
            className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#176B55] px-4 text-sm font-semibold text-white transition hover:bg-[#125642] focus:outline-none focus:ring-4 focus:ring-[#176B55]/20"
          >
            <Plus size={18} strokeWidth={2} />
            Add clinic
          </button>
        </div>
      ) : (
        <>
          {/* Clinics table */}
          <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-[#173F35]">
                  {filteredClinics.length}
                </span>{" "}
                {filteredClinics.length === 1 ? "clinic" : "clinics"} found
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search
                    size={18}
                    strokeWidth={1.8}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search..."
                    aria-label="Search clinics"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#176B55] focus:ring-2 focus:ring-[#176B55]/10 sm:w-[230px]"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  aria-label="Filter clinics by status"
                  className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#176B55] sm:w-[170px]"
                >
                  <option value="all">All statuses</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={openAddModal}
                  aria-label="Add clinic"
                  title="Add clinic"
                  className="flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-xl bg-[#176B55] text-white transition hover:bg-[#125642] focus:outline-none focus:ring-4 focus:ring-[#176B55]/20 sm:self-auto"
                >
                  <Plus size={22} strokeWidth={2} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-6 py-4">Clinic</th>
                    <th className="px-6 py-4">Contact details</th>
                    <th className="px-6 py-4">Subscription plan</th>
                    <th className="px-6 py-4">Doctors / Branches</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredClinics.map((clinic) => {
                    const plan = plans.find(
                      (item) => item.id === clinic.planId,
                    );

                    return (
                      <tr
                        key={clinic.id}
                        className="transition hover:bg-slate-50/60"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#DDF3E7] text-[#176B55]">
                              <Building2 size={21} strokeWidth={1.8} />
                            </div>

                            <div>
                              <p className="font-semibold text-[#173F35]">
                                {clinic.name}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                {clinic.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="space-y-1.5 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <Mail
                                size={15}
                                strokeWidth={1.8}
                                className="shrink-0 text-slate-400"
                              />
                              <span>{clinic.email}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Phone
                                size={15}
                                strokeWidth={1.8}
                                className="shrink-0 text-slate-400"
                              />
                              <span>
                                {clinic.phone || "No phone number"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <p className="font-semibold text-[#173F35]">
                            {plan?.name ?? "Unassigned"}
                          </p>

                          {plan && (
                            <p className="mt-1 text-xs text-slate-500">
                              ₱{plan.price.toLocaleString("en-PH")}/month
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <div className="space-y-1.5 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <Users
                                size={15}
                                strokeWidth={1.8}
                                className="shrink-0 text-slate-400"
                              />
                              <span>
                                {clinic.doctorCount} /{" "}
                                {plan?.maxDoctors ?? "—"} doctors
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Building2
                                size={15}
                                strokeWidth={1.8}
                                className="shrink-0 text-slate-400"
                              />
                              <span>
                                {clinic.branchCount} /{" "}
                                {plan?.maxBranches ?? "—"} branches
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(clinic.status)}`}
                          >
                            <span className="h-2 w-2 shrink-0 rounded-full bg-current opacity-70" />
                            {clinic.status}
                          </span>

                          {clinic.status === "Trial" &&
                            clinic.trialEndsAt && (
                              <p className="mt-1.5 text-xs text-slate-400">
                                Ends{" "}
                                {new Date(
                                  `${clinic.trialEndsAt}T00:00:00`,
                                ).toLocaleDateString("en-PH", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                            )}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(clinic)}
                              aria-label={`Edit ${clinic.name}`}
                              title="Edit clinic"
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-[#176B55] hover:bg-[#DDF3E7] hover:text-[#176B55]"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteTarget(clinic)}
                              aria-label={`Deactivate ${clinic.name}`}
                              title="Deactivate clinic"
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredClinics.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <Building2
                          size={30}
                          strokeWidth={1.6}
                          className="mx-auto text-slate-300"
                        />
                        <p className="mt-3 font-medium text-[#173F35]">
                          No clinics found
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Try another search or register a new clinic.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>


        </>
      )}

      {/* Add / Edit clinic modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="clinic-modal-title"
            className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h3
                  id="clinic-modal-title"
                  className="text-xl font-bold text-[#173F35]"
                >
                  {editingClinic ? "Edit clinic" : "Add clinic"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {editingClinic
                    ? "Update clinic details and subscription settings."
                    : "Register a clinic and its administrator."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close modal"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={19} strokeWidth={1.8} />
              </button>
            </div>

            <form
              onSubmit={saveClinic}
              className="max-h-[calc(100dvh-180px)] space-y-6 overflow-y-auto p-6"
            >
              {/* Clinic information */}
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#DDF3E7] text-[#176B55]">
                    <Building2 size={18} strokeWidth={1.8} />
                  </div>

                  <h4 className="font-semibold text-[#173F35]">
                    Clinic information
                  </h4>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="clinic-name"
                    className="text-sm font-medium text-slate-700"
                  >
                    Clinic name <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="clinic-name"
                    required
                    maxLength={120}
                    value={form.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    placeholder="e.g. Bright Smile Dental Clinic"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#176B55] focus:ring-2 focus:ring-[#176B55]/10"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="clinic-email"
                      className="text-sm font-medium text-slate-700"
                    >
                      Contact email <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="clinic-email"
                      required
                      type="email"
                      maxLength={254}
                      value={form.email}
                      onChange={(event) =>
                        updateField("email", event.target.value)
                      }
                      placeholder="clinic@example.com"
                      className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#176B55] focus:ring-2 focus:ring-[#176B55]/10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="clinic-phone"
                      className="text-sm font-medium text-slate-700"
                    >
                      Contact number
                    </label>

                    <input
                      id="clinic-phone"
                      type="tel"
                      maxLength={30}
                      value={form.phone}
                      onChange={(event) =>
                        updateField("phone", event.target.value)
                      }
                      placeholder="+63 9XX XXX XXXX"
                      className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#176B55] focus:ring-2 focus:ring-[#176B55]/10"
                    />
                  </div>
                </div>
              </section>

              <div className="border-t border-slate-100" />

              {/* Subscription settings */}
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#DDF3E7] text-[#176B55]">
                    <CalendarDays size={18} strokeWidth={1.8} />
                  </div>

                  <h4 className="font-semibold text-[#173F35]">
                    Subscription settings
                  </h4>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="clinic-plan"
                    className="text-sm font-medium text-slate-700"
                  >
                    Subscription plan <span className="text-red-500">*</span>
                  </label>

                  <select
                    id="clinic-plan"
                    required
                    value={form.planId}
                    onChange={(event) =>
                      updateField("planId", event.target.value)
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#176B55] focus:ring-2 focus:ring-[#176B55]/10"
                  >
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} — ₱
                        {plan.price.toLocaleString("en-PH")}/month
                      </option>
                    ))}
                  </select>

                  {selectedPlan && (
                    <p className="text-xs text-slate-500">
                      Up to {selectedPlan.maxDoctors} doctors and{" "}
                      {selectedPlan.maxBranches} branches.
                    </p>
                  )}

                  {plans.length === 0 && (
                    <p className="text-xs text-amber-700">
                      Create an active subscription plan before registering
                      a clinic.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="clinic-status"
                      className="text-sm font-medium text-slate-700"
                    >
                      Account status <span className="text-red-500">*</span>
                    </label>

                    <select
                      id="clinic-status"
                      required
                      value={form.status}
                      onChange={(event) =>
                        updateField(
                          "status",
                          event.target.value as ClinicStatus,
                        )
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#176B55] focus:ring-2 focus:ring-[#176B55]/10"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  {form.status === "Trial" && (
                    <div className="space-y-1.5">
                      <label
                        htmlFor="clinic-trial-end"
                        className="text-sm font-medium text-slate-700"
                      >
                        Trial end date{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <input
                        id="clinic-trial-end"
                        required
                        type="date"
                        value={form.trialEndsAt}
                        onChange={(event) =>
                          updateField("trialEndsAt", event.target.value)
                        }
                        className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#176B55] focus:ring-2 focus:ring-[#176B55]/10"
                      />
                    </div>
                  )}
                </div>
              </section>

              {/* Administrator fields are only shown during creation */}
              {!editingClinic && (
                <>
                  <div className="border-t border-slate-100" />

                  <section className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#DDF3E7] text-[#176B55]">
                        <UserRound size={18} strokeWidth={1.8} />
                      </div>

                      <div>
                        <h4 className="font-semibold text-[#173F35]">
                          Clinic administrator
                        </h4>
                        <p className="mt-1 text-xs text-slate-500">
                          The first user who manages the clinic workspace.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label
                          htmlFor="admin-first-name"
                          className="text-sm font-medium text-slate-700"
                        >
                          First name{" "}
                          <span className="text-red-500">*</span>
                        </label>

                        <input
                          id="admin-first-name"
                          required
                          maxLength={80}
                          value={form.adminFirstName}
                          onChange={(event) =>
                            updateField("adminFirstName", event.target.value)
                          }
                          placeholder="First name"
                          className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#176B55] focus:ring-2 focus:ring-[#176B55]/10"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label
                          htmlFor="admin-last-name"
                          className="text-sm font-medium text-slate-700"
                        >
                          Last name{" "}
                          <span className="text-red-500">*</span>
                        </label>

                        <input
                          id="admin-last-name"
                          required
                          maxLength={80}
                          value={form.adminLastName}
                          onChange={(event) =>
                            updateField("adminLastName", event.target.value)
                          }
                          placeholder="Last name"
                          className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#176B55] focus:ring-2 focus:ring-[#176B55]/10"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="admin-email"
                        className="text-sm font-medium text-slate-700"
                      >
                        Administrator login email{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <input
                        id="admin-email"
                        required
                        type="email"
                        maxLength={254}
                        value={form.adminEmail}
                        onChange={(event) =>
                          updateField("adminEmail", event.target.value)
                        }
                        placeholder="admin@clinic.com"
                        className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#176B55] focus:ring-2 focus:ring-[#176B55]/10"
                      />

                      <p className="text-xs text-slate-500">
                        Use a separate email from the clinic's general
                        contact email.
                      </p>
                    </div>

                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
                      <input
                        type="checkbox"
                        checked={sendInvitation}
                        onChange={(event) =>
                          setSendInvitation(event.target.checked)
                        }
                        className="mt-0.5 h-4 w-4 shrink-0 accent-[#176B55]"
                      />

                      <span>
                        <span className="flex items-center gap-2 text-sm font-semibold text-[#173F35]">
                          <Send
                            size={16}
                            strokeWidth={1.8}
                            className="shrink-0"
                          />
                          Send administrator invitation
                        </span>

                        <span className="mt-1 block text-xs leading-5 text-slate-500">
                          Invite the administrator to set their own
                          password and access the clinic workspace.
                        </span>
                      </span>
                    </label>
                  </section>
                </>
              )}

              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || plans.length === 0}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#176B55] px-5 text-sm font-semibold text-white transition hover:bg-[#125642] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Check size={17} strokeWidth={2} />
                  {saving
                    ? "Saving..."
                    : editingClinic
                      ? "Save changes"
                      : "Create clinic"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setDeleteTarget(null);
            }
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-clinic-title"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Trash2 size={21} strokeWidth={1.8} />
            </div>

            <h3
              id="delete-clinic-title"
              className="mt-4 text-lg font-bold text-[#173F35]"
            >
              Deactivate {deleteTarget.name}?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              This will deactivate the clinic while preserving its records,
              including bookings, payment proofs, and activity logs.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={deleteClinic}
                disabled={saving}
                className="h-10 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Deactivating..." : "Deactivate clinic"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}