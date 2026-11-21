import crypto from "crypto";
import { cookies } from "next/headers";
export function sha256(value: string) { return crypto.createHash("sha256").update(value).digest("hex"); }
export function randomToken() { return crypto.randomBytes(32).toString("base64url"); }
function sign(value: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is missing.");
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}
export function makeAdminCookie() { const value = randomToken(); return `${value}.${sign(value)}`; }
export function isAdmin() {
  try {
    const raw = cookies().get("santa_admin")?.value;
    if (!raw) return false;
    const [value, signature] = raw.split(".");
    if (!value || !signature) return false;
    const expected = sign(value), suppliedBuffer = Buffer.from(signature), expectedBuffer = Buffer.from(expected);
    return suppliedBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(suppliedBuffer, expectedBuffer);
  } catch { return false; }
}
export function isValidAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(password), b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
