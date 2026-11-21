import crypto from "crypto";
import { cookies } from "next/headers";
export function sha256(value: string) { return crypto.createHash("sha256").update(value).digest("hex"); }
export function randomToken() { return crypto.randomBytes(32).toString("base64url"); }
function sign(value: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is missing.");
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}
