"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  Store,
  Palette,
  BriefcaseBusiness,
  Truck,
  Package,
  Globe,
  Check,
  Trash2,
  ArrowDown,
  Send,
} from "lucide-react";

type ContactMethod = "telegram" | "call" | "whatsapp";

type Chip = {
  id: string;
  title: string;
  icon: React.ReactNode;
};

function cn(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

const BENEFITS = [
  "Официально и прозрачно",
  "Прайсы и условия",
  "Поддержка дилеров",
  "Срок ответа 1–2 часа",
] as const;

const FORMATS: Chip[] = [
  {
    id: "dealer",
    title: "Дилер / мебельный салон",
    icon: <Store className="h-4 w-4" />,
  },
  {
    id: "designer",
    title: "Дизайнер / студия интерьера",
    icon: <Palette className="h-4 w-4" />,
  },
  {
    id: "b2b",
    title: "B2B (отели, офисы, застройщики)",
    icon: <BriefcaseBusiness className="h-4 w-4" />,
  },
  {
    id: "logistics",
    title: "Партнёр по логистике/доставке",
    icon: <Truck className="h-4 w-4" />,
  },
  {
    id: "supplier",
    title: "Поставщик материалов/комплектующих",
    icon: <Package className="h-4 w-4" />,
  },
  {
    id: "export",
    title: "Экспорт / оптовые закупки",
    icon: <Globe className="h-4 w-4" />,
  },
];

const INTERESTS: Chip[] = [
  {
    id: "price-list",
    title: "Прайс-лист",
    icon: <Check className="h-4 w-4" />,
  },
  {
    id: "dealer-terms",
    title: "Условия дилера (маржа/скидки)",
    icon: <Check className="h-4 w-4" />,
  },
  {
    id: "catalog-samples",
    title: "Каталог / материалы / образцы",
    icon: <Check className="h-4 w-4" />,
  },
  {
    id: "production-time",
    title: "Сроки производства",
    icon: <Check className="h-4 w-4" />,
  },
  {
    id: "delivery-assembly",
    title: "Доставка и сборка",
    icon: <Check className="h-4 w-4" />,
  },
  {
    id: "custom-sizes",
    title: "Индивидуальные размеры / проект",
    icon: <Check className="h-4 w-4" />,
  },
  {
    id: "content-3d",
    title: "Фотоконтент / 3D модели / модели для дизайнера",
    icon: <Check className="h-4 w-4" />,
  },
  {
    id: "export-terms",
    title: "Экспортные условия",
    icon: <Check className="h-4 w-4" />,
  },
  {
    id: "meeting-call",
    title: "Встреча / звонок менеджера",
    icon: <Check className="h-4 w-4" />,
  },
];

function ChipCard({
  title,
  icon,
  active,
  onClick,
}: {
  title: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full cursor-pointer text-left rounded-3xl border p-4 md:p-5 transition",
        "outline-none focus-visible:ring-2 focus-visible:ring-black/10 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        active
          ? "border-black/20 bg-black/[0.03]"
          : "border-black/10 bg-white hover:border-black/18",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 h-9 w-9 rounded-2xl border flex items-center justify-center shrink-0 transition",
            active
              ? "border-black/18 bg-white"
              : "border-black/10 bg-black/[0.02] group-hover:bg-white",
          )}
        >
          <span className="text-black/70">{icon}</span>
        </div>

        <div className="min-w-0">
          <div className="text-[14px] font-medium leading-6 text-black/85">
            {title}
          </div>
          <div className="mt-2 text-[11px] tracking-[0.16em] text-black/45">
            {active ? "ДОБАВЛЕНО ✓" : "ДОБАВИТЬ"}
          </div>
        </div>
      </div>
    </button>
  );
}

function SectionTitle({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
}) {
  return (
    <div>
      <div className="text-[12px] tracking-[0.18em] text-black/45">
        {eyebrow}
      </div>
      <h2 className="mt-2 text-[18px] font-semibold tracking-[-0.01em] text-black/85 md:text-[26px]">
        {title}
      </h2>
      {desc ? (
        <p className="mt-2 text-[14px] leading-7 text-black/70">{desc}</p>
      ) : null}
    </div>
  );
}

function formatUzPhoneDisplay(raw: string) {
  // хранение: только 9 цифр
  const d = raw.replace(/\D/g, "").slice(0, 9);
  const p1 = d.slice(0, 2);
  const p2 = d.slice(2, 5);
  const p3 = d.slice(5, 7);
  const p4 = d.slice(7, 9);
  const parts = [p1, p2, p3, p4].filter(Boolean);
  const spaced =
    parts.length >= 2
      ? `${parts[0]} ${parts[1]}${p3 ? ` ${p3}` : ""}${p4 ? ` ${p4}` : ""}`
      : parts.join(" ");
  return { digits: d, display: `+998 ${spaced}`.trimEnd() };
}

