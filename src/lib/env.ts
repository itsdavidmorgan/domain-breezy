import { z } from "zod";

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  NAMECHEAP_API_KEY: z.string().min(1, "NAMECHEAP_API_KEY is required"),
  NAMECHEAP_USERNAME: z.string().min(1, "NAMECHEAP_USERNAME is required"),
  NAMECHEAP_CLIENT_IP: z.string().min(1, "NAMECHEAP_CLIENT_IP is required"),
  STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is required"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, "STRIPE_WEBHOOK_SECRET is required"),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  OPENAI_MODEL: z.string().default("gpt-4.1-mini"),
  DOMAINBREEZY_PRICE_CENTS: z.coerce.number().int().positive().default(500),
  DOMAINBREEZY_USE_STUBS: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  DOMAINBREEZY_GPT_URL: z
    .string()
    .default("https://chatgpt.com/g/g-xxxxxxxx-domainbreezy"),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => issue.message)
      .join("; ");
    throw new Error(`Environment validation failed: ${message}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}
