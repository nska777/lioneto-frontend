"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Instagram,
  Youtube,
  Send,
  Facebook,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import { COMFORT_PLUS_LEGAL } from "@/app/lib/stores/stores-data";

/* ================= TYPES ================= */

type FooterLink = { label: string; href: string };
type FooterColumn = { title: string; links: FooterLink[] };

type LegalDownloadLink = {
  label: string;
  href: string;
  fileName: string;
};

type FooterData = {
  brand: {
    title: string;
    description: string;
    tagline?: string;
  };
  columns: FooterColumn[];
  contacts: {
    phones: { label: string; value: string; href?: string }[];
    email: { label: string; value: string; href?: string };
    addresses: {
      label: string;
      value: string;
      mapUrl?: string;
    }[];
  };
  socials: {
    label: string;
    href: string;
    icon: "instagram" | "telegram" | "youtube" | "facebook";
  }[];
  legalLinks: LegalDownloadLink[];
};

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

function SocialIcon({ name }: { name: FooterData["socials"][number]["icon"] }) {
  const cls = "h-5 w-5";

  if (name === "instagram") return <Instagram className={cls} />;
  if (name === "telegram") return <Send className={cls} />;
  if (name === "youtube") return <Youtube className={cls} />;

  return <Facebook className={cls} />;
}

const seoCollectionLinks: FooterLink[] = [
  {
    label: "Коллекция AMBER",
    href: "/catalog?menu=bedrooms&collections=amber&hero=1",
  },
  {
    label: "Коллекция SCANDI",
    href: "/catalog?menu=living&collections=scandi&hero=1",
  },
  {
    label: "Коллекция ELIZABETH",
    href: "/catalog?menu=bedrooms&collections=elizabeth&hero=1",
  },
  {
    label: "Коллекция SALVADOR",
    href: "/catalog?menu=bedrooms&collections=salvador&hero=1",
  },
  {
    label: "Коллекция PITTI",
    href: "/catalog?menu=bedrooms&collections=pitti&hero=1",
  },
  {
    label: "Коллекция BUONGIORNO",
    href: "/catalog?menu=bedrooms&collections=buongiorno&hero=1",
  },
];

