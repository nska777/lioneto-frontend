import { cookies } from "next/headers";

type DealerMe = {
  dealerId?: string;
  documentId?: string;
  title?: string;
  managerName?: string;
  email?: string;
  phone?: string;
  city?: string;
  address?: string;
  isActive?: boolean;
};

export async function getCurrentDealer(): Promise<DealerMe | null> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    const res = await fetch(`${baseUrl}/api/dealer/auth/me`, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieHeader,
      },
    });

    if (!res.ok) {
      return null;
    }

    const json = (await res.json()) as DealerMe | null;
    return json ?? null;
  } catch {
    return null;
  }
}