"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import type { ReactNode } from "react";
import { BHD_GOOGLE_WEB_CLIENT_ID } from "../../lib/auth/config";

export function GoogleOAuthRoot({ children }: { children: ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || BHD_GOOGLE_WEB_CLIENT_ID;
  if (!clientId) return children;
  return <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>;
}
