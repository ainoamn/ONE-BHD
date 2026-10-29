import { and, eq } from "drizzle-orm";
import { getDb, ensureIdentitySchema } from "../../../db";
import { userFiles } from "../../../db/schema";

export const ACCOUNT_FILE_KINDS = ["civil_id", "passport"] as const;
export type AccountFileKind = (typeof ACCOUNT_FILE_KINDS)[number];

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const MAX_BYTES = 4 * 1024 * 1024;

export function isAccountFileKind(value: string): value is AccountFileKind {
  return ACCOUNT_FILE_KINDS.includes(value as AccountFileKind);
}

export async function listAccountFileMeta(userId: string) {
  await ensureIdentitySchema();
  const db = getDb();
  const rows = await db
    .select({
      id: userFiles.id,
      kind: userFiles.kind,
      filename: userFiles.filename,
      mime: userFiles.mime,
    })
    .from(userFiles)
    .where(eq(userFiles.userId, userId));
  return {
    civilIdFile: rows.find((row) => row.kind === "civil_id") || null,
    passportFile: rows.find((row) => row.kind === "passport") || null,
  };
}

export async function saveAccountFile(
  userId: string,
  kind: AccountFileKind,
  file: { filename: string; mime: string; bytes: Buffer },
) {
  if (!ALLOWED_MIME.has(file.mime)) throw new Error("INVALID_FILE_TYPE");
  if (!file.bytes.length || file.bytes.length > MAX_BYTES) throw new Error("FILE_TOO_LARGE");
  await ensureIdentitySchema();
  const db = getDb();
  await db.delete(userFiles).where(and(eq(userFiles.userId, userId), eq(userFiles.kind, kind)));
  const [saved] = await db
    .insert(userFiles)
    .values({
      userId,
      kind,
      filename: file.filename.slice(0, 180) || `${kind}.bin`,
      mime: file.mime,
      content: file.bytes.toString("base64"),
    })
    .returning({ id: userFiles.id, filename: userFiles.filename, kind: userFiles.kind });
  return saved;
}

export async function readAccountFile(userId: string, kind: AccountFileKind) {
  await ensureIdentitySchema();
  const db = getDb();
  const rows = await db
    .select()
    .from(userFiles)
    .where(and(eq(userFiles.userId, userId), eq(userFiles.kind, kind)))
    .limit(1);
  return rows[0] || null;
}
