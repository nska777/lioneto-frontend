import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL =
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "http://localhost:1337";

const STRAPI_TOKEN =
  process.env.STRAPI_DEALER_TOKEN ||
  process.env.STRAPI_API_TOKEN ||
  "";

function getSafeFileName(value: string): string {
  return value.replace(/[\\/:*?"<>|]+/g, "_").trim() || "file";
}

function joinWithStrapi(pathname: string): string {
  const base = STRAPI_URL.replace(/\/+$/, "");
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${path}`;
}

function resolveTargetUrl(fileUrl: string): string {
  const trimmed = fileUrl.trim();

  if (!trimmed) return "";

  if (trimmed.startsWith("/")) {
    return joinWithStrapi(trimmed);
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const parsed = new URL(trimmed);

      if (parsed.pathname.startsWith("/uploads/")) {
        return joinWithStrapi(parsed.pathname);
      }

      return trimmed;
    } catch {
      return trimmed;
    }
  }

  return joinWithStrapi(trimmed);
}

export async function GET(request: NextRequest) {
  const fileUrl = request.nextUrl.searchParams.get("url");
  const fileNameParam = request.nextUrl.searchParams.get("name");

  if (!fileUrl) {
    return NextResponse.json(
      { error: "Missing file url" },
      { status: 400 },
    );
  }

  const targetUrl = resolveTargetUrl(fileUrl);

  if (!targetUrl) {
    return NextResponse.json(
      { error: "Invalid file url" },
      { status: 400 },
    );
  }

  const upstream = await fetch(targetUrl, {
    headers: {
      ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
    },
    cache: "no-store",
  });

  if (!upstream.ok) {
    return NextResponse.json(
      {
        error: `Failed to fetch file: ${upstream.status}`,
        debug: {
          originalUrl: fileUrl,
          targetUrl,
        },
      },
      { status: upstream.status },
    );
  }

  const contentType =
    upstream.headers.get("content-type") || "application/octet-stream";

  const arrayBuffer = await upstream.arrayBuffer();

  let fileName =
    fileNameParam?.trim() ||
    targetUrl.split("/").pop() ||
    "file";

  try {
    fileName = decodeURIComponent(fileName);
  } catch {}

  fileName = getSafeFileName(fileName);

  return new NextResponse(arrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
      "Cache-Control": "no-store",
    },
  });
}