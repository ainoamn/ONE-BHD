export type IdentityClient = {
  clientId: string;
  name: string;
  secretEnv: string;
  redirectUris: string[];
  postLogoutRedirectUris: string[];
};

export const IDENTITY_CLIENTS: IdentityClient[] = [
  {
    clientId: "bhd-portal",
    name: "BHD Portal",
    secretEnv: "BHD_OAUTH_CLIENT_SECRET_PORTAL",
    redirectUris: [
      "https://www.bhd-om.com/api/auth/bhd/callback",
      "https://bhd-om.com/api/auth/bhd/callback",
      "http://localhost:3000/api/auth/bhd/callback",
    ],
    postLogoutRedirectUris: ["https://www.bhd-om.com/", "https://bhd-om.com/", "http://localhost:3000/"],
  },
  {
    clientId: "bhd-wazen",
    name: "WAZEN",
    secretEnv: "BHD_OAUTH_CLIENT_SECRET_WAZEN",
    redirectUris: [
      "https://wazen.bhd-om.com/api/auth/bhd/callback",
      "http://localhost:3000/api/auth/bhd/callback",
      "http://localhost:3001/api/auth/bhd/callback",
    ],
    postLogoutRedirectUris: ["https://wazen.bhd-om.com/", "http://localhost:3000/", "http://localhost:3001/"],
  },
  {
    clientId: "bhd-hisaby",
    name: "HISAB",
    secretEnv: "BHD_OAUTH_CLIENT_SECRET_HISABY",
    redirectUris: [
      "https://hisaby.bhd-om.com/api/auth/bhd/callback",
      "https://www.hisaby.pro/api/auth/bhd/callback",
      "https://hisaby.pro/api/auth/bhd/callback",
      "http://localhost:3000/api/auth/bhd/callback",
    ],
    postLogoutRedirectUris: [
      "https://hisaby.bhd-om.com/",
      "https://www.hisaby.pro/",
      "https://hisaby.pro/",
      "http://localhost:3000/",
    ],
  },
  {
    clientId: "bhd-nasab",
    name: "NASAB",
    secretEnv: "BHD_OAUTH_CLIENT_SECRET_NASAB",
    redirectUris: [
      "https://nasab.bhd-om.com/api/auth/bhd/callback",
      "https://nasab-mu.vercel.app/api/auth/bhd/callback",
      "http://localhost:5173/api/auth/bhd/callback",
      "http://localhost:3000/api/auth/bhd/callback",
    ],
    postLogoutRedirectUris: [
      "https://nasab.bhd-om.com/",
      "https://nasab-mu.vercel.app/",
      "http://localhost:5173/",
      "http://localhost:3000/",
    ],
  },
  {
    clientId: "bhd-store",
    name: "BHD Store",
    secretEnv: "BHD_OAUTH_CLIENT_SECRET_STORE",
    redirectUris: [
      "https://bhdstor.bhd-om.com/api/auth/bhd/callback",
      "https://store.bhd-om.com/api/auth/bhd/callback",
      "https://bhd-stor-x7dc.vercel.app/api/auth/bhd/callback",
      "http://localhost:3000/api/auth/bhd/callback",
      "http://127.0.0.1:3000/api/auth/bhd/callback",
    ],
    postLogoutRedirectUris: [
      "https://bhdstor.bhd-om.com/",
      "https://store.bhd-om.com/",
      "https://bhd-stor-x7dc.vercel.app/",
      "http://localhost:3000/",
      "http://127.0.0.1:3000/",
    ],
  },
  {
    clientId: "bhd-office",
    name: "BHD Office",
    secretEnv: "BHD_OAUTH_CLIENT_SECRET_OFFICE",
    redirectUris: ["http://localhost:3000/api/auth/bhd/callback"],
    postLogoutRedirectUris: ["http://localhost:3000/"],
  },
  {
    clientId: "bhd-baitak",
    name: "BAITAK",
    secretEnv: "BHD_OAUTH_CLIENT_SECRET_BAITAK",
    redirectUris: [
      "https://baitak.bhd-om.com/api/auth/bhd/callback",
      "http://localhost:3000/api/auth/bhd/callback",
    ],
    postLogoutRedirectUris: ["https://baitak.bhd-om.com/", "http://localhost:3000/"],
  },
];

export function getIdentityClient(clientId: string): IdentityClient | undefined {
  const resolved = clientId === "bhd-ain-oman" ? "bhd-baitak" : clientId;
  return IDENTITY_CLIENTS.find((client) => client.clientId === resolved);
}

export function isAllowedRedirect(client: IdentityClient, redirectUri: string, requestOrigin?: string): boolean {
  if (client.redirectUris.includes(redirectUri)) return true;
  if (client.clientId === "bhd-portal" && requestOrigin && redirectUri === `${requestOrigin}/api/auth/bhd/callback`) {
    return true;
  }
  return false;
}

export function isAllowedLogoutRedirect(client: IdentityClient, uri: string): boolean {
  return client.postLogoutRedirectUris.includes(uri);
}
