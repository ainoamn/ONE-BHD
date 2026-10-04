"use client";

import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import type { AnchorHTMLAttributes, FocusEvent, PointerEvent } from "react";

type InstantLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>;

export function InstantLink({
  href,
  onPointerEnter,
  onFocus,
  ...props
}: InstantLinkProps) {
  const router = useRouter();
  const target = typeof href === "string" ? href.split("#")[0] || "/" : href.pathname ?? "/";
  const skipPrefetch = target === "/login" || target.startsWith("/login?") || target.startsWith("/api/auth");

  const warm = () => {
    if (skipPrefetch) return;
    router.prefetch(target);
  };

  return (
    <Link
      href={href}
      prefetch={skipPrefetch ? false : true}
      onPointerEnter={(event: PointerEvent<HTMLAnchorElement>) => {
        warm();
        onPointerEnter?.(event);
      }}
      onFocus={(event: FocusEvent<HTMLAnchorElement>) => {
        warm();
        onFocus?.(event);
      }}
      {...props}
    />
  );
}
