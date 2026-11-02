
"use server";

import { createClient } from "@supabase/supabase-js";
import { getCurrentStaff } from "@/lib/auth/get-current-staff";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

type StaffStatus = "Active" | "Inactive";

export type ClinicStaffMember = {
    id: string;
    first_name: string;
    last_name: string;
    name: string;
    email: string;
    status: StaffStatus;
    clinic_role: "owner" | "manager" | "staff";
};

export type ClinicSubscription = {
  clinic_name: string;
  clinic_status: string;
  trial_ends_at: string | null;
  plan: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    billing_interval: string;
    features: unknown;
    max_doctors: number;
    max_branches: number;
    is_active: boolean;
  } | null;
};

async function getClinicContext() {
    const { staff } = await getCurrentStaff();

    if (staff.role !== "clinic_user" || !staff.clinic_id) {
        throw new Error("You are not authorized to manage clinic staff.");
    }

    return {
        admin: createSupabaseAdmin(),
        clinicId: staff.clinic_id,
        currentUserId: staff.id,
    };
}

function getFullName(firstName: string, lastName: string) {
    return `${firstName} ${lastName}`.trim();
}

function splitName(name: string) {
    const parts = name.trim().split(/\s+/);
    const firstName = parts.shift() ?? "";
    const lastName = parts.join(" ");

    return { firstName, lastName };
}

function isUserBanned(bannedUntil?: string | null) {
    if (!bannedUntil) return false;

    return new Date(bannedUntil).getTime() > Date.now();
}

/**
 * READ
 */
export async function getClinicStaff(): Promise<ClinicStaffMember[]> {
    const { admin, clinicId } = await getClinicContext();

    const { data: staffMembers, error } = await admin
        .from("staff")
        .select("id, first_name, last_name, clinic_role")
        .eq("clinic_id", clinicId)
        .eq("role", "clinic_user")
        .order("first_name", { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    const results: ClinicStaffMember[] = [];

    for (const member of staffMembers ?? []) {
        const { data, error: authError } =
            await admin.auth.admin.getUserById(member.id);

        if (authError || !data.user) {
            continue;
        }

        const user = data.user;
        const firstName = member.first_name ?? "";
        const lastName = member.last_name ?? "";

        results.push({
            id: member.id,
            first_name: firstName,
            last_name: lastName,
            name: getFullName(firstName, lastName),
            email: user.email ?? "",
            status: isUserBanned(user.banned_until)
                ? "Inactive"
                : "Active",
            clinic_role: member.clinic_role,
        });
    }

    return results;
}

/**
 * CREATE
 */
export async function createClinicStaff(input: {
    name: string;
    email: string;
}) {
    const { admin, clinicId, currentUserId } =
        await getClinicContext();

    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();

    if (!name || !email) {
        throw new Error("Name and email are required.");
    }

    const { firstName, lastName } = splitName(name);

    if (!firstName) {
        throw new Error("Please enter a valid name.");
    }

    const temporaryPassword = `${crypto.randomUUID()}-Aa1!`;

    const { data: createdUser, error: createUserError } =
        await admin.auth.admin.createUser({
            email,
            password: temporaryPassword,
            email_confirm: true,
            user_metadata: {
                first_name: firstName,
                last_name: lastName,
                clinic_id: clinicId,
            },
        });

    if (createUserError || !createdUser.user) {
        throw new Error(
            createUserError?.message ??
                "Failed to create the staff account.",
        );
    }

    const userId = createdUser.user.id;

    const { error: staffError } = await admin.from("staff").insert({
        id: userId,
        clinic_id: clinicId,
        first_name: firstName,
        last_name: lastName,
        role: "clinic_user",
        clinic_role: "staff",
        id_user_created: currentUserId,
        id_user_last_modified: currentUserId,
    });

    if (staffError) {
        await admin.auth.admin.deleteUser(userId);
        throw new Error(staffError.message);
    }

    try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL;

        if (!appUrl) {
            throw new Error("NEXT_PUBLIC_APP_URL is not configured.");
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            },
        );

        const { error: resetEmailError } =
            await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${appUrl}/set-password`,
            });

        if (resetEmailError) {
            return {
                success: true,
                warning: `The staff account was created, but the password setup email could not be sent: ${resetEmailError.message}`,
            };
        }
    } catch (error) {
        return {
            success: true,
            warning:
                error instanceof Error
                    ? `The staff account was created, but the invitation email failed: ${error.message}`
                    : "The staff account was created, but the invitation email failed.",
        };
    }

    return {
        success: true,
        message: `An account was created and a password setup email was sent to ${email}.`,
    };
}

/**
 * UPDATE
 */
export async function updateClinicStaff(input: {
    id: string;
    name: string;
    email: string;
}) {
    const { admin, clinicId, currentUserId } =
        await getClinicContext();

    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();

    if (!input.id || !name || !email) {
        throw new Error("Staff ID, name, and email are required.");
    }

    const { firstName, lastName } = splitName(name);

    const { data: member, error: memberError } = await admin
        .from("staff")
        .select("id, clinic_role")
        .eq("id", input.id)
        .eq("clinic_id", clinicId)
        .maybeSingle();

    if (memberError || !member) {
        throw new Error("Staff member not found.");
    }

    if (member.clinic_role === "owner") {
        throw new Error("The clinic owner's account cannot be edited here.");
    }

    const { data: existingAuth, error: existingAuthError } =
        await admin.auth.admin.getUserById(input.id);

    if (existingAuthError || !existingAuth.user) {
        throw new Error("Unable to find the staff authentication account.");
    }

    const previousEmail = existingAuth.user.email;

    const { error: authError } =
        await admin.auth.admin.updateUserById(input.id, {
            email,
            email_confirm: true,
            user_metadata: {
                ...existingAuth.user.user_metadata,
                first_name: firstName,
                last_name: lastName,
            },
        });

    if (authError) {
        throw new Error(authError.message);
    }

    const { error: staffError } = await admin
        .from("staff")
        .update({
            first_name: firstName,
            last_name: lastName,
            id_user_last_modified: currentUserId,
        })
        .eq("id", input.id)
        .eq("clinic_id", clinicId);

    if (staffError) {
        // Attempt to restore the previous Auth details if the
        // staff record update fails.
        await admin.auth.admin.updateUserById(input.id, {
            email: previousEmail,
            email_confirm: true,
            user_metadata: existingAuth.user.user_metadata,
        });

        throw new Error(staffError.message);
    }

    return {
        success: true,
        message: `${name}'s details were updated successfully.`,
    };
}

