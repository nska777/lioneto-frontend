import { NextResponse } from "next/server";
import { getDealerCalendarEventById } from "@/app/lib/dealer/calendar";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function toUTCStamp(dateISO: string, time?: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateISO);
  if (!m) return "19700101T000000Z";

  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);

  let hh = 9;
  let mm = 0;

  if (time) {
    const t = /^(\d{2}):(\d{2})$/.exec(time);
    if (t) {
      hh = Number(t[1]);
      mm = Number(t[2]);
    }
  }

  const local = new Date(y, mo, d, hh, mm, 0, 0);

  return `${local.getUTCFullYear()}${pad2(local.getUTCMonth() + 1)}${pad2(
    local.getUTCDate(),
  )}T${pad2(local.getUTCHours())}${pad2(local.getUTCMinutes())}00Z`;
}

function addMinutesUTCStamp(dateISO: string, time: string | undefined, addMin: number): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateISO);
  if (!m) return "19700101T000000Z";

  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);

  let hh = 9;
  let mm = 0;

  if (time) {
    const t = /^(\d{2}):(\d{2})$/.exec(time);
    if (t) {
      hh = Number(t[1]);
      mm = Number(t[2]);
    }
  }

  const local = new Date(y, mo, d, hh, mm, 0, 0);
  local.setMinutes(local.getMinutes() + addMin);

  return `${local.getUTCFullYear()}${pad2(local.getUTCMonth() + 1)}${pad2(
    local.getUTCDate(),
  )}T${pad2(local.getUTCHours())}${pad2(local.getUTCMinutes())}00Z`;
}

function escapeICS(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId") ?? "";

  const event = await getDealerCalendarEventById(eventId);

  if (!event) {
    return new NextResponse("Event not found", { status: 404 });
  }

  const durationMin = event.durationMin ?? 60;
  const dtStart = toUTCStamp(event.dateISO, event.time);
  const dtEnd = addMinutesUTCStamp(event.dateISO, event.time, durationMin);

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LIONETO//Dealer Portal//RU",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${escapeICS(event.id)}@lioneto`,
    `DTSTAMP:${toUTCStamp(event.dateISO, "00:00")}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeICS(event.title)}`,
    event.location ? `LOCATION:${escapeICS(event.location)}` : "",
    event.description ? `DESCRIPTION:${escapeICS(event.description)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="lioneto-event-${encodeURIComponent(
        event.id,
      )}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}