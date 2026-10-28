
"use client";

import { useMemo, useState } from "react";
import {
    Search,
    Plus,
    Pencil,
    Trash2,
    X,
    Layers3,
    Check,
} from "lucide-react";

type SubscriptionPlan = {
    id: string;
    name: string;
    price: number;
    maxDoctors: number;
    maxBranches: number;
    description: string;
    features: string[];
    isActive: boolean;
};

type PlanForm = Omit<SubscriptionPlan, "id">;

const emptyForm: PlanForm = {
    name: "",
    price: 0,
    maxDoctors: 1,
    maxBranches: 1,
    description: "",
    features: [""],
    isActive: true,
};

const initialPlans: SubscriptionPlan[] = [
    {
        id: "PLAN-001",
        name: "Starter",
        price: 999,
        maxDoctors: 2,
        maxBranches: 1,
        description: "",
        features: ["For small dental clinics getting started."],
        isActive: true,
    },
    {
        id: "PLAN-002",
        name: "Growth",
        price: 1999,
        maxDoctors: 5,
        maxBranches: 3,
        description: "",
        features: ["For growing clinics with multiple doctors."],
        isActive: true,
    },
    {
        id: "PLAN-003",
        name: "Professional",
        price: 3499,
        maxDoctors: 10,
        maxBranches: 5,
        description: "",
        features: ["For established multi-branch clinics."],
        isActive: true,
    },
];

