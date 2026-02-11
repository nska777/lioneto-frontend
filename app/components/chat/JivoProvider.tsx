"use client";

import Script from "next/script";

declare global {
  interface Window {
    jivo_api?: any;
    jivo_onLoadCallback?: () => void;
    __lionetoJivoReady?: boolean;
  }
}

export default function JivoProvider({ widgetId }: { widgetId: string }) {
  return (
    <>
      {/* базовый CSS на всякий случай */}
      <style>{`
        #jcont { display: none !important; }
      `}</style>

      <Script id="jivo-bridge" strategy="afterInteractive">
        {`
          (function () {
            function removeLauncher() {
              var el = document.getElementById('jcont');
              if (el) el.remove();
            }

            // сразу пробуем удалить
            removeLauncher();

            // наблюдаем за DOM и удаляем каждый раз, когда Jivo добавляет launcher
            var observer = new MutationObserver(function () {
              removeLauncher();
            });

            observer.observe(document.body, {
              childList: true,
              subtree: true
            });

            // отмечаем готовность API
            window.jivo_onLoadCallback = function () {
              window.__lionetoJivoReady = true;
              removeLauncher();
            };
          })();
        `}
      </Script>

      <Script
        id="jivo-widget"
        strategy="afterInteractive"
        src={"//code.jivo.ru/widget/" + widgetId}
      />
    </>
  );
}