/**
 * ACTIVATE / DEACTIVATE
 */
export async function updateClinicStaffStatus(input: {
    id: string;
    status: StaffStatus;
}) {
    const { admin, clinicId, currentUserId } =
        await getClinicContext();

    if (!input.id) {
        throw new Error("Staff ID is required.");
    }

    const { data: member, error: memberError } = await admin
        .from("staff")
        .select("id, clinic_role")
        .eq("id", input.id)
        .eq("clinic_id", clinicId)
        .maybeSingle();

    if (memberError || !member) {
        throw new Error("Staff member not found.");
    }

    if (member.clinic_role === "owner") {
        throw new Error("The clinic owner's account cannot be deactivated.");
    }

    if (input.id === currentUserId) {
        throw new Error("You cannot deactivate your own account.");
    }

    const { error: authError } =
        await admin.auth.admin.updateUserById(input.id, {
            ban_duration:
                input.status === "Inactive" ? "876000h" : "none",
        });

    if (authError) {
        throw new Error(authError.message);
    }

    const { error: staffError } = await admin
        .from("staff")
        .update({
            id_user_last_modified: currentUserId,
        })
        .eq("id", input.id)
        .eq("clinic_id", clinicId);

    if (staffError) {
        throw new Error(staffError.message);
    }

    return {
        success: true,
        message: `Staff member was ${input.status.toLowerCase()}.`,
    };
}

/**
 * DELETE
 */
export async function deleteClinicStaff(id: string) {
    const { admin, clinicId, currentUserId } =
        await getClinicContext();

    if (!id) {
        throw new Error("Staff ID is required.");
    }

    const { data: member, error: memberError } = await admin
        .from("staff")
        .select("id, clinic_role")
        .eq("id", id)
        .eq("clinic_id", clinicId)
        .maybeSingle();

    if (memberError || !member) {
        throw new Error("Staff member not found.");
    }

    if (member.clinic_role === "owner") {
        throw new Error("The clinic owner's account cannot be deleted.");
    }

    if (id === currentUserId) {
        throw new Error("You cannot delete your own account.");
    }

    // Delete the Auth account. If staff.id references auth.users.id
    // with ON DELETE CASCADE, the staff record is removed automatically.
    const { error: deleteError } =
        await admin.auth.admin.deleteUser(id);

    if (deleteError) {
        throw new Error(deleteError.message);
    }

    return {
        success: true,
        message: "Staff member was deleted successfully.",
    };
}

export async function getClinicSubscription(): Promise<ClinicSubscription> {
  const { admin, clinicId } = await getClinicContext();

  // 1. Get the clinic and its assigned subscription plan ID
  const { data: clinic, error: clinicError } = await admin
    .from("clinics")
    .select("name, status, trial_ends_at, subscription_plan_id")
    .eq("id", clinicId)
    .single();

  if (clinicError) {
    throw new Error(clinicError.message);
  }

  if (!clinic) {
    throw new Error("Clinic not found.");
  }

  // 2. If no plan is assigned, return the clinic without a plan
  if (!clinic.subscription_plan_id) {
    return {
      clinic_name: clinic.name,
      clinic_status: clinic.status,
      trial_ends_at: clinic.trial_ends_at,
      plan: null,
    };
  }

  // 3. Fetch the assigned subscription plan
  const { data: plan, error: planError } = await admin
    .from("subscription_plans")
    .select(`
      id,
      name,
      description,
      price,
      billing_interval,
      features,
      max_doctors,
      max_branches,
      is_active
    `)
    .eq("id", clinic.subscription_plan_id)
    .single();

  if (planError) {
    throw new Error(planError.message);
  }

  // 4. Return the clinic and its subscription plan
  return {
    clinic_name: clinic.name,
    clinic_status: clinic.status,
    trial_ends_at: clinic.trial_ends_at,
    plan,
  };
}
