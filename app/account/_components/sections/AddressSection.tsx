"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase/client";
import { Pencil, Trash2, X, Check } from "lucide-react";
import Link from "next/link";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

type Addr = {
  id: string;
  title: string | null;
  city: string | null;
  street: string | null;
  house: string | null;
  apartment: string | null;
  is_default: boolean;
};

type EditForm = {
  id: string;
  title: string;
  city: string;
  street: string;
  house: string;
  apartment: string;
};

export default function AddressSection({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Addr[]>([]);
  const [err, setErr] = useState<string | null>(null);

  // add form
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("Дом");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [house, setHouse] = useState("");
  const [apartment, setApartment] = useState("");

  // edit state
  const [editing, setEditing] = useState<EditForm | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  async function refresh() {
    setErr(null);
    setLoading(true);

    const { data, error } = await supabase
      .from("addresses")
      .select("id,title,city,street,house,apartment,is_default")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) setErr(error.message);
    setRows((data as any) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function add() {
    setErr(null);
    setAdding(true);

    const { error } = await supabase.from("addresses").insert({
      user_id: userId,
      title,
      city: city || null,
      street: street || null,
      house: house || null,
      apartment: apartment || null,
    });

    setAdding(false);

    if (error) {
      setErr(error.message);
      return;
    }

    setOpen(false);
    setTitle("Дом");
    setCity("");
    setStreet("");
    setHouse("");
    setApartment("");
    refresh();
  }

  function startEdit(a: Addr) {
    setErr(null);
    setEditing({
      id: a.id,
      title: a.title ?? "",
      city: a.city ?? "",
      street: a.street ?? "",
      house: a.house ?? "",
      apartment: a.apartment ?? "",
    });
  }

  function cancelEdit() {
    setEditing(null);
  }

  async function saveEdit() {
    if (!editing) return;
    setErr(null);
    setSavingEdit(true);

    const { error } = await supabase
      .from("addresses")
      .update({
        title: editing.title || null,
        city: editing.city || null,
        street: editing.street || null,
        house: editing.house || null,
        apartment: editing.apartment || null,
      })
      .eq("id", editing.id)
      .eq("user_id", userId);

    setSavingEdit(false);

    if (error) {
      setErr(error.message);
      return;
    }

    setEditing(null);
    refresh();
  }

  async function removeAddress(id: string) {
    setErr(null);
    setDeletingId(id);

    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    setDeletingId(null);

    if (error) {
      setErr(error.message);
      return;
    }

    // если удалили тот, который редактировали
    if (editing?.id === id) setEditing(null);

    refresh();
  }

  function addrLine(a: Addr) {
    return [a.city, a.street, a.house, a.apartment && `кв ${a.apartment}`]
      .filter(Boolean)
      .join(", ");
  }

  return (
    <div className="space-y-4">
      {/* Add block */}
      <div className="rounded-[28px] border border-black/10 bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[12px] tracking-[0.22em] uppercase text-black/50">
              Адресная книга
            </div>
            <div className="mt-1 text-[14px] text-black/70">
              Сохранённые адреса доставки.
            </div>
          </div>

          <button
            onClick={() => {
              setErr(null);
              setOpen((v) => !v);
              // закрывая "добавить", не мешаем редактированию
            }}
            className="h-10 px-4 rounded-2xl bg-black text-white transition cursor-pointer hover:translate-y-[-1px] active:translate-y-[0px]"
          >
            <span className="text-[12px] tracking-[0.18em] uppercase">
              {open ? "Закрыть" : "Добавить"}
            </span>
          </button>
        </div>

        {open && (
          <div className="mt-4 grid gap-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Название (Дом/Работа)"
                className="rounded-2xl border border-black/10 px-4 py-3 outline-none text-[14px]"
              />
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Город"
                className="rounded-2xl border border-black/10 px-4 py-3 outline-none text-[14px]"
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <input
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Улица"
                className="rounded-2xl border border-black/10 px-4 py-3 outline-none text-[14px]"
              />
              <input
                value={house}
                onChange={(e) => setHouse(e.target.value)}
                placeholder="Дом"
                className="rounded-2xl border border-black/10 px-4 py-3 outline-none text-[14px]"
              />
            </div>

            <input
              value={apartment}
              onChange={(e) => setApartment(e.target.value)}
              placeholder="Квартира (необязательно)"
              className="rounded-2xl border border-black/10 px-4 py-3 outline-none text-[14px]"
            />

            <button
              onClick={add}
              disabled={adding}
              className={cn(
                "mt-2 h-11 rounded-2xl bg-black text-white transition cursor-pointer hover:translate-y-[-1px] active:translate-y-[0px]",
                adding && "opacity-60 cursor-not-allowed hover:translate-y-0",
              )}
            >
              <span className="text-[12px] tracking-[0.18em] uppercase">
                {adding ? "Сохранение…" : "Сохранить адрес"}
              </span>
            </button>
          </div>
        )}

        {err && (
          <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/[0.06] px-4 py-3 text-[13px] text-rose-900">
            {err}
          </div>
        )}
      </div>

      {/* List block */}
      <div className="rounded-[28px] border border-black/10 bg-white p-5">
        {loading ? (
          <div className="text-[14px] text-black/60">Загрузка…</div>
        ) : rows.length === 0 ? (
          <div className="text-[14px] text-black/60">Адресов пока нет.</div>
        ) : (
          <div className="space-y-2">
            {rows.map((a) => {
              const isEditing = editing?.id === a.id;

              return (
                <div
                  key={a.id}
                  className="rounded-2xl border border-black/10 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[13px] text-black/80">
                        {a.title ?? "Адрес"}
                      </div>
                      <div className="mt-1 text-[12px] text-black/55">
                        {addrLine(a) || "—"}
                      </div>
                    </div>

                    {/* actions */}
                    <div className="flex items-center gap-2">
                      {!isEditing ? (
                        <button
                          onClick={() => startEdit(a)}
                          className="h-9 w-9 rounded-xl border border-black/10 grid place-items-center text-black/60 hover:text-black hover:bg-black/[0.04] transition cursor-pointer"
                          title="Редактировать"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={cancelEdit}
                          className="h-9 w-9 rounded-xl border border-black/10 grid place-items-center text-black/60 hover:text-black hover:bg-black/[0.04] transition cursor-pointer"
                          title="Отменить"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        onClick={() => removeAddress(a.id)}
                        disabled={deletingId === a.id}
                        className={cn(
                          "h-9 w-9 rounded-xl border border-black/10 grid place-items-center transition cursor-pointer",
                          "text-black/60 hover:text-black hover:bg-black/[0.04]",
                          deletingId === a.id &&
                            "opacity-60 cursor-not-allowed hover:bg-transparent hover:text-black/60",
                        )}
                        title="Удалить"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* edit form */}
                  {isEditing && editing && (
                    <div className="mt-4 grid gap-2">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <input
                          value={editing.title}
                          onChange={(e) =>
                            setEditing({ ...editing, title: e.target.value })
                          }
                          placeholder="Название (Дом/Работа)"
                          className="rounded-2xl border border-black/10 px-4 py-3 outline-none text-[14px]"
                        />
                        <input
                          value={editing.city}
                          onChange={(e) =>
                            setEditing({ ...editing, city: e.target.value })
                          }
                          placeholder="Город"
                          className="rounded-2xl border border-black/10 px-4 py-3 outline-none text-[14px]"
                        />
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        <input
                          value={editing.street}
                          onChange={(e) =>
                            setEditing({ ...editing, street: e.target.value })
                          }
                          placeholder="Улица"
                          className="rounded-2xl border border-black/10 px-4 py-3 outline-none text-[14px]"
                        />
                        <input
                          value={editing.house}
                          onChange={(e) =>
                            setEditing({ ...editing, house: e.target.value })
                          }
                          placeholder="Дом"
                          className="rounded-2xl border border-black/10 px-4 py-3 outline-none text-[14px]"
                        />
                      </div>

                      <input
                        value={editing.apartment}
                        onChange={(e) =>
                          setEditing({ ...editing, apartment: e.target.value })
                        }
                        placeholder="Квартира (необязательно)"
                        className="rounded-2xl border border-black/10 px-4 py-3 outline-none text-[14px]"
                      />

                      <button
                        onClick={saveEdit}
                        disabled={savingEdit}
                        className={cn(
                          "mt-1 h-11 rounded-2xl bg-black text-white transition cursor-pointer hover:translate-y-[-1px] active:translate-y-[0px]",
                          savingEdit &&
                            "opacity-60 cursor-not-allowed hover:translate-y-0",
                        )}
                      >
                        <span className="inline-flex items-center justify-center gap-2 text-[12px] tracking-[0.18em] uppercase">
                          <Check className="h-4 w-4" />
                          {savingEdit ? "Сохранение…" : "Сохранить изменения"}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* optional: quick link */}
      <div className="px-1">
        <Link
          href="/catalog"
          className="text-[12px] tracking-[0.18em] uppercase text-black/50 hover:text-black transition"
        >
          Добавить адрес для заказа — перейти в каталог
        </Link>
      </div>
    </div>
  );
}
