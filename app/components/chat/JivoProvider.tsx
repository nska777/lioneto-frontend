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
      {/* ✅ Прячем launcher/label/hover-area, НЕ трогая окно (#jivo-player) */}
      <style>{`
        /* твой launcher */
        #jcont { display: none !important; pointer-events:none !important; opacity:0 !important; }

        /* часто у Jivo текстовый лейбл/ховер-зона с динамическими классами */
        [class*="jlabel"], [class*="hoverArea"], [class*="bottom__"], [class*="container__"] {
          /* не трогаем всё подряд — ниже защитим окно */
        }

        /* Если эти блоки внутри #jcont или рядом с ним — скрываем */
        #jcont * { pointer-events:none !important; }

        /* ВАЖНО: окно/плеер чата НЕ скрываем */
        #jivo-player { display: block !important; }
      `}</style>

      <Script id="jivo-bridge" strategy="afterInteractive">
        {`
          (function () {
            function isInsideJivoPlayer(node) {
              try {
                return !!(node && node.closest && node.closest('#jivo-player'));
              } catch { return false; }
            }

            function hideLauncher() {
              // 1) основной launcher
              var jcont = document.getElementById('jcont');
              if (jcont) {
                jcont.style.setProperty('display','none','important');
                jcont.style.setProperty('pointer-events','none','important');
                jcont.style.setProperty('opacity','0','important');
              }

              // 2) иногда лейбл/hoverArea живут рядом и не полностью внутри #jcont
              //    Удалять нельзя — только скрывать.
              var candidates = document.querySelectorAll(
                '[class*="jlabel"], [class*="hoverArea"], [class*="bottom__"], [class*="container__"]'
              );

              for (var i=0; i<candidates.length; i++) {
                var el = candidates[i];

                // не трогаем элементы внутри окна чата
                if (isInsideJivoPlayer(el)) continue;

                // трогаем только элементы, которые визуально "плавающие" справа снизу
                var st = window.getComputedStyle(el);
                var isFixed = st.position === 'fixed';
                var hasBottom = st.bottom && st.bottom !== 'auto';
                var hasRight = st.right && st.right !== 'auto';

                if (isFixed && hasBottom && hasRight) {
                  el.style.setProperty('display','none','important');
                  el.style.setProperty('pointer-events','none','important');
                  el.style.setProperty('opacity','0','important');
                }
              }
            }

            // сразу скрываем
            hideLauncher();

            // MutationObserver: Jivo будет пытаться восстановить — мы будем глушить
            var obs = new MutationObserver(function () { hideLauncher(); });
            obs.observe(document.documentElement, { childList:true, subtree:true });

            window.jivo_onLoadCallback = function () {
              window.__lionetoJivoReady = true;
              hideLauncher();
              setTimeout(hideLauncher, 200);
              setTimeout(hideLauncher, 1000);
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
