import "server-only";

import type {
  EmailResolverIds,
  EmailVariables,
} from "./types";

import { resolveBookingVariables } from "./resolvers/booking";
import { resolveClinicVariables } from "./resolvers/clinic";
import { resolveStaffVariables } from "./resolvers/staff";
import { resolveStaffPasswordUrl } from "./resolvers/staff-password";

export async function resolveEmailVariables(
  ids: EmailResolverIds,
  templateBody?: string
): Promise<EmailVariables> {
  const variables: EmailVariables = {};

  // Resolve booking.
  if (ids.id_booking) {
    Object.assign(
      variables,
      await resolveBookingVariables(ids.id_booking)
    );
  }

  // Resolve clinic.
  if (ids.id_clinic) {
    Object.assign(
      variables,
      await resolveClinicVariables(ids.id_clinic)
    );
  }

  // Resolve staff.
  if (ids.id_staff) {
    const staffVariables = await resolveStaffVariables(ids.id_staff);

    Object.assign(variables, staffVariables);

    // Generate password URL only if the template requires it.
    if (
      templateBody?.includes("{{set_password_url}}") &&
      staffVariables.staff_email
    ) {
      variables.set_password_url =
        await resolveStaffPasswordUrl(String(staffVariables.staff_email));
    }
  }

  return variables;
}