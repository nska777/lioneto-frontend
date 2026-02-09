import { supabase } from "@/app/lib/supabase/client";

export type WishlistSnapshot = Record<string, any>;

export async function wishlistUpsert(productId: string, snapshot: WishlistSnapshot) {
  const { data: u } = await supabase.auth.getUser();
  const userId = u.user?.id;
  if (!userId) return { ok: false as const, reason: "no-auth" as const };

  const { error } = await supabase
    .from("wishlist_items")
    .upsert(
      {
        user_id: userId,
        product_id: String(productId),
        product_snapshot: snapshot ?? {},
      },
      { onConflict: "user_id,product_id" }
    );

  if (error) return { ok: false as const, reason: error.message };

  return { ok: true as const };
}

export async function wishlistRemove(productId: string) {
  const { data: u } = await supabase.auth.getUser();
  const userId = u.user?.id;
  if (!userId) return { ok: false as const, reason: "no-auth" as const };

  const { error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", String(productId));

  if (error) return { ok: false as const, reason: error.message };

  return { ok: true as const };
}

export async function wishlistList() {
  const { data: u } = await supabase.auth.getUser();
  const userId = u.user?.id;
  if (!userId) return { ok: false as const, items: [] as any[] };

  const { data, error } = await supabase
    .from("wishlist_items")
    .select("id, product_id, product_snapshot, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return { ok: false as const, items: [] as any[] };
  return { ok: true as const, items: data ?? [] };
}
