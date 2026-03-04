/**
 * Update System Divider
 * Ported from DaaS app/src/components/v-form/utils/update-system-divider.ts
 *
 * Controls the visibility of the system divider field based on whether
 * there are both visible system fields AND visible user fields.
 * If either side is empty, the divider is hidden.
 */

import type { Field } from '@buildpad/types';

/**
 * Update system divider visibility based on surrounding fields.
 *
 * In microbuild-ui the divider field is named `system-divider`
 * (to avoid PostCSS `$` issues). Both names are checked for compatibility.
 *
 * @param fields        Array of processed form fields (mutated in place)
 * @param isVisible     Visibility check function
 */
export function updateSystemDivider(
  fields: Field[],
  isVisible: (field: Field) => boolean = (f) => f.meta?.hidden !== true,
): void {
  let hasVisibleSystemFields = false;
  let hasVisibleUserFields = false;
  let systemDivider: Field | undefined;

  for (const field of fields) {
    // Match both naming conventions
    if (field.field === '$system_divider' || field.field === 'system-divider') {
      systemDivider = field;
      continue;
    }

    if (!isVisible(field)) continue;

    const meta = field.meta as Record<string, unknown> | undefined;

    if (meta?.system) {
      hasVisibleSystemFields = true;
    } else {
      hasVisibleUserFields = true;
      // All system fields are ordered before user fields, so we can break early
      // once we find a visible user field (system fields already accounted for)
      break;
    }
  }

  if (systemDivider?.meta) {
    (systemDivider.meta as unknown as Record<string, unknown>).hidden =
      !hasVisibleSystemFields || !hasVisibleUserFields;
  }
}
