"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type ModuleItem = {
  id: number;
  documentId: string;
  title: string;
  collectionSlug: string;
  collectionTitle: string;
  sortOrder: number;
  fileName: string;
  fileUrl: string;
};

export default function InstructionsModulesClient({
  collectionTitle,
  items,
}: {
  collectionSlug: string;
  collectionTitle: string;
  items: ModuleItem[];
}) {
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();

    if (!query) return items;

    return items.filter((item) => item.title.toLowerCase().includes(query));
  }, [items, q]);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-6">
        <div>
          <div className="text-sm text-black/45">Dealer Portal</div>
          <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-black">
            Инструкции — {collectionTitle}
          </h1>
          <p className="mt-1 text-sm text-black/55">
            Найдите модуль и нажмите — скачивание начнётся сразу.
          </p>
        </div>

        <Link
          href="/dealer/instructions"
          className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-black/70 transition-colors hover:text-black"
        >
          Назад
        </Link>
      </header>

      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-[520px]">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск по модулям..."
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

      <ul className="space-y-2">
        {list.map((item) => {
          const downloadHref = `/api/dealer/download?url=${encodeURIComponent(
            item.fileUrl,
          )}&name=${encodeURIComponent(item.fileName || item.title)}`;

          return (
            <li key={item.documentId || item.id}>
              <a
                href={downloadHref}
                className={[
                  "group flex items-center justify-between gap-4",
                  "rounded-[14px] border border-black/10 bg-white px-4 py-3",
                  "transition-colors hover:bg-black/[0.02]",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
                ].join(" ")}
              >
                <span className="text-sm text-black">{item.title}</span>
                <span className="text-xs text-black/45 group-hover:text-black/65">
                  Скачать
                </span>
              </a>
            </li>
          );
        })}

        {list.length === 0 ? (
          <li className="rounded-[14px] border border-black/10 bg-white px-4 py-3 text-sm text-black/55">
            Ничего не найдено.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
