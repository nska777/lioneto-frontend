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
  // stable enough for local notes
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function safeParseNotes(raw: string | null): Note[] {
  if (!raw) return [];
  try {
    const v: unknown = JSON.parse(raw);
    if (!Array.isArray(v)) return [];
    return v
      .map((x): Note | null => {
        if (!x || typeof x !== "object") return null;
        const r = x as Record<string, unknown>;
        const id = typeof r.id === "string" ? r.id : "";
        const title = typeof r.title === "string" ? r.title : "";
        const body = typeof r.body === "string" ? r.body : "";
        const tags = Array.isArray(r.tags)
          ? r.tags.filter((t): t is string => typeof t === "string")
          : [];
        const pinned = typeof r.pinned === "boolean" ? r.pinned : false;
        const updatedAt = typeof r.updatedAt === "number" ? r.updatedAt : 0;
        if (!id) return null;
        return { id, title, body, tags, pinned, updatedAt };
      })
      .filter((x): x is Note => !!x);
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
  // ✅ init from localStorage without useEffect
  const [notes, setNotes] = useState<Note[]>(() => loadNotesOnce());

  // ✅ init activeId from initial notes without useEffect
  const [activeId, setActiveId] = useState<string | null>(() => {
    const initial = loadNotesOnce();
    return initial[0]?.id ?? null;
  });

  const [query, setQuery] = useState("");
  const [tagInput, setTagInput] = useState("");

  // persist
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const t = tagInput.trim().toLowerCase();

    const base = notes.filter((n) => {
      const okQ =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.body.toLowerCase().includes(q) ||
        n.tags.some((x) => x.toLowerCase().includes(q));

      const okT = !t || n.tags.some((x) => x.toLowerCase() === t);
      return okQ && okT;
    });

    const pinned = base
      .filter((n) => n.pinned)
      .sort((a, b) => b.updatedAt - a.updatedAt);
    const rest = base
      .filter((n) => !n.pinned)
      .sort((a, b) => b.updatedAt - a.updatedAt);

    return [...pinned, ...rest];
  }, [notes, query, tagInput]);

  const active = useMemo(
    () => notes.find((n) => n.id === activeId) ?? null,
    [notes, activeId],
  );

  function createNote() {
    const n: Note = {
      id: makeId(),
      title: "Новая заметка",
      body: "",
      tags: [],
      pinned: false,
      updatedAt: now(),
    };
    setNotes((prev) => [n, ...prev]);
    setActiveId(n.id);
  }

  function deleteNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setActiveId((prev) => (prev === id ? null : prev));
  }

  function updateActive(
    patch: Partial<Pick<Note, "title" | "body" | "tags" | "pinned">>,
  ) {
    if (!active) return;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === active.id
          ? {
              ...n,
              ...patch,
              updatedAt: now(),
            }
          : n,
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
    updateActive({ tags: active.tags.filter((t) => t !== tag) });
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-black/45">Dealer Portal</div>
          <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-black">
            Рабочая тетрадь
          </h1>
          <p className="mt-1 text-sm text-black/55">
            Личные заметки сохраняются на этом устройстве.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dealer/training"
            className="cursor-pointer rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-black/70 hover:text-black transition-colors"
          >
            Назад
          </Link>
          <button
            type="button"
            onClick={createNote}
            className="cursor-pointer rounded-full border border-black/10 bg-[#F3EBD2] px-4 py-2 text-sm font-semibold text-black hover:bg-[#efe4c6] transition-colors"
            style={{ borderColor: "rgba(189, 160, 86, 0.28)" }}
          >
            + Новая заметка
          </button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Sidebar */}
        <aside
          className="rounded-[18px] border bg-white p-4"
          style={{ borderColor: "rgba(189, 160, 86, 0.22)" }}
        >
          <div className="flex flex-col gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по заметкам…"
              className="w-full cursor-pointer rounded-[14px] border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none placeholder:text-black/35 focus:border-black/20"
            />
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Фильтр по тегу (например: возражения)"
              className="w-full cursor-pointer rounded-[14px] border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none placeholder:text-black/35 focus:border-black/20"
            />
          </div>

          <div className="mt-3 space-y-2">
            {filtered.length === 0 ? (
              <div className="rounded-[14px] border border-black/10 bg-white px-3 py-3 text-sm text-black/55">
                Пусто. Создайте первую заметку.
              </div>
            ) : (
              filtered.map((n) => {
                const isActive = n.id === activeId;
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => setActiveId(n.id)}
                    className={cn(
                      "w-full cursor-pointer text-left",
                      "rounded-[14px] border px-3 py-3",
                      "transition-colors",
                      isActive
                        ? "bg-[#F3EBD2] text-black"
                        : "bg-white text-black hover:bg-black/[0.02]",
                      "border-black/10",
                    )}
                    style={
                      isActive
                        ? { borderColor: "rgba(189, 160, 86, 0.28)" }
                        : undefined
                    }
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">
                          {n.pinned ? "★ " : ""}
                          {n.title || "Без названия"}
                        </div>
                        <div className="mt-1 truncate text-xs text-black/45">
                          {formatTime(n.updatedAt)}
                          {n.tags.length ? ` • ${n.tags.join(" • ")}` : ""}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Editor */}
        <section
          className="rounded-[18px] border bg-white p-5"
          style={{ borderColor: "rgba(189, 160, 86, 0.22)" }}
        >
          {!active ? (
            <div className="rounded-[14px] border border-black/10 bg-white px-4 py-4 text-sm text-black/55">
              Выберите заметку слева или создайте новую.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <input
                  value={active.title}
                  onChange={(e) => updateActive({ title: e.target.value })}
                  className="w-full cursor-pointer rounded-[14px] border border-black/10 bg-white px-4 py-3 text-[16px] font-semibold text-black outline-none focus:border-black/20"
                  placeholder="Название заметки…"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateActive({ pinned: !active.pinned })}
                    className={cn(
                      "cursor-pointer rounded-full border px-3 py-2 text-xs font-semibold tracking-[0.08em] transition-colors",
                      "border-black/10 bg-white text-black/70 hover:text-black",
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
                    className="cursor-pointer rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold tracking-[0.08em] text-black/60 hover:text-black transition-colors"
                  >
                    УДАЛИТЬ
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-xs font-semibold tracking-[0.12em] text-black/45">
                  ТЕГИ:
                </div>

                {active.tags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => removeTag(t)}
                    className="cursor-pointer rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-black/70 hover:text-black transition-colors"
                    title="Нажмите, чтобы убрать тег"
                  >
                    {t} ✕
                  </button>
                ))}

                <div className="flex items-center gap-2">
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="добавить тег…"
                    className="w-[180px] cursor-pointer rounded-[12px] border border-black/10 bg-white px-3 py-2 text-xs text-black outline-none placeholder:text-black/35 focus:border-black/20"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addTag(tagInput);
                      setTagInput("");
                    }}
                    className="cursor-pointer rounded-full border border-black/10 bg-[#F3EBD2] px-3 py-2 text-xs font-semibold text-black hover:bg-[#efe4c6] transition-colors"
                    style={{ borderColor: "rgba(189, 160, 86, 0.28)" }}
                  >
                    + ТЕГ
                  </button>
                </div>
              </div>

              {/* Body */}
              <textarea
                value={active.body}
                onChange={(e) => updateActive({ body: e.target.value })}
                placeholder="Пишите заметки по работе: что спросил клиент, что предложили, какие возражения, что сработало…"
                className="min-h-[360px] w-full cursor-pointer resize-y rounded-[16px] border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-black/35 focus:border-black/20"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-black/45">
                <div>Последнее изменение: {formatTime(active.updatedAt)}</div>
                <div>Сохраняется автоматически</div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
