
"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { requireClinicUser } from "@/lib/auth/require-clinic-user";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export type DoctorStatus = "Active" | "Inactive";

export type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type DoctorForm = {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  licenseNumber: string;
  status: DoctorStatus;
  bio: string;
};

export type ScheduleRule = {
  id: string;
  selectedDays: DayKey[];
  startTime: string;
  endTime: string;
};

export type BranchSchedule = {
  branchId: string;
  rules: ScheduleRule[];
};

export type ServiceAssignment = {
  branchId: string;
  serviceId: string;
  assigned: boolean;
  priceOverride: string;
  durationOverride: string;
};

export type SaveInput = {
  doctor: DoctorForm;
  schedules: BranchSchedule[];
  assignments: ServiceAssignment[];
};

export type Branch = {
  id: string;
  name: string;
  address: string;
};

export type Service = {
  id: string;
  name: string;
  defaultPrice: number;
  defaultDuration: number;
};

export type WorkingHourRule = {
  id: string;
  selectedDays: DayKey[];
  startTime: string;
  endTime: string;
};

const DAY_TO_NUMBER: Record<DayKey, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const NUMBER_TO_DAY: Record<number, DayKey> = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function hasOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  return (
    timeToMinutes(startA) < timeToMinutes(endB) &&
    timeToMinutes(startB) < timeToMinutes(endA)
  );
}

function validateSchedules(schedules: BranchSchedule[]) {
  const seenBranchIds = new Set<string>();

  for (const schedule of schedules) {
    if (seenBranchIds.has(schedule.branchId)) {
      throw new Error("A branch has been assigned more than once.");
    }

    seenBranchIds.add(schedule.branchId);

    for (const rule of schedule.rules) {
      if (!rule.selectedDays.length) {
        throw new Error(
          "Please select at least one day for each working-hours rule.",
        );
      }

      if (
        !/^\d{2}:\d{2}$/.test(rule.startTime) ||
        !/^\d{2}:\d{2}$/.test(rule.endTime) ||
        rule.startTime >= rule.endTime
      ) {
        throw new Error(
          "Each working-hours rule must end later than it starts.",
        );
      }

      if (
        timeToMinutes(rule.startTime) < 0 ||
        timeToMinutes(rule.endTime) > 23 * 60 + 59
      ) {
        throw new Error("Please provide valid working hours.");
      }

      for (const day of rule.selectedDays) {
        if (!(day in DAY_TO_NUMBER)) {
          throw new Error("A working-hours rule contains an invalid day.");
        }
      }
    }
  }

  // A doctor cannot work at two different branches at overlapping
  // times on the same day.
  for (let i = 0; i < schedules.length; i++) {
    for (let j = i + 1; j < schedules.length; j++) {
      const firstBranch = schedules[i];
      const secondBranch = schedules[j];

      for (const firstRule of firstBranch.rules) {
        for (const secondRule of secondBranch.rules) {
          const sharedDays = firstRule.selectedDays.filter((day) =>
            secondRule.selectedDays.includes(day),
          );

          if (
            sharedDays.length > 0 &&
            hasOverlap(
              firstRule.startTime,
              firstRule.endTime,
              secondRule.startTime,
              secondRule.endTime,
            )
          ) {
            throw new Error(
              `The doctor's working hours overlap between two branches on ${sharedDays.join(", ")}. Please adjust the schedule.`,
            );
          }
        }
      }
    }
  }
}

