"use server";
import "server-only";
import { getCurrentStaff } from "@/lib/auth/get-current-staff";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { getEmailTemplate } from "@/lib/email/render-email-template";
import { sendEmail } from "@/lib/email";

export type DashboardBooking = {
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
  status: "Pending" | "Confirmed" | "Declined" | "Completed";
  notes: string;
};

export type BookingEditOptions = {
  branches: {
    id: string;
    name: string;
  }[];
  services: {
    id: string;
    name: string;
    durationMinutes: number;
    price: number;
  }[];
  doctors: {
    id: string;
    name: string;
    branchServices: {
      branchId: string;
      serviceId: string;
      price: number | null;
      durationMinutes: number | null;
    }[];
  }[];
};

export async function getClinicContext() {
  const { staff } = await getCurrentStaff();
  if (
    staff.role !== "clinic_user" ||
    !staff.clinic_id
  ) {
    throw new Error("You are not authorized to access clinic bookings.");
  }
  return {
    clinicId: staff.clinic_id,
    supabase: createSupabaseAdmin(),
  };
}

function mapStatus(
  status: string,
): DashboardBooking["status"] {
  switch (status) {
    case "Pending":
      return "Pending";
    case "Approved":
    case "Confirmed":
      return "Confirmed";
    case "Rejected":
    case "Declined":
      return "Declined";
    case "Completed":
      return "Completed";
    default:
      return "Pending";
  }
}

export async function getClinicBookings(): Promise<DashboardBooking[]> {
  const { clinicId, supabase } = await getClinicContext();
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      id,
      clinic_id,
      branch_id,
      doctor_id,
      service_id,
      patient_full_name,
      patient_email,
      patient_phone,
      patient_notes,
      appointment_date,
      appointment_time,
      service_name,
      service_duration,
      status
    `)
    .eq("clinic_id", clinicId)
    .order("appointment_date", { ascending: false })
    .order("appointment_time", { ascending: false });
  if (error) {
    console.error("Failed to fetch bookings:", error.message);
    throw new Error("Unable to load bookings.");
  }
  const bookings = data ?? [];
  if (!bookings.length) return [];
  const branchIds = [
    ...new Set(bookings.map((booking) => booking.branch_id)),
  ];
  const doctorIds = [
    ...new Set(bookings.map((booking) => booking.doctor_id)),
  ];
  const [branchResult, doctorResult] = await Promise.all([
    supabase
      .from("branches")
      .select("id, name")
      .eq("clinic_id", clinicId)
      .in("id", branchIds),
    supabase
      .from("doctors")
      .select("id, name")
      .eq("clinic_id", clinicId)
      .in("id", doctorIds),
  ]);
  if (branchResult.error || doctorResult.error) {
    console.error(
      "Failed to load booking relationships:",
      branchResult.error?.message,
      doctorResult.error?.message,
    );
    throw new Error("Unable to load booking details.");
  }
  const branchMap = new Map(
    (branchResult.data ?? []).map((item) => [item.id, item.name]),
  );
  const doctorMap = new Map(
    (doctorResult.data ?? []).map((item) => [item.id, item.name]),
  );
  return bookings.map((booking) => ({
    id: booking.id,
    patient: booking.patient_full_name,
    email: booking.patient_email,
    phone: booking.patient_phone,
    service: booking.service_name,
    doctor: doctorMap.get(booking.doctor_id) ?? "Unknown doctor",
    branch: branchMap.get(booking.branch_id) ?? "Unknown branch",
    date: booking.appointment_date,
    time: String(booking.appointment_time).slice(0, 5),
    duration: Number(booking.service_duration),
    status: mapStatus(booking.status),
    notes: booking.patient_notes ?? "",
  }));
}

export async function updateBookingStatus(
  bookingId: string,
  status: "Approved" | "Rejected",
) {
  if (
    typeof bookingId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      bookingId,
    )
  ) {
    throw new Error("Invalid booking.");
  }
  if (!["Approved", "Rejected"].includes(status)) {
    throw new Error("Invalid booking status.");
  }
  const { clinicId, supabase } = await getClinicContext();
  // 1. Update booking status.
  const { data, error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId)
    .eq("clinic_id", clinicId)
    .eq("status", "Pending")
    .select("id, is_updated")
    .maybeSingle();
  if (error) {
    console.error("Failed to update booking:", error.message);
    throw new Error("Unable to update booking status.");
  }
  if (!data) {
    throw new Error(
      "This booking is no longer pending or is unavailable.",
    );
  }
  // 2. Get the appropriate email template.
  const templateCode =
    status === "Rejected"
      ? "booking_declined"
      : data.is_updated
        ? "booking_updated"
        : "booking_approved";
  const emailTemplate = await getEmailTemplate(
    templateCode,
    clinicId,
  );
  // 3. Only fetch booking details if an email template exists.
  if (emailTemplate) {
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        id,
        patient_full_name,
        patient_email
      `)
      .eq("id", bookingId)
      .eq("clinic_id", clinicId)
      .single();
    if (bookingError || !booking) {
      console.error("Failed to fetch booking details:", bookingError);
      throw new Error("Unable to retrieve booking details for email.");
    }
    // 4. Send email.
    await sendEmail({
      templateId: emailTemplate.id,
      clinicId,
      to: booking.patient_email,
      recipientName: booking.patient_full_name,
      resolverIds: {
        id_booking: booking.id,
      },
    });
  }
  return {
    success: true,
  };
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}

