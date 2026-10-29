
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { requirePlatformAdmin } from "@/lib/auth/require-platform-admin";

const statusMap: Record<string, string> = {
    Trial: "trial",
    Active: "active",
    Inactive: "inactive",
    "Past due": "past_due",
};

const reverseStatusMap: Record<string, string> = {
    trial: "Trial",
    active: "Active",
    inactive: "Inactive",
    past_due: "Past due",
};

function errorResponse(message: string, status = 400) {
    return NextResponse.json({ error: message }, { status });
}

function normalizeStatus(status: unknown) {
    if (typeof status !== "string") return null;

    if (statusMap[status]) return statusMap[status];

    if (reverseStatusMap[status]) return status;

    return null;
}

async function getOwnerEmails(
    admin: ReturnType<typeof createSupabaseAdmin>,
    staffIds: string[],
) {
    const result = new Map<string, string>();

    for (const id of staffIds) {
        const { data, error } = await admin.auth.admin.getUserById(id);

        if (!error && data.user?.email) {
            result.set(id, data.user.email);
        }
    }

    return result;
}

// GET /api/admin/clinics
export async function GET() {
    try {
        await requirePlatformAdmin();

        const admin = createSupabaseAdmin();

        const [
            { data: clinics, error: clinicsError },
            { data: plans, error: plansError },
            { data: staff, error: staffError },
        ] = await Promise.all([
            admin
                .from("clinics")
                .select("*")
                .order("created_at", { ascending: false }),

            admin
                .from("subscription_plans")
                .select(
                    "id, name, price, max_doctors, max_branches, is_active",
                )
                .order("price", { ascending: true }),

            admin
                .from("staff")
                .select("id, clinic_id, first_name, last_name, clinic_role")
                .eq("role", "clinic_user")
                .eq("clinic_role", "owner"),
        ]);

        if (clinicsError) throw clinicsError;
        if (plansError) throw plansError;
        if (staffError) throw staffError;

        const ownerStaff = staff ?? [];
        const ownerEmails = await getOwnerEmails(
            admin,
            ownerStaff.map((person) => person.id),
        );

        const result = (clinics ?? []).map((clinic) => {
            const owner = ownerStaff.find(
                (person) => person.clinic_id === clinic.id,
            );

            return {
                id: clinic.id,
                name: clinic.name,
                email: clinic.contact_email,
                phone: clinic.phone ?? "",
                planId: clinic.subscription_plan_id ?? "",
                status: reverseStatusMap[clinic.status] ?? "Inactive",
                trialEndsAt: clinic.trial_ends_at
                    ? String(clinic.trial_ends_at).slice(0, 10)
                    : "",
                doctorCount: 0,
                branchCount: 0,
                administrator: {
                    firstName: owner?.first_name ?? "",
                    lastName: owner?.last_name ?? "",
                    email: owner
                        ? ownerEmails.get(owner.id) ?? ""
                        : "",
                },
                invitationPending: false,
            };
        });

        return NextResponse.json({
            clinics: result,
            plans: (plans ?? []).map((plan) => ({
                id: plan.id,
                name: plan.name,
                price: Number(plan.price),
                maxDoctors: plan.max_doctors,
                maxBranches: plan.max_branches,
                isActive: plan.is_active,
            })),
        });
    } catch (error) {
        console.error("GET clinics error:", error);

        return NextResponse.json(
            { error: "Failed to load clinics." },
            { status: 500 },
        );
    }
}

