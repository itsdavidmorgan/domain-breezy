import { XMLParser } from "fast-xml-parser";
import { getEnv } from "@/lib/env";
import { ApiError } from "@/lib/http/errors";
import { assertDomainLooksValid } from "@/lib/validation/domain";

export type AvailabilityResult = {
  domain: string;
  available: boolean;
};

function normalizeDomain(domain: string) {
  return domain.trim().toLowerCase();
}

function splitDomain(domain: string) {
  const [sld, ...rest] = domain.split(".");
  if (!sld || rest.length === 0) {
    throw new ApiError(`Domain missing tld: ${domain}`, 400);
  }
  return { sld, tld: rest.join(".") };
}

function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

export async function checkAvailability(domains: string[]): Promise<AvailabilityResult[]> {
  const env = getEnv();

  const cleanedDomains = domains.map(normalizeDomain);
  cleanedDomains.forEach(assertDomainLooksValid);

  if (env.DOMAINBREEZY_USE_STUBS) {
    return cleanedDomains.map((domain, idx) => ({
      domain,
      available: idx % 2 === 0,
    }));
  }

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
  });

  const checks = await Promise.all(
    cleanedDomains.map(async (domain) => {
      const { sld, tld } = splitDomain(domain);
      const params = new URLSearchParams({
        ApiUser: env.NAMECHEAP_USERNAME,
        ApiKey: env.NAMECHEAP_API_KEY,
        UserName: env.NAMECHEAP_USERNAME,
        ClientIp: env.NAMECHEAP_CLIENT_IP,
        Command: "namecheap.domains.check",
        SLD: sld,
        TLD: tld,
      });

      const response = await fetch(`https://api.namecheap.com/xml.response?${params.toString()}`);
      if (!response.ok) {
        throw new ApiError("Namecheap API request failed", 502, {
          status: response.status,
        });
      }

      const xml = await response.text();
      const parsed = parser.parse(xml);

      const commandResponse = parsed?.ApiResponse?.CommandResponse;
      const rawChecks = commandResponse?.DomainCheckResult;
      if (!rawChecks) {
        throw new ApiError("Namecheap response missing DomainCheckResult", 502, { xml });
      }

      const first = toArray(rawChecks)[0];
      const availableAttr = String(first?.Available ?? "").toLowerCase();

      return {
        domain,
        available: availableAttr === "true",
      };
    }),
  );

  return checks;
}