export default function SubscriptionPlansPage() {
    const [plans, setPlans] = useState(initialPlans);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] =
        useState<SubscriptionPlan | null>(null);
    const [form, setForm] = useState<PlanForm>(emptyForm);
    const [deleteTarget, setDeleteTarget] =
        useState<SubscriptionPlan | null>(null);

    const filteredPlans = useMemo(() => {
        return plans.filter((plan) => {
            const matchesSearch = plan.name
                .toLowerCase()
                .includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && plan.isActive) ||
                (statusFilter === "inactive" && !plan.isActive);

            return matchesSearch && matchesStatus;
        });
    }, [plans, search, statusFilter]);

    function openAddModal() {
        setEditingPlan(null);
        setForm(emptyForm);
        setModalOpen(true);
    }

    function openEditModal(plan: SubscriptionPlan) {
        setEditingPlan(plan);
        setForm({
            name: plan.name,
            price: plan.price,
            maxDoctors: plan.maxDoctors,
            maxBranches: plan.maxBranches,
            description: plan.description,
            features: plan.features,
            isActive: plan.isActive,
        });
        setModalOpen(true);
    }

    function savePlan(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (
            !form.name.trim() ||
            form.price < 0 ||
            form.maxDoctors < 1 ||
            form.maxBranches < 1
        ) {
            return;
        }

        if (editingPlan) {
            setPlans((current) =>
                current.map((plan) =>
                    plan.id === editingPlan.id
                        ? { ...plan, ...form, name: form.name.trim() }
                        : plan
                )
            );
        } else {
            const newPlan: SubscriptionPlan = {
                id: `PLAN-${String(Date.now()).slice(-6)}`,
                ...form,
                name: form.name.trim(),
            };

            setPlans((current) => [...current, newPlan]);
        }

        setModalOpen(false);
    }

    function deletePlan() {
        if (!deleteTarget) return;

        setPlans((current) =>
            current.filter((plan) => plan.id !== deleteTarget.id)
        );
        setDeleteTarget(null);
    }

    function updateField<K extends keyof PlanForm>(
        key: K,
        value: PlanForm[K]
    ) {
        setForm((current) => ({ ...current, [key]: value }));
    }

    return (
        <div className="space-y-6">
            {/* Plans table */}
            <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-100 p-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-500">
                        <span className="font-semibold text-[#173F35]">
                            {filteredPlans.length}
                        </span>{" "}
                        {filteredPlans.length === 1 ? "plan" : "plans"} found
                    </p>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative">
                            <Search
                                size={19}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search..."
                                aria-label="Search subscription plans"
                                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#176B55] focus:ring-2 focus:ring-[#176B55]/10 sm:w-[230px]"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            aria-label="Filter plans by status"
                            className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#176B55] sm:w-[170px]"
                        >
                            <option value="all">All statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        <button
                            type="button"
                            onClick={openAddModal}
                            aria-label="Add subscription plan"
                            title="Add subscription plan"
                            className="flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-xl bg-[#176B55] text-white transition hover:bg-[#125642] focus:outline-none focus:ring-4 focus:ring-[#176B55]/20 sm:self-auto"
                        >
                            <Plus size={23} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[850px] text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                <th className="px-6 py-4">Plan</th>
                                <th className="px-6 py-4">Price / month</th>
                                <th className="px-6 py-4">Doctors</th>
                                <th className="px-6 py-4">Branches</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {filteredPlans.map((plan) => (
                                <tr
                                    key={plan.id}
                                    className="transition hover:bg-slate-50/60"
                                >
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#DDF3E7] text-[#176B55]">
                                                <Layers3 size={22} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-[#173F35]">
                                                    {plan.name}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-400">
                                                    {plan.id}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-5">
                                        <span className="font-semibold text-[#173F35]">
                                            ₱{plan.price.toLocaleString("en-PH")}
                                        </span>
                                        <span className="text-slate-400"> / mo</span>
                                    </td>

                                    <td className="px-6 py-5 text-sm text-slate-600">
                                        {plan.maxDoctors} doctors
                                    </td>

                                    <td className="px-6 py-5 text-sm text-slate-600">
                                        {plan.maxBranches} branches
                                    </td>

                                    <td className="px-6 py-5">
                                        <span
                                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${plan.isActive
                                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                : "border-slate-200 bg-slate-100 text-slate-600"
                                                }`}
                                        >
                                            <span
                                                className={`h-2 w-2 rounded-full ${plan.isActive
                                                    ? "bg-emerald-500"
                                                    : "bg-slate-400"
                                                    }`}
                                            />
                                            {plan.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>

                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(plan)}
                                                aria-label={`Edit ${plan.name}`}
                                                title="Edit plan"
                                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-[#82A995] hover:bg-[#DDF3E7] hover:text-[#176B55] focus:outline-none focus:ring-4 focus:ring-[#DDF3E7]"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDeleteTarget(plan)}
                                                aria-label={`Delete ${plan.name}`}
                                                title="Delete plan"
                                                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredPlans.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <Layers3
                                            size={32}
                                            className="mx-auto text-slate-300"
                                        />
                                        <p className="mt-3 font-medium text-[#173F35]">
                                            No subscription plans found
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Try another search or add a new plan.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add / Edit modal */}
            {modalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-[2px]"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setModalOpen(false);
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="plan-modal-title"
                        className="my-auto w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                    >
                        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                            <div>
                                <h3
                                    id="plan-modal-title"
                                    className="text-xl font-bold text-[#173F35]"
                                >
                                    {editingPlan ? "Edit subscription plan" : "Add subscription plan"}
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    Configure the plan details and usage limits.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                aria-label="Close modal"
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={savePlan} className="space-y-5 p-6">
                            <div className="space-y-1.5">
                                <label htmlFor="plan-name" className="text-sm font-medium text-slate-700">
                                    Plan name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="plan-name"
                                    required
                                    maxLength={60}
                                    value={form.name}
                                    onChange={(event) => updateField("name", event.target.value)}
                                    placeholder="e.g. Starter"
                                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#176B55] focus:ring-2 focus:ring-[#176B55]/10"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    Plan features
                                </label>

                                <div className="space-y-2">
                                    {form.features.map((item, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <span className="text-slate-400">•</span>

                                            <input
                                                type="text"
                                                value={item}
                                                maxLength={150}
                                                onChange={(event) => {
                                                    const updated = [...form.features];
                                                    updated[index] = event.target.value;
                                                    updateField("features", updated);
                                                }}
                                                placeholder={`Feature ${index + 1}`}
                                                className="h-11 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#176B55] focus:ring-2 focus:ring-[#176B55]/10"
                                            />

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    updateField(
                                                        "features",
                                                        form.features.filter((_, i) => i !== index)
                                                    );
                                                }}
                                                disabled={form.features.length === 1}
                                                aria-label={`Remove feature ${index + 1}`}
                                                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                                            >
                                                <Trash2 size={17} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        updateField("features", [...form.features, ""]);
                                    }}
                                    className="inline-flex items-center gap-2 rounded-lg py-2 text-sm font-semibold text-[#176B55] hover:text-[#125642]"
                                >
                                    <Plus size={16} />
                                    Add feature
                                </button>

                                <p className="text-xs text-slate-400">
                                    List the features and benefits included in this subscription plan.
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="plan-price" className="text-sm font-medium text-slate-700">
                                    Monthly price (PHP) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                                        ₱
                                    </span>
                                    <input
                                        id="plan-price"
                                        required
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.price}
                                        onChange={(event) => updateField("price", Number(event.target.value))}
                                        className="h-11 w-full rounded-xl border border-slate-200 pl-8 pr-3 text-sm outline-none focus:border-[#176B55] focus:ring-2 focus:ring-[#176B55]/10"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label htmlFor="plan-doctors" className="text-sm font-medium text-slate-700">
                                        Maximum doctors
                                    </label>
                                    <input
                                        id="plan-doctors"
                                        required
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={form.maxDoctors}
                                        onChange={(event) => updateField("maxDoctors", Number(event.target.value))}
                                        className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#176B55] focus:ring-2 focus:ring-[#176B55]/10"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="plan-branches" className="text-sm font-medium text-slate-700">
                                        Maximum branches
                                    </label>
                                    <input
                                        id="plan-branches"
                                        required
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={form.maxBranches}
                                        onChange={(event) => updateField("maxBranches", Number(event.target.value))}
                                        className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#176B55] focus:ring-2 focus:ring-[#176B55]/10"
                                    />
                                </div>
                            </div>

                            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
                                <input
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={(event) => updateField("isActive", event.target.checked)}
                                    className="mt-0.5 h-4 w-4 accent-[#176B55]"
                                />
                                <span>
                                    <span className="block text-sm font-semibold text-[#173F35]">
                                        Active plan
                                    </span>
                                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                                        Allow this plan to be assigned to clinics.
                                    </span>
                                </span>
                            </label>

                            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#176B55] px-5 text-sm font-semibold text-white transition hover:bg-[#125642]"
                                >
                                    <Check size={17} />
                                    {editingPlan ? "Save changes" : "Create plan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete confirmation */}
            {deleteTarget && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4">
                    <div
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="delete-title"
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                            <Trash2 size={22} />
                        </div>
                        <h3 id="delete-title" className="mt-4 text-lg font-bold text-[#173F35]">
                            Delete {deleteTarget.name}?
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            This removes the plan from this demo. In production, check whether
                            any clinics are subscribed to it before allowing deletion.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={deletePlan}
                                className="h-10 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
                            >
                                Delete plan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
