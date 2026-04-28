"use client";

import Link from "next/link";
import { useMemo, useState, useEffect, type ReactNode } from "react";
import {
  ChevronDown,
  ChevronUp,
  X,
  MapPin,
  Phone,
  Clock,
  Check,
  Globe,
  Building2,
  FileText,
  Hash,
  Landmark,
} from "lucide-react";

import {
  UZ_STORES,
  RU_STORES,
  type Store,
  type RegionKey,
} from "@/app/lib/stores/stores-data";

type MenuLink = { label: string; href: string; isExternal?: boolean };
type LangKey = "ru" | "uz";

function cn(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function getProp(o: unknown, key: string): unknown {
  return isRecord(o) ? o[key] : undefined;
}

function normalizeStr(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (isString(v)) return v.trim();
  return String(v).trim();
}

function catTitle(cat: unknown): string {
  return normalizeStr(
    getProp(cat, "title") ??
      getProp(cat, "label") ??
      getProp(cat, "name") ??
      getProp(cat, "fallback") ??
      getProp(cat, "slug") ??
      "",
  );
}

function catItems(cat: unknown): unknown[] {
  const a =
    getProp(cat, "items") ??
    getProp(cat, "children") ??
    getProp(cat, "links") ??
    getProp(cat, "list") ??
    getProp(cat, "collections") ??
    [];

  return Array.isArray(a) ? a : [];
}

function itemTitle(it: unknown): string {
  return normalizeStr(
    getProp(it, "title") ??
      getProp(it, "label") ??
      getProp(it, "name") ??
      getProp(it, "fallback") ??
      getProp(it, "slug") ??
      getProp(it, "value") ??
      "",
  );
}

function itemHref(it: unknown): string {
  return normalizeStr(
    getProp(it, "href") ??
      getProp(it, "url") ??
      getProp(it, "to") ??
      getProp(it, "link") ??
      getProp(it, "path") ??
      "",
  );
}

function normKey(s: string) {
  return String(s || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[«»"']/g, "")
    .trim();
}

function Divider() {
  return <div className="h-px w-full bg-black/10" />;
}

function LinkRow({
  href,
  label,
  external,
  indent = 0,
  upper,
  onClick,
}: {
  href: string;
  label: string;
  external?: boolean;
  indent?: number;
  upper?: boolean;
  onClick: () => void;
}) {
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
        onClick={onClick}
        className={base}
        style={style}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} onClick={onClick} className={base} style={style}>
      {content}
    </Link>
  );
}

function RowBtn({
  children,
  onClick,
  right,
  strong,
  upper,
  indent = 0,
}: {
  children: ReactNode;
  onClick?: () => void;
  right?: ReactNode;
  strong?: boolean;
  upper?: boolean;
  indent?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full cursor-pointer select-none text-left",
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
}

function RegionToggleMini({
  value,
  onChange,
}: {
  value: RegionKey;
  onChange: (v: RegionKey) => void;
}) {
  return (
    <div className="inline-flex rounded-full bg-[#f3f3f3] p-1 shadow-sm">
      <button
        type="button"
        onClick={() => onChange("uz")}
        className={cn(
          "h-8 rounded-full px-3 text-[12px] tracking-[0.14em] transition",
          value === "uz"
            ? "bg-black text-white"
            : "text-black/70 hover:bg-black/5 hover:text-black",
        )}
      >
        UZ
      </button>

      <button
        type="button"
        onClick={() => onChange("ru")}
        className={cn(
          "h-8 rounded-full px-3 text-[12px] tracking-[0.14em] transition",
          value === "ru"
            ? "bg-black text-white"
            : "text-black/70 hover:bg-black/5 hover:text-black",
        )}
      >
        RU
      </button>
    </div>
  );
}

function StoreRowMini({
  store,
  active,
  onClick,
}: {
  store: Store;
  active: boolean;
  onClick: () => void;
}) {
  const hours = String(store.hours ?? "").trim();

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-[18px] border p-3 text-left transition",
        active
          ? "border-black/20 bg-black/[0.03]"
          : "border-black/10 bg-white hover:bg-black/[0.02]",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
            active ? "border-black bg-black text-white" : "border-black/15",
          )}
        >
          {active ? <Check className="h-3.5 w-3.5" /> : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-medium text-black/85">
            {store.title}
          </div>

          <div className="mt-1 flex items-start gap-2 text-[12px] text-black/70">
            <MapPin className="mt-[1px] h-4 w-4 shrink-0 text-black/35" />
            <span>{store.address}</span>
          </div>

          {store.phone ? (
            <div className="mt-2 flex items-center gap-2 text-[12px] text-black/70">
              <Phone className="h-4 w-4 shrink-0 text-black/35" />
              <span>{store.phone}</span>
            </div>
          ) : null}

          {hours ? (
            <div className="mt-2 flex items-center gap-2 text-[12px] text-black/70">
              <Clock className="h-4 w-4 shrink-0 text-black/35" />
              <span>{store.hours}</span>
            </div>
          ) : null}
        </div>
      </div>
    </button>
  );
}

