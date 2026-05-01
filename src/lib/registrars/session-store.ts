import { randomUUID } from "node:crypto";
import { RegistrarCredentials } from "./service";

type RegistrarSession = {
  credentials: RegistrarCredentials;
  updatedAt: number;
};

const sessionStore = new Map<string, RegistrarSession>();
const TTL_MS = 1000 * 60 * 60 * 24 * 7;

function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [sessionId, session] of sessionStore.entries()) {
    if (now - session.updatedAt > TTL_MS) {
      sessionStore.delete(sessionId);
    }
  }
}

export function createOrGetSessionId(sessionId?: string) {
  cleanupExpiredSessions();
  if (sessionId && sessionStore.has(sessionId)) {
    return sessionId;
  }
  const next = randomUUID();
  sessionStore.set(next, { credentials: {}, updatedAt: Date.now() });
  return next;
}

export function getSessionCredentials(sessionId?: string): RegistrarCredentials {
  cleanupExpiredSessions();
  if (!sessionId) return {};
  return sessionStore.get(sessionId)?.credentials ?? {};
}

export function setSessionCredentials(sessionId: string, credentials: RegistrarCredentials) {
  cleanupExpiredSessions();
  const current = sessionStore.get(sessionId)?.credentials ?? {};
  sessionStore.set(sessionId, {
    credentials: {
      ...current,
      ...credentials,
    },
    updatedAt: Date.now(),
  });
}

export function clearRegistrarConnection(sessionId: string, registrar: keyof RegistrarCredentials) {
  cleanupExpiredSessions();
  const current = sessionStore.get(sessionId);
  if (!current) return;

  const next = { ...current.credentials };
  delete next[registrar];
  sessionStore.set(sessionId, {
    credentials: next,
    updatedAt: Date.now(),
  });
}
