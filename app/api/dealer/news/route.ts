import { NextResponse } from "next/server";

import { getDealerNews } from "@/app/lib/dealer/news";

export async function GET() {
  try {
    const items = await getDealerNews();
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load dealer news",
      },
      { status: 500 },
    );
  }
}