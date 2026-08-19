"use client";

import { useSearchParams } from "next/navigation";

type Props = {
  label: string;
};

export function FacebookSignInButton({ label }: Props) {
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const href =
    next && next.startsWith("/") && !next.startsWith("//")
      ? `/api/auth/facebook/start?next=${encodeURIComponent(next)}`
      : "/api/auth/facebook/start";

  return (
    <a className="login-provider-btn is-facebook" href={href} title={label} aria-label={label}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M14.5 8.5h2.3V5.6c-.4-.1-1.7-.2-3.2-.2-3.2 0-5.4 1.9-5.4 5.5V13H5.7v3.2h2.5V22h3.3v-5.8h2.8l.4-3.2h-3.2v-2.2c0-.9.3-1.5 1.6-1.5Z"
        />
      </svg>
    </a>
  );
}
