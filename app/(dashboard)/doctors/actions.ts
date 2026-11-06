
"use server";

import "server-only";

import { requireClinicUser } from "@/lib/auth/require-clinic-user";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { getClinicContext } from "../bookings/actions";

export type DoctorStatus = "Active" | "Inactive";

export type DoctorTableItem = {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  status: DoctorStatus;
  branches: string[];
};

export type DoctorBranchOption = {
  id: string;
  name: string;
};

export type CreateDoctorInput = {
  name: string;
  specialty: string;
  email: string;
  phone: string;
  status: DoctorStatus;
  branchIds: string[];
};

export type DoctorScheduleItem = {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  branchId: string;
  branchName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};


export async function getDoctors(): Promise<DoctorTableItem[]> {
  const { clinicId } = await requireClinicUser();
  const supabase = createSupabaseAdmin();

  const { data: doctorRows, error: doctorsError } = await supabase
    .from("doctors")
    .select("id, name, specialty, email, phone, status")
    .eq("clinic_id", clinicId)
    .order("name");

  if (doctorsError) {
    console.error("Failed to fetch doctors:", doctorsError.message);
    throw new Error("Unable to load doctors.");
  }

  if (!doctorRows?.length) return [];

  const doctorIds = doctorRows.map((doctor) => doctor.id);

  const { data: assignments, error: assignmentsError } = await supabase
    .from("doctor_branches")
    .select("doctor_id, branch_id")
    .eq("clinic_id", clinicId)
    .in("doctor_id", doctorIds);

  if (assignmentsError) {
    console.error("Failed to fetch doctor branches:", assignmentsError.message);
    throw new Error("Unable to load doctor branch assignments.");
  }

  const branchIds = [...new Set((assignments ?? []).map((item) => item.branch_id))];

  let branchNames = new Map<string, string>();

  if (branchIds.length) {
    const { data: branchRows, error: branchesError } = await supabase
      .from("branches")
      .select("id, name")
      .eq("clinic_id", clinicId)
      .in("id", branchIds);

    if (branchesError) {
      console.error("Failed to fetch branches:", branchesError.message);
      throw new Error("Unable to load branch names.");
    }

    branchNames = new Map(
      (branchRows ?? []).map((branch) => [branch.id, branch.name]),
    );
  }

  const branchesByDoctor = new Map<string, string[]>();

  for (const assignment of assignments ?? []) {
    const branchName = branchNames.get(assignment.branch_id);
    if (!branchName) continue;

    const current = branchesByDoctor.get(assignment.doctor_id) ?? [];
    current.push(branchName);
    branchesByDoctor.set(assignment.doctor_id, current);
  }

  return doctorRows.map((doctor) => ({
    id: doctor.id,
    name: doctor.name,
    specialty: doctor.specialty,
    email: doctor.email,
    phone: doctor.phone ?? "",
    status: doctor.status as DoctorStatus,
    branches: branchesByDoctor.get(doctor.id) ?? [],
  }));
}

export async function getDoctorBranchOptions(): Promise<DoctorBranchOption[]> {
  const { clinicId } = await requireClinicUser();
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("branches")
    .select("id, name")
    .eq("clinic_id", clinicId)
    .eq("status", "Active")
    .order("name");

  if (error) {
    console.error("Failed to fetch branches:", error.message);
    throw new Error("Unable to load branches.");
  }

  return data ?? [];
}

export async function createDoctor(input: CreateDoctorInput) {
  const { clinicId, staff } = await requireClinicUser();
  const supabase = createSupabaseAdmin();

  const name = input.name.trim();
  const specialty = input.specialty.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();

  if (!name || !specialty || !email || !phone) {
    throw new Error("Please complete all required fields.");
  }

  const branchIds = [...new Set(input.branchIds)];

  // Verify that every selected branch belongs to this clinic.
  if (branchIds.length) {
    const { data: branches, error: branchError } = await supabase
      .from("branches")
      .select("id")
      .eq("clinic_id", clinicId)
      .in("id", branchIds);

    if (branchError) {
      console.error("Failed to validate branches:", branchError.message);
      throw new Error("Unable to validate the selected branches.");
    }

    if ((branches?.length ?? 0) !== branchIds.length) {
      throw new Error("One or more selected branches are invalid.");
    }
  }

  const { data: doctor, error: doctorError } = await supabase
    .from("doctors")
    .insert({
      clinic_id: clinicId,
      name,
      specialty,
      email,
      phone,
      status: input.status,
      created_by: staff.id,
      updated_by: staff.id,
    })
    .select("id")
    .single();

  if (doctorError || !doctor) {
    console.error("Failed to create doctor:", doctorError?.message);
    throw new Error("Unable to create the doctor.");
  }

  if (branchIds.length) {
    const { error: assignmentError } = await supabase
      .from("doctor_branches")
      .insert(
        branchIds.map((branchId) => ({
          clinic_id: clinicId,
          doctor_id: doctor.id,
          branch_id: branchId,
        })),
      );

    if (assignmentError) {
      // Remove the newly created profile if its assignments could not be saved.
      const { error: rollbackError } = await supabase
        .from("doctors")
        .delete()
        .eq("id", doctor.id)
        .eq("clinic_id", clinicId);

      console.error("Failed to create doctor assignments:", assignmentError.message);

      if (rollbackError) {
        console.error("Doctor cleanup failed:", rollbackError.message);
      }

      throw new Error("The doctor could not be assigned to the selected branches.");
    }
  }

  return { success: true };
}

