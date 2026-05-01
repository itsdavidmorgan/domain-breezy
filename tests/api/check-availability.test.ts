import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/check-availability/route";
import { checkAvailability } from "@/lib/domain/namecheap";

vi.mock("@/lib/domain/namecheap", () => ({
  checkAvailability: vi.fn(),
}));

describe("POST /api/check-availability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns availability results", async () => {
    vi.mocked(checkAvailability).mockResolvedValue([
      { domain: "memoryforge.com", available: false },
      { domain: "legacyvoice.ai", available: true },
    ]);

    const request = new Request("http://localhost/api/check-availability", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ domains: ["memoryforge.com", "legacyvoice.ai"] }),
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.results).toHaveLength(2);
    expect(checkAvailability).toHaveBeenCalledWith(["memoryforge.com", "legacyvoice.ai"]);
  });

  it("rejects invalid payload", async () => {
    const request = new Request("http://localhost/api/check-availability", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ domains: [] }),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(400);
  });
});
