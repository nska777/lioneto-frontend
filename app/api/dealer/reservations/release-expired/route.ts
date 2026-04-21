import { NextResponse } from "next/server";
import { releaseExpiredReservations } from "@/app/lib/dealer/reservations";

export async function POST() {
  try {
    const result = await releaseExpiredReservations();

    return NextResponse.json({
      ok: true,
      expiredCount: result.expiredCount,
      expiredIds: result.expiredIds,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to release expired reservations",
      },
      { status: 500 },
    );
  }
}