import { NextRequest } from "next/server";
import { getCookieValue } from "@/lib/http/cookies";
import { ApiError } from "@/lib/http/errors";
import { fail, ok } from "@/lib/http/response";
import { purchaseDomainInChat } from "@/lib/registrars/service";
import { getSessionCredentials } from "@/lib/registrars/session-store";
import { purchaseDomainRequestSchema } from "@/lib/validation/domain";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = purchaseDomainRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError("Invalid request payload", 400, parsed.error.flatten());
    }

    const sessionId = getCookieValue(request, "db_registrar_session");
    const sessionCredentials = getSessionCredentials(sessionId);
    const result = await purchaseDomainInChat({
      ...parsed.data,
      credentials: sessionCredentials,
    });
    return ok(result);
  } catch (error) {
    return fail(error);
  }
}
