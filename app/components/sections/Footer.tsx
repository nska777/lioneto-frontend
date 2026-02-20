"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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

gsap.registerPlugin(ScrollTrigger);

/* ================= TYPES ================= */

type FooterLink = { label: string; href: string };
type FooterColumn = { title: string; links: FooterLink[] };

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
  legalLinks: FooterLink[];
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

/* ================= COMPONENT ================= */

export default function Footer({ data }: { data?: FooterData }) {
  const rootRef = useRef<HTMLElement | null>(null);

  const footerData = useMemo<FooterData>(() => {
    return (
      data ?? {
        brand: {
          title: "LIONETO",
          tagline: "Premium interior",
          description:
            "Премиальная мебель для современных интерьеров и коммерческих пространств.",
        },
        columns: [
          {
            title: "Навигация",
            links: [
              { label: "Каталог", href: "/catalog" },
              { label: "Коллекции", href: "/collections" },
              { label: "О компании", href: "/about" },
              { label: "Новости", href: "/news" },
            ],
          },
          {
            title: "Покупателям",
            links: [
              { label: "Доставка и оплата", href: "/delivery" },
              { label: "Возврат", href: "/return" },
              { label: "Гарантия", href: "/warranty" },
              { label: "Контакты", href: "/contacts" },
            ],
          },
        ],
        contacts: {
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
                " Rich House: г. Ташкент, Мирзо-Улугбекский район, проспект Мирзо Улугбека, 18 ",
              mapUrl:
                "https://yandex.ru/maps/?text=ул.%20Мирзо-Улугбек,%2018,%20Ташкент",
            },
          ],
        },
        socials: [
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
        legalLinks: [
          { label: "Политика конфиденциальности", href: "/privacy" },
          { label: "Публичная оферта", href: "/offer" },
        ],
      }
    );
  }, [data]);

  /* ================= GSAP (FIXED) ================= */

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const ctx = gsap.context(() => {
      const targets = gsap.utils.toArray<HTMLElement>("[data-ft-reveal]");
      if (!targets.length) return;

      if (!reduceMotion) {
        gsap.set(targets, { autoAlpha: 0, y: 14 });
      } else {
        gsap.set(targets, { autoAlpha: 1, y: 0 });
        return;
      }

      let revealed = false;

      const reveal = () => {
        if (revealed) return;
        revealed = true;

        gsap.to(targets, {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.07,
          overwrite: true,
        });
      };

      const checkAndRevealIfInView = () => {
        const r = root.getBoundingClientRect();
        const vh = window.innerHeight || 0;
        const inView = r.top < vh * 0.9;
        if (inView) reveal();
      };

      const st = ScrollTrigger.create({
        trigger: root,
        start: "top 90%",
        once: true,
        onEnter: reveal,
        onRefresh: checkAndRevealIfInView,
      });

      requestAnimationFrame(() => {
        checkAndRevealIfInView();
      });

      let raf = 0;
      const scheduleRefresh = () => {
        if (revealed) return;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          checkAndRevealIfInView();
        });
      };

      const onLoad = () => scheduleRefresh();
      window.addEventListener("load", onLoad, { once: true });

      let ro: ResizeObserver | null = null;
      if (typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver(() => scheduleRefresh());
        ro.observe(document.documentElement);
      }

      let mo: MutationObserver | null = null;
      if (typeof MutationObserver !== "undefined") {
        mo = new MutationObserver(() => scheduleRefresh());
        mo.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
        });
      }

      requestAnimationFrame(() => scheduleRefresh());

      return () => {
        window.removeEventListener("load", onLoad);
        if (raf) cancelAnimationFrame(raf);
        ro?.disconnect();
        mo?.disconnect();
        st.kill();
      };
    }, root);

    return () => ctx.revert();
  }, []);

  /* ================= JSX ================= */

  // ✅ делаем пункты "Покупателям" некликабельными (в футере)
  const DISABLE_CUSTOMER_LINKS = new Set([
    "Доставка и оплата",
    "Возврат",
    "Гарантия",
    "Контакты",
  ]);

  return (
    <footer ref={rootRef} className="bg-black text-white" aria-label="Footer">
      <div className="mx-auto w-full max-w-[1200px] px-4">
        {/* TOP */}
        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
          {/* BRAND */}
          <div data-ft-reveal className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative h-25 w-25 overflow-hidden rounded-full">
                <Image
                  src="/logo-lioneto.svg"
                  alt="Lioneto"
                  fill
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

            <p className="max-w-[42ch] text-[13px] leading-relaxed text-white/60">
              {footerData.brand.description}
            </p>
          </div>

          {/* COLUMNS */}
          {footerData.columns.map((col) => (
            <div key={col.title} data-ft-reveal className="space-y-4">
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
                            "inline-flex items-center gap-2 text-[13px] text-white/55",
                            "select-none",
                          )}
                        >
                          <span className="h-[4px] w-[4px] rounded-full bg-white/25" />
                          {l.label}
                        </div>
                      ) : (
                        <Link
                          href={l.href}
                          className={cn(
                            "inline-flex items-center gap-2 text-[13px] text-white/55",
                            "transition hover:text-white hover:-translate-y-[1px]",
                            "cursor-pointer",
                          )}
                        >
                          <span className="h-[4px] w-[4px] rounded-full bg-white/25" />
                          {l.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {/* CONTACTS */}
          <div data-ft-reveal className="space-y-5">
            <div className="text-[12px] font-semibold tracking-[0.18em] text-white/70">
              Контакты
            </div>

            <div className="space-y-3">
              {footerData.contacts.phones.map((p) => (
                <a
                  key={p.value}
                  href={p.href}
                  className="flex items-center gap-2 text-[13px] text-white/60 transition hover:text-white hover:-translate-y-[1px] cursor-pointer"
                >
                  <Phone className="h-4 w-4 text-white/40" />
                  <span>{p.value}</span>
                </a>
              ))}

              <a
                href={footerData.contacts.email.href}
                className="flex items-center gap-2 text-[13px] text-white/60 transition hover:text-white hover:-translate-y-[1px] cursor-pointer"
              >
                <Mail className="h-4 w-4 text-white/40" />
                <span>{footerData.contacts.email.value}</span>
              </a>

              {/* ADDRESS → YANDEX MAPS */}
              {footerData.contacts.addresses.map((a) => (
                <a
                  key={a.value}
                  href={a.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-start gap-2 text-[13px] text-white/60 transition hover:text-white hover:-translate-y-[1px] cursor-pointer"
                >
                  <MapPin className="mt-[2px] h-4 w-4 text-white/40 transition group-hover:text-white" />
                  <div>
                    <div className="text-[12px] text-white/45">{a.label}</div>
                    <div className="text-white/75 underline-offset-4 group-hover:underline">
                      {a.value}
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* SOCIALS */}
            <div className="flex gap-2 pt-2">
              {footerData.socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/5 transition hover:scale-[1.06] hover:bg-white/10 cursor-pointer"
                >
                  <SocialIcon name={s.icon} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="flex flex-col gap-4 border-t border-white/10 py-6 md:flex-row md:items-center md:justify-between">
          <div className="text-[12px] text-white/45">
            © {new Date().getFullYear()} {footerData.brand.title}. Все права
            защищены.
          </div>

          <div className="flex flex-wrap gap-4">
            {footerData.legalLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[12px] text-white/45 transition hover:text-white hover:-translate-y-[1px] cursor-pointer"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
