"use client";

import { useMemo, useState } from "react";

type Registrar = "cloudflare" | "dnsimple" | "porkbun";

type Connection = {
  registrar: string;
  connected: boolean;
  connectUrl?: string;
  purchasableInChat: boolean;
};

type ConnectRegistrarClientProps = {
  initialConnections: Connection[];
};

const registrarOptions: Registrar[] = ["cloudflare", "dnsimple", "porkbun"];

export default function ConnectRegistrarClient({
  initialConnections,
}: ConnectRegistrarClientProps) {
  const [registrar, setRegistrar] = useState<Registrar>("cloudflare");
  const [formState, setFormState] = useState<Record<string, string>>({});
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const fields = useMemo(() => {
    if (registrar === "cloudflare") {
      return [
        { key: "accountId", label: "Account ID" },
        { key: "apiToken", label: "API Token" },
      ];
    }
    if (registrar === "dnsimple") {
      return [
        { key: "accountId", label: "Account ID" },
        { key: "apiToken", label: "API Token" },
        { key: "registrantId", label: "Registrant ID" },
      ];
    }
    return [
      { key: "apiKey", label: "API Key" },
      { key: "secretApiKey", label: "Secret API Key" },
    ];
  }, [registrar]);

  async function connectRegistrar() {
    setLoading(true);
    setMessage("");
    const payload: Record<string, string> = { registrar };
    for (const field of fields) {
      payload[field.key] = (formState[field.key] ?? "").trim();
    }

    const response = await fetch("/api/connect-registrar", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(body.error ?? "Connection failed");
      return;
    }

    setConnections(body.connections ?? []);
    setMessage(`${registrar} connected. You can return to chat and purchase in-chat.`);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-6 py-12">
      <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Connect registrar account
        </h1>
        <p className="mt-3 text-sm text-slate-700">
          Keep this page in a popup while chat stays visible. After connecting, return to chat
          to complete domain purchase in one flow.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {registrarOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRegistrar(option)}
              className={`rounded-lg px-3 py-2 text-sm ${
                registrar === option
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {fields.map((field) => (
            <label key={field.key} className="flex flex-col gap-1 text-sm text-slate-700">
              {field.label}
              <input
                className="rounded-lg border border-slate-300 px-3 py-2"
                type={
                  field.key.toLowerCase().includes("token") ||
                  field.key.toLowerCase().includes("secret")
                    ? "password"
                    : "text"
                }
                value={formState[field.key] ?? ""}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    [field.key]: event.target.value,
                  }))
                }
              />
            </label>
          ))}
        </div>

        <button
          type="button"
          onClick={connectRegistrar}
          disabled={loading}
          className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Connecting..." : "Connect account"}
        </button>

        {message ? <p className="mt-4 text-sm text-slate-700">{message}</p> : null}
      </section>

      <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-xl font-semibold text-slate-900">Connection status</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600">
                <th className="py-2 pr-4">Registrar</th>
                <th className="py-2 pr-4">Connected</th>
                <th className="py-2 pr-4">In-chat purchase</th>
                <th className="py-2">Connect URL</th>
              </tr>
            </thead>
            <tbody>
              {connections.map((item) => (
                <tr key={item.registrar} className="border-b border-slate-100">
                  <td className="py-2 pr-4">{item.registrar}</td>
                  <td className="py-2 pr-4">{item.connected ? "Yes" : "No"}</td>
                  <td className="py-2 pr-4">{item.purchasableInChat ? "Yes" : "No"}</td>
                  <td className="py-2">
                    {item.connectUrl ? (
                      <a className="underline" href={item.connectUrl} target="_blank" rel="noreferrer">
                        Open
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
