import { cookies } from "next/headers";
import { jwtVerify } from "jose";

type DealerAdminPayload = {
  role?: string;
  dealerId?: number;
  login?: string;
  title?: string;
  email?: string;
  phone?: string;
  city?: string;
  region?: string;
  roleLabel?: string;
  managerName?: string;
  mustChangePassword?: boolean;
};

const secretStr = process.env.DEALER_JWT_SECRET || "dev_secret";
const SECRET = new TextEncoder().encode(secretStr);

function getAdminLogins(): string[] {
  return (process.env.DEALER_ADMIN_LOGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function getCurrentDealerAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("dealer_token")?.value;

  if (!token) return null;

  try {
    const verified = await jwtVerify(token, SECRET);
    const payload = verified.payload as DealerAdminPayload;
    const login = typeof payload.login === "string" ? payload.login : "";

    if (payload.role !== "dealer" || !login) return null;
    if (!getAdminLogins().includes(login)) return null;

    return {
      dealerId: typeof payload.dealerId === "number" ? payload.dealerId : null,
      login,
      title: payload.title || "",
      email: payload.email || "",
      phone: payload.phone || "",
      city: payload.city || "",
      region: payload.region || "",
      roleLabel: payload.roleLabel || "",
      managerName: payload.managerName || "",
    };
  } catch {
    return null;
  }
}