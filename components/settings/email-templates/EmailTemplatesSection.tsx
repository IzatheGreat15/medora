
"use client";

import {
    useCallback,
    useEffect,
    useState,
    useTransition,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
    Mail,
    Search,
    ChevronDown,
    Pencil,
    RotateCcw,
    Loader2,
    AlertTriangle,
    X,
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
    const [templateToReset, setTemplateToReset] =
        useState<ClinicEmailTemplate | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    const closeToast = useCallback(() => {
        setToast(null);
    }, []);

    useEffect(() => {
        setIsMounted(true);
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

    // Close modal with Escape
    useEffect(() => {
        if (!templateToReset || isPending) return;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setTemplateToReset(null);
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [templateToReset, isPending]);

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

        setTemplateToReset(template);
    }

    function confirmReset() {
        if (!templateToReset || isPending) return;

        const template = templateToReset;

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

                setTemplateToReset(null);
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
                setTemplateToReset(null);
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
                                                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
                                                        template.is_active
                                                            ? "bg-[#DDF3E7] text-[#176B55]"
                                                            : "bg-slate-100 text-slate-500"
                                                    }`}
                                                >
                                                    <span
                                                        className={`h-2 w-2 rounded-full ${
                                                            template.is_active
                                                                ? "bg-[#176B55]"
                                                                : "bg-slate-400"
                                                        }`}
                                                    />

                                                    {template.is_active
                                                        ? "Active"
                                                        : "Inactive"}
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
                                                    <Pencil
                                                        size={20}
                                                        strokeWidth={1.8}
                                                    />
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
                    <Mail
                        size={16}
                        className="mt-0.5 shrink-0 text-slate-500"
                    />

                    <p className="text-xs leading-5 text-slate-500">
                        All clinics use the default email templates unless they
                        customize them. Resetting a template restores the global
                        default.
                    </p>
                </div>
            </section>

            {/* Reset confirmation modal - rendered directly inside document.body */}
            {isMounted &&
                templateToReset &&
                createPortal(
                    <div
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
                        onMouseDown={(event) => {
                            if (
                                event.target === event.currentTarget &&
                                !isPending
                            ) {
                                setTemplateToReset(null);
                            }
                        }}
                    >
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="reset-modal-title"
                            className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-7"
                        >
                            {/* Close button */}
                            <button
                                type="button"
                                onClick={() => setTemplateToReset(null)}
                                disabled={isPending}
                                aria-label="Close modal"
                                className="absolute right-5 top-5 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
                            >
                                <X size={20} />
                            </button>

                            {/* Warning icon */}
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                                <AlertTriangle size={26} strokeWidth={2} />
                            </div>

                            {/* Heading */}
                            <h2
                                id="reset-modal-title"
                                className="mt-6 text-xl font-semibold text-[#173F35]"
                            >
                                Reset email template?
                            </h2>

                            {/* Description */}
                            <p className="mt-3 text-sm leading-7 text-slate-500">
                                Are you sure you want to reset{" "}
                                <span className="font-semibold text-slate-700">
                                    {templateToReset.name}
                                </span>{" "}
                                to its default version?
                            </p>

                            {/* Warning message */}
                            <div className="mt-5 rounded-xl border border-orange-100 bg-orange-50 p-4">
                                <p className="text-sm leading-6 text-[#7C4A16]">
                                    Your clinic&apos;s customized subject and
                                    email content will be removed. The global
                                    default template will be used instead.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setTemplateToReset(null)}
                                    disabled={isPending}
                                    className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 px-6 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={confirmReset}
                                    disabled={isPending}
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2
                                                size={17}
                                                className="animate-spin"
                                            />
                                            Resetting...
                                        </>
                                    ) : (
                                        <>
                                            <RotateCcw size={17} />
                                            Reset to Default
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}
