import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { APP_SESSION_COOKIE, SESSION_SECRET } from "./config";

export type AppSessionUser = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  countryCode?: string | null;
};

export function signSession(user: AppSessionUser) {
  return jwt.sign(user, SESSION_SECRET, { expiresIn: "30d" });
}

export function verifySession(token: string): AppSessionUser | null {
  try {
    return jwt.verify(token, SESSION_SECRET) as AppSessionUser;
  } catch {
    return null;
  }
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(APP_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}