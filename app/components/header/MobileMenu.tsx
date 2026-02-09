"use client";

import Link from "next/link";
import Modal from "@/app/components/modals/Modal";

export default function MobileMenu({
  open,
  onClose,
  links,
}: {
  open: boolean;
  onClose: () => void;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="МЕНЮ"
      widthClass="max-w-[520px]"
    >
      <div className="space-y-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={onClose}
            className="block cursor-pointer rounded-2xl border border-black/10 bg-white px-4 py-3 text-[14px] text-black/80 hover:bg-black/5 transition"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </Modal>
  );
}
