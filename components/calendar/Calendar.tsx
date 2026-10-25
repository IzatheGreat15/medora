"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
} from "lucide-react";
import type { CalendarEvent } from "@/lib/calendar/types";

type CalendarViewMode = "day" | "week";

export type CalendarLegendItem = {
  /** Appointment status used to match the legend item to calendar events. */
  status: NonNullable<CalendarEvent["status"]>;
  /** Text displayed in the legend. */
  label: string;
  /** Tailwind classes used for the legend marker and event card. */
  className: string;
};

type CalendarProps = {
  events: CalendarEvent[];
  date: string;
  onDateChange: (date: string) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onSlotClick?: (startAt: string, endAt: string) => void;
  startHour?: number;
  endHour?: number;
  showPerson?: boolean;
  showStatus?: boolean;
  /** Pass the legend items relevant to the data being displayed. */
  legendItems?: CalendarLegendItem[];
  /** Initial view. The user can switch between day and week in the calendar. */
  defaultView?: CalendarViewMode;
  /** Optional labels to customize event types that do not have a legend entry. */
  eventTypeLabels?: Partial<Record<CalendarEvent["type"], string>>;
};

const DEFAULT_TYPE_LABELS: Record<CalendarEvent["type"], string> = {
  appointment: "Appointment",
  working_hours: "Working hours",
  break: "Break",
  leave: "Leave",
  blocked: "Blocked",
  closure: "Closure",
};

function parseDateKey(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1, 12, 0, 0, 0);
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const mondayOffset = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - mondayOffset);
  result.setHours(12, 0, 0, 0);
  return result;
}

