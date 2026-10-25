
export type CalendarEventType =
  | 'appointment'
  | 'working_hours'
  | 'break'
  | 'leave'
  | 'blocked'
  | 'closure';

export type CalendarEventStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rejected'
  | 'available'
  | 'unavailable';

export type CalendarEvent = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  type: CalendarEventType;
  status?: CalendarEventStatus;
  description?: string;
  personId?: string;
  personName?: string;
  serviceName?: string;
  branchId?: string;
  resourceId?: string;
};

export type CalendarLegendItem = {
  /** Event type used to match the legend item to calendar events. */
  type: CalendarEvent["type"];
  /** Text displayed in the legend. */
  label: string;
  /** Tailwind classes used for the legend marker and event card. */
  className: string;
};
