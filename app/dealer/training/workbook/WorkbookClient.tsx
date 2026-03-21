"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Note = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  pinned: boolean;
  updatedAt: number;
};

const STORAGE_KEY = "lioneto:dealer:workbook:v1";

function now() {
  return Date.now();
}

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function safeParseNotes(raw: string | null): Note[] {
  if (!raw) return [];

  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];

    return value
      .map((item): Note | null => {
        if (!item || typeof item !== "object") return null;

        const record = item as Record<string, unknown>;
        const id = typeof record.id === "string" ? record.id : "";
        const title = typeof record.title === "string" ? record.title : "";
        const body = typeof record.body === "string" ? record.body : "";
        const tags = Array.isArray(record.tags)
          ? record.tags.filter((tag): tag is string => typeof tag === "string")
          : [];
        const pinned =
          typeof record.pinned === "boolean" ? record.pinned : false;
        const updatedAt =
          typeof record.updatedAt === "number" ? record.updatedAt : 0;

        if (!id) return null;

        return {
          id,
          title,
          body,
          tags,
          pinned,
          updatedAt,
        };
      })
      .filter((item): item is Note => Boolean(item));
  } catch {
    return [];
  }
}

function formatTime(ts: number): string {
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(ts));
  } catch {
    return "";
  }
}

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

function loadNotesOnce(): Note[] {
  if (typeof window === "undefined") return [];
  return safeParseNotes(window.localStorage.getItem(STORAGE_KEY));
}

