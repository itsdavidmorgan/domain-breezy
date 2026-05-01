import { NextRequest } from "next/server";
import { createDomainCheckoutSession } from "@/lib/payments/stripe";
import { ApiError } from "@/lib/http/errors";
import { fail, ok } from "@/lib/http/response";
import { checkoutRequestSchema } from "@/lib/validation/domain";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = checkoutRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError("Invalid request payload", 400, parsed.error.flatten());
    }

    const result = await createDomainCheckoutSession(parsed.data.domain);
    if (!result.checkout_url) {
      throw new ApiError("Stripe did not return a checkout URL", 502);
    }

    return ok(result);
  } catch (error) {
    return fail(error);
  }
}
