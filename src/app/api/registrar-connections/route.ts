import { NextRequest } from "next/server";
import { getCookieValue } from "@/lib/http/cookies";
import { fail, ok } from "@/lib/http/response";
import { ApiError } from "@/lib/http/errors";
import {
  clearRegistrarConnection,
  createOrGetSessionId,
  getSessionCredentials,
} from "@/lib/registrars/session-store";
import { getRegistrarConnectionStatuses, registrarIds } from "@/lib/registrars/service";

const SESSION_COOKIE = "db_registrar_session";

export async function GET(request: NextRequest) {
  try {
    const existingSession = getCookieValue(request, SESSION_COOKIE);
    const sessionId = createOrGetSessionId(existingSession);
    const credentials = getSessionCredentials(sessionId);
    const connections = getRegistrarConnectionStatuses(credentials);

    const response = ok({ connections });
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

export async function DELETE(request: NextRequest) {
  try {
    const sessionId = getCookieValue(request, SESSION_COOKIE);
    if (!sessionId) {
      throw new ApiError("No registrar session found", 400);
    }

    const body = await request.json();
    const registrar = String(body?.registrar ?? "").toLowerCase();
    if (!registrarIds.includes(registrar as (typeof registrarIds)[number])) {
      throw new ApiError("Invalid registrar", 400);
    }

    if (registrar !== "namecheap") {
      clearRegistrarConnection(sessionId, registrar as "cloudflare" | "dnsimple" | "porkbun");
    }

    const credentials = getSessionCredentials(sessionId);
    return ok({ connections: getRegistrarConnectionStatuses(credentials) });
  } catch (error) {
    return fail(error);
  }
}
