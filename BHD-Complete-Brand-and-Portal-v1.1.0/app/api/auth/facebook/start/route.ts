import { NextResponse } from "next/server";
import { isFacebookAuthConfigured, authSecret } from "../../../../lib/auth/config";
import {
  createFacebookOAuthState,
  facebookCallbackOrigin,
  facebookCallbackUrl,
  facebookLoginUrl,
  facebookOAuthCookieName,
  facebookOAuthCookieOptions,
} from "../../../../lib/auth/facebook";
import { allowRequest, clientKey } from "../../../../lib/auth/rate-limit";
import { isSafeNextPath } from "../../../../lib/identity/safe-next";
import { getCurrentSession } from "../../../../lib/auth/session";
import { isDatabaseConfigured } from "../../../../../db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const origin = facebookCallbackOrigin(request);
  const fail = (code: string) => NextResponse.redirect(new URL(`/login?fb=${code}`, origin));
  const session = await getCurrentSession();
  if (session) {
    const nextValue = new URL(request.url).searchParams.get("next");
    const next = isSafeNextPath(nextValue) ? nextValue : "/account";
    return NextResponse.redirect(new URL(next, origin));
  }

  if (!isFacebookAuthConfigured() || !authSecret()) return fail("setup");
  if (!isDatabaseConfigured()) return fail("database");
  if (!allowRequest(`facebook:${clientKey(request)}`)) return fail("rate");

  const nextValue = new URL(request.url).searchParams.get("next");
  const next = isSafeNextPath(nextValue) ? nextValue : "/";
  const redirectUri = facebookCallbackUrl(origin);
  const { state, cookie } = await createFacebookOAuthState({ next, redirectUri });

  const response = NextResponse.redirect(facebookLoginUrl({ state, redirectUri }));
  response.cookies.set(facebookOAuthCookieName, cookie, facebookOAuthCookieOptions());
  return response;
}
