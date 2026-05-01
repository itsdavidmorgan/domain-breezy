import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/generate-domains/route";
import { generateDomainsFromIdea } from "@/lib/domain/generator";

vi.mock("@/lib/domain/generator", () => ({
  generateDomainsFromIdea: vi.fn(),
}));

describe("POST /api/generate-domains", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns generated domains", async () => {
    vi.mocked(generateDomainsFromIdea).mockResolvedValue({
      domains: [
        {
          name: "memoryforge.com",
          type: "brandable",
          reason: "Strong emotional brand name.",
        },
      ],
    });

    const request = new Request("http://localhost/api/generate-domains", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ idea: "AI tool for preserving memories and legacy" }),
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.domains).toHaveLength(1);
    expect(generateDomainsFromIdea).toHaveBeenCalledOnce();
  });

  it("rejects invalid payload", async () => {
    const request = new Request("http://localhost/api/generate-domains", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ idea: "short" }),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(400);
  });
});
