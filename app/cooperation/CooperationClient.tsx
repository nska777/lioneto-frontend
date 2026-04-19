"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
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
type Region = "UZ" | "RU";

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
    title: "Дилер / Стать дилером",
    icon: <Store className="h-4 w-4" />,
  },
  {
    id: "designer",
    title: "Услуги дизайнера / Фотоконтент (3D моделирование)",
    icon: <Palette className="h-4 w-4" />,
  },
  {
    id: "logistics",
    title: "Партнёр по логистике/доставке",
    icon: <Truck className="h-4 w-4" />,
  },
  {
    id: "supplier",
    title: "Поставщик материалов/сырья",
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
    id: "custom-sizes",
    title: "Индивидуальные заказы",
    icon: <Check className="h-4 w-4" />,
  },
  {
    id: "content-3d",
    title: "Заказать дизайн",
    icon: <Check className="h-4 w-4" />,
  },
  {
    id: "meeting-call",
    title: "Заказать встречу / звонок менеджера",
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
          ? "border-emerald-600 bg-emerald-600 hover:bg-emerald-700 hover:border-emerald-700"
          : "border-black/10 bg-white hover:border-black/18",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 h-9 w-9 rounded-2xl border flex items-center justify-center shrink-0 transition",
            active
              ? "border-white/20 bg-white/10 text-white"
              : "border-black/10 bg-black/[0.02] text-black/70 group-hover:bg-white",
          )}
        >
          <span className={cn(active ? "text-white" : "text-black/70")}>
            {icon}
          </span>
        </div>

        <div className="min-w-0">
          <div
            className={cn(
              "text-[14px] font-medium leading-6",
              active ? "text-white" : "text-black/85",
            )}
          >
            {title}
          </div>
          <div
            className={cn(
              "mt-2 text-[11px] tracking-[0.16em]",
              active ? "text-white/85" : "text-black/45",
            )}
          >
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

function digitsOnly(s: string) {
  return s.replace(/\D/g, "");
}

function isValidEmail(s: string) {
  const v = s.trim();
  if (!v) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

// читаем регион из localStorage (без знания точного ключа)
function readRegionFromStorage(): Region {
  if (typeof window === "undefined") return "UZ";
  const keys = [
    "lioneto:region",
    "region",
    "LIONETO_REGION",
    "selectedRegion",
    "lioneto_region",
  ];
  for (const k of keys) {
    const v = window.localStorage.getItem(k);
    if (!v) continue;
    const up = v.trim().toUpperCase();
    if (up === "RU" || up === "RUSSIA") return "RU";
    if (up === "UZ" || up === "UZBEKISTAN") return "UZ";
  }
  return "UZ";
}

function writeRegionToStorage(r: Region) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("lioneto:region", r);
}

function formatUzPhone(digitsRaw: string) {
  const d = digitsOnly(digitsRaw).slice(0, 9);
  const p1 = d.slice(0, 2);
  const p2 = d.slice(2, 5);
  const p3 = d.slice(5, 7);
  const p4 = d.slice(7, 9);
  const spaced = [p1, p2, p3, p4].filter(Boolean).join(" ").trim();
  return {
    digits: d,
    display: spaced ? `+998 ${spaced}` : "+998",
    placeholder: "90 123 45 67",
    maxLen: 9,
    prefix: "+998",
    fullE164: `+998${d}`,
  };
}

function formatRuPhone(digitsRaw: string) {
  const d = digitsOnly(digitsRaw).slice(0, 10);
  const p1 = d.slice(0, 3);
  const p2 = d.slice(3, 6);
  const p3 = d.slice(6, 8);
  const p4 = d.slice(8, 10);
  const spaced = [p1, p2, p3, p4].filter(Boolean).join(" ").trim();
  return {
    digits: d,
    display: spaced ? `+7 ${spaced}` : "+7",
    placeholder: "999 123 45 67",
    maxLen: 10,
    prefix: "+7",
    fullE164: `+7${d}`,
  };
}

// пытаемся “перевести” уже введённый номер при смене региона, чтобы не сбрасывало
function convertDigitsForRegion(prev: Region, next: Region, digits: string) {
  const d = digitsOnly(digits);
  if (!d) return "";

  if (prev === "UZ" && next === "RU") {
    return d.slice(0, 10);
  }

  if (prev === "RU" && next === "UZ") {
    return d.slice(0, 9);
  }

  return d;
}

