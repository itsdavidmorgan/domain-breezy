import { z } from "zod";

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
});

export const checkAvailabilityResponseSchema = z.object({
  results: z.array(
    z.object({
      domain: z.string(),
      available: z.boolean(),
    }),
  ),
});

export const checkoutRequestSchema = z.object({
  domain: z.string().trim().toLowerCase().min(3),
});

export function assertDomainLooksValid(domain: string) {
  const pattern = /^[a-z0-9]+(?:-[a-z0-9]+)*\.[a-z]{2,24}$/;
  if (!pattern.test(domain)) {
    throw new Error(`Invalid domain format: ${domain}`);
  }
}
