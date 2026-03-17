import type { NextRequest } from "next/server";

export function getRequestIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0];
    return first ? first.trim() : "";
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "";
}

export function getRequestUserAgent(req: NextRequest): string {
  return req.headers.get("user-agent") || "";
}