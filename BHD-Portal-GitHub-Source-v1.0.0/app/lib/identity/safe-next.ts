export function isSafeNextPath(value: string | null | undefined): value is string {
  if (!value) return false;
  if (!value.startsWith("/")) return false;
  if (value.startsWith("//") || value.includes("\\")) return false;
  if (value.includes("://")) return false;
  return true;
}

export function authorizeReturnPath(searchParams: URLSearchParams): string {
  return `/oauth/authorize?${searchParams.toString()}`;
}

export function loginRedirectForAuthorize(origin: string, searchParams: URLSearchParams): string {
  const next = authorizeReturnPath(searchParams);
  return `${origin}/login?next=${encodeURIComponent(next)}`;
}
