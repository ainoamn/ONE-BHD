import { and, desc, eq, gte, sql } from "drizzle-orm";
import { createHash, randomInt } from "crypto";
import { getDb, getSql, isDatabaseConfigured, ensureIdentitySchema } from "../../../db";
import { contacts, ipBlocks, loginEvents, recoveryChallenges, users, type BhdUser } from "../../../db/schema";
import { sendResendEmail, resendApiKey } from "./mail";
import { hashPassword, isStrongPassword } from "./passwords";

export const TEMP_LOCK_ATTEMPTS = 5;
export const TEMP_LOCK_MINUTES = 15;
export const SECURITY_HOLD_ATTEMPTS = 8;
export const IP_FAIL_LIMIT = 12;
export const IP_FAIL_WINDOW_MINUTES = 15;
export const IP_BLOCK_MINUTES = 60;
export const RECOVERY_CODE_MINUTES = 15;

function hashCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

function sixDigits() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

function digits(value: string | null | undefined) {
  return (value || "").replace(/\D/g, "");
}

function sameText(a: string | null | undefined, b: string | null | undefined) {
  return (a || "").trim().toLowerCase() === (b || "").trim().toLowerCase();
}

function muscatDay(value: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Muscat",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

export async function recordLoginEvent(input: {
  userId?: string | null;
  email?: string | null;
  ip?: string | null;
  country?: string | null;
  userAgent?: string | null;
  ok: boolean;
  reason: string;
}) {
  if (!isDatabaseConfigured()) return;
  await ensureIdentitySchema();
  const db = getDb();
  await db.insert(loginEvents).values({
    userId: input.userId || null,
    email: input.email?.trim().toLowerCase() || null,
    ip: input.ip || null,
    country: input.country || null,
    userAgent: input.userAgent || null,
    ok: input.ok,
    reason: input.reason,
  });
  if (!input.ok && input.ip) {
    await maybeBlockIp(input.ip);
  }
}

async function maybeBlockIp(ip: string) {
  const db = getDb();
  const since = new Date(Date.now() - IP_FAIL_WINDOW_MINUTES * 60_000);
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(loginEvents)
    .where(and(eq(loginEvents.ip, ip), eq(loginEvents.ok, false), gte(loginEvents.createdAt, since)));
  if ((row?.count || 0) < IP_FAIL_LIMIT) return;
  const until = new Date(Date.now() + IP_BLOCK_MINUTES * 60_000);
  await getSql()`
    INSERT INTO bhd_ip_blocks (ip, until, reason)
    VALUES (${ip}, ${until}, ${"repeated_failed_logins"})
    ON CONFLICT (ip) DO UPDATE SET until = EXCLUDED.until, reason = EXCLUDED.reason
  `;
}

export async function assertIpAllowed(ip: string | null): Promise<void> {
  if (!ip || !isDatabaseConfigured()) return;
  await ensureIdentitySchema();
  const db = getDb();
  const [block] = await db.select().from(ipBlocks).where(eq(ipBlocks.ip, ip)).limit(1);
  if (block && block.until > new Date()) {
    throw new Error("IP_BLOCKED");
  }
}

export async function listSecurityFeed(limit = 200) {
  await ensureIdentitySchema();
  const db = getDb();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const events = await db
    .select()
    .from(loginEvents)
    .where(gte(loginEvents.createdAt, since))
    .orderBy(desc(loginEvents.createdAt))
    .limit(limit);
  const blocks = await db.select().from(ipBlocks).orderBy(desc(ipBlocks.createdAt)).limit(100);
  const held = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      securityHold: users.securityHold,
      securityHoldAt: users.securityHoldAt,
      lockedUntil: users.lockedUntil,
      lastLoginIp: users.lastLoginIp,
      lastLoginAt: users.lastLoginAt,
    })
    .from(users)
    .where(eq(users.securityHold, true))
    .limit(100);

  const countryMap = new Map<string, { country: string; ok: number; fail: number }>();
  for (const event of events) {
    const country = event.country || "??";
    const current = countryMap.get(country) || { country, ok: 0, fail: 0 };
    if (event.ok) current.ok += 1;
    else current.fail += 1;
    countryMap.set(country, current);
  }

  return {
    events: events.map((event) => ({
      id: event.id,
      userId: event.userId,
      email: event.email,
      ip: event.ip,
      country: event.country,
      userAgent: event.userAgent,
      ok: event.ok,
      reason: event.reason,
      createdAt: event.createdAt.toISOString(),
    })),
    blocks: blocks.map((row) => ({
      ip: row.ip,
      until: row.until.toISOString(),
      reason: row.reason,
      active: row.until > new Date(),
    })),
    heldAccounts: held.map((row) => ({
      id: row.id,
      email: row.email,
      name: row.name,
      securityHoldAt: row.securityHoldAt?.toISOString() || null,
      lockedUntil: row.lockedUntil?.toISOString() || null,
      lastLoginIp: row.lastLoginIp,
      lastLoginAt: row.lastLoginAt?.toISOString() || null,
    })),
    countries: [...countryMap.values()].sort((a, b) => b.ok + b.fail - (a.ok + a.fail)),
    failedLastHour: events.filter((event) => !event.ok && event.createdAt > new Date(Date.now() - 3600_000)).length,
    okLastHour: events.filter((event) => event.ok && event.createdAt > new Date(Date.now() - 3600_000)).length,
  };
}