function RussiaLegalMiniCard({
  store,
  active,
  onClick,
}: {
  store: Store;
  active: boolean;
  onClick: () => void;
}) {
  const legal = store.legalDetails;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-[18px] border p-3 text-left transition",
        active
          ? "border-[#ccb086] bg-[#f7f1e7]"
          : "border-black/10 bg-white hover:bg-black/[0.02]",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
            active
              ? "border-[#d8c3a5] bg-white text-[#8e6d3f]"
              : "border-black/15 text-black/45",
          )}
        >
          {active ? (
            <Check className="h-4 w-4" />
          ) : (
            <Building2 className="h-4 w-4" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold text-black/90">
            {store.title}
          </div>

          <div className="mt-3 rounded-[16px] border border-[#d8c3a5] bg-white/80 p-3">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9b7a4a]">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              Юридический адрес
            </div>

            <div className="text-[12px] font-medium leading-5 text-black/75">
              {legal?.legalAddress ?? store.address}
            </div>
          </div>

          <div className="mt-3 rounded-[16px] border border-black/10 bg-white p-3">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/45">
              <Landmark className="h-3.5 w-3.5 shrink-0" />
              Реквизиты
            </div>

            <div className="grid gap-2 text-[12px] text-black/75">
              {legal?.ogrn ? (
                <div className="flex items-center justify-between gap-2 rounded-xl bg-black/[0.035] px-2.5 py-2">
                  <span className="flex items-center gap-1.5 font-medium text-black/45">
                    <Hash className="h-3.5 w-3.5 shrink-0" />
                    ОГРН
                  </span>
                  <span className="font-semibold text-black">{legal.ogrn}</span>
                </div>
              ) : null}

              {legal?.inn ? (
                <div className="flex items-center justify-between gap-2 rounded-xl bg-black/[0.035] px-2.5 py-2">
                  <span className="flex items-center gap-1.5 font-medium text-black/45">
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                    ИНН
                  </span>
                  <span className="font-semibold text-black">{legal.inn}</span>
                </div>
              ) : null}

              {legal?.kpp ? (
                <div className="flex items-center justify-between gap-2 rounded-xl bg-black/[0.035] px-2.5 py-2">
                  <span className="flex items-center gap-1.5 font-medium text-black/45">
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                    КПП
                  </span>
                  <span className="font-semibold text-black">{legal.kpp}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

function yandexEmbedUrl(query: string) {
  const q = encodeURIComponent(query);
  return `https://yandex.ru/map-widget/v1/?z=15&text=${q}`;
}

function ContactsMiniBlock() {
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

  const onRegionChange = (v: RegionKey) => {
    setRegion(v);
    const first = (v === "ru" ? RU_STORES : UZ_STORES)[0]?.id ?? "";
    setActiveId(first);
  };

  const isRu = region === "ru";

  const mapTitle = isRu
    ? (activeStore?.address ?? "")
    : (activeStore?.title ?? "");

  const mapQuery = activeStore?.mapQuery ?? activeStore?.address ?? "";

  return (
    <div className="overflow-hidden rounded-none border border-black/10 bg-white shadow-sm">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between gap-3">
          <RegionToggleMini value={region} onChange={onRegionChange} />

          <div className="whitespace-nowrap text-[11px] tracking-[0.18em] text-black/45">
            ВЫБРАНО:{" "}
            <span className="text-black/80">
              {isRu ? "РОССИЯ" : "УЗБЕКИСТАН"}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="rounded-[22px] border border-black/10 bg-white p-3">
          <div className="max-h-[320px] overflow-auto overscroll-contain p-2">
            <div className="grid gap-3">
              {stores.map((s) => {
                if (isRu) {
                  return (
                    <RussiaLegalMiniCard
                      key={s.id}
                      store={s}
                      active={s.id === activeId}
                      onClick={() => setActiveId(s.id)}
                    />
                  );
                }

                return (
                  <StoreRowMini
                    key={s.id}
                    store={s}
                    active={s.id === activeId}
                    onClick={() => setActiveId(s.id)}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {activeStore?.title ? (
          <div className="mt-3 text-[11px] tracking-[0.18em] text-black/45">
            Выбрано: <span className="text-black/75">{activeStore.title}</span>
          </div>
        ) : null}

        <div className="mt-3 overflow-hidden rounded-[22px] border border-black/10 bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-black/10 px-4 py-3">
            <div className="min-w-0">
              <div className="text-[10px] tracking-[0.18em] text-black/45">
                КАРТА
              </div>

              <div className="truncate text-[13px] font-medium text-black/85">
                {mapTitle}
              </div>
            </div>

            <a
              href={`https://yandex.ru/maps/?text=${encodeURIComponent(
                mapQuery,
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center justify-center rounded-full border border-black/10 bg-white px-3 py-2 text-[10px] font-medium tracking-[0.14em] text-black/70 transition hover:border-black/20 hover:text-black"
            >
              ОТКРЫТЬ
            </a>
          </div>

          <div className="relative h-[240px] w-full">
            <iframe
              key={`${region}-${activeStore?.id}`}
              title="Yandex Map Mini"
              src={yandexEmbedUrl(mapQuery)}
              className="absolute inset-0 h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function LanguageMiniBlock({
  lang,
  setLang,
}: {
  lang: LangKey;
  setLang: (v: LangKey) => void;
}) {
  return (
    <div className="pb-1">
      <div className="mb-3 flex items-center gap-2 text-[11px] tracking-[0.18em] text-black/45">
        <Globe className="h-4 w-4 text-black/40" />
        ЯЗЫК
      </div>

      <div className="inline-flex rounded-full bg-[#f3f3f3] p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setLang("ru")}
          className={cn(
            "h-9 cursor-pointer rounded-full px-4 text-[12px] tracking-[0.14em] transition",
            lang === "ru"
              ? "bg-black text-white"
              : "text-black/70 hover:bg-black/5 hover:text-black",
          )}
        >
          RU
        </button>

        <button
          type="button"
          onClick={() => setLang("uz")}
          className={cn(
            "h-9 cursor-pointer rounded-full px-4 text-[12px] tracking-[0.14em] transition",
            lang === "uz"
              ? "bg-black text-white"
              : "text-black/70 hover:bg-black/5 hover:text-black",
          )}
        >
          UZ
        </button>
      </div>
    </div>
  );
}

type RoomItem = { title: string; href: string };
type Room = { key: string; title: string; items: RoomItem[] };

export default function MobileMenu({
  open,
  onClose,
  links,
  categories,
  lang,
  setLang,
}: {
  open: boolean;
  onClose: () => void;
  links: readonly MenuLink[];
  categories?: unknown[];
  lang: LangKey;
  setLang: (v: LangKey) => void;
}) {
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

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKey);

    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const rooms = useMemo<Room[]>(() => {
    const arr = Array.isArray(categories) ? categories : [];

    return arr
      .filter(Boolean)
      .map((c, idx) => {
        const title = catTitle(c);

        const items = catItems(c)
          .map(
            (it): RoomItem => ({
              title: itemTitle(it),
              href: itemHref(it),
            }),
          )
          .filter((x) => x.title && x.href);

        const keyBase = normKey(title) || `room-${idx}`;

        return { key: keyBase, title, items };
      })
      .filter((r) => r.title);
  }, [categories]);

  const [catalogOpen, setCatalogOpen] = useState(false);
  const [openRoomKey, setOpenRoomKey] = useState<string>("");

  const onToggleCatalog = () => {
    setCatalogOpen((v) => {
      const next = !v;

      if (next) {
        const firstKey = rooms[0]?.key ?? "";
        setOpenRoomKey((prev) => prev || firstKey);
      }

      return next;
    });
  };

  const onToggleRoom = (roomKey: string) => {
    setOpenRoomKey((prev) => (prev === roomKey ? "" : roomKey));
  };

  const menuLinks = useMemo(() => {
    return Array.isArray(links) ? links.filter((x) => x?.label && x?.href) : [];
  }, [links]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] md:hidden">
      <button
        type="button"
        aria-label="Close menu overlay"
        className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <aside
        className={cn(
          "absolute left-0 top-0 h-full w-[88vw] max-w-[390px]",
          "bg-[#f3f3f3]",
          "shadow-[0_22px_60px_-28px_rgba(0,0,0,0.45)]",
          "rounded-none",
          "overflow-hidden",
          "flex flex-col",
        )}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div className="text-[12px] uppercase tracking-[0.22em] text-black/45">
            Меню
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 cursor-pointer place-items-center rounded-full transition hover:bg-black/[0.05]"
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-black/55" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6">
          <LanguageMiniBlock lang={lang} setLang={setLang} />

          <div className="mt-3 overflow-hidden rounded-none border border-black/10 bg-white shadow-sm">
            <RowBtn
              strong
              upper
              onClick={onToggleCatalog}
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
                        onClick={() => onToggleRoom(r.key)}
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
                              key={`${it.href}${it.title}`}
                              href={it.href}
                              label={it.title}
                              indent={22}
                              onClick={onClose}
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
              <div key={`${l.href}${idx}`}>
                <LinkRow
                  href={l.href}
                  label={l.label}
                  external={l.isExternal}
                  onClick={onClose}
                />

                {idx !== menuLinks.length - 1 ? <Divider /> : null}
              </div>
            ))}
          </div>

          <div className="mt-4">
            <ContactsMiniBlock />
          </div>
        </div>
      </aside>
    </div>
  );
}
