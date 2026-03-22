"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { DealerCalendarEvent } from "@/app/lib/dealer/calendar";

type Props = {
  initialEvents: DealerCalendarEvent[];
  initialDate?: string;
  initialEventId?: string;
  initialApplyOpen?: boolean;
};

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function monthLabelRU(year: number, monthIndex: number): string {
  return new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  })
    .format(new Date(year, monthIndex, 1))
    .toUpperCase();
}

function weekdayShortRU(): string[] {
  return ["Пон", "Вто", "Сре", "Чет", "Пят", "Суб", "Вос"];
}

function startOfMonthGrid(year: number, monthIndex: number): Date {
  const first = new Date(year, monthIndex, 1);
  const day = first.getDay();
  const mondayBased = (day + 6) % 7;
  const start = new Date(year, monthIndex, 1 - mondayBased);
  start.setHours(0, 0, 0, 0);
  return start;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
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

  let hh = 12;
  let mm = 0;

  if (time) {
    const t = /^(\d{2}):(\d{2})$/.exec(time);
    if (t) {
      hh = Number(t[1]);
      mm = Number(t[2]);
    }
  }

  return new Date(y, mo, da, hh, mm, 0, 0);
}

function parseInitialDate(dateISO?: string): Date | null {
  if (!dateISO) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateISO);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);

  const date = new Date(year, month, day);
  if (Number.isNaN(date.getTime())) return null;

  date.setHours(0, 0, 0, 0);
  return date;
}

function formatHuman(dateISO: string, time?: string): string {
  const dt = parseDateTime(dateISO, time);
  if (!dt) return dateISO;

  const datePart = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dt);

  return time ? `${datePart} • ${time}` : datePart;
}

function eventTypeLabel(type: DealerCalendarEvent["type"]): string {
  switch (type) {
    case "training":
      return "Обучение";
    case "webinar":
      return "Вебинар";
    case "meeting":
      return "Встреча";
    case "exhibition":
      return "Выставка";
    case "important":
      return "Важная дата";
    case "industry":
      return "Отраслевое событие";
    default:
      return "Событие";
  }
}

function eventTypeBadgeClass(type: DealerCalendarEvent["type"]): string {
  switch (type) {
    case "training":
      return "bg-[#F6EBCF] text-[#6E5520] border-[#E7D8A8]";
    case "webinar":
      return "bg-[#EEF2FF] text-[#3949AB] border-[#D8DFFA]";
    case "meeting":
      return "bg-[#EEF8F0] text-[#2F6B43] border-[#CFE6D5]";
    case "exhibition":
      return "bg-[#FFF1EC] text-[#A9552B] border-[#F4D4C5]";
    case "important":
      return "bg-[#FFF8E7] text-[#8A6A00] border-[#ECDDA7]";
    case "industry":
      return "bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]";
    default:
      return "bg-[#F6EBCF] text-[#6E5520] border-[#E7D8A8]";
  }
}

function dotClass(type: DealerCalendarEvent["type"]): string {
  switch (type) {
    case "training":
      return "bg-[#C9A858]";
    case "webinar":
      return "bg-[#6C7BFF]";
    case "meeting":
      return "bg-[#4BAE6E]";
    case "exhibition":
      return "bg-[#E38A5D]";
    case "important":
      return "bg-[#D8B64C]";
    case "industry":
      return "bg-[#9CA3AF]";
    default:
      return "bg-[#C9A858]";
  }
}

function eventRank(type: DealerCalendarEvent["type"]): number {
  switch (type) {
    case "training":
      return 0;
    case "webinar":
      return 1;
    case "meeting":
      return 2;
    case "exhibition":
      return 3;
    case "important":
      return 4;
    case "industry":
      return 5;
    default:
      return 9;
  }
}