function RegionSwitch({
  value,
  onChange,
}: {
  value: Region;
  onChange: (r: Region) => void;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white p-1">
      {(
        [
          { id: "UZ" as const, label: "Узбекистан" },
          { id: "RU" as const, label: "Россия" },
        ] as const
      ).map((x) => (
        <button
          key={x.id}
          type="button"
          onClick={() => onChange(x.id)}
          className={cn(
            "rounded-full px-4 py-2 text-[12px] font-medium tracking-[0.14em] transition cursor-pointer",
            value === x.id
              ? "bg-black text-white"
              : "bg-transparent text-black/60 hover:text-black",
          )}
        >
          {x.label.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default function CooperationClient({
  tracks,
  blocks,
}: {
  tracks: unknown[];
  blocks: unknown[];
}) {
  const startRef = useRef<HTMLDivElement | null>(null);

  const [region, setRegion] = useState<Region>("UZ");

  useEffect(() => {
    setRegion(readRegionFromStorage());
  }, []);

  useEffect(() => {
    const onStorage = () => setRegion(readRegionFromStorage());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const [formats, setFormats] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    city: "",
    phoneDigits: "",
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

  const phoneView =
    region === "RU"
      ? formatRuPhone(form.phoneDigits)
      : formatUzPhone(form.phoneDigits);

  useEffect(() => {
    setForm((p) => {
      const converted = convertDigitsForRegion(region, region, p.phoneDigits);
      const trimmed = digitsOnly(converted).slice(0, phoneView.maxLen);
      if (trimmed === p.phoneDigits) return p;
      return { ...p, phoneDigits: trimmed };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region]);

  const canSend =
    form.firstName.trim().length > 0 &&
    form.lastName.trim().length > 0 &&
    isValidEmail(form.email) &&
    phoneView.digits.length === phoneView.maxLen;

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

    const pageUrl =
      typeof window !== "undefined" ? window.location.href : "/cooperation";

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: phoneView.fullE164,
      company: form.company.trim(),
      city: form.city.trim(),
      contactMethod: form.method,
      comment: form.comment.trim(),
      formats: pickedFormats,
      interests: pickedInterests,
      region,
      pageUrl,
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
        firstName: "",
        lastName: "",
        email: "",
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

  const onChangeRegion = (next: Region) => {
    setRegion((prev) => {
      setForm((p) => ({
        ...p,
        phoneDigits: convertDigitsForRegion(prev, next, p.phoneDigits),
      }));
      writeRegionToStorage(next);
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-10 md:space-y-14">
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

          <div className="mt-6 flex flex-wrap items-center gap-3">
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

            <div className="ml-0 md:ml-2">
              <div className="mb-2 text-[11px] tracking-[0.14em] text-black/45">
                РЕГИОН ДЛЯ СВЯЗИ
              </div>
              <RegionSwitch value={region} onChange={onChangeRegion} />
            </div>
          </div>
        </div>
      </section>

      <section ref={startRef} className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-7 space-y-10">
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

          <div>
            <SectionTitle
              eyebrow="ШАГ 3"
              title="Контакты"
              desc="Оставьте контакты — мы свяжемся в удобном формате."
            />

            <div className="mt-5 rounded-3xl border border-black/10 bg-white p-5 md:p-6">
              <div className="grid gap-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={form.firstName}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, firstName: e.target.value }))
                    }
                    placeholder="Имя*"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[14px] text-black/80 outline-none transition focus:border-black/25"
                  />
                  <input
                    value={form.lastName}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, lastName: e.target.value }))
                    }
                    placeholder="Фамилия*"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[14px] text-black/80 outline-none transition focus:border-black/25"
                  />
                </div>

                <input
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="Email*"
                  inputMode="email"
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

                <div className="grid gap-2">
                  <div className="text-[12px] tracking-[0.14em] text-black/45">
                    Телефон*
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 flex items-center gap-3">
                    <div className="text-[14px] text-black/55 select-none">
                      {phoneView.prefix}
                    </div>
                    <input
                      inputMode="numeric"
                      value={phoneView.digits}
                      onChange={(e) => {
                        const next = digitsOnly(e.target.value).slice(
                          0,
                          phoneView.maxLen,
                        );
                        setForm((p) => ({ ...p, phoneDigits: next }));
                      }}
                      placeholder={phoneView.placeholder}
                      className="w-full bg-transparent text-[14px] text-black/80 outline-none"
                    />
                  </div>

                  <div className="text-[12px] text-black/45">
                    {phoneView.digits.length
                      ? `Ввод: ${phoneView.display}`
                      : `Пример: ${phoneView.prefix} ${phoneView.placeholder}`}
                  </div>
                </div>

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

        <div className="md:col-span-5">
          <div className="md:sticky md:top-6">
            <div className="rounded-3xl border border-black/10 bg-white p-6">
              <div className="text-[12px] tracking-[0.18em] text-black/45">
                СОБРАННАЯ ЗАЯВКА
              </div>

              <div className="mt-4">
                <div className="text-[12px] tracking-[0.14em] text-black/45">
                  Регион:
                </div>
                <div className="mt-2 rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-3 text-[13px] text-black/75">
                  {region === "RU"
                    ? "Россия (телефон +7)"
                    : "Узбекистан (телефон +998)"}
                </div>
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
                Для отправки нужно: <b>имя</b>, <b>фамилия</b>, <b>email</b> и{" "}
                <b>телефон</b>.
              </div>

              {!isValidEmail(form.email) && form.email.trim().length > 0 ? (
                <div className="mt-2 text-[11px] text-black/50">
                  Проверьте email — должен быть в формате name@domain.com
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
