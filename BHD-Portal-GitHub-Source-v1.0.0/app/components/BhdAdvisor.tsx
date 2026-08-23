"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { products } from "../lib/products";
import { BrandLogo } from "./BrandLogo";
import { InstantLink } from "./InstantLink";

const intentKeywords: Record<string, string[]> = {
  wazen: ["مال", "أموال", "محفظ", "مصروف", "ميزانية", "رحلة", "جمعية", "دين", "التزام", "money", "wallet", "budget"],
  hisab: ["شركة", "محاسب", "محاسبة", "فاتورة", "ضريبة", "مخزون", "كاشير", "مطعم", "account", "invoice", "pos"],
  "bhd-r": ["عقار", "عقارات", "بيت", "بيتك", "منزل", "أرض", "إيجار", "استثمار", "property", "rent", "baitak", "bhd r", "bhd-r", "إدارة عقارات"],
  nasab: ["عائلة", "أسرة", "نسب", "شجرة", "أجداد", "قرابة", "family", "tree"],
  "bhd-store": ["متجر", "بيع", "تجارة", "منتج", "طلب", "بائع", "سوق", "bhdstor", "shop", "store", "commerce"],
  "bhd-office": ["وثيقة", "أرشيف", "مكتب", "تشغيل", "إدارة داخلية", "archive", "office", "document"],
};

const suggestions = [
  "أريد تنظيم مصاريفي وأموالي",
  "أدير شركة وأحتاج فواتير ومحاسبة",
  "أبحث عن حل لإدارة العقارات",
  "أريد حفظ شجرة العائلة",
];

function matchProduct(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return undefined;

  const scores = Object.entries(intentKeywords).map(([slug, keywords]) => ({
    slug,
    score: keywords.reduce((total, keyword) => total + (normalized.includes(keyword) ? keyword.length : 0), 0),
  }));
  const best = scores.sort((a, b) => b.score - a.score)[0];
  return best.score > 0 ? products.find((product) => product.slug === best.slug) : undefined;
}

export function BhdAdvisor() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const result = useMemo(() => matchProduct(query), [query]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    const handleDialogKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener("keydown", handleDialogKeys);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleDialogKeys);
      trigger?.focus();
    };
  }, [open]);

  const ask = (value: string) => {
    setQuery(value);
    setSubmitted(true);
  };

  return (
    <>
      <button
        ref={triggerRef}
        className="advisor-trigger"
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="فتح دليل منتجات BHD الذكي"
      >
        <span className="advisor-trigger-logo"><BrandLogo kind="mark" tone="light" /></span>
        <div><strong>دليل BHD الذكي</strong><small>ابنِ أحلامًا أكبر</small></div>
        <i aria-hidden="true">+</i>
      </button>

      {open && (
        <div className="advisor-backdrop" role="presentation">
          <button className="advisor-dismiss" type="button" onClick={() => setOpen(false)} aria-label="إغلاق دليل BHD الذكي" />
          <section
            ref={panelRef}
            className="advisor-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="advisor-title"
            aria-describedby="advisor-intro"
          >
            <div className="advisor-head">
              <div className="advisor-brand"><span><BrandLogo kind="mark" tone="light" /></span><small>ابنِ أحلامًا أكبر</small></div>
              <button type="button" onClick={() => setOpen(false)} aria-label="إغلاق">×</button>
            </div>
            <p className="section-kicker">دليل ذكي · يعمل داخل المتصفح</p>
            <h2 id="advisor-title">ما الذي تريد إنجازه؟</h2>
            <p className="advisor-intro" id="advisor-intro">اكتب احتياجك وسنرشح لك المنتج الأقرب فورًا.</p>

            <div className="advisor-suggestions">
              {suggestions.map((suggestion) => (
                <button type="button" key={suggestion} onClick={() => ask(suggestion)}>{suggestion}</button>
              ))}
            </div>

            <form
              className="advisor-form"
              onSubmit={(event) => {
                event.preventDefault();
                setSubmitted(true);
              }}
            >
              <label htmlFor="advisor-query">صف احتياجك</label>
              <div>
                <input
                  ref={inputRef}
                  id="advisor-query"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setSubmitted(false);
                  }}
                  placeholder="مثال: أريد إدارة فواتير شركتي..."
                  autoComplete="off"
                />
                <button type="submit">تحليل</button>
              </div>
            </form>

            <div className="advisor-result" aria-live="polite">
              {submitted && result ? (
                <>
                  <span style={{ background: result.soft, color: result.accent }}>{result.mark}</span>
                  <div>
                    <small>المنتج المقترح</small>
                    <h3>{result.nameAr} <b>{result.name}</b></h3>
                    <p>{result.descriptionAr}</p>
                    <InstantLink href={`/products/${result.slug}`}>لماذا يناسبني؟ <i aria-hidden="true">←</i></InstantLink>
                  </div>
                </>
              ) : submitted ? (
                <div className="advisor-empty">
                  <h3>نحتاج وصفًا أوضح قليلًا.</h3>
                  <p>يمكنك استعراض دليل المنتجات الكامل واختيار المجال الأقرب.</p>
                  <InstantLink href="/products">فتح دليل المنتجات <i aria-hidden="true">←</i></InstantLink>
                </div>
              ) : (
                <div className="advisor-idle"><i /> جاهز لتحليل احتياجك</div>
              )}
            </div>
            <p className="advisor-privacy">يعمل هذا الدليل محليًا داخل الصفحة ولا يرسل النص الذي تكتبه إلى خدمة خارجية.</p>
          </section>
        </div>
      )}
    </>
  );
}
