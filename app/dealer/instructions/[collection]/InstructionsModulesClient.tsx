"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type ModuleItem = {
  id: string;
  title: string; // то что в списке
  fileHref: string; // скачивание
};

type CollectionKey =
  | "amber"
  | "scandy"
  | "elizabeth"
  | "salvador"
  | "pitti"
  | "buongiorno";

// ✅ мок модулей (потом заменим на Strapi/файлы без ломки UI)
const MODULES_BY_COLLECTION: Record<CollectionKey, ModuleItem[]> = {
  amber: [
    {
      id: "tumba-30-101",
      title: "Тумба прикроватная 30.101",
      fileHref: "/dealer/instructions/amber/30.101.pdf",
    },
    {
      id: "tumba-30-102",
      title: "Тумба прикроватная 30.102",
      fileHref: "/dealer/instructions/amber/30.102.pdf",
    },
    {
      id: "komod-31-100",
      title: "Комод 31.100",
      fileHref: "/dealer/instructions/amber/31.100.pdf",
    },
    {
      id: "komod-32-100",
      title: "Комод широкий 32.100",
      fileHref: "/dealer/instructions/amber/32.100.pdf",
    },
    {
      id: "krovat-160-200",
      title: "Кровать 160×200 35.100",
      fileHref: "/dealer/instructions/amber/35.100.pdf",
    },
    {
      id: "krovat-180-200",
      title: "Кровать 180×200 26.100",
      fileHref: "/dealer/instructions/amber/26.100.pdf",
    },
  ],
  scandy: [],
  elizabeth: [],
  salvador: [],
  pitti: [],
  buongiorno: [],
};

function titleFromCollectionKey(k: CollectionKey): string {
  switch (k) {
    case "amber":
      return "AMBER";
    case "scandy":
      return "SCANDY";
    case "elizabeth":
      return "ELIZABETH";
    case "salvador":
      return "SALVADOR";
    case "pitti":
      return "PITTI";
    case "buongiorno":
      return "BUONGIORNO";
  }
}

function isCollectionKey(v: string): v is CollectionKey {
  return (
    v === "amber" ||
    v === "scandy" ||
    v === "elizabeth" ||
    v === "salvador" ||
    v === "pitti" ||
    v === "buongiorno"
  );
}

export default function InstructionsModulesClient({
  collection,
}: {
  collection: string;
}) {
  const safeKey: CollectionKey | null = isCollectionKey(collection)
    ? collection
    : null;

  const [q, setQ] = useState("");

  const list = useMemo<ModuleItem[]>(() => {
    if (!safeKey) return [];
    const base = MODULES_BY_COLLECTION[safeKey] ?? [];
    const query = q.trim().toLowerCase();
    if (!query) return base;
    return base.filter((m) => m.title.toLowerCase().includes(query));
  }, [q, safeKey]);

  if (!safeKey) {
    return (
      <div className="space-y-2">
        <div className="text-sm text-black/45">Dealer Portal</div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-black">
          Инструкции по сборке
        </h1>
        <p className="text-sm text-black/55">Коллекция не найдена.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-6">
        <div>
          <div className="text-sm text-black/45">Dealer Portal</div>
          <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-black">
            Инструкции — {titleFromCollectionKey(safeKey)}
          </h1>
          <p className="mt-1 text-sm text-black/55">
            Найдите модуль и нажмите — скачивание начнётся сразу.
          </p>
        </div>

        <Link
          href="/dealer/instructions"
          className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-black/70 hover:text-black transition-colors"
        >
          Назад
        </Link>
      </header>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-[520px]">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск по модулям…"
            className="w-full rounded-[14px] border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-black/35 focus:border-black/20"
          />
          {q ? (
            <button
              type="button"
              onClick={() => setQ("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-xs text-black/55 hover:text-black"
            >
              Очистить
            </button>
          ) : null}
        </div>

        <div className="text-sm text-black/45">{list.length} шт.</div>
      </div>

      {/* List */}
      <ul className="space-y-2">
        {list.map((m) => (
          <li key={m.id}>
            <a
              href={m.fileHref}
              download
              className={[
                "group flex items-center justify-between gap-4",
                "rounded-[14px] border border-black/10 bg-white px-4 py-3",
                "transition-colors hover:bg-black/[0.02]",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
              ].join(" ")}
            >
              <span className="text-sm text-black">{m.title}</span>
              <span className="text-xs text-black/45 group-hover:text-black/65">
                Скачать
              </span>
            </a>
          </li>
        ))}

        {list.length === 0 ? (
          <li className="rounded-[14px] border border-black/10 bg-white px-4 py-3 text-sm text-black/55">
            Ничего не найдено.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
