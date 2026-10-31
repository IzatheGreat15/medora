
"use server";

import { getCurrentStaff } from "@/lib/auth/get-current-staff";
import { createRecord } from "@/lib/db/audited-mutations";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export type BranchStatus = "Active" | "Inactive";

export type Branch = {
  id: string;
  clinic_id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string | null;
  status: BranchStatus;
  opening_hours: Record<
    string,
    { open: boolean; start: string; end: string }
  >;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  doctors: number;
};

type BranchInput = {
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  status?: BranchStatus;
  openingHours?: Record<
    string,
    { open: boolean; start: string; end: string }
  >;
};

async function requireClinicStaff() {
  const { user, staff } = await getCurrentStaff();

  if (
    !user ||
    staff.role !== "clinic_user" ||
    !staff.clinic_id ||
    !["owner", "manager", "staff"].includes(staff.clinic_role)
  ) {
    throw new Error("You are not authorized to manage branches.");
  }

  return staff;
}

export async function getBranches(): Promise<Branch[]> {
  const staff = await requireClinicStaff();
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("branches")
    .select(
      "id, clinic_id, name, code, address, phone, email, status, opening_hours, created_at, updated_at, created_by, updated_by"
    )
    .eq("clinic_id", staff.clinic_id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load branches:", error.message);
    throw new Error("Unable to load branches.");
  }

  return (data ?? []).map((branch) => ({
    ...branch,
    opening_hours: branch.opening_hours ?? {},
    doctors: 0,
  })) as Branch[];
}

export async function createBranch(input: BranchInput) {
  const staff = await requireClinicStaff();

  // Only allow the fields supported by the form.
  const name = input.name.trim();
  const code = input.code.trim();
  const address = input.address.trim();
  const phone = input.phone.trim();
  const email = input.email.trim();

  if (!name || !code || !address || !phone) {
    throw new Error("Please complete all required branch fields.");
  }

  if (name.length > 150 || code.length > 50) {
    throw new Error("The branch name or code is too long.");
  }

  if (!["Active", "Inactive"].includes(input.status ?? "Active")) {
    throw new Error("Invalid branch status.");
  }

  const supabase = createSupabaseAdmin();

  // Ensure the branch code is unique within this clinic.
  const { data: existingBranch, error: lookupError } = await supabase
    .from("branches")
    .select("id")
    .eq("clinic_id", staff.clinic_id)
    .eq("code", code)
    .maybeSingle();

  if (lookupError) {
    console.error("Failed to check branch code:", lookupError.message);
    throw new Error("Unable to validate the branch code.");
  }

  if (existingBranch) {
    throw new Error("This branch code is already in use.");
  }

  const branch = await createRecord({
    table: "branches",
    values: {
      clinic_id: staff.clinic_id,
      name,
      code,
      address,
      phone,
      email: email || null,
      status: input.status ?? "Active",
      ...(input.openingHours
        ? { opening_hours: input.openingHours }
        : {}),
    },
  });

  return { success: true, branch };
}


export async function getBranchById(branchId: string): Promise<Branch> {
  const staff = await requireClinicStaff();

  if (!branchId || typeof branchId !== "string") {
    throw new Error("Invalid branch ID.");
  }

  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("branches")
    .select(
      "id, clinic_id, name, code, address, phone, email, status, opening_hours, created_at, updated_at, created_by, updated_by"
    )
    .eq("id", branchId)
    .eq("clinic_id", staff.clinic_id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load branch:", error.message);
    throw new Error("Unable to load branch details.");
  }

  if (!data) {
    throw new Error("Branch not found or you are not authorized to access it.");
  }

  return {
    ...data,
    opening_hours: data.opening_hours ?? {},
    doctors: 0,
  } as Branch;
}

export async function updateBranch(
  branchId: string,
  input: BranchInput
): Promise<{ success: true }> {
  const staff = await requireClinicStaff();

  if (!branchId || typeof branchId !== "string") {
    throw new Error("Invalid branch ID.");
  }

  const name = input.name.trim();
  const address = input.address.trim();
  const phone = input.phone.trim();
  const email = input.email.trim();

  if (!name || !address || !phone) {
    throw new Error("Please complete all required branch fields.");
  }

  if (name.length > 150) {
    throw new Error("The branch name is too long.");
  }

  if (!["Active", "Inactive"].includes(input.status ?? "Active")) {
    throw new Error("Invalid branch status.");
  }

  const supabase = createSupabaseAdmin();

  const { data: existingBranch, error: lookupError } = await supabase
    .from("branches")
    .select("id")
    .eq("id", branchId)
    .eq("clinic_id", staff.clinic_id)
    .maybeSingle();

  if (lookupError) {
    console.error("Failed to find branch:", lookupError.message);
    throw new Error("Unable to validate the branch.");
  }

  if (!existingBranch) {
    throw new Error("Branch not found or you are not authorized to edit it.");
  }

  const { error } = await supabase
    .from("branches")
    .update({
      name,
      address,
      phone,
      email: email || null,
      status: input.status ?? "Active",
      ...(input.openingHours
        ? { opening_hours: input.openingHours }
        : {}),
      updated_by: staff.id,
    })
    .eq("id", branchId)
    .eq("clinic_id", staff.clinic_id);

  if (error) {
    console.error("Failed to update branch:", error.message);
    throw new Error(
      error.code === "23505"
        ? "A branch with these details already exists."
        : "Unable to save branch changes."
    );
  }

  return { success: true };
}

export async function deleteBranch(branchId: string) {
  const staff = await requireClinicStaff();

  if (!branchId || typeof branchId !== "string") {
    throw new Error("Invalid branch ID.");
  }

  const supabase = createSupabaseAdmin();

  // Clinic scoping prevents deleting another clinic's branch.
  const { data: branch, error: lookupError } = await supabase
    .from("branches")
    .select("id")
    .eq("id", branchId)
    .eq("clinic_id", staff.clinic_id)
    .maybeSingle();

  if (lookupError) {
    console.error("Failed to find branch:", lookupError.message);
    throw new Error("Unable to find the branch.");
  }

  if (!branch) {
    throw new Error("Branch not found or you are not authorized to delete it.");
  }

  const { error } = await supabase
    .from("branches")
    .delete()
    .eq("id", branchId)
    .eq("clinic_id", staff.clinic_id);

  if (error) {
    console.error("Failed to delete branch:", error.message);
    throw new Error(
      "Unable to delete this branch. Check whether it has related records."
    );
  }

  return { success: true };
}
