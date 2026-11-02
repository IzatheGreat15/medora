
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Search,
    CalendarDays,
    Clock3,
    Check,
    X,
    ChevronDown,
    ArrowUpRight,
    Phone,
    Mail,
    Building2,
    Stethoscope,
    ClipboardList,
    Eye,
    StickyNote,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
} from "lucide-react";

import {
    getClinicBookings,
    updateBookingStatus as saveBookingStatus,
    type DashboardBooking,
} from "./actions";
import Toast from "@/components/shared/Toast";

type BookingStatus = "Pending" | "Confirmed" | "Declined" | "Completed";

const statuses: BookingStatus[] = [
    "Pending",
    "Confirmed",
    "Declined",
    "Completed",
];

function formatDate(date: string) {
    return new Date(`${date}T12:00:00`).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatTime(time: string) {
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-PH", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

function getStatusClasses(status: BookingStatus) {
    switch (status) {
        case "Pending":
            return "bg-amber-50 text-amber-700 ring-amber-600/20";
        case "Confirmed":
            return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
        case "Declined":
            return "bg-rose-50 text-rose-700 ring-rose-600/20";
        case "Completed":
            return "bg-slate-100 text-slate-600 ring-slate-500/20";
    }
}

function StatusBadge({ status }: { status: BookingStatus }) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusClasses(status)}`}
        >
            {status}
        </span>
    );
}

function DetailRow({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DDF3E7] text-[#176B55]">
                {icon}
            </div>

            <div className="min-w-0">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 break-words text-sm font-semibold text-[#173F35]">
                    {value}
                </p>
            </div>
        </div>
    );
}

export default function BookingsPage() {
    const [bookings, setBookings] = useState<DashboardBooking[]>([]);
    const [selectedBooking, setSelectedBooking] =
        useState<DashboardBooking | null>(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All statuses");
    const [branchFilter, setBranchFilter] = useState("All branches");

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [isLoading, setIsLoading] = useState(true);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const [loadError, setLoadError] = useState("");
    const [actionMessage, setActionMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "error">("success");

    const loadBookings = useCallback(async () => {
        setIsLoading(true);
        setLoadError("");

        try {
            const result = await getClinicBookings();
            setBookings(result);

            // Keep the selected drawer in sync after refreshing.
            setSelectedBooking((current) => {
                if (!current) return null;
                return result.find((booking) => booking.id === current.id) ?? null;
            });
        } catch (error) {
            setLoadError(
                error instanceof Error
                    ? error.message
                    : "Unable to load bookings.",
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadBookings();
    }, [loadBookings]);

    const branches = useMemo(
        () =>
            [...new Set(bookings.map((booking) => booking.branch))]
                .filter(Boolean)
                .sort(),
        [bookings],
    );

    const filteredBookings = useMemo(() => {
        const query = search.trim().toLowerCase();

        return bookings.filter((booking) => {
            const matchesSearch =
                !query ||
                [
                    booking.id,
                    booking.patient,
                    booking.email,
                    booking.phone,
                    booking.doctor,
                    booking.service,
                    booking.branch,
                ].some((value) =>
                    value?.toLowerCase().includes(query),
                );

            const matchesStatus =
                statusFilter === "All statuses" ||
                booking.status === statusFilter;

            const matchesBranch =
                branchFilter === "All branches" ||
                booking.branch === branchFilter;

            return matchesSearch && matchesStatus && matchesBranch;
        });
    }, [bookings, search, statusFilter, branchFilter]);

    const counts = useMemo(
        () => ({
            all: bookings.length,
            pending: bookings.filter((b) => b.status === "Pending").length,
            confirmed: bookings.filter((b) => b.status === "Confirmed").length,
            completed: bookings.filter((b) => b.status === "Completed").length,
        }),
        [bookings],
    );

    const totalBookings = filteredBookings.length;
    const totalPages = Math.max(1, Math.ceil(totalBookings / pageSize));

    const paginatedBookings = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredBookings.slice(startIndex, startIndex + pageSize);
    }, [filteredBookings, currentPage, pageSize]);

    const startItem =
        totalBookings === 0 ? 0 : (currentPage - 1) * pageSize + 1;

    const endItem = Math.min(currentPage * pageSize, totalBookings);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, branchFilter, pageSize]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    async function updateStatus(
        booking: DashboardBooking,
        status: "Confirmed" | "Declined",
    ) {
        if (isUpdatingStatus) return;

        setIsUpdatingStatus(true);
        setActionMessage("");

        try {
            await saveBookingStatus(
                booking.id,
                status === "Confirmed" ? "Approved" : "Rejected",
            );

            await loadBookings();

            setSelectedBooking(null);
            setMessageType("success");
            setActionMessage(
                `${booking.patient}'s booking was ${status.toLowerCase()}.`,
            );
        } catch (error) {
            setMessageType("error");
            setActionMessage(
                error instanceof Error
                    ? error.message
                    : "Unable to update the booking status.",
            );
        } finally {
            setIsUpdatingStatus(false);
        }
    }

    function openBooking(booking: DashboardBooking) {
        setSelectedBooking(booking);
        setActionMessage("");
    }

    function getPaginationPages(
        current: number,
        total: number,
    ): (number | "...")[] {
        if (total <= 7) {
            return Array.from({ length: total }, (_, index) => index + 1);
        }

        if (current <= 4) {
            return [1, 2, 3, 4, 5, "...", total];
        }

        if (current >= total - 3) {
            return [
                1,
                "...",
                total - 4,
                total - 3,
                total - 2,
                total - 1,
                total,
            ];
        }

        return [
            1,
            "...",
            current - 1,
            current,
            current + 1,
            "...",
            total,
        ];
    }

    return (
        <div className="mx-auto space-y-6">
            {/* Feedback messages */}
            {actionMessage && (
                <Toast
                    message={actionMessage}
                    type={messageType}
                    onClose={() => setActionMessage("")}
                />
            )}
            

            {/* Summary cards */}
            <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                {[
                    {
                        label: "All bookings",
                        value: counts.all,
                        icon: CalendarDays,
                        color: "bg-slate-100 text-slate-600",
                    },
                    {
                        label: "Pending approval",
                        value: counts.pending,
                        icon: Clock3,
                        color: "bg-amber-50 text-amber-700",
                    },
                    {
                        label: "Confirmed",
                        value: counts.confirmed,
                        icon: Check,
                        color: "bg-emerald-50 text-emerald-700",
                    },
                    {
                        label: "Completed",
                        value: counts.completed,
                        icon: ArrowUpRight,
                        color: "bg-[#DDF3E7] text-[#176B55]",
                    },
                ].map(({ label, value, icon: Icon, color }) => (
                    <article
                        key={label}
                        className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02]"
                    >
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-sm text-slate-500">{label}</p>
                            <span
                                className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}
                            >
                                <Icon size={18} />
                            </span>
                        </div>

                        <p className="mt-3 text-3xl font-bold text-[#173F35]">
                            {value}
                        </p>
                    </article>
                ))}
            </section>

            {/* Bookings table */}
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.02]">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-3 sm:p-4">
                    <p className="hidden shrink-0 text-sm text-slate-500 md:block">
                        <span className="font-semibold text-[#173F35]">
                            {filteredBookings.length}
                        </span>{" "}
                        found
                    </p>

                    <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 sm:gap-3">
                        <div className="relative min-w-[140px] flex-1 sm:max-w-xs">
                            <Search
                                size={18}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search patient, doctor..."
                                aria-label="Search bookings"
                                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#82A995] focus:ring-2 focus:ring-[#DDF3E7] sm:h-11 sm:pl-10"
                            />
                        </div>

                        <div className="relative w-[120px] shrink-0 sm:w-36">
                            <select
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value)}
                                aria-label="Filter by status"
                                className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-2 pr-7 text-xs text-slate-600 outline-none focus:border-[#82A995] sm:h-11 sm:pl-3 sm:pr-9 sm:text-sm"
                            >
                                <option>All statuses</option>
                                {statuses.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                size={15}
                                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 sm:right-3"
                            />
                        </div>

                        <div className="relative hidden w-36 shrink-0 sm:block">
                            <select
                                value={branchFilter}
                                onChange={(event) => setBranchFilter(event.target.value)}
                                aria-label="Filter by branch"
                                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm text-slate-600 outline-none focus:border-[#82A995]"
                            >
                                <option>All branches</option>
                                {branches.map((branch) => (
                                    <option key={branch} value={branch}>
                                        {branch}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                size={15}
                                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => void loadBookings()}
                            disabled={isLoading}
                            title="Refresh bookings"
                            aria-label="Refresh bookings"
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-50 sm:h-11 sm:w-11"
                        >
                            <RefreshCw
                                size={17}
                                className={isLoading ? "animate-spin" : ""}
                            />
                        </button>
                    </div>
                </div>

                {/* Loading */}
                {isLoading && bookings.length === 0 && (
                    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                        <RefreshCw size={24} className="animate-spin text-[#176B55]" />
                        <p className="mt-4 text-sm font-medium text-slate-600">
                            Loading bookings...
                        </p>
                    </div>
                )}

                {/* Error */}
                {!isLoading && loadError && bookings.length === 0 && (
                    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                        <p className="text-sm font-semibold text-rose-700">
                            Unable to load bookings
                        </p>
                        <p className="mt-2 max-w-md text-sm text-slate-500">
                            {loadError}
                        </p>
                        <button
                            type="button"
                            onClick={() => void loadBookings()}
                            className="mt-5 rounded-xl bg-[#176B55] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#173F35]"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* Table */}
                {(!isLoading || bookings.length > 0) && (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] text-left">
                                <thead>
                                    <tr className="border-y border-slate-100 bg-slate-50/80">
                                        {[
                                            "Patient",
                                            "Date & time",
                                            "Service",
                                            "Doctor",
                                            "Branch",
                                            "Status",
                                            "Action",
                                        ].map((heading) => (
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
                                    {paginatedBookings.map((booking) => (
                                        <tr
                                            key={booking.id}
                                            onClick={() => openBooking(booking)}
                                            className="cursor-pointer transition hover:bg-[#F7F9F6]/80"
                                        >
                                            <td className="px-5 py-4">
                                                <p className="whitespace-nowrap text-sm font-semibold text-[#173F35]">
                                                    {booking.patient}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-400">
                                                    {booking.id}
                                                </p>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4">
                                                <p className="text-sm font-medium text-slate-700">
                                                    {formatDate(booking.date)}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {formatTime(booking.time)}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {booking.service}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                                {booking.doctor}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                                {booking.branch}
                                            </td>

                                            <td className="px-5 py-4">
                                                <StatusBadge status={booking.status} />
                                            </td>

                                            <td className="px-5 py-4">
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        openBooking(booking);
                                                    }}
                                                    aria-label={`View ${booking.patient}'s booking`}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#176B55] transition hover:border-[#82A995] hover:bg-[#DDF3E7]/40"
                                                >
                                                    <Eye size={14} />
                                                    Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {paginatedBookings.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-6 py-16 text-center"
                                            >
                                                <CalendarDays
                                                    size={30}
                                                    className="mx-auto text-slate-300"
                                                />
                                                <p className="mt-3 text-sm font-semibold text-slate-700">
                                                    No bookings found
                                                </p>
                                                <p className="mt-1 text-sm text-slate-400">
                                                    {bookings.length === 0
                                                        ? "Bookings submitted through your public booking page will appear here."
                                                        : "Try adjusting your search or filters."}
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex flex-col gap-4 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                                <span>
                                    Showing{" "}
                                    <span className="font-semibold text-[#173F35]">
                                        {startItem}-{endItem}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-semibold text-[#173F35]">
                                        {totalBookings}
                                    </span>
                                </span>

                                <span className="hidden text-slate-300 sm:inline">|</span>

                                <label className="flex items-center gap-2">
                                    <span>Rows:</span>
                                    <select
                                        value={pageSize}
                                        onChange={(event) =>
                                            setPageSize(Number(event.target.value))
                                        }
                                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-[#82A995]"
                                    >
                                        {[10, 25, 50].map((size) => (
                                            <option key={size} value={size}>
                                                {size}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    disabled={currentPage === 1}
                                    onClick={() =>
                                        setCurrentPage((page) => Math.max(1, page - 1))
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft size={17} />
                                </button>

                                {getPaginationPages(currentPage, totalPages).map(
                                    (page, index) =>
                                        page === "..." ? (
                                            <span
                                                key={`ellipsis-${index}`}
                                                className="px-2 text-sm text-slate-400"
                                            >
                                                ...
                                            </span>
                                        ) : (
                                            <button
                                                key={page}
                                                type="button"
                                                onClick={() => setCurrentPage(page)}
                                                className={`h-9 min-w-9 rounded-lg px-2 text-sm font-semibold transition ${
                                                    currentPage === page
                                                        ? "bg-[#176B55] text-white"
                                                        : "text-slate-600 hover:bg-slate-100"
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ),
                                )}

                                <button
                                    type="button"
                                    disabled={currentPage === totalPages}
                                    onClick={() =>
                                        setCurrentPage((page) =>
                                            Math.min(totalPages, page + 1),
                                        )
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    aria-label="Next page"
                                >
                                    <ChevronRight size={17} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </section>

            {/* Booking details drawer */}
            {selectedBooking && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <button
                        type="button"
                        aria-label="Close booking details"
                        onClick={() => setSelectedBooking(null)}
                        className="absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]"
                    />

                    <aside
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="booking-detail-title"
                        className="relative flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"
                    >
                        {/* Drawer header */}
                        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Booking details
                                </p>
                                <h3
                                    id="booking-detail-title"
                                    className="mt-1 text-xl font-bold text-[#173F35]"
                                >
                                    {selectedBooking.patient}
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    {selectedBooking.id}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedBooking(null)}
                                aria-label="Close details"
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Drawer content */}
                        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm font-medium text-slate-500">
                                    Booking status
                                </span>
                                <StatusBadge status={selectedBooking.status} />
                            </div>

                            {/* Patient information */}
                            <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                    Patient information
                                </p>

                                <p className="mt-3 font-semibold text-[#173F35]">
                                    {selectedBooking.patient}
                                </p>

                                <div className="mt-3 space-y-2">
                                    <p className="flex items-center gap-2 break-all text-sm text-slate-600">
                                        <Mail
                                            size={15}
                                            className="shrink-0 text-slate-400"
                                        />
                                        {selectedBooking.email || "No email provided"}
                                    </p>

                                    <p className="flex items-center gap-2 text-sm text-slate-600">
                                        <Phone
                                            size={15}
                                            className="shrink-0 text-slate-400"
                                        />
                                        {selectedBooking.phone || "No phone provided"}
                                    </p>
                                </div>
                            </section>

                            {/* Appointment information */}
                            <section>
                                <h4 className="font-semibold text-[#173F35]">
                                    Appointment information
                                </h4>

                                <div className="mt-4 space-y-5">
                                    <DetailRow
                                        icon={<CalendarDays size={19} />}
                                        label="Date"
                                        value={formatDate(selectedBooking.date)}
                                    />

                                    <DetailRow
                                        icon={<Clock3 size={19} />}
                                        label="Time"
                                        value={`${formatTime(selectedBooking.time)} · ${selectedBooking.duration} minutes`}
                                    />

                                    <DetailRow
                                        icon={<Building2 size={19} />}
                                        label="Branch"
                                        value={selectedBooking.branch}
                                    />

                                    <DetailRow
                                        icon={<Stethoscope size={19} />}
                                        label="Doctor"
                                        value={selectedBooking.doctor}
                                    />

                                    <DetailRow
                                        icon={<ClipboardList size={19} />}
                                        label="Service"
                                        value={selectedBooking.service}
                                    />
                                </div>
                            </section>

                            {/* Notes */}
                            <section>
                                <div className="flex items-center gap-2">
                                    <StickyNote
                                        size={17}
                                        className="text-[#176B55]"
                                    />
                                    <h4 className="font-semibold text-[#173F35]">
                                        Patient notes
                                    </h4>
                                </div>

                                <div className="mt-3 rounded-xl border border-slate-200 p-4 text-sm leading-6 text-slate-600">
                                    {selectedBooking.notes || "No notes provided."}
                                </div>
                            </section>
                        </div>

                        {/* Drawer actions */}
                        <div className="border-t border-slate-100 bg-white px-6 py-5">
                            {selectedBooking.status === "Pending" ? (
                                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                                    <button
                                        type="button"
                                        disabled={isUpdatingStatus}
                                        onClick={() =>
                                            updateStatus(selectedBooking, "Declined")
                                        }
                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <X size={17} />
                                        Decline booking
                                    </button>

                                    <button
                                        type="button"
                                        disabled={isUpdatingStatus}
                                        onClick={() =>
                                            updateStatus(selectedBooking, "Confirmed")
                                        }
                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#176B55] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#173F35] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Check size={17} />
                                        {isUpdatingStatus
                                            ? "Saving..."
                                            : "Approve booking"}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setSelectedBooking(null)}
                                    className="w-full rounded-xl bg-[#176B55] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#173F35]"
                                >
                                    Done
                                </button>
                            )}

                            <p className="mt-3 text-center text-xs text-slate-400">
                                Booking changes are saved to your clinic.
                            </p>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
}
