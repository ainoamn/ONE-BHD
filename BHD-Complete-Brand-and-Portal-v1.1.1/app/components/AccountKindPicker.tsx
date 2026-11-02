"use client";

type Kind = "person" | "company";

/** Shared فرد / شركة picker — register, social onboarding, and account change. */
export function AccountKindPicker({
  value,
  onChange,
  lang = "ar",
  title,
  name = "account-kind",
}: {
  value: Kind | null;
  onChange: (next: Kind) => void;
  lang?: "ar" | "en";
  title?: string;
  name?: string;
}) {
  const ar = lang === "ar";
  const heading = title ?? (ar ? "اختر نوع التسجيل" : "Choose registration type");
  return (
    <fieldset className="account-kind-picker">
      <legend className="account-kind-picker__title">{heading}</legend>
      <div className="account-kind-picker__list" role="radiogroup" aria-label={heading}>
        <label className={`account-kind-picker__card${value === "person" ? " is-selected" : ""}`}>
          <input
            type="radio"
            name={name}
            value="person"
            checked={value === "person"}
            onChange={() => onChange("person")}
          />
          <span className="account-kind-picker__label">{ar ? "فرد" : "Individual"}</span>
          <span className="account-kind-picker__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.7">
              <circle cx="12" cy="8" r="3.2" />
              <path d="M5.5 19.2c1.4-3.2 3.6-4.8 6.5-4.8s5.1 1.6 6.5 4.8" strokeLinecap="round" />
            </svg>
          </span>
        </label>
        <label className={`account-kind-picker__card${value === "company" ? " is-selected" : ""}`}>
          <input
            type="radio"
            name={name}
            value="company"
            checked={value === "company"}
            onChange={() => onChange("company")}
          />
          <span className="account-kind-picker__label">{ar ? "شركة" : "Company"}</span>
          <span className="account-kind-picker__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M4 20V7.5L12 4l8 3.5V20" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 20v-5h6v5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 10h.01M12 10h.01M15 10h.01M9 13h.01M12 13h.01M15 13h.01" strokeLinecap="round" />
            </svg>
          </span>
        </label>
      </div>
    </fieldset>
  );
}
