
"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { getCurrentStaff } from "@/lib/auth/get-current-staff";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export type ServiceStatus = "Active" | "Inactive";

export type Service = {
  id: string;
  clinic_id: string;
  name: string;
  duration: number;
  rate: number;
  status: ServiceStatus;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type ServiceInput = {
  name: string;
  duration: number;
  rate: number;
};

async function requireClinicStaff() {
  const { user, staff } = await getCurrentStaff();

  if (
    !user ||
    staff.role !== "clinic_user" ||
    !staff.clinic_id ||
    !["owner", "manager", "staff"].includes(
      staff.clinic_role ?? ""
    )
  ) {
    throw new Error("You are not authorized to manage services.");
  }

  return { user, staff };
}

function validateServiceInput(input: ServiceInput) {
  if (!input || typeof input.name !== "string") {
    throw new Error("Invalid service details.");
  }

  const name = input.name.trim();

  if (!name) {
    throw new Error("Please enter a service name.");
  }

  if (name.length > 100) {
    throw new Error("The service name cannot exceed 100 characters.");
  }

  if (
    !Number.isInteger(input.duration) ||
    input.duration < 1 ||
    input.duration > 1440
  ) {
    throw new Error("Duration must be between 1 and 1440 minutes.");
  }

  if (
    typeof input.rate !== "number" ||
    !Number.isFinite(input.rate) ||
    input.rate < 0 ||
    input.rate > 99999999.99
  ) {
    throw new Error("Please enter a valid, non-negative service rate.");
  }

  return { name, duration: input.duration, rate: input.rate };
}

function handleDatabaseError(error: { code?: string; message: string }) {
  console.error("Service database operation failed:", error);

  if (error.code === "23505") {
    throw new Error("A service with this name already exists.");
  }

  throw new Error("Something went wrong while saving services. Please try again.");
}

export async function getServices(): Promise<Service[]> {
  const { staff } = await requireClinicStaff();
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("services")
    .select(
      "id, clinic_id, name, duration, rate, status, created_at, updated_at, created_by, updated_by"
    )
    .eq("clinic_id", staff.clinic_id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load services:", error);
    throw new Error("Unable to load services.");
  }

  return (data ?? []).map((service) => ({
    ...service,
    duration: Number(service.duration),
    rate: Number(service.rate),
  })) as Service[];
}

export async function createService(
  input: ServiceInput
): Promise<Service> {
  const { staff } = await requireClinicStaff();
  const values = validateServiceInput(input);
  const supabase = createSupabaseAdmin();

  const { data: existing, error: lookupError } = await supabase
    .from("services")
    .select("id")
    .eq("clinic_id", staff.clinic_id)
    .ilike("name", values.name)
    .limit(1);

  if (lookupError) {
    console.error("Failed to check duplicate service:", lookupError);
    throw new Error("Unable to validate the service name.");
  }

  if (existing?.length) {
    throw new Error("A service with this name already exists.");
  }

  const { data, error } = await supabase
    .from("services")
    .insert({
      clinic_id: staff.clinic_id,
      ...values,
      status: "Active",
      created_by: staff.id,
      updated_by: staff.id,
    })
    .select(
      "id, clinic_id, name, duration, rate, status, created_at, updated_at, created_by, updated_by"
    )
    .single();

  if (error) handleDatabaseError(error);

  revalidatePath("/services");

  return {
    ...data!,
    duration: Number(data!.duration),
    rate: Number(data!.rate),
  } as Service;
}

export async function updateService(
  serviceId: string,
  input: ServiceInput
): Promise<Service> {
  const { staff } = await requireClinicStaff();

  if (!serviceId || typeof serviceId !== "string") {
    throw new Error("Invalid service ID.");
  }

  const values = validateServiceInput(input);
  const supabase = createSupabaseAdmin();

  const { data: existing, error: lookupError } = await supabase
    .from("services")
    .select("id")
    .eq("id", serviceId)
    .eq("clinic_id", staff.clinic_id)
    .maybeSingle();

  if (lookupError) {
    console.error("Failed to find service:", lookupError);
    throw new Error("Unable to validate the service.");
  }

  if (!existing) {
    throw new Error("Service not found or you are not authorized to edit it.");
  }

  const { data: duplicate, error: duplicateError } = await supabase
    .from("services")
    .select("id")
    .eq("clinic_id", staff.clinic_id)
    .ilike("name", values.name)
    .neq("id", serviceId)
    .limit(1);

  if (duplicateError) {
    console.error("Failed to check duplicate service:", duplicateError);
    throw new Error("Unable to validate the service name.");
  }

  if (duplicate?.length) {
    throw new Error("A service with this name already exists.");
  }

  const { data, error } = await supabase
    .from("services")
    .update({
      ...values,
      updated_by: staff.id,
    })
    .eq("id", serviceId)
    .eq("clinic_id", staff.clinic_id)
    .select(
      "id, clinic_id, name, duration, rate, status, created_at, updated_at, created_by, updated_by"
    )
    .single();

  if (error) handleDatabaseError(error);

  revalidatePath("/services");

  return {
    ...data!,
    duration: Number(data!.duration),
    rate: Number(data!.rate),
  } as Service;
}

export async function setServiceStatus(
  serviceId: string,
  status: ServiceStatus
): Promise<void> {
  const { staff } = await requireClinicStaff();

  if (!serviceId || typeof serviceId !== "string") {
    throw new Error("Invalid service ID.");
  }

  if (status !== "Active" && status !== "Inactive") {
    throw new Error("Invalid service status.");
  }

  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("services")
    .update({
      status,
      updated_by: staff.id,
    })
    .eq("id", serviceId)
    .eq("clinic_id", staff.clinic_id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Failed to update service status:", error);
    throw new Error("Unable to update service status.");
  }

  if (!data) {
    throw new Error("Service not found or you are not authorized to update it.");
  }

  revalidatePath("/services");
}

export async function deleteService(serviceId: string): Promise<void> {
  const { staff } = await requireClinicStaff();

  if (!serviceId || typeof serviceId !== "string") {
    throw new Error("Invalid service ID.");
  }

  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("services")
    .delete()
    .eq("id", serviceId)
    .eq("clinic_id", staff.clinic_id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Failed to delete service:", error);
    throw new Error(
      "Unable to delete this service. It may be referenced by existing records."
    );
  }

  if (!data) {
    throw new Error("Service not found or you are not authorized to delete it.");
  }

  revalidatePath("/services");
}
