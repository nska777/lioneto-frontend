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
      {/* ✅ Точно прячем только кнопку/лейбл Jivo (launcher) */}
      <style>{`
        #jcont { display: none !important; }
      `}</style>

      <Script id="jivo-bridge" strategy="afterInteractive">
        {`
          (function () {
            window.jivo_onLoadCallback = function () {
              window.__lionetoJivoReady = true;

              // на всякий случай повторно скрываем launcher после инициализации
              var el = document.getElementById('jcont');
              if (el) el.style.display = 'none';
            };

            window.jivo_onChangeState = function () {
              // ничего не делаем
            };
          })();
        `}
      </Script>

      <Script
        id="jivo-widget"
        strategy="afterInteractive"
        src={`//code.jivo.ru/widget/${widgetId}`}
      />
    </>
  );
}
