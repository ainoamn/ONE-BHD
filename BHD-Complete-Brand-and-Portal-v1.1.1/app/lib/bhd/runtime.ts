import { SESSION_MAX_AGE_SEC } from "../auth/config";
import { DEFAULT_IDENTITY_ISSUER } from "../identity/issuer";
import { BHD_APP_SWITCHER_SPEC, BHD_APPS, hopUrls, publicUrlForApp, workspaceUrlForApp } from "./apps";

export const BHD_RUNTIME_SPEC = "bhd-identity-runtime.v1";

export function bhdRuntimePayload() {
  const issuer = DEFAULT_IDENTITY_ISSUER;
  return {
    spec: BHD_RUNTIME_SPEC,
    live: true,
    issuer,
    script: `${issuer}/bhd-identity.js`,
    session: {
      maxAgeSec: SESSION_MAX_AGE_SEC,
      maxAgeDays: Math.round(SESSION_MAX_AGE_SEC / 86400),
      idleTimeout: false,
      cookieNames: ["bhd_id", "bhd_portal", "bhd_id_roster"],
      windowTokenKey: "bhd_window_token",
      windowSignedOutKey: "bhd_window_signed_out",
      headers: {
        authorization: "Authorization",
        bootstrap: "X-BHD-Window-Bootstrap",
        signedOut: "X-BHD-Window-Signed-Out",
      },
    },
    endpoints: {
      me: `${issuer}/api/auth/me`,
      switch: `${issuer}/api/auth/switch`,
      logout: `${issuer}/api/auth/logout`,
      catalog: `${issuer}/api/bhd/catalog`,
      runtime: `${issuer}/api/bhd/runtime`,
      authorize: `${issuer}/oauth/authorize`,
      endSession: `${issuer}/oauth/end-session`,
    },
    catalog: {
      spec: BHD_APP_SWITCHER_SPEC,
      apps: BHD_APPS.map((app) => ({
        ...app,
        homeUrl: publicUrlForApp(app),
        workspaceUrl: workspaceUrlForApp(app),
      })),
      hops: hopUrls(),
    },
  };
}

export const runtimeCorsHeaders = {
  "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Cross-Origin-Resource-Policy": "cross-origin",
} as const;
