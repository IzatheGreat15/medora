
"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Search,
    CalendarDays,
    Clock3,
    Users,
    Building2,
    Stethoscope,
    ClipboardList,
    Eye,
    Check,
    X,
    ChevronDown,
    Plus,
    ArrowUpRight,
    Phone,
    Mail,
    StickyNote,
} from "lucide-react";
import { getCurrentDate } from "@/lib/date";

type BookingStatus = "Pending" | "Confirmed" | "Declined" | "Completed";

type Booking = {
    id: string;
    patient: string;
    email: string;
    phone: string;
    service: string;
    doctor: string;
    branch: string;
    date: string;
    time: string;
    duration: number;
    status: BookingStatus;
    notes: string;
};

const initialBookings: Booking[] = [
    {
        id: "MED-1001",
        patient: "Maria Santos",
        email: "maria@example.com",
        phone: "0917 123 4567",
        service: "General consultation",
        doctor: "Dr. Maria Garcia",
        branch: "Cebu Branch",
        date: "2026-10-24",
        time: "09:00",
        duration: 30,
        status: "Pending",
        notes: "Prefers a morning appointment.",
    },
    {
        id: "MED-1002",
        patient: "Juan Dela Cruz",
        email: "juan@example.com",
        phone: "0918 234 5678",
        service: "Dental cleaning",
        doctor: "Dr. James Reyes",
        branch: "Mandaue Branch",
        date: "2026-10-24",
        time: "10:30",
        duration: 60,
        status: "Confirmed",
        notes: "First visit to this branch.",
    },
    {
        id: "MED-1003",
        patient: "Ana Reyes",
        email: "ana@example.com",
        phone: "0919 345 6789",
        service: "Follow-up consultation",
        doctor: "Dr. Maria Garcia",
        branch: "Cebu Branch",
        date: "2026-10-24",
        time: "11:00",
        duration: 30,
        status: "Pending",
        notes: "Requested a follow-up appointment.",
    },
    {
        id: "MED-1004",
        patient: "Carlo Mendoza",
        email: "carlo@example.com",
        phone: "0920 456 7890",
        service: "Skin consultation",
        doctor: "Dr. Angela Lim",
        branch: "Mandaue Branch",
        date: "2026-10-25",
        time: "13:00",
        duration: 45,
        status: "Confirmed",
        notes: "No additional notes.",
    },
    {
        id: "MED-1005",
        patient: "Sofia Garcia",
        email: "sofia@example.com",
        phone: "0921 567 8901",
        service: "General consultation",
        doctor: "Dr. Maria Garcia",
        branch: "Cebu Branch",
        date: "2026-10-25",
        time: "14:00",
        duration: 30,
        status: "Completed",
        notes: "Appointment completed.",
    },
    {
        id: "MED-1006",
        patient: "Daniel Flores",
        email: "daniel@example.com",
        phone: "0922 678 9012",
        service: "Dental cleaning",
        doctor: "Dr. James Reyes",
        branch: "Mandaue Branch",
        date: "2026-10-26",
        time: "09:30",
        duration: 60,
        status: "Declined",
        notes: "Requested slot was unavailable.",
    },
];

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

