import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isFacebookAuthConfigured, authSecret } from "../../../../lib/auth/config";
import {
  exchangeFacebookCode,
  facebookCallbackOrigin,
  facebookOAuthCookieName,
  facebookOAuthCookieOptions,
  readFacebookOAuthState,
} from "../../../../lib/auth/facebook";
import { allowRequest, clientKey } from "../../../../lib/auth/rate-limit";
import { applySessionCookies, createSessionToken } from "../../../../lib/auth/session";
import { loginOrRegisterWithFacebook } from "../../../../lib/auth/users";
import { isSafeNextPath } from "../../../../lib/identity/safe-next";

export const runtime = "nodejs";

function clearFacebookCookie(response: NextResponse) {
  response.cookies.set(facebookOAuthCookieName, "", { ...facebookOAuthCookieOptions(), maxAge: 0 });
}

export async function GET(request: Request) {
  const origin = facebookCallbackOrigin(request);
  const fail = (code: string) => {
    const response = NextResponse.redirect(new URL(`/login?fb=${code}`, origin));
    clearFacebookCookie(response);
    return response;
  };

  if (!isFacebookAuthConfigured() || !authSecret()) return fail("setup");
  if (!allowRequest(`facebook:${clientKey(request)}`)) return fail("rate");

  const url = new URL(request.url);
  if (url.searchParams.get("error")) return fail("denied");

  const code = url.searchParams.get("code")?.trim() || "";
  const state = url.searchParams.get("state")?.trim() || "";
  if (!code || !state) return fail("failed");

  const jar = await cookies();
  const oauth = await readFacebookOAuthState(jar.get(facebookOAuthCookieName)?.value);
  if (!oauth || oauth.state !== state) return fail("failed");

  try {
    const facebook = await exchangeFacebookCode(code, oauth.redirectUri);
    const user = await loginOrRegisterWithFacebook(facebook);
    const token = await createSessionToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    });
    const next = isSafeNextPath(oauth.next) ? oauth.next : "/";
    const response = NextResponse.redirect(new URL(next, origin));
    applySessionCookies(response.cookies, token);
    clearFacebookCookie(response);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "ACCOUNT_LOCKED" || message === "ACCOUNT_DISABLED") return fail("locked");
    if (message === "FACEBOOK_EMAIL_REQUIRED") return fail("email");
    return fail("failed");
  }
}