function formatDay(date: Date, options: Intl.DateTimeFormatOptions = {}) {
  return date.toLocaleDateString("en-PH", options);
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function localDateTime(dateKey: string, hour: number, minute = 0): string {
  const date = parseDateKey(dateKey);
  date.setHours(hour, minute, 0, 0);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}:00`;
}

function getEventStart(event: CalendarEvent): Date {
  return new Date(event.startAt);
}

function getEventEnd(event: CalendarEvent): Date {
  return new Date(event.endAt);
}

function eventOverlapsDay(event: CalendarEvent, dayKey: string): boolean {
  const dayStart = parseDateKey(dayKey);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);
  return getEventStart(event) < dayEnd && getEventEnd(event) > dayStart;
}

function eventTopAndHeight(
  event: CalendarEvent,
  dayKey: string,
  startHour: number,
  endHour: number,
) {
  const dayStart = parseDateKey(dayKey);
  dayStart.setHours(startHour, 0, 0, 0);
  const dayEnd = parseDateKey(dayKey);
  dayEnd.setHours(endHour + 1, 0, 0, 0);

  const start = new Date(Math.max(getEventStart(event).getTime(), dayStart.getTime()));
  const end = new Date(Math.min(getEventEnd(event).getTime(), dayEnd.getTime()));
  const minutesFromStart = (start.getTime() - dayStart.getTime()) / 60000;
  const duration = Math.max((end.getTime() - start.getTime()) / 60000, 15);
  const pixelsPerMinute = 1;
  return {
    top: minutesFromStart * pixelsPerMinute,
    height: Math.max(duration * pixelsPerMinute, 24),
  };
}

function statusLabel(status?: CalendarEvent["status"]): string | undefined {
  if (!status) return undefined;
  const labels: Partial<Record<NonNullable<CalendarEvent["status"]>, string>> = {
    pending: "Pending",
    confirmed: "Confirmed",
    checked_in: "Checked in",
    in_progress: "In progress",
    completed: "Completed",
    cancelled: "Cancelled",
    rejected: "Rejected",
    available: "Available",
    unavailable: "Unavailable",
  };
  return labels[status] ?? status;
}

export default function Calendar({
  events,
  date,
  onDateChange,
  onEventClick,
  onSlotClick,
  startHour = 8,
  endHour = 18,
  showPerson = false,
  showStatus = false,
  legendItems = [],
  defaultView = "day",
  eventTypeLabels = {},
}: CalendarProps) {
  const [view, setView] = useState<CalendarViewMode>(defaultView);

  const selectedDate = useMemo(() => parseDateKey(date), [date]);
  const weekStart = useMemo(() => startOfWeek(selectedDate), [selectedDate]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  );
  const hours = useMemo(
    () => Array.from({ length: Math.max(0, endHour - startHour + 1) }, (_, index) => startHour + index),
    [startHour, endHour],
  );

  const stylesByStatus = useMemo(() => {
    const styles = new Map<NonNullable<CalendarEvent["status"]>, string>();
    legendItems.forEach((item) => styles.set(item.status, item.className));
    return styles;
  }, [legendItems]);

  function moveDate(direction: number) {
    onDateChange(toDateKey(addDays(selectedDate, direction * (view === "week" ? 7 : 1))));
  }

  function goToToday() {
    onDateChange(toDateKey(new Date()));
  }

  function renderEvent(event: CalendarEvent, dayKey: string, compact = false) {
    const style = (event.status && stylesByStatus.get(event.status)) ?? "border-l-slate-400 bg-slate-50 text-slate-800";
    const start = getEventStart(event);
    const end = getEventEnd(event);
    const timeLabel = `${formatTime(start)} – ${formatTime(end)}`;
    const title = event.title || eventTypeLabels[event.type] || DEFAULT_TYPE_LABELS[event.type];

    if (compact) {
      return (
        <button
          key={`${event.id}-${dayKey}-compact`}
          type="button"
          onClick={() => onEventClick?.(event)}
          title={`${title} · ${timeLabel}${event.personName ? ` · ${event.personName}` : ""}`}
          className={`block w-full truncate rounded-md border-l-2 px-1.5 py-1 text-left text-[11px] leading-4 transition hover:brightness-95 ${style}`}
        >
          <span className="font-semibold">{formatTime(start)}</span> {title}
        </button>
      );
    }

    const position = eventTopAndHeight(event, dayKey, startHour, endHour);
    return (
      <button
        key={`${event.id}-${dayKey}`}
        type="button"
        onClick={() => onEventClick?.(event)}
        title={`${title} · ${timeLabel}`}
        style={{ top: `${position.top}px`, height: `${position.height}px` }}
        className={`absolute left-1 right-1 z-10 overflow-hidden rounded-lg border-l-4 p-2 text-left text-xs shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[#82A995] ${style}`}
      >
        <span className="block truncate font-semibold">{title}</span>
        <span className="mt-0.5 block truncate opacity-80">{timeLabel}</span>
        {showPerson && event.personName && (
          <span className="mt-0.5 block truncate opacity-80">{event.personName}</span>
        )}
        {showStatus && event.status && (
          <span className="mt-0.5 block truncate font-medium opacity-80">{statusLabel(event.status)}</span>
        )}
        {event.serviceName && (
          <span className="mt-0.5 block truncate opacity-80">{event.serviceName}</span>
        )}
      </button>
    );
  }

  function renderDayColumn(day: Date, isDayView = false) {
    const dayKey = toDateKey(day);
    const dayEvents = events.filter((event) => eventOverlapsDay(event, dayKey));
    const pixelsPerHour = 60;
    const columnHeight = hours.length * pixelsPerHour;

    return (
      <div key={dayKey} className="min-w-0 flex-1">
        <div className="relative border-l border-slate-100" style={{ height: `${columnHeight}px` }}>
          {hours.map((hour) => (
            <button
              key={`${dayKey}-${hour}`}
              type="button"
              aria-label={`Add event on ${dayKey} at ${hour}:00`}
              onClick={() => onSlotClick?.(localDateTime(dayKey, hour), localDateTime(dayKey, Math.min(hour + 1, 23)))}
              className="absolute left-0 right-0 border-t border-slate-100 bg-transparent text-left transition hover:bg-[#DDF3E7]/30"
              style={{ top: `${(hour - startHour) * pixelsPerHour}px`, height: `${pixelsPerHour}px` }}
            />
          ))}
          {dayEvents.map((event) => renderEvent(event, dayKey))}
        </div>
      </div>
    );
  }

  const rangeLabel = view === "week"
    ? `${formatDay(weekStart, { month: "short", day: "numeric" })} – ${formatDay(weekDays[6], { month: "short", day: "numeric", year: "numeric" })}`
    : formatDay(selectedDate, { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="min-w-0 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DDF3E7] text-[#176B55]">
            <CalendarDays size={19} />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-[#173F35]">Calendar</h3>
            <p className="mt-0.5 text-xs text-slate-500">{rangeLabel}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button type="button" onClick={() => setView("day")} aria-pressed={view === "day"} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${view === "day" ? "bg-white text-[#176B55] shadow-sm" : "text-slate-500 hover:text-[#176B55]"}`}>Day</button>
            <button type="button" onClick={() => setView("week")} aria-pressed={view === "week"} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${view === "week" ? "bg-white text-[#176B55] shadow-sm" : "text-slate-500 hover:text-[#176B55]"}`}>Week</button>
          </div>
          <button type="button" onClick={goToToday} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">Today</button>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => moveDate(-1)} aria-label="Previous date range" className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"><ChevronLeft size={16} /></button>
            <button type="button" onClick={() => moveDate(1)} aria-label="Next date range" className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"><ChevronRight size={16} /></button>
          </div>
          <label className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-2.5 text-slate-500">
            <CalendarDays size={15} />
            <input aria-label="Choose calendar date" type="date" value={date} onChange={(event) => event.target.value && onDateChange(event.target.value)} className="w-[130px] bg-transparent text-xs text-slate-600 outline-none" />
          </label>
        </div>
      </div>

      {view === "day" ? (
        <div className="overflow-x-auto">
          <div className="min-w-[620px]">
            <div className="flex border-b border-slate-100 bg-slate-50/70">
              <div className="w-20 shrink-0 px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Time</div>
              <div className="flex-1 px-3 py-3 text-sm font-semibold text-[#173F35]">{formatDay(selectedDate, { weekday: "long", month: "short", day: "numeric" })}</div>
            </div>
            <div className="flex">
              <div className="w-20 shrink-0">
                {hours.map((hour) => (
                  <div key={hour} className="h-[60px] border-t border-slate-100 px-2 pt-1 text-[11px] text-slate-400">{new Date(2000, 0, 1, hour).toLocaleTimeString("en-PH", { hour: "numeric", hour12: true })}</div>
                ))}
              </div>
              {renderDayColumn(selectedDate, true)}
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="flex border-b border-slate-100 bg-slate-50/70">
              <div className="w-16 shrink-0 px-2 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Time</div>
              <div className="flex flex-1">
                {weekDays.map((day) => {
                  const dayKey = toDateKey(day);
                  return (
                    <button key={dayKey} type="button" onClick={() => onDateChange(dayKey)} className={`flex-1 border-l border-slate-100 px-2 py-3 text-center text-xs font-semibold ${dayKey === date ? "bg-[#DDF3E7]/50 text-[#176B55]" : "text-slate-600 hover:bg-slate-100"}`}>
                      <span>{formatDay(day, { weekday: "short" })}</span><span className="ml-1">{day.getDate()}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex">
              <div className="w-16 shrink-0">
                {hours.map((hour) => <div key={hour} className="h-[60px] border-t border-slate-100 px-1 pt-1 text-[10px] text-slate-400">{new Date(2000, 0, 1, hour).toLocaleTimeString("en-PH", { hour: "numeric", hour12: true })}</div>)}
              </div>
              <div className="flex flex-1">
                {weekDays.map((day) => renderDayColumn(day))}
              </div>
            </div>
          </div>
        </div>
      )}

      {legendItems.length > 0 && (
        <footer className="flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 px-4 py-3 sm:px-5">
          {legendItems.map(({ status, label, className }) => (
            <span key={status} className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <span className={`h-2.5 w-2.5 rounded-sm border-l-2 ${className}`} />
              {label}
            </span>
          ))}
        </footer>
      )}

      <div className="flex items-center gap-2 border-t border-slate-100 px-4 py-3 text-xs text-slate-400 sm:px-5">
        <Clock3 size={14} /> Click an event to view its details.
      </div>
    </div>
  );
}
