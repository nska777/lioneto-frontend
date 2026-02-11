"use client";

import Script from "next/script";

export default function JivoProvider({ widgetId }: { widgetId: string }) {
  return (
    <Script
      id="jivo-widget"
      strategy="afterInteractive"
      src={`//code.jivo.ru/widget/${widgetId}`}
    />
  );
}
