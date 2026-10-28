
import { NextRequest, NextResponse } from "next/server";

import { requirePlatformAdmin } from "@/lib/auth/require-platform-admin";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

const PLAN_COLUMNS =
  "id, name, description, price, billing_interval, features, max_doctors, max_branches, is_active, created_at, updated_at";

type PlanInput = {
  name?: unknown;
  description?: unknown;
  price?: unknown;
  billing_interval?: unknown;
  features?: unknown;
  max_doctors?: unknown;
  max_branches?: unknown;
  is_active?: unknown;
};

function validatePlan(input: PlanInput) {
  if (typeof input.name !== "string" || !input.name.trim()) {
    throw new Error("Plan name is required.");
  }

  if (input.name.trim().length > 60) {
    throw new Error("Plan name must be 60 characters or fewer.");
  }

  if (
    typeof input.price !== "number" ||
    !Number.isFinite(input.price) ||
    input.price < 0
  ) {
    throw new Error("Price must be a valid non-negative number.");
  }

  if (
    !Number.isInteger(input.max_doctors) ||
    (input.max_doctors as number) < 1
  ) {
    throw new Error("Maximum doctors must be at least 1.");
  }

  if (
    !Number.isInteger(input.max_branches) ||
    (input.max_branches as number) < 1
  ) {
    throw new Error("Maximum branches must be at least 1.");
  }

//   if (
//     input.billing_interval !== "monthly" &&
//     input.billing_interval !== "yearly"
//   ) {
//     throw new Error("Billing interval must be monthly or yearly.");
//   }

  if (
    typeof input.description !== "string" ||
    input.description.length > 500
  ) {
    throw new Error("Description must be 500 characters or fewer.");
  }

  if (
    !Array.isArray(input.features) ||
    input.features.length > 30 ||
    !input.features.every(
      (feature) =>
        typeof feature === "string" && feature.length <= 150,
    )
  ) {
    throw new Error("Features must be a list of up to 30 text items.");
  }

  if (typeof input.is_active !== "boolean") {
    throw new Error("Plan status must be active or inactive.");
  }

  return {
    name: input.name.trim(),
    description: input.description.trim(),
    price: input.price,
    billing_interval: input.billing_interval,
    features: input.features
      .map((feature: string) => feature.trim())
      .filter(Boolean),
    max_doctors: input.max_doctors,
    max_branches: input.max_branches,
    is_active: input.is_active,
  };
}

function errorResponse(error: unknown) {
  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 },
    );
  }

  return NextResponse.json(
    { error: "An unexpected error occurred." },
    { status: 500 },
  );
}

// GET /api/admin/subscription-plans
export async function GET() {
  try {
    await requirePlatformAdmin();

    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from("subscription_plans")
      .select(PLAN_COLUMNS)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Failed to load subscription plans:", error);
      return NextResponse.json(
        { error: "Failed to load subscription plans." },
        { status: 500 },
      );
    }

    return NextResponse.json({ plans: data ?? [] });
  } catch (error) {
    // Next.js redirect() throws internally. Preserve redirect behavior.
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    return errorResponse(error);
  }
}

// POST /api/admin/subscription-plans
export async function POST(request: NextRequest) {
  try {
    await requirePlatformAdmin();

    const body = (await request.json()) as PlanInput;
    const plan = validatePlan(body);
    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from("subscription_plans")
      .insert(plan)
      .select(PLAN_COLUMNS)
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A subscription plan with this name already exists." },
          { status: 409 },
        );
      }

      console.error("Failed to create subscription plan:", error);

      return NextResponse.json(
        { error: "Failed to create subscription plan." },
        { status: 500 },
      );
    }

    return NextResponse.json({ plan: data }, { status: 201 });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON request." },
        { status: 400 },
      );
    }

    return errorResponse(error);
  }
}

// PATCH /api/admin/subscription-plans
export async function PATCH(request: NextRequest) {
  try {
    await requirePlatformAdmin();

    const body = (await request.json()) as PlanInput & { id?: unknown };

    if (typeof body.id !== "string" || !body.id.trim()) {
      return NextResponse.json(
        { error: "A valid plan ID is required." },
        { status: 400 },
      );
    }

    const plan = validatePlan(body);
    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from("subscription_plans")
      .update(plan)
      .eq("id", body.id)
      .select(PLAN_COLUMNS)
      .maybeSingle();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A subscription plan with this name already exists." },
          { status: 409 },
        );
      }

      console.error("Failed to update subscription plan:", error);

      return NextResponse.json(
        { error: "Failed to update subscription plan." },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Subscription plan not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ plan: data });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON request." },
        { status: 400 },
      );
    }

    return errorResponse(error);
  }
}

// DELETE /api/admin/subscription-plans?id=<plan-id>
export async function DELETE(request: NextRequest) {
  try {
    await requirePlatformAdmin();

    const id = request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "A plan ID is required." },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdmin();

    const { data: clinicReference, error: referenceError } =
      await supabase
        .from("clinics")
        .select("id")
        .eq("subscription_plan_id", id)
        .limit(1)
        .maybeSingle();

    if (referenceError) {
      console.error(
        "Failed to check clinic subscriptions:",
        referenceError,
      );

      return NextResponse.json(
        { error: "Could not verify whether clinics use this plan." },
        { status: 500 },
      );
    }

    if (clinicReference) {
      return NextResponse.json(
        {
          error:
            "This plan is assigned to one or more clinics. Deactivate it instead of deleting it.",
        },
        { status: 409 },
      );
    }

    const { data, error } = await supabase
      .from("subscription_plans")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("Failed to delete subscription plan:", error);

      return NextResponse.json(
        {
          error:
            "Failed to delete the plan. It may still be referenced by another record.",
        },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Subscription plan not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    return errorResponse(error);
  }
}
