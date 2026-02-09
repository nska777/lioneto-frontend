"use client";

import Modal from "./Modal";
import { MapPin } from "lucide-react";
import { useMemo } from "react";

export default function MapModal({
  open,
  onClose,
  address,
}: {
  open: boolean;
  onClose: () => void;
  address: string;
}) {
  const mapSrc = useMemo(() => {
    if (!address) return "";
    const base = "https://yandex.ru/map-widget/v1/";
    const text = encodeURIComponent(address);
    return `${base}?text=${text}&z=16`;
  }, [address]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="КАРТА"
      widthClass="max-w-[980px]"
    >
      <div className="mb-3 flex items-start gap-3">
        <div className="mt-[2px] inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/5">
          <MapPin className="h-5 w-5 text-black/60" />
        </div>
        <div>
          <div className="text-[14px] text-black/85">{address}</div>
          <div className="mt-1 text-[12px] tracking-[0.18em] text-black/45">
            Яндекс.Карта внутри окна
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/10 bg-black/5">
        {mapSrc ? (
          <iframe
            title="Yandex Map"
            src={mapSrc}
            className="h-[420px] w-full"
            loading="lazy"
          />
        ) : (
          <div className="p-6 text-black/60">Нет адреса</div>
        )}
      </div>
    </Modal>
  );
}