// POST /api/admin/clinics
export async function POST(request: NextRequest) {
    let clinicId: string | null = null;
    let invitedUserId: string | null = null;

    try {
        const { user, staff: platformAdmin } = await requirePlatformAdmin();
        const admin = createSupabaseAdmin();
        const body = await request.json();

        const name = String(body.name ?? "").trim();
        const contactEmail = String(body.email ?? "").trim().toLowerCase();
        const phone = String(body.phone ?? "").trim();
        const planId = String(body.planId ?? "");
        const status = normalizeStatus(body.status);
        const trialEndsAt = body.trialEndsAt
            ? String(body.trialEndsAt)
            : null;
        const firstName = String(body.adminFirstName ?? "").trim();
        const lastName = String(body.adminLastName ?? "").trim();
        const ownerEmail = String(body.adminEmail ?? "").trim().toLowerCase();
        const sendInvitation = body.sendInvitation !== false;

        if (!name || !contactEmail || !planId || !status) {
            return errorResponse(
                "Clinic name, contact email, plan, and status are required.",
            );
        }

        if (status === "trial" && !trialEndsAt) {
            return errorResponse("A trial end date is required.");
        }

        if (!firstName || !lastName || !ownerEmail) {
            return errorResponse(
                "Administrator name and email are required.",
            );
        }

        const { data: plan, error: planError } = await admin
            .from("subscription_plans")
            .select("id, is_active")
            .eq("id", planId)
            .maybeSingle();

        if (planError) throw planError;

        if (!plan || !plan.is_active) {
            return errorResponse(
                "Please select an active subscription plan.",
            );
        }

        const { data: existingClinic, error: duplicateClinicError } =
            await admin
                .from("clinics")
                .select("id")
                .ilike("contact_email", contactEmail)
                .limit(1)
                .maybeSingle();

        if (duplicateClinicError) throw duplicateClinicError;

        if (existingClinic) {
            return errorResponse(
                "A clinic with this contact email already exists.",
                409,
            );
        }

        const { data: clinic, error: clinicError } = await admin
            .from("clinics")
            .insert({
                name,
                contact_email: contactEmail,
                phone: phone || null,
                subscription_plan_id: planId,
                status,
                trial_ends_at:
                    status === "trial" ? trialEndsAt : null,
                id_user_created: user.id,
                id_user_last_modified: user.id,
            })
            .select("id")
            .single();

        if (clinicError) throw clinicError;

        clinicId = clinic.id;

        if (sendInvitation) {

            // UPDATE THIS!!!
            const { data: invitation, error: invitationError } =
                await admin.auth.admin.inviteUserByEmail(ownerEmail, {
                    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/set-password`,
                    data: {
                        first_name: firstName,
                        last_name: lastName,
                        clinic_id: clinic.id,
                    },
                });


            if (invitationError || !invitation.user) {
                throw new Error(
                    invitationError?.message ??
                        "Failed to invite the clinic administrator.",
                );
            }

            invitedUserId = invitation.user.id;

            const { error: staffError } = await admin.from("staff").insert({
                id: invitation.user.id,
                clinic_id: clinic.id,
                first_name: firstName,
                last_name: lastName,
                role: "clinic_user",
                clinic_role: "owner",
                id_user_created: platformAdmin.id,
                id_user_last_modified: platformAdmin.id,
            });

            if (staffError) throw staffError;
        }

        return NextResponse.json(
            {
                message: sendInvitation
                    ? "Clinic created and administrator invited successfully."
                    : "Clinic created successfully. No administrator invitation was sent.",
                clinicId: clinic.id,
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("POST clinic error:", error);

        // Best-effort cleanup if setup failed after creating the clinic.
        const admin = createSupabaseAdmin();

        if (invitedUserId) {
            await admin.auth.admin.deleteUser(invitedUserId);
        }

        if (clinicId) {
            await admin.from("clinics").delete().eq("id", clinicId);
        }

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to create clinic.",
            },
            { status: 500 },
        );
    }
}

// PATCH /api/admin/clinics
export async function PATCH(request: NextRequest) {
    try {
        const { user } = await requirePlatformAdmin();
        const admin = createSupabaseAdmin();
        const body = await request.json();

        const id = String(body.id ?? "");
        const name = String(body.name ?? "").trim();
        const contactEmail = String(body.email ?? "").trim().toLowerCase();
        const phone = String(body.phone ?? "").trim();
        const planId = String(body.planId ?? "");
        const status = normalizeStatus(body.status);
        const trialEndsAt = body.trialEndsAt
            ? String(body.trialEndsAt)
            : null;

        if (!id || !name || !contactEmail || !planId || !status) {
            return errorResponse(
                "Clinic ID, name, contact email, plan, and status are required.",
            );
        }

        if (status === "trial" && !trialEndsAt) {
            return errorResponse("A trial end date is required.");
        }

        const { data: plan, error: planError } = await admin
            .from("subscription_plans")
            .select("id, is_active")
            .eq("id", planId)
            .maybeSingle();

        if (planError) throw planError;

        if (!plan) {
            return errorResponse("The selected subscription plan was not found.");
        }

        const { data: duplicate, error: duplicateError } = await admin
            .from("clinics")
            .select("id")
            .ilike("contact_email", contactEmail)
            .neq("id", id)
            .limit(1)
            .maybeSingle();

        if (duplicateError) throw duplicateError;

        if (duplicate) {
            return errorResponse(
                "Another clinic already uses this contact email.",
                409,
            );
        }

        const { data, error } = await admin
            .from("clinics")
            .update({
                name,
                contact_email: contactEmail,
                phone: phone || null,
                subscription_plan_id: planId,
                status,
                trial_ends_at:
                    status === "trial" ? trialEndsAt : null,
                id_user_last_modified: user.id,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .select("id")
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            return errorResponse("Clinic not found.", 404);
        }

        return NextResponse.json({
            message: "Clinic updated successfully.",
        });
    } catch (error) {
        console.error("PATCH clinic error:", error);

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to update clinic.",
            },
            { status: 500 },
        );
    }
}

// DELETE /api/admin/clinics?id=<clinic-id>
// Deactivate the clinic instead of permanently deleting its history.
export async function DELETE(request: NextRequest) {
    try {
        const { user } = await requirePlatformAdmin();
        const admin = createSupabaseAdmin();

        const id = request.nextUrl.searchParams.get("id");

        if (!id) {
            return errorResponse("A clinic ID is required.");
        }

        const { data, error } = await admin
            .from("clinics")
            .update({
                status: "inactive",
                id_user_last_modified: user.id,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .select("id")
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            return errorResponse("Clinic not found.", 404);
        }

        return NextResponse.json({
            message: "Clinic deactivated successfully.",
        });
    } catch (error) {
        console.error("DELETE clinic error:", error);

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to deactivate clinic.",
            },
            { status: 500 },
        );
    }
}
