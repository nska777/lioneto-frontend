import type { DealerCountryCode } from "../data";

export function formatMoney(value: number, country: DealerCountryCode): string {
  if (country === "RU") {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (country === "UZ") {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "UZS",
      currencyDisplay: "code",
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (country === "KZ") {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "KZT",
      maximumFractionDigits: 0,
    }).format(value);
  }

  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "TJS",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getFinalPrice(base: number, markupPercent: number): number {
  return Math.round(base * (1 + markupPercent / 100));
}

export const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");