"use client";

import Link from "next/link";
import { useMemo, useState, useEffect, useLayoutEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  X,
  MapPin,
  Phone,
  Clock,
  Check,
} from "lucide-react";

type MenuLink = { label: string; href: string; isExternal?: boolean };

function cn(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

// ---- megaCategories shape is "any" (мы аккуратно читаем поля)
function normalizeStr(v: any) {
  return String(v ?? "").trim();
}
function catTitle(cat: any) {
  return normalizeStr(
    cat?.title ?? cat?.label ?? cat?.name ?? cat?.fallback ?? cat?.slug ?? "",
  );
}
function catItems(cat: any): any[] {
  const a =
    cat?.items ??
    cat?.children ??
    cat?.links ??
    cat?.list ??
    cat?.collections ??
    [];
  return Array.isArray(a) ? a : [];
}
function itemTitle(it: any) {
  return normalizeStr(
    it?.title ??
      it?.label ??
      it?.name ??
      it?.fallback ??
      it?.slug ??
      it?.value ??
      "",
  );
}
function itemHref(it: any) {
  return normalizeStr(
    it?.href ?? it?.url ?? it?.to ?? it?.link ?? it?.path ?? "",
  );
}

function normKey(s: string) {
  return String(s || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[«»"']/g, "")
    .trim();
}

/* -------------------------
   Contacts mini-block (inside burger)
-------------------------- */

type RegionKey = "uz" | "ru";

type Store = {
  id: string;
  title: string;
  phone?: string;
  address: string;
  hours?: string;
};

const UZ_STORES: Store[] = [
  {
    id: "uz-1",
    title: "Ташкент • Rich House",
    phone: "+998 (71) 000-00-00",
    address: "ул. Мирзо-Улугбека, 18 • Rich House",
    hours: "10:00 — 21:00",
  },
  {
    id: "uz-2",
    title: "Ташкент • Шоурум (пример)",
    phone: "+998 (71) 111-11-11",
    address: "пр-т Амира Темура, 15 • шоурум",
    hours: "10:00 — 20:00",
  },
  {
    id: "uz-3",
    title: "Ташкент • Склад/выдача (пример)",
    phone: "+998 (71) 222-22-22",
    address: "ул. Шота Руставели, 22 • выдача заказов",
    hours: "09:00 — 19:00",
  },
];

const RU_STORES: Store[] = [
  {
    id: "ru-1",
    title: 'Москва • МЦ "Гранд"',
    phone: "+7 (495) 565-37-55 доб. 101",
    address: "Ленинградское ш., 4 • МЦ «Гранд», 3 этаж",
    hours: "10:00 — 21:00",
  },
  {
    id: "ru-2",
    title: 'Москва • МЦ "Империя"',
    phone: "+7 (495) 565-37-55 доб. 301",
    address: "Дмитровское ш., 161Б • МЦ «Империя», 3 этаж",
    hours: "10:00 — 21:00",
  },
  {
    id: "ru-3",
    title: "Москва • ТК «ТРИ КИТА»",
    phone: "+7 (495) 565-37-55 доб. 701",
    address: "Одинцовский р-н, Новоивановское, ул. Луговая, 1",
    hours: "10:00 — 21:00",
  },
];

function RegionToggleMini({
  value,
  onChange,
}: {
  value: RegionKey;
  onChange: (v: RegionKey) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-black/10 bg-white p-1">
      <button
        type="button"
        onClick={() => onChange("ru")}
        className={cn(
          "h-8 px-4 rounded-full text-[11px] font-medium tracking-[0.18em] transition cursor-pointer",
          value === "ru"
            ? "bg-black text-white"
            : "text-black/70 hover:text-black",
        )}
      >
        РОССИЯ
      </button>
      <button
        type="button"
        onClick={() => onChange("uz")}
        className={cn(
          "h-8 px-4 rounded-full text-[11px] font-medium tracking-[0.18em] transition cursor-pointer",
          value === "uz"
            ? "bg-black text-white"
            : "text-black/70 hover:text-black",
        )}
      >
        УЗБЕКИСТАН
      </button>
    </div>
  );
}

function StoreRowMini({
  active,
  store,
  onClick,
}: {
  active: boolean;
  store: Store;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left cursor-pointer rounded-[18px] border p-4 transition",
        active
          ? "border-black/25 bg-black/[0.02]"
          : "border-black/10 bg-white hover:border-black/20",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 h-9 w-9 rounded-2xl border flex items-center justify-center shrink-0",
            active
              ? "border-black/20 bg-white"
              : "border-black/10 bg-black/[0.02]",
          )}
        >
          {active ? (
            <Check className="h-4 w-4 text-black/70" />
          ) : (
            <MapPin className="h-4 w-4 text-black/45" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold tracking-[-0.01em] text-black/90">
            {store.title}
          </div>

          {store.phone ? (
            <div className="mt-2 flex items-center gap-2 text-[12px] text-black/70">
              <Phone className="h-4 w-4 text-black/35" />
              <span className="truncate">{store.phone}</span>
            </div>
          ) : null}

          <div className="mt-2 flex items-start gap-2 text-[12px] text-black/70">
            <MapPin className="mt-0.5 h-4 w-4 text-black/35" />
            <span className="leading-5">{store.address}</span>
          </div>

          {store.hours ? (
            <div className="mt-2 flex items-center gap-2 text-[12px] text-black/70">
              <Clock className="h-4 w-4 text-black/35" />
              <span>{store.hours}</span>
            </div>
          ) : null}
        </div>
      </div>
    </button>
  );
}

function ContactsMiniBlock() {
  // ✅ дефолт УЗ
  const [region, setRegion] = useState<RegionKey>("uz");
  const stores = useMemo(
    () => (region === "ru" ? RU_STORES : UZ_STORES),
    [region],
  );

  const [activeId, setActiveId] = useState<string>(
    () => UZ_STORES[0]?.id ?? "",
  );
  const activeStore = useMemo(
    () => stores.find((s) => s.id === activeId) ?? stores[0],
    [stores, activeId],
  );

  useLayoutEffect(() => {
    setActiveId(stores[0]?.id ?? "");
  }, [region, stores]);

  return (
    <div className="border border-black/10 bg-white shadow-sm rounded-none overflow-hidden">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between gap-3">
          <RegionToggleMini value={region} onChange={setRegion} />
          <div className="text-[11px] tracking-[0.18em] text-black/45 whitespace-nowrap">
            ВЫБРАНО:{" "}
            <span className="text-black/80">
              {region === "ru" ? "РОССИЯ" : "УЗБЕКИСТАН"}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="rounded-[22px] border border-black/10 bg-white p-3">
          <div className="max-h-[320px] overflow-auto p-2">
            <div className="grid gap-3">
              {stores.map((s) => (
                <StoreRowMini
                  key={s.id}
                  store={s}
                  active={s.id === activeId}
                  onClick={() => setActiveId(s.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* маленький “титл активного” как на десктопе */}
        {activeStore?.title ? (
          <div className="mt-3 text-[11px] tracking-[0.18em] text-black/45">
            Выбрано: <span className="text-black/75">{activeStore.title}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* -------------------------
   Mobile Menu
-------------------------- */

export default function MobileMenu({
  open,
  onClose,
  links,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  links: readonly MenuLink[];
  categories?: any[];
}) {
  // body scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // esc close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const rooms = useMemo(() => {
    const arr = Array.isArray(categories) ? categories : [];
    return arr
      .filter(Boolean)
      .map((c) => ({
        key: (catTitle(c).toLowerCase() || Math.random().toString(16)).trim(),
        title: catTitle(c),
        items: catItems(c)
          .map((it) => ({
            title: itemTitle(it),
            href: itemHref(it),
          }))
          .filter((x) => x.title && x.href),
      }))
      .filter((r) => r.title);
  }, [categories]);

  const [catalogOpen, setCatalogOpen] = useState(true);
  const [openRoomKey, setOpenRoomKey] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    if (!rooms.length) return;
    setOpenRoomKey((prev) => prev || rooms[0].key);
  }, [open, rooms]);

  const Divider = () => <div className="h-px w-full bg-black/10" />;

  const LinkRow = ({
    href,
    label,
    external,
    indent = 0,
    upper,
  }: {
    href: string;
    label: string;
    external?: boolean;
    indent?: number;
    upper?: boolean;
  }) => {
    const base = cn(
      "block w-full cursor-pointer select-none",
      "px-4 py-3.5",
      "transition hover:bg-black/[0.035]",
    );

    const style = indent ? { paddingLeft: 16 + indent } : undefined;

    const content = (
      <span
        className={cn(
          "text-[14px] text-black/85",
          upper && "text-[12px] uppercase tracking-[0.16em] text-black/55",
        )}
      >
        {label}
      </span>
    );

    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          onClick={onClose}
          className={base}
          style={style}
        >
          {content}
        </a>
      );
    }

    return (
      <Link href={href} onClick={onClose} className={base} style={style}>
        {content}
      </Link>
    );
  };

  const RowBtn = ({
    children,
    onClick,
    right,
    strong,
    upper,
    indent = 0,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    right?: React.ReactNode;
    strong?: boolean;
    upper?: boolean;
    indent?: number;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left cursor-pointer select-none",
        "px-4 py-3.5",
        "flex items-center justify-between gap-3",
        "transition hover:bg-black/[0.035]",
      )}
      style={indent ? { paddingLeft: 16 + indent } : undefined}
    >
      <span
        className={cn(
          "text-[14px] text-black/85",
          strong && "font-semibold",
          upper && "text-[12px] uppercase tracking-[0.16em] text-black/55",
        )}
      >
        {children}
      </span>
      {right}
    </button>
  );

  // ✅ Убираем "Каталог" и "Контакты" из обычных ссылок (они нам не нужны в списке)
  const menuLinks = useMemo(() => {
    const safe = (links ?? []).filter((l) => l?.href && l?.label);

    const isCatalogLink = (l: MenuLink) => {
      const href = String(l.href || "").trim();
      const label = normKey(String(l.label || ""));
      return (
        href === "/catalog" ||
        href === "/catalog/" ||
        href.startsWith("/catalog?") ||
        label === "каталог" ||
        label === "catalog"
      );
    };

    const isContactsLink = (l: MenuLink) => {
      const href = String(l.href || "").trim();
      const label = normKey(String(l.label || ""));
      return (
        href === "/contacts" ||
        href === "/contacts/" ||
        label === "контакты" ||
        label === "contacts"
      );
    };

    return safe.filter((l) => !isCatalogLink(l) && !isContactsLink(l));
  }, [links]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2000]">
      {/* overlay */}
      <button
        type="button"
        aria-label="Close menu overlay"
        onClick={onClose}
        className="absolute inset-0 bg-black/35"
      />

      {/* left drawer */}
      <aside
        className={cn(
          "absolute left-0 top-0 h-full w-[86vw] max-w-[360px]",
          "bg-[#f3f3f3]",
          "shadow-[0_22px_60px_-28px_rgba(0,0,0,0.45)]",
          "rounded-none",
          "overflow-hidden",
          "flex flex-col",
        )}
      >
        {/* header внутри drawer */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div className="text-[12px] uppercase tracking-[0.22em] text-black/45">
            Меню
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-black/[0.05] cursor-pointer"
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-black/55" />
          </button>
        </div>

        {/* body (scroll) */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {/* ✅ общий блок меню */}
          <div className="border border-black/10 bg-white shadow-sm rounded-none overflow-hidden">
            <RowBtn
              strong
              upper
              onClick={() => setCatalogOpen((v) => !v)}
              right={
                catalogOpen ? (
                  <ChevronUp className="h-5 w-5 text-black/45" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-black/45" />
                )
              }
            >
              Каталог
            </RowBtn>

            {catalogOpen ? (
              <div>
                <Divider />
                {rooms.map((r, idx) => {
                  const isOpen = openRoomKey === r.key;

                  return (
                    <div key={r.key}>
                      {idx !== 0 ? <Divider /> : null}

                      <RowBtn
                        strong
                        onClick={() =>
                          setOpenRoomKey((prev) =>
                            prev === r.key ? "" : r.key,
                          )
                        }
                        right={
                          isOpen ? (
                            <ChevronUp className="h-5 w-5 text-black/45" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-black/45" />
                          )
                        }
                      >
                        {r.title}
                      </RowBtn>

                      {isOpen ? (
                        <div className="pb-2">
                          {r.items.map((it) => (
                            <LinkRow
                              key={it.href + it.title}
                              href={it.href}
                              label={it.title}
                              indent={22}
                            />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : null}

            {menuLinks.length ? <Divider /> : null}

            {menuLinks.map((l, idx) => (
              <div key={l.href + idx}>
                <LinkRow
                  href={l.href}
                  label={l.label}
                  external={l.isExternal}
                />
                {idx !== menuLinks.length - 1 ? <Divider /> : null}
              </div>
            ))}
          </div>

          {/* ✅ ВСТАВЛЯЕМ ВНУТРЬ drawer контактный блок (как на 2 скрине) */}
          <div className="mt-4">
            <ContactsMiniBlock />
          </div>
        </div>
      </aside>
    </div>
  );
}
