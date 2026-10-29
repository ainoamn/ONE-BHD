"use client";

import { useCallback, useEffect, useState } from "react";

type EventRow = {
  id: string;
  email: string | null;
  ip: string | null;
  country: string | null;
  ok: boolean;
  reason: string | null;
  createdAt: string;
};

type Feed = {
  events: EventRow[];
  blocks: Array<{ ip: string; until: string; reason: string; active: boolean }>;
  heldAccounts: Array<{ id: string; email: string; name: string; lastLoginIp: string | null }>;
  countries: Array<{ country: string; ok: number; fail: number }>;
  failedLastHour: number;
  okLastHour: number;
  audit?: {
    checks: Array<{ id: string; ok: boolean; title: string; detail: string }>;
    threats: string[];
    score: number;
  };
};

export function AdminSecurityPanel() {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [aiSummary, setAiSummary] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/security", { cache: "no-store" });
    const data = (await response.json()) as Feed & { message?: string };
    if (!response.ok) throw new Error(data.message || "تعذّر تحميل سجل الحماية.");
    setFeed(data);
  }, []);

  useEffect(() => {
    setLoading(true);
    load()
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [load]);

  async function scan() {
    setScanning(true);
    setError("");
    try {
      const response = await fetch("/api/admin/security", { method: "POST" });
      const data = (await response.json()) as { aiSummary?: string; feed?: Feed; message?: string };
      if (!response.ok) throw new Error(data.message || "تعذّر الفحص.");
      setAiSummary(data.aiSummary || "");
      if (data.feed) setFeed(data.feed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر الفحص.");
    } finally {
      setScanning(false);
    }
  }

  const needle = query.trim().toLowerCase();
  const events = (feed?.events || []).filter((row) => {
    if (!needle) return true;
    return [row.email, row.ip, row.country, row.reason].some((value) => (value || "").toLowerCase().includes(needle));
  });

  return (
    <div className="admin-security">
      <section className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <p>Threat watch</p>
            <h2>الفحص والتدقيق واكتشاف التهديدات</h2>
          </div>
          <button type="button" className="admin-action" disabled={scanning} onClick={() => void scan()}>
            {scanning ? "جارٍ الفحص…" : "فحص بالذكاء الاصطناعي"}
          </button>
        </div>
        <p className="admin-footnote">
          السجل يجمع عنوان الدخول والدولة والحساب. الحظر الاحترازي يُطبَّق على العنوان بعد 12 محاولة فاشلة خلال 15 دقيقة لمدة ساعة.
          بعد 8 محاولات على نفس الحساب يُقفل حتى الاستعادة من <code>/recover</code>.
        </p>
        {error ? (
          <p className="admin-error" role="alert">
            {error}
          </p>
        ) : null}
        {aiSummary ? <p className="admin-notice">{aiSummary}</p> : null}
        {feed?.audit ? (
          <ul className="admin-audit-list">
            {feed.audit.checks.map((check) => (
              <li key={check.id}>
                <span className={check.ok ? "admin-pill is-ok" : "admin-pill"}>{check.ok ? "سليم" : "انتبه"}</span>
                <strong>{check.title}</strong>
                <small>{check.detail}</small>
              </li>
            ))}
          </ul>
        ) : null}
        <p className="admin-muted">
          الساعة الأخيرة: {feed?.okLastHour ?? 0} دخول ناجح · {feed?.failedLastHour ?? 0} فشل
        </p>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <p>Geo / IP</p>
            <h2>الدول والعناوين والحسابات</h2>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>الدولة</th>
                <th>نجاح</th>
                <th>فشل</th>
              </tr>
            </thead>
            <tbody>
              {(feed?.countries || []).map((row) => (
                <tr key={row.country}>
                  <td>{row.country}</td>
                  <td>{row.ok}</td>
                  <td>{row.fail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3>عناوين محظورة</h3>
        <ul className="admin-clients">
          {(feed?.blocks || []).length === 0 ? <li>لا حظر حالياً.</li> : null}
          {(feed?.blocks || []).map((row) => (
            <li key={row.ip}>
              <code>{row.ip}</code> — حتى {new Date(row.until).toLocaleString("ar-OM")} — {row.reason}
            </li>
          ))}
        </ul>
        <h3>حسابات موقوفة أمنياً</h3>
        <ul className="admin-clients">
          {(feed?.heldAccounts || []).length === 0 ? <li>لا حسابات موقوفة.</li> : null}
          {(feed?.heldAccounts || []).map((row) => (
            <li key={row.id}>
              {row.name} · {row.email} · {row.lastLoginIp || "—"}
            </li>
          ))}
        </ul>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <p>Login events</p>
            <h2>سجل الدخول</h2>
          </div>
          <form
            className="admin-search"
            onSubmit={(event) => {
              event.preventDefault();
            }}
          >
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="بحث: بريد، عنوان، دولة"
            />
          </form>
        </div>
        {loading ? <p>جارٍ التحميل…</p> : null}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>الوقت</th>
                <th>الحساب</th>
                <th>العنوان</th>
                <th>الدولة</th>
                <th>النتيجة</th>
              </tr>
            </thead>
            <tbody>
              {events.map((row) => (
                <tr key={row.id}>
                  <td>{new Date(row.createdAt).toLocaleString("ar-OM")}</td>
                  <td>{row.email || "—"}</td>
                  <td className="admin-ip">{row.ip || "—"}</td>
                  <td>{row.country || "—"}</td>
                  <td>
                    {row.ok ? "نجاح" : "فشل"} · {row.reason || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
