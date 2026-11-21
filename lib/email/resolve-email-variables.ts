
import "server-only";

import type {
  EmailResolverIds,
  EmailVariables,
} from "./types";

import { resolveBookingVariables } from "./resolvers/booking";
import { resolveClinicVariables } from "./resolvers/clinic";

export async function resolveEmailVariables(
  ids: EmailResolverIds
): Promise<EmailVariables> {
  const variables: EmailVariables = {};

  // Resolve booking and its related information.
  if (ids.id_booking) {
    Object.assign(
      variables,
      await resolveBookingVariables(ids.id_booking)
    );
  }

  // Resolve clinic independently.
  if (ids.id_clinic) {
    Object.assign(
      variables,
      await resolveClinicVariables(ids.id_clinic)
    );
  }

  return variables;
}
