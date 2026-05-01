import { getEnv } from "@/lib/env";
import { ApiError } from "@/lib/http/errors";
import { assertDomainLooksValid } from "@/lib/validation/domain";

export const registrarIds = ["namecheap", "cloudflare", "dnsimple", "porkbun"] as const;
export type RegistrarId = (typeof registrarIds)[number];

export type DomainOption = {
  registrar: RegistrarId;
  connected: boolean;
  purchasableInChat: boolean;
  basePriceUsd: number;
  totalPriceUsd: number;
  currency: "USD";
  action: "purchase_in_chat" | "connect_account" | "external_checkout";
  connectUrl?: string;
  note: string;
};

export type AvailabilityWithOptions = {
  domain: string;
  available: boolean;
  options: DomainOption[];
};

export type CloudflareCredentials = {
  accountId: string;
  apiToken: string;
};

export type DnsimpleCredentials = {
  accountId: string;
  apiToken: string;
  registrantId: string;
};

export type PorkbunCredentials = {
  apiKey: string;
  secretApiKey: string;
};

export type RegistrarCredentials = Partial<{
  cloudflare: CloudflareCredentials;
  dnsimple: DnsimpleCredentials;
  porkbun: PorkbunCredentials;
}>;

const tldBasePrices: Record<string, number> = {
  com: 11.98,
  ai: 74,
  co: 31.99,
  io: 39.99,
  dev: 12.99,
  app: 15.99,
  net: 14.99,
  org: 12.99,
};

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function getBasePrice(domain: string, registrar: RegistrarId) {
  const tld = domain.split(".").pop() ?? "com";
  const base = tldBasePrices[tld] ?? 14.99;
  const multiplier =
    registrar === "cloudflare" ? 0.96 : registrar === "porkbun" ? 0.98 : registrar === "dnsimple" ? 1.04 : 1;
  return roundCurrency(base * multiplier);
}

function getConnectedRegistrars(credentials?: RegistrarCredentials): Set<RegistrarId> {
  const env = getEnv();
  const configured = new Set<RegistrarId>();
  const explicit = env.DOMAINBREEZY_CONNECTED_REGISTRARS.split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  for (const value of explicit) {
    if (registrarIds.includes(value as RegistrarId)) {
      configured.add(value as RegistrarId);
    }
  }

  if (env.CLOUDFLARE_ACCOUNT_ID && env.CLOUDFLARE_API_TOKEN) configured.add("cloudflare");
  if (env.DNSIMPLE_ACCOUNT_ID && env.DNSIMPLE_API_TOKEN) configured.add("dnsimple");
  if (env.PORKBUN_API_KEY && env.PORKBUN_SECRET_API_KEY) configured.add("porkbun");

  if (credentials?.cloudflare?.accountId && credentials.cloudflare.apiToken) {
    configured.add("cloudflare");
  }
  if (
    credentials?.dnsimple?.accountId &&
    credentials.dnsimple.apiToken &&
    credentials.dnsimple.registrantId
  ) {
    configured.add("dnsimple");
  }
  if (credentials?.porkbun?.apiKey && credentials.porkbun.secretApiKey) {
    configured.add("porkbun");
  }

  return configured;
}

export function getConnectUrl(registrar: RegistrarId) {
  switch (registrar) {
    case "cloudflare":
      return "https://dash.cloudflare.com/profile/api-tokens";
    case "dnsimple":
      return "https://dnsimple.com/a/account";
    case "porkbun":
      return "https://porkbun.com/account/api";
    case "namecheap":
      return "https://www.namecheap.com/myaccount/login/";
    default:
      return undefined;
  }
}

export function buildOptionsForDomains(
  availability: { domain: string; available: boolean }[],
  requestedRegistrars?: RegistrarId[],
  credentials?: RegistrarCredentials,
): AvailabilityWithOptions[] {
  const env = getEnv();
  const registrars = requestedRegistrars?.length ? requestedRegistrars : [...registrarIds];
  const connected = getConnectedRegistrars(credentials);
  const serviceFee = env.DOMAINBREEZY_SERVICE_FEE_CENTS / 100;

  return availability.map((item) => {
    const options = registrars.map((registrar) => {
      const isConnected = connected.has(registrar);
      const basePrice = getBasePrice(item.domain, registrar);
      const totalPrice = roundCurrency(basePrice + serviceFee);

      if (registrar === "namecheap") {
        return {
          registrar,
          connected: isConnected,
          purchasableInChat: false,
          basePriceUsd: basePrice,
          totalPriceUsd: totalPrice,
          currency: "USD" as const,
          action: "external_checkout" as const,
          connectUrl: getConnectUrl(registrar),
          note: "Checkout completes on Namecheap after DomainBreezy fee.",
        };
      }

      if (!isConnected) {
        return {
          registrar,
          connected: false,
          purchasableInChat: false,
          basePriceUsd: basePrice,
          totalPriceUsd: totalPrice,
          currency: "USD" as const,
          action: "connect_account" as const,
          connectUrl: getConnectUrl(registrar),
          note: "Connect a registrar account first to buy inside chat.",
        };
      }

      return {
        registrar,
        connected: true,
        purchasableInChat: true,
        basePriceUsd: basePrice,
        totalPriceUsd: totalPrice,
        currency: "USD" as const,
        action: "purchase_in_chat" as const,
        note: "Eligible for in-chat purchase and registration flow.",
      };
    });

    return {
      ...item,
      options,
    };
  });
}

