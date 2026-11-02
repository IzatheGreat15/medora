
"use server";

import "server-only";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export type BookingBranchOption = {
  id: string;
  name: string;
  address: string;
  hours: string;
  amenities: string[];
};

export type BookingServiceOption = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  category: string;
};

export type DoctorBranchServiceOption = {
  branchId: string;
  serviceId: string;
  price: number | null;
  durationMinutes: number | null;
};

export type BookingDoctorOption = {
  id: string;
  name: string;
  title: string;
  branchIds: string[];
  serviceIds: string[];
  branchServices: DoctorBranchServiceOption[];
  availability: string;
  initials: string;
};

export type BookingOptions = {
  clinicId: string;
  clinicName: string;
  clinicLogoUrl: string;
  branches: BookingBranchOption[];
  services: BookingServiceOption[];
  doctors: BookingDoctorOption[];
};

export type CreateBookingInput = {
  clinicId: string;
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

export type AvailableBookingSlotsInput = {
  clinicId: string;
  branchId: string;
  serviceId: string;
  doctorId: string;
  date: string;
};

function fail(message: string): never {
  throw new Error(message);
}

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}

function getManilaDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
  };
}

function manilaDateString() {
  const { year, month, day } = getManilaDateParts();

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function manilaMinutesNow() {
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

function parseDate(date: string) {
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

  if (date < manilaDateString()) {
    fail("Please select today or a future date.");
  }

  return {
    weekday: parsed.getUTCDay(),
    year,
    month,
    day,
  };
}

function timeToMinutes(value: string) {
  const match = value.slice(0, 5).match(/^(\d{2}):(\d{2})$/);

  if (!match) return 0;

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

function formatHours(openingHours: unknown): string {
  if (
    !openingHours ||
    typeof openingHours !== "object" ||
    Array.isArray(openingHours)
  ) {
    return "Please contact the clinic for opening hours.";
  }

  const hours = openingHours as Record<
    string,
    { open?: boolean; start?: string; end?: string }
  >;

  const dayNames = [
    { key: "Monday", label: "Mon" },
    { key: "Tuesday", label: "Tue" },
    { key: "Wednesday", label: "Wed" },
    { key: "Thursday", label: "Thu" },
    { key: "Friday", label: "Fri" },
    { key: "Saturday", label: "Sat" },
    { key: "Sunday", label: "Sun" },
  ];

  const to12Hour = (time: string) => {
    const match = time.match(/^(\d{1,2}):(\d{2})/);

    if (!match) return time;

    const hour = Number(match[1]);

    return `${String(hour % 12 || 12).padStart(2, "0")}:${match[2]} ${hour >= 12 ? "PM" : "AM"}`;
  };

  const groups = new Map<
    string,
    { days: string[]; start: string; end: string }
  >();

  for (const day of dayNames) {
    const schedule = hours[day.key];

    if (!schedule?.open || !schedule.start || !schedule.end) {
      continue;
    }

    const key = `${schedule.start}|${schedule.end}`;
    const existing = groups.get(key);

    if (existing) {
      existing.days.push(day.label);
    } else {
      groups.set(key, {
        days: [day.label],
        start: schedule.start,
        end: schedule.end,
      });
    }
  }

  if (!groups.size) return "Contact clinic for hours";

  return Array.from(groups.values())
    .map(
      (group) =>
        `${group.days.join(", ")} · ${to12Hour(group.start)} – ${to12Hour(group.end)}`,
    )
    .join("\n");
}

export async function getPublicBookingOptions(
  clinicId: string,
): Promise<BookingOptions> {
  if (!isUuid(clinicId)) {
    fail("Please open the booking link provided by your clinic.");
  }

  const supabase = createSupabaseAdmin();

  const { data: clinic, error: clinicError } = await supabase
    .from("clinics")
    .select("id, name, status, logo_url")
    .eq("id", clinicId)
    .maybeSingle();

  if (clinicError) {
    console.error(
      "Failed to load booking clinic:",
      clinicError.message,
    );

    fail("Unable to load this clinic.");
  }

  if (
    !clinic ||
    !["active", "trial"].includes(String(clinic.status).toLowerCase())
  ) {
    fail("This clinic is currently unavailable for online bookings.");
  }

  const [
    branchResult,
    serviceResult,
    doctorResult,
    assignmentResult,
  ] = await Promise.all([
    supabase
      .from("branches")
      .select("id, name, address, opening_hours")
      .eq("clinic_id", clinicId)
      .eq("status", "Active")
      .order("name"),

    supabase
      .from("services")
      .select("id, name, duration, rate, status")
      .eq("clinic_id", clinicId)
      .eq("status", "Active")
      .order("name"),

    supabase
      .from("doctors")
      .select("id, name, specialty, status")
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
      "Failed to load booking options",
      branchResult.error?.message,
      serviceResult.error?.message,
      doctorResult.error?.message,
      assignmentResult.error?.message,
    );

    fail("Unable to load the clinic's booking options.");
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
      console.error(
        "Failed to load doctor services:",
        error.message,
      );

      fail("Unable to load doctor service assignments.");
    }

    serviceAssignments = data ?? [];
  }

  const branches: BookingBranchOption[] = (
    branchResult.data ?? []
  ).map((branch) => ({
    id: branch.id,
    name: branch.name,
    address: branch.address ?? "",
    hours: formatHours(branch.opening_hours),
    amenities: [],
  }));

  const services: BookingServiceOption[] = (
    serviceResult.data ?? []
  ).map((service) => ({
    id: service.id,
    name: service.name,
    description: "Book an appointment for this service.",
    durationMinutes: Number(service.duration),
    price: Number(service.rate),
    category: "Clinic service",
  }));

  const doctors: BookingDoctorOption[] = (
    doctorResult.data ?? []
  ).map((doctor) => {
    const doctorAssignments = assignments.filter(
      (assignment) => assignment.doctor_id === doctor.id,
    );

    const branchServices: DoctorBranchServiceOption[] =
      serviceAssignments.flatMap((serviceAssignment) => {
        const assignment = doctorAssignments.find(
          (item) =>
            item.id === serviceAssignment.doctor_branch_id,
        );

        return assignment
          ? [
              {
                branchId: assignment.branch_id,
                serviceId: serviceAssignment.service_id,
                price:
                  serviceAssignment.price_override == null
                    ? null
                    : Number(serviceAssignment.price_override),
                durationMinutes:
                  serviceAssignment.duration_override == null
                    ? null
                    : Number(serviceAssignment.duration_override),
              },
            ]
          : [];
      });

    return {
      id: doctor.id,
      name: doctor.name,
      title: doctor.specialty ?? "Doctor",
      branchIds: [
        ...new Set(
          doctorAssignments.map((assignment) => assignment.branch_id),
        ),
      ],
      serviceIds: [
        ...new Set(
          branchServices.map((assignment) => assignment.serviceId),
        ),
      ],
      branchServices,
      availability: "Availability depends on the selected schedule.",
      initials: String(doctor.name)
        .split(/\s+/)
        .filter(Boolean)
        .map((part: string) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    };
  });

  return {
    clinicId: clinic.id,
    clinicName: clinic.name,
    clinicLogoUrl: clinic.logo_url,
    branches,
    services,
    doctors,
  };
}

async function getAssignmentAndService(
  input: AvailableBookingSlotsInput,
) {
  if (
    ![
      input.clinicId,
      input.branchId,
      input.serviceId,
      input.doctorId,
    ].every(isUuid)
  ) {
    fail("Please select a valid branch, service, and doctor.");
  }

  const options = await getPublicBookingOptions(input.clinicId);

  const service = options.services.find(
    (item) => item.id === input.serviceId,
  );

  const doctor = options.doctors.find(
    (item) => item.id === input.doctorId,
  );

  const branch = options.branches.find(
    (item) => item.id === input.branchId,
  );

  if (!service || !doctor || !branch) {
    fail("One of your selections is no longer available.");
  }

  const assignmentOption = doctor.branchServices.find(
    (item) =>
      item.branchId === input.branchId &&
      item.serviceId === input.serviceId,
  );

  if (!assignmentOption) {
    fail("This doctor does not offer the selected service at this branch.");
  }

  const supabase = createSupabaseAdmin();

  const { data: assignment, error } = await supabase
    .from("doctor_branches")
    .select("id")
    .eq("clinic_id", input.clinicId)
    .eq("doctor_id", input.doctorId)
    .eq("branch_id", input.branchId)
    .maybeSingle();

  if (error || !assignment) {
    fail("This doctor is not assigned to the selected branch.");
  }

  return {
    supabase,
    assignmentId: assignment.id,
    service,
    duration:
      assignmentOption.durationMinutes ?? service.durationMinutes,
    price: assignmentOption.price ?? service.price,
  };
}

export async function getAvailableBookingSlots(
  input: AvailableBookingSlotsInput,
): Promise<string[]> {
  if (
    !input ||
    !isUuid(input.clinicId) ||
    !isUuid(input.branchId) ||
    !isUuid(input.serviceId) ||
    !isUuid(input.doctorId)
  ) {
    fail("Please select a valid branch, service, and doctor.");
  }

  const { weekday } = parseDate(input.date);

  const { supabase, assignmentId, duration } =
    await getAssignmentAndService(input);

  const { data: workingHours, error: hoursError } = await supabase
    .from("doctor_working_hours")
    .select("start_time, end_time")
    .eq("doctor_branch_id", assignmentId)
    .eq("day_of_week", weekday);

  if (hoursError) {
    console.error(
      "Failed to load doctor schedule:",
      hoursError.message,
    );

    fail("Unable to load the doctor's schedule.");
  }

  if (!workingHours?.length) return [];

  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("appointment_time, service_duration")
    .eq("clinic_id", input.clinicId)
    .eq("doctor_id", input.doctorId)
    .eq("appointment_date", input.date)
    .not("status", "in", '("Rejected","Cancelled")');

  if (bookingsError) {
    console.error(
      "Failed to load existing bookings:",
      bookingsError.message,
    );

    fail("Unable to check appointment availability.");
  }

  const busy = (bookings ?? []).map((booking) => {
    const start = timeToMinutes(booking.appointment_time);

    return {
      start,
      end: start + Number(booking.service_duration || 0),
    };
  });

  const today = input.date === manilaDateString();
  const nowMinutes = today ? manilaMinutesNow() : -1;
  const slots = new Set<string>();

  for (const range of workingHours) {
    const start = timeToMinutes(range.start_time);
    const end = timeToMinutes(range.end_time);

    // Generate slots every 30 minutes. The entire service must fit.
    for (
      let slotStart = start;
      slotStart + duration <= end;
      slotStart += 30
    ) {
      if (today && slotStart <= nowMinutes) continue;

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

      return (
        ((Number(match[1]) % 12) +
          (match[3] === "PM" ? 12 : 0)) *
          60 +
        Number(match[2])
      );
    };

    return toMinutes(a) - toMinutes(b);
  });
}

export async function createPublicBooking(
  input: CreateBookingInput,
) {
  if (!input || typeof input !== "object") {
    fail("Invalid booking details.");
  }

  const fullName =
    typeof input.patient?.fullName === "string"
      ? input.patient.fullName.trim()
      : "";

  const email =
    typeof input.patient?.email === "string"
      ? input.patient.email.trim().toLowerCase()
      : "";

  const phone =
    typeof input.patient?.phone === "string"
      ? input.patient.phone.trim()
      : "";

  const notes =
    typeof input.patient?.notes === "string"
      ? input.patient.notes.trim()
      : "";

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

  const { weekday } = parseDate(input.date);
  const appointmentTime = toSqlTime(input.time);
  const slotStart = timeToMinutes(appointmentTime);

  const {
    supabase,
    assignmentId,
    service,
    duration,
    price,
  } = await getAssignmentAndService(input);

  const { data: workingHours, error: hoursError } = await supabase
    .from("doctor_working_hours")
    .select("start_time, end_time")
    .eq("doctor_branch_id", assignmentId)
    .eq("day_of_week", weekday);

  if (hoursError) {
    console.error(
      "Failed to verify doctor schedule:",
      hoursError.message,
    );

    fail("Unable to verify the doctor's schedule.");
  }

  const slotEnd = slotStart + duration;

  const withinWorkingHours = (workingHours ?? []).some(
    (range) =>
      slotStart >= timeToMinutes(range.start_time) &&
      slotEnd <= timeToMinutes(range.end_time),
  );

  if (!withinWorkingHours) {
    fail(
      "That time is outside the doctor's working hours. Please choose another slot.",
    );
  }

  if (
    input.date === manilaDateString() &&
    slotStart <= manilaMinutesNow()
  ) {
    fail(
      "That appointment time has already passed. Please choose another time.",
    );
  }

  const { data: existingBookings, error: bookingsError } =
    await supabase
      .from("bookings")
      .select("appointment_time, service_duration")
      .eq("clinic_id", input.clinicId)
      .eq("doctor_id", input.doctorId)
      .eq("appointment_date", input.date)
      .not("status", "in", '("Rejected","Cancelled")');

  if (bookingsError) {
    console.error(
      "Failed to check existing bookings:",
      bookingsError.message,
    );

    fail("Unable to verify appointment availability.");
  }

  const overlaps = (existingBookings ?? []).some((existing) => {
    const existingStart = timeToMinutes(existing.appointment_time);
    const existingEnd =
      existingStart + Number(existing.service_duration || 0);

    return slotStart < existingEnd && existingStart < slotEnd;
  });

  if (overlaps) {
    fail(
      "That appointment time is no longer available. Please choose another time.",
    );
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      clinic_id: input.clinicId,
      branch_id: input.branchId,
      doctor_id: input.doctorId,
      service_id: input.serviceId,

      patient_full_name: fullName,
      patient_email: email,
      patient_phone: phone,
      patient_notes: notes || null,

      appointment_date: input.date,
      appointment_time: appointmentTime,

      service_name: service.name,
      service_price: price,
      service_duration: duration,

      status: "Pending",
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error(
      "Failed to create booking:",
      error?.message,
    );

    fail("Unable to submit your booking. Please try again.");
  }

  return {
    success: true,
    bookingId: data.id,
  };
}
