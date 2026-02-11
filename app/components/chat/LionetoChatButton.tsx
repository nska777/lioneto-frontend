"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MessageCircle, Sparkles } from "lucide-react";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

function waitForJivo(timeoutMs = 8000) {
  return new Promise<any>((resolve, reject) => {
    const start = Date.now();

    const tick = () => {
      const w = window as any;
      if (w?.jivo_api?.open) return resolve(w.jivo_api);

      if (Date.now() - start > timeoutMs)
        return reject(new Error("Jivo not ready"));

      setTimeout(tick, 120);
    };

    tick();
  });
}

export default function LionetoChatButton() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;

    waitForJivo(8000)
      .then(() => {
        if (alive) setReady(true);
      })
      .catch(() => {
        if (alive) setReady(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const label = useMemo(
    () => (ready ? "Написать в чат" : "Подключаем чат…"),
    [ready],
  );

  const onOpen = useCallback(async () => {
    try {
      const api = await waitForJivo(8000);
      api.open({ start: "chat" });
    } catch {
      // если вдруг не успело подгрузиться — просто обнови страницу/проверь сеть
      // (мы не спамим alert’ами)
      console.warn("Jivo API not ready");
    }
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-[9999]">
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "group relative flex items-center gap-3 rounded-full px-4 py-3",
          "backdrop-blur-xl",
          "shadow-[0_14px_40px_rgba(0,0,0,0.16)]",
          "border border-black/10 bg-white/75",
          "transition-transform duration-200 active:scale-[0.98]",
          "hover:shadow-[0_18px_55px_rgba(0,0,0,0.20)]",
          "cursor-pointer",
        )}
        aria-label="Открыть чат Lioneto"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(120% 160% at 30% 20%, rgba(214,197,142,0.45) 0%, rgba(214,197,142,0.14) 35%, rgba(255,255,255,0) 70%)",
          }}
        />

        <span className="relative grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white/85">
          <MessageCircle className="h-5 w-5 text-black/80" />
        </span>

        <span className="relative flex flex-col items-start leading-tight">
          <span className="text-[12px] tracking-[0.14em] text-black/55 uppercase">
            Lioneto
          </span>
          <span className="text-[14px] font-medium text-black/85">{label}</span>
        </span>

        <span className="relative ml-1 grid h-8 w-8 place-items-center rounded-full border border-black/10 bg-white/70">
          <Sparkles className="h-4 w-4 text-black/70" />
        </span>
      </button>
    </div>
  );
}
