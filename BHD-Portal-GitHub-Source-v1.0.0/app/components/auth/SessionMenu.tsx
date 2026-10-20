"use client";

import { InstantLink } from "../InstantLink";
import { BhdAppSwitcher } from "../bhd/BhdAppSwitcher";
import type { UiLocale } from "../../lib/ui-locale";
import { readStoredUiLocale } from "../../lib/ui-locale";
import { useCallback, useEffect, useState } from "react";

type User = {
  id?: string;
  email: string;
  name: string;
  username?: string | null;
  phone?: string | null;
  picture: string | null;
  providers?: Array<"password" | "google" | "facebook" | "whatsapp">;
  googleLinked?: boolean;
  facebookLinked?: boolean;
  hasPassword?: boolean;
};

type MeResponse = {
  user?: User | null;
  accounts?: User[];
  platformAdmin?: boolean;
};

type Props = {
  signInLabel: string;
  signOutLabel?: string;
  locale?: UiLocale;
};

export function SessionMenu({ signInLabel, locale }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<User[]>([]);
  const [platformAdmin, setPlatformAdmin] = useState(false);
  const [resolvedLocale, setResolvedLocale] = useState<UiLocale>(locale || "ar");
  const [ready, setReady] = useState(false);

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
        if (cancelled) return;
        setUser(data.user ?? null);
        setAccounts(data.accounts || (data.user ? [data.user] : []));
        setPlatformAdmin(Boolean(data.platformAdmin));
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const signOut = useCallback(async (all = false) => {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all }),
    });
    if (all) {
      const post = `${window.location.origin}/`;
      const end = new URL("/oauth/end-session", window.location.origin);
      end.searchParams.set("client_id", "bhd-portal");
      end.searchParams.set("post_logout_redirect_uri", post);
      end.searchParams.set("all", "1");
      window.location.assign(end.toString());
      return;
    }
    window.location.replace(window.location.pathname);
  }, []);

  const switchAccount = useCallback(async (sub: string) => {
    const response = await fetch("/api/auth/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sub }),
    });
    if (!response.ok) return;
    window.location.replace(window.location.pathname);
  }, []);

  if (!ready) {
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
      accounts={accounts}
      platformAdmin={platformAdmin}
      onSignOut={() => signOut(false)}
      onSignOutAll={() => signOut(true)}
      onSwitchAccount={(sub) => void switchAccount(sub)}
      onAddAccount={() => {
        window.location.assign("/login?add=1");
      }}
      locale={resolvedLocale}
    />
  );
}
