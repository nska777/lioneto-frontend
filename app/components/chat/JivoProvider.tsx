"use client";

import Script from "next/script";

declare global {
  interface Window {
    jivo_api?: any;
    jivo_onLoadCallback?: () => void;
    __lionetoJivoReady?: boolean;
    __lionetoOpenJivo?: () => void;
  }
}

export default function JivoProvider({ widgetId }: { widgetId: string }) {
  return (
    <>
      {/* ✅ Прячем launcher, НЕ трогаем окно */}
      <style>{`
        #jcont { display: none !important; pointer-events: none !important; opacity: 0 !important; }
        /* окно/плеер держим поверх всего */
        #jivo-player, #jivo-player * { pointer-events: auto !important; }
        #jivo-player { z-index: 2147483647 !important; }
      `}</style>

      <Script id="jivo-bridge" strategy="afterInteractive">
        {`
          (function () {
            function ensurePlayerOnTop() {
              var p = document.getElementById('jivo-player');
              if (p) {
                p.style.setProperty('z-index', '2147483647', 'important');
                p.style.setProperty('display', 'block', 'important');
                p.style.setProperty('pointer-events', 'auto', 'important');
              }
            }

            function hideLauncher() {
              var el = document.getElementById('jcont');
              if (el) {
                el.style.setProperty('display','none','important');
                el.style.setProperty('pointer-events','none','important');
                el.style.setProperty('opacity','0','important');
              }
            }

            // наблюдаем — Jivo может снова создать launcher
            var obs = new MutationObserver(function () {
              hideLauncher();
              ensurePlayerOnTop();
            });
            obs.observe(document.documentElement, { childList:true, subtree:true });

            window.jivo_onLoadCallback = function () {
              window.__lionetoJivoReady = true;
              hideLauncher();
              ensurePlayerOnTop();

              // даем внешней кнопке гарантированную функцию открытия
              window.__lionetoOpenJivo = function () {
                try {
                  ensurePlayerOnTop();
                  if (window.jivo_api && window.jivo_api.open) {
                    window.jivo_api.open({ start: 'chat' });
                    ensurePlayerOnTop();
                    return true;
                  }
                } catch(e) {}
                return false;
              };

              // на всякий случай
              setTimeout(function(){ hideLauncher(); ensurePlayerOnTop(); }, 200);
              setTimeout(function(){ hideLauncher(); ensurePlayerOnTop(); }, 1200);
            };

            // если вдруг onLoad не стреляет мгновенно — все равно прячем launcher
            hideLauncher();
            ensurePlayerOnTop();
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
