import { beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE, GET } from "@/app/api/registrar-connections/route";
import {
  clearRegistrarConnection,
  createOrGetSessionId,
  getSessionCredentials,
} from "@/lib/registrars/session-store";
import { getRegistrarConnectionStatuses } from "@/lib/registrars/service";

vi.mock("@/lib/registrars/session-store", () => ({
  createOrGetSessionId: vi.fn(),
  getSessionCredentials: vi.fn(),
  clearRegistrarConnection: vi.fn(),
}));

vi.mock("@/lib/registrars/service", () => ({
  getRegistrarConnectionStatuses: vi.fn(),
  registrarIds: ["namecheap", "cloudflare", "dnsimple", "porkbun"],
}));

describe("Registrar connection APIs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createOrGetSessionId).mockReturnValue("session_123");
    vi.mocked(getSessionCredentials).mockReturnValue({});
    vi.mocked(getRegistrarConnectionStatuses).mockReturnValue([]);
  });

  it("gets connection status", async () => {
    const request = new Request("http://localhost/api/registrar-connections");
    const response = await GET(request as never);
    expect(response.status).toBe(200);
  });

  it("disconnects a registrar", async () => {
    const request = new Request("http://localhost/api/registrar-connections", {
      method: "DELETE",
      headers: { "content-type": "application/json", cookie: "db_registrar_session=session_123" },
      body: JSON.stringify({ registrar: "cloudflare" }),
    });

    const response = await DELETE(request as never);
    expect(response.status).toBe(200);
    expect(clearRegistrarConnection).toHaveBeenCalledOnce();
  });
});
