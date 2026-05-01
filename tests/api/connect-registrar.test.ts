import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/connect-registrar/route";
import {
  createOrGetSessionId,
  getSessionCredentials,
  setSessionCredentials,
} from "@/lib/registrars/session-store";
import { getRegistrarConnectionStatuses } from "@/lib/registrars/service";

vi.mock("@/lib/registrars/session-store", () => ({
  createOrGetSessionId: vi.fn(),
  getSessionCredentials: vi.fn(),
  setSessionCredentials: vi.fn(),
}));

vi.mock("@/lib/registrars/service", () => ({
  getRegistrarConnectionStatuses: vi.fn(),
}));

describe("POST /api/connect-registrar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createOrGetSessionId).mockReturnValue("session_123");
    vi.mocked(getSessionCredentials).mockReturnValue({});
    vi.mocked(getRegistrarConnectionStatuses).mockReturnValue([]);
  });

  it("connects cloudflare account", async () => {
    const request = new Request("http://localhost/api/connect-registrar", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        registrar: "cloudflare",
        accountId: "abc12345",
        apiToken: "token_token_token_token",
      }),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(200);
    expect(setSessionCredentials).toHaveBeenCalledOnce();
  });

  it("rejects namecheap connect", async () => {
    const request = new Request("http://localhost/api/connect-registrar", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ registrar: "namecheap" }),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(400);
  });
});
