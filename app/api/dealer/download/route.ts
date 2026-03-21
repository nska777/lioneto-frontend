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

export async function GET(request: NextRequest) {
  const fileUrl = request.nextUrl.searchParams.get("url");
  const fileNameParam = request.nextUrl.searchParams.get("name");

  if (!fileUrl) {
    return NextResponse.json(
      { error: "Missing file url" },
      { status: 400 },
    );
  }

  const targetUrl = fileUrl.startsWith("http://") || fileUrl.startsWith("https://")
    ? fileUrl
    : `${STRAPI_URL.replace(/\/+$/, "")}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;

  const upstream = await fetch(targetUrl, {
    headers: {
      ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
    },
    cache: "no-store",
  });

  if (!upstream.ok) {
    return NextResponse.json(
      { error: `Failed to fetch file: ${upstream.status}` },
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

  fileName = getSafeFileName(decodeURIComponent(fileName));

  return new NextResponse(arrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
      "Cache-Control": "no-store",
    },
  });
}