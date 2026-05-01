import OpenAI from "openai";
import { getEnv } from "@/lib/env";
import { ApiError } from "@/lib/http/errors";
import {
  domainSuggestionSchema,
  generateDomainsResponseSchema,
} from "@/lib/validation/domain";

type DomainSuggestion = {
  name: string;
  type: "brandable" | "descriptive" | "emotional" | "seo" | "short";
  reason: string;
};

function sanitizeDomainName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

function fallbackSuggestions(idea: string): DomainSuggestion[] {
  const cleaned = idea
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .join("");

  const root = cleaned || "brightidea";
  return [
    {
      name: `${root}labs.com`,
      type: "brandable",
      reason: "Short and brandable with a startup-friendly sound.",
    },
    {
      name: `${root}hq.com`,
      type: "descriptive",
      reason: "Clear and trustworthy for an early-stage product brand.",
    },
    {
      name: `${root}ai.ai`,
      type: "seo",
      reason: "Signals an AI-first product while remaining memorable.",
    },
  ];
}

export async function generateDomainsFromIdea(idea: string) {
  const env = getEnv();
  if (env.DOMAINBREEZY_USE_STUBS) {
    return { domains: fallbackSuggestions(idea) };
  }

  const client = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
  });

  const prompt = [
    "You are a domain naming assistant.",
    "Return ONLY valid JSON with this shape:",
    '{"domains":[{"name":"example.com","type":"brandable","reason":"..."}]}',
    "Constraints:",
    "- 10 domain suggestions.",
    "- Use tlds .com, .ai, or .co",
    "- Avoid hyphens and awkward spellings.",
    "- Domain types must be one of: brandable, descriptive, emotional, seo, short.",
    `User idea: ${idea}`,
  ].join("\n");

  const response = await client.responses.create({
    model: env.OPENAI_MODEL,
    input: prompt,
  });

  const raw = response.output_text?.trim();
  if (!raw) {
    throw new ApiError("LLM returned an empty response", 502);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ApiError("LLM returned invalid JSON", 502, { raw });
  }

  const validated = generateDomainsResponseSchema.safeParse(parsed);
  if (!validated.success) {
    throw new ApiError("LLM response failed validation", 502, validated.error.flatten());
  }

  const deduped = new Map<string, DomainSuggestion>();
  for (const domain of validated.data.domains) {
    const domainCheck = domainSuggestionSchema.parse({
      ...domain,
      name: sanitizeDomainName(domain.name),
    });
    deduped.set(domainCheck.name, domainCheck);
  }

  return {
    domains: [...deduped.values()].slice(0, 10),
  };
}
