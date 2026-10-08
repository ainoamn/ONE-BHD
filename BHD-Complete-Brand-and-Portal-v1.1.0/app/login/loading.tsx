export default function LoginLoading() {
  return (
    <div className="login-screen">
      <div className="login-shell">
        <div className="login-stage">
          <section className="login-card">
            <div className="login-handoff" role="status" aria-live="polite">
              <span className="login-handoff-mark" aria-hidden="true" />
              <p>جاري فتح صفحة الدخول…</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
