"use client";

import { InstantLink } from "../components/InstantLink";
import { useEffect, useState } from "react";

type Runtime = {
  spec: string;
  live: boolean;
  issuer: string;
  script: string;
  session: {
    maxAgeSec: number;
    maxAgeDays: number;
    idleTimeout: boolean;
    cookieNames: string[];
    windowTokenKey: string;
    windowSignedOutKey: string;
  };
  endpoints: Record<string, string>;
};

const SCRIPT_SNIPPET = `<script src="https://id.bhd-om.com/bhd-identity.js" defer></script>`;

const USAGE_SNIPPET = `const runtime = await BhdIdentity.runtime();
cookie.maxAge = runtime.session.maxAgeSec;
const { body } = await BhdIdentity.me();
if (!body.user) {
  window.location.assign(BhdIdentity.productStart("/dashboard"));
}`;

const CSP_SNIPPET = `script-src 'self' https://id.bhd-om.com;
connect-src 'self' https://id.bhd-om.com;
img-src 'self' https://id.bhd-om.com data:;`;

export function AdminConnectPanel() {
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/bhd/runtime", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: Runtime) => {
        if (!cancelled) setRuntime(data);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  function copy(label: string, value: string) {
    void navigator.clipboard.writeText(value).then(() => {
      setCopied(label);
      window.setTimeout(() => setCopied(""), 2000);
    });
  }

  const issuer = runtime?.issuer || "https://id.bhd-om.com";
  const days = runtime?.session.maxAgeDays ?? 40;

  return (
    <div className="admin-connect">
      <section className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <p>Live identity runtime</p>
            <h2>ربط المواقع بالموقع الأم</h2>
          </div>
          <span className={runtime?.live ? "admin-pill is-ok" : "admin-pill"}>
            {runtime?.live ? "API حي" : "جارٍ التحميل…"}
          </span>
        </div>
        <p className="admin-footnote">
          البرمجة هنا على الهوية. المنتج لا يعيد كتابة مدة الدخول ولا عزل النوافذ ولا قائمة التطبيقات. يقرأها من API
          ويتعرّف على الحساب بعد دخول <code>id.bhd-om.com</code>.
        </p>
        <dl className="admin-connect-stats">
          <div>
            <dt>المصدر</dt>
            <dd>
              <code>{issuer}</code>
            </dd>
          </div>
          <div>
            <dt>المواصفة</dt>
            <dd>
              <code>{runtime?.spec || "bhd-identity-runtime.v1"}</code>
            </dd>
          </div>
          <div>
            <dt>مدة الجلسة</dt>
            <dd>
              {days} يوماً ثم دخول جديد — بلا خمول
            </dd>
          </div>
          <div>
            <dt>رمز النافذة</dt>
            <dd>
              <code>{runtime?.session.windowTokenKey || "bhd_window_token"}</code>
            </dd>
          </div>
        </dl>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <p>Endpoints</p>
            <h2>العناوين التي يربط عليها المنتج</h2>
          </div>
        </div>
        <ul className="admin-connect-endpoints">
          <li>
            <strong>تشغيل حي</strong>
            <code>{issuer}/api/bhd/runtime</code>
            <span>مدة الجلسة، ترويسات النافذة، الكتالوج مع homeUrl و workspaceUrl</span>
          </li>
          <li>
            <strong>شاشة الأيقونات</strong>
            <code>{issuer}/admin#apps</code>
            <span>الشعار والمسمّى والرابط — نفس المصدر لرأس المستخدم والفوتر والرئيسية</span>
          </li>
          <li>
            <strong>الكتالوج</strong>
            <code>{issuer}/api/bhd/catalog</code>
            <span>قائمة المواقع دون نسخ apps.ts</span>
          </li>
          <li>
            <strong>سكربت المتصفح</strong>
            <code>{issuer}/bhd-identity.js</code>
            <span>me / تبديل الحساب / خروج لكل نافذة</span>
          </li>
          <li>
            <strong>الجلسة</strong>
            <code>/api/auth/me · switch · logout</code>
            <span>كوكي Host-only + Bearer لعزل النوافذ</span>
          </li>
          <li>
            <strong>تعرّف المنتج</strong>
            <code>/oauth/authorize</code>
            <span>بعد دخول الهوية يصدر كود OIDC دون كلمة مرور ثانية</span>
          </li>
        </ul>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <p>Product steps</p>
            <h2>خطوات الربط داخل الموقع الآخر</h2>
          </div>
        </div>
        <ol className="admin-connect-steps">
          <li>
            حمّل السكربت من الهوية في الرأس. اسمح في CSP: <code>script-src</code> و<code>connect-src</code> نحو{" "}
            <code>https://id.bhd-om.com</code>.
          </li>
          <li>
            اقرأ <code>runtime.session.maxAgeSec</code> عند ضبط كوكي جلسة المنتج. ممنوع رقم ثابت محلي (400 يوماً أو غيره).
          </li>
          <li>
            أبقِ على الخادم فقط: <code>GET /api/auth/bhd/start</code> و<code>callback</code> و<code>logout</code> مع{" "}
            <code>BHD_CLIENT_ID</code> و<code>BHD_CLIENT_SECRET</code>. السر لا يُعرض في المتصفح.
          </li>
          <li>
            سجّل العميل في تبويب <button type="button" className="admin-inline-link" onClick={() => {
              window.location.hash = "clients";
            }}>العملاء والربط</button>{" "}
            ثم اختبر المسار وفعّل <code>sso</code>.
          </li>
          <li>
            الرأس يستدعي <code>BhdIdentity.me()</code>. إن لم يوجد مستخدم يوجّه إلى{" "}
            <code>BhdIdentity.productStart("/dashboard")</code>. الهوية ترى كوكي <code>bhd_id</code> وتُكمل الدخول
            صامتاً إن كانت الجلسة قائمة.
          </li>
        </ol>
        <div className="admin-connect-copy-row">
          <pre className="admin-connect-code">{SCRIPT_SNIPPET}</pre>
          <button type="button" className="admin-action admin-action-secondary" onClick={() => copy("script", SCRIPT_SNIPPET)}>
            {copied === "script" ? "تم النسخ" : "نسخ السكربت"}
          </button>
        </div>
        <div className="admin-connect-copy-row">
          <pre className="admin-connect-code">{USAGE_SNIPPET}</pre>
          <button type="button" className="admin-action admin-action-secondary" onClick={() => copy("usage", USAGE_SNIPPET)}>
            {copied === "usage" ? "تم النسخ" : "نسخ الاستخدام"}
          </button>
        </div>
        <div className="admin-connect-copy-row">
          <pre className="admin-connect-code">{CSP_SNIPPET}</pre>
          <button type="button" className="admin-action admin-action-secondary" onClick={() => copy("csp", CSP_SNIPPET)}>
            {copied === "csp" ? "تم النسخ" : "نسخ CSP"}
          </button>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <p>Recognition</p>
            <h2>كيف يتعرّف الموقع الآخر على الدخول والنافذة</h2>
          </div>
        </div>
        <ul className="admin-connect-endpoints">
          <li>
            <strong>الدخول</strong>
            <span>
              المستخدم يدخل على الهوية. المنتج إن لم تكن له جلسة يفتح start. الهوية تصدر الكود. callback يربط{" "}
              <code>bhd_sub</code> ويضبط كوكي المنتج بنفس مدة الـ runtime.
            </span>
          </li>
          <li>
            <strong>النوافذ</strong>
            <span>
              كل نافذة تحمل JWT في sessionStorage. التبديل يرسل Bearer ولا يكتب كوكي الهوية، فلا تسرق نافذة حساب الأخرى.
            </span>
          </li>
          <li>
            <strong>الانعكاس</strong>
            <span>
              تغيير 40 يوماً أو الكتالوج على ONE-BHD يظهر للمنتجات عند الطلب التالي للـ API (حوالي دقيقة كاش). المنتج
              الذي ما زال ينسخ الكود محلياً لن يتبع الهوية.
            </span>
          </li>
        </ul>
        <p className="admin-footnote">
          الدليل الكامل:{" "}
          <a href="/docs/BHD-IDENTITY-RUNTIME.md" download="BHD-IDENTITY-RUNTIME.md">
            BHD-IDENTITY-RUNTIME.md
          </a>
          {" · "}
          <InstantLink href="/docs/unified-login#runtime">/docs/unified-login</InstantLink>
          {" · "}
          <InstantLink href="/docs/BHD-COPY-TO-PRODUCTS.md">وثيقة النسخ للمنتجات</InstantLink>
        </p>
      </section>
    </div>
  );
}
