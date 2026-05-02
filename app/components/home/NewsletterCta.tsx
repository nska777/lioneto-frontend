"use client";

import { useLayoutEffect, useRef, useState, type SyntheticEvent } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Download, Send, X } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

type AdsConsent = "accepted" | "declined" | null;

function AdsConsentWindow({
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
        className="relative flex max-h-[90vh] w-full max-w-[820px] flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl"
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
              Согласие на получение рекламно-информационных материалов
            </h2>

            <p className="mt-2 text-[13px] leading-6 text-black/55">
              Согласие на получение новостей, акций, предложений и
              информационных материалов Lioneto.
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
              Согласие на получение рекламно-информационных материалов
            </h3>

            <p className="mt-2 text-[13px] leading-6 text-black/55">
              Настоящий документ подтверждает согласие пользователя на получение
              рекламно-информационной рассылки и новостей Lioneto.
            </p>
          </div>

          <section className="space-y-4">
            <p>
              Настоящим, в соответствии с Федеральным законом № 38-ФЗ «О
              рекламе» от 13.03.2006 г., свободно, своей волей и в своем
              интересе предоставляю свое согласие на получение
              рекламно-информационных материалов о товарах, услугах,
              мероприятиях, акциях и специальных предложениях Lioneto.
            </p>

            <p>
              Я даю согласие на получение рекламно-информационных материалов
              посредством:
            </p>

            <ol className="list-decimal space-y-2 pl-6">
              <li>электросвязи;</li>
              <li>
                информационно-телекоммуникационной сети «Интернет», включая
                таргетированную рекламу, рекламу в социальных сетях,
                мессенджерах и иных цифровых каналах коммуникации.
              </li>
            </ol>

            <p>
              Также я подтверждаю свое согласие на подписку на новости Lioneto,
              получение уведомлений о поступлениях, акциях, специальных
              предложениях, мероприятиях, обновлениях ассортимента и иных
              информационных материалах, связанных с деятельностью Lioneto.
            </p>

            <p>
              Согласие действует в течение пяти лет с даты его предоставления. Я
              осведомлен о возможности в дальнейшем отказаться от получения
              рекламно-информационной рассылки путем отписки от нее, перейдя по
              ссылке «Отписаться» в рекламно-информационном письме, либо
              направив соответствующее сообщение на электронную почту:{" "}
              <a
                href="mailto:info@lioneto.uz"
                className="cursor-pointer font-medium text-black underline underline-offset-4"
              >
                info@lioneto.uz
              </a>
              .
            </p>
          </section>

          <div className="mt-8 flex flex-col gap-3 border-t border-black/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[12px] leading-5 text-black/45">
              Полная версия согласия доступна для скачивания в формате Word.
            </p>

            <a
              href="/docs/mailing-agreement.docx"
              download="mailing-agreement.docx"
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

export default function NewsletterCta({
  backgroundUrl = "/images/home/newsletter-bg.jpg",
  title = "БУДЬТЕ В КУРСЕ",
  subtitle = "Подписывайтесь на наш Telegram — только важные новости и акции",
  telegramUrl = "https://t.me/lianetouz",
}: {
  backgroundUrl?: string;
  title?: string;
  subtitle?: string;
  telegramUrl?: string;
}) {
  const rootRef = useRef<HTMLElement | null>(null);

  const [adsConsentOpen, setAdsConsentOpen] = useState(false);
  const [adsConsent, setAdsConsent] = useState<AdsConsent>(null);

  const canOpenTelegram = adsConsent === "accepted";

  useLayoutEffect(() => {
    if (!rootRef.current) return;

    const ctx = gsap.context(() => {
      const el = rootRef.current!.querySelector('[data-nl="wrap"]');
      if (!el) return;

      gsap.set(el, { opacity: 0, y: 16 });

      ScrollTrigger.create({
        trigger: rootRef.current!,
        start: "top 80%",
        once: true,
        onEnter: () => {
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
          });
        },
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const openTelegram = () => {
    if (!canOpenTelegram) return;
    window.open(telegramUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <section
        ref={rootRef}
        className="mx-auto w-full max-w-[1200px] px-4 py-14"
      >
        <div
          data-nl="wrap"
          className="relative overflow-hidden rounded-2xl border border-black/10"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundUrl})` }}
          />

          <div className="absolute inset-0 bg-black/45" />

          <div className="relative px-5 py-10 text-center text-white md:px-10 md:py-14">
            <h3 className="text-[22px] font-semibold tracking-[0.18em] md:text-[28px]">
              {title}
            </h3>

            <p className="mt-2 text-[14px] text-white/85 md:text-[15px]">
              {subtitle}
            </p>

            <div className="mx-auto mt-6 max-w-[760px] rounded-[24px] border border-white/15 bg-white/10 p-3 text-left backdrop-blur-md md:p-4">
              <p className="text-center text-[12px] leading-5 text-white/75">
                Перед подпиской выберите согласие на получение
                рекламно-информационных материалов. Подробные условия доступны в{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setAdsConsentOpen(true);
                  }}
                  className="cursor-pointer font-semibold text-white underline underline-offset-4 transition hover:text-white/70"
                >
                  согласии на рассылку
                </button>
                .
              </p>

              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-2xl px-3 py-3 text-[12px] leading-5 ring-1 transition",
                    adsConsent === "accepted"
                      ? "bg-white text-black ring-white"
                      : "bg-white/10 text-white/80 ring-white/15 hover:bg-white/15",
                  )}
                >
                  <input
                    type="radio"
                    name="adsConsent"
                    checked={adsConsent === "accepted"}
                    onChange={() => setAdsConsent("accepted")}
                    className="mt-1 h-4 w-4 accent-black"
                  />

                  <span>
                    Я даю согласие на получение новостей, акций и
                    рекламно-информационных материалов Lioneto.
                  </span>
                </label>

                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-2xl px-3 py-3 text-[12px] leading-5 ring-1 transition",
                    adsConsent === "declined"
                      ? "bg-red-50 text-red-800 ring-red-200"
                      : "bg-white/10 text-white/80 ring-white/15 hover:bg-white/15",
                  )}
                >
                  <input
                    type="radio"
                    name="adsConsent"
                    checked={adsConsent === "declined"}
                    onChange={() => setAdsConsent("declined")}
                    className="mt-1 h-4 w-4 accent-black"
                  />

                  <span>
                    Я отказываюсь от получения рекламно-информационных
                    материалов и понимаю, что подписка будет недоступна.
                  </span>
                </label>
              </div>

              {adsConsent === "declined" && (
                <p className="mt-3 rounded-2xl bg-red-50 px-3 py-2 text-center text-[12px] leading-5 text-red-700">
                  Без согласия на получение рекламно-информационных материалов
                  переход к подписке недоступен.
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={openTelegram}
                disabled={!canOpenTelegram}
                className={cn(
                  "group relative inline-flex h-12 items-center gap-3 overflow-hidden rounded-full px-8",
                  "border border-white/30 backdrop-blur-md",
                  "transition-all duration-300",
                  canOpenTelegram
                    ? "cursor-pointer hover:scale-[1.02] active:scale-[0.99]"
                    : "cursor-not-allowed opacity-55",
                )}
              >
                <span
                  className={cn(
                    "absolute inset-0",
                    canOpenTelegram
                      ? "bg-[radial-gradient(120%_120%_at_30%_0%,#e7c47a_0%,#c9a567_35%,#11aade_100%)] opacity-95 transition-opacity duration-300 group-hover:opacity-100"
                      : "bg-white/25",
                  )}
                />

                <span className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <span className="relative z-10 flex items-center gap-3 text-[13px] font-semibold tracking-[0.18em] text-white">
                  ПОДПИСАТЬСЯ В TELEGRAM
                  <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </button>
            </div>

            <div className="mx-auto mt-4 max-w-[720px] text-[12px] text-white/70">
              Без спама. Только поступления, акции и важные обновления Lioneto.
            </div>
          </div>
        </div>
      </section>

      <AdsConsentWindow
        open={adsConsentOpen}
        onClose={() => setAdsConsentOpen(false)}
      />
    </>
  );
}
