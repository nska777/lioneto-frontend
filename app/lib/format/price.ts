export type Currency = "RUB" | "UZS";

function formatNumberComma(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export function formatPrice(value: number, currency: Currency) {
  const n = formatNumberComma(value);

  if (currency === "RUB") {
    return `${n} ₽`;
  }

  return `${n} сум`;
}
