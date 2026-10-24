"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Search,
    Plus,
    MapPin,
    Phone,
    Building2,
    Users,
    Pencil,
    Trash2,
    X,
    ChevronDown,
} from "lucide-react";

type BranchStatus = "Active" | "Inactive";

type Branch = {
    id: string;
    name: string;
    code: string;
    address: string;
    phone: string;
    email?: string;
    doctors: number;
    status: BranchStatus;
};

const initialBranches: Branch[] = [
    {
        id: "branch-cebu",
        name: "Cebu Branch",
        code: "CEB-001",
        address: "Cebu City, Cebu",
        phone: "+63 32 123 4567",
        email: "cebu@example.com",
        doctors: 4,
        status: "Active",
    },
    {
        id: "branch-mandaue",
        name: "Mandaue Branch",
        code: "MAN-002",
        address: "Mandaue City, Cebu",
        phone: "+63 32 234 5678",
        email: "mandaue@example.com",
        doctors: 3,
        status: "Active",
    },
    {
        id: "branch-lapu-lapu",
        name: "Lapu-Lapu Branch",
        code: "LLC-003",
        address: "Lapu-Lapu City, Cebu",
        phone: "+63 32 345 6789",
        email: "lapulapu@example.com",
        doctors: 2,
        status: "Inactive",
    },
];

function StatusBadge({ status }: { status: BranchStatus }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${status === "Active"
                ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                : "bg-slate-100 text-slate-600 ring-slate-500/20"
                }`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${status === "Active" ? "bg-emerald-500" : "bg-slate-400"
                    }`}
            />
            {status}
        </span>
    );
}