export async function getDoctorEditData(doctorId: string) {
  const { staff, clinicId } = await requireClinicUser();
  const supabase = createSupabaseAdmin();

  const { data: doctor, error: doctorError } = await supabase
    .from("doctors")
    .select(
      "id, clinic_id, name, specialty, email, phone, license_number, status, bio",
    )
    .eq("id", doctorId)
    .eq("clinic_id", clinicId)
    .maybeSingle();

  if (doctorError) {
    throw new Error(`Failed to load doctor: ${doctorError.message}`);
  }

  if (!doctor) {
    throw new Error("Doctor not found.");
  }

  const [
    { data: branches, error: branchesError },
    { data: services, error: servicesError },
    { data: doctorBranches, error: doctorBranchesError },
  ] = await Promise.all([
    supabase
      .from("branches")
      .select("id, name, address")
      .eq("clinic_id", clinicId)
      .order("name"),
    supabase
      .from("services")
      .select("id, name, rate, duration")
      .eq("clinic_id", clinicId)
      .order("name"),
    supabase
      .from("doctor_branches")
      .select("id, branch_id")
      .eq("doctor_id", doctorId)
      .eq("clinic_id", clinicId),
  ]);

  if (branchesError) {
    throw new Error(`Failed to load branches: ${branchesError.message}`);
  }

  if (servicesError) {
    throw new Error(`Failed to load services: ${servicesError.message}`);
  }

  if (doctorBranchesError) {
    throw new Error(
      `Failed to load doctor branches: ${doctorBranchesError.message}`,
    );
  }

  const assignmentRows = doctorBranches ?? [];
  const assignmentIds = assignmentRows.map((row) => row.id);

  let workingHours: {
    doctor_branch_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
  }[] = [];

  let serviceRows: {
    doctor_branch_id: string;
    service_id: string;
    price_override: number | null;
    duration_override: number | null;
  }[] = [];

  if (assignmentIds.length > 0) {
    const [
      { data: hours, error: hoursError },
      { data: assignedServices, error: assignedServicesError },
    ] = await Promise.all([
      supabase
        .from("doctor_working_hours")
        .select("doctor_branch_id, day_of_week, start_time, end_time")
        .in("doctor_branch_id", assignmentIds),
      supabase
        .from("doctor_branch_services")
        .select(
          "doctor_branch_id, service_id, price_override, duration_override",
        )
        .in("doctor_branch_id", assignmentIds),
    ]);

    if (hoursError) {
      throw new Error(`Failed to load working hours: ${hoursError.message}`);
    }

    if (assignedServicesError) {
      throw new Error(
        `Failed to load service assignments: ${assignedServicesError.message}`,
      );
    }

    workingHours = hours ?? [];
    serviceRows = assignedServices ?? [];
  }

  const schedules = assignmentRows.map((assignment) => {
    const rows = workingHours.filter(
      (row) => row.doctor_branch_id === assignment.id,
    );

    // Group weekdays that share the same start and end time into
    // a single rule for the edit form.
    const grouped = new Map<string, DayKey[]>();

    for (const row of rows) {
      const day = NUMBER_TO_DAY[row.day_of_week];

      if (!day) continue;

      const key = `${row.start_time}|${row.end_time}`;
      const existing = grouped.get(key) ?? [];
      existing.push(day);
      grouped.set(key, existing);
    }

    const rules: ScheduleRule[] = Array.from(grouped.entries()).map(
      ([key, selectedDays], index) => {
        const [startTime, endTime] = key.split("|");

        return {
          id: `${assignment.branch_id}-${index}`,
          selectedDays,
          startTime: String(startTime).slice(0, 5),
          endTime: String(endTime).slice(0, 5),
        };
      },
    );

    return {
      branchId: assignment.branch_id,
      rules,
    };
  });

  const assignments = assignmentRows.flatMap((assignment) =>
    serviceRows
      .filter((row) => row.doctor_branch_id === assignment.id)
      .map((row) => ({
        branchId: assignment.branch_id,
        serviceId: row.service_id,
        assigned: true,
        priceOverride:
          row.price_override == null ? "" : String(row.price_override),
        durationOverride:
          row.duration_override == null
            ? ""
            : String(row.duration_override),
      })),
  );

  return {
    doctor: {
      id: doctor.id,
      name: doctor.name ?? "",
      specialty: doctor.specialty ?? "",
      email: doctor.email ?? "",
      phone: doctor.phone ?? "",
      licenseNumber: doctor.license_number ?? "",
      status: doctor.status as DoctorStatus,
      bio: doctor.bio ?? "",
    },
    branches: (branches ?? []).map((branch) => ({
      id: branch.id,
      name: branch.name,
      address: branch.address ?? "",
    })),
    services: (services ?? []).map((service) => ({
      id: service.id,
      name: service.name,
      defaultPrice: Number(service.rate),
      defaultDuration: Number(service.duration),
    })),
    schedules,
    assignments,
  };
}

