import type { Metadata } from "next";
import { Suspense } from "react";
import { GoogleOAuthRoot } from "../components/auth/GoogleOAuthRoot";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "بوابة BHD | من هنا تبدأ الخطوة نحو أحلام أكبر" };

export default function LoginPage() {
  return (
    <GoogleOAuthRoot>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </GoogleOAuthRoot>
  );
}
