# Native AI Keyboard — implementation

This directory holds **app code** and the **Supabase** project (migrations, Edge Functions, optional seed/schemas). The Markdown plan lives in [`../docs/projects/native_ai_keyboard_plan/`](../docs/projects/native_ai_keyboard_plan/README.md).

| Path | Purpose |
|------|---------|
| [`supabase/`](./supabase/README.md) | CLI project: `migrations/`, `functions/`, optional `seed/`, `schemas/` |
| `android-keyboard/` | Kotlin IME (Days 04–07) when added |
| `ios-keyboard/` | Swift host + extension (Days 08–12) when added |
| [`examples/`](./examples/README.md) | Non-secret `.env.example` templates for local setup |

Do not commit real API keys or `GoogleService-Info.plist` (see `.gitignore`).
