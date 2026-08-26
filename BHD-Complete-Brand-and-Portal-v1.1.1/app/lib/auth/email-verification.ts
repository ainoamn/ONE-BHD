import { createHash, randomBytes } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "../../../db";
import { oauthTickets, users } from "../../../db/schema";
import { identityIssuer } from "../identity/issuer";
import { sendResendEmail, resendApiKey } from "./mail";
import { buildTransactionalMail } from "./email-template-store";

const VERIFY_KIND = "email_verify";
const VERIFY_TTL_MS = 1000 * 60 * 60 * 24; // 24h

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function isResendConfigured() {
  return Boolean(resendApiKey());
}

export async function issueEmailVerification(userId: string, email: string, request?: Request) {
  const db = getDb();
  const token = randomBytes(32).toString("base64url");
  const jti = hashToken(token);
  const expiresAt = new Date(Date.now() + VERIFY_TTL_MS);

  await db.delete(oauthTickets).where(and(eq(oauthTickets.userId, userId), eq(oauthTickets.kind, VERIFY_KIND)));

  await db.insert(oauthTickets).values({
    jti,
    kind: VERIFY_KIND,
    clientId: "bhd-portal",
    userId,
    expiresAt,
    payload: email.toLowerCase(),
  });

  const base = identityIssuer(request);
  const verifyUrl = `${base}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
  const mail = await buildTransactionalMail("email_verify", verifyUrl, base);

  await sendResendEmail({
    to: email,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
  });

  return { expiresAt };
}

export async function consumeEmailVerificationToken(token: string) {
  const raw = token?.trim();
  if (!raw) throw new Error("INVALID_TOKEN");

  const db = getDb();
  const jti = hashToken(raw);
  const [ticket] = await db.select().from(oauthTickets).where(eq(oauthTickets.jti, jti)).limit(1);

  if (!ticket || ticket.kind !== VERIFY_KIND) throw new Error("INVALID_TOKEN");
  if (ticket.consumedAt) throw new Error("TOKEN_USED");
  if (ticket.expiresAt.getTime() < Date.now()) throw new Error("TOKEN_EXPIRED");

  const [user] = await db.select().from(users).where(eq(users.id, ticket.userId)).limit(1);
  if (!user) throw new Error("INVALID_TOKEN");
  if (user.email.toLowerCase() !== ticket.payload.toLowerCase()) throw new Error("INVALID_TOKEN");

  await db
    .update(users)
    .set({ emailVerified: true, updatedAt: new Date() })
    .where(eq(users.id, user.id));

  await db
    .update(oauthTickets)
    .set({ consumedAt: new Date() })
    .where(and(eq(oauthTickets.jti, jti), isNull(oauthTickets.consumedAt)));

  return { email: user.email };
}
