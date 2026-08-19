import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentSession } from "../lib/auth/session";
import { isPlatformAdminEmail } from "../lib/auth/platform-admin";
import { AdminConsole } from "./AdminConsole";
import { InstantLink } from "../components/InstantLink";
import { BrandLogo } from "../components/BrandLogo";

export const metadata: Metadata = {
  title: "لوحة تحكم هوية BHD",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/api/auth/admin-entry");
  }
  if (!isPlatformAdminEmail(session.email)) {
    return (
      <div className="admin-screen">
        <main className="admin-forbidden" id="main-content">
          <BrandLogo kind="full" tone="ink" className="admin-logo-ink" />
          <p>لوحة التحكم</p>
          <h1>ليست لديك صلاحية الإدارة.</h1>
          <p>هذا المسار لحسابات منصة BHD فقط. أدوار المنتجات تبقى داخل كل موقع.</p>
          <InstantLink href="/">العودة إلى البوابة</InstantLink>
          <a href="/api/auth/admin-entry">دخول الإدارة</a>
        </main>
      </div>
    );
  }

  return <AdminConsole operatorName={session.name} operatorEmail={session.email} />;
}
