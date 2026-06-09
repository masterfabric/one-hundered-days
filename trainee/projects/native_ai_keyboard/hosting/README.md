# Firebase Hosting — legal pages

Static **Privacy**, **Terms**, and **Support** pages for App Store Connect and the iOS app. No subscription or billing copy.

After deploy, your URLs look like:

- `https://<PROJECT_ID>.web.app/privacy/`
- `https://<PROJECT_ID>.web.app/terms/`
- `https://<PROJECT_ID>.web.app/support/`

(`https://<PROJECT_ID>.firebaseapp.com/...` works the same.)

## Before first deploy

1. **Replace contact email** in all HTML under `public/` if `support@masterfabric.com` is not correct (search for `support@masterfabric.com`).
2. **Create a Firebase project** at [Firebase Console](https://console.firebase.google.com/) (e.g. `native-ai-keyboard` or `masterfabric-native-ai-keyboard`).
3. **Optional:** In the same project, add an iOS app with bundle ID `com.masterfabric.nativeaikeyboard` and download `GoogleService-Info.plist` for Crashlytics (see [`../ios-keyboard/README.md`](../ios-keyboard/README.md)).

## One-time CLI setup

```bash
npm install -g firebase-tools   # or: npx firebase-tools@latest
firebase login
cd trainee/projects/native_ai_keyboard/hosting
cp .firebaserc.example .firebaserc
# Edit .firebaserc: set "default" to your Firebase project ID
firebase use --add                # if you prefer interactive project pick
```

`.firebaserc` is gitignored; each developer or CI uses their own copy.

## Deploy

```bash
cd trainee/projects/native_ai_keyboard/hosting
firebase deploy --only hosting
```

Open the printed **Hosting URL** and verify `/privacy/`, `/terms/`, and `/support/`.

## App Store Connect checklist

| Field | URL |
|-------|-----|
| Privacy Policy | `https://<PROJECT_ID>.web.app/privacy/` |
| Support URL | `https://<PROJECT_ID>.web.app/support/` |
| Terms (if asked) | `https://<PROJECT_ID>.web.app/terms/` |

## iOS app

Set **`LegalBaseURL`** in [`../ios-keyboard/AIKeyboard/Info.plist`](../ios-keyboard/AIKeyboard/Info.plist) to your deployed base (no trailing path), e.g. `https://<PROJECT_ID>.web.app`. The host app shows Privacy / Terms / Support links when this key is set.

## Custom domain (optional)

Firebase Console → Hosting → **Add custom domain** (e.g. `legal.example.com`). Update `LegalBaseURL` and any App Store URLs to match.

## Project layout

```
hosting/
  firebase.json
  public/
    index.html
    privacy/index.html
    terms/index.html
    support/index.html
    assets/legal.css
```
