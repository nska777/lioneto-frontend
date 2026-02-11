"use client";

import Script from "next/script";

declare global {
  interface Window {
    jivo_api?: any;
    jivo_onLoadCallback?: () => void;
    jivo_onChangeState?: (state: string) => void;

    __lionetoJivoReady?: boolean;
    __lionetoJivoHideLabel?: () => void;
    __lionetoJivoShow?: () => void;
  }
}

export default function JivoProvider({ widgetId }: { widgetId: string }) {
  return (
    <>
      {/* Колбэки объявляем до загрузки скрипта */}
      <Script id="jivo-bridge" strategy="afterInteractive">
        {`
          (function () {
            function getContainer() {
              return document.getElementById('jivo-iframe-container');
            }

            function hideLabel() {
              var el = getContainer();
              if (!el) return;

              // Скрываем стандартный "ярлык/кнопку" в свернутом состоянии
              el.style.opacity = '0';
              el.style.pointerEvents = 'none';
              el.style.transform = 'translateY(10px)';
              el.style.transition = 'opacity 220ms ease, transform 220ms ease';
            }

            function showWidget() {
              var el = getContainer();
              if (!el) return;

              // Когда чат открыт — контейнер должен быть видим
              el.style.opacity = '1';
              el.style.pointerEvents = 'auto';
              el.style.transform = 'translateY(0px)';
              el.style.transition = 'opacity 220ms ease, transform 220ms ease';
            }

            window.__lionetoJivoHideLabel = hideLabel;
            window.__lionetoJivoShow = showWidget;

            window.jivo_onLoadCallback = function () {
              window.__lionetoJivoReady = true;

              // По умолчанию прячем стандартную кнопку
              hideLabel();

              // Иногда контейнер появляется чуть позже — повторим
              setTimeout(hideLabel, 300);
              setTimeout(hideLabel, 1200);
            };

            window.jivo_onChangeState = function (state) {
              // В свернутом состоянии прячем ярлык,
              // в открытом — показываем (иначе окно может не появиться)
              if (state === 'label' || state === 'chat/min') hideLabel();
              else showWidget();
            };
          })();
        `}
      </Script>

      {/* Сам виджет */}
      <Script
        id="jivo-widget"
        strategy="afterInteractive"
        src={`//code.jivo.ru/widget/${widgetId}`}
      />
    </>
  );
}
