import type { Metadata } from "next";
import { RecoverForm } from "./RecoverForm";

export const metadata: Metadata = {
  title: "استعادة حساب BHD",
  robots: { index: false, follow: false },
};

export default function RecoverPage() {
  return <RecoverForm />;
}
