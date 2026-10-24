
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Stethoscope,
  Users,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";

export type DoctorTableItem = {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  status: "Active" | "Inactive";
  branches?: string[];
};

type DoctorsTableProps = {
  doctors: DoctorTableItem[];
  onDoctorEdit?: (doctor: DoctorTableItem) => void;
  onDoctorDelete?: (doctor: DoctorTableItem) => void;
  onDoctorAdd?: () => void;
  showBranch?: boolean;
  emptyMessage?: string;
  title?: string;
  description?: string;
};

function StatusBadge({
  status,
}: {
  status: DoctorTableItem["status"];
}) {
  const active = status === "Active";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        active
          ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
          : "bg-slate-100 text-slate-600 ring-slate-500/20"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      {status}
    </span>
  );
}

export default function DoctorsTable({
  doctors,
  onDoctorEdit,
  onDoctorDelete,
  onDoctorAdd,
  showBranch = false,
  emptyMessage = "No doctors found.",
  title,
  description,
}: DoctorsTableProps) {
  const [search, setSearch] = useState("");

  const filteredDoctors = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return doctors;

    return doctors.filter((doctor) =>
      [
        doctor.name,
        doctor.specialty,
        doctor.email,
        doctor.phone,
        ...(doctor.branches ?? []),
      ].some((value) => value.toLowerCase().includes(query))
    );
  }, [doctors, search]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {(title || description) && (
        <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
          {title && (
            <h3 className="font-semibold text-[#173F35]">{title}</h3>
          )}

          {description && (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          )}
        </div>
      )}

      {/* Table toolbar */}
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Result count */}
        <div className="text-sm text-slate-500">
          <span className="font-semibold text-slate-800">
            {filteredDoctors.length}
          </span>{" "}
          {filteredDoctors.length === 1 ? "doctor" : "doctors"}
        </div>

        {/* Search and Add button */}
        <div className="flex w-full min-w-0 items-center gap-2 sm:gap-3 lg:w-auto lg:justify-end">
          <div className="relative min-w-0 flex-1 lg:w-72 lg:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="search"
              aria-label="Search doctors"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search doctors..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#82A995] focus:ring-4 focus:ring-[#DDF3E7]"
            />
          </div>

          {/* Only show Add button when onDoctorAdd is provided */}
          {onDoctorAdd && (
            <button
              type="button"
              onClick={onDoctorAdd}
              aria-label="Add doctor"
              title="Add doctor"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#176B55] text-white shadow-sm transition hover:bg-[#125744] focus:outline-none focus:ring-4 focus:ring-[#DDF3E7]"
            >
              <Plus className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Doctors table */}
      {filteredDoctors.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead className="bg-[#F7F9F6]">
              <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3.5 sm:px-6">Doctor</th>
                <th className="px-5 py-3.5">Contact</th>

                {showBranch && (
                  <th className="px-5 py-3.5">Branches</th>
                )}

                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredDoctors.map((doctor) => (
                <tr
                  key={doctor.id}
                  className="transition hover:bg-[#F7F9F6]"
                >
                  {/* Doctor details */}
                  <td className="px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DDF3E7] text-sm font-bold text-[#176B55]">
                        {doctor.name
                          .split(" ")
                          .filter(Boolean)
                          .slice(-2)
                          .map((part) => part[0])
                          .join("")
                          .replaceAll(".", "")}
                      </div>

                      <div>
                        <p className="font-semibold text-[#173F35]">
                          {doctor.name}
                        </p>
                        <p className="mt-0.5 text-sm text-slate-500">
                          {doctor.specialty}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Contact details */}
                  <td className="px-5 py-4">
                    <p className="text-sm text-slate-700">{doctor.email}</p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {doctor.phone}
                    </p>
                  </td>

                  {/* Branches */}
                  {showBranch && (
                    <td className="px-5 py-4">
                      <div className="flex max-w-[220px] flex-wrap gap-1.5">
                        {(
                          doctor.branches?.length
                            ? doctor.branches
                            : ["Unassigned"]
                        ).map((branch) => (
                          <span
                            key={branch}
                            className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600"
                          >
                            {branch}
                          </span>
                        ))}
                      </div>
                    </td>
                  )}

                  {/* Status */}
                  <td className="px-5 py-4">
                    <StatusBadge status={doctor.status} />
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {onDoctorEdit && (
                        <button
                          type="button"
                          onClick={() => onDoctorEdit(doctor)}
                          aria-label={`Edit ${doctor.name}`}
                          title="Edit doctor"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-[#82A995] hover:bg-[#DDF3E7] hover:text-[#176B55] focus:outline-none focus:ring-4 focus:ring-[#DDF3E7]"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}

                      {onDoctorDelete && (
                        <button
                          type="button"
                          onClick={() => onDoctorDelete(doctor)}
                          aria-label={`Delete ${doctor.name}`}
                          title="Delete doctor"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-4 focus:ring-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F7F9F6] text-slate-400">
            {doctors.length === 0 ? (
              <Users className="h-5 w-5" />
            ) : (
              <Stethoscope className="h-5 w-5" />
            )}
          </div>

          <p className="mt-3 text-sm font-semibold text-slate-700">
            {doctors.length === 0
              ? "No doctors assigned"
              : "No matching doctors"}
          </p>

          <p className="mt-1 max-w-sm text-sm text-slate-500">
            {doctors.length === 0
              ? emptyMessage
              : "Try a different search term."}
          </p>

          {search && doctors.length > 0 && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="mt-3 text-sm font-semibold text-[#176B55] hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </section>
  );
}
