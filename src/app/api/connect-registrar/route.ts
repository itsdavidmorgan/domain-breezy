import { NextRequest } from "next/server";
import { getCookieValue } from "@/lib/http/cookies";
import { fail, ok } from "@/lib/http/response";
import { ApiError } from "@/lib/http/errors";
import {
  createOrGetSessionId,
  getSessionCredentials,
  setSessionCredentials,
} from "@/lib/registrars/session-store";
import { getRegistrarConnectionStatuses } from "@/lib/registrars/service";
import { connectRegistrarRequestSchema } from "@/lib/validation/domain";

const SESSION_COOKIE = "db_registrar_session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = connectRegistrarRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError("Invalid request payload", 400, parsed.error.flatten());
    }

    const existingSession = getCookieValue(request, SESSION_COOKIE);
    const sessionId = createOrGetSessionId(existingSession);

    if (parsed.data.registrar === "cloudflare") {
      setSessionCredentials(sessionId, {
        cloudflare: {
          accountId: parsed.data.accountId,
          apiToken: parsed.data.apiToken,
        },
      });
    } else if (parsed.data.registrar === "dnsimple") {
      setSessionCredentials(sessionId, {
        dnsimple: {
          accountId: parsed.data.accountId,
          apiToken: parsed.data.apiToken,
          registrantId: parsed.data.registrantId,
        },
      });
    } else if (parsed.data.registrar === "porkbun") {
      setSessionCredentials(sessionId, {
        porkbun: {
          apiKey: parsed.data.apiKey,
          secretApiKey: parsed.data.secretApiKey,
        },
      });
    } else {
      throw new ApiError("Namecheap cannot be connected for in-chat registration", 400);
    }

    const credentials = getSessionCredentials(sessionId);
    const response = ok({
      success: true,
      connections: getRegistrarConnectionStatuses(credentials),
    });
    response.cookies.set({
      name: SESSION_COOKIE,
      value: sessionId,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return fail(error);
  }
}
