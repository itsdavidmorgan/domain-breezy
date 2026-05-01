import { NextRequest } from "next/server";
import { checkAvailability } from "@/lib/domain/namecheap";
import { ApiError } from "@/lib/http/errors";
import { fail, ok } from "@/lib/http/response";
import { buildOptionsForDomains } from "@/lib/registrars/service";
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
    const results = buildOptionsForDomains(availability, parsed.data.registrars);
    const responseBody = checkAvailabilityResponseSchema.parse({ results });
    return ok(responseBody);
  } catch (error) {
    return fail(error);
  }
}
