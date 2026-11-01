
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
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
  AlertTriangle,
  LoaderCircle,
} from "lucide-react";

import {
  getServices,
  createService,
  updateService,
  setServiceStatus,
  deleteService,
  type Service,
} from "./actions";

type ServiceFormData = {
  name: string;
  duration: string;
  rate: string;
};

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

const isActive = (service: Service) => service.status === "Active";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState<ServiceFormData>(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [savedMessage, setSavedMessage] = useState("");
  const [pageError, setPageError] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadServices = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const data = await getServices();
      setServices(data);
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Unable to load services."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadServices();
  }, [loadServices]);

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return services;

    return services.filter((service) =>
      service.name.toLowerCase().includes(query)
    );
  }, [services, search]);

  const activeServices = services.filter(isActive).length;

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
    if (saving) return;

    setModalOpen(false);
    setEditingService(null);
    setForm(emptyForm);
    setFormError("");
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setSavedMessage("");

    const name = form.name.trim();
    const duration = Number(form.duration);
    const rate = Number(form.rate);

    if (!name) {
      setFormError("Please enter a service name.");
      return;
    }

    if (name.length > 100) {
      setFormError("The service name cannot exceed 100 characters.");
      return;
    }

    if (!Number.isInteger(duration) || duration < 1 || duration > 1440) {
      setFormError("Duration must be between 1 and 1440 minutes.");
      return;
    }

    if (
      form.rate.trim() === "" ||
      !Number.isFinite(rate) ||
      rate < 0 ||
      rate > 99999999.99
    ) {
      setFormError("Please enter a valid rate of zero or more.");
      return;
    }

    setSaving(true);

    try {
      if (editingService) {
        await updateService(editingService.id, {
          name,
          duration,
          rate,
        });
        setSavedMessage("Service updated successfully.");
      } else {
        await createService({
          name,
          duration,
          rate,
        });
        setSavedMessage("Service added successfully.");
      }

      setModalOpen(false);
      setEditingService(null);
      setForm(emptyForm);

      await loadServices();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to save service."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (service: Service) => {
    const nextStatus = isActive(service) ? "Inactive" : "Active";

    setProcessingId(service.id);
    setPageError("");
    setSavedMessage("");

    try {
      await setServiceStatus(service.id, nextStatus);
      await loadServices();

      setSavedMessage(
        nextStatus === "Active"
          ? "Service activated successfully."
          : "Service deactivated successfully."
      );
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Unable to update service status."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const openDeleteModal = (service: Service) => {
    setPageError("");
    setSavedMessage("");
    setDeleteTarget(service);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setDeleteTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;

    const service = deleteTarget;

    setDeleting(true);
    setPageError("");
    setSavedMessage("");

    try {
      await deleteService(service.id);

      setServices((current) =>
        current.filter((item) => item.id !== service.id)
      );

      setDeleteTarget(null);
      setSavedMessage("Service deleted successfully.");
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Unable to delete service."
      );
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
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

      {/* Error feedback */}
      {pageError && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span>{pageError}</span>
          <button
            type="button"
            onClick={() => setPageError("")}
            aria-label="Dismiss error"
            className="shrink-0 rounded p-1 hover:bg-red-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Services table */}
      <div className="overflow-hidden rounded-2xl border border-[#E4EBE5] bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-[#E8EEE9] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold text-[#173F35]">All services</h2>
            <p className="mt-1 text-sm text-[#718078]">
              {loading
                ? "Loading services..."
                : `${filteredServices.length} ${
                    filteredServices.length === 1 ? "service" : "services"
                  } found`}
            </p>
          </div>

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
              title="Add service"
              aria-label="Add service"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#176B55] px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#125642] focus:outline-none focus:ring-2 focus:ring-[#176B55] focus:ring-offset-2 sm:px-4"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add service</span>
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
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-16 text-center text-sm text-[#718078]"
                  >
                    Loading services...
                  </td>
                </tr>
              ) : (
                <>
                  {filteredServices.map((service) => {
                    const active = isActive(service);
                    const processing = processingId === service.id;

                    return (
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
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                              active
                                ? "bg-[#DDF3E7] text-[#176B55]"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                active ? "bg-[#176B55]" : "bg-gray-400"
                              }`}
                            />
                            {active ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openEditModal(service)}
                              disabled={processing}
                              title="Edit service"
                              aria-label={`Edit ${service.name}`}
                              className="rounded-lg p-2 text-[#718078] transition hover:bg-[#DDF3E7] hover:text-[#176B55] focus:outline-none focus:ring-2 focus:ring-[#176B55]/30 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => void handleToggleStatus(service)}
                              disabled={processing}
                              title={active ? "Deactivate service" : "Activate service"}
                              aria-label={`${active ? "Deactivate" : "Activate"} ${service.name}`}
                              className={`rounded-lg p-2 transition focus:outline-none focus:ring-2 focus:ring-[#176B55]/30 disabled:cursor-not-allowed disabled:opacity-40 ${
                                active
                                  ? "text-[#718078] hover:bg-amber-50 hover:text-amber-700"
                                  : "text-[#718078] hover:bg-[#DDF3E7] hover:text-[#176B55]"
                              }`}
                            >
                              {active ? (
                                <Ban className="h-4 w-4" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => openDeleteModal(service)}
                              disabled={processing || deleting}
                              title="Delete service"
                              aria-label={`Delete ${service.name}`}
                              className="rounded-lg p-2 text-[#718078] transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

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
                          {search
                            ? "Try another search term."
                            : "Add your first service to get started."}
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
                </>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 border-t border-[#E8EEE9] bg-[#FAFCFA] px-5 py-3 text-xs text-[#87938B] sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing {loading ? 0 : filteredServices.length} of{" "}
            {loading ? 0 : services.length} services
          </span>
          <span>Rates are in Philippine pesos (PHP)</span>
        </div>
      </div>

      {/* Success feedback */}
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
          saving={saving}
          onClose={closeModal}
          onSubmit={handleSave}
        />
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteConfirmationModal
          serviceName={deleteTarget.name}
          deleting={deleting}
          onCancel={closeDeleteModal}
          onConfirm={handleDelete}
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
  saving,
  onClose,
  onSubmit,
}: {
  editingService: Service | null;
  form: ServiceFormData;
  setForm: React.Dispatch<React.SetStateAction<ServiceFormData>>;
  formError: string;
  saving: boolean;
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
            disabled={saving}
            aria-label="Close modal"
            className="rounded-lg p-2 text-[#718078] transition hover:bg-[#F0F5F1] hover:text-[#173F35] disabled:opacity-40"
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
                  min="1"
                  max="1440"
                  step="1"
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
                The default appointment length.
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
                  max="99999999.99"
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
                The default price before any doctor-specific adjustment.
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
              disabled={saving}
              className="rounded-xl border border-[#DDE6DF] px-4 py-2.5 text-sm font-semibold text-[#53645D] transition hover:bg-[#F0F5F1] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#176B55] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#125642] focus:outline-none focus:ring-2 focus:ring-[#176B55] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {saving
                ? "Saving..."
                : editingService
                  ? "Save changes"
                  : "Add service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmationModal({
  serviceName,
  deleting,
  onCancel,
  onConfirm,
}: {
  serviceName: string;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#102D25]/45 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !deleting) {
          onCancel();
        }
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-service-title"
        aria-describedby="delete-service-description"
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle className="h-6 w-6" />
          </div>

          <h2
            id="delete-service-title"
            className="mt-4 text-lg font-bold text-[#173F35]"
          >
            Delete service?
          </h2>

          <p
            id="delete-service-description"
            className="mt-2 text-sm leading-6 text-[#718078]"
          >
            Are you sure you want to permanently delete{" "}
            <span className="font-semibold text-[#173F35]">
              {serviceName}
            </span>
            ? This action cannot be undone.
          </p>

          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs leading-5 text-amber-800">
              If this service is associated with existing appointments, the
              database may prevent its deletion. Consider deactivating it
              instead if you need to keep its history.
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#E8EEE9] bg-[#FAFCFA] px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-xl border border-[#DDE6DF] px-4 py-2.5 text-sm font-semibold text-[#53645D] transition hover:bg-[#F0F5F1] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {deleting ? "Deleting..." : "Delete service"}
          </button>
        </div>
      </div>
    </div>
  );
}
