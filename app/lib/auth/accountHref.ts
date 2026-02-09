"use client";

import { supabase } from "@/app/lib/supabase/client";

export async function getAccountHref() {
  const { data } = await supabase.auth.getSession();
  return data.session ? "/account" : "/auth?next=/account";
}
