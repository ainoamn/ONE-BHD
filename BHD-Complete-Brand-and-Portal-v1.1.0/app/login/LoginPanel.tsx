"use client";

import { GoogleSignInButton } from "../components/auth/GoogleSignInButton";
import { useRouter } from "next/navigation";

export function LoginPanel() {
  const router = useRouter();
  return (
    <GoogleSignInButton
      onSuccess={() => {
        router.push("/");
        router.refresh();
      }}
    />
  );
}
