
"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ArrowLeft,
    Search,
    Menu,
    X,
    ChevronDown,
    ChevronLeft,
    LayoutDashboard,
    CalendarDays,
    Building2,
    Stethoscope,
    ClipboardList,
    Settings,
    Users,
    Globe,
    Bell,
    CircleHelp,
} from "lucide-react";

const sections = [
    {
        title: "Workspace",
        items: [
            {
                title: "Dashboard",
                icon: LayoutDashboard,
                children: [
                    { title: "Dashboard overview", href: "/help" },
                ],
            },
            {
                title: "Bookings",
                icon: CalendarDays,
                children: [
                    { title: "View bookings", href: "/help/bookings/view-bookings" },
                    { title: "Add manual booking", href: "/help/bookings/add-manual-booking" },
                    { title: "Approve or decline", href: "/help/bookings/approve-booking" },
                ],
            },
            {
                title: "Branches",
                icon: Building2,
                children: [
                    { title: "Manage branches", href: "/help/branches/manage-branches" },
                    { title: "Add a branch", href: "/help/branches/add-a-branch" },
                    { title: "Edit a branch", href: "/help/branches/edit-a-branch" },
                ],
            },
            {
                title: "Doctors",
                icon: Stethoscope,
                children: [
                    { title: "Manage doctors", href: "/help/doctors/manage-doctors" },
                    { title: "Add a new doctor", href: "/help/doctors/add-doctor" },
                    { title: "Edit a doctor", href: "/help/doctors/edit-doctor" },
                ],
            },
            {
                title: "Services",
                icon: ClipboardList,
                children: [
                    { title: "Manage services", href: "/help/services" },
                ],
            },
            {
                title: "Online booking",
                icon: Globe,
                children: [
                    { title: "Your booking page", href: "/help/online-booking" },
                ],
            },
        ],
    },
    {
        title: "Preferences",
        items: [
            {
                title: "Settings",
                icon: Settings,
                children: [
                    { title: "Clinic settings", href: "/help/settings/clinic-settings" },
                    { title: "Notifications", href: "/help/settings/notifications" },
                    { title: "Staff", href: "/help/settings/staff" },
                    { title: "Subscription Plan", href: "/help/settings/subscription-plan" },

                ],
            },
            // {
            //     title: "Help & support",
            //     icon: CircleHelp,
            //     children: [
            //         { title: "Contact support", href: "/help/contact" },
            //     ],
            // },
        ],
    },
];

