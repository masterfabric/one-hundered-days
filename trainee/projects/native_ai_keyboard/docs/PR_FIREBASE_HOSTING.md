# GitHub PR copy — Native AI Keyboard (Firebase Hosting legal pages)

**Title**

```
Project - Native AI Keyboard -> Firebase Hosting legal pages and in-app Privacy links
```

Paste everything below into the PR description field.

---

## Summary

This PR adds **customer-facing legal and support pages** for App Store Connect, hosted on **Firebase Hosting** (`masterfabric-nativeaikeyboard`), plus **in-app links** in the iOS host app. Pages are plain English, non-technical copy (privacy, terms, support) with no subscription billing section. iOS reads `LegalBaseURL` from `Info.plist` and shows Privacy / Terms / Support in Settings.

**Live URLs (after deploy)**

- Privacy: `https://masterfabric-nativeaikeyboard.web.app/privacy/`
- Terms: `https://masterfabric-nativeaikeyboard.web.app/terms/`
- Support: `https://masterfabric-nativeaikeyboard.web.app/support/`

---

## 📋 PR Description

This PR introduces **Firebase Hosting** under `trainee/projects/native_ai_keyboard/hosting/` for **Privacy Policy**, **Terms of Use**, and **Support**, aligned with App Store requirements (data collection disclosure, Full Access, AI responsibility, contact email, no in-app subscriptions).

**Key improvements**

- **Hosting:** Static HTML + shared CSS; `firebase.json` with no-cache headers for HTML; deploy docs in `hosting/README.md`; `.firebaserc.example` for project `masterfabric-nativeaikeyboard` (local `.firebaserc` gitignored).
- **Legal copy:** “In short” summaries, user rights section, Apple/Google service-provider disclosure without vendor-specific implementation jargon (no Supabase/Resend in public copy).
- **iOS:** `LegalBaseURL` in `Info.plist`, `AppConstants` URL helpers, Legal section in `ContentView` with EN/TR strings; `GoogleService-Info.plist.example` updated for Masterfabric bundle ID and Firebase project id.
- **Docs:** Root `README.md` and `ios-keyboard/README.md` link to hosting and App Store URL checklist.

---

## ✅ Checklist

- [ ] Code follows the project standards and guidelines.
- [ ] Relevant documentation is updated (`hosting/README.md`, `ios-keyboard/README.md`, project `README.md`).
- [ ] No secrets committed (`.firebaserc` gitignored; no `GoogleService-Info.plist` in repo).
- [ ] Support email in HTML is correct for production (`support@masterfabric.com` or team address).
- [ ] Hosting deployed from `hosting/` (`firebase deploy --only hosting`) and URLs verified in a browser.
- [ ] The PR has been reviewed by at least one team member before merging.

---

## 🛠 Steps to test

### Firebase Hosting

1. `cd trainee/projects/native_ai_keyboard/hosting`
2. `cp .firebaserc.example .firebaserc` if needed; `firebase login` with the team Google account.
3. `firebase deploy --only hosting`
4. Open `/privacy/`, `/terms/`, `/support/` on `https://masterfabric-nativeaikeyboard.web.app` (hard refresh if cached).

### iOS

1. Confirm `LegalBaseURL` in `AIKeyboard/Info.plist` matches the deployed Hosting base URL.
2. Build and run the host app → Settings form → **Legal** section → open each link in Safari.
3. Optional: `cd ios-keyboard && xcodegen generate` if `project.yml` was changed on another branch.

### App Store Connect

1. Paste Privacy Policy and Support URLs from the live site.
2. Ensure App Privacy questionnaire matches the policy (device data, diagnostics, user content for AI, etc.).

---

## Related

- Plan reference: App Store legal URLs (Firebase Hosting)
- Prior PR style: [`docs/PR_ISSUE_REPORTS.md`](./PR_ISSUE_REPORTS.md)
