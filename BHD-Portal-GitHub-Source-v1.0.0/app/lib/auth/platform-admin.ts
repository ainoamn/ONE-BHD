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

export async function requirePlatformAdmin(): Promise<
  { ok: true; session: PortalSession } | { ok: false; status: 401 | 403 }
> {
  const session = await getCurrentSession();
  if (!session) return { ok: false, status: 401 };
  if (!isPlatformAdminEmail(session.email)) return { ok: false, status: 403 };
  return { ok: true, session };
}
