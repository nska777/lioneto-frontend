"use client";

import React, { useMemo, useState } from "react";
import {
  ShieldCheck,
  FileText,
  AlertTriangle,
  Info,
  ChevronDown,
  ClipboardCheck,
} from "lucide-react";

function cn(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

type Section = {
  id: string;
  title: string;
  icon: React.ReactNode;
  lead?: string;
  content: React.ReactNode;
};

function Pill({
  icon,
  label,
  tone = "neutral",
}: {
  icon: React.ReactNode;
  label: string;
  tone?: "neutral" | "success" | "warning" | "info";
}) {
  const toneCls =
    tone === "success"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : tone === "warning"
        ? "bg-amber-50 text-amber-800 ring-amber-200"
        : tone === "info"
          ? "bg-sky-50 text-sky-700 ring-sky-200"
          : "bg-black/5 text-black/70 ring-black/10";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-medium ring-1",
        toneCls,
      )}
    >
      <span className="opacity-80">{icon}</span>
      <span>{label}</span>
    </span>
  );
}

function Callout({
  title,
  text,
  tone = "neutral",
  icon,
}: {
  title: string;
  text: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "info";
  icon?: React.ReactNode;
}) {
  const toneCls =
    tone === "success"
      ? "bg-emerald-50 ring-emerald-200"
      : tone === "warning"
        ? "bg-amber-50 ring-amber-200"
        : tone === "info"
          ? "bg-sky-50 ring-sky-200"
          : "bg-white ring-black/10";

  const titleCls =
    tone === "success"
      ? "text-emerald-900"
      : tone === "warning"
        ? "text-amber-900"
        : tone === "info"
          ? "text-sky-900"
          : "text-slate-900";

  const textCls =
    tone === "success"
      ? "text-emerald-900/80"
      : tone === "warning"
        ? "text-amber-900/80"
        : tone === "info"
          ? "text-sky-900/80"
          : "text-slate-700";

  return (
    <div className={cn("rounded-2xl p-5 ring-1", toneCls)}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">{icon}</div>
        <div className="min-w-0">
          <div className={cn("text-[14px] font-semibold", titleCls)}>
            {title}
          </div>
          <div className={cn("mt-1 text-[13px] leading-relaxed", textCls)}>
            {text}
          </div>
        </div>
      </div>
    </div>
  );
}

