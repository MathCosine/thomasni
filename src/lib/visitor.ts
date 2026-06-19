import crypto from "node:crypto";

// Anonymous, per-browser id used to keep "one heart per visitor".
export const VISITOR_COOKIE = "mc_visitor";

export function newVisitorId(): string {
  return crypto.randomUUID();
}
