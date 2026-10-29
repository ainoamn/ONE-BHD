import { SESSION_MAX_AGE_SEC } from "../auth/config";
import { DEFAULT_IDENTITY_ISSUER } from "../identity/issuer";
import { BHD_APP_SWITCHER_SPEC, launchUrlForApp, publicUrlForApp, workspaceUrlForApp, type BhdApp } from "./apps";
import { listLiveApps } from "./catalog-store";

export const BHD_RUNTIME_SPEC = "bhd-identity-runtime.v1";

export const runtimeCorsHeaders = {
  "Cache-Control": "public, max-age=5, stale-while-revalidate=15",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Cross-Origin-Resource-Policy": "cross-origin",
} as const;

export async function bhdRuntimePayload() {
  const issuer = DEFAULT_IDENTITY_ISSUER;
  const apps = await listLiveApps();
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
      icons: `${issuer}/api/bhd/icons/{id}`,
      authorize: `${issuer}/oauth/authorize`,
      endSession: `${issuer}/oauth/end-session`,
      adminCatalog: `${issuer}/admin#apps`,
    },
    catalog: {
      spec: BHD_APP_SWITCHER_SPEC,
      source: "admin",
      apps: apps.map((app: BhdApp) => ({
        ...app,
        homeUrl: publicUrlForApp(app),
        workspaceUrl: workspaceUrlForApp(app),
      })),
      hops: apps.filter((app) => app.enabled).map((app) => launchUrlForApp(app)),
    },
  };
}
