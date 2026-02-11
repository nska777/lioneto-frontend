"use client";

import Script from "next/script";

declare global {
  interface Window {
    jivo_api?: any;
    jivo_onLoadCallback?: () => void;
    jivo_onChangeState?: (state: string) => void;
    __lionetoJivoReady?: boolean;
  }
}

export default function JivoProvider({ widgetId }: { widgetId: string }) {
  return (
    <>
      {/* ✅ ЖЕЛЕЗОБЕТОН: скрываем стандартную кнопку/лейбл Jivo через CSS */}
      <style>{`
        /* чаще всего */
        #jivo-iframe-container { display: none !important; }

        /* частые варианты контейнеров */
        [id^="jivo"] { }
        #jivo_container, #jivo-container, .jivo-widget, .jivo_widget, .jivo__widget,
        .jivo-btn, .jivo-btn-wrapper, .jivo_btn, .jivo_button, .jivo__button,
        .jivosite, .jivosite-btn, .jivo-chat, .jivo_chat, .jivo__chat {
          display: none !important;
        }

        /* иногда badge/branding отдельно */
        .jivo-branding, .jivo-brand, .jivo__branding {
          display: none !important;
        }
      `}</style>

      {/* Колбэки */}
      <Script id="jivo-bridge" strategy="afterInteractive">
        {`
          (function () {
            window.jivo_onLoadCallback = function () {
              window.__lionetoJivoReady = true;
            };

            window.jivo_onChangeState = function () {};
          })();
        `}
      </Script>

      {/* сам виджет */}
      <Script
        id="jivo-widget"
        strategy="afterInteractive"
        src={`//code.jivo.ru/widget/${widgetId}`}
      />
    </>
  );
}
