"use client";

import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import type { AnchorHTMLAttributes, FocusEvent, PointerEvent } from "react";

type InstantLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>;

function hrefToString(href: InstantLinkProps["href"]): string {
  if (typeof href === "string") return href;
  const path = href.pathname ?? "/";
  const search = href.query
    ? `?${new URLSearchParams(
        Object.entries(href.query).flatMap(([key, value]) => {
          if (value == null) return [];
          return Array.isArray(value) ? value.map((item) => [key, String(item)]) : [[key, String(value)]];
        }),
      ).toString()}`
    : "";
  const hash = href.hash ? `#${String(href.hash).replace(/^#/, "")}` : "";
  return `${path}${search}${hash}`;
}

export function needsDocumentNavigation(href: InstantLinkProps["href"]): boolean {
  const path = hrefToString(href).split(/[?#]/)[0] || "/";
  return path === "/oauth" || path.startsWith("/oauth/") || path.startsWith("/api/") || path.startsWith("/callback");
}

export function InstantLink({
  href,
  onPointerEnter,
  onFocus,
  prefetch,
  replace,
  scroll,
  locale,
  children,
  ...props
}: InstantLinkProps) {
  const router = useRouter();
  const resolved = hrefToString(href);
  const target = resolved.split("#")[0] || "/";
  const skipPrefetch = target === "/login" || target.startsWith("/login?") || target.startsWith("/api/auth");

  if (needsDocumentNavigation(href)) {
    return (
      <a href={resolved} onPointerEnter={onPointerEnter} onFocus={onFocus} {...props}>
        {children}
      </a>
    );
  }

  const warm = () => {
    if (skipPrefetch) return;
    router.prefetch(target);
  };

  return (
    <Link
      href={href}
      prefetch={skipPrefetch ? false : (prefetch ?? true)}
      replace={replace}
      scroll={scroll}
      locale={locale}
      onPointerEnter={(event: PointerEvent<HTMLAnchorElement>) => {
        warm();
        onPointerEnter?.(event);
      }}
      onFocus={(event: FocusEvent<HTMLAnchorElement>) => {
        warm();
        onFocus?.(event);
      }}
      {...props}
    >
      {children}
    </Link>
  );
}
