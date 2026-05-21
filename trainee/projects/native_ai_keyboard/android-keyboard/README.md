# Android keyboard (Days 04–07)

Kotlin **InputMethodService** MVP: QWERTY row, **AI action bar**, long-press alternates (e.g. **i** → **ı**) to match [spec/ui_design.md](../../docs/projects/native_ai_keyboard_plan/spec/ui_design.md) and iOS behavior in `../ios-keyboard/`.

There is no Android implementation in `personal-ai-keyboard/` yet; scaffold the Gradle module here when you start Day 04.

**Networking:** `POST …/functions/v1/transform` and optional `register-device` per [spec/api_endpoints.md](../../docs/projects/native_ai_keyboard_plan/spec/api_endpoints.md).
