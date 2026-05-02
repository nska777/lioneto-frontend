"use client";

import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  type SyntheticEvent,
} from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import {
  Store,
  Palette,
  Truck,
  Package,
  Globe,
  Trash2,
  ArrowDown,
  Send,
  Download,
  X,
} from "lucide-react";

type ContactMethod = "call" | "max" | "whatsapp" | "telegram";
type Region = "UZ" | "RU";
type PrivacyConsent = "accepted" | "declined" | null;

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

function PrivacyPolicyWindow({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open || typeof document === "undefined") return null;

  const stopAll = (e: SyntheticEvent) => {
    e.stopPropagation();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/55 px-4 py-6"
      onClick={stopAll}
      onMouseDown={stopAll}
      onPointerDown={stopAll}
      onTouchStart={stopAll}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-[920px] flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-5 border-b border-black/10 px-5 py-5 sm:px-7">
          <div>
            <p className="text-[12px] uppercase tracking-[0.22em] text-black/45">
              LIONETO
            </p>

            <h2 className="mt-2 text-[20px] font-semibold leading-tight text-black sm:text-[24px]">
              Политика обработки персональных данных
            </h2>

            <p className="mt-2 text-[13px] leading-6 text-black/55">
              Согласие на обработку персональных данных и использование файлов
              cookie.
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="shrink-0 cursor-pointer rounded-full p-2 text-black/45 transition hover:bg-black/5 hover:text-black"
            aria-label="Закрыть"
          >
            <X size={22} />
          </button>
        </div>

        <div
          className="overflow-y-auto px-5 py-6 text-[14px] leading-7 text-black/70 sm:px-7"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="mb-6 rounded-[22px] bg-black/[0.03] px-5 py-4">
            <h3 className="text-[18px] font-semibold leading-tight text-black">
              Политика обработки персональных данных и использования Cookies
            </h3>

            <p className="mt-2 text-[13px] leading-6 text-black/55">
              Настоящий документ определяет порядок обработки персональных
              данных Пользователей сайта, а также условия использования файлов
              cookie.
            </p>
          </div>

          <section className="space-y-4">
            <h3 className="text-[17px] font-semibold text-black">
              1. Согласие на обработку персональных данных
            </h3>

            <p>
              Настоящим Пользователь дает согласие ООО «Комфорт плюс» на
              обработку всех указанных им персональных данных, включая, но не
              ограничиваясь следующими сведениями:
            </p>

            <ul className="list-disc space-y-2 pl-6">
              <li>фамилия, имя и отчество;</li>
              <li>номер телефона;</li>
              <li>гражданство;</li>
              <li>пол;</li>
              <li>возраст;</li>
              <li>дата и место рождения;</li>
              <li>
                серия и номер основного документа, удостоверяющего личность,
                сведения о дате выдачи указанного документа и выдавшем его
                органе;
              </li>
              <li>адрес регистрации по месту жительства;</li>
              <li>адрес фактического проживания;</li>
              <li>идентификационный номер налогоплательщика;</li>
              <li>страховой номер индивидуального лицевого счета;</li>
              <li>адрес электронной почты;</li>
              <li>адрес доставки и местоположение;</li>
              <li>информация об избранных контактах;</li>
              <li>
                любая другая информация, передаваемая посредством cookies сайта;
              </li>
              <li>
                иные данные, полученные в результате их обработки любыми
                способами, включая воспроизведение, электронное копирование,
                обезличивание, блокирование и уничтожение.
              </li>
            </ul>
          </section>

          <section className="mt-8 space-y-4">
            <h3 className="text-[17px] font-semibold text-black">
              2. Цели обработки персональных данных
            </h3>

            <p>
              Обработка персональных данных может осуществляться Обществом, а
              также третьими лицами, действующими по поручению Общества, в
              следующих целях:
            </p>

            <ul className="list-disc space-y-2 pl-6">
              <li>обеспечение информационной поддержки Пользователя;</li>
              <li>оказание услуг, связанных с деятельностью Общества;</li>
              <li>
                создание и сопровождение информационных систем персональных
                данных Общества;
              </li>
              <li>
                направление Пользователю рекламных материалов, информации,
                уведомлений и запросов, в том числе посредством сети Интернет и
                телефонной связи;
              </li>
              <li>
                обеспечение интересов Общества и Пользователя, а также в иных
                целях, прямо или косвенно связанных с обслуживанием и
                предложением продуктов Общества.
              </li>
            </ul>
          </section>

          <section className="mt-8 space-y-4">
            <h3 className="text-[17px] font-semibold text-black">
              3. Оператор персональных данных
            </h3>

            <div className="rounded-[22px] bg-black/[0.03] p-4 text-black/70">
              <p className="font-semibold text-black">ООО «Комфорт плюс»</p>
              <p>ИНН 9721264165 / КПП 772101001 / ОГРН 1267700104352</p>
              <p>
                109443, г. Москва, вн. тер. г. муниципальный округ Кузьминки,
                пр-кт Волгоградский, д. 135 к. 3, помещ. 7М
              </p>
            </div>

            <p>
              Указанное согласие предоставляется сроком на 5 лет. В случае
              отзыва согласия обработка персональных данных должна быть
              прекращена Обществом и/или третьими лицами, а персональные данные
              подлежат уничтожению в установленном порядке.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h3 className="text-[17px] font-semibold text-black">
              4. Правила использования персональных данных
            </h3>

            <p>
              Собираемые персональные данные позволяют направлять Пользователям
              уведомления о новых продуктах, специальных предложениях и
              различных событиях. Они также помогают Обществу совершенствовать
              услуги, контент и коммуникации.
            </p>

            <p>
              В случае нежелания получать рассылку Пользователь может в любое
              время отказаться от нее путем направления письменного уведомления
              на электронный адрес{" "}
              <a
                href="mailto:info@lioneto.uz"
                className="cursor-pointer font-medium text-black underline underline-offset-4"
              >
                info@lioneto.uz
              </a>
              .
            </p>

            <p>
              Общество может использовать персональные данные Пользователя для
              отправки важных уведомлений, содержащих информацию об изменениях
              положений, условий и политик, а также уведомлений, связанных с
              размещенными заказами и совершенными покупками.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h3 className="text-[17px] font-semibold text-black">
              5. Согласие на использование Cookies
            </h3>

            <p>
              Сайт использует файлы cookies для корректной работы, сохранения
              пользовательских настроек, отображения актуальных товаров, цен,
              акций и улучшения пользовательского опыта.
            </p>

            <p>
              Cookies — это небольшие файлы, которые браузер сохраняет на
              устройстве Пользователя. Они позволяют сайту узнавать Пользователя
              при повторном посещении и учитывать ранее выбранные настройки.
            </p>

            <p>
              Пользователь может отказаться от персонализации, запретив
              сохранение cookies в настройках своего браузера. В таком случае
              отдельные функции сайта могут работать ограниченно.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h3 className="text-[17px] font-semibold text-black">
              6. Политика использования Cookies
            </h3>

            <p>
              Пользователь сайта подтверждает, что согласен на использование
              файлов cookie и ознакомлен с настоящей политикой.
            </p>

            <p>
              Файлы cookie не несут угрозы безопасности данным Пользователя.
              Помимо сохранения персональных настроек и предпочтений они
              используются для:
            </p>

            <ul className="list-disc space-y-2 pl-6">
              <li>совершенствования продуктов и услуг;</li>
              <li>
                предоставления более точной информации по запросу посетителя;
              </li>
              <li>
                корректной работы компонентов сайта, веб-страниц и навигации;
              </li>
              <li>подбора персональных предложений;</li>
              <li>сбора статистических данных сайта.</li>
            </ul>

            <p>Срок хранения cookie-файлов зависит от их типа:</p>

            <ul className="list-disc space-y-2 pl-6">
              <li>сеансовые — удаляются при закрытии браузера;</li>
              <li>
                постоянные — сохраняются продолжительное время для повторного
                использования сайта;
              </li>
              <li>
                статистические — содержат информацию о действиях посетителя на
                сайте;
              </li>
              <li>обязательные — необходимы для корректной работы сайта.</li>
            </ul>

            <p>
              Настоящая политика предусматривает обязательства Общества по
              неразглашению и обеспечению защиты конфиденциальности данных
              посетителей сайта.
            </p>

            <p>
              ООО «Комфорт плюс» оставляет за собой право вносить изменения в
              настоящую Политику путем размещения обновленной редакции на сайте{" "}
              <a
                href="https://lioneto.com/"
                target="_blank"
                rel="noreferrer"
                className="cursor-pointer font-medium text-black underline underline-offset-4"
              >
                https://lioneto.com/
              </a>
              .
            </p>
          </section>

          <div className="mt-8 flex flex-col gap-3 border-t border-black/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[12px] leading-5 text-black/45">
              Полная версия документа доступна для скачивания в формате Word.
            </p>

            <a
              href="/docs/privacy-policy.docx"
              download="privacy-policy.docx"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-[13px] font-medium text-white transition hover:opacity-90"
            >
              <Download size={16} />
              Скачать документ
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

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
        "group w-full cursor-pointer rounded-3xl border p-4 text-left transition md:p-5",
        "outline-none focus-visible:ring-2 focus-visible:ring-black/10 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        active
          ? "border-emerald-600 bg-emerald-600 hover:border-emerald-700 hover:bg-emerald-700"
          : "border-black/10 bg-white hover:border-black/18",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border transition",
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
            "cursor-pointer rounded-full px-4 py-2 text-[12px] font-medium tracking-[0.14em] transition",
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
  const searchParams = useSearchParams();

  const [region, setRegion] = useState<Region>("UZ");
  const [formats, setFormats] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState<PrivacyConsent>(null);

  const [form, setForm] = useState({
    firstName: "",
    email: "",
    website: "",
    city: "",
    phoneDigits: "",
    method: "call" as ContactMethod,
    comment: "",
  });

  useEffect(() => {
    setRegion(readRegionFromStorage());
  }, []);

  useEffect(() => {
    const onStorage = () => setRegion(readRegionFromStorage());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const interest = searchParams.get("interest");

    if (interest === "dealer") {
      setFormats((prev) => (prev.includes("dealer") ? prev : ["dealer"]));
    }
  }, [searchParams]);

  const pickedFormats = useMemo(() => {
    const m = new Map(FORMATS.map((x) => [x.id, x.title]));
    return formats.map((id) => m.get(id)).filter(Boolean) as string[];
  }, [formats]);

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

  const hasAcceptedPrivacy = privacyConsent === "accepted";

  const canSend =
    form.firstName.trim().length > 0 &&
    phoneView.digits.length === phoneView.maxLen &&
    hasAcceptedPrivacy;

  const toggle = (arr: string[], id: string) =>
    arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];

  const clearAll = () => {
    setFormats([]);
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
      lastName: "",
      email: form.email.trim(),
      website: form.website.trim(),
      phone: phoneView.fullE164,
      company: "",
      city: form.city.trim(),
      contactMethod: form.method,
      comment: form.comment.trim(),
      formats: pickedFormats,
      interests: [],
      region,
      pageUrl,
      privacyConsent: "accepted",
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
        email: "",
        website: "",
        city: "",
        phoneDigits: "",
        method: "call",
        comment: "",
      });
      setPrivacyConsent(null);
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
    <>
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-10 md:space-y-14">
        <section className="relative overflow-hidden rounded-3xl border border-black/10 bg-white p-6 md:p-10">
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
                  "inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-black px-4 py-3",
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
          <div className="space-y-10 md:col-span-7">
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
                eyebrow="КОНТАКТЫ"
                title="Контакты"
                desc="Оставьте контакты — мы свяжемся в удобном формате."
              />

              <div className="mt-5 rounded-3xl border border-black/10 bg-white p-5 md:p-6">
                <div className="grid gap-3">
                  <input
                    value={form.firstName}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, firstName: e.target.value }))
                    }
                    placeholder="Имя*"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[14px] text-black/80 outline-none transition focus:border-black/25"
                  />

                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      value={form.city}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, city: e.target.value }))
                      }
                      placeholder="Город"
                      className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[14px] text-black/80 outline-none transition focus:border-black/25"
                    />

                    <input
                      value={form.email}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, email: e.target.value }))
                      }
                      placeholder="Email (необязательно)"
                      inputMode="email"
                      className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[14px] text-black/80 outline-none transition focus:border-black/25"
                    />
                  </div>

                  <input
                    value={form.website}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, website: e.target.value }))
                    }
                    placeholder="Web сайт (необязательно)"
                    inputMode="url"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[14px] text-black/80 outline-none transition focus:border-black/25"
                  />

                  <div className="grid gap-2">
                    <div className="text-[12px] tracking-[0.14em] text-black/45">
                      Телефон*
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3">
                      <div className="select-none text-[14px] text-black/55">
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
                        ? `Пример: ${phoneView.display}`
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
                          { id: "call", label: "Звонок" },
                          { id: "max", label: "MAX" },
                          { id: "whatsapp", label: "WhatsApp" },
                          { id: "telegram", label: "Telegram" },
                        ] as const
                      ).map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() =>
                            setForm((p) => ({ ...p, method: m.id }))
                          }
                          className={cn(
                            "cursor-pointer rounded-full border px-4 py-2 text-[12px] font-medium tracking-[0.16em] transition",
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
                    placeholder="Вкратце опишите цель звонка"
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

                <div className="mt-5 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={clearAll}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3 text-[12px] tracking-[0.16em] text-black/70 transition hover:border-black/18 hover:text-black"
                  >
                    <Trash2 className="h-4 w-4 text-black/45" />
                    ОЧИСТИТЬ
                  </button>

                  <div className="text-right text-[11px] text-black/45">
                    Это уйдёт менеджеру
                  </div>
                </div>

                <div className="mt-5 rounded-[20px] border border-black/10 bg-black/[0.02] px-4 py-4">
                  <p className="text-[12px] leading-5 text-black/55">
                    Перед отправкой заявки выберите согласие на обработку
                    персональных данных. Подробные условия доступны в{" "}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setPrivacyOpen(true);
                      }}
                      className="cursor-pointer font-medium text-black underline underline-offset-4 transition hover:text-black/60"
                    >
                      пользовательском соглашении
                    </button>
                    .
                  </p>

                  <div className="mt-3 space-y-2">
                    <label
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-2xl bg-white px-3 py-3 text-[12px] leading-5 text-black/70 ring-1 transition",
                        privacyConsent === "accepted"
                          ? "bg-white ring-black"
                          : "ring-black/10 hover:ring-black/20",
                      )}
                    >
                      <input
                        type="radio"
                        name="privacyConsent"
                        checked={privacyConsent === "accepted"}
                        onChange={() => setPrivacyConsent("accepted")}
                        className="mt-1 h-4 w-4 accent-black"
                      />

                      <span>
                        Я даю согласие на обработку персональных данных и
                        принимаю условия пользовательского соглашения.
                      </span>
                    </label>

                    <label
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-2xl bg-white px-3 py-3 text-[12px] leading-5 text-black/70 ring-1 transition",
                        privacyConsent === "declined"
                          ? "bg-red-50 ring-red-300"
                          : "ring-black/10 hover:ring-black/20",
                      )}
                    >
                      <input
                        type="radio"
                        name="privacyConsent"
                        checked={privacyConsent === "declined"}
                        onChange={() => setPrivacyConsent("declined")}
                        className="mt-1 h-4 w-4 accent-black"
                      />

                      <span>
                        Я отказываюсь от обработки персональных данных и
                        понимаю, что отправка заявки будет недоступна.
                      </span>
                    </label>
                  </div>

                  {privacyConsent === "declined" && (
                    <p className="mt-3 rounded-2xl bg-red-50 px-3 py-2 text-[12px] leading-5 text-red-700 ring-1 ring-red-100">
                      Без согласия на обработку персональных данных мы не сможем
                      принять заявку через форму.
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={submit}
                  disabled={!canSend || sending}
                  className={cn(
                    "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-4 py-3",
                    "text-[12px] font-medium tracking-[0.18em] text-white transition",
                    "hover:opacity-95 active:scale-[0.99]",
                    (!canSend || sending) && "cursor-not-allowed opacity-40",
                  )}
                >
                  <Send className="h-4 w-4" />
                  {sending ? "ОТПРАВКА..." : "ОТПРАВИТЬ"}
                </button>

                <div className="mt-3 text-[11px] leading-5 text-black/45">
                  Для отправки нужно: <b>имя</b>, <b>телефон</b> и{" "}
                  <b>согласие на обработку персональных данных</b>.
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <PrivacyPolicyWindow
        open={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
      />
    </>
  );
}
