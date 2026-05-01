import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/purchase-domain/route";
import { purchaseDomainInChat } from "@/lib/registrars/service";

vi.mock("@/lib/registrars/service", () => ({
  purchaseDomainInChat: vi.fn(),
}));

describe("POST /api/purchase-domain", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns purchase result", async () => {
    vi.mocked(purchaseDomainInChat).mockResolvedValue({
      status: "registered",
      registered: true,
      registrar: "cloudflare",
      message: "Domain registration submitted via cloudflare.",
      reference: "abc123",
    } as never);

    const request = new Request("http://localhost/api/purchase-domain", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        domain: "legacyvoice.ai",
        registrar: "cloudflare",
        expectedTotalPriceUsd: 74.99,
      }),
    });

    const response = await POST(request as never);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.status).toBe("registered");
    expect(purchaseDomainInChat).toHaveBeenCalledOnce();
  });

  it("rejects invalid payload", async () => {
    const request = new Request("http://localhost/api/purchase-domain", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        domain: "bad",
        registrar: "unknown",
        expectedTotalPriceUsd: -1,
      }),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(400);
  });
});
