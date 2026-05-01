import { z } from "zod";

const registrarSchema = z.enum(["namecheap", "cloudflare", "dnsimple", "porkbun"]);

export const generateDomainsRequestSchema = z.object({
  idea: z.string().trim().min(10).max(300),
});

export const domainSuggestionSchema = z.object({
  name: z.string().trim().toLowerCase(),
  type: z.enum(["brandable", "descriptive", "emotional", "seo", "short"]),
  reason: z.string().trim().min(10).max(240),
});

export const generateDomainsResponseSchema = z.object({
  domains: z.array(domainSuggestionSchema).min(1).max(20),
});

export const checkAvailabilityRequestSchema = z.object({
  domains: z
    .array(z.string().trim().toLowerCase())
    .min(1)
    .max(25),
  registrars: z.array(registrarSchema).min(1).max(4).optional(),
});

export const checkAvailabilityResponseSchema = z.object({
  results: z.array(
    z.object({
      domain: z.string(),
      available: z.boolean(),
      options: z.array(
        z.object({
          registrar: registrarSchema,
          connected: z.boolean(),
          purchasableInChat: z.boolean(),
          basePriceUsd: z.number(),
          totalPriceUsd: z.number(),
          currency: z.literal("USD"),
          action: z.enum(["purchase_in_chat", "connect_account", "external_checkout"]),
          connectUrl: z.string().optional(),
          note: z.string(),
        }),
      ),
    }),
  ),
});

export const checkoutRequestSchema = z.object({
  domain: z.string().trim().toLowerCase().min(3),
});

export const purchaseDomainRequestSchema = z.object({
  domain: z.string().trim().toLowerCase().min(3),
  registrar: registrarSchema,
  expectedTotalPriceUsd: z.number().positive(),
});

export const connectRegistrarRequestSchema = z.discriminatedUnion("registrar", [
  z.object({
    registrar: z.literal("cloudflare"),
    accountId: z.string().min(5),
    apiToken: z.string().min(20),
  }),
  z.object({
    registrar: z.literal("dnsimple"),
    accountId: z.string().min(1),
    apiToken: z.string().min(20),
    registrantId: z.string().min(1),
  }),
  z.object({
    registrar: z.literal("porkbun"),
    apiKey: z.string().min(10),
    secretApiKey: z.string().min(10),
  }),
  z.object({
    registrar: z.literal("namecheap"),
  }),
]);

export function assertDomainLooksValid(domain: string) {
  const pattern = /^[a-z0-9]+(?:-[a-z0-9]+)*\.[a-z]{2,24}$/;
  if (!pattern.test(domain)) {
    throw new Error(`Invalid domain format: ${domain}`);
  }
}
