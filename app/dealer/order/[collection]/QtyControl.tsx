"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "./utils";

type Props = {
  value: number;
  onMinus: () => void;
  onPlus: () => void;
  compact?: boolean;
};

export default function QtyControl({
  value,
  onMinus,
  onPlus,
  compact = false,
}: Props) {
  return (
    <div
      className={cn(
        "flex items-center overflow-hidden rounded-[10px] border border-black/10 bg-white",
        compact ? "h-8" : "h-10",
      )}
    >
      <button
        type="button"
        onClick={onMinus}
        className={cn(
          "flex h-full cursor-pointer items-center justify-center transition hover:bg-black/5",
          compact ? "w-8" : "w-10",
        )}
      >
        <Minus className="h-4 w-4" />
      </button>

      <div
        className={cn(
          "flex h-full items-center justify-center border-x border-black/10 font-semibold text-black",
          compact
            ? "min-w-[34px] px-2 text-[13px]"
            : "min-w-[48px] px-3 text-[14px]",
        )}
      >
        {value}
      </div>

      <button
        type="button"
        onClick={onPlus}
        className={cn(
          "flex h-full cursor-pointer items-center justify-center transition hover:bg-black/5",
          compact ? "w-8" : "w-10",
        )}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
