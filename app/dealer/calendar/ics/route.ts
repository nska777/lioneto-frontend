// app/dealer/calendar/ics/route.ts
import { NextResponse } from "next/server";

type CalendarEvent = {
  id: string;
  type: "training" | "milestone";
  title: string;
  dateISO: string; // YYYY-MM-DD
  time?: string; // HH:mm
  durationMin?: number;
  location?: string;
  description?: string;
};

const STORAGE_HINT = `
This ICS endpoint is a mock generator.
In production, generate ICS from Strapi/DB.
`;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function toUTCStamp(dateISO: string, time?: string): string {
  // Treat provided date/time as local time; convert to UTC for ICS.
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
  const utcY = local.getUTCFullYear();
  const utcM = local.getUTCMonth() + 1;
  const utcD = local.getUTCDate();
  const utcH = local.getUTCHours();
  const utcMin = local.getUTCMinutes();
  return `${utcY}${pad2(utcM)}${pad2(utcD)}T${pad2(utcH)}${pad2(utcMin)}00Z`;
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
  const utcY = local.getUTCFullYear();
  const utcM = local.getUTCMonth() + 1;
  const utcD = local.getUTCDate();
  const utcH = local.getUTCHours();
  const utcMin = local.getUTCMinutes();
  return `${utcY}${pad2(utcM)}${pad2(utcD)}T${pad2(utcH)}${pad2(utcMin)}00Z`;
}

function escapeICS(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

// Minimal mock store (you will later replace with Strapi)
const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: "demo-scandy",
    type: "training",
    title: "Тренинг по коллекции SCANDY",
    dateISO: "2024-02-05",
    time: "16:00",
    durationMin: 60,
    location: "Showroom / Online",
    description: "Обзор коллекции, фишки продаж, ответы на вопросы.",
  },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId") ?? "";

  const ev = MOCK_EVENTS.find((x) => x.id === eventId);

  // If not found, still return something (avoid 500)
  const e: CalendarEvent =
    ev ??
    ({
      id: eventId || "unknown",
      type: "training",
      title: "Тренинг (demo)",
      dateISO: "2024-02-05",
      time: "16:00",
      durationMin: 60,
      location: "Dealer Portal",
      description: STORAGE_HINT,
    } as CalendarEvent);

  const dtStart = toUTCStamp(e.dateISO, e.time);
  const dtEnd = addMinutesUTCStamp(e.dateISO, e.time, e.durationMin ?? 60);

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LIONETO//Dealer Portal//RU",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${escapeICS(e.id)}@lioneto`,
    `DTSTAMP:${toUTCStamp(e.dateISO, "00:00")}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeICS(e.title)}`,
    e.location ? `LOCATION:${escapeICS(e.location)}` : "",
    e.description ? `DESCRIPTION:${escapeICS(e.description)}` : "",
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
        e.id
      )}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}