function fail(message: string): never {
  throw new Error(message);
}

function getManilaDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function getManilaMinutes() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Manila",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const hour = Number(
    parts.find((part) => part.type === "hour")?.value ?? 0,
  );
  const minute = Number(
    parts.find((part) => part.type === "minute")?.value ?? 0,
  );
  return hour * 60 + minute;
}

function parseBookingDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    fail("Please select a valid appointment date.");
  }
  const [year, month, day] = date.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    fail("Please select a valid appointment date.");
  }
  if (date < getManilaDate()) {
    fail("Please select today or a future date.");
  }
  return parsed.getUTCDay();
}

function timeToMinutes(value: string) {
  const match = value.slice(0, 5).match(/^(\d{2}):(\d{2})$/);
  if (!match) {
    fail("Invalid appointment time.");
  }
  return Number(match[1]) * 60 + Number(match[2]);
}

function toSqlTime(value: string) {
  const match = value.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) {
    fail("Please select a valid appointment time.");
  }
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3].toUpperCase();
  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
    fail("Please select a valid appointment time.");
  }
  hour = (hour % 12) + (meridiem === "PM" ? 12 : 0);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
}

function minutesToLabel(total: number) {
  const hour24 = Math.floor(total / 60);
  const minute = total % 60;
  const meridiem = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${meridiem}`;
}
async function getEditBookingContext(bookingId: string) {
  if (!isUuid(bookingId)) {
    fail("Invalid booking.");
  }
  const context = await getClinicContext();
  const { data: booking, error } = await context.supabase
    .from("bookings")
    .select("id, status")
    .eq("id", bookingId)
    .eq("clinic_id", context.clinicId)
    .maybeSingle();
  if (error) {
    console.error("Failed to load booking:", error.message);
    fail("Unable to load this booking.");
  }
  if (!booking) {
    fail("Booking not found.");
  }
  if (booking.status !== "Pending") {
    fail("Only pending bookings can be edited.");
  }
  return context;
}

/**
 * Returns only active branches, services, and doctors
 * belonging to the authenticated clinic.
 */

export async function getBookingEditOptions(): Promise<BookingEditOptions> {
  const { clinicId, supabase } = await getClinicContext();
  const [branchResult, serviceResult, doctorResult, assignmentResult] =
    await Promise.all([
      supabase
        .from("branches")
        .select("id, name")
        .eq("clinic_id", clinicId)
        .eq("status", "Active")
        .order("name"),
      supabase
        .from("services")
        .select("id, name, duration, rate")
        .eq("clinic_id", clinicId)
        .eq("status", "Active")
        .order("name"),
      supabase
        .from("doctors")
        .select("id, name")
        .eq("clinic_id", clinicId)
        .eq("status", "Active")
        .order("name"),
      supabase
        .from("doctor_branches")
        .select("id, doctor_id, branch_id")
        .eq("clinic_id", clinicId),
    ]);
  if (
    branchResult.error ||
    serviceResult.error ||
    doctorResult.error ||
    assignmentResult.error
  ) {
    console.error(
      "Failed to load edit options:",
      branchResult.error?.message,
      serviceResult.error?.message,
      doctorResult.error?.message,
      assignmentResult.error?.message,
    );
    fail("Unable to load booking options.");
  }
  const assignments = assignmentResult.data ?? [];
  const assignmentIds = assignments.map((item) => item.id);
  let serviceAssignments: {
    doctor_branch_id: string;
    service_id: string;
    price_override: number | null;
    duration_override: number | null;
  }[] = [];
  if (assignmentIds.length) {
    const { data, error } = await supabase
      .from("doctor_branch_services")
      .select(
        "doctor_branch_id, service_id, price_override, duration_override",
      )
      .in("doctor_branch_id", assignmentIds);
    if (error) {
      console.error("Failed to load doctor services:", error.message);
      fail("Unable to load doctor service assignments.");
    }
    serviceAssignments = data ?? [];
  }
  return {
    branches: branchResult.data ?? [],
    services: (serviceResult.data ?? []).map((service) => ({
      id: service.id,
      name: service.name,
      durationMinutes: Number(service.duration),
      price: Number(service.rate),
    })),
    doctors: (doctorResult.data ?? []).map((doctor) => {
      const doctorAssignments = assignments.filter(
        (item) => item.doctor_id === doctor.id,
      );
      return {
        id: doctor.id,
        name: doctor.name,
        branchServices: serviceAssignments.flatMap((item) => {
          const assignment = doctorAssignments.find(
            (candidate) => candidate.id === item.doctor_branch_id,
          );
          if (!assignment) return [];
          return [{
            branchId: assignment.branch_id,
            serviceId: item.service_id,
            price:
              item.price_override == null
                ? null
                : Number(item.price_override),
            durationMinutes:
              item.duration_override == null
                ? null
                : Number(item.duration_override),
          }];
        }),
      };
    }),
  };
}

/**
 * Retrieves available appointment times.
 * The current booking is excluded from the conflict check.
 */

export async function getPendingBookingEditSlots(
  bookingId: string | null,
  input: {
    branchId: string;
    serviceId: string;
    doctorId: string;
    date: string;
  },
): Promise<string[]> {
  const { clinicId, supabase } = bookingId
    ? await getEditBookingContext(bookingId)
    : await getClinicContext();
  if (
    !isUuid(input.branchId) ||
    !isUuid(input.serviceId) ||
    !isUuid(input.doctorId)
  ) {
    fail("Please select a valid branch, service, and doctor.");
  }
  const weekday = parseBookingDate(input.date);
  const options = await getBookingEditOptions();
  const branch = options.branches.find(
    (item) => item.id === input.branchId,
  );
  const service = options.services.find(
    (item) => item.id === input.serviceId,
  );
  const doctor = options.doctors.find(
    (item) => item.id === input.doctorId,
  );
  if (!branch || !service || !doctor) {
    fail("One of your selections is no longer available.");
  }
  const doctorService = doctor.branchServices.find(
    (item) =>
      item.branchId === input.branchId &&
      item.serviceId === input.serviceId,
  );
  if (!doctorService) {
    fail("This doctor does not offer the selected service at this branch.");
  }
  const assignment = await supabase
    .from("doctor_branches")
    .select("id")
    .eq("clinic_id", clinicId)
    .eq("doctor_id", input.doctorId)
    .eq("branch_id", input.branchId)
    .maybeSingle();
  if (assignment.error || !assignment.data) {
    fail("The selected doctor is not assigned to this branch.");
  }
  const duration =
    doctorService.durationMinutes ?? service.durationMinutes;
  const { data: workingHours, error: hoursError } = await supabase
    .from("doctor_working_hours")
    .select("start_time, end_time")
    .eq("doctor_branch_id", assignment.data.id)
    .eq("day_of_week", weekday);
  if (hoursError) {
    console.error("Failed to load schedule:", hoursError.message);
    fail("Unable to load the doctor's schedule.");
  }
  if (!workingHours?.length) return [];
  let bookingsQuery = supabase
    .from("bookings")
    .select("id, appointment_time, service_duration")
    .eq("clinic_id", clinicId)
    .eq("doctor_id", input.doctorId)
    .eq("appointment_date", input.date)
    .not("status", "in", '("Rejected","Cancelled")');
  if (bookingId) {
    bookingsQuery = bookingsQuery.neq("id", bookingId);
  }
  const { data: bookings, error: bookingsError } = await bookingsQuery;
  if (bookingsError) {
    console.error("Failed to load existing bookings:", bookingsError.message);
    fail("Unable to check appointment availability.");
  }
  const busy = (bookings ?? []).map((booking) => {
    const start = timeToMinutes(booking.appointment_time);
    return {
      start,
      end: start + Number(booking.service_duration || 0),
    };
  });
  const today = input.date === getManilaDate();
  const now = today ? getManilaMinutes() : -1;
  const slots = new Set<string>();
  for (const range of workingHours) {
    const start = timeToMinutes(range.start_time);
    const end = timeToMinutes(range.end_time);
    for (
      let slotStart = start;
      slotStart + duration <= end;
      slotStart += 30
    ) {
      if (today && slotStart <= now) continue;
      const slotEnd = slotStart + duration;
      const overlaps = busy.some(
        (booking) =>
          slotStart < booking.end && booking.start < slotEnd,
      );
      if (!overlaps) {
        slots.add(minutesToLabel(slotStart));
      }
    }
  }
  return [...slots].sort((a, b) => {
    const toMinutes = (label: string) => {
      const match = label.match(/^(\d{1,2}):(\d{2}) (AM|PM)$/)!;
      let hour = Number(match[1]);
      const minute = Number(match[2]);
      hour = (hour % 12) + (match[3] === "PM" ? 12 : 0);
      return hour * 60 + minute;
    };
    return toMinutes(a) - toMinutes(b);
  });
}

type BookingFormInput = {
  branchId: string;
  serviceId: string;
  doctorId: string;
  date: string;
  time: string;
  patient: {
    fullName: string;
    email: string;
    phone: string;
    notes: string;
  };
};

export type UpdatePendingBookingInput = BookingFormInput & {
  bookingId: string;
};

export type CreateBookingInput = BookingFormInput;

type NormalizedPatient = {
  fullName: string;
  email: string;
  phone: string;
  notes: string;
};

type PreparedBooking = {
  clinicId: string;
  supabase: Awaited<ReturnType<typeof getClinicContext>>["supabase"];
  patient: NormalizedPatient;
  appointmentTime: string;
  duration: number;
  price: number;
  serviceName: string;
};

/** Validates and normalizes patient details shared by create and update. */
function validatePatientDetails(patient: BookingFormInput["patient"]): NormalizedPatient {
  const fullName = patient?.fullName?.trim() ?? "";
  const email = patient?.email?.trim().toLowerCase() ?? "";
  const phone = patient?.phone?.trim() ?? "";
  const notes = patient?.notes?.trim() ?? "";

  if (!fullName || fullName.length > 150) {
    fail("Please enter a valid patient name.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fail("Please enter a valid email address.");
  }
  if (!phone || phone.length > 40) {
    fail("Please enter a valid phone number.");
  }
  if (notes.length > 1000) {
    fail("Notes cannot exceed 1,000 characters.");
  }

  return { fullName, email, phone, notes };
}

/** Checks the selected branch, service, doctor, and branch-specific service settings. */
async function getBookingServiceDetails(
  clinicId: string,
  supabase: PreparedBooking["supabase"],
  input: BookingFormInput,
) {
  const options = await getBookingEditOptions();
  const branch = options.branches.find((item) => item.id === input.branchId);
  const service = options.services.find((item) => item.id === input.serviceId);
  const doctor = options.doctors.find((item) => item.id === input.doctorId);

  if (!branch || !service || !doctor) {
    fail("One of your selections is no longer available.");
  }

  const doctorService = doctor.branchServices.find(
    (item) =>
      item.branchId === input.branchId &&
      item.serviceId === input.serviceId,
  );
  if (!doctorService) {
    fail("This doctor does not offer the selected service at this branch.");
  }

  const { data: assignment, error: assignmentError } = await supabase
    .from("doctor_branches")
    .select("id")
    .eq("clinic_id", clinicId)
    .eq("doctor_id", input.doctorId)
    .eq("branch_id", input.branchId)
    .maybeSingle();

  if (assignmentError || !assignment) {
    fail("The selected doctor is not assigned to this branch.");
  }

  return {
    serviceName: service.name,
    duration: doctorService.durationMinutes ?? service.durationMinutes,
    price: doctorService.price ?? service.price,
    doctorBranchId: assignment.id,
  };
}

/** Validates the appointment against working hours, current time, and other bookings. */
async function validateBookingAvailability(
  clinicId: string,
  supabase: PreparedBooking["supabase"],
  input: BookingFormInput,
  doctorBranchId: string,
  duration: number,
  appointmentTime: string,
  bookingId: string | null,
) {
  const weekday = parseBookingDate(input.date);
  const { data: workingHours, error: hoursError } = await supabase
    .from("doctor_working_hours")
    .select("start_time, end_time")
    .eq("doctor_branch_id", doctorBranchId)
    .eq("day_of_week", weekday);

  if (hoursError) {
    console.error("Failed to load schedule:", hoursError.message);
    fail("Unable to validate the doctor's schedule.");
  }

  const start = timeToMinutes(appointmentTime);
  const fitsSchedule = (workingHours ?? []).some((range) => {
    const rangeStart = timeToMinutes(range.start_time);
    const rangeEnd = timeToMinutes(range.end_time);
    return start >= rangeStart && start + duration <= rangeEnd;
  });

  if (!fitsSchedule) {
    fail("The selected time is outside the doctor's working hours.");
  }
  if (input.date === getManilaDate() && start <= getManilaMinutes()) {
    fail("Please select a future appointment time.");
  }

  let conflictsQuery = supabase
    .from("bookings")
    .select("id, appointment_time, service_duration")
    .eq("clinic_id", clinicId)
    .eq("doctor_id", input.doctorId)
    .eq("appointment_date", input.date)
    .not("status", "in", '("Rejected","Cancelled")');

  if (bookingId) {
    conflictsQuery = conflictsQuery.neq("id", bookingId);
  }

  const { data: conflicts, error: conflictError } = await conflictsQuery;
  if (conflictError) {
    console.error("Failed to check appointment conflicts:", conflictError.message);
    fail("Unable to check appointment availability.");
  }

  const overlaps = (conflicts ?? []).some((booking) => {
    const existingStart = timeToMinutes(booking.appointment_time);
    const existingEnd = existingStart + Number(booking.service_duration || 0);
    return start < existingEnd && existingStart < start + duration;
  });

  if (overlaps) {
    fail("This appointment time is no longer available.");
  }

  return start;
}

/** Runs the shared validation and resolves all values needed to save a booking. */
async function prepareBooking(
  input: BookingFormInput,
  bookingId: string | null,
): Promise<PreparedBooking> {
  if (
    !input ||
    !isUuid(input.branchId) ||
    !isUuid(input.serviceId) ||
    !isUuid(input.doctorId)
  ) {
    fail("Please select valid booking details.");
  }

  const patient = validatePatientDetails(input.patient);
  const appointmentTime = toSqlTime(input.time);
  parseBookingDate(input.date);

  const { clinicId, supabase } = bookingId
    ? await getEditBookingContext(bookingId)
    : await getClinicContext();

  const serviceDetails = await getBookingServiceDetails(
    clinicId,
    supabase,
    input,
  );
  await validateBookingAvailability(
    clinicId,
    supabase,
    input,
    serviceDetails.doctorBranchId,
    serviceDetails.duration,
    appointmentTime,
    bookingId,
  );

  return {
    clinicId,
    supabase,
    patient,
    appointmentTime,
    duration: serviceDetails.duration,
    price: serviceDetails.price,
    serviceName: serviceDetails.serviceName,
  };
}

/** Builds the common database fields used by both insert and update. */
function getBookingRecord(input: BookingFormInput, prepared: PreparedBooking) {
  return {
    branch_id: input.branchId,
    doctor_id: input.doctorId,
    service_id: input.serviceId,
    patient_full_name: prepared.patient.fullName,
    patient_email: prepared.patient.email,
    patient_phone: prepared.patient.phone,
    patient_notes: prepared.patient.notes,
    appointment_date: input.date,
    appointment_time: prepared.appointmentTime,
    service_name: prepared.serviceName,
    service_price: prepared.price,
    service_duration: prepared.duration,
  };
}

/** Updates a booking only if it is still Pending. */
export async function updatePendingBooking(input: UpdatePendingBookingInput) {
  if (!input || !isUuid(input.bookingId)) {
    fail("Please select a valid booking.");
  }

  const prepared = await prepareBooking(input, input.bookingId);
  const { data, error } = await prepared.supabase
    .from("bookings")
    .update({
      ...getBookingRecord(input, prepared),
      is_updated: true,
    })
    .eq("id", input.bookingId)
    .eq("clinic_id", prepared.clinicId)
    .eq("status", "Pending")
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Failed to update booking:", error.message);
    fail("Unable to save booking changes.");
  }
  if (!data) {
    fail("This booking is no longer pending or is unavailable.");
  }

  return { success: true };
}

/** Creates a new pending booking for the authenticated clinic. */
export async function createBooking(input: CreateBookingInput) {
  const prepared = await prepareBooking(input, null);
  const { data, error } = await prepared.supabase
    .from("bookings")
    .insert({
      clinic_id: prepared.clinicId,
      ...getBookingRecord(input, prepared),
      status: "Pending",
      is_updated: false,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Failed to create booking:", error?.message);
    fail("Unable to create booking.");
  }

  return { success: true, bookingId: data.id };
}