export function buildAuditChecks(input: {
  authSecret: boolean;
  database: boolean;
  google: boolean;
  facebook: boolean;
  resend: boolean;
  adminEmails: boolean;
  failedLastHour: number;
  activeIpBlocks: number;
  heldAccounts: number;
}) {
  const checks = [
    { id: "auth-secret", ok: input.authSecret, title: "AUTH_SECRET", detail: "توقيع جلسات JWT" },
    { id: "database", ok: input.database, title: "Neon", detail: "قاعدة الهوية متصلة" },
    { id: "google", ok: input.google, title: "Google", detail: "دخول اجتماعي جاهز" },
    { id: "facebook", ok: input.facebook, title: "Facebook", detail: "دخول اجتماعي جاهز" },
    { id: "resend", ok: input.resend, title: "البريد", detail: "رموز الاستعادة والتحقق" },
    { id: "admins", ok: input.adminEmails, title: "أدمن المنصة", detail: "BHD_PLATFORM_ADMIN_EMAILS" },
    {
      id: "failures",
      ok: input.failedLastHour < 20,
      title: "محاولات فاشلة",
      detail: `${input.failedLastHour} خلال الساعة`,
    },
    {
      id: "ip-blocks",
      ok: true,
      title: "حظر العناوين",
      detail: `${input.activeIpBlocks} عنوان محظور الآن`,
    },
    {
      id: "holds",
      ok: true,
      title: "حسابات موقوفة أمنياً",
      detail: `${input.heldAccounts} بانتظار استعادة المالك`,
    },
  ];
  const threats: string[] = [];
  if (input.failedLastHour >= 20) threats.push("ارتفاع محاولات الدخول الفاشلة خلال الساعة — راقب حظر العناوين.");
  if (input.heldAccounts > 0) threats.push("توجد حسابات مقفلة حتى يثبت المالك بياناته عبر الاستعادة.");
  if (!input.resend) threats.push("Resend غير مفعّل: رموز البريد لن تصل حتى يُضبط المفتاح.");
  if (!input.authSecret || !input.database) threats.push("الهوية غير مكتملة الإعداد.");
  return { checks, threats, score: checks.filter((item) => item.ok).length };
}

export async function startAccountRecovery(input: {
  email: string;
  civilId: string;
  civilIdExpires: string;
  birthDate: string;
  whatsapp: string;
  lastLoginDate: string;
  lastTransactions: string;
}): Promise<{ challengeId: string; whatsappReady: boolean; emailSent: boolean }> {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL_MISSING");
  await ensureIdentitySchema();
  const db = getDb();
  const email = input.email.trim().toLowerCase();
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) throw new Error("RECOVERY_MISMATCH");
  if (!user.securityHold && !(user.lockedUntil && user.lockedUntil > new Date())) {
    throw new Error("RECOVERY_NOT_REQUIRED");
  }

  const [card] = await db.select().from(contacts).where(eq(contacts.ownerUserId, user.id)).limit(1);
  if (user.civilId && digits(user.civilId) !== digits(input.civilId)) throw new Error("RECOVERY_MISMATCH");
  if (user.civilIdExpires && !sameText(user.civilIdExpires, input.civilIdExpires)) throw new Error("RECOVERY_MISMATCH");
  if (user.birthDate && !sameText(user.birthDate, input.birthDate)) throw new Error("RECOVERY_MISMATCH");
  const storedWhatsapp = card?.whatsapp || user.phone || "";
  if (storedWhatsapp && digits(storedWhatsapp) !== digits(input.whatsapp)) throw new Error("RECOVERY_MISMATCH");
  if (user.lastLoginAt && input.lastLoginDate) {
    if (muscatDay(user.lastLoginAt) !== input.lastLoginDate.trim()) throw new Error("RECOVERY_MISMATCH");
  }
  if ((input.lastTransactions || "").trim().length < 4) throw new Error("RECOVERY_MISMATCH");

  const emailCode = sixDigits();
  const whatsappCode = sixDigits();
  const whatsappReady = Boolean(process.env.WHATSAPP_TOKEN?.trim() && process.env.WHATSAPP_FROM?.trim());
  const [challenge] = await db
    .insert(recoveryChallenges)
    .values({
      userId: user.id,
      emailCodeHash: hashCode(emailCode),
      whatsappCodeHash: hashCode(whatsappCode),
      expiresAt: new Date(Date.now() + RECOVERY_CODE_MINUTES * 60_000),
      emailVerified: false,
      whatsappVerified: !whatsappReady,
      whatsappPending: !whatsappReady,
    })
    .returning();

  let emailSent = false;
  if (resendApiKey()) {
    await sendResendEmail({
      to: user.email,
      subject: "رمز استعادة حساب BHD",
      text: `رمز التحقق: ${emailCode} — صالح ${RECOVERY_CODE_MINUTES} دقيقة.`,
      html: `<p>رمز التحقق لاستعادة حسابك في BHD:</p><p style="font-size:28px;letter-spacing:6px"><strong>${emailCode}</strong></p><p>صالح لمدة ${RECOVERY_CODE_MINUTES} دقيقة. إن لم تطلب الاستعادة فتجاهل الرسالة.</p>`,
    });
    emailSent = true;
  }

  if (whatsappReady) {
    await sendWhatsappOtp(input.whatsapp, whatsappCode);
  }

  return { challengeId: challenge.id, whatsappReady, emailSent };
}

