
import "server-only";

import { getCurrentStaff } from "@/lib/auth/get-current-staff";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

type DatabaseRow = Record<string, unknown>;

type InsertOptions<T extends DatabaseRow> = {
  table: string;
  values: T;
};

type UpdateOptions<T extends DatabaseRow> = {
  table: string;
  values: Partial<T>;
  match: Record<string, unknown>;
};

export async function createRecord<T extends DatabaseRow>({
  table,
  values,
}: InsertOptions<T>) {
  const { staff } = await getCurrentStaff();
  const supabase = createSupabaseAdmin();

  const payload = {
    ...values,
    created_by: staff.id,
    updated_by: staff.id,
  };

  const { data, error } = await supabase
    .from(table)
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create ${table}: ${error.message}`);
  }

  return data;
}

export async function updateRecord<T extends DatabaseRow>({
  table,
  values,
  match,
}: UpdateOptions<T>) {
  const { staff } = await getCurrentStaff();
  const supabase = createSupabaseAdmin();

  const payload = {
    ...values,
    updated_by: staff.id,
  };

  const { data, error } = await supabase
    .from(table)
    .update(payload)
    .match(match)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update ${table}: ${error.message}`);
  }

  return data;
}
