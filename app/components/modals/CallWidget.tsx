"use client";

import { useState } from "react";
import { Phone, X } from "lucide-react";
import CallModal from "./CallModal";

function cn(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

export default function CallWidget() {
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  if (hidden) return null;

  return (
    <>
      <style jsx>{`
        @keyframes softBuzz {
          0%,
          100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          10% {
            transform: translate3d(-1px, 0, 0) rotate(-1deg);
          }
          20% {
            transform: translate3d(1px, 0, 0) rotate(1deg);
          }
          30% {
            transform: translate3d(-1px, 0, 0) rotate(-1deg);
          }
          40% {
            transform: translate3d(1px, 0, 0) rotate(1deg);
          }
          50% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
        }

        @keyframes pulseRing {
          0% {
            transform: scale(1);
            opacity: 0.45;
          }
          70% {
            transform: scale(1.2);
            opacity: 0;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }

        .call-widget-buzz {
          animation: softBuzz 2.8s ease-in-out infinite;
          transform-origin: center;
        }

        .call-widget-pulse::before,
        .call-widget-pulse::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          animation: pulseRing 2.6s ease-out infinite;
        }

        .call-widget-pulse::after {
          animation-delay: 1.1s;
        }
      `}</style>

      <div className="fixed bottom-5 right-5 z-[70] sm:bottom-6 sm:right-6">
        <div className="relative flex flex-col items-end gap-2">
          <button
            type="button"
            aria-label="Скрыть кнопку звонка"
            onClick={() => setHidden(true)}
            className={cn(
              "flex h-7 w-7 cursor-pointer items-center justify-center rounded-full",
              "border border-black/10 bg-white/95 text-black/55",
              "shadow-[0_8px_24px_-16px_rgba(0,0,0,0.35)]",
              "transition hover:scale-105 hover:text-black",
            )}
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative">
            <div className="call-widget-pulse absolute inset-0 rounded-full" />

            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Заказать звонок"
              className={cn(
                "call-widget-buzz relative flex h-16 w-16 cursor-pointer items-center justify-center rounded-full",
                "bg-black text-white shadow-[0_20px_40px_-18px_rgba(0,0,0,0.45)]",
                "transition duration-200 hover:scale-[1.06] active:scale-[0.97]",
                "sm:h-[72px] sm:w-[72px]",
              )}
            >
              <Phone className="h-7 w-7 sm:h-8 sm:w-8" />
            </button>
          </div>
        </div>
      </div>

      <CallModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={(data) => {
          console.log("CALL REQUEST SUBMITTED:", data);
        }}
      />
    </>
  );
}
