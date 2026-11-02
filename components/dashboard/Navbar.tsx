
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarCheck,
  CalendarClock,
  Check,
  CheckCheck,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { DashboardStaff } from "./DashboardLayoutClient";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/bookings": "Bookings",
  "/branches": "Branches",
  "/doctors": "Doctors",
  "/services": "Services",
  "/settings": "Settings",
  "/support": "Help & support",
};

type DashboardNavbarProps = {
  staff: DashboardStaff;
  onMenuClick: () => void;
};

type Notification = {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "booking" | "pending";
  unread: boolean;
};

const initialNotifications: Notification[] = [
  {
    id: "1",
    title: "New appointment request",
    description: "Maria Santos requested a General Consultation.",
    time: "5 min ago",
    type: "booking",
    unread: true,
  },
  {
    id: "2",
    title: "Appointment awaiting approval",
    description: "Juan Dela Cruz · Tomorrow, 10:00 AM",
    time: "20 min ago",
    type: "pending",
    unread: true,
  },
  {
    id: "3",
    title: "New appointment request",
    description: "Angela Reyes requested a Follow-up Consultation.",
    time: "1 hour ago",
    type: "booking",
    unread: true,
  },
  {
    id: "4",
    title: "Appointment confirmed",
    description: "A patient's appointment has been confirmed.",
    time: "Yesterday",
    type: "booking",
    unread: false,
  },
];

export default function DashboardNavbar({
  staff,
  onMenuClick,
}: DashboardNavbarProps) {
  const pathname = usePathname();

  const [notifications, setNotifications] = useState(initialNotifications);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const fullName = `${staff.first_name} ${staff.last_name}`;
  const roleLabel = staff.clinic_role;
  const initials =
    `${staff.first_name?.[0] ?? ""}${staff.last_name?.[0] ?? ""}`
      .toUpperCase() || "AD";

  const unreadCount = notifications.filter(
    (notification) => notification.unread,
  ).length;

  const title =
    pageTitles[pathname] ??
    Object.entries(pageTitles).find(
      ([path]) => path !== "/dashboard" && pathname.startsWith(`${path}/`),
    )?.[1] ??
    "Dashboard";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsNotificationsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function markAsRead(id: string) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification,
      ),
    );
  }

  function markAllAsRead() {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        unread: false,
      })),
    );
  }

  function handleNotificationClick(notification: Notification) {
    markAsRead(notification.id);
    setIsNotificationsOpen(false);

    // Navigate to the bookings page to review the appointment.
    window.location.href = "/bookings";
  }

  return (
    <header className="sticky top-0 z-30 flex h-[76px] shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      {/* Left */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
        >
          <Menu size={21} />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-[#173F35] sm:text-xl">
            {title}
          </h1>

          <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">
            Manage your clinic with Medora
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        {/* Notifications */}
        <div ref={notificationRef} className="relative">
          <button
            type="button"
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
            aria-expanded={isNotificationsOpen}
            aria-haspopup="dialog"
            onClick={() =>
              setIsNotificationsOpen((current) => !current)
            }
            className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition ${
              isNotificationsOpen
                ? "bg-[#DDF3E7] text-[#176B55]"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Bell size={20} />

            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-[#176B55] px-1 text-[9px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {isNotificationsOpen && (
            <div
              role="dialog"
              aria-label="Notifications"
              className="absolute right-0 top-[calc(100%+14px)] z-50 w-[calc(100vw-2rem)] max-w-[390px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5">
                <div>
                  <h2 className="font-semibold text-[#173F35]">
                    Notifications
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {unreadCount > 0
                      ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                      : "You're all caught up"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNotificationsOpen(false)}
                  aria-label="Close notifications"
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={17} />
                </button>
              </div>

              {/* Mark all as read */}
              {unreadCount > 0 && (
                <div className="flex justify-end border-b border-slate-100 px-4 py-2.5 sm:px-5">
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#176B55] transition hover:text-[#173F35]"
                  >
                    <CheckCheck size={14} />
                    Mark all as read
                  </button>
                </div>
              )}

              {/* Notification list */}
              <div className="max-h-[390px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() =>
                        handleNotificationClick(notification)
                      }
                      className={`flex w-full gap-3 border-b border-slate-100 px-4 py-4 text-left transition last:border-b-0 hover:bg-[#F7F9F6] sm:px-5 ${
                        notification.unread ? "bg-[#F4FAF6]" : "bg-white"
                      }`}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DDF3E7] text-[#176B55]">
                        {notification.type === "pending" ? (
                          <CalendarClock size={19} />
                        ) : (
                          <CalendarCheck size={19} />
                        )}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2">
                          <span className="text-sm font-semibold text-[#173F35]">
                            {notification.title}
                          </span>

                          {notification.unread && (
                            <span
                              aria-label="Unread"
                              className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#176B55]"
                            />
                          )}
                        </span>

                        <span className="mt-1 block text-xs leading-5 text-slate-500">
                          {notification.description}
                        </span>

                        <span className="mt-2 block text-[11px] text-slate-400">
                          {notification.time}
                        </span>
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-5 py-10 text-center">
                    <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#DDF3E7] text-[#176B55]">
                      <Check size={21} />
                    </span>

                    <p className="mt-3 text-sm font-semibold text-[#173F35]">
                      All caught up!
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      You don't have any notifications yet.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-slate-100 p-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    window.location.href = "/bookings";
                  }}
                  className="flex w-full items-center justify-center rounded-xl py-2.5 text-sm font-semibold text-[#176B55] transition hover:bg-[#DDF3E7]"
                >
                  View all bookings
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="hidden h-8 w-px bg-slate-200 sm:block" />

        {/* Account menu placeholder */}
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-50 sm:gap-3 sm:px-2"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DDF3E7] text-sm font-bold text-[#176B55]">
            {initials}
          </span>

          <span className="hidden text-left sm:block">
            <span className="block text-sm font-semibold text-[#173F35]">
              {fullName}
            </span>

            <span className="mt-0.5 block text-xs text-slate-500">
              Clinic administrator
            </span>
          </span>
        </button>
      </div>
    </header>
  );
}