export default function CooperationClient({
  // пока не используем Strapi для контента в этом UI (он уже статично задан ТЗ)
  // но пропсы оставляем, чтобы страница не ломалась и ты мог позже подключить
  tracks,
  blocks,
}: {
  tracks: unknown[];
  blocks: unknown[];
}) {
  const startRef = useRef<HTMLDivElement | null>(null);

  const [formats, setFormats] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);

  const [sending, setSending] = useState(false);

  const [form, setForm] = useState({
    name: "",
    company: "",
    city: "",
    phoneDigits: "", // 9 цифр
    method: "telegram" as ContactMethod,
    comment: "",
  });

  const pickedFormats = useMemo(() => {
    const m = new Map(FORMATS.map((x) => [x.id, x.title]));
    return formats.map((id) => m.get(id)).filter(Boolean) as string[];
  }, [formats]);

  const pickedInterests = useMemo(() => {
    const m = new Map(INTERESTS.map((x) => [x.id, x.title]));
    return interests.map((id) => m.get(id)).filter(Boolean) as string[];
  }, [interests]);

  const canSend = form.name.trim().length > 0 && form.phoneDigits.length === 9;

  const toggle = (arr: string[], id: string) =>
    arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];

  const clearAll = () => {
    setFormats([]);
    setInterests([]);
  };

  const onStart = () => {
    startRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submit = async () => {
    if (!canSend) return;

    const phone = `+998${form.phoneDigits}`;

    const payload = {
      name: form.name,
      phone,
      company: form.company,
      city: form.city,
      contactMethod: form.method,
      comment: form.comment,
      formats: pickedFormats,
      interests: pickedInterests,
    };

    try {
      setSending(true);
      const res = await fetch("/api/partner-request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => null);
        alert(j?.error || "Ошибка отправки");
        return;
      }

      alert("Отправлено ✅");
      setForm({
        name: "",
        company: "",
        city: "",
        phoneDigits: "",
        method: "telegram",
        comment: "",
      });
      clearAll();
    } finally {
      setSending(false);
    }
  };

  const phoneView = formatUzPhoneDisplay(form.phoneDigits);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-10 md:space-y-14">
      {/* 1) HERO */}
      <section className="rounded-3xl border border-black/10 bg-white p-6 md:p-10 relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(760px 340px at 10% 0%, rgba(214,190,160,0.18), transparent 60%), radial-gradient(740px 340px at 100% 80%, rgba(0,0,0,0.06), transparent 60%)",
          }}
        />

        <div className="relative">
          <div className="text-[12px] tracking-[0.18em] text-black/45">
            LIONETO • COOPERATION
          </div>
          <h1 className="mt-3 text-balance text-[22px] font-semibold tracking-[-0.02em] md:text-[38px]">
            Сотрудничество с Lioneto
          </h1>
          <p className="mt-3 max-w-3xl text-[14px] leading-7 text-black/70 md:text-[16px]">
            Выберите, что вам интересно — мы соберём заявку и отправим
            менеджеру.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {BENEFITS.map((b) => (
              <div
                key={b}
                className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[12px] text-black/70"
              >
                {b}
              </div>
            ))}
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={onStart}
              className={cn(
                "inline-flex items-center gap-2 rounded-2xl bg-black px-4 py-3 cursor-pointer",
                "text-[12px] font-medium tracking-[0.18em] text-white transition",
                "hover:opacity-95 active:scale-[0.99]",
              )}
            >
              <ArrowDown className="h-4 w-4" />
              НАЧАТЬ
            </button>
          </div>
        </div>
      </section>

      {/* 2-5) MAIN GRID */}
      <section ref={startRef} className="grid gap-6 md:grid-cols-12">
        {/* Left content */}
        <div className="md:col-span-7 space-y-10">
          {/* 2) Formats */}
          <div>
            <SectionTitle
              eyebrow="ШАГ 1"
              title="Выберите формат сотрудничества"
              desc="Можно выбрать несколько — они автоматически появятся в собранной заявке."
            />

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {FORMATS.map((c) => (
                <ChipCard
                  key={c.id}
                  title={c.title}
                  icon={c.icon}
                  active={formats.includes(c.id)}
                  onClick={() => setFormats((p) => toggle(p, c.id))}
                />
              ))}
            </div>
          </div>

          {/* 3) Interests */}
          <div>
            <SectionTitle
              eyebrow="ШАГ 2"
              title="Что именно вам нужно?"
              desc="Отметьте детали — менеджер сразу поймёт, что подготовить."
            />

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {INTERESTS.map((c) => (
                <ChipCard
                  key={c.id}
                  title={c.title}
                  icon={c.icon}
                  active={interests.includes(c.id)}
                  onClick={() => setInterests((p) => toggle(p, c.id))}
                />
              ))}
            </div>
          </div>

          {/* 5) Form */}
          <div>
            <SectionTitle
              eyebrow="ШАГ 3"
              title="Контакты"
              desc="Оставьте телефон — мы свяжемся в удобном формате."
            />

            <div className="mt-5 rounded-3xl border border-black/10 bg-white p-5 md:p-6">
              <div className="grid gap-3">
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Имя*"
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[14px] text-black/80 outline-none transition focus:border-black/25"
                />

                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={form.company}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, company: e.target.value }))
                    }
                    placeholder="Компания / студия / магазин"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[14px] text-black/80 outline-none transition focus:border-black/25"
                  />
                  <input
                    value={form.city}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, city: e.target.value }))
                    }
                    placeholder="Город"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[14px] text-black/80 outline-none transition focus:border-black/25"
                  />
                </div>

                {/* UZ phone */}
                <div className="grid gap-2">
                  <div className="text-[12px] tracking-[0.14em] text-black/45">
                    Телефон*
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 flex items-center gap-3">
                    <div className="text-[14px] text-black/55 select-none">
                      +998
                    </div>
                    <input
                      inputMode="numeric"
                      value={phoneView.digits}
                      onChange={(e) => {
                        const next = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 9);
                        setForm((p) => ({ ...p, phoneDigits: next }));
                      }}
                      placeholder="90 123 45 67"
                      className="w-full bg-transparent text-[14px] text-black/80 outline-none"
                    />
                  </div>

                  <div className="text-[12px] text-black/45">
                    {phoneView.digits.length
                      ? `Ввод: ${phoneView.display}`
                      : "Пример: +998 90 123 45 67"}
                  </div>
                </div>

                {/* Method */}
                <div className="mt-2">
                  <div className="text-[12px] tracking-[0.14em] text-black/45">
                    Удобный способ связи
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(
                      [
                        { id: "telegram", label: "Telegram" },
                        { id: "call", label: "Звонок" },
                        { id: "whatsapp", label: "WhatsApp" },
                      ] as const
                    ).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, method: m.id }))}
                        className={cn(
                          "rounded-full border px-4 py-2 text-[12px] font-medium tracking-[0.16em] transition cursor-pointer",
                          form.method === m.id
                            ? "border-black/15 bg-black text-white"
                            : "border-black/10 bg-white text-black/70 hover:border-black/18 hover:text-black",
                        )}
                      >
                        {m.label.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={form.comment}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, comment: e.target.value }))
                  }
                  rows={4}
                  placeholder="Комментарий (опционально)"
                  className="mt-2 w-full resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-[14px] text-black/80 outline-none transition focus:border-black/25"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4) Sticky summary */}
        <div className="md:col-span-5">
          <div className="md:sticky md:top-6">
            <div className="rounded-3xl border border-black/10 bg-white p-6">
              <div className="text-[12px] tracking-[0.18em] text-black/45">
                СОБРАННАЯ ЗАЯВКА
              </div>

              <div className="mt-4">
                <div className="text-[12px] tracking-[0.14em] text-black/45">
                  Вы выбрали:
                </div>
                {pickedFormats.length ? (
                  <ul className="mt-2 grid gap-2">
                    {pickedFormats.map((x) => (
                      <li
                        key={x}
                        className="rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-3 text-[13px] text-black/75"
                      >
                        {x}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-2 text-[13px] leading-6 text-black/55">
                    Выберите формат сотрудничества.
                  </div>
                )}
              </div>

              <div className="mt-5">
                <div className="text-[12px] tracking-[0.14em] text-black/45">
                  Интересует:
                </div>
                {pickedInterests.length ? (
                  <ul className="mt-2 grid gap-2">
                    {pickedInterests.map((x) => (
                      <li
                        key={x}
                        className="rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-3 text-[13px] text-black/75"
                      >
                        {x}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-2 text-[13px] leading-6 text-black/55">
                    Отметьте, что именно вам нужно.
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3 text-[12px] tracking-[0.16em] text-black/70 hover:border-black/18 hover:text-black transition cursor-pointer"
                >
                  <Trash2 className="h-4 w-4 text-black/45" />
                  ОЧИСТИТЬ
                </button>

                <div className="text-[11px] text-black/45 text-right">
                  Это уйдёт в Telegram менеджеру
                </div>
              </div>

              <button
                type="button"
                onClick={submit}
                disabled={!canSend || sending}
                className={cn(
                  "mt-5 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-4 py-3",
                  "text-[12px] font-medium tracking-[0.18em] text-white transition",
                  "hover:opacity-95 active:scale-[0.99]",
                  (!canSend || sending) && "opacity-40 cursor-not-allowed",
                )}
              >
                <Send className="h-4 w-4" />
                {sending ? "ОТПРАВКА..." : "ОТПРАВИТЬ"}
              </button>

              <div className="mt-3 text-[11px] leading-5 text-black/45">
                Для отправки нужно: <b>имя</b> и <b>телефон</b>.
              </div>
            </div>

            {/* Mobile bottom feel (optional) */}
            <div className="mt-3 md:hidden text-[12px] text-black/45">
              Подсказка: собранная заявка всегда под рукой.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