export default function BranchesPage() {
    const router = useRouter();
    const [branches, setBranches] = useState<Branch[]>(initialBranches);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All statuses");
    const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [actionMessage, setActionMessage] = useState("");
    const [newBranch, setNewBranch] = useState({
        name: "",
        address: "",
        phone: "",
        email: "",
    });

    const filteredBranches = useMemo(() => {
        const query = search.trim().toLowerCase();

        return branches.filter((branch) => {
            const matchesSearch =
                !query ||
                [
                    branch.name,
                    branch.code,
                    branch.address,
                    branch.phone,
                ].some((value) => value.toLowerCase().includes(query));

            const matchesStatus =
                statusFilter === "All statuses" ||
                branch.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [branches, search, statusFilter]);

    function handleCreateBranch(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const name = newBranch.name.trim();
        const nextNumber =
            Math.max(
                0,
                ...branches.map((branch) => {
                    const match = branch.code.match(/(\\d+)$/);
                    return match ? Number(match[1]) : 0;
                }),
            ) + 1;

        const branch: Branch = {
            id: `branch-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now()}`,
            name,
            code: `BR-${String(nextNumber).padStart(3, "0")}`,
            address: newBranch.address.trim(),
            phone: newBranch.phone.trim(),
            email: newBranch.email.trim(),
            doctors: 0,
            status: "Active",
        };

        setBranches((current) => [branch, ...current]);
        setSearch("");
        setStatusFilter("All statuses");
        setActionMessage(`${branch.name} was added successfully.`);
        setIsCreateModalOpen(false);
        setNewBranch({ name: "", address: "", phone: "", email: "" });
    }

    function handleDeleteBranch() {
        if (!branchToDelete) return;

        setBranches((current) =>
            current.filter((branch) => branch.id !== branchToDelete.id),
        );
        setActionMessage(`${branchToDelete.name} was deleted.`);
        setBranchToDelete(null);
    }

    function handleEditBranch(branch: Branch) {
        router.push(`/branches/${branch.id}/edit`);
    }

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            {actionMessage && (
                <div
                    role="status"
                    className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                >
                    <span>{actionMessage}</span>
                    <button
                        type="button"
                        onClick={() => setActionMessage("")}
                        aria-label="Dismiss message"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                    {
                        label: "Total branches",
                        value: branches.length,
                        icon: Building2,
                        color: "bg-slate-100 text-slate-600",
                    },
                    {
                        label: "Active branches",
                        value: branches.filter((branch) => branch.status === "Active").length,
                        icon: MapPin,
                        color: "bg-emerald-50 text-emerald-700",
                    },
                    {
                        label: "Practitioners across branches",
                        value: branches.reduce((total, branch) => total + branch.doctors, 0),
                        icon: Users,
                        color: "bg-[#DDF3E7] text-[#176B55]",
                    },
                ].map(({ label, value, icon: Icon, color }) => (
                    <article
                        key={label}
                        className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02]"
                    >
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-sm text-slate-500">{label}</p>
                            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
                                <Icon size={18} />
                            </span>
                        </div>
                        <p className="mt-3 text-3xl font-bold text-[#173F35]">{value}</p>
                    </article>
                ))}
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.02]">
                <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative w-full lg:max-w-sm">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search branches..."
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#82A995] focus:ring-2 focus:ring-[#DDF3E7]"
                        />
                    </div>

                    <div className="relative w-full sm:w-44">
                        <select
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm text-slate-600 outline-none focus:border-[#82A995]"
                        >
                            <option>All statuses</option>
                            <option>Active</option>
                            <option>Inactive</option>
                        </select>
                        <ChevronDown
                            size={15}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between px-4 py-3">
                    <p className="text-sm text-slate-500">
                        <span className="font-semibold text-[#173F35]">
                            {filteredBranches.length}
                        </span>{" "}
                        branches found
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setActionMessage("");
                            setIsCreateModalOpen(true);
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#176B55] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#173F35]"
                    >
                        <Plus size={17} />
                        Add branch
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[850px] text-left">
                        <thead>
                            <tr className="border-y border-slate-100 bg-slate-50/80">
                                {["Branch", "Contact details", "Practitioners", "Status", "Actions"].map((heading) => (
                                    <th
                                        key={heading}
                                        className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredBranches.map((branch) => (
                                <tr key={branch.id} className="transition hover:bg-[#F7F9F6]/80">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#DDF3E7] text-[#176B55]">
                                                <Building2 size={20} />
                                            </span>
                                            <div>
                                                <p className="whitespace-nowrap text-sm font-semibold text-[#173F35]">
                                                    {branch.name}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-400">
                                                    {branch.code}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className="flex items-center gap-2 text-sm text-slate-600">
                                            <MapPin size={14} className="shrink-0 text-slate-400" />
                                            {branch.address}
                                        </p>
                                        <p className="mt-1.5 flex items-center gap-2 text-xs text-slate-500">
                                            <Phone size={13} className="shrink-0 text-slate-400" />
                                            {branch.phone}
                                        </p>
                                        {branch.email && (
                                            <p className="mt-1.5 text-xs text-slate-500">
                                                {branch.email}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="inline-flex items-center gap-2 text-sm text-slate-600">
                                            <Users size={15} className="text-slate-400" />
                                            {branch.doctors} practitioners
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <StatusBadge status={branch.status} />
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleEditBranch(branch)}
                                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-[#82A995] hover:bg-[#DDF3E7] hover:text-[#176B55] focus:outline-none focus:ring-4 focus:ring-[#DDF3E7]"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setBranchToDelete(branch)}
                                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-4 focus:ring-red-100"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredBranches.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-5 py-16 text-center">
                                        <Search size={28} className="mx-auto text-slate-300" />
                                        <p className="mt-3 font-semibold text-[#173F35]">No branches found</p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Try changing your search or status filter.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <button
                        type="button"
                        aria-label="Close add branch modal"
                        onClick={() => setIsCreateModalOpen(false)}
                        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
                    />

                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="create-branch-title"
                        className="relative z-10 max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
                    >
                        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                            <div>
                                <h3 id="create-branch-title" className="mt-1 text-xl font-bold text-[#173F35]">
                                    Add branch
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    Add the branch's basic details. You can configure practitioners and schedules later.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(false)}
                                aria-label="Close modal"
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateBranch}>
                            <div className="space-y-5 px-6 py-6">
                                <div>
                                    <h4 className="text-sm font-semibold text-[#173F35]">Basic information</h4>
                                    <p className="mt-1 text-xs text-slate-500">These details help identify the clinic location.</p>
                                </div>

                                <label className="block text-sm font-medium text-slate-700">
                                    Branch name *
                                    <input
                                        required
                                        autoFocus
                                        value={newBranch.name}
                                        onChange={(event) => setNewBranch((current) => ({ ...current, name: event.target.value }))}
                                        placeholder="e.g. IT Park Branch"
                                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-[#82A995] focus:ring-2 focus:ring-[#DDF3E7]"
                                    />
                                </label>

                                <label className="block text-sm font-medium text-slate-700">
                                    Branch address *
                                    <textarea
                                        required
                                        rows={2}
                                        value={newBranch.address}
                                        onChange={(event) => setNewBranch((current) => ({ ...current, address: event.target.value }))}
                                        placeholder="Street, city, province, postal code"
                                        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#82A995] focus:ring-2 focus:ring-[#DDF3E7]"
                                    />
                                </label>

                                <div className="border-t border-slate-100 pt-5">
                                    <h4 className="text-sm font-semibold text-[#173F35]">Contact details</h4>
                                    <p className="mt-1 text-xs text-slate-500">Use the contact information patients can use to reach this branch.</p>
                                </div>

                                <label className="block text-sm font-medium text-slate-700">
                                    Contact phone *
                                    <input
                                        required
                                        type="tel"
                                        value={newBranch.phone}
                                        onChange={(event) => setNewBranch((current) => ({ ...current, phone: event.target.value }))}
                                        placeholder="e.g. +63 32 123 4567"
                                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-[#82A995] focus:ring-2 focus:ring-[#DDF3E7]"
                                    />
                                </label>

                                <label className="block text-sm font-medium text-slate-700">
                                    Contact email
                                    <input
                                        type="email"
                                        value={newBranch.email}
                                        onChange={(event) => setNewBranch((current) => ({ ...current, email: event.target.value }))}
                                        placeholder="e.g. itpark@clinic.com"
                                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-[#82A995] focus:ring-2 focus:ring-[#DDF3E7]"
                                    />
                                </label>

                                <div className="rounded-xl border border-[#DDF3E7] bg-[#F7F9F6] p-4">
                                    <div className="flex items-start gap-3">
                                        <Building2 size={18} className="mt-0.5 shrink-0 text-[#176B55]" />
                                        <div>
                                            <p className="text-sm font-semibold text-[#173F35]">Configure later</p>
                                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                                Practitioners, opening hours, and appointment schedules can be configured after the branch is created.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs leading-5 text-slate-400">
                                    Demo only — branch details are stored in temporary page state and will not persist after refresh.
                                </p>
                            </div>

                            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-5 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#176B55] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173F35]"
                                >
                                    <Plus size={17} />
                                    Add branch
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}

            {branchToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <button
                        type="button"
                        aria-label="Close delete confirmation"
                        onClick={() => setBranchToDelete(null)}
                        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
                    />
                    <section
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="delete-branch-title"
                        className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                            <Trash2 size={22} />
                        </div>
                        <h3 id="delete-branch-title" className="mt-4 text-lg font-bold text-[#173F35]">
                            Delete branch?
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold text-slate-700">{branchToDelete.name}</span>?
                            This action cannot be undone.
                        </p>
                        <p className="mt-2 text-xs leading-5 text-amber-700">
                            Before deleting a real branch, make sure it has no upcoming bookings or records that need to be retained.
                        </p>
                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setBranchToDelete(null)}
                                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteBranch}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
                            >
                                <Trash2 size={16} />
                                Delete branch
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}
