import { NextRequest } from "next/server";
import { generateDomainsFromIdea } from "@/lib/domain/generator";
import { ApiError } from "@/lib/http/errors";
import { fail, ok } from "@/lib/http/response";
import { generateDomainsRequestSchema } from "@/lib/validation/domain";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = generateDomainsRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError("Invalid request payload", 400, parsed.error.flatten());
    }

    const result = await generateDomainsFromIdea(parsed.data.idea);
    return ok(result);
  } catch (error) {
    return fail(error);
  }
}