export default function WorkbookClient() {
  const [notes, setNotes] = useState<Note[]>(() => loadNotesOnce());

  const [activeId, setActiveId] = useState<string | null>(() => {
    const initial = loadNotesOnce();
    return initial[0]?.id ?? null;
  });

  const [query, setQuery] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [newTagInput, setNewTagInput] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const t = filterTag.trim().toLowerCase();

    const base = notes.filter((note) => {
      const okQ =
        !q ||
        note.title.toLowerCase().includes(q) ||
        note.body.toLowerCase().includes(q) ||
        note.tags.some((tag) => tag.toLowerCase().includes(q));

      const okT = !t || note.tags.some((tag) => tag.toLowerCase() === t);

      return okQ && okT;
    });

    const pinned = base
      .filter((note) => note.pinned)
      .sort((a, b) => b.updatedAt - a.updatedAt);

    const rest = base
      .filter((note) => !note.pinned)
      .sort((a, b) => b.updatedAt - a.updatedAt);

    return [...pinned, ...rest];
  }, [filterTag, notes, query]);

  const active = useMemo(
    () => notes.find((note) => note.id === activeId) ?? null,
    [notes, activeId],
  );

  function createNote() {
    const note: Note = {
      id: makeId(),
      title: "Новая заметка",
      body: "",
      tags: [],
      pinned: false,
      updatedAt: now(),
    };

    setNotes((prev) => [note, ...prev]);
    setActiveId(note.id);
    setNewTagInput("");
  }

  function deleteNote(id: string) {
    setNotes((prev) => {
      const next = prev.filter((note) => note.id !== id);

      if (activeId === id) {
        setActiveId(next[0]?.id ?? null);
      }

      return next;
    });
  }

  function updateActive(
    patch: Partial<Pick<Note, "title" | "body" | "tags" | "pinned">>,
  ) {
    if (!active) return;

    setNotes((prev) =>
      prev.map((note) =>
        note.id === active.id
          ? {
              ...note,
              ...patch,
              updatedAt: now(),
            }
          : note,
      ),
    );
  }

  function addTag(tag: string) {
    if (!active) return;

    const clean = tag.trim();
    if (!clean) return;

    const next = Array.from(new Set([...(active.tags ?? []), clean]));
    updateActive({ tags: next });
  }

  function removeTag(tag: string) {
    if (!active) return;
    updateActive({ tags: active.tags.filter((item) => item !== tag) });
  }

  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden rounded-[26px] border border-[#E7DCC2] bg-[linear-gradient(180deg,#fffdf8_0%,#fffaf1_100%)] px-6 py-6 shadow-[0_18px_40px_rgba(61,46,17,0.04)]">
        <span className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(236,218,175,0.34)_0%,rgba(236,218,175,0)_52%)]" />
        <div className="relative z-[1] flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex rounded-full border border-black/10 bg-white/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-black/50">
              Dealer Portal
            </div>
            <h1 className="mt-3 text-[28px] font-semibold tracking-[-0.03em] text-black">
              Рабочая тетрадь
            </h1>
            <p className="mt-2 max-w-[720px] text-sm text-black/55">
              Личные заметки по встречам, возражениям и клиентским кейсам. Всё
              сохраняется на этом устройстве автоматически.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dealer/training"
              className="cursor-pointer rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-black/70 transition-all hover:-translate-y-[1px] hover:text-black hover:shadow-[0_8px_18px_rgba(40,30,10,0.06)]"
            >
              Назад
            </Link>

            <button
              type="button"
              onClick={createNote}
              className="cursor-pointer rounded-full border border-black/10 bg-[#F3EBD2] px-4 py-2 text-sm font-semibold text-black transition-all hover:-translate-y-[1px] hover:bg-[#efe4c6] hover:shadow-[0_8px_18px_rgba(40,30,10,0.08)]"
              style={{ borderColor: "rgba(189, 160, 86, 0.28)" }}
            >
              + Новая заметка
            </button>
          </div>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <aside
          className="rounded-[24px] border bg-[linear-gradient(180deg,#fffdf9_0%,#ffffff_100%)] p-4 shadow-[0_18px_42px_rgba(61,46,17,0.04)]"
          style={{ borderColor: "rgba(189, 160, 86, 0.22)" }}
        >
          <div className="mb-3 inline-flex rounded-full border border-black/10 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-black/50">
            Мои заметки
          </div>

          <div className="flex flex-col gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по заметкам..."
              className="w-full rounded-[14px] border border-[#E4D7B8] bg-white px-3 py-2 text-sm text-black outline-none placeholder:text-black/35 focus:border-[#D9C38C]"
            />

            <input
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              placeholder="Фильтр по тегу (например: возражения)"
              className="w-full rounded-[14px] border border-[#E4D7B8] bg-white px-3 py-2 text-sm text-black outline-none placeholder:text-black/35 focus:border-[#D9C38C]"
            />
          </div>

          <div className="mt-4 space-y-2">
            {filtered.length === 0 ? (
              <div className="rounded-[16px] border border-dashed border-[#D8C79D] bg-[#FFF9EC] px-3 py-4 text-sm text-black/55">
                Пусто. Создайте первую заметку.
              </div>
            ) : (
              filtered.map((note) => {
                const isActive = note.id === activeId;

                return (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => setActiveId(note.id)}
                    className={cn(
                      "w-full cursor-pointer rounded-[16px] border px-3 py-3 text-left transition-all",
                      isActive
                        ? "bg-[#F6EDD6] text-black shadow-[0_10px_22px_rgba(80,60,20,0.06)]"
                        : "bg-white text-black hover:-translate-y-[1px] hover:bg-[#fffdf8] hover:shadow-[0_8px_18px_rgba(40,30,10,0.04)]",
                      "border-black/10",
                    )}
                    style={
                      isActive
                        ? { borderColor: "rgba(189, 160, 86, 0.30)" }
                        : undefined
                    }
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">
                          {note.pinned ? "★ " : ""}
                          {note.title || "Без названия"}
                        </div>

                        <div className="mt-1 truncate text-xs text-black/45">
                          {formatTime(note.updatedAt)}
                          {note.tags.length
                            ? ` • ${note.tags.join(" • ")}`
                            : ""}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section
          className="relative overflow-hidden rounded-[26px] border bg-[linear-gradient(180deg,#fffefb_0%,#fffdfa_100%)] p-0 shadow-[0_18px_42px_rgba(61,46,17,0.04)]"
          style={{ borderColor: "rgba(189, 160, 86, 0.22)" }}
        >
          <span className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(180deg,transparent_0px,transparent_34px,rgba(225,214,184,0.42)_35px)]" />
          <span className="pointer-events-none absolute left-[54px] top-0 h-full w-px bg-[#E8D4C5]" />

          {!active ? (
            <div className="relative z-[1] p-6">
              <div className="rounded-[16px] border border-black/10 bg-white px-4 py-4 text-sm text-black/55">
                Выберите заметку слева или создайте новую.
              </div>
            </div>
          ) : (
            <div className="relative z-[1] p-6 pl-[74px]">
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <input
                    value={active.title}
                    onChange={(e) => updateActive({ title: e.target.value })}
                    className="w-full rounded-[14px] border border-[#E4D7B8] bg-white/90 px-4 py-3 text-[17px] font-semibold text-black outline-none focus:border-[#D9C38C]"
                    placeholder="Название заметки..."
                  />

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateActive({ pinned: !active.pinned })}
                      className={cn(
                        "cursor-pointer rounded-full border px-3 py-2 text-xs font-semibold tracking-[0.08em] transition-all",
                        "border-black/10 bg-white text-black/70 hover:-translate-y-[1px] hover:text-black hover:shadow-[0_8px_18px_rgba(40,30,10,0.06)]",
                        active.pinned && "bg-[#F3EBD2]",
                      )}
                      style={
                        active.pinned
                          ? { borderColor: "rgba(189, 160, 86, 0.28)" }
                          : undefined
                      }
                    >
                      {active.pinned ? "ЗАКРЕПЛЕНО" : "ЗАКРЕПИТЬ"}
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteNote(active.id)}
                      className="cursor-pointer rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold tracking-[0.08em] text-black/60 transition-all hover:-translate-y-[1px] hover:text-black hover:shadow-[0_8px_18px_rgba(40,30,10,0.06)]"
                    >
                      УДАЛИТЬ
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-xs font-semibold tracking-[0.12em] text-black/45">
                    ТЕГИ:
                  </div>

                  {active.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-2 rounded-full border border-[#D8C79D] bg-[#FFF9EC] px-3 py-1.5 text-xs text-black/70"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="cursor-pointer text-black/40 transition-colors hover:text-black"
                        aria-label={`Удалить тег ${tag}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}

                  <input
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="добавить тег..."
                    className="w-[190px] rounded-[12px] border border-[#E4D7B8] bg-white px-3 py-2 text-xs text-black outline-none placeholder:text-black/35 focus:border-[#D9C38C]"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      addTag(newTagInput);
                      setNewTagInput("");
                    }}
                    className="cursor-pointer rounded-full border border-black/10 bg-[#F3EBD2] px-3 py-2 text-xs font-semibold text-black transition-all hover:-translate-y-[1px] hover:bg-[#efe4c6]"
                    style={{ borderColor: "rgba(189, 160, 86, 0.28)" }}
                  >
                    + ТЕГ
                  </button>
                </div>

                <textarea
                  value={active.body}
                  onChange={(e) => updateActive({ body: e.target.value })}
                  placeholder="Пишите заметки по работе: что спросил клиент, что предложили, какие возражения, что сработало..."
                  className="min-h-[440px] w-full resize-y rounded-[18px] border border-[#E4D7B8] bg-white/75 px-4 py-4 text-sm leading-9 text-black outline-none placeholder:text-black/35 focus:border-[#D9C38C]"
                />

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-black/45">
                  <div>Последнее изменение: {formatTime(active.updatedAt)}</div>
                  <div>Сохраняется автоматически</div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
