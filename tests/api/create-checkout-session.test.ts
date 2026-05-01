import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/create-checkout-session/route";
import { createDomainCheckoutSession } from "@/lib/payments/stripe";

vi.mock("@/lib/payments/stripe", () => ({
  createDomainCheckoutSession: vi.fn(),
}));

describe("POST /api/create-checkout-session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns checkout url", async () => {
    vi.mocked(createDomainCheckoutSession).mockResolvedValue({
      checkout_url: "https://checkout.stripe.com/mock",
    });

    const request = new Request("http://localhost/api/create-checkout-session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ domain: "legacyvoice.ai" }),
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.checkout_url).toContain("checkout.stripe.com");
    expect(createDomainCheckoutSession).toHaveBeenCalledWith("legacyvoice.ai");
  });

  it("rejects invalid payload", async () => {
    const request = new Request("http://localhost/api/create-checkout-session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ domain: "" }),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(400);
  });
});
