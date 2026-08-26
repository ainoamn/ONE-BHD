"use client";

import { InstantLink } from "../InstantLink";
import { BhdAppSwitcher } from "../bhd/BhdAppSwitcher";
import type { UiLocale } from "../../lib/ui-locale";
import { readStoredUiLocale } from "../../lib/ui-locale";
import { useCallback, useEffect, useState } from "react";

type User = {
  email: string;
  name: string;
  picture: string | null;
};

type MeResponse = {
  user?: User | null;
  platformAdmin?: boolean;
};

type Props = {
  signInLabel: string;
  signOutLabel?: string;
  locale?: UiLocale;
};

export function SessionMenu({ signInLabel, locale }: Props) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [platformAdmin, setPlatformAdmin] = useState(false);
  const [resolvedLocale, setResolvedLocale] = useState<UiLocale>(locale || "ar");

  useEffect(() => {
    if (locale) {
      setResolvedLocale(locale);
      return;
    }
    setResolvedLocale(readStoredUiLocale() || "ar");
  }, [locale]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: MeResponse) => {
        if (!cancelled) {
          setUser(data.user ?? null);
          setPlatformAdmin(Boolean(data.platformAdmin));
        }
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    const post = `${window.location.origin}/`;
    const end = new URL("/oauth/end-session", window.location.origin);
    end.searchParams.set("client_id", "bhd-portal");
    end.searchParams.set("post_logout_redirect_uri", post);
    window.location.assign(end.toString());
  }, []);

  if (user === undefined) {
    return <span className="session-menu session-menu-loading" aria-hidden="true" />;
  }

  if (!user) {
    return (
      <InstantLink className="session-signin" href="/login">
        {signInLabel}
      </InstantLink>
    );
  }

  return (
    <BhdAppSwitcher
      user={user}
      platformAdmin={platformAdmin}
      onSignOut={signOut}
      locale={resolvedLocale}
    />
  );
}
