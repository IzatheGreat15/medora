
"use client";

import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Mail,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  UserRoundPlus,
  UserRoundX,
  X,
} from "lucide-react";

type StaffStatus = "Active" | "Inactive";

type StaffMember = {
  id: string;
  name: string;
  email: string;
  status: StaffStatus;
};

const initialStaff: StaffMember[] = [
  {
    id: "staff-1",
    name: "Jane Doe",
    email: "jane@example.com",
    status: "Active",
  },
  {
    id: "staff-2",
    name: "Michael Santos",
    email: "michael@example.com",
    status: "Active",
  },
  {
    id: "staff-3",
    name: "Sarah Reyes",
    email: "sarah@example.com",
    status: "Inactive",
  },
];

export default function StaffSection() {
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLowerCase();

    return staff.filter((member) => {
      const matchesSearch =
        !query ||
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All statuses" ||
        member.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [staff, search, statusFilter]);

  function openAddModal() {
    setEditingStaff(null);
    setName("");
    setEmail("");
    setFormError("");
    setMessage("");
    setIsModalOpen(true);
  }

  function openEditModal(member: StaffMember) {
    setEditingStaff(member);
    setName(member.name);
    setEmail(member.email);
    setFormError("");
    setMessage("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingStaff(null);
    setName("");
    setEmail("");
    setFormError("");
  }

  function handleSaveStaff(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setMessage("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail) {
      setFormError("Enter the staff member's name and email.");
      return;
    }

    const duplicateEmail = staff.some(
      (member) =>
        member.email.toLowerCase() === cleanEmail &&
        member.id !== editingStaff?.id,
    );

    if (duplicateEmail) {
      setFormError("A staff member with this email already exists.");
      return;
    }

    if (editingStaff) {
      setStaff((current) =>
        current.map((member) =>
          member.id === editingStaff.id
            ? {
                ...member,
                name: cleanName,
                email: cleanEmail,
              }
            : member,
        ),
      );

      setMessage(`${cleanName}'s details were updated in this preview.`);
    } else {
      setStaff((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          name: cleanName,
          email: cleanEmail,
          status: "Active",
        },
      ]);

      setMessage(
        `${cleanName} was added to this preview. Authentication and invitations are not yet connected.`,
      );
    }

    closeModal();
  }

  function toggleStatus(member: StaffMember) {
    const nextStatus: StaffStatus =
      member.status === "Active" ? "Inactive" : "Active";

    setStaff((current) =>
      current.map((item) =>
        item.id === member.id
          ? { ...item, status: nextStatus }
          : item,
      ),
    );

    setMessage(
      `${member.name} was marked ${nextStatus.toLowerCase()} in this preview.`,
    );
  }

  function handleDeleteStaff(member: StaffMember) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${member.name}? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setStaff((current) =>
      current.filter((item) => item.id !== member.id),
    );

    setMessage(`${member.name} was removed from this preview.`);
  }

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {/* Section header */}
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DDF3E7] text-[#176B55]">
              <UserRoundPlus size={21} />
            </div>

            <div>
              <h2 className="font-semibold text-[#173F35]">
                Staff members
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage who can access your clinic.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#176B55] px-4 text-sm font-semibold text-white transition hover:bg-[#173F35] focus:outline-none focus:ring-2 focus:ring-[#82A995] focus:ring-offset-2"
          >
            <Plus size={17} />
            Add staff
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {/* Search and filters */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-4 sm:gap-3">
            <p className="hidden shrink-0 text-sm text-slate-500 md:block">
              <span className="font-semibold text-[#173F35]">
                {filteredStaff.length}
              </span>{" "}
              found
            </p>

            <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-4">
              {/* Search */}
              <div className="relative min-w-0 flex-1 sm:max-w-xs">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search staff..."
                  aria-label="Search staff"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#82A995] focus:ring-2 focus:ring-[#DDF3E7] sm:h-11 sm:pl-10 sm:pr-4"
                />
              </div>

              {/* Status filter */}
              <div className="relative w-[112px] shrink-0 sm:w-36">
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                  aria-label="Filter staff by status"
                  className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-2 pr-7 text-xs text-slate-600 outline-none focus:border-[#82A995] sm:h-11 sm:pl-3 sm:pr-9 sm:text-sm"
                >
                  <option>All statuses</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 sm:right-3"
                />
              </div>
            </div>
          </div>

          {/* Feedback */}
          {message && (
            <div
              role="status"
              className="mt-4 flex items-start gap-2 rounded-xl border border-[#B9DCC8] bg-[#DDF3E7] p-3 text-sm text-[#173F35]"
            >
              <Check size={17} className="mt-0.5 shrink-0" />
              <p>{message}</p>
            </div>
          )}

          {/* Staff table */}
          {filteredStaff.length > 0 ? (
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Staff member
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Access
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Status
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredStaff.map((member) => {
                    const initials = member.name
                      .split(/\s+/)
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();

                    return (
                      <tr
                        key={member.id}
                        className="transition hover:bg-slate-50/70"
                      >
                        {/* Name and email */}
                        <td className="px-3 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DDF3E7] text-sm font-semibold text-[#176B55]">
                              {initials}
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#173F35]">
                                {member.name}
                              </p>
                              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                <Mail size={13} />
                                {member.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Phase 1 access */}
                        <td className="px-3 py-4">
                          <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                            <ShieldCheck
                              size={15}
                              className="text-[#82A995]"
                            />
                            Full access
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-3 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                              member.status === "Active"
                                ? "bg-[#DDF3E7] text-[#176B55]"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                member.status === "Active"
                                  ? "bg-[#176B55]"
                                  : "bg-slate-400"
                              }`}
                            />
                            {member.status}
                          </span>
                        </td>

                        {/* Icon-only actions */}
                        <td className="px-3 py-4">
                          <div className="flex items-center justify-end gap-1">
                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => openEditModal(member)}
                              aria-label={`Edit ${member.name}`}
                              title="Edit staff"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-[#DDF3E7] hover:text-[#176B55] focus:outline-none focus:ring-2 focus:ring-[#82A995]"
                            >
                              <Pencil size={16} />
                            </button>

                            {/* Activate / Deactivate */}
                            <button
                              type="button"
                              onClick={() => toggleStatus(member)}
                              aria-label={
                                member.status === "Active"
                                  ? `Deactivate ${member.name}`
                                  : `Activate ${member.name}`
                              }
                              title={
                                member.status === "Active"
                                  ? "Deactivate staff"
                                  : "Activate staff"
                              }
                              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition focus:outline-none focus:ring-2 focus:ring-[#82A995] ${
                                member.status === "Active"
                                  ? "text-amber-600 hover:bg-amber-50"
                                  : "text-[#176B55] hover:bg-[#DDF3E7]"
                              }`}
                            >
                              <UserRoundX size={17} />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDeleteStaff(member)}
                              aria-label={`Delete ${member.name}`}
                              title="Delete staff"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-200"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <UserRound
                size={30}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm font-medium text-[#173F35]">
                No staff found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Try another search or change the status filter.
              </p>
            </div>
          )}

          {/* Phase 1 permissions notice */}
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
            <ShieldCheck size={16} className="mt-0.5 shrink-0" />
            <p>
              All active staff members currently have full access to
              clinic features. Role-based permissions will be available
              in a future phase.
            </p>
          </div>
        </div>
      </section>

      {/* Add / Edit staff modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto mb-0 bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="staff-modal-title"
            className="my-auto w-full max-w-md rounded-2xl bg-white shadow-xl"
          >
            {/* Modal header */}
            <div className="flex items-start justify-between border-b border-slate-100 p-5">
              <div>
                <h3
                  id="staff-modal-title"
                  className="text-lg font-semibold text-[#173F35]"
                >
                  {editingStaff ? "Edit staff member" : "Add staff member"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {editingStaff
                    ? "Update this staff member's details."
                    : "Add someone to your clinic team."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close modal"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={19} />
              </button>
            </div>

            {/* Modal form */}
            <form onSubmit={handleSaveStaff}>
              <div className="space-y-4 p-5">
                <div className="space-y-2">
                  <label
                    htmlFor="staffName"
                    className="block text-sm font-medium text-[#173F35]"
                  >
                    Full name
                  </label>

                  <input
                    id="staffName"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Enter full name"
                    maxLength={120}
                    autoFocus
                    required
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#82A995] focus:ring-2 focus:ring-[#DDF3E7]"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="staffEmail"
                    className="block text-sm font-medium text-[#173F35]"
                  >
                    Email address
                  </label>

                  <input
                    id="staffEmail"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@clinic.com"
                    maxLength={254}
                    required
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#82A995] focus:ring-2 focus:ring-[#DDF3E7]"
                  />
                </div>

                <div className="flex items-start gap-2 rounded-xl bg-[#F7F9F6] p-3 text-sm text-slate-600">
                  <ShieldCheck
                    size={17}
                    className="mt-0.5 shrink-0 text-[#176B55]"
                  />
                  <p>
                    All active staff members have full access to clinic
                    features.
                  </p>
                </div>

                {formError && (
                  <p role="alert" className="text-sm text-red-600">
                    {formError}
                  </p>
                )}
              </div>

              {/* Modal footer */}
              <div className="flex justify-end gap-3 border-t border-slate-100 p-5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#176B55] px-4 text-sm font-semibold text-white transition hover:bg-[#173F35]"
                >
                  {editingStaff ? (
                    <Check size={16} />
                  ) : (
                    <Plus size={16} />
                  )}
                  {editingStaff ? "Save changes" : "Add staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
