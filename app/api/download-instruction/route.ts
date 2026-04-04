import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const fileUrl = request.nextUrl.searchParams.get("url");
  const fileName = request.nextUrl.searchParams.get("name") || "instruction.pdf";

  if (!fileUrl) {
    return NextResponse.json({ error: "Missing file url" }, { status: 400 });
  }

  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch file" },
        { status: 502 },
      );
    }

    const contentType =
      response.headers.get("content-type") || "application/octet-stream";
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unexpected download error" },
      { status: 500 },
    );
  }
}