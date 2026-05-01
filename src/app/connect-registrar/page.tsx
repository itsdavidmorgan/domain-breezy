import { cookies } from "next/headers";
import ConnectRegistrarClient from "./ConnectRegistrarClient";
import { getSessionCredentials } from "@/lib/registrars/session-store";
import { getRegistrarConnectionStatuses } from "@/lib/registrars/service";

export default async function ConnectRegistrarPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("db_registrar_session")?.value;
  const credentials = getSessionCredentials(sessionId);
  const connections = getRegistrarConnectionStatuses(credentials);

  return <ConnectRegistrarClient initialConnections={connections} />;
}
