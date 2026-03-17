"use client";

import "flag-icons/css/flag-icons.min.css";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type DealerRegion = "russia" | "uzbekistan" | "kazakhstan" | "tajikistan" | "";

type ForgotPasswordResponse = {
  error?: string;
  resetToken?: string;
  region?: DealerRegion;
};

type RegionOption = {
  value: DealerRegion;
  label: string;
  prefix: string;
  digits: number;
  placeholder: string;
  flagCode: "ru" | "uz" | "kz" | "tj";
};

const REGIONS: RegionOption[] = [
  {
    value: "russia",
    label: "Россия",
    prefix: "+7",
    digits: 10,
    placeholder: "+7 926 913 3993",
    flagCode: "ru",
  },
  {
    value: "uzbekistan",
    label: "Узбекистан",
    prefix: "+998",
    digits: 9,
    placeholder: "+998 90 123 45 67",
    flagCode: "uz",
  },
  {
    value: "kazakhstan",
    label: "Казахстан",
    prefix: "+7",
    digits: 10,
    placeholder: "+7 701 123 45 67",
    flagCode: "kz",
  },
  {
    value: "tajikistan",
    label: "Таджикистан",
    prefix: "+992",
    digits: 9,
    placeholder: "+992 93 123 45 67",
    flagCode: "tj",
  },
];

function normalizeDigits(value: string) {
  return value.replace(/\D/g, "");
}

function getRegionMeta(region: DealerRegion) {
  return (
    REGIONS.find((item) => item.value === region) || {
      value: "",
      label: "Не определен",
      prefix: "",
      digits: 16,
      placeholder: "+7 926 913 3993",
      flagCode: "ru" as const,
    }
  );
}

function extractLocalDigits(raw: string, region: DealerRegion) {
  const digits = normalizeDigits(raw);

  if (region === "uzbekistan") {
    if (digits.startsWith("998")) return digits.slice(3, 12);
    return digits.slice(0, 9);
  }

  if (region === "tajikistan") {
    if (digits.startsWith("992")) return digits.slice(3, 12);
    return digits.slice(0, 9);
  }

  if (region === "russia" || region === "kazakhstan") {
    if (digits.startsWith("7") || digits.startsWith("8")) {
      return digits.slice(1, 11);
    }
    return digits.slice(0, 10);
  }

  return digits;
}

function formatPhoneByRegion(raw: string, region: DealerRegion) {
  const local = extractLocalDigits(raw, region);

  if (region === "russia" || region === "kazakhstan") {
    const a = local.slice(0, 3);
    const b = local.slice(3, 6);
    const c = local.slice(6, 8);
    const d = local.slice(8, 10);

    return ["+7", a, b, c, d].filter(Boolean).join(" ").trim();
  }

  if (region === "uzbekistan") {
    const a = local.slice(0, 2);
    const b = local.slice(2, 5);
    const c = local.slice(5, 7);
    const d = local.slice(7, 9);

    return ["+998", a, b, c, d].filter(Boolean).join(" ").trim();
  }

  if (region === "tajikistan") {
    const a = local.slice(0, 2);
    const b = local.slice(2, 5);
    const c = local.slice(5, 7);
    const d = local.slice(7, 9);

    return ["+992", a, b, c, d].filter(Boolean).join(" ").trim();
  }

  return raw;
}

function extractLocalDigitsFromFormattedPhone(
  raw: string,
  region: DealerRegion,
) {
  return extractLocalDigits(raw, region);
}

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

export default function DealerForgotPasswordPage() {
  const router = useRouter();

  const [login, setLogin] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState<DealerRegion>("uzbekistan");
  const [detectedRegion, setDetectedRegion] = useState<DealerRegion>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const regionMeta = useMemo(() => getRegionMeta(region), [region]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/dealer/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ login, phone }),
      });

      const j = (await res
        .json()
        .catch(() => null)) as ForgotPasswordResponse | null;

      if (j?.region) {
        setDetectedRegion(j.region);

        if (j.region !== region) {
          const localDigits = extractLocalDigitsFromFormattedPhone(
            phone,
            region,
          );
          setRegion(j.region);
          setPhone(formatPhoneByRegion(localDigits, j.region));
        }
      }

      if (!res.ok || !j?.resetToken) {
        throw new Error(j?.error || "Не удалось подтвердить данные");
      }

      router.push(
        `/dealer/reset-password?token=${encodeURIComponent(j.resetToken)}`,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ошибка восстановления пароля",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleRegionClick(nextRegion: DealerRegion) {
    const localDigits = extractLocalDigitsFromFormattedPhone(phone, region);
    setRegion(nextRegion);
    setPhone(formatPhoneByRegion(localDigits, nextRegion));
  }

  return (
    <div className="mx-auto max-w-[560px] px-6 py-14">
      <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-black">
        Восстановление пароля
      </h1>

      <p className="mt-2 text-[14px] text-black/55">
        Введите логин и номер телефона, привязанный к аккаунту дилера.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div>
          <label className="text-[13px] text-black/60">Login</label>
          <input
            className="mt-1 w-full rounded-xl border border-black/10 px-4 py-3 text-[15px] outline-none focus:border-black/25"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="Введите логин"
            autoComplete="username"
          />
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-[13px] text-black/60">Телефон</label>

            {detectedRegion ? (
              <span className="text-[12px] text-black/45">
                Регион аккаунта:{" "}
                <span className="font-medium text-black/70">
                  {getRegionMeta(detectedRegion).label}
                </span>
              </span>
            ) : null}
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {REGIONS.map((item) => {
              const isActive = region === item.value;
              const isDetected = detectedRegion === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleRegionClick(item.value)}
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-[13px] transition-colors",
                    isActive
                      ? "border-[#E4D9B8] bg-[#F3EBD2] text-black"
                      : "border-black/10 bg-white text-black/65 hover:text-black",
                    isDetected && "ring-1 ring-[#E4D9B8]",
                  )}
                >
                  <span className={`fi fi-${item.flagCode} rounded-[2px]`} />
                  <span>{item.prefix}</span>
                </button>
              );
            })}
          </div>

          <input
            className="mt-3 w-full rounded-xl border border-black/10 px-4 py-3 text-[15px] outline-none focus:border-black/25"
            value={phone}
            onChange={(e) => {
              setPhone(formatPhoneByRegion(e.target.value, region));
            }}
            placeholder={regionMeta.placeholder}
            autoComplete="tel"
            inputMode="tel"
          />

          {detectedRegion && detectedRegion !== region ? (
            <p className="mt-2 text-[12px] text-amber-700">
              Для этого логина найден другой регион аккаунта:{" "}
              <span className="font-medium">
                {getRegionMeta(detectedRegion).label}
              </span>
              . Маска будет автоматически скорректирована после проверки.
            </p>
          ) : null}

          <p className="mt-2 text-[12px] text-black/45">
            Текущий формат:{" "}
            <span className="font-medium text-black/70">
              {regionMeta.placeholder}
            </span>
          </p>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black px-4 py-3 text-[14px] font-medium text-white disabled:opacity-60"
        >
          {loading ? "Проверяем..." : "Продолжить"}
        </button>
      </form>
    </div>
  );
}
