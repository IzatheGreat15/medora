
"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    Mail,
    Search,
    ChevronDown,
    Pencil,
    RotateCcw,
    Loader2,
} from "lucide-react";

import {
    getClinicEmailTemplates,
    resetClinicEmailTemplate,
    type ClinicEmailTemplate,
} from "@/components/settings/settings-data-actions";
import Toast, { ToastType } from "@/components/shared/Toast";

type ToastState = {
    message: string;
    type: ToastType;
} | null;

export default function EmailTemplatesSection() {
    const router = useRouter();

    const [templates, setTemplates] = useState<ClinicEmailTemplate[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [resettingCode, setResettingCode] = useState<string | null>(null);
    const [toast, setToast] = useState<ToastState>(null);

    const closeToast = useCallback(() => {
        setToast(null);
    }, []);

    useEffect(() => {
        let active = true;

        async function loadTemplates() {
            try {
                const data = await getClinicEmailTemplates();

                if (active) {
                    setTemplates(data);
                }
            } catch (error) {
                console.error("Failed to load email templates:", error);

                if (active) {
                    setToast({
                        type: "error",
                        message:
                            error instanceof Error
                                ? error.message
                                : "Failed to load email templates.",
                    });
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        }

        loadTemplates();

        return () => {
            active = false;
        };
    }, []);

    const filteredTemplates = templates.filter((template) => {
        const searchValue = search.toLowerCase();

        const matchesSearch =
            template.name.toLowerCase().includes(searchValue) ||
            template.code.toLowerCase().includes(searchValue) ||
            (template.description ?? "").toLowerCase().includes(searchValue);

        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "active" && template.is_active) ||
            (statusFilter === "inactive" && !template.is_active);

        return matchesSearch && matchesStatus;
    });

    function handleEdit(code: string) {
        router.push(
            `/settings/email-templates/${encodeURIComponent(code)}`
        );
    }

    function handleReset(template: ClinicEmailTemplate) {
        if (!template.is_customized || isPending) return;

        const confirmed = window.confirm(
            `Reset "${template.name}" to its default template? Your clinic's customized version will be removed.`
        );

        if (!confirmed) return;

        setToast(null);
        setResettingCode(template.code);

        startTransition(async () => {
            try {
                await resetClinicEmailTemplate(template.code);

                const updatedTemplates = await getClinicEmailTemplates();

                setTemplates(updatedTemplates);

                setToast({
                    type: "success",
                    message: `${template.name} has been reset to its default.`,
                });
            } catch (error) {
                console.error("Failed to reset email template:", error);

                setToast({
                    type: "error",
                    message:
                        error instanceof Error
                            ? error.message
                            : "Failed to reset email template.",
                });
            } finally {
                setResettingCode(null);
            }
        });
    }

    return (
        <>
            {/* Toast notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={closeToast}
                />
            )}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {/* Search and filter */}
                <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    {/* Section heading */}
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DDF3E7] text-[#176B55]">
                            <Mail size={21} />
                        </div>

                        <div>
                            <h2 className="font-semibold text-[#173F35]">
                                Email templates
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Manage the emails sent to your patients.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        {/* Search */}
                        <div className="relative">
                            <Search
                                size={19}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search templates..."
                                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#82A995] focus:ring-2 focus:ring-[#DDF3E7] sm:w-[300px]"
                            />
                        </div>

                        {/* Status filter */}
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value)}
                                className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-600 outline-none focus:border-[#82A995] focus:ring-2 focus:ring-[#DDF3E7] sm:w-[160px]"
                            >
                                <option value="all">All statuses</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>

                            <ChevronDown
                                size={17}
                                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto px-5 sm:px-6">
                    <table className="w-full min-w-[600px]">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="px-4 py-5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Email template
                                </th>

                                <th className="px-4 py-5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Status
                                </th>

                                <th className="px-4 py-5 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={3} className="py-12 text-center">
                                        <Loader2
                                            size={22}
                                            className="mx-auto animate-spin text-[#176B55]"
                                        />
                                        <p className="mt-2 text-sm text-slate-500">
                                            Loading email templates...
                                        </p>
                                    </td>
                                </tr>
                            ) : filteredTemplates.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="py-12 text-center text-sm text-slate-500"
                                    >
                                        No email templates found.
                                    </td>
                                </tr>
                            ) : (
                                filteredTemplates.map((template) => (
                                    <tr
                                        key={template.code}
                                        className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50/50"
                                    >
                                        {/* Template */}
                                        <td className="px-4 py-5">
                                            <div>
                                                <p className="font-semibold text-[#173F35]">
                                                    {template.name}
                                                </p>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    {template.code}
                                                </p>

                                                {template.description && (
                                                    <p className="mt-1 max-w-md text-xs text-slate-400">
                                                        {template.description}
                                                    </p>
                                                )}
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-5">
                                            <div className="flex flex-col items-start gap-2">
                                                <span
                                                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${template.is_active
                                                            ? "bg-[#DDF3E7] text-[#176B55]"
                                                            : "bg-slate-100 text-slate-500"
                                                        }`}
                                                >
                                                    <span
                                                        className={`h-2 w-2 rounded-full ${template.is_active
                                                                ? "bg-[#176B55]"
                                                                : "bg-slate-400"
                                                            }`}
                                                    />
                                                    {template.is_active ? "Active" : "Inactive"}
                                                </span>

                                                <span className="text-xs text-slate-500">
                                                    {template.is_customized
                                                        ? "Customized"
                                                        : "Default"}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-5">
                                            <div className="flex items-center justify-end gap-5">
                                                {/* Edit */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleEdit(template.code)}
                                                    title="Edit template"
                                                    aria-label={`Edit ${template.name}`}
                                                    className="text-slate-500 transition hover:text-[#176B55]"
                                                >
                                                    <Pencil size={20} strokeWidth={1.8} />
                                                </button>

                                                {/* Reset to default */}
                                                {template.is_customized && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleReset(template)}
                                                        disabled={isPending}
                                                        title="Reset to default"
                                                        aria-label={`Reset ${template.name} to default`}
                                                        className="text-slate-500 transition hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        {resettingCode === template.code ? (
                                                            <Loader2
                                                                size={20}
                                                                className="animate-spin"
                                                            />
                                                        ) : (
                                                            <RotateCcw
                                                                size={20}
                                                                strokeWidth={1.8}
                                                            />
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer note */}
                <div className="mx-5 mb-5 mt-3 flex items-start gap-2 rounded-xl bg-slate-50 p-3 sm:mx-6">
                    <Mail size={16} className="mt-0.5 shrink-0 text-slate-500" />

                    <p className="text-xs leading-5 text-slate-500">
                        All clinics use the default email templates unless they customize
                        them. Resetting a template restores the global default.
                    </p>
                </div>
            </section>
        </>
    );
}
