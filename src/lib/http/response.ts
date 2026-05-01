import { NextResponse } from "next/server";
import { ApiError, toApiError } from "./errors";
import { logger } from "@/lib/logger";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(error: unknown) {
  const apiError: ApiError = toApiError(error);
  logger.error(
    {
      err: apiError.message,
      statusCode: apiError.statusCode,
      details: apiError.details,
    },
    "API request failed",
  );

  return NextResponse.json(
    {
      error: apiError.message,
      details: apiError.details,
    },
    { status: apiError.statusCode },
  );
}
