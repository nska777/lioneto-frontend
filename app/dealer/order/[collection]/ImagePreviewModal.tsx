"use client";

import Image from "next/image";
import { useEffect } from "react";
import { X } from "lucide-react";

type Props = {
  image: {
    src: string;
    title: string;
  } | null;
  onClose: () => void;
};

export default function ImagePreviewModal({ image, onClose }: Props) {
  useEffect(() => {
    if (!image) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[1100px] rounded-[20px] bg-white p-3 shadow-[0_30px_90px_-30px_rgba(0,0,0,0.45)] sm:rounded-[24px] sm:p-4"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white text-black/60 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-3 pr-12 pl-1 pt-1 text-[14px] font-semibold text-black sm:text-[15px]">
          {image.title}
        </div>

        <div className="relative h-[70vh] w-full overflow-hidden rounded-[18px] bg-white">
          <Image
            src={image.src}
            alt={image.title}
            fill
            className="object-contain"
            sizes="100vw"
          />
        </div>
      </div>
    </div>
  );
}