export async function sendWhatsappOtp(phone: string, code: string): Promise<{ sent: boolean }> {
  const token = process.env.WHATSAPP_TOKEN?.trim();
  const from = process.env.WHATSAPP_FROM?.trim();
  if (!token || !from) {
    console.info("whatsapp otp not configured", digits(phone).slice(-4));
    return { sent: false };
  }
  const response = await fetch(`https://graph.facebook.com/v21.0/${from}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: digits(phone),
      type: "text",
      text: { body: `رمز استعادة حساب BHD: ${code}` },
    }),
  });
  if (!response.ok) {
    console.error("whatsapp otp failed", await response.text().catch(() => ""));
    return { sent: false };
  }
  return { sent: true };
}

export async function verifyRecoveryCodes(input: {
  challengeId: string;
  emailCode: string;
  whatsappCode?: string;
}) {
  await ensureIdentitySchema();
  const db = getDb();
  const [challenge] = await db
    .select()
    .from(recoveryChallenges)
    .where(eq(recoveryChallenges.id, input.challengeId))
    .limit(1);
  if (!challenge || challenge.consumedAt || challenge.expiresAt < new Date()) {
    throw new Error("RECOVERY_EXPIRED");
  }
  if (hashCode(input.emailCode.trim()) !== challenge.emailCodeHash) throw new Error("RECOVERY_CODE");
  if (!challenge.whatsappPending) {
    if (!input.whatsappCode || hashCode(input.whatsappCode.trim()) !== challenge.whatsappCodeHash) {
      throw new Error("RECOVERY_CODE");
    }
  }
  await db
    .update(recoveryChallenges)
    .set({ emailVerified: true, whatsappVerified: true })
    .where(eq(recoveryChallenges.id, challenge.id));
  return { ok: true, challengeId: challenge.id };
}

export async function finishRecoveryPassword(input: { challengeId: string; password: string }) {
  if (!isStrongPassword(input.password)) throw new Error("WEAK_PASSWORD");
  await ensureIdentitySchema();
  const db = getDb();
  const [challenge] = await db
    .select()
    .from(recoveryChallenges)
    .where(eq(recoveryChallenges.id, input.challengeId))
    .limit(1);
  if (!challenge || challenge.consumedAt || !challenge.emailVerified || !challenge.whatsappVerified) {
    throw new Error("RECOVERY_EXPIRED");
  }
  await db
    .update(users)
    .set({
      passwordHash: await hashPassword(input.password),
      loginAttempts: 0,
      lockedUntil: null,
      securityHold: false,
      securityHoldAt: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, challenge.userId));
  await db
    .update(recoveryChallenges)
    .set({ consumedAt: new Date() })
    .where(eq(recoveryChallenges.id, challenge.id));
}

export async function applyFailedPassword(user: BhdUser | undefined) {
  if (!user) return { locked: false, hold: false };
  const db = getDb();
  const attempts = user.loginAttempts + 1;
  const lockedUntil = attempts >= TEMP_LOCK_ATTEMPTS ? new Date(Date.now() + TEMP_LOCK_MINUTES * 60_000) : null;
  const hold = attempts >= SECURITY_HOLD_ATTEMPTS;
  await db
    .update(users)
    .set({
      loginAttempts: attempts,
      lockedUntil,
      securityHold: hold || user.securityHold,
      securityHoldAt: hold ? new Date() : user.securityHoldAt,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));
  return { locked: Boolean(lockedUntil), hold };
}