function splitEmployees(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function IconBtn({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-sm text-black/70 transition hover:text-black"
    >
      {children}
    </button>
  );
}

function PrimaryBtn({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-full border border-emerald-600 bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-600"
    >
      {children}
    </button>
  );
}

function GhostBtn({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-black/70 transition hover:text-black"
    >
      {children}
    </button>
  );
}

function EventModal({
  event,
  onClose,
  onApply,
}: {
  event: DealerCalendarEvent | null;
  onClose: () => void;
  onApply: () => void;
}) {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
        aria-label="Закрыть"
      />
      <div className="absolute left-1/2 top-1/2 w-[min(680px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2">
        <div className="rounded-[20px] border border-[#EADFC1] bg-white p-5 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.35)]">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div
                className={cn(
                  "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                  eventTypeBadgeClass(event.type),
                )}
              >
                {eventTypeLabel(event.type)}
              </div>

              <h2 className="mt-3 text-[20px] font-semibold tracking-[-0.03em] text-black">
                {event.title}
              </h2>

              <div className="mt-2 text-xs text-black/55">
                {formatHuman(event.dateISO, event.time)}
                {event.durationMin ? ` • ${event.durationMin} мин` : ""}
                {event.location ? ` • ${event.location}` : ""}
              </div>
            </div>

            <GhostBtn onClick={onClose}>Закрыть</GhostBtn>
          </div>

          {event.description ? (
            <div className="mt-4 rounded-[16px] border border-black/10 bg-[#FAFAF8] px-4 py-3 text-sm leading-6 text-black/70">
              {event.description}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2.5">
            <a
              href={`/dealer/calendar/ics?eventId=${encodeURIComponent(event.id)}`}
              className="inline-flex items-center justify-center rounded-full border border-[#E4D9B8] bg-[#F3EBD2] px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-[#ECE1BF]"
            >
              Добавить в календарь
            </a>

            {event.meetingUrl ? (
              <a
                href={event.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-black/70 transition hover:text-black"
              >
                Открыть ссылку
              </a>
            ) : null}

            {(event.type === "training" || event.type === "webinar") &&
            event.isRegistrationOpen ? (
              <PrimaryBtn onClick={onApply}>Подать заявку</PrimaryBtn>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function RegisterModal({
  event,
  employeesText,
  comment,
  isSubmitting,
  error,
  success,
  onChangeEmployees,
  onChangeComment,
  onClose,
  onSubmit,
}: {
  event: DealerCalendarEvent | null;
  employeesText: string;
  comment: string;
  isSubmitting: boolean;
  error: string | null;
  success: string | null;
  onChangeEmployees: (value: string) => void;
  onChangeComment: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-xl rounded-[24px] border border-[#EADFC1] bg-white p-5 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.35)]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div
              className={cn(
                "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                eventTypeBadgeClass(event.type),
              )}
            >
              {eventTypeLabel(event.type)}
            </div>

            <h3 className="mt-3 text-[20px] font-semibold tracking-[-0.03em] text-black">
              Подать заявку
            </h3>

            <p className="mt-1 text-sm text-black/70">{event.title}</p>

            <p className="mt-1 text-xs text-black/45">
              {formatHuman(event.dateISO, event.time)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-sm text-black/60 transition hover:text-black"
            aria-label="Закрыть форму"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-black">
              ФИО сотрудника
            </label>
            <textarea
              value={employeesText}
              onChange={(e) => onChangeEmployees(e.target.value)}
              placeholder={`Иванов Иван Иванович`}
              rows={1}
              className="w-full rounded-[18px] border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-black/35 focus:border-[#22C55E]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-black">
              Комментарий
            </label>
            <textarea
              value={comment}
              onChange={(e) => onChangeComment(e.target.value)}
              placeholder="Дополнительная информация по заявке"
              rows={2}
              className="w-full rounded-[18px] border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-black/35 focus:border-[#22C55E]"
            />
          </div>

          {error ? (
            <div className="rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-[16px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 bg-white px-4 text-sm font-medium text-black/70 transition hover:text-black"
            >
              Отмена
            </button>

            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="inline-flex h-11 items-center justify-center rounded-full border border-emerald-600 bg-emerald-500 px-5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Отправка..." : "Отправить заявку"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CalendarClient({
  initialEvents,
  initialDate,
  initialEventId,
  initialApplyOpen = false,
}: Props) {
  const today = new Date();
  const initialSelectedDate = parseInitialDate(initialDate) ?? today;
  const autoApplyOpenedRef = useRef(false);

  const [monthCursor, setMonthCursor] = useState({
    y: initialSelectedDate.getFullYear(),
    m: initialSelectedDate.getMonth(),
  });
  const [selectedISO, setSelectedISO] = useState(
    toISODate(initialSelectedDate),
  );
  const [activeEventId, setActiveEventId] = useState<string | null>(
    initialEventId ?? null,
  );

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [employeesText, setEmployeesText] = useState("");
  const [registerComment, setRegisterComment] = useState("");
  const [isSubmittingRegister, setIsSubmittingRegister] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);

  const events = useMemo(() => {
    return [...initialEvents].sort((a, b) => {
      if (a.dateISO !== b.dateISO) return a.dateISO.localeCompare(b.dateISO);
      const rankDiff = eventRank(a.type) - eventRank(b.type);
      if (rankDiff !== 0) return rankDiff;
      return (a.time ?? "").localeCompare(b.time ?? "");
    });
  }, [initialEvents]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, DealerCalendarEvent[]>();

    for (const event of events) {
      const list = map.get(event.dateISO) ?? [];
      list.push(event);
      map.set(event.dateISO, list);
    }

    return map;
  }, [events]);

  const selectedList = eventsByDate.get(selectedISO) ?? [];

  const activeEvent = useMemo(() => {
    if (!activeEventId) return null;
    return events.find((item) => item.id === activeEventId) ?? null;
  }, [activeEventId, events]);

  useEffect(() => {
    if (!initialApplyOpen || autoApplyOpenedRef.current || !activeEvent) return;
    autoApplyOpenedRef.current = true;
    setRegisterError(null);
    setRegisterSuccess(null);
    setEmployeesText("");
    setRegisterComment("");
    setIsRegisterOpen(true);
  }, [initialApplyOpen, activeEvent]);

  const gridStart = useMemo(
    () => startOfMonthGrid(monthCursor.y, monthCursor.m),
    [monthCursor.y, monthCursor.m],
  );

  const days = useMemo(() => {
    const arr: { date: Date; iso: string; inMonth: boolean }[] = [];

    for (let i = 0; i < 42; i++) {
      const date = addDays(gridStart, i);
      arr.push({
        date,
        iso: toISODate(date),
        inMonth: date.getMonth() === monthCursor.m,
      });
    }

    return arr;
  }, [gridStart, monthCursor.m]);

  function openToday() {
    const iso = todayISO();
    setSelectedISO(iso);

    const dt = new Date();
    setMonthCursor({
      y: dt.getFullYear(),
      m: dt.getMonth(),
    });
  }

  function prevMonth() {
    setMonthCursor((prev) => {
      const m = prev.m - 1;
      if (m < 0) return { y: prev.y - 1, m: 11 };
      return { y: prev.y, m };
    });
  }

  function nextMonth() {
    setMonthCursor((prev) => {
      const m = prev.m + 1;
      if (m > 11) return { y: prev.y + 1, m: 0 };
      return { y: prev.y, m };
    });
  }

  function handleOpenApply() {
    setRegisterError(null);
    setRegisterSuccess(null);
    setEmployeesText("");
    setRegisterComment("");
    setIsRegisterOpen(true);
  }

  function handleCloseEventModal() {
    setActiveEventId(null);
    setIsRegisterOpen(false);
    setRegisterError(null);
    setRegisterSuccess(null);
  }

  function handleCloseRegisterModal() {
    setIsRegisterOpen(false);
    setRegisterError(null);
    setRegisterSuccess(null);
  }

  async function handleSubmitRegister() {
    if (!activeEvent) return;

    const employees = splitEmployees(employeesText);

    if (employees.length === 0) {
      setRegisterError("Укажите хотя бы одного сотрудника");
      return;
    }

    try {
      setIsSubmittingRegister(true);
      setRegisterError(null);
      setRegisterSuccess(null);

      const response = await fetch("/api/dealer/calendar/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: activeEvent.id,
          employees,
          comment: registerComment.trim(),
        }),
      });

      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
        details?: string;
        message?: string;
        emailSent?: boolean;
        emailReason?: string | null;
      };

      if (!response.ok || !result.ok) {
        throw new Error(
          result.details || result.error || "Не удалось отправить заявку",
        );
      }

      setRegisterSuccess(
        result.emailSent
          ? "Заявка отправлена. Мы получили вашу заявку."
          : "Заявка сохранена. Письмо пока не отправлено, сделаю как будет доступ.",
      );

      setEmployeesText("");
      setRegisterComment("");
    } catch (error) {
      setRegisterError(
        error instanceof Error ? error.message : "Ошибка отправки заявки",
      );
    } finally {
      setIsSubmittingRegister(false);
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-xs text-black/45">Dealer Portal</div>
          <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.03em] text-black">
            Календарь мероприятий
          </h1>
          <p className="mt-1.5 max-w-[640px] text-xs leading-5 text-black/55">
            Обучения, вебинары, встречи, выставки и важные даты компании.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <GhostBtn onClick={openToday}>Сегодня</GhostBtn>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,760px)_290px] xl:items-start">
        <section className="rounded-[20px] border border-[#EADFC1] bg-white p-4 shadow-[0_18px_60px_-40px_rgba(0,0,0,0.22)]">
          <div className="flex items-center justify-between">
            <IconBtn onClick={prevMonth}>←</IconBtn>

            <div className="text-center">
              <div className="text-[13px] font-extrabold tracking-[0.14em] text-black">
                {monthLabelRU(monthCursor.y, monthCursor.m)}
              </div>
            </div>

            <IconBtn onClick={nextMonth}>→</IconBtn>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-2">
            {weekdayShortRU().map((day) => (
              <div
                key={day}
                className="px-1 pb-1 text-center text-[10px] font-semibold tracking-[0.08em] text-black/40"
              >
                {day}
              </div>
            ))}

            {days.map((day) => {
              const list = eventsByDate.get(day.iso) ?? [];
              const isToday = day.iso === todayISO();
              const isSelected = day.iso === selectedISO;

              return (
                <button
                  key={day.iso}
                  type="button"
                  onClick={() => {
                    setSelectedISO(day.iso);
                    setActiveEventId(null);
                    setIsRegisterOpen(false);
                  }}
                  className={cn(
                    "min-h-[68px] rounded-[14px] border px-2.5 py-2 text-left transition",
                    "hover:bg-[#FAFAF8]",
                    day.inMonth ? "bg-white" : "bg-[#FAFAF8]",
                    isSelected && "bg-[#F8F1DB] ring-2 ring-[#C9A858]/70",
                  )}
                  style={{
                    borderWidth: isSelected ? "2px" : "1px",
                    borderColor: isSelected
                      ? "rgba(201, 168, 88, 0.95)"
                      : "rgba(0,0,0,0.10)",
                  }}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span
                      className={cn(
                        "text-[12px] font-semibold leading-none",
                        day.inMonth ? "text-black" : "text-black/30",
                      )}
                    >
                      {day.date.getDate()}
                    </span>

                    {isToday ? (
                      <span className="inline-flex h-2 w-2 rounded-full bg-[#C9A858]" />
                    ) : null}
                  </div>

                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {list.slice(0, 3).map((event) => (
                      <span
                        key={event.id}
                        className={cn(
                          "inline-flex h-2 w-2 rounded-full",
                          dotClass(event.type),
                        )}
                      />
                    ))}

                    {list.length > 3 ? (
                      <span className="text-[10px] font-semibold text-black/40">
                        +{list.length - 3}
                      </span>
                    ) : null}

                    {list.length === 0 ? (
                      <span className="text-[10px] text-black/25">—</span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="rounded-[20px] border border-[#EADFC1] bg-white p-4 shadow-[0_18px_60px_-40px_rgba(0,0,0,0.22)]">
          <div className="text-xs text-black/45">Выбранный день</div>
          <div className="mt-1 text-[16px] font-semibold tracking-[-0.02em] text-black">
            {formatHuman(selectedISO)}
          </div>

          <div className="mt-4 space-y-2.5">
            {selectedList.length === 0 ? (
              <div className="rounded-[14px] border border-black/10 bg-[#FAFAF8] px-3 py-3 text-xs text-black/55">
                На этот день ничего не запланировано.
              </div>
            ) : (
              selectedList.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => {
                    setActiveEventId(event.id);
                    setIsRegisterOpen(false);
                  }}
                  className="block w-full rounded-[14px] border border-black/10 bg-white p-3 text-left transition hover:bg-[#FAFAF8]"
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="min-w-0">
                      <div
                        className={cn(
                          "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                          eventTypeBadgeClass(event.type),
                        )}
                      >
                        {eventTypeLabel(event.type)}
                      </div>

                      <div className="mt-2 text-xs font-semibold leading-5 text-black">
                        {event.title}
                      </div>

                      <div className="mt-1 text-[11px] leading-4 text-black/50">
                        {event.time ? `${event.time}` : "Без времени"}
                        {event.durationMin ? ` • ${event.durationMin} мин` : ""}
                        {event.location ? ` • ${event.location}` : ""}
                      </div>
                    </div>

                    <span
                      className={cn(
                        "mt-1 inline-flex h-2 w-2 shrink-0 rounded-full",
                        dotClass(event.type),
                      )}
                    />
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>
      </div>

      <EventModal
        event={isRegisterOpen ? null : activeEvent}
        onClose={handleCloseEventModal}
        onApply={handleOpenApply}
      />

      <RegisterModal
        event={isRegisterOpen ? activeEvent : null}
        employeesText={employeesText}
        comment={registerComment}
        isSubmitting={isSubmittingRegister}
        error={registerError}
        success={registerSuccess}
        onChangeEmployees={setEmployeesText}
        onChangeComment={setRegisterComment}
        onClose={handleCloseRegisterModal}
        onSubmit={handleSubmitRegister}
      />
    </div>
  );
}
