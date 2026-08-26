import { createHash, randomBytes } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "../../../db";
import { oauthTickets, users } from "../../../db/schema";
import { identityIssuer } from "../identity/issuer";
import { hashPassword, isStrongPassword } from "./passwords";
import { sendResendEmail } from "./mail";
import { isResendConfigured } from "./email-verification";

const RESET_KIND = "password_reset";
const RESET_TTL_MS = 1000 * 60 * 60; // 1h

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export { isResendConfigured };

export async function issuePasswordReset(userId: string, email: string, request?: Request) {
  if (!isResendConfigured()) {
    throw new Error("RESEND_NOT_CONFIGURED");
  }

  const db = getDb();
  const token = randomBytes(32).toString("base64url");
  const jti = hashToken(token);
  const expiresAt = new Date(Date.now() + RESET_TTL_MS);

  await db.delete(oauthTickets).where(and(eq(oauthTickets.userId, userId), eq(oauthTickets.kind, RESET_KIND)));

  await db.insert(oauthTickets).values({
    jti,
    kind: RESET_KIND,
    clientId: "bhd-portal",
    userId,
    expiresAt,
    payload: email.toLowerCase(),
  });

  const base = identityIssuer(request);
  const resetUrl = `${base}/reset-password?token=${encodeURIComponent(token)}`;

  await sendResendEmail({
    to: email,
    subject: "إعادة تعيين كلمة مرور حساب BHD",
    html: `
      <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:1.7;color:#092d24">
        <h2 style="margin:0 0 12px">إعادة تعيين كلمة المرور</h2>
        <p>طلبتَ (أو طلب المسؤول) رابطاً لتعيين كلمة مرور جديدة لحساب BHD. الرابط صالح لمدة ساعة واحدة.</p>
        <p style="margin:24px 0">
          <a href="${resetUrl}" style="display:inline-block;background:#0c7459;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:700">
            تعيين كلمة مرور جديدة
          </a>
        </p>
        <p style="font-size:13px;color:#5d7169">إن لم تطلب ذلك، تجاهل الرسالة — لن يتغيّر شيء.</p>
        <p style="font-size:12px;color:#7b8983;word-break:break-all">${resetUrl}</p>
      </div>
    `,
    text: `إعادة تعيين كلمة مرور BHD\n\nافتح الرابط خلال ساعة:\n${resetUrl}\n`,
  });

  return { expiresAt };
}

export async function consumePasswordResetToken(token: string, newPassword: string) {
  const raw = token?.trim();
  if (!raw) throw new Error("INVALID_TOKEN");
  if (!isStrongPassword(newPassword)) throw new Error("WEAK_PASSWORD");

  const db = getDb();
  const jti = hashToken(raw);
  const [ticket] = await db.select().from(oauthTickets).where(eq(oauthTickets.jti, jti)).limit(1);

  if (!ticket || ticket.kind !== RESET_KIND) throw new Error("INVALID_TOKEN");
  if (ticket.consumedAt) throw new Error("TOKEN_USED");
  if (ticket.expiresAt.getTime() < Date.now()) throw new Error("TOKEN_EXPIRED");

  const [user] = await db.select().from(users).where(eq(users.id, ticket.userId)).limit(1);
  if (!user) throw new Error("INVALID_TOKEN");
  if (user.email.toLowerCase() !== ticket.payload.toLowerCase()) throw new Error("INVALID_TOKEN");

  const passwordHash = await hashPassword(newPassword);
  await db
    .update(users)
    .set({
      passwordHash,
      loginAttempts: 0,
      lockedUntil: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  await db
    .update(oauthTickets)
    .set({ consumedAt: new Date() })
    .where(and(eq(oauthTickets.jti, jti), isNull(oauthTickets.consumedAt)));

  return { email: user.email };
}
