import { InstantLink } from "./components/InstantLink";

export default function NotFound() {
  return (
    <main id="main-content" className="route-fallback" dir="rtl">
      <p>BHD · 404</p>
      <h1>هذه الصفحة غير موجودة.</h1>
      <span>قد يكون الرابط قد تغيّر أو لم يعد متاحًا.</span>
      <InstantLink className="primary-button" href="/">العودة إلى الرئيسية</InstantLink>
    </main>
  );
}
