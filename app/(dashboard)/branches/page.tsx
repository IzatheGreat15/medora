
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  ChevronDown,
  LoaderCircle,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  X,
  Phone,
  Mail,
  AlertCircle,
} from "lucide-react";

import {
  createBranch,
  deleteBranch,
  getBranches,
  type Branch,
  type BranchStatus,
} from "./actions";

type StatusFilter = "All" | BranchStatus;

type BranchFormData = {
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  status: BranchStatus;
};

const initialFormData: BranchFormData = {
  name: "",
  code: "",
  address: "",
  phone: "",
  email: "",
  status: "Active",
};

function StatusBadge({ status }: { status: BranchStatus }) {
  const isActive = status === "Active";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        isActive
          ? "bg-emerald-50 text-emerald-700"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isActive ? "bg-emerald-500" : "bg-gray-400"
        }`}
      />
      {status}
    </span>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
}: {
  title: string;
  value: number;
  description: string;
  icon: typeof Building2;
  iconClassName: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">
            {value}
          </p>
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        </div>

        <div className={`rounded-lg p-2.5 ${iconClassName}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function Modal({
  title,
  description,
  onClose,
  children,
}: {
  title: string;
  description: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2
              id="modal-title"
              className="text-lg font-semibold text-gray-900"
            >
              {title}
            </h2>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClassName =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

export default function BranchesPage() {
  const router = useRouter();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingBranchId, setDeletingBranchId] = useState<string | null>(
    null
  );

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);

  const [formData, setFormData] =
    useState<BranchFormData>(initialFormData);

  const [errorMessage, setErrorMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadBranches = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await getBranches();
      setBranches(result);
    } catch (error) {
      console.error("Failed to load branches:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load branches. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBranches();
  }, [loadBranches]);

  const filteredBranches = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return branches.filter((branch) => {
      const matchesSearch =
        !query ||
        branch.name.toLowerCase().includes(query) ||
        branch.code.toLowerCase().includes(query) ||
        branch.address.toLowerCase().includes(query) ||
        branch.phone.toLowerCase().includes(query) ||
        (branch.email ?? "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || branch.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [branches, searchQuery, statusFilter]);

  const activeBranches = branches.filter(
    (branch) => branch.status === "Active"
  ).length;

  const inactiveBranches = branches.filter(
    (branch) => branch.status === "Inactive"
  ).length;

  const totalDoctors = branches.reduce(
    (total, branch) => total + (branch.doctors ?? 0),
    0
  );

  function openAddModal() {
    setFormData(initialFormData);
    setFormError("");
    setErrorMessage("");
    setSuccessMessage("");
    setIsAddModalOpen(true);
  }

  function closeAddModal() {
    if (isSaving) return;

    setIsAddModalOpen(false);
    setFormData(initialFormData);
    setFormError("");
  }

  function updateFormField<K extends keyof BranchFormData>(
    field: K,
    value: BranchFormData[K]
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleCreateBranch(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");

    const name = formData.name.trim();
    const code = formData.code.trim();
    const address = formData.address.trim();
    const phone = formData.phone.trim();
    const email = formData.email.trim();

    if (!name || !code || !address || !phone) {
      setFormError("Please complete all required fields.");
      return;
    }

    setIsSaving(true);

    try {
      await createBranch({
        name,
        code,
        address,
        phone,
        email,
        status: formData.status,
      });

      setIsAddModalOpen(false);
      setFormData(initialFormData);
      setSuccessMessage("Branch created successfully.");

      await loadBranches();
    } catch (error) {
      console.error("Failed to create branch:", error);
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to create branch. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteBranch() {
    if (!branchToDelete) return;

    const branch = branchToDelete;

    setDeletingBranchId(branch.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await deleteBranch(branch.id);

      setBranches((current) =>
        current.filter((item) => item.id !== branch.id)
      );

      setBranchToDelete(null);
      setSuccessMessage(`${branch.name} was deleted successfully.`);
    } catch (error) {
      console.error("Failed to delete branch:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete this branch. Please try again."
      );
      setBranchToDelete(null);
    } finally {
      setDeletingBranchId(null);
    }
  }

  function handleEditBranch(branch: Branch) {
    router.push(`/branches/${branch.id}/edit`);
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
              <Building2 size={22} />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Branches
            </h1>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Manage your clinic locations and their contact information.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          <Plus size={18} />
          Add branch
        </button>
      </div>

      {/* Feedback messages */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div className="flex-1">{errorMessage}</div>
          <button
            type="button"
            onClick={() => setErrorMessage("")}
            aria-label="Dismiss error"
            className="rounded p-0.5 hover:bg-red-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <div className="flex-1">{successMessage}</div>
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            aria-label="Dismiss message"
            className="rounded p-0.5 hover:bg-emerald-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          title="Total branches"
          value={branches.length}
          description="All clinic locations"
          icon={Building2}
          iconClassName="bg-emerald-50 text-emerald-700"
        />

        <SummaryCard
          title="Active branches"
          value={activeBranches}
          description="Currently active locations"
          icon={CheckCircle2}
          iconClassName="bg-blue-50 text-blue-700"
        />

        <SummaryCard
          title="Doctors assigned"
          value={totalDoctors}
          description={`${inactiveBranches} inactive ${
            inactiveBranches === 1 ? "branch" : "branches"
          }`}
          icon={Users}
          iconClassName="bg-violet-50 text-violet-700"
        />
      </div>

      {/* Branches table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="hidden text-sm text-gray-500 sm:block">
            Showing{" "}
            <span className="font-medium text-gray-900">
              {filteredBranches.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-gray-900">
              {branches.length}
            </span>{" "}
            branches
          </p>

          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <div className="relative min-w-0 flex-1 sm:w-60 sm:flex-none">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search branches..."
                aria-label="Search branches"
                className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
                aria-label="Filter branches by status"
                className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-9 text-sm text-gray-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="All">All statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>

            <button
              type="button"
              onClick={openAddModal}
              title="Add branch"
              aria-label="Add branch"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white transition hover:bg-emerald-700"
            >
              <Plus size={19} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                  Branch
                </th>
                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                  Contact details
                </th>
                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                  Doctors
                </th>
                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                  Status
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-sm text-gray-500">
                      <LoaderCircle
                        size={22}
                        className="animate-spin text-emerald-600"
                      />
                      Loading branches...
                    </div>
                  </td>
                </tr>
              ) : filteredBranches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="rounded-full bg-gray-100 p-4 text-gray-400">
                        <Building2 size={25} />
                      </div>

                      <p className="mt-4 text-sm font-medium text-gray-900">
                        {branches.length === 0
                          ? "No branches yet"
                          : "No branches found"}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {branches.length === 0
                          ? "Add your first clinic location to get started."
                          : "Try changing your search or status filter."}
                      </p>

                      {branches.length === 0 && (
                        <button
                          type="button"
                          onClick={openAddModal}
                          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                        >
                          <Plus size={16} />
                          Add your first branch
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBranches.map((branch) => (
                  <tr
                    key={branch.id}
                    className="transition hover:bg-gray-50/70"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-lg bg-emerald-50 p-2 text-emerald-700">
                          <Building2 size={18} />
                        </div>

                        <div>
                          <p className="font-medium text-gray-900">
                            {branch.name}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            Code: {branch.code}
                          </p>
                          <p className="mt-1 flex max-w-xs items-start gap-1.5 text-xs text-gray-500">
                            <MapPin
                              size={13}
                              className="mt-0.5 shrink-0"
                            />
                            <span>{branch.address}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="space-y-1.5 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <Phone
                            size={14}
                            className="shrink-0 text-gray-400"
                          />
                          {branch.phone || "No phone provided"}
                        </p>

                        <p className="flex items-center gap-2">
                          <Mail
                            size={14}
                            className="shrink-0 text-gray-400"
                          />
                          <span className="max-w-[200px] truncate">
                            {branch.email || "No email provided"}
                          </span>
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <Users size={15} className="text-gray-400" />
                        {branch.doctors ?? 0}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={branch.status} />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditBranch(branch)}
                          title="Edit branch"
                          aria-label={`Edit ${branch.name}`}
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setBranchToDelete(branch)}
                          title="Delete branch"
                          aria-label={`Delete ${branch.name}`}
                          disabled={deletingBranchId === branch.id}
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingBranchId === branch.id ? (
                            <LoaderCircle
                              size={16}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        {!isLoading && filteredBranches.length > 0 && (
          <div className="border-t border-gray-200 px-5 py-3">
            <p className="text-xs text-gray-500">
              Showing {filteredBranches.length}{" "}
              {filteredBranches.length === 1 ? "branch" : "branches"}
            </p>
          </div>
        )}
      </div>

      {/* Add branch modal */}
      {isAddModalOpen && (
        <Modal
          title="Add branch"
          description="Enter the details for your new clinic location."
          onClose={closeAddModal}
        >
          <form onSubmit={handleCreateBranch} className="space-y-4">
            {formError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                <AlertCircle size={17} className="mt-0.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <FormField label="Branch name" required>
              <input
                autoFocus
                type="text"
                value={formData.name}
                onChange={(event) =>
                  updateFormField("name", event.target.value)
                }
                placeholder="e.g. Cebu City Branch"
                maxLength={150}
                required
                className={inputClassName}
              />
            </FormField>

            <FormField label="Branch code" required>
              <input
                type="text"
                value={formData.code}
                onChange={(event) =>
                  updateFormField("code", event.target.value)
                }
                placeholder="e.g. CEB-001"
                maxLength={50}
                required
                className={inputClassName}
              />
              <p className="text-xs text-gray-500">
                Must be unique within your clinic.
              </p>
            </FormField>

            <FormField label="Address" required>
              <textarea
                value={formData.address}
                onChange={(event) =>
                  updateFormField("address", event.target.value)
                }
                placeholder="Complete branch address"
                rows={2}
                required
                className={inputClassName}
              />
            </FormField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Phone number" required>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(event) =>
                    updateFormField("phone", event.target.value)
                  }
                  placeholder="e.g. 0917 123 4567"
                  required
                  className={inputClassName}
                />
              </FormField>

              <FormField label="Email address">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(event) =>
                    updateFormField("email", event.target.value)
                  }
                  placeholder="branch@example.com"
                  className={inputClassName}
                />
              </FormField>
            </div>

            <FormField label="Status" required>
              <select
                value={formData.status}
                onChange={(event) =>
                  updateFormField(
                    "status",
                    event.target.value as BranchStatus
                  )
                }
                className={inputClassName}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </FormField>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeAddModal}
                disabled={isSaving}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving && (
                  <LoaderCircle size={16} className="animate-spin" />
                )}
                {isSaving ? "Creating..." : "Create branch"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete confirmation modal */}
      {branchToDelete && (
        <Modal
          title="Delete branch"
          description="Are you sure you want to delete this branch?"
          onClose={() => {
            if (!deletingBranchId) setBranchToDelete(null);
          }}
        >
          <div className="space-y-5">
            <div className="rounded-lg border border-red-100 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-red-100 p-2 text-red-600">
                  <Trash2 size={18} />
                </div>

                <div>
                  <p className="font-medium text-gray-900">
                    {branchToDelete.name}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Branch code: {branchToDelete.code}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setBranchToDelete(null)}
                disabled={deletingBranchId !== null}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteBranch}
                disabled={deletingBranchId !== null}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingBranchId === branchToDelete.id && (
                  <LoaderCircle size={16} className="animate-spin" />
                )}
                {deletingBranchId === branchToDelete.id
                  ? "Deleting..."
                  : "Delete branch"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
