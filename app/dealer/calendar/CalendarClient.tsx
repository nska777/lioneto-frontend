"use client";

import { useEffect, useMemo, useState } from "react";

type EventType = "training" | "milestone";

type CalendarEvent = {
  id: string;
  type: EventType;
  title: string;
  dateISO: string; // YYYY-MM-DD
  time?: string; // "16:00"
  durationMin?: number; // for trainings
  location?: string;
  description?: string;

  // training-only
  seatsTotal?: number;
  seatsLeft?: number;
  youJoined?: boolean;

  // reminders (minutes before)
  remindBeforeMin?: number; // e.g. 60
};

const STORAGE_KEY = "lioneto:dealer:calendar:v1";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function monthLabelRU(year: number, monthIndex: number): string {
  const dt = new Date(year, monthIndex, 1);
  return new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" })
    .format(dt)
    .toUpperCase();
}
function weekdayShortRU(): string[] {
  // Monday-first like your screenshot
  return ["Пон", "Вто", "Сре", "Чет", "Пят", "Суб", "Вос"];
}
function startOfMonthGrid(year: number, monthIndex: number): Date {
  const first = new Date(year, monthIndex, 1);
  const day = first.getDay(); // 0 Sun..6 Sat
  const mondayBased = (day + 6) % 7; // Mon=0..Sun=6
  const start = new Date(year, monthIndex, 1 - mondayBased);
  start.setHours(0, 0, 0, 0);
  return start;
}
function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function safeParse(raw: string | null): CalendarEvent[] {
  if (!raw) return [];
  try {
    const v: unknown = JSON.parse(raw);
    if (!Array.isArray(v)) return [];
    return v
      .map((x): CalendarEvent | null => {
        if (!x || typeof x !== "object") return null;
        const r = x as Record<string, unknown>;
        const id = typeof r.id === "string" ? r.id : "";
        const type =
          r.type === "training" || r.type === "milestone" ? r.type : null;
        const title = typeof r.title === "string" ? r.title : "";
        const dateISO = typeof r.dateISO === "string" ? r.dateISO : "";
        if (!id || !type || !title || !dateISO) return null;

        const time = typeof r.time === "string" ? r.time : undefined;
        const durationMin =
          typeof r.durationMin === "number" ? r.durationMin : undefined;
        const location =
          typeof r.location === "string" ? r.location : undefined;
        const description =
          typeof r.description === "string" ? r.description : undefined;
        const seatsTotal =
          typeof r.seatsTotal === "number" ? r.seatsTotal : undefined;
        const seatsLeft =
          typeof r.seatsLeft === "number" ? r.seatsLeft : undefined;
        const youJoined =
          typeof r.youJoined === "boolean" ? r.youJoined : undefined;
        const remindBeforeMin =
          typeof r.remindBeforeMin === "number" ? r.remindBeforeMin : undefined;

        return {
          id,
          type,
          title,
          dateISO,
          time,
          durationMin,
          location,
          description,
          seatsTotal,
          seatsLeft,
          youJoined,
          remindBeforeMin,
        };
      })
      .filter((x): x is CalendarEvent => !!x);
  } catch {
    return [];
  }
}

function todayISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return toISODate(d);
}

function parseDateTime(dateISO: string, time?: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateISO);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const da = Number(m[3]);
  let hh = 9;
  let mm = 0;
  if (time) {
    const t = /^(\d{2}):(\d{2})$/.exec(time);
    if (t) {
      hh = Number(t[1]);
      mm = Number(t[2]);
    }
  }
  const dt = new Date(y, mo, da, hh, mm, 0, 0);
  return dt;
}

function formatHuman(dateISO: string, time?: string): string {
  const dt = parseDateTime(dateISO, time);
  if (!dt) return dateISO;
  const d = new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(dt);
  return time ? `${d} • ${time}` : d;
}

function GoldDot({ type }: { type: EventType }) {
  const bg =
    type === "training"
      ? "radial-gradient(120% 140% at 30% 20%, rgba(232,208,148,0.85) 0%, rgba(189,160,86,0.95) 55%, rgba(128,98,40,0.95) 100%)"
      : "radial-gradient(120% 140% at 30% 20%, rgba(255,240,200,0.85) 0%, rgba(232,208,148,0.75) 45%, rgba(0,0,0,0.12) 100%)";

  return (
    <span
      className="inline-flex h-2.5 w-2.5 rounded-full"
      style={{ background: bg }}
      aria-hidden="true"
    />
  );
}

