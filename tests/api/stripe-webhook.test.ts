import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/stripe/webhook/route";
import { verifyStripeEvent } from "@/lib/payments/stripe";

vi.mock("@/lib/payments/stripe", () => ({
  verifyStripeEvent: vi.fn(),
}));

describe("POST /api/stripe/webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("accepts valid webhook event", async () => {
    vi.mocked(verifyStripeEvent).mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_123",
          metadata: {
            selectedDomain: "legacyvoice.ai",
          },
          amount_total: 500,
          customer_details: {
            email: "founder@example.com",
          },
        },
      },
    } as never);

    const request = new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      headers: { "stripe-signature": "mock_signature" },
      body: JSON.stringify({ id: "evt_test_123" }),
    });

    const response = await POST(request as never);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.received).toBe(true);
    expect(verifyStripeEvent).toHaveBeenCalledOnce();
  });

  it("fails without signature", async () => {
    const request = new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      body: JSON.stringify({ id: "evt_test_123" }),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(400);
  });
});
