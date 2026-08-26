"use client";

import { BrandLogo } from "../components/BrandLogo";
import { InstantLink } from "../components/InstantLink";
import { SessionMenu } from "../components/auth/SessionMenu";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type Overview = {
  spec: string;
  issuer: string;
  databaseOk: boolean;
  users: number;
  activeUsers: number;
  googleUsers: number;
  facebookUsers: number;
  contacts: number;
  unverifiedUsers?: number;
  resendConfigured?: boolean;
  googleConfigured: boolean;
  facebookConfigured: boolean;
  authSecretConfigured: boolean;
  admin: { name: string; email: string };
  clients: Array<{ clientId: string; name: string; productionRedirects: string[] }>;
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  username: string | null;
  phone: string | null;
  gender: string | null;
  birthDate: string | null;
  picture: string | null;
  googleLinked: boolean;
  facebookLinked: boolean;
  hasPassword: boolean;
  emailVerified: boolean;
  isActive: boolean;
  lockedUntil: string | null;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  signupIp: string | null;
  createdAt: string;
  updatedAt: string;
  linkedApps: number;
};

type AdminUserDetail = AdminUser & {
  contact: {
    phone2: string | null;
    whatsapp: string | null;
    address: string | null;
    city: string | null;
    hometown: string | null;
    country: string | null;
    zipCode: string | null;
  } | null;
  apps: Array<{
    clientId: string;
    name: string;
    origin: string | null;
    firstSeenAt: string;
    lastSeenAt: string;
    ticketCount: number;
  }>;
};

type TabId = "users" | "system" | "clients" | "emails";

