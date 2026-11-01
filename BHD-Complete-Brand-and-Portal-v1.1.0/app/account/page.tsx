import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentSession } from "../lib/auth/session";
import { AccountAuGate } from "./AccountAuGate";
import { AccountConsole } from "./AccountConsole";

export const metadata: Metadata = {
  title: "حساب BHD",
  robots: { index: false, follow: false },
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getCurrentSession();
  if (!session) {
    const query = searchParams ? await searchParams : {};
    const au = typeof query.au === "string" ? query.au.trim() : "";
    const next = au ? `/account?au=${encodeURIComponent(au)}` : "/account";
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }
  return (
    <AccountAuGate>
      <AccountConsole />
    </AccountAuGate>
  );
}
