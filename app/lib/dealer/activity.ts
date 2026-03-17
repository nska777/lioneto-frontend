type DealerActivityPayload = {
  dealerId?: number | null;
  actionType: string;
  entityType?: string;
  entityId?: string;
  entityTitle?: string;
  url?: string;
  ip?: string;
  userAgent?: string;
  payload?: Record<string, unknown>;
};

function getStrapiBase() {
  return (
    process.env.STRAPI_URL ||
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    "http://localhost:1337"
  ).replace(/\/$/, "");
}

export async function writeDealerActivity(
  input: DealerActivityPayload
): Promise<void> {
  const token = process.env.STRAPI_TOKEN;
  const base = getStrapiBase();

  if (!token) {
    throw new Error("[dealer-activity] Missing STRAPI_TOKEN");
  }

  const body = {
    data: {
      dealer: input.dealerId ?? null,
      actionType: input.actionType,
      entityType: input.entityType ?? "",
      entityId: input.entityId ?? "",
      entityTitle: input.entityTitle ?? "",
      url: input.url ?? "",
      ip: input.ip ?? "",
      userAgent: input.userAgent ?? "",
      payload: input.payload ?? {},
    },
  };

  const res = await fetch(`${base}/api/dealer-activity-logs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `[dealer-activity] Strapi create failed: ${res.status} ${text}`
    );
  }
}