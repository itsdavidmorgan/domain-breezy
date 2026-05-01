import Stripe from "stripe";
import { getEnv } from "@/lib/env";
import { assertDomainLooksValid } from "@/lib/validation/domain";

let stripeClient: Stripe | null = null;

function getStripe() {
  if (!stripeClient) {
    const env = getEnv();
    stripeClient = new Stripe(env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

export async function createDomainCheckoutSession(domain: string) {
  const env = getEnv();
  const cleanDomain = domain.trim().toLowerCase();
  assertDomainLooksValid(cleanDomain);

  if (env.DOMAINBREEZY_USE_STUBS) {
    return {
      checkout_url: `${env.NEXT_PUBLIC_SITE_URL}/success?domain=${encodeURIComponent(cleanDomain)}`,
    };
  }

  const stripe = getStripe();
  const successUrl = `${env.NEXT_PUBLIC_SITE_URL}/success?domain=${encodeURIComponent(cleanDomain)}`;
  const cancelUrl = `${env.NEXT_PUBLIC_SITE_URL}/cancel?domain=${encodeURIComponent(cleanDomain)}`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      selectedDomain: cleanDomain,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: env.DOMAINBREEZY_PRICE_CENTS,
          product_data: {
            name: "DomainBreezy Instant Secure",
            description:
              "AI domain discovery and instant secure flow. Domain registration is completed separately via Namecheap.",
          },
        },
      },
    ],
  });

  return {
    checkout_url: session.url ?? "",
  };
}

export function verifyStripeEvent(rawBody: string, signature: string) {
  const env = getEnv();
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
}
