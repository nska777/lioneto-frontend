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

import {
  UZ_STORES,
  RU_STORES,
  type Store,
  type RegionKey,
} from "@/app/lib/stores/stores-data";

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

function toTelHref(raw: string) {
  const cleaned = String(raw || "").replace(/[^\d+]/g, "");
  if (!cleaned) return "";
  return cleaned.startsWith("+") ? `tel:${cleaned}` : `tel:+${cleaned}`;
}

function splitPhones(phone?: string) {
  const s = String(phone ?? "").trim();
  if (!s) return [];
  return s
    .split("/")
    .map((x) => x.trim())
    .filter(Boolean);
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
  const phones = splitPhones(store.phone);

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

        {/* ВАЖНО: min-w-0 + w-full чтобы текст красиво занимал всю ширину */}
        <div className="min-w-0 w-full flex-1">
          <div className="text-[13px] font-semibold tracking-[-0.01em] text-black/90">
            {store.title}
          </div>

          {phones.length ? (
            <div className="mt-2 flex items-start gap-2 text-[12px] text-black/70">
              <Phone className="mt-[2px] h-4 w-4 text-black/35 shrink-0" />
              <div className="min-w-0 w-full">
                {phones.map((ph, i) => (
                  <a
                    key={`${store.id}-ph-${i}`}
                    href={toTelHref(ph)}
                    onClick={(e) => {
                      // чтобы тап по телефону не мешал выбору магазина
                      e.stopPropagation();
                    }}
                    className={cn(
                      "block w-full",
                      "underline underline-offset-4 decoration-black/20",
                      "hover:decoration-black/40 hover:text-black",
                      "break-words",
                    )}
                  >
                    {ph}
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-2 flex items-start gap-2 text-[12px] text-black/70">
            <MapPin className="mt-[2px] h-4 w-4 text-black/35 shrink-0" />
            <span className="leading-5 break-words">{store.address}</span>
          </div>

          {store.hours ? (
            <div className="mt-2 flex items-center gap-2 text-[12px] text-black/70">
              <Clock className="h-4 w-4 text-black/35 shrink-0" />
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
          <div className="max-h-[320px] overflow-auto overscroll-contain p-2">
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
  // ✅ body scroll lock (mobile-safe, iOS-safe)
  useEffect(() => {
    if (!open) return;

    const body = document.body;
    const html = document.documentElement;

    const scrollY = window.scrollY || window.pageYOffset || 0;

    const prevBody = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    const prevHtmlOverflow = html.style.overflow;

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";

    return () => {
      body.style.position = prevBody.position;
      body.style.top = prevBody.top;
      body.style.left = prevBody.left;
      body.style.right = prevBody.right;
      body.style.width = prevBody.width;
      body.style.overflow = prevBody.overflow;

      html.style.overflow = prevHtmlOverflow;

      window.scrollTo(0, scrollY);
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

  // ✅ по дефолту каталог ЗАКРЫТ
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [openRoomKey, setOpenRoomKey] = useState<string>("");

  // ✅ каждый раз при открытии меню — каталог закрываем и комнаты сворачиваем
  useEffect(() => {
    if (!open) return;
    setCatalogOpen(false);
    setOpenRoomKey("");
  }, [open]);

  // если пользователь откроет каталог — можно открыть первую комнату (опционально)
  useEffect(() => {
    if (!open) return;
    if (!catalogOpen) return;
    if (!rooms.length) return;
    setOpenRoomKey((prev) => prev || rooms[0].key);
  }, [open, catalogOpen, rooms]);

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

  // ✅ Убираем "Каталог" и "Контакты" из обычных ссылок
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
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6">
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

          {/* ✅ контакты внутри drawer */}
          <div className="mt-4">
            <ContactsMiniBlock />
          </div>
        </div>
      </aside>
    </div>
  );
}
