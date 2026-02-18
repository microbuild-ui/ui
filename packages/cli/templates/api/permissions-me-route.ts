/**
 * Permissions (Me) API Route
 *
 * Proxies the current user's permission requests to the DaaS backend.
 * Required for CollectionList permission-aware column filtering via
 * PermissionsService.getReadableFields().
 *
 * @microbuild/origin: api-routes/permissions-me
 * @microbuild/version: 1.0.0
 */

import { getAuthHeaders, getDaasUrl } from "@/lib/api/auth-headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/permissions/me
 * Returns the current user's field-level permissions for all collections.
 *
 * Query Parameters:
 * - collection=name  Filter to specific collection(s), can be repeated
 *
 * Response format (DaaS / DaaS):
 * {
 *   "data": {
 *     "<collection>": {
 *       "read":   { "fields": ["id","title",...], "permissions": null, "validation": null, "presets": null },
 *       "create": { ... },
 *       "update": { ... },
 *       "delete": { ... }
 *     }
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const headers = await getAuthHeaders();
    const daasUrl = getDaasUrl();

    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${daasUrl}/api/permissions/me${
      searchParams ? `?${searchParams}` : ""
    }`;

    const response = await fetch(url, {
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        errors: [{ message: "Request failed" }],
      }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Permissions API error:", error);
    return NextResponse.json(
      {
        errors: [
          {
            message:
              error instanceof Error ? error.message : "Internal server error",
          },
        ],
      },
      { status: 500 },
    );
  }
}
