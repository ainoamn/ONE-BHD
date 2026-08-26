import { createHash, randomBytes } from "node:crypto";
import { and, eq, isNull, or } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "../../../db";
import { oauthTickets, users } from "../../../db/schema";
import { identityIssuer } from "../identity/issuer";
import { hashPassword, isStrongPassword } from "./passwords";
import { sendResendEmail } from "./mail";
import { isResendConfigured } from "./email-verification";
import { buildTransactionalMail } from "./email-template-store";

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
  const mail = await buildTransactionalMail("password_reset", resetUrl, base);

  await sendResendEmail({
    to: email,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
  });

  return { expiresAt };
}

/**
 * Self-service forgot-password. Callers should show a generic success message either way.
 */
export async function requestPasswordResetByIdentifier(identifier: string, request?: Request) {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL_MISSING");
  if (!isResendConfigured()) throw new Error("RESEND_NOT_CONFIGURED");

  const raw = identifier.trim().toLowerCase();
  if (!raw || raw.length > 120) throw new Error("INVALID_INPUT");

  const db = getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(or(eq(users.email, raw), eq(users.username, raw)))
    .limit(1);

  if (!user || !user.isActive) {
    return { sent: false as const };
  }

  await issuePasswordReset(user.id, user.email, request);
  return { sent: true as const, email: user.email };
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
