"use client";

import { BhdAppIcon } from "../components/bhd/BhdAppIcon";
import { InstantLink } from "../components/InstantLink";
import type { BhdApp } from "../lib/bhd/apps";
import { FormEvent, useCallback, useEffect, useState } from "react";

export function AdminAppsPanel() {
  const [apps, setApps] = useState<BhdApp[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    id: "",
    nameAr: "",
    nameEn: "",
    origin: "https://",
    homePath: "/",
    workspacePath: "/dashboard",
    mark: "B",
    accent: "#075c45",
    soft: "#e6f1ec",
    sortOrder: "0",
    enabled: true,
    mode: "sso",
  });
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/apps", { cache: "no-store" });
    const data = (await response.json()) as { apps?: BhdApp[]; message?: string };
    if (!response.ok) throw new Error(data.message || "تعذّر تحميل الكتالوج.");
    setApps(data.apps || []);
  }, []);

  useEffect(() => {
    load().catch((err: Error) => setError(err.message));
  }, [load]);

  function fill(app: BhdApp) {
    setCreating(false);
    setSelectedId(app.id);
    setForm({
      id: app.id,
      nameAr: app.nameAr,
      nameEn: app.nameEn,
      origin: app.origin,
      homePath: app.homePath,
      workspacePath: app.workspacePath,
      mark: app.mark,
      accent: app.accent,
      soft: app.soft,
      sortOrder: String(app.sortOrder ?? 0),
      enabled: app.enabled,
      mode: app.mode,
    });
  }

  function startCreate() {
    setCreating(true);
    setSelectedId(null);
    setForm({
      id: "bhd-",
      nameAr: "",
      nameEn: "",
      origin: "https://",
      homePath: "/",
      workspacePath: "/dashboard",
      mark: "B",
      accent: "#075c45",
      soft: "#e6f1ec",
      sortOrder: String(apps.length),
      enabled: true,
      mode: "sso",
    });
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    setBusy("save");
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/apps", {
        method: creating ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: form.id,
          nameAr: form.nameAr,
          nameEn: form.nameEn,
          origin: form.origin,
          homePath: form.homePath,
          workspacePath: form.workspacePath,
          mark: form.mark,
          accent: form.accent,
          soft: form.soft,
          sortOrder: Number(form.sortOrder),
          enabled: form.enabled,
          mode: form.mode,
        }),
      });
      const data = (await response.json()) as { app?: BhdApp; message?: string };
      if (!response.ok) throw new Error(data.message || "تعذّر الحفظ.");
      await load();
      if (data.app) fill(data.app);
      setNotice("حُفظت التفاصيل. شاشات الأيقونات تقرأها خلال ثوانٍ.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر الحفظ.");
    } finally {
      setBusy("");
    }
  }

  async function onLogo(file: File | null) {
    if (!file || !form.id) return;
    setBusy("logo");
    setError("");
    try {
      const payload = new FormData();
      payload.set("id", form.id);
      payload.set("file", file);
      const response = await fetch("/api/admin/apps/logo", { method: "POST", body: payload });
      const data = (await response.json()) as { app?: BhdApp; message?: string };
      if (!response.ok) throw new Error(data.message || "تعذّر رفع الشعار.");
      await load();
      if (data.app) fill(data.app);
      setNotice("رُفع الشعار.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر رفع الشعار.");
    } finally {
      setBusy("");
    }
  }

  async function onClearLogo() {
    if (!form.id) return;
    setBusy("logo");
    await fetch(`/api/admin/apps/logo?id=${encodeURIComponent(form.id)}`, { method: "DELETE" });
    await load();
    const next = (await fetch("/api/admin/apps", { cache: "no-store" }).then((r) => r.json())) as { apps?: BhdApp[] };
    const app = next.apps?.find((item) => item.id === form.id);
    if (app) fill(app);
    setBusy("");
  }

  const selected = apps.find((app) => app.id === selectedId);

  return (
    <div className="admin-users-layout">
      <section className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <p>Live app grid</p>
            <h2>شاشة الأيقونات</h2>
          </div>
          <button type="button" className="admin-action admin-action-secondary" onClick={startCreate}>
            إضافة موقع
          </button>
        </div>
        <p className="admin-footnote">
          الاسم والرابط والشعار يُحفظان هنا وينعكسان عبر{" "}
          <code>/api/bhd/catalog</code> في المشغّل والبوابة. المواقع الأخرى تقرأ نفس المصدر إن حمّلت السكربت أو
          المشغّل المحدّث.{" "}
          <InstantLink href="/admin#connect">تفاصيل الربط</InstantLink>
        </p>
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
        <ul className="admin-apps-list">
          {apps.map((app) => (
            <li key={app.id}>
              <button type="button" className={app.id === selectedId ? "is-active" : undefined} onClick={() => fill(app)}>
                <BhdAppIcon
                  id={app.id}
                  title={app.nameAr}
                  logoUrl={app.logoUrl}
                  mark={app.mark}
                  accent={app.accent}
                  soft={app.soft}
                />
                <span>
                  <strong>{app.nameAr}</strong>
                  <small>{app.origin.replace(/^https:\/\//, "")}</small>
                </span>
                {!app.enabled ? <em>مخفي</em> : null}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <p>{creating ? "New tile" : "Edit tile"}</p>
            <h2>{creating ? "موقع جديد" : selected?.nameAr || "التفاصيل"}</h2>
          </div>
        </div>
        <form className="admin-register-form" onSubmit={(event) => void onSave(event)}>
          <label>
            <span>المعرّف</span>
            <input
              value={form.id}
              onChange={(event) => setForm((current) => ({ ...current, id: event.target.value }))}
              required
              disabled={!creating}
            />
          </label>
          <label>
            <span>الترتيب</span>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(event) => setForm((current) => ({ ...current, sortOrder: event.target.value }))}
            />
          </label>
          <label>
            <span>المسمّى عربي</span>
            <input
              value={form.nameAr}
              onChange={(event) => setForm((current) => ({ ...current, nameAr: event.target.value }))}
              required
            />
          </label>
          <label>
            <span>المسمّى إنجليزي</span>
            <input
              value={form.nameEn}
              onChange={(event) => setForm((current) => ({ ...current, nameEn: event.target.value }))}
              required
            />
          </label>
          <label className="full">
            <span>رابط الموقع (origin)</span>
            <input
              value={form.origin}
              onChange={(event) => setForm((current) => ({ ...current, origin: event.target.value }))}
              required
            />
          </label>
          <label>
            <span>الصفحة الرئيسية</span>
            <input
              value={form.homePath}
              onChange={(event) => setForm((current) => ({ ...current, homePath: event.target.value }))}
            />
          </label>
          <label>
            <span>مساحة العمل</span>
            <input
              value={form.workspacePath}
              onChange={(event) => setForm((current) => ({ ...current, workspacePath: event.target.value }))}
            />
          </label>
          <label>
            <span>حرف احتياطي</span>
            <input
              value={form.mark}
              maxLength={4}
              onChange={(event) => setForm((current) => ({ ...current, mark: event.target.value }))}
            />
          </label>
          <label>
            <span>لون الأيقونة</span>
            <input
              value={form.accent}
              onChange={(event) => setForm((current) => ({ ...current, accent: event.target.value }))}
            />
          </label>
          <label>
            <span>خلفية الأيقونة</span>
            <input
              value={form.soft}
              onChange={(event) => setForm((current) => ({ ...current, soft: event.target.value }))}
            />
          </label>
          <label>
            <span>الظهور</span>
            <select
              value={form.enabled ? "1" : "0"}
              onChange={(event) => setForm((current) => ({ ...current, enabled: event.target.value === "1" }))}
            >
              <option value="1">ظاهر في الشاشة</option>
              <option value="0">مخفي</option>
            </select>
          </label>
          <label className="full">
            <span>الشعار (PNG / JPEG / WebP / SVG حتى 512 ك.ب)</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={(event) => void onLogo(event.target.files?.[0] || null)}
              disabled={creating || busy === "logo"}
            />
          </label>
          {selected?.logoUrl ? (
            <p className="admin-footnote">
              شعار مرفوع.{" "}
              <button type="button" className="admin-inline-link" onClick={() => void onClearLogo()}>
                حذف الشعار
              </button>
            </p>
          ) : null}
          <button type="submit" className="admin-action" disabled={busy === "save"}>
            {busy === "save" ? "جارٍ الحفظ…" : "حفظ التفاصيل"}
          </button>
        </form>
        {selected ? (
          <div className="admin-app-preview">
            <BhdAppIcon
              id={selected.id}
              title={form.nameAr}
              logoUrl={selected.logoUrl}
              mark={form.mark}
              accent={form.accent}
              soft={form.soft}
            />
            <span>{form.nameAr}</span>
          </div>
        ) : null}
      </section>
    </div>
  );
}
