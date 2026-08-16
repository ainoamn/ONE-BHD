"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <main id="main-content" className="route-fallback" dir="rtl">
      <p>BHD · RECOVERY</p>
      <h1>تعذّر إكمال الطلب.</h1>
      <span>لم تُفقد بياناتك. حاول تحميل هذا الجزء مرة أخرى.</span>
      <button className="primary-button" type="button" onClick={reset}>إعادة المحاولة</button>
    </main>
  );
}
