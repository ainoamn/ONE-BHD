"use client";

import { useSearchParams } from "next/navigation";

export function FacebookSignInButton() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const href =
    next && next.startsWith("/") && !next.startsWith("//")
      ? `/api/auth/facebook/start?next=${encodeURIComponent(next)}`
      : "/api/auth/facebook/start";

  return (
    <a className="facebook-signin" href={href}>
      المتابعة عبر فيسبوك
    </a>
  );
}
