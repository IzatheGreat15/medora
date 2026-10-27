"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Activity,
    ArrowDownRight,
    ArrowUpRight,
    Plus,
    Stethoscope,
    UserCheck,
    UserRound,
    Users,
    X,
} from "lucide-react";

import DoctorsTable, {
    type DoctorTableItem,
} from "@/components/doctor/DoctorsTable";

const initialDoctors: DoctorTableItem[] = [
    {
        id: "doctor-maria-santos",
        name: "Dr. Maria Santos",
        specialty: "General Practitioner",
        email: "maria.santos@example.com",
        phone: "+63 917 123 4567",
        status: "Active",
        branches: ["Cebu Branch", "Mandaue Branch"],
    },
    {
        id: "doctor-angela-reyes",
        name: "Dr. Angela Reyes",
        specialty: "Dermatologist",
        email: "angela.reyes@example.com",
        phone: "+63 918 234 5678",
        status: "Active",
        branches: ["Cebu Branch"],
    },
    {
        id: "doctor-john-cruz",
        name: "Dr. John Cruz",
        specialty: "Dentist",
        email: "john.cruz@example.com",
        phone: "+63 919 345 6789",
        status: "Inactive",
        branches: ["Cebu Branch"],
    },
    {
        id: "doctor-paolo-lim",
        name: "Dr. Paolo Lim",
        specialty: "Pediatrician",
        email: "paolo.lim@example.com",
        phone: "+63 920 456 7890",
        status: "Active",
        branches: ["Mandaue Branch"],
    },
    {
        id: "doctor-sophia-garcia",
        name: "Dr. Sophia Garcia",
        specialty: "Cardiologist",
        email: "sophia.garcia@example.com",
        phone: "+63 921 567 8901",
        status: "Active",
        branches: ["Lapu-Lapu Branch"],
    },
    {
        id: "doctor-miguel-tan",
        name: "Dr. Miguel Tan",
        specialty: "Orthopedic Surgeon",
        email: "miguel.tan@example.com",
        phone: "+63 922 678 9012",
        status: "Inactive",
        branches: ["Cebu Branch", "Lapu-Lapu Branch"],
    },
];

function MetricCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    iconClass,
}: {
    title: string;
    value: number;
    description: string;
    icon: typeof Users;
    trend?: string;
    iconClass: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>

                    <p className="mt-3 text-3xl font-bold tracking-tight text-[#173F35]">
                        {value}
                    </p>
                </div>

                <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
                >
                    <Icon className="h-5 w-5" />
                </div>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
                {trend && (
                    <span className="inline-flex items-center gap-1 font-semibold text-[#176B55]">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                        {trend}
                    </span>
                )}
                <span>{description}</span>
            </div>
        </div>
    );
}