function formatTime(time: string, currentDate: Date|null) {
    if (currentDate === null) {
        return;
    }

    const [hours, minutes] = time.split(":").map(Number);
    const date = currentDate;
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

export default function BookingsPage() {
    const [bookings, setBookings] = useState(initialBookings);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All statuses");
    const [branchFilter, setBranchFilter] = useState("All branches");
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [actionMessage, setActionMessage] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState<Date | null>(null);
    const [newBooking, setNewBooking] = useState({
        patient: "",
        email: "",
        phone: "",
        service: "",
        doctor: "",
        branch: "",
        date: "",
        time: "",
        duration: "30",
        notes: "",
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const branches = useMemo(
        () => [...new Set(bookings.map((booking) => booking.branch))],
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
                    booking.doctor,
                    booking.service,
                    booking.branch,
                ].some((value) => value.toLowerCase().includes(query));

            const matchesStatus =
                statusFilter === "All statuses" ||
                booking.status === statusFilter;

            const matchesBranch =
                branchFilter === "All branches" ||
                booking.branch === branchFilter;

            return matchesSearch && matchesStatus && matchesBranch;
        });
    }, [bookings, search, statusFilter, branchFilter]);

    const totalBookings = filteredBookings.length;
    const totalPages = Math.max(1, Math.ceil(totalBookings / pageSize));

    const paginatedBookings = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        return filteredBookings.slice(startIndex, endIndex);
    }, [filteredBookings, currentPage, pageSize]);

    useEffect(() => {
        setCurrentDate(getCurrentDate());
    });

    const startItem =
        totalBookings === 0 ? 0 : (currentPage - 1) * pageSize + 1;

    const endItem = Math.min(currentPage * pageSize, totalBookings);

    const counts = {
        all: bookings.length,
        pending: bookings.filter((b) => b.status === "Pending").length,
        confirmed: bookings.filter((b) => b.status === "Confirmed").length,
        completed: bookings.filter((b) => b.status === "Completed").length,
    };

    function updateStatus(
        booking: Booking,
        status: "Confirmed" | "Declined",
    ) {
        setBookings((current) =>
            current.map((item) =>
                item.id === booking.id ? { ...item, status } : item,
            ),
        );

        setSelectedBooking({ ...booking, status });
        setActionMessage(
            `${booking.patient}'s booking was marked ${status.toLowerCase()}.`,
        );
    }

    function handleCreateBooking(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const booking: Booking = {
            id: `MED-${Math.max(
                1000,
                ...bookings.map(
                    (item) => Number(item.id.replace("MED-", "")) || 0
                )
            ) + 1
                }`,
            patient: newBooking.patient.trim(),
            email: newBooking.email.trim(),
            phone: newBooking.phone.trim(),
            service: newBooking.service,
            doctor: newBooking.doctor,
            branch: newBooking.branch,
            date: newBooking.date,
            time: newBooking.time,
            duration: Number(newBooking.duration),
            status: "Confirmed",
            notes: newBooking.notes.trim() || "No notes provided.",
        };

        setBookings((current) => [booking, ...current]);
        setSearch("");
        setStatusFilter("All statuses");
        setBranchFilter("All branches");
        setCurrentPage(1);
        setIsCreateModalOpen(false);
        setSelectedBooking(null);
        setActionMessage(`Booking for ${booking.patient} was added successfully.`);

        setNewBooking({
            patient: "",
            email: "",
            phone: "",
            service: "",
            doctor: "",
            branch: "",
            date: "",
            time: "",
            duration: "30",
            notes: "",
        });
    }

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            {/* Action feedback */}
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
                        <p className="mt-3 text-3xl font-bold text-[#173F35]">{value}</p>
                    </article>
                ))}
            </section>

            {/* Table */}
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.02]">
                {/* Search and filters */}
                <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative w-full lg:max-w-sm">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search patient, doctor, service..."
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#82A995] focus:ring-2 focus:ring-[#DDF3E7]"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <div className="relative min-w-36 flex-1 sm:flex-none">
                            <select
                                value={statusFilter}
                                onChange={(event) => {
                                    setStatusFilter(event.target.value);
                                    setCurrentPage(1);
                                }}
                                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm text-slate-600 outline-none focus:border-[#82A995]"
                            >
                                <option>All statuses</option>
                                {statuses.map((status) => (
                                    <option key={status}>{status}</option>
                                ))}
                            </select>
                            <ChevronDown
                                size={15}
                                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                        </div>

                        <div className="relative min-w-36 flex-1 sm:flex-none">
                            <select
                                value={branchFilter}
                                onChange={(event) => {
                                    setBranchFilter(event.target.value);
                                    setCurrentPage(1);
                                }}
                                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm text-slate-600 outline-none focus:border-[#82A995]"
                            >
                                <option>All branches</option>
                                {branches.map((branch) => (
                                    <option key={branch}>{branch}</option>
                                ))}
                            </select>
                            <ChevronDown
                                size={15}
                                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                        </div>
                    </div>
                </div>

                {/* Results count */}
                <div className="flex items-center justify-between px-4 py-3">
                    <p className="text-sm text-slate-500">
                        <span className="font-semibold text-[#173F35]">
                            {filteredBookings.length}
                        </span>{" "}
                        appointments found
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
                        New booking
                    </button>
                </div>

                {/* Responsive table */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left">
                        <thead>
                            <tr className="border-y border-slate-100 bg-slate-50/80">
                                {[
                                    "Patient",
                                    "Date & time",
                                    "Service",
                                    "Practitioner",
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
                                    onClick={() => {
                                        setSelectedBooking(booking);
                                        setActionMessage("");
                                    }}
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
                                            {formatTime(booking.time, currentDate)}
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
                                                setSelectedBooking(booking);
                                                setActionMessage("");
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

                            {filteredBookings.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-5 py-16 text-center">
                                        <Search
                                            size={28}
                                            className="mx-auto text-slate-300"
                                        />
                                        <p className="mt-3 font-semibold text-[#173F35]">
                                            No bookings found
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Try changing your search or filters.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {/* Pagination */}
                    <div className="flex flex-col gap-4 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* Results information */}
                        <div className="flex items-center gap-4">
                            <p className="text-sm text-slate-500">
                                Showing{" "}
                                <span className="font-semibold text-[#173F35]">
                                    {startItem}
                                </span>
                                –
                                <span className="font-semibold text-[#173F35]">
                                    {endItem}
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold text-[#173F35]">
                                    {totalBookings}
                                </span>
                            </p>

                            {/* Page size */}
                            <div className="hidden items-center gap-2 sm:flex">
                                <span className="text-xs text-slate-500">Rows</span>

                                <select
                                    value={pageSize}
                                    onChange={(event) => {
                                        setPageSize(Number(event.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-600 outline-none focus:border-[#82A995]"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                        </div>

                        {/* Pagination controls */}
                        <div className="flex items-center justify-between gap-2 sm:justify-end">
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Previous
                            </button>

                            <div className="flex items-center gap-1">
                                {getPaginationPages(currentPage, totalPages).map((page, index) => {
                                    if (page === "...") {
                                        return (
                                            <span
                                                key={`ellipsis-${index}`}
                                                className="flex h-9 w-9 items-center justify-center text-sm text-slate-400"
                                            >
                                                ...
                                            </span>
                                        );
                                    }

                                    return (
                                        <button
                                            key={page}
                                            type="button"
                                            onClick={() => setCurrentPage(page)}
                                            className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-semibold transition ${currentPage === page
                                                ? "bg-[#176B55] text-white"
                                                : "text-slate-600 hover:bg-[#DDF3E7] hover:text-[#176B55]"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() =>
                                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                                }
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Create booking modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <button
                        type="button"
                        aria-label="Close create booking modal"
                        onClick={() => setIsCreateModalOpen(false)}
                        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
                    />

                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="create-booking-title"
                        className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
                    >
                        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                            <div>
                                <h3 id="create-booking-title" className="mt-1 text-xl font-bold text-[#173F35]">
                                    New booking
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    Add an appointment for a patient.
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

                        <form onSubmit={handleCreateBooking}>
                            <div className="grid gap-5 px-6 py-6 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <h4 className="text-sm font-semibold text-[#173F35]">Patient information</h4>
                                </div>

                                <label className="block text-sm font-medium text-slate-700">
                                    Patient name *
                                    <input
                                        required
                                        value={newBooking.patient}
                                        onChange={(event) => setNewBooking((current) => ({ ...current, patient: event.target.value }))}
                                        placeholder="e.g. Maria Santos"
                                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#82A995] focus:ring-2 focus:ring-[#DDF3E7]"
                                    />
                                </label>

                                <label className="block text-sm font-medium text-slate-700">
                                    Email address *
                                    <input
                                        required
                                        type="email"
                                        value={newBooking.email}
                                        onChange={(event) => setNewBooking((current) => ({ ...current, email: event.target.value }))}
                                        placeholder="patient@example.com"
                                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#82A995] focus:ring-2 focus:ring-[#DDF3E7]"
                                    />
                                </label>

                                <label className="block text-sm font-medium text-slate-700">
                                    Phone number *
                                    <input
                                        required
                                        type="tel"
                                        value={newBooking.phone}
                                        onChange={(event) => setNewBooking((current) => ({ ...current, phone: event.target.value }))}
                                        placeholder="09XX XXX XXXX"
                                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#82A995] focus:ring-2 focus:ring-[#DDF3E7]"
                                    />
                                </label>

                                <div className="sm:col-span-2 border-t border-slate-100 pt-5">
                                    <h4 className="text-sm font-semibold text-[#173F35]">Appointment details</h4>
                                </div>

                                <label className="block text-sm font-medium text-slate-700">
                                    Service *
                                    <select
                                        required
                                        value={newBooking.service}
                                        onChange={(event) => setNewBooking((current) => ({ ...current, service: event.target.value }))}
                                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#82A995]"
                                    >
                                        <option value="">Select a service</option>
                                        {[...new Set(bookings.map((booking) => booking.service))].map((service) => (
                                            <option key={service} value={service}>{service}</option>
                                        ))}
                                    </select>
                                </label>

                                <label className="block text-sm font-medium text-slate-700">
                                    Practitioner *
                                    <select
                                        required
                                        value={newBooking.doctor}
                                        onChange={(event) => setNewBooking((current) => ({ ...current, doctor: event.target.value }))}
                                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#82A995]"
                                    >
                                        <option value="">Select a practitioner</option>
                                        {[...new Set(bookings.map((booking) => booking.doctor))].map((doctor) => (
                                            <option key={doctor} value={doctor}>{doctor}</option>
                                        ))}
                                    </select>
                                </label>

                                <label className="block text-sm font-medium text-slate-700">
                                    Branch *
                                    <select
                                        required
                                        value={newBooking.branch}
                                        onChange={(event) => setNewBooking((current) => ({ ...current, branch: event.target.value }))}
                                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#82A995]"
                                    >
                                        <option value="">Select a branch</option>
                                        {branches.map((branch) => (
                                            <option key={branch} value={branch}>{branch}</option>
                                        ))}
                                    </select>
                                </label>

                                <label className="block text-sm font-medium text-slate-700">
                                    Appointment date *
                                    <input
                                        required
                                        type="date"
                                        value={newBooking.date}
                                        onChange={(event) => setNewBooking((current) => ({ ...current, date: event.target.value }))}
                                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#82A995]"
                                    />
                                </label>

                                <label className="block text-sm font-medium text-slate-700">
                                    Start time *
                                    <input
                                        required
                                        type="time"
                                        value={newBooking.time}
                                        onChange={(event) => setNewBooking((current) => ({ ...current, time: event.target.value }))}
                                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#82A995]"
                                    />
                                </label>

                                <label className="block text-sm font-medium text-slate-700">
                                    Duration *
                                    <select
                                        required
                                        value={newBooking.duration}
                                        onChange={(event) => setNewBooking((current) => ({ ...current, duration: event.target.value }))}
                                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#82A995]"
                                    >
                                        <option value="15">15 minutes</option>
                                        <option value="30">30 minutes</option>
                                        <option value="45">45 minutes</option>
                                        <option value="60">60 minutes</option>
                                        <option value="90">90 minutes</option>
                                        <option value="120">120 minutes</option>
                                    </select>
                                </label>

                                <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
                                    Patient notes
                                    <textarea
                                        rows={3}
                                        value={newBooking.notes}
                                        onChange={(event) => setNewBooking((current) => ({ ...current, notes: event.target.value }))}
                                        placeholder="Any relevant notes for this appointment..."
                                        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#82A995] focus:ring-2 focus:ring-[#DDF3E7]"
                                    />
                                </label>
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
                                    Add booking
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}

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
                                        <Mail size={15} className="shrink-0 text-slate-400" />
                                        {selectedBooking.email}
                                    </p>
                                    <p className="flex items-center gap-2 text-sm text-slate-600">
                                        <Phone size={15} className="shrink-0 text-slate-400" />
                                        {selectedBooking.phone}
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
                                        value={`${formatTime(selectedBooking.time, currentDate)} · ${selectedBooking.duration} minutes`}
                                    />
                                    <DetailRow
                                        icon={<Building2 size={19} />}
                                        label="Branch"
                                        value={selectedBooking.branch}
                                    />
                                    <DetailRow
                                        icon={<Stethoscope size={19} />}
                                        label="Practitioner"
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
                                    <StickyNote size={17} className="text-[#176B55]" />
                                    <h4 className="font-semibold text-[#173F35]">
                                        Patient notes
                                    </h4>
                                </div>
                                <div className="mt-3 rounded-xl border border-slate-200 p-4 text-sm leading-6 text-slate-600">
                                    {selectedBooking.notes || "No notes provided."}
                                </div>
                            </section>
                        </div>

                        {/* Actions */}
                        <div className="border-t border-slate-100 bg-white px-6 py-5">
                            {selectedBooking.status === "Pending" ? (
                                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            updateStatus(selectedBooking, "Declined")
                                        }
                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                                    >
                                        <X size={17} />
                                        Decline booking
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            updateStatus(selectedBooking, "Confirmed")
                                        }
                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#176B55] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#173F35]"
                                    >
                                        <Check size={17} />
                                        Approve booking
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
                                Demo only — changes are not saved to a database.
                            </p>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
}


function getPaginationPages(
    currentPage: number,
    totalPages: number,
): (number | "...")[] {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 4) {
        return [1, 2, 3, 4, 5, "...", totalPages];
    }

    if (currentPage >= totalPages - 3) {
        return [
            1,
            "...",
            totalPages - 4,
            totalPages - 3,
            totalPages - 2,
            totalPages - 1,
            totalPages,
        ];
    }

    return [
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages,
    ];
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
