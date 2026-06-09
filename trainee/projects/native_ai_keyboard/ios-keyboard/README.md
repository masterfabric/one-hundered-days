# iOS — AI Keyboard

**100-days workspace:** This tree is `trainee/projects/native_ai_keyboard/ios-keyboard/`. Product plan: [native_ai_keyboard_plan](../../docs/projects/native_ai_keyboard_plan/README.md). Keyboard UI and behavior (including long-press alternates) were copied from repo-root `personal-ai-keyboard/ios/`. **Transform / device APIs** are specified as **Supabase Edge Functions** in the plan; shared networking code may still mention a Node `/v1/rewrite` gateway until you rewire it.

## Generate Xcode project

If you edit `project.yml`, regenerate:

```bash
brew install xcodegen   # once
cd ios-keyboard && xcodegen generate
```

Open `AIKeyboard.xcodeproj`.

## Signing & capabilities

### What to enable (this repo)

Both targets only declare **App Groups** in their `.entitlements` files — nothing else (no Push, iCloud, Associated Domains, etc.). On [developer.apple.com](https://developer.apple.com/account/resources/identifiers/list) you only need:

1. An **App Group** identifier: `group.com.nativeaikeyboard.shared`
2. That group enabled on both App IDs: `com.nativeaikeyboard.host` and `com.nativeaikeyboard.host.keyboard`

You do **not** need to turn on random items under **App Services** or **Capability Requests** unless you add features later that require them.

**Capability Requests** is for *restricted* capabilities that need Apple’s approval (e.g. some Wallet, CarPlay, or entitlement workflows). A standard keyboard + shared `UserDefaults` via App Group does **not** use that flow — leave it empty / ignore.

**App Services** lists optional services (Sign in with Apple, Maps, Time Sensitive Notifications, …). Only enable what your app actually uses. This project does not require any of those for basic signing + App Group.

### Closest thing to “automatic”

Use **Xcode** → select each target → **Signing & Capabilities** → **+ Capability** → **App Groups** → add `group.com.nativeaikeyboard.shared`. With **Automatically manage signing** and a valid **Team**, Xcode asks Apple to attach the entitlement to your App IDs. You still need the App Group (and App IDs) to exist under your team on the portal, and any pending **Program License Agreement** accepted.

There is no supported way for the *git repo alone* to log into your Apple account and configure the portal. Teams sometimes add **Fastlane** (`produce`, `match`) with API keys for CI — that is optional and still uses your Apple credentials.

### Checklist

1. Select team for targets **AIKeyboard** and **AIKeyboardKeyboard**.
2. Enable **App Groups** for both with identifier `group.com.nativeaikeyboard.shared` (must match entitlements files and `AppConstants.appGroupId`).
3. Set **`SupabaseProjectURL`** in `AIKeyboard/Info.plist` to your project root (e.g. `https://YOUR_REF.supabase.co`, no `/functions/v1`). Open the host app once so that URL is copied into the **App Group** for the keyboard extension (the `.appex` does not need a duplicate key, but you may add one as a fallback).
4. Align `AIKeyboardAppRequestSecret` and `AIKeyboardAPIBaseURL` with the server (`APP_REQUEST_SECRET`, deployment URL) if you still use the legacy Node session path.

## App Store legal URLs (Firebase Hosting)

Static pages live in [`../hosting/`](../hosting/README.md). After `firebase deploy --only hosting`, set **`LegalBaseURL`** in `AIKeyboard/Info.plist` to your site root (e.g. `https://<PROJECT_ID>.web.app`). The host app then shows Privacy, Terms, and Support links.

Use these URLs in App Store Connect:

- Privacy Policy → `https://<PROJECT_ID>.web.app/privacy/`
- Support URL → `https://<PROJECT_ID>.web.app/support/`

Replace `support@masterfabric.com` in the HTML before deploy if needed.

## Firebase (Crashlytics, Analytics, Firestore)

**TODO (before App Store / production telemetry):** Add **`GoogleService-Info.plist`** as documented in [Setup](#setup) below. Until then, the **Crashlytics post-build script** exits early when that plist is missing (so Xcode builds without `GOOGLE_APP_ID` errors); runtime code already no-ops without the plist.

The host app includes **Firebase Crashlytics**, **Google Analytics for Firebase**, and **Firestore** to:

- Record crashes (host + keyboard extension when configured).
- **DEBUG** builds only: on first successful `FirebaseApp.configure()` in each process (host and/or keyboard), a **one-time non-fatal** `AIKeyboardSmokeTest` is sent so you can confirm Crashlytics without a real crash. Uses `UserDefaults` key `crashlytics_debug_nonfatal_smoke_v2` after the event (skipped entirely if `GoogleService-Info.plist` is missing). **Release** builds do not send this.
- **dSYM / symbolication:** `project.yml` sets **`DEBUG_INFORMATION_FORMAT = dwarf-with-dsym`** for the app and keyboard extension so each build produces dSYM bundles. The **Firebase Crashlytics** run script (post-build on the host target) uploads symbols when the script can reach Google’s upload endpoint (needs network during archive). If the console still says *“Upload dSYM”*, use **Xcode → Organizer** → select the archive → **Distribute App** / **Upload** (which includes symbols), or manually upload the `.dSYM` from `DerivedData` / archive’s `dSYMs` folder via Crashlytics’ **Missing dSYM** flow.
- Write one document per device under **`devices/{IDFV}`** after each **Account sync** (device id matches `AccountSync`). Fields include `entitlementActive`, app/OS version, `preferredLanguages`, `updatedAt` (server time).
- **“Report a problem”** is stored in **Supabase** (`public.issue_reports`) via Edge **`submit-issue-report`** (Bearer `deviceTransformToken`). At most **one report per UTC day** per device on the server; the client also limits once per **local** calendar day via App Group. Optional **Resend** email to the project owner when Edge secrets `RESEND_API_KEY` and `REPORT_TO_EMAIL` are set (see `supabase/functions/README.md`).

**Testing another report the same day:** In **`AIKeyboard/Info.plist`**, **`AIKeyboardIssueReportBypassDailyLimit`** is set to **`true`** for development so the local daily cap is off (orange test banner in the sheet). For the **server** UTC limit, run `supabase secrets set ISSUE_REPORT_BYPASS_UTC_RATE_LIMIT=true` and redeploy `submit-issue-report` — see [`../supabase/README.md`](../supabase/README.md). Hint script from monorepo root: `./trainee/projects/native_ai_keyboard/supabase/scripts/dev-issue-report-test-hints.sh`. **Turn both off before production / App Store.**
- Log Analytics event **`entitlement_snapshot`** and user properties `device_id`, `entitlement_active` for dashboards.

### Manual QA: Report a problem (device)

1. **Supabase** — `supabase db push`, deploy `submit-issue-report`, set secrets as in [`../supabase/README.md`](../supabase/README.md) (issue reports section) and [`../supabase/functions/README.md`](../supabase/functions/README.md).
2. **Host app** — `SupabaseProjectURL` in `Info.plist` points at your project; open the host once so the keyboard extension picks up config from the App Group.
3. In the app, open **Report a problem**, enter at least 10 characters, submit.
4. **Dashboard → SQL** — confirm a row:

   ```sql
   select id, device_id, left(body, 80) as body_preview, created_at
   from public.issue_reports
   order by created_at desc
   limit 5;
   ```

5. If `RESEND_API_KEY` and `REPORT_TO_EMAIL` are set, check the inbox for the notification (still expect HTTP 201 / saved row even if mail fails).

**API-only smoke** (no device): from `trainee/projects/native_ai_keyboard`, run `./supabase/scripts/smoke-submit-issue-report.sh` (local `supabase start` or set `SUPABASE_FUNCTIONS_BASE` to `https://<ref>.supabase.co/functions/v1`).

### Setup

1. Create a Firebase project → add an **iOS** app with bundle ID **`com.nativeaikeyboard.host`** (and optionally register the keyboard extension app ID for the same project if you use a second plist later).
2. Download **`GoogleService-Info.plist`** and copy it to **`ios-keyboard/AIKeyboard/Resources/GoogleService-Info.plist`** (gitignored). See `ios-keyboard/GoogleService-Info.plist.example` for shape only — do not ship placeholder values.
3. In Firebase console enable **Crashlytics**, **Analytics**, and create a **Firestore** database (production mode, then deploy rules — see below).
4. **Authentication → Sign-in method → Anonymous:** set to **Enabled**. The host app calls `signInAnonymously()` before the first Firestore write so you can use `request.auth != null` rules without Apple Sign-In.
5. **Keyboard extension crashes:** add the **same** `GoogleService-Info.plist` to the **AIKeyboardKeyboard** target (Xcode → Build Phases → **Copy Bundle Resources**) so the file exists in the `.appex` bundle; otherwise extension-side `FirebaseApp.configure()` is skipped.
6. Regenerate Xcode: `cd ios-keyboard && xcodegen generate`.

The host app uses **Firebase Anonymous Auth** before writing device snapshots. **Copy the full rules from [ios/firestore.rules.example](firestore.rules.example)** into Firebase Console → Firestore → Rules → **Publish**. The file includes **`devices`** (sync). The top-level **`issue_reports`** rules are legacy if you still used older builds; new in-app reports use **Supabase** instead.

Tighten later with [App Check](https://firebase.google.com/docs/app-check) and/or Cloud Functions (Anonymous is convenient for development, not a fraud barrier).

### Checklist after `GoogleService-Info.plist` is in `AIKeyboard/Resources`

1. Xcode → **AIKeyboardKeyboard** target → **Build Phases** → **Copy Bundle Resources** → **+** → select the same `GoogleService-Info.plist`.
2. Firebase → **Firestore** → create database → **Rules** → paste [ios/firestore.rules.example](firestore.rules.example) → **Publish** (or test mode only for a quick try).
3. Firebase → **Authentication** → **Anonymous** → Enable.
4. Terminal: `cd ios-keyboard && xcodegen generate` → open `.xcodeproj` → **File → Packages → Resolve Package Versions** → build the **AIKeyboard** scheme.

### What else to log later (for product / stability)

Beyond crashes and `devices/*`: **screen views** (Analytics), **key flows** (e.g. `rewrite_success`, `rewrite_error` with anonymized error code), **API latency buckets**, **keyboard open/close**. Avoid PII in Analytics/Firestore (no raw message text).

### Optional: subscriptions later (outline)

If you add monetization later, typical patterns include **StoreKit 2** directly, **RevenueCat**, or server-backed entitlements. This repo’s MVP build does not ship a paywall.

## Supabase (keyboard + host)

The **host** `Info.plist` key **`SupabaseProjectURL`** (project root URL, no `/functions/v1`) is copied into the **App Group** on launch (`HostSupabaseConfigSync`) so the **keyboard extension** can call `register-device` / `transform` without duplicating the value in `KeyboardExtension/Info.plist`. The extension plist still includes the same key as a **fallback** before the first host launch.

### MVP checklist (hosted Supabase)

1. Set **`SupabaseProjectURL`** in [`AIKeyboard/Info.plist`](AIKeyboard/Info.plist) (and optionally [`KeyboardExtension/Info.plist`](KeyboardExtension/Info.plist)) to `https://<project-ref>.supabase.co` — the checked-in template may point at a demo ref; replace with your project before shipping.
2. **Open the host app** at least once so the URL is pushed to the App Group and `register-device` stores `deviceTransformToken` (the in-app “Connection / Refresh” control was removed; launch + background sync handles this).
3. Enable **Allow Full Access** for **AI Keyboard** under iOS Settings → Keyboard.

## Full Access

Users must enable **Allow Full Access** for the keyboard in iOS Settings so the extension can reach your API and the App Group.

## Local development

**Important:** On the **iOS Simulator**, `http://127.0.0.1` is the simulator itself, not your Mac. The API on your Mac must use your **Mac’s LAN IP** (e.g. `http://192.168.1.3:8787`). Default dev port is **8787** (not 8080) so another app on 8080 does not steal requests. Use the **root** URL only — do **not** append `/v1`.

From the repo root, use the helper script (starts the API, builds, installs, launches with the correct base URL):

```bash
./scripts/run-ios-demo.sh
```

Optional: `MAC_IP=192.168.x.x ./scripts/run-ios-demo.sh` if `en0` is wrong. For **Gemini rewrite** to work, set `GEMINI_API_KEY` in `server/.env` (Google AI Studio) and restart the API.

`NSAllowsLocalNetworking` is enabled in Info.plist for HTTP to your LAN.

### Dev: session bypass (keyboard tests without opening the host)

Both `Info.plist` files set `AIKeyboardDevSessionBypass` to **true** so the extension treats the session as valid and calls `/v1/rewrite` with `X-Device-Id` instead of a JWT. On the server, enable **`DEV_REWRITE_WITHOUT_JWT=true`** together with **`ENTITLEMENT_BYPASS=true`** in `server/.env`. Remove or set `AIKeyboardDevSessionBypass` to **false** before an App Store build.

Run the host app **once** after install so it writes `api_base_url_override` to the App Group (the script passes `AIKEYBOARD_API_BASE` on launch) and refreshes the **session JWT** for the keyboard extension — unless you rely entirely on the dev bypass above.

## After deleting the app (clean install)

1. App Group data is wiped — the keyboard will show **no session** until the host app runs again.
2. Open **AI Keyboard** (host) once so `aikeyboard://refresh` / App Group sync can apply, or launch via `./scripts/run-ios-demo.sh`.
3. From **Messages** with the keyboard visible: if you see the session hint, tap **Open app** / **Uygulama** on the keyboard — it opens `aikeyboard://refresh` and the host app syncs the device token / session into the App Group.
4. Return to the chat and use **Rewrite** (Supabase) again.

## Physical device

Set `AIKeyboardAPIBaseURL` in the host app’s `Info.plist` to your deployed API (`https://…`), not `127.0.0.1`. The keyboard reads the same key unless `api_base_url_override` was written by the host.