export default function HelpCenterShell({
    children,
}: {
    children: ReactNode;
}) {
    const pathname = usePathname();
    const [search, setSearch] = useState("");
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    const [expanded, setExpanded] = useState<string[]>([
        "Dashboard",
        "Bookings",
    ]);

    const filteredSections = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return sections;

        return sections
            .map((section) => ({
                ...section,
                items: section.items
                    .map((item) => {
                        const itemMatches = item.title.toLowerCase().includes(query);
                        const matchingChildren = item.children.filter((child) =>
                            child.title.toLowerCase().includes(query)
                        );

                        return {
                            ...item,
                            children: itemMatches ? item.children : matchingChildren,
                        };
                    })
                    .filter(
                        (item) =>
                            item.title.toLowerCase().includes(query) ||
                            item.children.length > 0
                    ),
            }))
            .filter((section) => section.items.length > 0);
    }, [search]);

    function toggleSection(title: string) {
        setExpanded((current) =>
            current.includes(title)
                ? current.filter((item) => item !== title)
                : [...current, title]
        );
    }

    const sidebar = (
        <div className="flex h-full flex-col bg-[#193F35] text-white">
            {/* Search */}
            {!collapsed && (
                <div className="border-b border-white/10 p-4">
                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5 focus-within:border-emerald-300/50">
                        <Search className="h-4 w-4 shrink-0 text-[#A8C5B9]" />

                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search help articles..."
                            aria-label="Search help articles"
                            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#A8C5B9]"
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                aria-label="Clear search"
                                className="text-[#A8C5B9] hover:text-white"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 space-y-5 overflow-y-auto px-2.5 py-5">
                {filteredSections.map((section) => (
                    <div key={section.title}>
                        {!collapsed && (
                            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#91B3A5]">
                                {section.title}
                            </p>
                        )}

                        <div className="space-y-1">
                            {section.items.map((item) => {
                                const Icon = item.icon;

                                const isActive = item.children.some(
                                    (child) => child.href === pathname
                                );

                                const isExpanded =
                                    search.trim().length > 0 ||
                                    expanded.includes(item.title);

                                return (
                                    <div key={item.title}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (collapsed) setCollapsed(false);
                                                toggleSection(item.title);
                                            }}
                                            title={collapsed ? item.title : undefined}
                                            aria-expanded={isExpanded}
                                            className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left transition ${isActive
                                                    ? "bg-[#3B6255] text-white shadow-sm"
                                                    : "text-[#B9CEC5] hover:bg-white/[0.07] hover:text-white"
                                                }`}
                                        >
                                            <Icon
                                                className={`h-5 w-5 shrink-0 ${isActive
                                                        ? "text-[#D4E8DE]"
                                                        : "text-[#A8C5B9] group-hover:text-white"
                                                    }`}
                                            />

                                            {!collapsed && (
                                                <>
                                                    <span className="flex-1 text-sm font-medium">
                                                        {item.title}
                                                    </span>

                                                    <ChevronDown
                                                        className={`h-4 w-4 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""
                                                            }`}
                                                    />
                                                </>
                                            )}
                                        </button>

                                        {!collapsed && isExpanded && (
                                            <div className="ml-6 mt-1 space-y-1 border-l border-white/15 py-1 pl-3">
                                                {item.children.map((child) => {
                                                    const childActive = child.href === pathname;

                                                    return (
                                                        <Link
                                                            key={child.href}
                                                            href={child.href}
                                                            onClick={() => setMobileOpen(false)}
                                                            aria-current={
                                                                childActive ? "page" : undefined
                                                            }
                                                            className={`block rounded-lg px-3 py-2.5 text-sm transition ${childActive
                                                                    ? "bg-[#DDF3E7] font-semibold text-[#193F35]"
                                                                    : "text-[#B9CEC5] hover:bg-white/[0.07] hover:text-white"
                                                                }`}
                                                        >
                                                            {child.title}
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {filteredSections.length === 0 && (
                    <p className="px-3 py-6 text-sm text-[#B9CEC5]">
                        No matching articles found.
                    </p>
                )}
            </nav>

            {/* Clinic/support footer */}
            {!collapsed && (
                <div className="border-t border-white/10 p-4">
                    <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3.5">
                        <p className="truncate text-sm font-semibold text-white">
                            Medora Help Center
                        </p>
                        <p className="mt-1 text-xs text-[#A8C5B9]">
                            Guides for your clinic workspace
                        </p>
                        <a
                            href="mailto:support@medora.app"
                            className="mt-3 inline-flex text-xs font-medium text-[#D4E8DE] hover:text-white hover:underline"
                        >
                            Contact support
                        </a>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-white text-[#193F35]">
            {/* Top navbar */}
            <header className="sticky top-0 z-40 border-b border-[#E5EBE5] bg-white/95 backdrop-blur">
                <div className="flex h-16 items-center justify-between px-4 sm:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setMobileOpen(true)}
                            aria-label="Open help navigation"
                            className="rounded-lg p-2 hover:bg-[#F0F5F0] lg:hidden"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <Link href="/dashboard" className="shrink-0">
                            <img
                                src="/full-logo.webp"
                                alt="Medora"
                                className="w-32"
                            />
                        </Link>

                        <span className="hidden h-6 w-px bg-[#DDE5DE] sm:block" />

                        <span className="hidden text-sm text-[#53645D] sm:block">
                            Help Center
                        </span>
                    </div>

                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#53645D] transition hover:bg-[#F0F5F0] hover:text-[#176B55]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">
                            Back to dashboard
                        </span>
                        <span className="sm:hidden">Dashboard</span>
                    </Link>
                </div>
            </header>

            <div className="flex min-h-[calc(100vh-4rem)]">
                {/* Desktop sidebar */}
                <aside
                    className={`sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 transition-[width] duration-200 lg:block ${collapsed ? "w-[76px]" : "w-72"
                        }`}
                >
                    <div className="relative h-full">
                        {sidebar}

                        <button
                            type="button"
                            onClick={() => setCollapsed(!collapsed)}
                            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                            className="absolute -right-3 top-4 z-10 hidden rounded-full border border-[#DDE5DE] bg-white p-1.5 text-[#193F35] shadow-sm transition-colors hover:bg-[#DDF3E7] hover:text-[#176B55] lg:flex"
                        >
                            {collapsed ? (
                                <ChevronDown className="h-4 w-4 -rotate-90" />
                            ) : (
                                <ChevronLeft className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </aside>

                {/* Mobile sidebar */}
                {mobileOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <button
                            type="button"
                            aria-label="Close help navigation"
                            onClick={() => setMobileOpen(false)}
                            className="absolute inset-0 bg-black/40"
                        />

                        <aside className="absolute inset-y-0 left-0 flex w-[min(20rem,85vw)] flex-col shadow-xl">
                            <div className="flex items-center justify-between border-b border-white/10 bg-[#193F35] px-4 py-3 text-white">
                                <span className="font-semibold">Help Center</span>
                                <button
                                    type="button"
                                    onClick={() => setMobileOpen(false)}
                                    aria-label="Close menu"
                                    className="rounded-lg p-2 hover:bg-white/10"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="min-h-0 flex-1">
                                {sidebar}
                            </div>
                        </aside>
                    </div>
                )}

                {/* Article area */}
                <main className="min-w-0 flex-1">
                    <div className="mx-auto w-full px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