type RegistryClient = {
  clientId: string;
  name: string;
  source: string;
  origin: string | null;
  workspacePath: string | null;
  mode: string;
  redirectUris: string[];
  enabled: boolean;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("ar-OM", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function loginMethods(user: AdminUser) {
  return [
    user.googleLinked ? "Google" : "",
    user.facebookLinked ? "فيسبوك" : "",
    user.hasPassword ? "كلمة مرور" : "",
  ]
    .filter(Boolean)
    .join(" · ") || "—";
}

export function AdminConsole({
  operatorName,
  operatorEmail,
}: {
  operatorName: string;
  operatorEmail: string;
}) {
  const [tab, setTab] = useState<TabId>("users");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [registry, setRegistry] = useState<RegistryClient[]>([]);
  const [regForm, setRegForm] = useState({
    clientId: "bhd-",
    name: "",
    origin: "https://",
    workspacePath: "/dashboard",
    redirectUri: "",
    mode: "browse" as "browse" | "sso",
  });
  const [issuedSecret, setIssuedSecret] = useState("");
  const [mailKind, setMailKind] = useState<"password_reset" | "email_verify">("password_reset");
  const [mailForm, setMailForm] = useState({
    subject: "",
    headline: "",
    body: "",
    cta: "",
    footnote: "",
  });
  const [mailPreview, setMailPreview] = useState("");

  const loadEmails = useCallback(async (kind: "password_reset" | "email_verify" = mailKind) => {
    const response = await fetch(`/api/admin/emails?preview=${kind}`, { cache: "no-store" });
    const data = (await response.json()) as {
      templates?: Array<{
        kind: string;
        subject: string;
        headline: string;
        body: string;
        cta: string;
        footnote: string;
      }>;
      previewHtml?: string;
      message?: string;
    };
    if (!response.ok) throw new Error(data.message || "تعذّر تحميل قوالب البريد.");
    const current = data.templates?.find((row) => row.kind === kind);
    if (current) {
      setMailForm({
        subject: current.subject,
        headline: current.headline,
        body: current.body,
        cta: current.cta,
        footnote: current.footnote,
      });
    }
    setMailPreview(data.previewHtml || "");
  }, [mailKind]);

  const loadRegistry = useCallback(async () => {
    const response = await fetch("/api/admin/clients", { cache: "no-store" });
    const data = (await response.json()) as { clients?: RegistryClient[]; message?: string };
    if (!response.ok) throw new Error(data.message || "تعذّر تحميل سجل العملاء.");
    setRegistry(data.clients || []);
  }, []);

  const load = useCallback(async (search = "") => {
    setError("");
    const [overviewRes, usersRes] = await Promise.all([
      fetch("/api/admin/overview", { cache: "no-store" }),
      fetch(`/api/admin/users?q=${encodeURIComponent(search)}`, { cache: "no-store" }),
    ]);
    const overviewData = (await overviewRes.json()) as Overview & { message?: string };
    const usersData = (await usersRes.json()) as { users?: AdminUser[]; message?: string };
    if (!overviewRes.ok) throw new Error(overviewData.message || "تعذّر تحميل النظرة العامة.");
    if (!usersRes.ok) throw new Error(usersData.message || "تعذّر تحميل الحسابات.");
    setOverview(overviewData);
    setUsers(usersData.users || []);
    await loadRegistry().catch(() => undefined);
    await loadEmails().catch(() => undefined);
  }, [loadRegistry, loadEmails]);

  const loadDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/users?id=${encodeURIComponent(id)}`, { cache: "no-store" });
      const data = (await response.json()) as { user?: AdminUserDetail; message?: string };
      if (!response.ok) throw new Error(data.message || "تعذّر تحميل تفاصيل الحساب.");
      setDetail(data.user || null);
    } catch (err) {
      setDetail(null);
      setError(err instanceof Error ? err.message : "تعذّر تحميل التفاصيل.");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    load()
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || "تعذّر تحميل لوحة التحكم.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [load]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    void loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  async function onSearch(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await load(query);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر البحث.");
    } finally {
      setLoading(false);
    }
  }

  async function patchUser(id: string, body: Record<string, unknown>) {
    setBusyId(id);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...body }),
      });
      const data = (await response.json()) as { user?: AdminUser; message?: string };
      if (!response.ok) {
        setError(data.message || "تعذّر تحديث الحساب.");
        return;
      }
      if (data.user) {
        setUsers((current) => current.map((row) => (row.id === data.user!.id ? { ...row, ...data.user! } : row)));
        if (selectedId === id) await loadDetail(id);
      }
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setBusyId("");
    }
  }

  async function runAction(id: string, action: "resend_verification" | "send_password_reset") {
    setBusyId(id);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(data.message || "تعذّر تنفيذ الإجراء.");
        return;
      }
      setNotice(data.message || "تم الإرسال.");
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setBusyId("");
    }
  }

  async function registerClient(event: FormEvent) {
    event.preventDefault();
    setBusyId("register");
    setError("");
    setNotice("");
    setIssuedSecret("");
    try {
      const redirectUri =
        regForm.redirectUri.trim() || `${regForm.origin.replace(/\/$/, "")}/api/auth/bhd/callback`;
      const response = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...regForm, redirectUri }),
      });
      const data = (await response.json()) as {
        message?: string;
        clientSecret?: string;
        hint?: string;
      };
      if (!response.ok) {
        setError(data.message || "تعذّر تسجيل العميل.");
        return;
      }
      setIssuedSecret(data.clientSecret || "");
      setNotice(data.hint || "تم تسجيل العميل.");
      await loadRegistry();
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setBusyId("");
    }
  }

  async function saveMailTemplate(event: FormEvent) {
    event.preventDefault();
    setBusyId("mail");
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/emails", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: mailKind, ...mailForm }),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(data.message || "تعذّر حفظ القالب.");
        return;
      }
      setNotice("تم حفظ قالب البريد.");
      await loadEmails(mailKind);
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setBusyId("");
    }
  }

  async function deleteUser(user: AdminUser) {
    if (user.email === operatorEmail) return;
    const ok = window.confirm(
      `حذف نهائي لـ ${user.email}؟ سيُمسح من قاعدة الهوية ويمكنه التسجيل من جديد. لا يمكن التراجع.`,
    );
    if (!ok) return;
    setBusyId(user.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/users?id=${encodeURIComponent(user.id)}`, { method: "DELETE" });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(data.message || "تعذّر الحذف.");
        return;
      }
      setNotice(data.message || "تم الحذف.");
      if (selectedId === user.id) setSelectedId(null);
      await load(query);
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setBusyId("");
    }
  }

  async function setClientMode(clientId: string, mode: "browse" | "sso") {
    setBusyId(clientId);
    setError("");
    try {
      const response = await fetch("/api/admin/clients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, mode }),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(data.message || "تعذّر تحديث الوضع.");
        return;
      }
      setNotice(mode === "sso" ? `تم تفعيل SSO لـ ${clientId}` : `أُرجع ${clientId} إلى browse`);
      await loadRegistry();
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setBusyId("");
    }
  }

  const stats = useMemo(
    () => [
      { label: "الحسابات", value: overview?.users ?? "—" },
      { label: "نشطة", value: overview?.activeUsers ?? "—" },
      { label: "غير موثّقة", value: overview?.unverifiedUsers ?? "—" },
      { label: "Google", value: overview?.googleUsers ?? "—" },
      { label: "فيسبوك", value: overview?.facebookUsers ?? "—" },
      { label: "بطاقات", value: overview?.contacts ?? "—" },
    ],
    [overview],
  );

  async function signOutAdmin() {
    await fetch("/api/auth/logout", { method: "POST" });
    const end = new URL("/oauth/end-session", window.location.origin);
    end.searchParams.set("client_id", "bhd-portal");
    end.searchParams.set("post_logout_redirect_uri", `${window.location.origin}/login`);
    window.location.assign(end.toString());
  }

  return (
    <div className="admin-screen admin-screen-v2">
      <header className="admin-topbar">
        <InstantLink href="/" className="admin-brand" aria-label="العودة للرئيسية">
          <BrandLogo kind="full" tone="light" className="admin-logo" />
        </InstantLink>
        <div className="admin-topbar-copy">
          <p>BHD Identity Control Plane</p>
          <h1>لوحة تشغيل الهوية</h1>
        </div>
        <div className="admin-topbar-actions">
          <nav className="admin-top-nav" aria-label="تنقل الهوية">
            <InstantLink href="/">الرئيسية</InstantLink>
            <InstantLink href="/account">الحساب</InstantLink>
            <InstantLink href="/apps">البرامج</InstantLink>
            <InstantLink href="/docs/unified-login">التوثيق</InstantLink>
            <button type="button" className="admin-signout" onClick={() => void signOutAdmin()}>
              خروج
            </button>
          </nav>
          <div className="admin-operator">
            <strong>{operatorName}</strong>
            <span>{operatorEmail}</span>
          </div>
          <SessionMenu signInLabel="دخول" />
        </div>
      </header>

      <main className="admin-main" id="main-content">
        {error ? (
          <p className="admin-error" role="alert">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className="admin-notice" role="status">
            {notice}
          </p>
        ) : null}

        <nav className="admin-tabs" aria-label="أقسام اللوحة">
          {(
            [
              ["users", "المستخدمون"],
              ["emails", "قوالب البريد"],
              ["system", "النظام"],
              ["clients", "العملاء والربط"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={tab === id ? "is-active" : undefined}
              onClick={() => {
                setTab(id);
                if (id === "emails") void loadEmails(mailKind).catch(() => undefined);
              }}
            >
              {label}
            </button>
          ))}
        </nav>

        <section className="admin-stats" aria-label="ملخص الهوية">
          {stats.map((stat) => (
            <article key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </article>
          ))}
        </section>

        {tab === "emails" ? (
          <div className="admin-emails-layout">
            <section className="admin-panel">
              <div className="admin-panel-head">
                <div>
                  <p>Transactional mail</p>
                  <h2>صياغة رسائل الهوية</h2>
                </div>
                <span className={overview?.resendConfigured ? "admin-pill is-ok" : "admin-pill"}>
                  {overview?.resendConfigured ? "Resend جاهز" : "Resend غير مفعّل"}
                </span>
              </div>
              <p className="admin-footnote">
                الشعار وشبكة برامج المجموعة ثابتان في القالب. هنا تعدّل النصوص فقط. روابط الأزرار تذهب مباشرة إلى{" "}
                <code>id.bhd-om.com</code> دون تتبّع نقرات Resend لتفادي التأخير عبر Outlook Safe Links.
              </p>
              <div className="admin-mail-kind-tabs" role="tablist" aria-label="نوع الرسالة">
                {(
                  [
                    ["password_reset", "إعادة كلمة المرور"],
                    ["email_verify", "تفعيل البريد"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={mailKind === id}
                    className={mailKind === id ? "is-active" : undefined}
                    onClick={() => {
                      setMailKind(id);
                      void loadEmails(id).catch((err) =>
                        setError(err instanceof Error ? err.message : "تعذّر التحميل."),
                      );
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <form className="admin-mail-form" onSubmit={(event) => void saveMailTemplate(event)}>
                <label>
                  موضوع الرسالة
                  <input
                    value={mailForm.subject}
                    onChange={(e) => setMailForm((s) => ({ ...s, subject: e.target.value }))}
                    required
                    maxLength={180}
                  />
                </label>
                <label>
                  العنوان داخل الرسالة
                  <input
                    value={mailForm.headline}
                    onChange={(e) => setMailForm((s) => ({ ...s, headline: e.target.value }))}
                    required
                    maxLength={120}
                  />
                </label>
                <label>
                  نص الرسالة
                  <textarea
                    value={mailForm.body}
                    onChange={(e) => setMailForm((s) => ({ ...s, body: e.target.value }))}
                    required
                    rows={4}
                    maxLength={2000}
                  />
                </label>
                <label>
                  نص الزر
                  <input
                    value={mailForm.cta}
                    onChange={(e) => setMailForm((s) => ({ ...s, cta: e.target.value }))}
                    required
                    maxLength={80}
                  />
                </label>
                <label>
                  ملاحظة أسفل الزر
                  <textarea
                    value={mailForm.footnote}
                    onChange={(e) => setMailForm((s) => ({ ...s, footnote: e.target.value }))}
                    rows={2}
                    maxLength={400}
                  />
                </label>
                <button type="submit" className="admin-action" disabled={busyId === "mail"}>
                  {busyId === "mail" ? "جارٍ الحفظ…" : "حفظ القالب"}
                </button>
              </form>
            </section>
            <section className="admin-panel admin-mail-preview-panel">
              <div className="admin-panel-head">
                <div>
                  <p>Live preview</p>
                  <h2>معاينة كما تصل للعميل</h2>
                </div>
              </div>
              {mailPreview ? (
                <iframe
                  className="admin-mail-preview"
                  title="معاينة البريد"
                  srcDoc={mailPreview}
                  sandbox=""
                />
              ) : (
                <p className="admin-muted">لا توجد معاينة بعد.</p>
              )}
            </section>
          </div>
        ) : null}

        {tab === "system" ? (
          <section className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <p>Infrastructure</p>
                <h2>حالة خدمة الهوية</h2>
              </div>
              <span className={overview?.databaseOk ? "admin-pill is-ok" : "admin-pill"}>
                {overview?.databaseOk ? "DB online" : loading ? "…" : "DB offline"}
              </span>
            </div>
            <dl className="admin-meta admin-meta-dense">
              <div>
                <dt>Issuer</dt>
                <dd>
                  <code>{overview?.issuer || "https://id.bhd-om.com"}</code>
                </dd>
              </div>
              <div>
                <dt>Spec</dt>
                <dd>
                  <code>{overview?.spec || "bhd-identity.v1"}</code>
                </dd>
              </div>
              <div>
                <dt>Google OAuth</dt>
                <dd>{overview?.googleConfigured ? "ready" : "missing"}</dd>
              </div>
              <div>
                <dt>Facebook OAuth</dt>
                <dd>{overview?.facebookConfigured ? "ready" : "missing"}</dd>
              </div>
              <div>
                <dt>Session secret</dt>
                <dd>{overview?.authSecretConfigured ? "ready" : "missing"}</dd>
              </div>
              <div>
                <dt>Resend mail</dt>
                <dd>{overview?.resendConfigured ? "ready" : "missing"}</dd>
              </div>
            </dl>
            <p className="admin-footnote">
              صلاحية هذه اللوحة عبر <code>BHD_PLATFORM_ADMIN_EMAILS</code> فقط. خطط الاشتراك المدفوعة داخل قواعد
              المنتجات؛ هنا تظهر ارتباطات SSO الفعلية لكل مستخدم.
            </p>
            <div className="admin-docs-cta">
              <div>
                <p>Integration</p>
                <h3>دليل ربط البرامج بالدخول الموحّد</h3>
                <span>
                  تنزيل مواصفات SSO والمشغّل، ظهور الأيقونات في الهيدر/الفوتر، واعتماد الدخول والتنقّل بين المواقع.
                </span>
              </div>
              <InstantLink className="admin-action" href="/docs/unified-login">
                فتح التوثيق
              </InstantLink>
            </div>
          </section>
        ) : null}

        {tab === "clients" ? (
          <div className="admin-users-layout">
            <section className="admin-panel">
              <div className="admin-panel-head">
                <div>
                  <p>Registry</p>
                  <h2>تسجيل منتج جديد يدوياً</h2>
                </div>
              </div>
              <p className="admin-footnote">
                بعد أن ينفّذ المنتج مسارات <code>start/callback</code> من الدليل، سجّله هنا بدل تعديل الكود. ثم اختبر{" "}
                <code>start → id.bhd-om.com</code> وفعّل <code>sso</code>.
              </p>
              <form className="admin-register-form" onSubmit={(event) => void registerClient(event)}>
                <label>
                  <span>client_id</span>
                  <input
                    value={regForm.clientId}
                    onChange={(event) => setRegForm((current) => ({ ...current, clientId: event.target.value }))}
                    placeholder="bhd-myapp"
                    required
                  />
                </label>
                <label>
                  <span>اسم المنتج</span>
                  <input
                    value={regForm.name}
                    onChange={(event) => setRegForm((current) => ({ ...current, name: event.target.value }))}
                    required
                  />
                </label>
                <label>
                  <span>أصل الموقع (origin)</span>
                  <input
                    value={regForm.origin}
                    onChange={(event) => setRegForm((current) => ({ ...current, origin: event.target.value }))}
                    placeholder="https://app.example.com"
                    required
                  />
                </label>
                <label>
                  <span>workspacePath بعد الدخول</span>
                  <input
                    value={regForm.workspacePath}
                    onChange={(event) => setRegForm((current) => ({ ...current, workspacePath: event.target.value }))}
                    placeholder="/dashboard"
                  />
                </label>
                <label className="full">
                  <span>redirect_uri (اختياري — الافتراضي …/api/auth/bhd/callback)</span>
                  <input
                    value={regForm.redirectUri}
                    onChange={(event) => setRegForm((current) => ({ ...current, redirectUri: event.target.value }))}
                    placeholder="https://app.example.com/api/auth/bhd/callback"
                  />
                </label>
                <label>
                  <span>الوضع الابتدائي</span>
                  <select
                    value={regForm.mode}
                    onChange={(event) =>
                      setRegForm((current) => ({
                        ...current,
                        mode: event.target.value === "sso" ? "sso" : "browse",
                      }))
                    }
                  >
                    <option value="browse">browse — بانتظار اكتمال المسار</option>
                    <option value="sso">sso — المسار جاهز ومُختبر</option>
                  </select>
                </label>
                <button type="submit" className="admin-action" disabled={busyId === "register"}>
                  تسجيل العميل
                </button>
              </form>
              {issuedSecret ? (
                <p className="admin-notice" role="status">
                  client_secret (احفظه الآن): <code>{issuedSecret}</code>
                </p>
              ) : null}
              <p className="admin-footnote">
                API: <code>GET/POST/PATCH /api/admin/clients</code> (جلسة أدمن منصة فقط). الدليل التفصيلي:{" "}
                <InstantLink href="/docs/unified-login#admin-api">/docs/unified-login</InstantLink>
              </p>
            </section>

            <section className="admin-panel">
              <div className="admin-panel-head">
                <div>
                  <p>Clients</p>
                  <h2>الثابت + المسجّل</h2>
                </div>
              </div>
              <ul className="admin-clients">
                {(registry.length ? registry : (overview?.clients || []).map((client) => ({
                  clientId: client.clientId,
                  name: client.name,
                  source: "static",
                  origin: client.productionRedirects[0]
                    ? new URL(client.productionRedirects[0]).origin
                    : null,
                  workspacePath: null,
                  mode: "sso",
                  redirectUris: client.productionRedirects,
                  enabled: true,
                }))).map((client) => (
                  <li key={client.clientId}>
                    <strong>{client.name}</strong>
                    <code>{client.clientId}</code>
                    <span>
                      {client.origin || "—"} · {client.source} · {client.mode}
                    </span>
                    {client.source === "registered" ? (
                      <button
                        type="button"
                        className="admin-action admin-action-secondary"
                        disabled={busyId === client.clientId}
                        onClick={() =>
                          void setClientMode(client.clientId, client.mode === "sso" ? "browse" : "sso")
                        }
                      >
                        {client.mode === "sso" ? "إرجاع browse" : "تفعيل SSO"}
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        ) : null}

        {tab === "users" ? (
          <div className="admin-users-layout">
            <section className="admin-panel">
              <div className="admin-panel-head">
                <div>
                  <p>Directory</p>
                  <h2>مستخدمو الهوية</h2>
                </div>
                <form className="admin-search" onSubmit={onSearch}>
                  <label>
                    <span className="sr-only">بحث</span>
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="اسم · بريد · username"
                    />
                  </label>
                  <button type="submit">بحث</button>
                </form>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>المستخدم</th>
                      <th>البريد</th>
                      <th>التطبيقات</th>
                      <th>آخر دخول</th>
                      <th>IP</th>
                      <th>الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={6}>{loading ? "جارٍ التحميل…" : "لا توجد حسابات مطابقة."}</td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr
                          key={user.id}
                          className={selectedId === user.id ? "is-selected" : undefined}
                          onClick={() => setSelectedId(user.id)}
                        >
                          <td>
                            <div className="admin-user">
                              {user.picture ? (
                                <img src={user.picture} alt="" width={32} height={32} />
                              ) : (
                                <span>{user.name.slice(0, 1)}</span>
                              )}
                              <div>
                                <strong>{user.name}</strong>
                                <small>{user.username ? `@${user.username}` : user.id.slice(0, 8)}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            {user.email}
                            <small>{user.emailVerified ? "موثّق" : "غير موثّق"}</small>
                          </td>
                          <td>
                            <code>{user.linkedApps}</code>
                          </td>
                          <td>
                            {formatDate(user.lastLoginAt)}
                            <small>انضم {formatDate(user.createdAt)}</small>
                          </td>
                          <td>
                            <code className="admin-ip">{user.lastLoginIp || "—"}</code>
                          </td>
                          <td>
                            <span className={user.isActive ? "admin-pill is-ok" : "admin-pill"}>
                              {user.isActive ? "نشط" : "موقوف"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <aside className="admin-panel admin-detail" aria-live="polite">
              {!selectedId ? (
                <div className="admin-detail-empty">
                  <p>Inspector</p>
                  <h2>اختر مستخدماً</h2>
                  <span>لعرض البيانات، الـ IP، الارتباطات عبر المواقع، وإعادة إرسال الروابط.</span>
                </div>
              ) : detailLoading && !detail ? (
                <p>جارٍ تحميل التفاصيل…</p>
              ) : detail ? (
                <>
                  <div className="admin-detail-head">
                    <div className="admin-user">
                      {detail.picture ? (
                        <img src={detail.picture} alt="" width={40} height={40} />
                      ) : (
                        <span>{detail.name.slice(0, 1)}</span>
                      )}
                      <div>
                        <strong>{detail.name}</strong>
                        <small>{detail.email}</small>
                      </div>
                    </div>
                    <button type="button" className="admin-action admin-action-ghost" onClick={() => setSelectedId(null)}>
                      إغلاق
                    </button>
                  </div>

                  <dl className="admin-detail-grid">
                    <div>
                      <dt>user id</dt>
                      <dd>
                        <code>{detail.id}</code>
                      </dd>
                    </div>
                    <div>
                      <dt>username</dt>
                      <dd>{detail.username ? `@${detail.username}` : "—"}</dd>
                    </div>
                    <div>
                      <dt>الهاتف</dt>
                      <dd>{detail.phone || detail.contact?.phone2 || "—"}</dd>
                    </div>
                    <div>
                      <dt>طرق الدخول</dt>
                      <dd>{loginMethods(detail)}</dd>
                    </div>
                    <div>
                      <dt>تاريخ الانضمام</dt>
                      <dd>{formatDate(detail.createdAt)}</dd>
                    </div>
                    <div>
                      <dt>آخر دخول</dt>
                      <dd>{formatDate(detail.lastLoginAt)}</dd>
                    </div>
                    <div>
                      <dt>IP آخر دخول</dt>
                      <dd>
                        <code>{detail.lastLoginIp || "—"}</code>
                      </dd>
                    </div>
                    <div>
                      <dt>IP التسجيل</dt>
                      <dd>
                        <code>{detail.signupIp || "—"}</code>
                      </dd>
                    </div>
                    <div>
                      <dt>المدينة</dt>
                      <dd>{detail.contact?.city || "—"}</dd>
                    </div>
                    <div>
                      <dt>البلد</dt>
                      <dd>{detail.contact?.country || "—"}</dd>
                    </div>
                  </dl>

                  <div className="admin-detail-section">
                    <h3>اشتراكات / ارتباطات المواقع</h3>
                    <p className="admin-footnote">
                      تظهر أول وآخر عملية SSO لكل تطبيق. خطط الفوترة تُدار داخل قاعدة كل منتج على{" "}
                      <code>bhd_sub</code>.
                    </p>
                    {detail.apps.length === 0 ? (
                      <p className="admin-muted">لا يوجد ارتباط SSO مسجّل بعد.</p>
                    ) : (
                      <ul className="admin-app-links">
                        {detail.apps.map((app) => (
                          <li key={app.clientId}>
                            <div>
                              <strong>{app.name}</strong>
                              <code>{app.clientId}</code>
                            </div>
                            <span>{app.origin || "—"}</span>
                            <small>
                              أول ارتباط {formatDate(app.firstSeenAt)} · آخر نشاط {formatDate(app.lastSeenAt)} ·{" "}
                              {app.ticketCount} تذكرة
                            </small>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="admin-detail-actions">
                    {!detail.emailVerified ? (
                      <>
                        <button
                          type="button"
                          className="admin-action"
                          disabled={busyId === detail.id}
                          onClick={() => void patchUser(detail.id, { emailVerified: true })}
                        >
                          توثيق البريد يدوياً
                        </button>
                        <button
                          type="button"
                          className="admin-action admin-action-secondary"
                          disabled={busyId === detail.id || !overview?.resendConfigured}
                          onClick={() => void runAction(detail.id, "resend_verification")}
                        >
                          إعادة إرسال رابط التفعيل
                        </button>
                      </>
                    ) : (
                      <span className="admin-pill is-ok">البريد موثّق</span>
                    )}
                    <button
                      type="button"
                      className="admin-action admin-action-secondary"
                      disabled={busyId === detail.id || !overview?.resendConfigured}
                      onClick={() => void runAction(detail.id, "send_password_reset")}
                    >
                      إرسال رابط إعادة كلمة المرور
                    </button>
                    <button
                      type="button"
                      className="admin-action"
                      disabled={busyId === detail.id || detail.email === operatorEmail}
                      onClick={() => void patchUser(detail.id, { isActive: !detail.isActive })}
                    >
                      {detail.isActive ? "إيقاف الحساب" : "تفعيل الحساب"}
                    </button>
                    <button
                      type="button"
                      className="admin-action admin-action-danger"
                      disabled={busyId === detail.id || detail.email === operatorEmail}
                      onClick={() => void deleteUser(detail)}
                    >
                      حذف نهائي من الهوية
                    </button>
                  </div>
                </>
              ) : (
                <p>تعذّر تحميل التفاصيل.</p>
              )}
            </aside>
          </div>
        ) : null}
      </main>
    </div>
  );
}