function LegalInfoFooterBlock() {
  return (
    <div className="border-t border-white/10 pt-8">
      <div className="text-center text-[12px] font-semibold uppercase tracking-[0.24em] text-white/70">
        Юридическая информация
      </div>

      <div className="mx-auto mt-6 grid max-w-[980px] gap-4 text-[12px] leading-6 text-white/50 md:grid-cols-3 md:gap-6">
        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 text-center md:text-left">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
            Компания
          </div>

          <div className="text-[13px] font-semibold text-white/75">
            {COMFORT_PLUS_LEGAL.title}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 text-center md:text-left">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
            Юридический адрес
          </div>

          <div className="text-[12px] leading-6 text-white/60">
            {COMFORT_PLUS_LEGAL.legalAddress}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 text-center md:text-left">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
            Реквизиты
          </div>

          <div className="space-y-1.5 text-[12px] leading-6">
            <div className="flex justify-center gap-2 md:justify-between">
              <span className="text-white/35">ОГРН</span>
              <span className="font-semibold text-white/70">
                {COMFORT_PLUS_LEGAL.ogrn}
              </span>
            </div>

            <div className="flex justify-center gap-2 md:justify-between">
              <span className="text-white/35">ИНН</span>
              <span className="font-semibold text-white/70">
                {COMFORT_PLUS_LEGAL.inn}
              </span>
            </div>

            <div className="flex justify-center gap-2 md:justify-between">
              <span className="text-white/35">КПП</span>
              <span className="font-semibold text-white/70">
                {COMFORT_PLUS_LEGAL.kpp}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */

export default function Footer({ data }: { data?: Partial<FooterData> }) {
  const footerData = useMemo<FooterData>(() => {
    return {
      brand: data?.brand ?? {
        title: "LIONETO",
        tagline: "Premium interior",
        description:
          "Премиальная мебель для современных интерьеров и коммерческих пространств.",
      },
      columns: data?.columns ?? [
        {
          title: "Навигация",
          links: [
            { label: "Каталог", href: "/catalog" },
            { label: "О компании", href: "/about" },
            { label: "Новости", href: "/news" },
            { label: "Контакты", href: "/contacts" },
          ],
        },
        {
          title: "Коллекции",
          links: seoCollectionLinks,
        },
        {
          title: "Покупателям",
          links: [
            { label: "Доставка и оплата", href: "/delivery" },
            { label: "Возврат", href: "/return" },
            { label: "Гарантия", href: "/warranty" },
            { label: "Уход за мебелью", href: "/care" },
          ],
        },
      ],
      contacts: data?.contacts ?? {
        phones: [
          {
            label: "Телефон",
            value: "+998 (90) 003-80-08",
            href: "tel:+998900038008",
          },
          {
            label: "",
            value: "+998 (90) 925-60-06",
            href: "tel:+998909256006",
          },
        ],
        email: {
          label: "Email",
          value: "info@lioneto.uz",
          href: "mailto:info@lioneto.uz",
        },
        addresses: [
          {
            label: "Ташкент",
            value:
              "Rich House: г. Ташкент, Мирзо-Улугбекский район, проспект Мирзо Улугбека, 18",
            mapUrl:
              "https://yandex.ru/maps/?text=ул.%20Мирзо-Улугбек,%2018,%20Ташкент",
          },
        ],
      },
      socials: data?.socials ?? [
        {
          label: "Instagram",
          href: "https://www.instagram.com/lioneto.uz?igsh=MWZoaHRzcjUxenF1bw%3D%3D&utm_source=qr",
          icon: "instagram",
        },
        {
          label: "Telegram",
          href: "https://t.me/lianetouz",
          icon: "telegram",
        },
      ],
      legalLinks: data?.legalLinks ?? [
        {
          label: "Политика конфиденциальности",
          href: "/docs/privacy-policy.docx",
          fileName: "privacy-policy.docx",
        },
        {
          label: "Публичная оферта",
          href: "/docs/offer-agreement.docx",
          fileName: "offer-agreement.docx",
        },
      ],
    };
  }, [data]);

  const DISABLE_CUSTOMER_LINKS = new Set(["Доставка и оплата", "Возврат"]);

  return (
    <footer className="bg-black text-white" aria-label="Footer">
      <div className="mx-auto w-full max-w-[1200px] px-4">
        <div className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1.5fr_1fr_1.8fr] lg:gap-9">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative h-20 w-20 overflow-hidden rounded-full md:h-24 md:w-24">
                <Image
                  src="/logo-lioneto.svg"
                  alt="Lioneto"
                  fill
                  sizes="96px"
                  className="object-contain p-1"
                  priority={false}
                />
              </div>

              <div>
                <div className="text-[14px] font-semibold tracking-[0.26em]">
                  {footerData.brand.title}
                </div>

                {footerData.brand.tagline && (
                  <div className="mt-1 text-[12px] text-white/55">
                    {footerData.brand.tagline}
                  </div>
                )}
              </div>
            </div>

            <p className="max-w-[34ch] text-[13px] leading-relaxed text-white/60">
              {footerData.brand.description}
            </p>
          </div>

          {footerData.columns.map((col) => (
            <div key={col.title} className="space-y-4">
              <div className="text-[12px] font-semibold tracking-[0.18em] text-white/70">
                {col.title}
              </div>

              <ul className="space-y-2">
                {col.links.map((l) => {
                  const isCustomers = col.title === "Покупателям";
                  const disabled =
                    isCustomers && DISABLE_CUSTOMER_LINKS.has(l.label);

                  return (
                    <li key={`${col.title}-${l.label}`}>
                      {disabled ? (
                        <div
                          className={cn(
                            "inline-flex items-center gap-2 text-[13px] leading-6 text-white/55",
                            "select-none",
                          )}
                        >
                          <span className="h-[4px] w-[4px] shrink-0 rounded-full bg-white/25" />
                          {l.label}
                        </div>
                      ) : (
                        <Link
                          href={l.href}
                          className={cn(
                            "inline-flex items-center gap-2 text-[13px] leading-6 text-white/55",
                            "transition-colors hover:text-white",
                            "cursor-pointer",
                          )}
                        >
                          <span className="h-[4px] w-[4px] shrink-0 rounded-full bg-white/25" />
                          {l.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          <div className="space-y-5">
            <div className="text-[12px] font-semibold tracking-[0.18em] text-white/70">
              Контакты
            </div>

            <div className="space-y-3">
              {footerData.contacts.phones.map((p) => (
                <a
                  key={p.value}
                  href={p.href}
                  className="flex cursor-pointer items-center gap-2 text-[13px] leading-6 text-white/60 transition-colors hover:text-white"
                >
                  <Phone className="h-4 w-4 shrink-0 text-white/40" />
                  <span>{p.value}</span>
                </a>
              ))}

              <a
                href={footerData.contacts.email.href}
                className="flex cursor-pointer items-center gap-2 text-[13px] leading-6 text-white/60 transition-colors hover:text-white"
              >
                <Mail className="h-4 w-4 shrink-0 text-white/40" />
                <span>{footerData.contacts.email.value}</span>
              </a>

              {footerData.contacts.addresses.map((a) => (
                <a
                  key={a.value}
                  href={a.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex cursor-pointer items-start gap-2 text-[13px] leading-6 text-white/60 transition-colors hover:text-white"
                >
                  <MapPin className="mt-[4px] h-4 w-4 shrink-0 text-white/40 transition-colors group-hover:text-white" />

                  <div>
                    <div className="text-[12px] text-white/45">{a.label}</div>

                    <div className="max-w-[260px] text-white/75 underline-offset-4 group-hover:underline">
                      {a.value}
                    </div>
                  </div>
                </a>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              {footerData.socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-white/15 bg-white/5 transition-colors hover:bg-white/10"
                >
                  <SocialIcon name={s.icon} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pb-2">
          <LegalInfoFooterBlock />
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 py-6 md:flex-row md:items-center md:justify-between">
          <div className="text-[12px] text-white/45">
            © {new Date().getFullYear()} {footerData.brand.title}. Все права
            защищены.
          </div>

          <div className="flex flex-wrap gap-4">
            {footerData.legalLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                download={l.fileName}
                className="cursor-pointer text-[12px] text-white/45 transition-colors hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