export async function saveDoctorEdit(input: SaveInput) {
  const { staff, clinicId } = await requireClinicUser();
  const supabase = createSupabaseAdmin();

  const doctorId = input.doctor.id;

  const name = input.doctor.name.trim();
  const specialty = input.doctor.specialty.trim();
  const email = input.doctor.email.trim();
  const phone = input.doctor.phone.trim();
  const licenseNumber = input.doctor.licenseNumber.trim();
  const bio = input.doctor.bio.trim();

  if (!doctorId) {
    throw new Error("Missing doctor ID.");
  }

  if (!name) {
    throw new Error("Doctor name is required.");
  }

  if (!specialty) {
    throw new Error("Doctor specialty is required.");
  }

  if (!["Active", "Inactive"].includes(input.doctor.status)) {
    throw new Error("Invalid doctor status.");
  }

  validateSchedules(input.schedules);

  const { data: existingDoctor, error: doctorCheckError } = await supabase
    .from("doctors")
    .select("id")
    .eq("id", doctorId)
    .eq("clinic_id", clinicId)
    .maybeSingle();

  if (doctorCheckError) {
    throw new Error(
      `Failed to verify doctor: ${doctorCheckError.message}`,
    );
  }

  if (!existingDoctor) {
    throw new Error("Doctor not found or you do not have permission to edit it.");
  }

  const selectedBranchIds = [
    ...new Set(input.schedules.map((schedule) => schedule.branchId)),
  ];

  const { data: validBranches, error: branchCheckError } = await supabase
    .from("branches")
    .select("id")
    .eq("clinic_id", clinicId)
    .in(
      "id",
      selectedBranchIds.length ? selectedBranchIds : ["00000000-0000-0000-0000-000000000000"],
    );

  if (branchCheckError) {
    throw new Error(
      `Failed to validate branches: ${branchCheckError.message}`,
    );
  }

  if ((validBranches ?? []).length !== selectedBranchIds.length) {
    throw new Error("One or more selected branches are invalid.");
  }

  const selectedServices = [
    ...new Set(
      input.assignments
        .filter((assignment) => assignment.assigned)
        .map((assignment) => assignment.serviceId),
    ),
  ];

  if (selectedServices.length > 0) {
    const { data: validServices, error: serviceCheckError } = await supabase
      .from("services")
      .select("id")
      .eq("clinic_id", clinicId)
      .in("id", selectedServices);

    if (serviceCheckError) {
      throw new Error(
        `Failed to validate services: ${serviceCheckError.message}`,
      );
    }

    if ((validServices ?? []).length !== selectedServices.length) {
      throw new Error("One or more selected services are invalid.");
    }
  }

  for (const assignment of input.assignments) {
    if (!assignment.assigned) continue;

    if (!selectedBranchIds.includes(assignment.branchId)) {
      throw new Error(
        "A service is assigned to a branch that is not selected.",
      );
    }

    const price = assignment.priceOverride.trim();
    const duration = assignment.durationOverride.trim();

    if (
      price !== "" &&
      (!Number.isFinite(Number(price)) || Number(price) < 0)
    ) {
      throw new Error("Service price overrides must be non-negative numbers.");
    }

    if (
      duration !== "" &&
      (!Number.isInteger(Number(duration)) || Number(duration) <= 0)
    ) {
      throw new Error(
        "Service duration overrides must be positive whole numbers.",
      );
    }
  }

  const { error: updateDoctorError } = await supabase
    .from("doctors")
    .update({
      name,
      specialty,
      email: email || null,
      phone: phone || null,
      license_number: licenseNumber || null,
      status: input.doctor.status,
      bio: bio || null,
      updated_by: staff.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", doctorId)
    .eq("clinic_id", clinicId);

  if (updateDoctorError) {
    throw new Error(
      `Failed to update doctor: ${updateDoctorError.message}`,
    );
  }

  // Fetch current assignments and reuse them wherever possible.
  const { data: existingAssignments, error: existingAssignmentsError } =
    await supabase
      .from("doctor_branches")
      .select("id, branch_id")
      .eq("doctor_id", doctorId)
      .eq("clinic_id", clinicId);

  if (existingAssignmentsError) {
    throw new Error(
      `Failed to load existing doctor branches: ${existingAssignmentsError.message}`,
    );
  }

  const existingByBranch = new Map(
    (existingAssignments ?? []).map((assignment) => [
      assignment.branch_id,
      assignment,
    ]),
  );

  // Remove assignments for branches that were deselected.
  const removedAssignments = (existingAssignments ?? []).filter(
    (assignment) => !selectedBranchIds.includes(assignment.branch_id),
  );

  const removedIds = removedAssignments.map((assignment) => assignment.id);

  if (removedIds.length > 0) {
    // Child rows cascade when their doctor_branch row is deleted.
    const { error: removeError } = await supabase
      .from("doctor_branches")
      .delete()
      .eq("clinic_id", clinicId)
      .in("id", removedIds);

    if (removeError) {
      throw new Error(
        `Failed to remove deselected branches: ${removeError.message}`,
      );
    }
  }

  // Only insert branches that do not already have an assignment.
  const missingBranchIds = selectedBranchIds.filter(
    (branchId) => !existingByBranch.has(branchId),
  );

  if (missingBranchIds.length > 0) {
    const { error: insertError } = await supabase
      .from("doctor_branches")
      .insert(
        missingBranchIds.map((branchId) => ({
          doctor_id: doctorId,
          branch_id: branchId,
          clinic_id: clinicId,
        })),
      );

    if (insertError) {
      throw new Error(
        `Failed to add doctor branches: ${insertError.message}`,
      );
    }
  }

  // Reload assignments so all subsequent writes use the actual IDs.
  const { data: savedBranches, error: savedBranchesError } = await supabase
    .from("doctor_branches")
    .select("id, branch_id")
    .eq("doctor_id", doctorId)
    .eq("clinic_id", clinicId);

  if (savedBranchesError) {
    throw new Error(
      `Failed to reload doctor branches: ${savedBranchesError.message}`,
    );
  }

  const assignmentIdByBranch = new Map(
    (savedBranches ?? []).map((assignment) => [
      assignment.branch_id,
      assignment.id,
    ]),
  );

  // Replace working hours for the selected branch assignments.
  const assignmentIds = (savedBranches ?? []).map(
    (assignment) => assignment.id,
  );

  if (assignmentIds.length > 0) {
    const { error: deleteHoursError } = await supabase
      .from("doctor_working_hours")
      .delete()
      .in("doctor_branch_id", assignmentIds);

    if (deleteHoursError) {
      throw new Error(
        `Failed to update working hours: ${deleteHoursError.message}`,
      );
    }

    const { error: deleteServicesError } = await supabase
      .from("doctor_branch_services")
      .delete()
      .in("doctor_branch_id", assignmentIds);

    if (deleteServicesError) {
      throw new Error(
        `Failed to update service assignments: ${deleteServicesError.message}`,
      );
    }
  }

  const hoursToInsert = input.schedules.flatMap((schedule) => {
    const doctorBranchId = assignmentIdByBranch.get(schedule.branchId);

    if (!doctorBranchId) {
      throw new Error(
        "Could not find the saved assignment for a selected branch.",
      );
    }

    return schedule.rules.flatMap((rule) =>
      rule.selectedDays.map((day) => ({
        doctor_branch_id: doctorBranchId,
        day_of_week: DAY_TO_NUMBER[day],
        start_time: rule.startTime,
        end_time: rule.endTime,
      })),
    );
  });

  if (hoursToInsert.length > 0) {
    const { error: insertHoursError } = await supabase
      .from("doctor_working_hours")
      .insert(hoursToInsert);

    if (insertHoursError) {
      throw new Error(
        `Failed to save working hours: ${insertHoursError.message}`,
      );
    }
  }

  const servicesToInsert = input.assignments
    .filter((assignment) => assignment.assigned)
    .map((assignment) => {
      const doctorBranchId = assignmentIdByBranch.get(assignment.branchId);

      if (!doctorBranchId) {
        throw new Error(
          "Could not find the saved assignment for a service branch.",
        );
      }

      return {
        doctor_branch_id: doctorBranchId,
        service_id: assignment.serviceId,
        price_override:
          assignment.priceOverride.trim() === ""
            ? null
            : Number(assignment.priceOverride),
        duration_override:
          assignment.durationOverride.trim() === ""
            ? null
            : Number(assignment.durationOverride),
      };
    });

  if (servicesToInsert.length > 0) {
    const { error: insertServicesError } = await supabase
      .from("doctor_branch_services")
      .insert(servicesToInsert);

    if (insertServicesError) {
      throw new Error(
        `Failed to save service assignments: ${insertServicesError.message}`,
      );
    }
  }

  revalidatePath("/doctors");
  revalidatePath(`/doctors/${doctorId}/edit`);

  return { success: true };
}
