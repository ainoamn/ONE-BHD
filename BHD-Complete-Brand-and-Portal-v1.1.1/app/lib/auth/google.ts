import { OAuth2Client } from "google-auth-library";
import { googleClientId } from "./config";
import type { PortalSession } from "./session";

let client: OAuth2Client | null = null;

function getClient() {
  const clientId = googleClientId();
  if (!clientId) {
    throw new Error("Google sign-in is not configured");
  }
  if (!client) {
    client = new OAuth2Client(clientId);
  }
  return { client, clientId };
}

export async function verifyGoogleIdToken(idToken: string): Promise<PortalSession> {
  const { client: oauth, clientId } = getClient();
  const ticket = await oauth.verifyIdToken({ idToken, audience: clientId });
  const payload = ticket.getPayload();

  if (!payload?.email || !payload.sub || payload.email_verified === false) {
    throw new Error("Google account email is not verified");
  }

  return {
    sub: payload.sub,
    email: payload.email.trim().toLowerCase(),
    name: (payload.name || payload.email.split("@")[0]).trim(),
    picture: payload.picture || null,
  };
}
