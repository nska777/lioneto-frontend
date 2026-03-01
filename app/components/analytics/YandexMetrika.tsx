"use client";

import Script from "next/script";

declare global {
  interface Window {
    ym?: (...args: unknown[]) => void;
    __YM_INITED__?: boolean;
  }
}

const YM_ID = 106932425;

export default function YandexMetrika() {
  // only production
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <>
      {/* Load tag.js once */}
      <Script
        id="yandex-metrika-tag"
        strategy="afterInteractive"
        src={`https://mc.yandex.ru/metrika/tag.js?id=${YM_ID}`}
      />

      {/* Init once (guard) */}
      <Script
        id="yandex-metrika-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
(function () {
  if (window.__YM_INITED__) return;
  window.__YM_INITED__ = true;

  if (typeof window.ym !== "function") return;

  window.ym(${YM_ID}, "init", {
    ssr: true,
    webvisor: true,
    clickmap: true,
    ecommerce: "dataLayer",
    accurateTrackBounce: true,
    trackLinks: true
  });
})();
          `.trim(),
        }}
      />

      <noscript>
        <div>
          <img
            src={`https://mc.yandex.ru/watch/${YM_ID}`}
            style={{ position: "absolute", left: "-9999px" }}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
}
