
"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
    Plus,
    Search,
    ClipboardList,
    Clock3,
    PhilippinePeso,
    Pencil,
    Trash2,
    X,
    Check,
    Ban,
} from "lucide-react";

type Service = {
    id: string;
    name: string;
    duration: number;
    rate: number;
    active: boolean;
};

type ServiceFormData = {
    name: string;
    duration: string;
    rate: string;
};

const initialServices: Service[] = [
    {
        id: "service-1",
        name: "General Consultation",
        duration: 30,
        rate: 500,
        active: true,
    },
    {
        id: "service-2",
        name: "Follow-up Consultation",
        duration: 20,
        rate: 350,
        active: true,
    },
    {
        id: "service-3",
        name: "Physical Examination",
        duration: 45,
        rate: 800,
        active: true,
    },
    {
        id: "service-4",
        name: "Dental Cleaning",
        duration: 60,
        rate: 1200,
        active: true,
    },
    {
        id: "service-5",
        name: "Laboratory Consultation",
        duration: 30,
        rate: 650,
        active: false,
    },
];

const emptyForm: ServiceFormData = {
    name: "",
    duration: "30",
    rate: "",
};

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 2,
    }).format(amount);

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>(initialServices);
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [form, setForm] = useState<ServiceFormData>(emptyForm);
    const [savedMessage, setSavedMessage] = useState("");
    const [formError, setFormError] = useState("");

    const filteredServices = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return services;

        return services.filter((service) =>
            service.name.toLowerCase().includes(query)
        );
    }, [services, search]);

    const activeServices = services.filter((service) => service.active).length;

    const averageRate =
        services.length > 0
            ? services.reduce((total, service) => total + service.rate, 0) /
            services.length
            : 0;

    const openAddModal = () => {
        setEditingService(null);
        setForm(emptyForm);
        setFormError("");
        setSavedMessage("");
        setModalOpen(true);
    };

    const openEditModal = (service: Service) => {
        setEditingService(service);
        setForm({
            name: service.name,
            duration: String(service.duration),
            rate: String(service.rate),
        });
        setFormError("");
        setSavedMessage("");
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingService(null);
        setForm(emptyForm);
        setFormError("");
    };

    const handleSave = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError("");

        const name = form.name.trim();
        const duration = Number(form.duration);
        const rate = Number(form.rate);

        if (!name) {
            setFormError("Please enter a service name.");
            return;
        }

        if (!Number.isInteger(duration) || duration < 1) {
            setFormError("Duration must be at least 1 minute.");
            return;
        }

        if (form.rate.trim() === "" || !Number.isFinite(rate) || rate < 0) {
            setFormError("Please enter a valid rate of zero or more.");
            return;
        }

        const duplicateName = services.some(
            (service) =>
                service.name.toLowerCase() === name.toLowerCase() &&
                service.id !== editingService?.id
        );

        if (duplicateName) {
            setFormError("A service with this name already exists.");
            return;
        }

        if (editingService) {
            setServices((current) =>
                current.map((service) =>
                    service.id === editingService.id
                        ? { ...service, name, duration, rate }
                        : service
                )
            );
            setSavedMessage("Service updated successfully.");
        } else {
            const newService: Service = {
                id: crypto.randomUUID(),
                name,
                duration,
                rate,
                active: true,
            };

            setServices((current) => [newService, ...current]);
            setSavedMessage("Service added successfully.");
        }

        closeModal();
    };

    const handleToggleStatus = (id: string) => {
        setServices((current) =>
            current.map((service) =>
                service.id === id
                    ? { ...service, active: !service.active }
                    : service
            )
        );

        setSavedMessage("");
    };

    const handleDelete = (service: Service) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${service.name}"?`
        );

        if (!confirmed) return;

        setServices((current) =>
            current.filter((item) => item.id !== service.id)
        );
        setSavedMessage("");
    };

    return (
        <div className="mx-auto space-y-6">
            {/* Summary cards */}
            <div className="grid gap-4 grid-cols-2 xl:grid-cols-3">
                <SummaryCard
                    title="Total services"
                    value={services.length.toString()}
                    description="All clinic services"
                    icon={<ClipboardList className="h-5 w-5" />}
                />

                <SummaryCard
                    title="Active services"
                    value={activeServices.toString()}
                    description="Available for assignment"
                    icon={<Check className="h-5 w-5" />}
                />

                <SummaryCard
                    title="Average default rate"
                    value={formatCurrency(averageRate)}
                    description="Across all services"
                    icon={<PhilippinePeso className="h-5 w-5" />}
                />
            </div>

            {/* Table container */}
            <div className="overflow-hidden rounded-2xl border border-[#E4EBE5] bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-[#E8EEE9] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
                    {/* Title */}
                    <div>
                        <h2 className="font-semibold text-[#173F35]">
                            All services
                        </h2>
                        <p className="mt-1 text-sm text-[#718078]">
                            {filteredServices.length}{" "}
                            {filteredServices.length === 1 ? "service" : "services"} found
                        </p>
                    </div>

                    {/* Search and Add button */}
                    <div className="flex w-full min-w-0 items-center gap-2 sm:gap-3 lg:w-auto lg:flex-1 lg:justify-end">
                        <div className="relative min-w-0 flex-1 lg:max-w-xs">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#829087]" />

                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search services..."
                                aria-label="Search services"
                                className="w-full rounded-xl border border-[#DDE6DF] bg-white py-2.5 pl-9 pr-3 text-sm text-[#173F35] outline-none transition placeholder:text-[#9AA69F] focus:border-[#176B55] focus:ring-2 focus:ring-[#176B55]/10"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={openAddModal}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#176B55] px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#125642] focus:outline-none focus:ring-2 focus:ring-[#176B55] focus:ring-offset-2 sm:px-4"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] text-left">
                        <thead>
                            <tr className="border-b border-[#E8EEE9] bg-[#FAFCFA]">
                                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-[#718078]">
                                    Service name
                                </th>
                                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-[#718078]">
                                    Default duration
                                </th>
                                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-[#718078]">
                                    Default rate
                                </th>
                                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-[#718078]">
                                    Status
                                </th>
                                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#718078]">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#EEF2EF]">
                            {filteredServices.map((service) => (
                                <tr
                                    key={service.id}
                                    className="transition hover:bg-[#FBFDFB]"
                                >
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DDF3E7] text-[#176B55]">
                                                <ClipboardList className="h-5 w-5" />
                                            </div>

                                            <div>
                                                <p className="font-medium text-[#173F35]">
                                                    {service.name}
                                                </p>
                                                <p className="mt-1 text-xs text-[#87938B]">
                                                    Default service offering
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2 text-sm text-[#53645D]">
                                            <Clock3 className="h-4 w-4 text-[#82A995]" />
                                            {service.duration} minutes
                                        </div>
                                    </td>

                                    <td className="px-5 py-4">
                                        <span className="text-sm font-semibold text-[#173F35]">
                                            {formatCurrency(service.rate)}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4">
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${service.active
                                                ? "bg-[#DDF3E7] text-[#176B55]"
                                                : "bg-gray-100 text-gray-500"
                                                }`}
                                        >
                                            <span
                                                className={`h-1.5 w-1.5 rounded-full ${service.active ? "bg-[#176B55]" : "bg-gray-400"
                                                    }`}
                                            />
                                            {service.active ? "Active" : "Inactive"}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end gap-1">
                                            {/* Edit */}
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(service)}
                                                title="Edit service"
                                                aria-label={`Edit ${service.name}`}
                                                className="rounded-lg p-2 text-[#718078] transition hover:bg-[#DDF3E7] hover:text-[#176B55] focus:outline-none focus:ring-2 focus:ring-[#176B55]/30"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>

                                            {/* Activate / Deactivate */}
                                            <button
                                                type="button"
                                                onClick={() => handleToggleStatus(service.id)}
                                                title={
                                                    service.active
                                                        ? "Deactivate service"
                                                        : "Activate service"
                                                }
                                                aria-label={`${service.active ? "Deactivate" : "Activate"
                                                    } ${service.name}`}
                                                className={`rounded-lg p-2 transition focus:outline-none focus:ring-2 focus:ring-[#176B55]/30 ${service.active
                                                    ? "text-[#718078] hover:bg-amber-50 hover:text-amber-700"
                                                    : "text-[#718078] hover:bg-[#DDF3E7] hover:text-[#176B55]"
                                                    }`}
                                            >
                                                {service.active ? (
                                                    <Ban className="h-4 w-4" />
                                                ) : (
                                                    <Check className="h-4 w-4" />
                                                )}
                                            </button>

                                            {/* Delete */}
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(service)}
                                                title="Delete service"
                                                aria-label={`Delete ${service.name}`}
                                                className="rounded-lg p-2 text-[#718078] transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredServices.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-5 py-16 text-center">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0F5F1] text-[#82A995]">
                                            <Search className="h-5 w-5" />
                                        </div>

                                        <p className="mt-3 font-medium text-[#173F35]">
                                            No services found
                                        </p>

                                        <p className="mt-1 text-sm text-[#718078]">
                                            Try another search term or add a new service.
                                        </p>

                                        {search && (
                                            <button
                                                type="button"
                                                onClick={() => setSearch("")}
                                                className="mt-3 text-sm font-semibold text-[#176B55] hover:underline"
                                            >
                                                Clear search
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col gap-2 border-t border-[#E8EEE9] bg-[#FAFCFA] px-5 py-3 text-xs text-[#87938B] sm:flex-row sm:items-center sm:justify-between">
                    <span>
                        Showing {filteredServices.length} of {services.length} services
                    </span>
                    <span>Rates are in Philippine pesos (PHP)</span>
                </div>
            </div>

            {/* Feedback */}
            {savedMessage && (
                <div
                    role="status"
                    className="flex items-center gap-2 rounded-xl border border-[#C9E8D5] bg-[#DDF3E7] px-4 py-3 text-sm text-[#176B55]"
                >
                    <Check className="h-4 w-4 shrink-0" />
                    {savedMessage}
                    <button
                        type="button"
                        onClick={() => setSavedMessage("")}
                        aria-label="Dismiss message"
                        className="ml-auto rounded p-1 hover:bg-white/60"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Add / Edit modal */}
            {modalOpen && (
                <ServiceModal
                    editingService={editingService}
                    form={form}
                    setForm={setForm}
                    formError={formError}
                    onClose={closeModal}
                    onSubmit={handleSave}
                />
            )}
        </div>


    );
}

function SummaryCard({
    title,
    value,
    description,
    icon,
}: {
    title: string;
    value: string;
    description: string;
    icon: ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-[#E4EBE5] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-[#53645D]">{title}</p>
                    <p className="mt-3 text-2xl font-bold tracking-tight text-[#173F35]">
                        {value}
                    </p>
                    <p className="mt-1 text-xs text-[#87938B]">{description}</p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#DDF3E7] text-[#176B55]">
                    {icon}
                </div>
            </div>
        </div>
    );
}

function ServiceModal({
    editingService,
    form,
    setForm,
    formError,
    onClose,
    onSubmit,
}: {
    editingService: Service | null;
    form: ServiceFormData;
    setForm: React.Dispatch<React.SetStateAction<ServiceFormData>>;
    formError: string;
    onClose: () => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#102D25]/45 p-4 backdrop-blur-[2px]"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="service-modal-title"
                className="my-auto w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
                <div className="flex items-start justify-between border-b border-[#E8EEE9] px-6 py-5">
                    <div>
                        <h2
                            id="service-modal-title"
                            className="text-lg font-bold text-[#173F35]"
                        >
                            {editingService ? "Edit service" : "Add a service"}
                        </h2>
                        <p className="mt-1 text-sm text-[#718078]">
                            Set the service name, default duration, and rate.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close modal"
                        className="rounded-lg p-2 text-[#718078] transition hover:bg-[#F0F5F1] hover:text-[#173F35]"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={onSubmit}>
                    <div className="space-y-5 px-6 py-6">
                        <div>
                            <label
                                htmlFor="service-name"
                                className="mb-2 block text-sm font-medium text-[#173F35]"
                            >
                                Service name
                            </label>
                            <input
                                id="service-name"
                                type="text"
                                required
                                autoFocus
                                maxLength={100}
                                value={form.name}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        name: event.target.value,
                                    }))
                                }
                                placeholder="e.g. General Consultation"
                                className="w-full rounded-xl border border-[#DDE6DF] px-4 py-3 text-sm text-[#173F35] outline-none transition placeholder:text-[#9AA69F] focus:border-[#176B55] focus:ring-2 focus:ring-[#176B55]/10"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="service-duration"
                                className="mb-2 block text-sm font-medium text-[#173F35]"
                            >
                                Default duration
                            </label>
                            <div className="relative">
                                <Clock3 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#82A995]" />
                                <input
                                    id="service-duration"
                                    type="number"
                                    required
                                    min="15"
                                    step="15"
                                    value={form.duration}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            duration: event.target.value,
                                        }))
                                    }
                                    placeholder="30"
                                    className="w-full rounded-xl border border-[#DDE6DF] py-3 pl-10 pr-20 text-sm text-[#173F35] outline-none transition placeholder:text-[#9AA69F] focus:border-[#176B55] focus:ring-2 focus:ring-[#176B55]/10"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#87938B]">
                                    minutes
                                </span>
                            </div>
                            <p className="mt-2 text-xs text-[#87938B]">
                                The default appointment length. You can customize it for
                                individual doctors later.
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="service-rate"
                                className="mb-2 block text-sm font-medium text-[#173F35]"
                            >
                                Default rate
                            </label>
                            <div className="relative">
                                <PhilippinePeso className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#82A995]" />
                                <input
                                    id="service-rate"
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={form.rate}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            rate: event.target.value,
                                        }))
                                    }
                                    placeholder="500.00"
                                    className="w-full rounded-xl border border-[#DDE6DF] py-3 pl-10 pr-16 text-sm text-[#173F35] outline-none transition placeholder:text-[#9AA69F] focus:border-[#176B55] focus:ring-2 focus:ring-[#176B55]/10"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#87938B]">
                                    PHP
                                </span>
                            </div>
                            <p className="mt-2 text-xs text-[#87938B]">
                                The default price before any doctor-specific rate adjustment.
                            </p>
                        </div>

                        {formError && (
                            <div
                                role="alert"
                                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                            >
                                {formError}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-[#E8EEE9] bg-[#FAFCFA] px-6 py-4 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-[#DDE6DF] px-4 py-2.5 text-sm font-semibold text-[#53645D] transition hover:bg-[#F0F5F1]"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#176B55] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#125642] focus:outline-none focus:ring-2 focus:ring-[#176B55] focus:ring-offset-2"
                        >
                            <Check className="h-4 w-4" />
                            {editingService ? "Save changes" : "Add service"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