export async function deleteDoctor(doctorId: string) {
  const { clinicId } = await requireClinicUser();
  const supabase = createSupabaseAdmin();

  // Verify ownership before removing any records.
  const { data: doctor, error: doctorError } = await supabase
    .from("doctors")
    .select("id")
    .eq("id", doctorId)
    .eq("clinic_id", clinicId)
    .maybeSingle();

  if (doctorError) {
    console.error("Failed to verify doctor:", doctorError.message);
    throw new Error("Unable to verify this doctor.");
  }

  if (!doctor) {
    throw new Error("Doctor not found.");
  }

  const { data: assignments, error: assignmentsError } = await supabase
    .from("doctor_branches")
    .select("id")
    .eq("clinic_id", clinicId)
    .eq("doctor_id", doctorId);

  if (assignmentsError) {
    console.error("Failed to load doctor assignments:", assignmentsError.message);
    throw new Error("Unable to delete this doctor.");
  }

  const assignmentIds = (assignments ?? []).map((item) => item.id);

  if (assignmentIds.length) {
    const { error: hoursError } = await supabase
      .from("doctor_working_hours")
      .delete()
      .in("doctor_branch_id", assignmentIds);

    if (hoursError) {
      console.error("Failed to delete working hours:", hoursError.message);
      throw new Error("Unable to delete the doctor's working hours.");
    }

    const { error: servicesError } = await supabase
      .from("doctor_branch_services")
      .delete()
      .in("doctor_branch_id", assignmentIds);

    if (servicesError) {
      console.error("Failed to delete doctor services:", servicesError.message);
      throw new Error("Unable to delete the doctor's service assignments.");
    }

    const { error: assignmentsDeleteError } = await supabase
      .from("doctor_branches")
      .delete()
      .eq("clinic_id", clinicId)
      .eq("doctor_id", doctorId);

    if (assignmentsDeleteError) {
      console.error("Failed to delete doctor branches:", assignmentsDeleteError.message);
      throw new Error("Unable to delete the doctor's branch assignments.");
    }
  }

  const { error: deleteError } = await supabase
    .from("doctors")
    .delete()
    .eq("id", doctorId)
    .eq("clinic_id", clinicId);

  if (deleteError) {
    console.error("Failed to delete doctor:", deleteError.message);
    throw new Error("Unable to delete this doctor.");
  }

  return { success: true };
}

export async function getDoctorLimit(): Promise<number> {
  const { supabase, clinicId } = await getClinicContext();

  const { data: clinic, error: clinicError } = await supabase
    .from("clinics")
    .select("subscription_plan_id")
    .eq("id", clinicId)
    .single();

  if (clinicError) throw new Error(clinicError.message);

  if (!clinic.subscription_plan_id) return 0;

  const { data: plan, error: planError } = await supabase
    .from("subscription_plans")
    .select("max_doctors")
    .eq("id", clinic.subscription_plan_id)
    .single();

  if (planError) throw new Error(planError.message);

  return plan.max_doctors ?? 0;
}

export async function getDoctorSchedules(): Promise<DoctorScheduleItem[]> {
  const { clinicId } = await requireClinicUser();
  const supabase = createSupabaseAdmin();

  const { data: assignments, error: assignmentsError } = await supabase
    .from("doctor_branches")
    .select("id, doctor_id, branch_id")
    .eq("clinic_id", clinicId);

  if (assignmentsError) {
    console.error("Failed to fetch doctor schedule assignments:", assignmentsError.message);
    throw new Error("Unable to load doctor schedules.");
  }

  if (!assignments?.length) return [];

  const assignmentIds = assignments.map((item) => item.id);
  const doctorIds = [...new Set(assignments.map((item) => item.doctor_id))];
  const branchIds = [...new Set(assignments.map((item) => item.branch_id))];

  const [hoursResult, doctorsResult, branchesResult] = await Promise.all([
    supabase
      .from("doctor_working_hours")
      .select("id, doctor_branch_id, day_of_week, start_time, end_time")
      .in("doctor_branch_id", assignmentIds),
    supabase
      .from("doctors")
      .select("id, name, specialty")
      .eq("clinic_id", clinicId)
      .in("id", doctorIds),
    supabase
      .from("branches")
      .select("id, name")
      .eq("clinic_id", clinicId)
      .in("id", branchIds),
  ]);

  if (hoursResult.error) {
    console.error("Failed to fetch doctor working hours:", hoursResult.error.message);
    throw new Error("Unable to load doctor working hours.");
  }
  if (doctorsResult.error) {
    console.error("Failed to fetch schedule doctors:", doctorsResult.error.message);
    throw new Error("Unable to load doctors for the schedule.");
  }
  if (branchesResult.error) {
    console.error("Failed to fetch schedule branches:", branchesResult.error.message);
    throw new Error("Unable to load branches for the schedule.");
  }

  const assignmentById = new Map(assignments.map((item) => [item.id, item]));
  const doctorById = new Map((doctorsResult.data ?? []).map((item) => [item.id, item]));
  const branchById = new Map((branchesResult.data ?? []).map((item) => [item.id, item]));

  return (hoursResult.data ?? []).flatMap((hours) => {
    const assignment = assignmentById.get(hours.doctor_branch_id);
    if (!assignment) return [];

    const doctor = doctorById.get(assignment.doctor_id);
    const branch = branchById.get(assignment.branch_id);
    if (!doctor || !branch) return [];

    return [{
      id: hours.id,
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialty ?? "",
      branchId: branch.id,
      branchName: branch.name,
      dayOfWeek: Number(hours.day_of_week),
      startTime: hours.start_time,
      endTime: hours.end_time,
    }];
  }).sort((a, b) =>
    a.dayOfWeek - b.dayOfWeek ||
    a.startTime.localeCompare(b.startTime) ||
    a.doctorName.localeCompare(b.doctorName)
  );
}