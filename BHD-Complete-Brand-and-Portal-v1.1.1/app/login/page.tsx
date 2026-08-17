import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "دخول حساب BHD" };

export default function LoginPage() {
  return <LoginForm />;
}
