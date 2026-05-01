import { NextRequest } from "next/server";
import { logger } from "@/lib/logger";
import { fail, ok } from "@/lib/http/response";
import { ApiError } from "@/lib/http/errors";
import { verifyStripeEvent } from "@/lib/payments/stripe";

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      throw new ApiError("Missing Stripe signature", 400);
    }

    const rawBody = await request.text();
    const event = verifyStripeEvent(rawBody, signature);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      logger.info(
        {
          checkoutSessionId: session.id,
          selectedDomain: session.metadata?.selectedDomain,
          amountTotal: session.amount_total,
          customerEmail: session.customer_details?.email,
        },
        "Checkout completed",
      );
    }

    return ok({ received: true });
  } catch (error) {
    return fail(error);
  }
}
