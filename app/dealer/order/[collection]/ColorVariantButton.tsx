"use client";

import type {
  DealerCountryCode,
  DealerProductVariant,
} from "@/app/lib/dealer/shop";
import { formatMoney, cn } from "./utils";

type Props = {
  variant: DealerProductVariant;
  selected: boolean;
  country: DealerCountryCode;
  onClick: () => void;
};

function getVariantPrice(
  variant: DealerProductVariant | null | undefined,
  country: DealerCountryCode,
): number {
  return variant?.price?.[country] ?? 0;
}

export default function ColorVariantButton({
  variant,
  selected,
  country,
  onClick,
}: Props) {
  const variantPrice = getVariantPrice(variant, country);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-left transition",
        selected
          ? "border-black bg-black text-white"
          : "border-black/10 bg-white text-black hover:border-black/20 hover:bg-[#f7f5f0]",
      )}
    >
      <span
        className={cn(
          "h-4 w-4 shrink-0 rounded-full border",
          selected
            ? "border-white bg-white/80"
            : "border-black/15 bg-[#d9c4ac]",
        )}
      />
      <span className="text-[13px] font-semibold">{variant.label}</span>

      {variantPrice > 0 ? (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-semibold",
            selected ? "bg-white/12 text-white" : "bg-[#f3efe8] text-black/60",
          )}
        >
          {formatMoney(variantPrice, country)}
        </span>
      ) : null}
    </button>
  );
}
