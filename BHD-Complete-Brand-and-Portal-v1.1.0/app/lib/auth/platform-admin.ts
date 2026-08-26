import { eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "../../../db";
import { users } from "../../../db/schema";
import { getCurrentSession, type PortalSession } from "./session";

export function platformAdminEmails(): string[] {
  return (process.env.BHD_PLATFORM_ADMIN_EMAILS || "")
    .split(/[,;\n]/)
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function isPlatformAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return platformAdminEmails().includes(email.trim().toLowerCase());
}

/** أدمن المنصة لا يُحجب بمنتجات SSO بسبب بريد غير موثّق — يُثبَّت التوثيق في القاعدة عند أول طلب. */
export async function ensurePlatformAdminEmailVerified(user: {
  id: string;
  email: string;
  emailVerified: boolean;
}): Promise<boolean> {
  if (user.emailVerified) return true;
  if (!isPlatformAdminEmail(user.email) || !isDatabaseConfigured()) return user.emailVerified;
  const db = getDb();
  await db
    .update(users)
    .set({ emailVerified: true, updatedAt: new Date() })
    .where(eq(users.id, user.id));
  return true;
}

export async function requirePlatformAdmin(): Promise<
  { ok: true; session: PortalSession } | { ok: false; status: 401 | 403 }
> {
  const session = await getCurrentSession();
  if (!session) return { ok: false, status: 401 };
  if (!isPlatformAdminEmail(session.email)) return { ok: false, status: 403 };
  return { ok: true, session };
}
