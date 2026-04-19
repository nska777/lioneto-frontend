"use client";

import { useMemo, useState } from "react";
import Modal from "./Modal";
import { useRegionLang } from "@/app/context/region-lang";
import { getDict, tF } from "@/i18n";
import { REGION_DATA } from "@/app/lib/headerData";

function cn(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

function onlyDigits(s: string) {
  return s.replace(/\D/g, "");
}

function formatPhone(digits: string, regionKey: "ru" | "uz") {
  const max = regionKey === "uz" ? 9 : 10;
  const d = digits.slice(0, max);

  if (regionKey === "uz") {
    const a = d.slice(0, 2);
    const b = d.slice(2, 5);
    const c = d.slice(5, 7);
    const e = d.slice(7, 9);
    return [a, b, c, e].filter(Boolean).join(" ");
  }

  const a = d.slice(0, 3);
  const b = d.slice(3, 6);
  const c = d.slice(6, 8);
  const e = d.slice(8, 10);
  return [a, b, c, e].filter(Boolean).join(" ");
}

function isValidPhone(digits: string, regionKey: "ru" | "uz") {
  const d = onlyDigits(digits);
  if (regionKey === "uz") return d.length === 9;
  return d.length === 10;
}

export default function CallModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: {
    lastName: string;
    firstName: string;
    phone: string;
    region: string;
    pageUrl: string;
    question: string;
  }) => void;
}) {
  const { region, setRegion, lang } = useRegionLang();

  const dict = useMemo(() => getDict(lang as any), [lang]);
  const tt = (key: string, fallback: string) => tF(dict as any, key, fallback);

  const [phoneDigits, setPhoneDigits] = useState("");
  const [pending, setPending] = useState(false);

  if (!open) return null;

  const regionKey = (region === "ru" ? "ru" : "uz") as "ru" | "uz";
  const phonePrefix = REGION_DATA[regionKey].phonePrefix;

  const regionLabel =
    regionKey === "uz"
      ? tt("region.uz", "Узбекистан")
      : tt("region.ru", "Россия");

  const placeholder = regionKey === "uz" ? "90 123 45 67" : "999 123 45 67";

  const phoneView = formatPhone(phoneDigits, regionKey);
  const phoneOk = isValidPhone(phoneDigits, regionKey);

  return (
    <Modal
      open={open}
      onClose={() => {
        if (pending) return;
        onClose();
      }}
      title={tt("header.ui.callMe", "ЗАКАЗАТЬ ЗВОНОК")}
      widthClass="max-w-[720px]"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="text-[12px] tracking-[0.18em] text-black/50">
          {tt("header.pickRegion", "Выберите регион").toUpperCase()}
        </div>

        <div className="inline-flex rounded-full border border-black/10 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setRegion("uz")}
            className={cn(
              "h-8 px-4 rounded-full text-[12px] tracking-[0.12em] transition cursor-pointer",
              regionKey === "uz"
                ? "bg-black text-white"
                : "text-black/70 hover:text-black hover:bg-black/5",
            )}
          >
            {tt("header.regionUz", "Узбекистан")}
          </button>

          <button
            type="button"
            onClick={() => setRegion("ru")}
            className={cn(
              "h-8 px-4 rounded-full text-[12px] tracking-[0.12em] transition cursor-pointer",
              regionKey === "ru"
                ? "bg-black text-white"
                : "text-black/70 hover:text-black hover:bg-black/5",
            )}
          >
            {tt("header.regionRu", "Россия")}
          </button>
        </div>
      </div>

      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (pending || !phoneOk) return;

          const form = new FormData(e.currentTarget);
          const lastName = String(form.get("lastName") ?? "").trim();
          const firstName = String(form.get("firstName") ?? "").trim();
          const question = String(form.get("question") ?? "").trim();

          const phone = `${phonePrefix} ${phoneDigits}`.trim();

          const payload = {
            lastName,
            firstName,
            phone,
            region: regionLabel,
            pageUrl: typeof window !== "undefined" ? window.location.href : "",
            question,
          };

          try {
            setPending(true);

            const res = await fetch("/api/call-request", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

            if (!res.ok) {
              const text = await res.text();
              console.error("CALL REQUEST FAILED:", text);
              return;
            }

            onSubmit?.(payload);
            onClose();
          } catch (err) {
            console.error("CALL REQUEST ERROR:", err);
          } finally {
            setPending(false);
          }
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="mb-2 text-[11px] tracking-[0.22em] text-black/45">
              {tt("form.lastName", "ФАМИЛИЯ")}
            </div>
            <input
              required
              name="lastName"
              className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-[14px] outline-none focus:border-black/20 focus:shadow-[0_0_0_6px_rgba(0,0,0,0.04)] transition"
              placeholder={tt("form.lastNamePh", "Иванов")}
            />
          </div>

          <div>
            <div className="mb-2 text-[11px] tracking-[0.22em] text-black/45">
              {tt("form.firstName", "ИМЯ")}
            </div>
            <input
              required
              name="firstName"
              className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-[14px] outline-none focus:border-black/20 focus:shadow-[0_0_0_6px_rgba(0,0,0,0.04)] transition"
              placeholder={tt("form.firstNamePh", "Иван")}
            />
          </div>
        </div>

        <div>
          <div className="mb-2 text-[11px] tracking-[0.22em] text-black/45">
            {tt("form.phone", "ТЕЛЕФОН")}
          </div>

          <div className="flex h-12 overflow-hidden rounded-2xl border border-black/10 bg-white focus-within:border-black/20 focus-within:shadow-[0_0_0_6px_rgba(0,0,0,0.04)] transition">
            <div className="inline-flex items-center px-4 text-[13px] tracking-[0.14em] text-black/60">
              {phonePrefix}
            </div>

            <input
              required
              type="tel"
              inputMode="numeric"
              value={phoneView}
              onChange={(e) => {
                const digits = onlyDigits(e.target.value);
                const limit = regionKey === "uz" ? 9 : 10;
                setPhoneDigits(digits.slice(0, limit));
              }}
              className="h-full w-full px-3 text-[14px] outline-none"
              placeholder={placeholder}
            />
          </div>

          <div className="mt-2 text-[12px] text-black/45">
            {tt("form.region", "Регион")}:{" "}
            <span className="text-black/70">{regionLabel}</span>
          </div>
        </div>

        <div>
          <textarea
            name="question"
            rows={3}
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[14px] outline-none resize-none transition focus:border-black/20 focus:shadow-[0_0_0_6px_rgba(0,0,0,0.04)]"
            placeholder="Кратко опишите ваш вопрос"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={pending || !phoneOk}
            className={cn(
              "w-full cursor-pointer rounded-2xl bg-black py-3 text-[13px] tracking-[0.18em] text-white transition",
              pending || !phoneOk
                ? "opacity-60 cursor-not-allowed"
                : "hover:opacity-90",
            )}
          >
            {pending
              ? tt("form.sending", "ОТПРАВКА...")
              : tt("form.send", "ОТПРАВИТЬ")}
          </button>

          <div className="mt-3 text-center text-[12px] text-black/45">.</div>
        </div>
      </form>
    </Modal>
  );
}
