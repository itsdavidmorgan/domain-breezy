import { NextRequest } from "next/server";
import { checkAvailability } from "@/lib/domain/namecheap";
import { ApiError } from "@/lib/http/errors";
import { getCookieValue } from "@/lib/http/cookies";
import { fail, ok } from "@/lib/http/response";
import { buildOptionsForDomains } from "@/lib/registrars/service";
import { getSessionCredentials } from "@/lib/registrars/session-store";
import {
  checkAvailabilityRequestSchema,
  checkAvailabilityResponseSchema,
} from "@/lib/validation/domain";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = checkAvailabilityRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError("Invalid request payload", 400, parsed.error.flatten());
    }

    const availability = await checkAvailability(parsed.data.domains);
    const sessionId = getCookieValue(request, "db_registrar_session");
    const sessionCredentials = getSessionCredentials(sessionId);
    const results = buildOptionsForDomains(
      availability,
      parsed.data.registrars,
      sessionCredentials,
    );
    const responseBody = checkAvailabilityResponseSchema.parse({ results });
    return ok(responseBody);
  } catch (error) {
    return fail(error);
  }
}
