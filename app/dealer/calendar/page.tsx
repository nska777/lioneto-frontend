import CalendarClient from "./CalendarClient";
import { getDealerCalendarEvents } from "@/app/lib/dealer/calendar";

type PageProps = {
  searchParams?: Promise<{
    date?: string;
    eventId?: string;
    apply?: string;
  }>;
};

function normalizeInitialDate(value?: string): string | undefined {
  if (!value) return undefined;

  const trimmed = value.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return undefined;
  }

  return trimmed;
}

function normalizeEventId(value?: string): string | undefined {
  if (!value) return undefined;

  const trimmed = value.trim();

  if (!/^\d+$/.test(trimmed)) {
    return undefined;
  }

  return trimmed;
}

function normalizeApply(value?: string): boolean {
  return value === "1";
}

export default async function Page({ searchParams }: PageProps) {
  const [events, params] = await Promise.all([
    getDealerCalendarEvents(),
    searchParams,
  ]);

  const initialDate = normalizeInitialDate(params?.date);
  const initialEventId = normalizeEventId(params?.eventId);
  const initialApplyOpen = normalizeApply(params?.apply);

  return (
    <CalendarClient
      initialEvents={events}
      initialDate={initialDate}
      initialEventId={initialEventId}
      initialApplyOpen={initialApplyOpen}
    />
  );
}
