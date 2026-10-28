
import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
    try {
        const supabase = createSupabaseAdmin();

        const { data, error } = await supabase
            .from("subscription_plans")
            .select(
                "id, name, description, price, billing_interval, features, max_doctors, max_branches, is_active"
            )
            .eq("is_active", true)
            .order("price", { ascending: true });

        if (error) {
            console.error("Failed to fetch public subscription plans:", error);

            return NextResponse.json(
                { error: "Unable to load subscription plans." },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { plans: data ?? [] },
            {
                headers: {
                    "Cache-Control": "no-store",
                },
            }
        );
    } catch (error) {
        console.error("Subscription plans API error:", error);

        return NextResponse.json(
            { error: "Unable to load subscription plans." },
            { status: 500 }
        );
    }
}
