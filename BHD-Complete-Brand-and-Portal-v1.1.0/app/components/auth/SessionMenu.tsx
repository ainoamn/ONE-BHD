"use client";

import { InstantLink } from "../InstantLink";
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
  signOutLabel: string;
};

export function SessionMenu({ signInLabel, signOutLabel }: Props) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [platformAdmin, setPlatformAdmin] = useState(false);

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
    setUser(null);
    window.location.reload();
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
    <div className="session-menu">
      {user.picture ? (
        <img src={user.picture} alt="" width={28} height={28} />
      ) : (
        <span className="session-initial">{user.name.slice(0, 1)}</span>
      )}
      <span className="session-name">{user.name}</span>
      {platformAdmin ? (
        <InstantLink className="session-signin" href="/admin">
          الإدارة
        </InstantLink>
      ) : null}
      <button type="button" className="session-signout" onClick={() => void signOut()}>
        {signOutLabel}
      </button>
    </div>
  );
}