function Accordion({
  sections,
}: {
  sections: Array<{
    id: string;
    title: string;
    icon?: React.ReactNode;
    lead?: string;
    content: React.ReactNode;
  }>;
}) {
  const [openId, setOpenId] = useState<string>(sections[0]?.id ?? "");

  return (
    <div className="space-y-3">
      {sections.map((s) => {
        const isOpen = openId === s.id;
        return (
          <div
            key={s.id}
            className={cn(
              "rounded-3xl bg-white ring-1 ring-black/10 shadow-[0_24px_60px_rgba(15,23,42,.08)]",
              isOpen ? "ring-black/15" : "hover:ring-black/15",
            )}
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? "" : s.id)}
              className="w-full cursor-pointer select-none px-5 py-4 text-left"
              aria-expanded={isOpen}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  {s.icon ? (
                    <div className="mt-0.5 shrink-0 rounded-2xl bg-black/5 p-2 text-black/70 ring-1 ring-black/10">
                      {s.icon}
                    </div>
                  ) : null}

                  <div className="min-w-0">
                    <div className="text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
                      {s.title}
                    </div>
                    {s.lead ? (
                      <div className="mt-1 text-[13px] leading-relaxed text-black/60">
                        {s.lead}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div
                  className={cn(
                    "mt-1 shrink-0 rounded-full bg-black/5 p-2 ring-1 ring-black/10 transition-transform",
                    isOpen ? "rotate-180" : "rotate-0",
                  )}
                >
                  <ChevronDown className="h-4 w-4 text-black/60" />
                </div>
              </div>
            </button>

            <div
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
                isOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <div className="px-5 pb-5 pt-0">
                  <div className="h-px w-full bg-black/10" />
                  <div className="pt-4 text-[14px] leading-relaxed text-slate-700">
                    {s.content}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((t, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-black/35" />
          <span className="text-[14px] leading-relaxed text-slate-700">
            {t}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function WarrantyClient() {
  const sections: Section[] = useMemo(
    () => [
      {
        id: "intro",
        title: "Гарантийные обязательства",
        icon: <ShieldCheck className="h-5 w-5" />,
        lead: "Мы уделяем повышенное внимание долговечности, эксплуатационным и эстетическим качествам мебели.",
        content: (
          <div className="space-y-4">
            <Callout
              tone="success"
              icon={<ShieldCheck className="h-5 w-5 text-emerald-700" />}
              title="Срок гарантии"
              text={
                <>
                  Гарантийные обязательства по бытовой корпусной мебели
                  устанавливаются на срок{" "}
                  <span className="font-semibold text-emerald-900">
                    18 месяцев
                  </span>{" "}
                  со дня получения товара покупателем.
                </>
              }
            />

            <div className="rounded-2xl bg-black/[0.02] p-5 ring-1 ring-black/10">
              <div className="text-[14px] font-semibold text-slate-900">
                На что распространяется гарантия
              </div>
              <div className="mt-2 text-[14px] leading-relaxed text-slate-700">
                Гарантийные обязательства распространяются только на{" "}
                <span className="font-semibold">существенные недостатки</span>{" "}
                (т.е. неустранимые недостатки), которые выявляются неоднократно
                и/или проявляются вновь после их устранения, включая такие
                недостатки товара, которые препятствуют возможности использовать
                товар по назначению.
              </div>

              <div className="mt-4 text-[13px] leading-relaxed text-black/60">
                На недостатки товара, с которыми покупатель был ознакомлен при
                покупке и которые были оговорены при заключении Договора
                купли-продажи, гарантия не распространяется.
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "exclude",
        title: "Случаи, не рассматриваемые как гарантийные",
        icon: <AlertTriangle className="h-5 w-5" />,
        lead: "Перечень ситуаций, при которых обращение не может быть рассмотрено как гарантийное.",
        content: (
          <div className="space-y-4">
            <Callout
              tone="warning"
              icon={<AlertTriangle className="h-5 w-5 text-amber-700" />}
              title="Важно"
              text="Если поломка возникла из-за условий эксплуатации, внешних воздействий или вмешательства третьих лиц — это не гарантийный случай."
            />

            <List
              items={[
                "Не соблюдалась инструкция по эксплуатации или мебель использовалась не по назначению.",
                "Повреждения вызваны стихией, пожаром и другими форс-мажорными обстоятельствами.",
                "Дефекты мебели получены в результате использования неоригинальных деталей и фурнитуры или в результате обслуживания, ремонта или модификации изделия лицами, не являющимися представителями компании LIONETO, включая официальных дилеров.",
                "Неисправность конструкции произошла по причине механических (порезы, царапины, сколы), а также химических повреждений (попадание на мебель жидкостей или агрессивных веществ).",
                "Поломка произошла из-за попадания внутрь механизма посторонних предметов.",
              ]}
            />
          </div>
        ),
      },
      {
        id: "law",
        title: "Нормативные положения (РФ)",
        icon: <Info className="h-5 w-5" />,
        lead: "Информация по Постановлению Правительства РФ № 2463 от 31 декабря 2020 г.",
        content: (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-black/10">
              <div className="flex flex-wrap items-center gap-2">
                <Pill
                  tone="info"
                  icon={<Info className="h-4 w-4" />}
                  label="ПП РФ № 2463 от 31.12.2020"
                />
                <Pill
                  tone="neutral"
                  icon={<FileText className="h-4 w-4" />}
                  label="Права потребителя сохраняются"
                />
              </div>

              <div className="mt-4 text-[14px] leading-relaxed text-slate-700">
                Согласно постановлению Правительства РФ № 2463 от 31 декабря
                2020 г.:
              </div>

              <List
                items={[
                  "Мебель входит в перечень товаров длительного пользования, на которые не распространяется требование потребителя о безвозмездном предоставлении ему товара, обладающего этими же основными потребительскими свойствами, на период ремонта или замены такого товара.",
                  "Мебельные гарнитуры бытового назначения входят в перечень непродовольственных товаров надлежащего качества, не подлежащих обмену.",
                ]}
              />
            </div>

            <Callout
              tone="info"
              icon={<Info className="h-5 w-5 text-sky-700" />}
              title="Юридическая оговорка"
              text="Настоящая гарантия не ущемляет законных прав потребителя, предоставленных действующим законодательством, а также прав потребителя по отношению к дилеру, вытекающих из заключенного договора купли-продажи."
            />
          </div>
        ),
      },
      {
        id: "coupon",
        title: "Гарантийный талон и порядок обращения",
        icon: <ClipboardCheck className="h-5 w-5" />,
        lead: "Что должно быть в талоне и как действовать при выявлении брака в течение гарантийного срока.",
        content: (
          <div className="space-y-4">
            <div className="rounded-2xl bg-black/[0.02] p-5 ring-1 ring-black/10">
              <div className="text-[14px] font-semibold text-slate-900">
                Гарантийный талон
              </div>
              <div className="mt-2 text-[14px] leading-relaxed text-slate-700">
                Гарантийный талон содержит перечень соответствующих условий и
                служит документом, подтверждающим право покупателя на
                гарантийное обслуживание.
              </div>

              <List
                items={[
                  "Гарантия действительна при наличии правильно заполненного гарантийного талона с ФИО заказчика и его подписью.",
                  "В талоне обязательно должны быть указаны наименование изделия, артикул пакета и дата покупки мебели.",
                ]}
              />
            </div>

            <Callout
              tone="success"
              icon={<ShieldCheck className="h-5 w-5 text-emerald-700" />}
              title="Если выявлен брак (в течение 18 месяцев)"
              text={
                <>
                  Необходимо обратиться в торговую точку, где была совершена
                  покупка товара компании LIONETO. Сотрудники торговой точки
                  помогут определить характер дефекта и оформить необходимые
                  документы.
                </>
              }
            />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <main className="bg-[#fafafa]">
      {/* HERO */}
      <section className="px-4 pt-10 md:pt-14">
        <div className="mx-auto w-full max-w-[1100px]">
          <div className="rounded-[28px] bg-white px-6 py-7 ring-1 ring-black/10 shadow-[0_24px_60px_rgba(15,23,42,.08)] md:px-10 md:py-10">
            <div className="flex flex-wrap items-center gap-2">
              <Pill
                tone="success"
                icon={<ShieldCheck className="h-4 w-4" />}
                label="Гарантия 18 месяцев"
              />
              <Pill
                tone="neutral"
                icon={<FileText className="h-4 w-4" />}
                label="Официальные условия LIONETO"
              />
              <Pill
                tone="warning"
                icon={<AlertTriangle className="h-4 w-4" />}
                label="Есть исключения — смотрите ниже"
              />
            </div>

            <h1 className="mt-4 text-[28px] font-extrabold tracking-[-0.03em] text-slate-900 md:text-[40px] md:leading-[1.05]">
              Гарантия и сервисное обслуживание
            </h1>

            <p className="mt-3 max-w-[880px] text-[14px] leading-relaxed text-black/60 md:text-[15px]">
              Стремясь обеспечить максимальное удовлетворение покупателей от
              использования новой мебели, компания LIONETO уделяет повышенное
              внимание долговечности, её эксплуатационным качествам и
              эстетическим свойствам.
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-black/[0.02] p-4 ring-1 ring-black/10">
                <div className="text-[12px] font-semibold text-black/60">
                  Срок
                </div>
                <div className="mt-1 text-[16px] font-semibold text-slate-900">
                  18 месяцев
                </div>
                <div className="mt-1 text-[13px] leading-relaxed text-black/60">
                  Со дня получения товара покупателем
                </div>
              </div>

              <div className="rounded-2xl bg-black/[0.02] p-4 ring-1 ring-black/10">
                <div className="text-[12px] font-semibold text-black/60">
                  Гарантия
                </div>
                <div className="mt-1 text-[16px] font-semibold text-slate-900">
                  Существенные недостатки
                </div>
                <div className="mt-1 text-[13px] leading-relaxed text-black/60">
                  Неустранимые или повторяющиеся после устранения
                </div>
              </div>

              <div className="rounded-2xl bg-black/[0.02] p-4 ring-1 ring-black/10">
                <div className="text-[12px] font-semibold text-black/60">
                  Обращение
                </div>
                <div className="mt-1 text-[16px] font-semibold text-slate-900">
                  Через место покупки
                </div>
                <div className="mt-1 text-[13px] leading-relaxed text-black/60">
                  Торговая точка поможет оформить документы
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="px-4 pb-14 pt-6 md:pb-20 md:pt-8">
        <div className="mx-auto w-full max-w-[1100px]">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            {/* left */}
            <div>
              <Accordion
                sections={sections.map((s) => ({
                  id: s.id,
                  title: s.title,
                  icon: s.icon,
                  lead: s.lead,
                  content: s.content,
                }))}
              />
            </div>

            {/* right sticky summary */}
            <aside className="lg:sticky lg:top-6">
              <div className="rounded-[28px] bg-white p-6 ring-1 ring-black/10 shadow-[0_24px_60px_rgba(15,23,42,.08)]">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-black/5 p-2 ring-1 ring-black/10">
                    <FileText className="h-5 w-5 text-black/70" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold text-slate-900">
                      Коротко о главном
                    </div>
                    <div className="text-[13px] text-black/60">
                      Условия гарантийного обслуживания
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <Callout
                    tone="success"
                    icon={<ShieldCheck className="h-5 w-5 text-emerald-700" />}
                    title="18 месяцев"
                    text="С даты получения товара покупателем."
                  />
                  <Callout
                    tone="neutral"
                    icon={<Info className="h-5 w-5 text-black/70" />}
                    title="Только существенные недостатки"
                    text="Неустранимые или повторяющиеся после устранения."
                  />
                  <Callout
                    tone="warning"
                    icon={<AlertTriangle className="h-5 w-5 text-amber-700" />}
                    title="Не гарантия"
                    text="Механические/химические повреждения, форс-мажор, вмешательство третьих лиц."
                  />
                </div>

                <div className="mt-5 rounded-2xl bg-black/[0.02] p-4 ring-1 ring-black/10">
                  <div className="text-[13px] font-semibold text-slate-900">
                    Документы
                  </div>
                  <div className="mt-1 text-[13px] leading-relaxed text-black/60">
                    Гарантия действительна при наличии корректно заполненного
                    гарантийного талона: ФИО, подпись, изделие, артикул пакета,
                    дата покупки.
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