function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-black/25"
      />
      <div className="absolute left-1/2 top-1/2 w-[min(720px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2">
        <div
          className="rounded-[18px] border bg-white shadow-[0_22px_70px_-34px_rgba(0,0,0,0.35)]"
          style={{ borderColor: "rgba(189, 160, 86, 0.22)" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function PrimaryBtn({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
        "bg-[#F3EBD2] text-black hover:bg-[#efe4c6]",
        "disabled:cursor-not-allowed disabled:opacity-60",
      )}
      style={{ borderColor: "rgba(189, 160, 86, 0.28)" }}
    >
      {children}
    </button>
  );
}

function GhostBtn({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-black/70 hover:text-black transition-colors"
    >
      {children}
    </button>
  );
}

type Toast = { id: string; text: string };

function addToast(
  setToasts: React.Dispatch<React.SetStateAction<Toast[]>>,
  text: string,
) {
  const t: Toast = { id: makeId(), text };
  setToasts((p) => [t, ...p].slice(0, 3));
  window.setTimeout(() => {
    setToasts((p) => p.filter((x) => x.id !== t.id));
  }, 4200);
}

/**
 * Simple in-app reminders:
 * - Works only while page/tab is open.
 * - For real notifications we also give ICS link.
 */
function useInAppReminders(
  events: CalendarEvent[],
  onReminder: (msg: string) => void,
) {
  useEffect(() => {
    const joinedTrainings = events.filter(
      (e) => e.type === "training" && e.youJoined,
    );
    if (joinedTrainings.length === 0) return;

    const timers: number[] = [];

    const nowMs = Date.now();
    joinedTrainings.forEach((e) => {
      const before =
        typeof e.remindBeforeMin === "number" ? e.remindBeforeMin : 60;
      const dt = parseDateTime(e.dateISO, e.time);
      if (!dt) return;

      const fireAt = dt.getTime() - before * 60_000;
      const delay = fireAt - nowMs;
      if (delay <= 0) return;

      const id = window.setTimeout(() => {
        onReminder(`Напоминание: ${e.title}${e.time ? ` • ${e.time}` : ""}`);
      }, delay);

      timers.push(id);
    });

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [events, onReminder]);
}

export default function CalendarClient() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedISO, setSelectedISO] = useState<string>(todayISO());
  const [openDay, setOpenDay] = useState(false);

  const [monthCursor, setMonthCursor] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() }; // monthIndex
  });

  const [toasts, setToasts] = useState<Toast[]>([]);

  // initial load
  useEffect(() => {
    const loaded = safeParse(localStorage.getItem(STORAGE_KEY));

    // If empty, seed minimal demo (like your screenshot)
    if (loaded.length === 0) {
      const iso = todayISO();
      const seed: CalendarEvent[] = [
        {
          id: makeId(),
          type: "training",
          title: "Тренинг по коллекции SCANDY",
          dateISO: iso,
          time: "16:00",
          durationMin: 60,
          location: "Showroom / Online",
          description: "Обзор коллекции, фишки продаж, ответы на вопросы.",
          seatsTotal: 20,
          seatsLeft: 12,
          youJoined: false,
          remindBeforeMin: 60,
        },
        {
          id: makeId(),
          type: "milestone",
          title: "Знаменательная дата: открытие экспозиции",
          dateISO: iso,
          description: "Отметьте важные даты и события.",
        },
      ];
      setEvents(seed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return;
    }

    setEvents(loaded);

    // Set cursor to month of first selected day
    const dt = parseDateTime(todayISO(), "09:00");
    if (dt) setMonthCursor({ y: dt.getFullYear(), m: dt.getMonth() });
  }, []);

  // persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  useInAppReminders(events, (msg) => addToast(setToasts, msg));

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((e) => {
      const list = map.get(e.dateISO) ?? [];
      list.push(e);
      map.set(e.dateISO, list);
    });
    // Sort: trainings first, then milestone
    map.forEach((list, k) => {
      list.sort((a, b) => {
        const ra = a.type === "training" ? 0 : 1;
        const rb = b.type === "training" ? 0 : 1;
        if (ra !== rb) return ra - rb;
        return (a.time ?? "").localeCompare(b.time ?? "");
      });
      map.set(k, list);
    });
    return map;
  }, [events]);

  const selectedList = eventsByDate.get(selectedISO) ?? [];

  const gridStart = useMemo(
    () => startOfMonthGrid(monthCursor.y, monthCursor.m),
    [monthCursor.y, monthCursor.m],
  );

  const days = useMemo(() => {
    // 6 weeks grid = 42 days
    const arr: { date: Date; iso: string; inMonth: boolean }[] = [];
    for (let i = 0; i < 42; i++) {
      const d = addDays(gridStart, i);
      const iso = toISODate(d);
      arr.push({
        date: d,
        iso,
        inMonth: d.getMonth() === monthCursor.m,
      });
    }
    return arr;
  }, [gridStart, monthCursor.m]);

  function prevMonth() {
    setMonthCursor((p) => {
      const m = p.m - 1;
      if (m < 0) return { y: p.y - 1, m: 11 };
      return { y: p.y, m };
    });
  }
  function nextMonth() {
    setMonthCursor((p) => {
      const m = p.m + 1;
      if (m > 11) return { y: p.y + 1, m: 0 };
      return { y: p.y, m };
    });
  }

  function openDayModal(iso: string) {
    setSelectedISO(iso);
    setOpenDay(true);
  }

  function joinTraining(id: string) {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        if (e.type !== "training") return e;
        if (e.youJoined) return e;
        const left = typeof e.seatsLeft === "number" ? e.seatsLeft : undefined;
        const nextLeft =
          typeof left === "number" ? Math.max(0, left - 1) : left;
        return { ...e, youJoined: true, seatsLeft: nextLeft };
      }),
    );
    addToast(
      setToasts,
      "Вы записались на тренинг. Добавьте в календарь для уведомлений.",
    );
  }

  function cancelTraining(id: string) {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        if (e.type !== "training") return e;
        if (!e.youJoined) return e;
        const left = typeof e.seatsLeft === "number" ? e.seatsLeft : undefined;
        const total =
          typeof e.seatsTotal === "number" ? e.seatsTotal : undefined;
        const nextLeft =
          typeof left === "number"
            ? typeof total === "number"
              ? Math.min(total, left + 1)
              : left + 1
            : left;
        return { ...e, youJoined: false, seatsLeft: nextLeft };
      }),
    );
    addToast(setToasts, "Запись отменена.");
  }

  function addMilestoneForSelected() {
    const id = makeId();
    const ev: CalendarEvent = {
      id,
      type: "milestone",
      title: "Знаменательное событие",
      dateISO: selectedISO,
      description: "Добавьте описание события.",
    };
    setEvents((p) => [ev, ...p]);
    addToast(
      setToasts,
      "Событие добавлено. Откройте и отредактируйте название.",
    );
  }

  function updateEventTitle(id: string, title: string) {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, title } : e)));
  }
  function updateEventDesc(id: string, description: string) {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, description } : e)),
    );
  }
  function deleteEvent(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    addToast(setToasts, "Событие удалено.");
  }

  return (
    <div className="space-y-6">
      {/* Toasts */}
      <div className="fixed left-1/2 top-[16px] z-[99999] w-[min(520px,calc(100vw-24px))] -translate-x-1/2 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="rounded-[14px] border border-black/10 bg-white px-4 py-3 text-sm text-black shadow-[0_18px_40px_-28px_rgba(0,0,0,0.35)]"
          >
            {t.text}
          </div>
        ))}
      </div>

      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-black/45">Dealer Portal</div>
          <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-black">
            Календарь мероприятий
          </h1>
          <p className="mt-1 text-sm text-black/55">
            Тренинги, записи, важные даты. Для настоящих уведомлений —
            добавляйте событие в календарь (ICS).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <GhostBtn onClick={() => openDayModal(todayISO())}>Сегодня</GhostBtn>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Calendar */}
        <section
          className="rounded-[18px] border bg-white p-5"
          style={{ borderColor: "rgba(189, 160, 86, 0.22)" }}
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              className="cursor-pointer rounded-full border border-black/10 bg-white px-3 py-2 text-sm text-black/70 hover:text-black transition-colors"
            >
              ←
            </button>

            <div className="text-[14px] font-extrabold tracking-[0.14em] text-black">
              {monthLabelRU(monthCursor.y, monthCursor.m)}
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="cursor-pointer rounded-full border border-black/10 bg-white px-3 py-2 text-sm text-black/70 hover:text-black transition-colors"
            >
              →
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-2">
            {weekdayShortRU().map((w) => (
              <div
                key={w}
                className="px-2 pb-1 text-[11px] font-semibold tracking-[0.12em] text-black/45"
              >
                {w}
              </div>
            ))}

            {days.map((d) => {
              const isToday = d.iso === todayISO();
              const isSelected = d.iso === selectedISO;
              const list = eventsByDate.get(d.iso) ?? [];

              return (
                <button
                  key={d.iso}
                  type="button"
                  onClick={() => openDayModal(d.iso)}
                  className={cn(
                    "cursor-pointer rounded-[14px] border p-2 text-left",
                    "transition-colors duration-200 hover:bg-black/[0.02]",
                    d.inMonth ? "bg-white" : "bg-black/[0.01]",
                    isSelected && "bg-[#F3EBD2]",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
                  )}
                  style={{
                    borderColor: isSelected
                      ? "rgba(189, 160, 86, 0.28)"
                      : "rgba(0,0,0,0.10)",
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={cn(
                        "text-sm font-semibold",
                        d.inMonth ? "text-black" : "text-black/35",
                      )}
                    >
                      {d.date.getDate()}
                    </div>

                    {isToday ? (
                      <span
                        className="inline-flex h-2 w-2 rounded-full"
                        style={{
                          background:
                            "radial-gradient(120% 140% at 30% 20%, rgba(232,208,148,0.85) 0%, rgba(189,160,86,0.95) 55%, rgba(128,98,40,0.95) 100%)",
                        }}
                        aria-label="Сегодня"
                      />
                    ) : null}
                  </div>

                  {list.length ? (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {list.slice(0, 3).map((e) => (
                        <span
                          key={e.id}
                          className="inline-flex items-center gap-1"
                        >
                          <GoldDot type={e.type} />
                        </span>
                      ))}
                      {list.length > 3 ? (
                        <span className="text-[11px] font-semibold text-black/45">
                          +{list.length - 3}
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <div className="mt-2 text-[11px] text-black/30">—</div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Right panel: selected day preview */}
        <aside
          className="rounded-[18px] border bg-white p-5"
          style={{ borderColor: "rgba(189, 160, 86, 0.22)" }}
        >
          <div className="text-sm text-black/45">Выбранный день</div>
          <div className="mt-1 text-[16px] font-semibold text-black">
            {formatHuman(selectedISO)}
          </div>

          <div className="mt-4 space-y-2">
            {selectedList.length === 0 ? (
              <div className="rounded-[14px] border border-black/10 bg-white px-4 py-3 text-sm text-black/55">
                На этот день ничего не запланировано.
              </div>
            ) : (
              selectedList.map((e) => (
                <div
                  key={e.id}
                  className="rounded-[14px] border border-black/10 bg-white px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <GoldDot type={e.type} />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-black">
                        {e.title}
                      </div>
                      <div className="mt-1 text-xs text-black/45">
                        {e.type === "training"
                          ? `${e.time ?? "—"} • ${
                              typeof e.durationMin === "number"
                                ? `${e.durationMin} мин`
                                : ""
                            }`
                          : "Событие"}
                      </div>
                    </div>
                  </div>

                  {e.type === "training" ? (
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="text-xs text-black/55">
                        {typeof e.seatsLeft === "number" &&
                        typeof e.seatsTotal === "number"
                          ? `Мест: ${e.seatsLeft}/${e.seatsTotal}`
                          : "—"}
                      </div>
                      <PrimaryBtn onClick={() => openDayModal(selectedISO)}>
                        Открыть
                      </PrimaryBtn>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <GhostBtn onClick={() => openDayModal(selectedISO)}>
                        Открыть
                      </GhostBtn>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="mt-4">
            <PrimaryBtn onClick={addMilestoneForSelected}>
              + Добавить событие
            </PrimaryBtn>
          </div>
        </aside>
      </div>

      {/* Day modal */}
      <Modal open={openDay} onClose={() => setOpenDay(false)}>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm text-black/45">Календарь</div>
              <div className="mt-1 text-[18px] font-semibold text-black">
                {formatHuman(selectedISO)}
              </div>
              <div className="mt-1 text-sm text-black/55">
                Тренинги и события на выбранный день.
              </div>
            </div>

            <GhostBtn onClick={() => setOpenDay(false)}>Закрыть</GhostBtn>
          </div>

          <div className="mt-4 space-y-3">
            {selectedList.length === 0 ? (
              <div className="rounded-[14px] border border-black/10 bg-white px-4 py-3 text-sm text-black/55">
                На этот день пока ничего нет.
              </div>
            ) : (
              selectedList.map((e) => (
                <div
                  key={e.id}
                  className="rounded-[16px] border border-black/10 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <GoldDot type={e.type} />
                        <div className="truncate text-sm font-semibold text-black">
                          {e.title}
                        </div>
                      </div>

                      <div className="mt-1 text-xs text-black/45">
                        {e.type === "training" ? (
                          <>
                            {e.time ?? "—"}
                            {typeof e.durationMin === "number"
                              ? ` • ${e.durationMin} мин`
                              : ""}
                            {e.location ? ` • ${e.location}` : ""}
                          </>
                        ) : (
                          <>Знаменательное событие</>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`/dealer/calendar/ics?eventId=${encodeURIComponent(e.id)}`}
                        className="cursor-pointer rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-black/70 hover:text-black transition-colors"
                      >
                        Добавить в календарь
                      </a>
                      <button
                        type="button"
                        onClick={() => deleteEvent(e.id)}
                        className="cursor-pointer rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-black/60 hover:text-black transition-colors"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>

                  {e.type === "training" ? (
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm text-black/70">
                        {typeof e.seatsLeft === "number" &&
                        typeof e.seatsTotal === "number"
                          ? `Свободных мест: ${e.seatsLeft} из ${e.seatsTotal}`
                          : "—"}
                      </div>

                      <div className="flex items-center gap-2">
                        {e.youJoined ? (
                          <>
                            <GhostBtn onClick={() => cancelTraining(e.id)}>
                              Отменить запись
                            </GhostBtn>
                            <PrimaryBtn
                              onClick={() =>
                                addToast(
                                  setToasts,
                                  "Ок. Напоминание будет показано в приложении и через ваш календарь (ICS).",
                                )
                              }
                            >
                              Напоминание
                            </PrimaryBtn>
                          </>
                        ) : (
                          <PrimaryBtn
                            disabled={
                              typeof e.seatsLeft === "number"
                                ? e.seatsLeft <= 0
                                : false
                            }
                            onClick={() => joinTraining(e.id)}
                          >
                            Записаться на тренинг
                          </PrimaryBtn>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {/* Editable description for milestone */}
                  <div className="mt-3 space-y-2">
                    {e.type === "milestone" ? (
                      <>
                        <input
                          value={e.title}
                          onChange={(ev) =>
                            updateEventTitle(e.id, ev.target.value)
                          }
                          className="w-full cursor-pointer rounded-[14px] border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-black outline-none focus:border-black/20"
                          placeholder="Название события…"
                        />
                        <textarea
                          value={e.description ?? ""}
                          onChange={(ev) =>
                            updateEventDesc(e.id, ev.target.value)
                          }
                          className="min-h-[120px] w-full cursor-pointer resize-y rounded-[14px] border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-black/35 focus:border-black/20"
                          placeholder="Описание / заметки…"
                        />
                      </>
                    ) : (
                      <div className="text-sm text-black/60">
                        {e.description ?? ""}
                      </div>
                    )}
                  </div>

                  {/* Reminder selector */}
                  {e.type === "training" ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <div className="text-xs font-semibold tracking-[0.12em] text-black/45">
                        НАПОМИНАНИЕ:
                      </div>
                      {[15, 30, 60, 120].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() =>
                            setEvents((prev) =>
                              prev.map((x) =>
                                x.id === e.id
                                  ? { ...x, remindBeforeMin: m }
                                  : x,
                              ),
                            )
                          }
                          className={cn(
                            "cursor-pointer rounded-full border px-3 py-2 text-xs font-semibold tracking-[0.06em] transition-colors",
                            "border-black/10 bg-white text-black/65 hover:text-black",
                            (e.remindBeforeMin ?? 60) === m &&
                              "bg-[#F3EBD2] border-[#E4D9B8] text-black",
                          )}
                        >
                          {m} мин
                        </button>
                      ))}
                      <div className="text-xs text-black/45">
                        (встроенное — работает при открытой вкладке; лучше
                        добавить в календарь)
                      </div>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <PrimaryBtn onClick={addMilestoneForSelected}>+ Событие</PrimaryBtn>
            <GhostBtn onClick={() => setOpenDay(false)}>Готово</GhostBtn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
