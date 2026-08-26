# Wazen `BHD_EMAIL_UNVERIFIED` — fix

Wazen blocks SSO when the BHD identity `id_token` / userinfo has `email_verified: false`.

## Cause

Identity users created before Resend (or when mail send failed) stay `email_verified = false` in Neon. Wazen correctly rejects them.

## Fix (deployed)

1. **Platform admins** (`BHD_PLATFORM_ADMIN_EMAILS`): on password login and on OAuth token/userinfo, identity auto-sets `email_verified = true` for matching emails.
2. **Admin console**: `/admin` → user row → «توثيق البريد» for any account.
3. **Resend**: still used for normal self-serve verify when domain + API key are valid.

## After deploy

1. Sign out of Wazen / clear SSO session if needed.
2. Open Wazen → «الدخول بحساب BHD» with a platform-admin email (or an account verified in `/admin`).
3. Fresh authorize + token exchange must include `email_verified: true`.
