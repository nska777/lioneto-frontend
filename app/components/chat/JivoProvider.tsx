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
      {/* Базово прячем launcher */}
      <style>{`
        #jcont { display: none !important; pointer-events: none !important; }
      `}</style>

      <Script id="jivo-bridge" strategy="afterInteractive">
        {`
          (function () {
            function muteLauncher() {
              var el = document.getElementById('jcont');
              if (!el) return;

              // ✅ НЕ удаляем! Только глушим.
              el.style.setProperty('display', 'none', 'important');
              el.style.setProperty('pointer-events', 'none', 'important');
              el.style.setProperty('opacity', '0', 'important');
            }

            // сразу пробуем
            muteLauncher();

            // если Jivo пересоздает launcher — снова глушим
            var observer = new MutationObserver(function () {
              muteLauncher();
            });

            observer.observe(document.documentElement, { childList: true, subtree: true });

            window.jivo_onLoadCallback = function () {
              window.__lionetoJivoReady = true;
              muteLauncher();
              setTimeout(muteLauncher, 300);
              setTimeout(muteLauncher, 1200);
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