async function registerCloudflareDomain(domain: string, credentials?: RegistrarCredentials) {
  const env = getEnv();
  const accountId = credentials?.cloudflare?.accountId ?? env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = credentials?.cloudflare?.apiToken ?? env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new ApiError("Cloudflare account is not connected", 400);
  }

  if (env.DOMAINBREEZY_USE_STUBS) {
    return { reference: `cf_stub_${domain}` };
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/registrar/registrations`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ domain_name: domain }),
    },
  );

  const payload = await response.json();
  if (!response.ok || !payload?.success) {
    throw new ApiError("Cloudflare registration failed", 502, payload);
  }

  return { reference: payload?.result?.id ?? domain };
}

async function registerDnsimpleDomain(domain: string, credentials?: RegistrarCredentials) {
  const env = getEnv();
  const accountId = credentials?.dnsimple?.accountId ?? env.DNSIMPLE_ACCOUNT_ID;
  const apiToken = credentials?.dnsimple?.apiToken ?? env.DNSIMPLE_API_TOKEN;
  const registrantId = credentials?.dnsimple?.registrantId ?? env.DNSIMPLE_REGISTRANT_ID;

  if (!accountId || !apiToken || !registrantId) {
    throw new ApiError("DNSimple account is not connected", 400);
  }

  if (env.DOMAINBREEZY_USE_STUBS) {
    return { reference: `dnsimple_stub_${domain}` };
  }

  const response = await fetch(
    `https://api.dnsimple.com/v2/${accountId}/registrar/domains/${domain}/registrations`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        registrant_id: Number(registrantId),
        whois_privacy: true,
      }),
    },
  );

  const payload = await response.json();
  if (!response.ok) {
    throw new ApiError("DNSimple registration failed", 502, payload);
  }

  return { reference: payload?.data?.id ?? domain };
}

async function registerPorkbunDomain(
  domain: string,
  expectedTotalUsd: number,
  credentials?: RegistrarCredentials,
) {
  const env = getEnv();
  const apiKey = credentials?.porkbun?.apiKey ?? env.PORKBUN_API_KEY;
  const secretApiKey = credentials?.porkbun?.secretApiKey ?? env.PORKBUN_SECRET_API_KEY;

  if (!apiKey || !secretApiKey) {
    throw new ApiError("Porkbun account is not connected", 400);
  }

  if (env.DOMAINBREEZY_USE_STUBS) {
    return { reference: `porkbun_stub_${domain}` };
  }

  const response = await fetch(`https://api.porkbun.com/api/json/v3/domain/create/${domain}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
      "X-Secret-API-Key": secretApiKey,
    },
    body: JSON.stringify({
      cost: Math.round(expectedTotalUsd * 100),
      agreeToTerms: "yes",
    }),
  });

  const payload = await response.json();
  if (!response.ok || payload?.status !== "SUCCESS") {
    throw new ApiError("Porkbun registration failed", 502, payload);
  }

  return { reference: payload?.transactionId ?? domain };
}

export async function purchaseDomainInChat(input: {
  domain: string;
  registrar: RegistrarId;
  expectedTotalPriceUsd: number;
  credentials?: RegistrarCredentials;
}) {
  const { domain, registrar, expectedTotalPriceUsd, credentials } = input;
  assertDomainLooksValid(domain);

  if (registrar === "namecheap") {
    return {
      status: "requires_external_checkout" as const,
      registered: false,
      registrar,
      message: "Namecheap registration requires external checkout.",
      nextUrl: `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(domain)}`,
    };
  }

  const connected = getConnectedRegistrars(credentials);
  if (!connected.has(registrar)) {
    return {
      status: "requires_connection" as const,
      registered: false,
      registrar,
      message: `Connect your ${registrar} account before purchasing in chat.`,
      nextUrl: getConnectUrl(registrar),
    };
  }

  const normalizedDomain = domain.trim().toLowerCase();
  const result =
    registrar === "cloudflare"
      ? await registerCloudflareDomain(normalizedDomain, credentials)
      : registrar === "dnsimple"
        ? await registerDnsimpleDomain(normalizedDomain, credentials)
        : await registerPorkbunDomain(normalizedDomain, expectedTotalPriceUsd, credentials);

  return {
    status: "registered" as const,
    registered: true,
    registrar,
    message: `Domain registration submitted via ${registrar}.`,
    reference: result.reference,
  };
}

export function getRegistrarConnectionStatuses(credentials?: RegistrarCredentials) {
  const connected = getConnectedRegistrars(credentials);
  return registrarIds.map((registrar) => ({
    registrar,
    connected: connected.has(registrar),
    connectUrl: getConnectUrl(registrar),
    purchasableInChat: registrar !== "namecheap" && connected.has(registrar),
  }));
}
