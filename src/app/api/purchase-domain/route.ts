import { NextRequest } from "next/server";
import { ApiError } from "@/lib/http/errors";
import { fail, ok } from "@/lib/http/response";
import { purchaseDomainInChat } from "@/lib/registrars/service";
import { purchaseDomainRequestSchema } from "@/lib/validation/domain";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = purchaseDomainRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError("Invalid request payload", 400, parsed.error.flatten());
    }

    const result = await purchaseDomainInChat(parsed.data);
    return ok(result);
  } catch (error) {
    return fail(error);
  }
}
