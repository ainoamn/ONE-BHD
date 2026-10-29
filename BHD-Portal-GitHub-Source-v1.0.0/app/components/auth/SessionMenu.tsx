"use client";

import { InstantLink } from "../InstantLink";
import { BhdAppSwitcher } from "../bhd/BhdAppSwitcher";
import type { UiLocale } from "../../lib/ui-locale";
import { readStoredUiLocale } from "../../lib/ui-locale";
import {
  addAccountUrl,
  applyAccountIsolation,
  identityFetch,
  paintPrivacyVeil,
  switchWindowAccount,
} from "../../lib/identity/client";
import { captureAccountToken, captureWindowToken, setActiveAu, signOutThisWindow } from "../../lib/identity/window-session";
import { useCallback, useEffect, useState } from "react";

export const BHD_ACCOUNT_CHANGED = "bhd-account-changed";

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
  ok?: boolean;
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
    identityFetch("/api/auth/me")
      .then((response) => response.json())
      .then((data: MeResponse & { token?: string }) => {
        if (cancelled) return;
        captureWindowToken(data.token);
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
    const response = await identityFetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all }),
    });
    const data = (await response.json().catch(() => ({}))) as MeResponse & { token?: string };
    if (all) {
      signOutThisWindow();
      const post = `${window.location.origin}/`;
      const end = new URL("/oauth/end-session", "https://id.bhd-om.com");
      if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        end.host = window.location.host;
        end.protocol = window.location.protocol;
      }
      end.searchParams.set("client_id", "bhd-portal");
      end.searchParams.set("post_logout_redirect_uri", post);
      end.searchParams.set("all", "1");
      window.location.assign(end.toString());
      return;
    }
    if (!data.user) {
      signOutThisWindow();
      window.location.assign("/login");
      return;
    }
    if (data.token && data.user?.id) captureAccountToken(data.user.id, data.token);
    else captureWindowToken(data.token);
    window.dispatchEvent(new Event(BHD_ACCOUNT_CHANGED));
    await applyAccountIsolation({ sub: data.user?.id });
  }, []);

  const switchAccount = useCallback(async (sub: string) => {
    paintPrivacyVeil();
    setUser({ id: "", email: "", name: "", picture: null });
    setAccounts([]);
    const switched = await switchWindowAccount(sub);
    if (!switched.ok) {
      const me = (await identityFetch("/api/auth/me")
        .then((r) => r.json())
        .catch(() => ({}))) as MeResponse & { token?: string };
      if (me.token && me.user?.id) captureAccountToken(me.user.id, me.token);
      else captureWindowToken(me.token);
      setUser(me.user ?? null);
      setAccounts(me.accounts || (me.user ? [me.user] : []));
      return;
    }
    if (switched.userId) setActiveAu(switched.userId);
    window.dispatchEvent(new Event(BHD_ACCOUNT_CHANGED));
    await applyAccountIsolation({ sub: switched.userId || sub });
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
      onAddAccount={() => window.location.assign(addAccountUrl())}
      locale={resolvedLocale}
    />
  );
}
