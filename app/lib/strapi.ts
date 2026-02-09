// app/lib/strapi.ts

function getStrapiBase(): string {
  const raw = (process.env.NEXT_PUBLIC_STRAPI_URL || "").trim();

  //  быстрый фолбэк для локальной разработки
  if (!raw && process.env.NODE_ENV !== "production") {
    return "http://localhost:1337";
  }

  return raw ? raw.replace(/\/$/, "") : "";
}


function isDev() {
  return process.env.NODE_ENV !== "production";
}

export async function strapiFetch<T = any>(
  path: string,
  init?: RequestInit,
): Promise<T | null> {
  const base = getStrapiBase();
  if (!base) {
    if (isDev()) {
      console.warn("[strapiFetch] NEXT_PUBLIC_STRAPI_URL is empty");
    }
    return null;
  }

  const url = `${base}${path}`;

  const token = process.env.STRAPI_API_TOKEN;

  try {
    const res = await fetch(url, {
      ...init,
      cache: "no-store",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers || {}),
      },
    });

    const text = await res.text();

    if (!res.ok) {
      if (isDev()) {
        console.warn(
          `[strapiFetch] ${res.status} ${res.statusText} → ${url}\n` +
            text.slice(0, 400),
        );
      }
      return null;
    }

    try {
      return (text ? JSON.parse(text) : null) as T;
    } catch {
      if (isDev()) {
        console.warn(
          `[strapiFetch] Non-JSON response from ${url}:\n` +
            text.slice(0, 400),
        );
      }
      return null;
    }
  } catch (e) {
    if (isDev()) {
      console.warn("[strapiFetch] Network error:", e);
    }
    return null;
  }
}

// ✅ Header / Layout
export async function getGlobal<T = any>(): Promise<T | null> {
  const json = await strapiFetch<any>(
    "/api/global?populate[0]=topLinks&populate[1]=phones&populate[2]=addresses&populate[3]=logo",
  );

  if (!json) return null;

  // v5 shape (твой кейс): { data: {...} }
  const v5 = json?.data;
  if (v5 && typeof v5 === "object") return v5 as T;

  // fallback на v4 (на всякий)
  const v4 = json?.data?.attributes;
  if (v4 && typeof v4 === "object") return v4 as T;

  return null;
}
