import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentSession } from "../lib/auth/session";
import { AccountConsole } from "./AccountConsole";

export const metadata: Metadata = {
  title: "حساب BHD",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/login?next=/account");
  }
  return <AccountConsole />;
}