function AddDoctorModal({
    open,
    onClose,
    onSave,
    branches,
}: {
    open: boolean;
    onClose: () => void;
    onSave: (doctor: DoctorTableItem) => void;
    branches: string[];
}) {
    const [name, setName] = useState("");
    const [specialty, setSpecialty] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [status, setStatus] =
        useState<DoctorTableItem["status"]>("Active");
    const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
    const [error, setError] = useState("");

    if (!open) return null;

    function toggleBranch(branch: string) {
        setSelectedBranches((current) =>
            current.includes(branch)
                ? current.filter((item) => item !== branch)
                : [...current, branch],
        );
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!name.trim() || !specialty.trim() || !email.trim() || !phone.trim()) {
            setError("Please complete all required fields.");
            return;
        }

        const doctor: DoctorTableItem = {
            id: `doctor-${crypto.randomUUID()}`,
            name: name.trim(),
            specialty: specialty.trim(),
            email: email.trim(),
            phone: phone.trim(),
            status,
            branches: selectedBranches,
        };

        onSave(doctor);

        setName("");
        setSpecialty("");
        setEmail("");
        setPhone("");
        setStatus("Active");
        setSelectedBranches([]);
        setError("");
        onClose();
    }

    const inputClass =
        "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#82A995] focus:ring-4 focus:ring-[#DDF3E7]";

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-doctor-title"
                className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            >
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                    <div>
                        <h2
                            id="add-doctor-title"
                            className="text-xl font-bold text-[#173F35]"
                        >
                            Add doctor
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Enter the doctor's basic profile information.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close modal"
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-5 p-6">
                        <div>
                            <label
                                htmlFor="doctor-name"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Doctor's full name *
                            </label>
                            <input
                                id="doctor-name"
                                required
                                autoFocus
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="e.g. Dr. Maria Santos"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="doctor-specialty"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Specialty *
                            </label>
                            <input
                                id="doctor-specialty"
                                required
                                value={specialty}
                                onChange={(event) => setSpecialty(event.target.value)}
                                placeholder="e.g. General Practitioner"
                                className={inputClass}
                            />
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="doctor-email"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Email address *
                                </label>
                                <input
                                    id="doctor-email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="doctor@clinic.com"
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="doctor-phone"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Phone number *
                                </label>
                                <input
                                    id="doctor-phone"
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={(event) => setPhone(event.target.value)}
                                    placeholder="+63 917 123 4567"
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="doctor-status"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Account status
                            </label>
                            <select
                                id="doctor-status"
                                value={status}
                                onChange={(event) =>
                                    setStatus(
                                        event.target.value as DoctorTableItem["status"],
                                    )
                                }
                                className={inputClass}
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>

                        <div>
                            <p className="mb-2 text-sm font-medium text-slate-700">
                                Branch assignments
                            </p>
                            <p className="mb-3 text-xs text-slate-500">
                                Select the branches where this doctor works. You can leave
                                this empty and assign branches later.
                            </p>

                            <div className="grid gap-2 sm:grid-cols-2">
                                {branches.map((branch) => (
                                    <label
                                        key={branch}
                                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm text-slate-700 transition hover:border-[#82A995] hover:bg-[#F7F9F6]"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedBranches.includes(branch)}
                                            onChange={() => toggleBranch(branch)}
                                            className="h-4 w-4 accent-[#176B55]"
                                        />
                                        {branch}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <p role="alert" className="text-sm font-medium text-red-600">
                                {error}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-xl bg-[#176B55] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#125744] focus:outline-none focus:ring-4 focus:ring-[#DDF3E7]"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function DoctorsPage() {
    const router = useRouter();

    const [doctors, setDoctors] =
        useState<DoctorTableItem[]>(initialDoctors);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const metrics = useMemo(() => {
        const active = doctors.filter(
            (doctor) => doctor.status === "Active",
        ).length;

        const inactive = doctors.filter(
            (doctor) => doctor.status === "Inactive",
        ).length;

        const specialties = new Set(
            doctors.map((doctor) => doctor.specialty),
        ).size;

        return {
            total: doctors.length,
            active,
            inactive,
            specialties,
        };
    }, [doctors]);

    function handleEditDoctor(doctor: DoctorTableItem) {
        router.push(`/doctors/${doctor.id}/edit`);
    }

    function handleDeleteDoctor(doctor: DoctorTableItem) {
        const confirmed = window.confirm(
            `Are you sure you want to deactivate ${doctor.name}?`,
        );

        if (!confirmed) return;

        // Demo only: update local state.
        // Replace with an API/database update when connected.
        setDoctors((current) =>
            current.map((item) =>
                item.id === doctor.id
                    ? { ...item, status: "Inactive" }
                    : item,
            ),
        );
    }

    return (
        <div className="mx-auto space-y-7 pb-10">
            {/* Summary metrics */}
            <section
                aria-label="Doctor statistics"
                className="grid gap-4 grid-cols-2 xl:grid-cols-4"
            >
                <MetricCard
                    title="Total doctors"
                    value={metrics.total}
                    description="Registered in your clinic"
                    icon={Users}
                    iconClass="bg-[#DDF3E7] text-[#176B55]"
                />

                <MetricCard
                    title="Active doctors"
                    value={metrics.active}
                    description="Currently active"
                    icon={UserCheck}
                    iconClass="bg-emerald-50 text-emerald-700"
                />

                <MetricCard
                    title="Inactive doctors"
                    value={metrics.inactive}
                    description="Not currently active"
                    icon={UserRound}
                    iconClass="bg-amber-50 text-amber-700"
                />

                <MetricCard
                    title="Specialties"
                    value={metrics.specialties}
                    description="Unique specialties represented"
                    icon={Activity}
                    iconClass="bg-sky-50 text-sky-700"
                />
            </section>

            {/* Doctors table */}
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <DoctorsTable
                    doctors={doctors}
                    showBranch
                    title="All doctors"
                    description="Search doctors and manage their profiles and assignments."
                    emptyMessage="No doctors found. Add your first doctor to get started."
                    onDoctorEdit={handleEditDoctor}
                    onDoctorDelete={handleDeleteDoctor}
                    onDoctorAdd={() => setIsAddModalOpen(true)}
                />
            </section>

            <AddDoctorModal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                branches={[
                    "Cebu Branch",
                    "Mandaue Branch",
                    "Lapu-Lapu Branch",
                ]}
                onSave={(doctor) => {
                    setDoctors((current) => [...current, doctor]);
                }}
            />
        </div>
    );
}