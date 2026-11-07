import type { MiddlewareHandler } from "npm:hono";

export function getStaffPin(): string | undefined {
  return Deno.env.get("STAFF_PIN")?.trim() || undefined;
}

export const requireStaffPin: MiddlewareHandler = async (c, next) => {
  const staffPin = getStaffPin();

  if (!staffPin) {
    return c.json({ error: "Staff access is not configured" }, 503);
  }

  const headerPin = c.req.header("X-Staff-Pin");
  const bearerPin = /^Bearer[ \t]+(\S+)$/i.exec(c.req.header("Authorization") ?? "")?.[1];

  if (headerPin !== staffPin && bearerPin !== staffPin) {
    c.header("WWW-Authenticate", 'Bearer realm="staff"');
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
};
