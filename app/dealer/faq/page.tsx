"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

type FaqItem = {
  id: string;
  q: string;
  a: string;
  tags?: string[];
};

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "prices-source",
    q: "Откуда берутся прайс-листы и как часто они обновляются?",
    a: "Прайс-листы публикуются в разделе «Прайс-листы». Обновления выходят по мере изменений цен и наличия. Рекомендуем всегда использовать последнюю версию из портала, чтобы избежать расхождений.",
    tags: ["Прайсы", "Цены"],
  },
  {
    id: "download-problem",
    q: "Файл не скачивается — что делать?",
    a: "Проверьте соединение, обновите страницу и попробуйте снова. Если браузер блокирует загрузки — разрешите скачивания для сайта Lioneto. Также убедитесь, что у вас достаточно места на устройстве.",
    tags: ["Скачивание"],
  },
  {
    id: "tech-catalogs",
    q: "В чем разница между «Технические каталоги» и «Инструкции по сборке»?",
    a: "Технические каталоги — это материалы по изделиям (описания, комплектации, опции, спецификации). Инструкции по сборке — пошаговые PDF для конкретных модулей/позиций, которые скачиваются по клику.",
    tags: ["Файлы"],
  },
  {
    id: "training-signup",
    q: "Как записаться на тренинг и получить напоминание?",
    a: "Откройте «Календарь мероприятий», выберите день с тренингом и нажмите «Записаться». Для реального уведомления используйте «Добавить в календарь (ICS)» — тогда напоминание придёт через ваш телефон/Google/Apple календарь.",
    tags: ["Календарь", "Тренинги"],
  },
  {
    id: "multimedia-usage",
    q: "Можно ли использовать фото/видео из «Мультимедиа» для рекламы?",
    a: "Да, материалы предназначены для витрин, соцсетей и презентаций. Используйте их в рамках бренда Lioneto: без искажения логотипов и без изменения пропорций изделий.",
    tags: ["Мультимедиа"],
  },
  {
    id: "access",
    q: "У меня нет доступа к разделу — куда писать?",
    a: "Если вы дилер и доступ не открывается, сообщите вашему менеджеру Lioneto или администратору портала. Укажите вашу компанию, город и контактный номер — мы быстро проверим права.",
    tags: ["Доступ"],
  },
];

function useMeasureHeight<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [h, setH] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ro = new ResizeObserver(() => setH(el.scrollHeight));
    ro.observe(el);
    setH(el.scrollHeight);

    return () => ro.disconnect();
  }, []);

  return { ref, height: h };
}

function IconPlus({ open }: { open: boolean }) {
  return (
    <span
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-full",
        "border border-black/10 bg-white",
        "transition-transform duration-300 ease-out",
        open ? "rotate-45" : "rotate-0",
      )}
      aria-hidden="true"
    >
      <span className="absolute h-[14px] w-[2px] rounded-full bg-black/70" />
      <span className="absolute h-[2px] w-[14px] rounded-full bg-black/70" />
    </span>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.12em] uppercase"
      style={{
        borderColor: "rgba(189,160,86,0.26)",
        background: "rgba(243,235,210,0.65)",
        color: "rgba(0,0,0,0.70)",
      }}
    >
      {text}
    </span>
  );
}

function FaqRow({
  item,
  open,
  onToggle,
}: {
  item: FaqItem;
  open: boolean;
  onToggle: () => void;
}) {
  const { ref, height } = useMeasureHeight<HTMLDivElement>();

  return (
    <div
      className="rounded-[18px] border bg-white"
      style={{ borderColor: "rgba(0,0,0,0.10)" }}
    >
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "w-full cursor-pointer select-none text-left",
          "rounded-[18px] px-5 py-5",
          "transition-colors hover:bg-black/[0.02]",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15",
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[14px] font-extrabold tracking-[0.04em] text-black">
              {item.q}
            </div>

            {item.tags && item.tags.length ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {item.tags.map((t) => (
                  <Badge key={t} text={t} />
                ))}
              </div>
            ) : null}
          </div>

          <IconPlus open={open} />
        </div>
      </button>

      <div
        className="overflow-hidden transition-[max-height,opacity] duration-500 ease-out"
        style={{
          maxHeight: open ? height + 16 : 0,
          opacity: open ? 1 : 0,
        }}
      >
        <div ref={ref} className="px-5 pb-5 pt-0">
          <div
            className="rounded-[16px] border px-4 py-4 text-sm leading-[1.7] text-black/70"
            style={{
              borderColor: "rgba(189,160,86,0.18)",
              background: "rgba(0,0,0,0.01)",
            }}
          >
            {item.a}
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchInput({
  value,
  onChange,
  onClear,
}: {
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="relative w-full max-w-[720px]">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Поиск по вопросам…"
        className={cn(
          "w-full cursor-pointer rounded-[16px] border bg-white px-4 py-3 text-sm text-black",
          "outline-none placeholder:text-black/35 focus:border-black/20",
        )}
        style={{ borderColor: "rgba(0,0,0,0.10)" }}
      />
      {value ? (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-full px-3 py-1 text-xs font-semibold text-black/55 hover:text-black transition-colors"
        >
          Очистить
        </button>
      ) : null}
    </div>
  );
}

export default function Page() {
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return FAQ_ITEMS;

    return FAQ_ITEMS.filter((it) => {
      const inQ = it.q.toLowerCase().includes(query);
      const inA = it.a.toLowerCase().includes(query);
      const inTags = (it.tags ?? []).some((t) =>
        t.toLowerCase().includes(query),
      );
      return inQ || inA || inTags;
    });
  }, [q]);

  // ✅ вместо setState в useEffect — просто “безопасный” id для рендера
  const visibleOpenId = useMemo(() => {
    if (!openId) return null;
    return filtered.some((x) => x.id === openId) ? openId : null;
  }, [filtered, openId]);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-black/45">Dealer Portal</div>
          <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-black">
            FAQ
          </h1>
          <p className="mt-1 text-sm text-black/55">
            Ответы на частые вопросы. Открывается один пункт — плавно, без
            лагов.
          </p>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput value={q} onChange={setQ} onClear={() => setQ("")} />
        <div className="text-sm text-black/45">{filtered.length} вопросов</div>
      </div>

      <div className="space-y-3">
        {filtered.map((item) => (
          <FaqRow
            key={item.id}
            item={item}
            open={visibleOpenId === item.id}
            onToggle={() => setOpenId((p) => (p === item.id ? null : item.id))}
          />
        ))}

        {filtered.length === 0 ? (
          <div
            className="rounded-[16px] border bg-white px-4 py-4 text-sm text-black/55"
            style={{ borderColor: "rgba(0,0,0,0.10)" }}
          >
            Ничего не найдено. Попробуйте другой запрос.
          </div>
        ) : null}
      </div>
    </div>
  );
}
