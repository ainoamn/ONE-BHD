export function getDb(): never {
  throw new Error(
    "Database binding `DB` is unavailable. This portal deployment does not use an operational database.",
  );
}
