import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentSession } from "../lib/auth/session";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "بوابة BHD | من هنا تبدأ الخطوة نحو أحلام أكبر" };

function isOauthContinue(path: string) {
  const pathname = path.split(/[?#]/)[0] || "/";
  return pathname === "/oauth" || pathname.startsWith("/oauth/") || pathname.startsWith("/api/");
}

function safeNext(nextPath: string | undefined) {
  if (nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")) return nextPath;
  return "";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; add?: string }>;
}) {
  const params = await searchParams;
  const next = safeNext(params.next);
  const session = await getCurrentSession();
  if (session && params.add !== "1") {
    if (next && isOauthContinue(next)) redirect(next);
    redirect(next || "/account");
  }

  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
