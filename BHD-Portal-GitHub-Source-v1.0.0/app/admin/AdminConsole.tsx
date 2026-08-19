"use client";

import { BrandLogo } from "../components/BrandLogo";
import { InstantLink } from "../components/InstantLink";
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
  picture: string | null;
  googleLinked: boolean;
  facebookLinked: boolean;
  hasPassword: boolean;
  emailVerified: boolean;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

function formatDate(value: string | null) {
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

export function AdminConsole({
  operatorName,
  operatorEmail,
}: {
  operatorName: string;
  operatorEmail: string;
}) {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

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

  async function toggleActive(user: AdminUser) {
    setBusyId(user.id);
    setError("");
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, isActive: !user.isActive }),
      });
      const data = (await response.json()) as { user?: AdminUser; message?: string };
      if (!response.ok) {
        setError(data.message || "تعذّر تحديث الحساب.");
        return;
      }
      if (data.user) {
        setUsers((current) => current.map((row) => (row.id === data.user!.id ? data.user! : row)));
      }
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
      { label: "Google", value: overview?.googleUsers ?? "—" },
      { label: "فيسبوك", value: overview?.facebookUsers ?? "—" },
      { label: "بطاقات العنوان", value: overview?.contacts ?? "—" },
    ],
    [overview],
  );

  return (
    <div className="admin-screen">
      <header className="admin-topbar">
        <InstantLink href="/" className="admin-brand" aria-label="العودة للرئيسية">
          <BrandLogo kind="full" tone="light" className="admin-logo" />
        </InstantLink>
        <div className="admin-topbar-copy">
          <p>لوحة تحكم هوية BHD</p>
          <h1>إدارة الحسابات والمواقع المرتبطة</h1>
        </div>
        <div className="admin-operator">
          <strong>{operatorName}</strong>
          <span>{operatorEmail}</span>
          <InstantLink href="/">الموقع</InstantLink>
        </div>
      </header>

      <main className="admin-main" id="main-content">
        {error ? (
          <p className="admin-error" role="alert">
            {error}
          </p>
        ) : null}

        <section className="admin-stats" aria-label="ملخص الهوية">
          {stats.map((stat) => (
            <article key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </article>
          ))}
        </section>

        <section className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <p>الحالة</p>
              <h2>خدمة الهوية</h2>
            </div>
            <span className={overview?.databaseOk ? "admin-pill is-ok" : "admin-pill"}>
              {overview?.databaseOk ? "قاعدة البيانات مربوطة" : loading ? "جارٍ التحميل" : "قاعدة البيانات غير مربوطة"}
            </span>
          </div>
          <dl className="admin-meta">
            <div>
              <dt>المُصدِر</dt>
              <dd>{overview?.issuer || "https://id.bhd-om.com"}</dd>
            </div>
            <div>
              <dt>المواصفة</dt>
              <dd>{overview?.spec || "bhd-identity.v1"}</dd>
            </div>
            <div>
              <dt>Google</dt>
              <dd>{overview?.googleConfigured ? "مفعّل" : "غير مفعّل"}</dd>
            </div>
            <div>
              <dt>فيسبوك</dt>
              <dd>{overview?.facebookConfigured ? "مفعّل" : "غير مفعّل"}</dd>
            </div>
            <div>
              <dt>توقيع الجلسة</dt>
              <dd>{overview?.authSecretConfigured ? "جاهز" : "ناقص"}</dd>
            </div>
          </dl>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <p>المنظومة</p>
              <h2>المواقع المرتبطة بنفس الدخول</h2>
            </div>
          </div>
          <ul className="admin-clients">
            {(overview?.clients || []).map((client) => (
              <li key={client.clientId}>
                <strong>{client.name}</strong>
                <code>{client.clientId}</code>
                <span>
                  {client.productionRedirects[0]
                    ? new URL(client.productionRedirects[0]).origin
                    : "بانتظار نطاق الإنتاج"}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <p>الحسابات</p>
              <h2>مستخدمو هوية BHD</h2>
            </div>
            <form className="admin-search" onSubmit={onSearch}>
              <label>
                <span className="sr-only">بحث</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="بحث بالاسم أو البريد أو اسم المستخدم"
                />
              </label>
              <button type="submit">بحث</button>
            </form>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>البريد</th>
                  <th>الدخول</th>
                  <th>آخر زيارة</th>
                  <th>الحالة</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6}>{loading ? "جارٍ التحميل…" : "لا توجد حسابات مطابقة."}</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="admin-user">
                          {user.picture ? <img src={user.picture} alt="" width={32} height={32} /> : <span>{user.name.slice(0, 1)}</span>}
                          <div>
                            <strong>{user.name}</strong>
                            <small>{user.username ? `@${user.username}` : user.id.slice(0, 8)}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        {user.email}
                        {user.emailVerified ? <small>موثّق</small> : <small>غير موثّق</small>}
                      </td>
                      <td>
                        {[
                          user.googleLinked ? "Google" : "",
                          user.facebookLinked ? "فيسبوك" : "",
                          user.hasPassword ? "كلمة مرور" : "",
                        ]
                          .filter(Boolean)
                          .join(" + ") || "—"}
                      </td>
                      <td>{formatDate(user.lastLoginAt)}</td>
                      <td>
                        <span className={user.isActive ? "admin-pill is-ok" : "admin-pill"}>{user.isActive ? "نشط" : "موقوف"}</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="admin-action"
                          disabled={busyId === user.id || user.email === operatorEmail}
                          onClick={() => void toggleActive(user)}
                        >
                          {user.isActive ? "إيقاف" : "تفعيل"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
