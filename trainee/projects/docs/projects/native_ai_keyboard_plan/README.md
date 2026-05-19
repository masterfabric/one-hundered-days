# Native AI Keyboard — Project Plan

AI-powered **custom keyboard** for Android and iOS: users fix, shorten, expand, or rewrite text **where they type**, with tone controlled by **modes** (Work, Friends, Family, Flirt). All **Gemini** calls go through **Supabase Edge Functions**; the **Gemini API key** lives only in **Supabase Secrets** (never on device).

**Schedule:** **7 days** Android + shared backend, then **7 days** iOS, then shared QA and ship. Details: [spec/roadmap.md](./spec/roadmap.md).

---

## Purpose

- Remove constant **app switching** to paste text into separate AI apps.
- Apply **consistent** tone and actions from the keyboard row (Correct · Rewrite · Shorten · Expand).
- Keep **privacy and keys** on the server; clients send only text + mode + action + locale (and optional theme for prompt shaping).

---

## Architecture (summary)

```mermaid
flowchart LR
  subgraph clients [Clients]
    A[Android IME Kotlin]
    I[iOS Extension Swift]
  end
  B[Supabase Edge Functions]
  G[Gemini API]
  A --> B
  I --> B
  B --> G
```

- **Clients:** Native IME only (no Flutter for the keyboard UI).
- **Backend:** Supabase **Edge Functions** — validate → optional Postgres usage cap → build prompt (mode × action × locale × theme) → Gemini → post-process → JSON.
- **Data:** **Supabase Postgres** (`devices`, optional settings/usage). **Rate limit:** local debounce on keyboard + optional daily counter in Postgres. See [spec/architecture.md](./spec/architecture.md).

---

## Technology stack

| Layer | Technology |
|-------|------------|
| Android keyboard | Kotlin, `InputMethodService`, Material |
| iOS keyboard | Swift, Keyboard Extension, URLSession |
| Backend | Supabase Edge Functions (TypeScript / Deno), HTTPS |
| AI | Google Gemini (e.g. flash model) |
| Database | Supabase (PostgreSQL) |
| Secrets | Supabase Edge Secrets (`GEMINI_API_KEY`) |
| Rate limit | Local client debounce + optional Postgres daily caps |
| Deploy | Supabase CLI / hosted Supabase project |

---

## MVP features

| Area | Feature |
|------|---------|
| **Actions** | Correct, Rewrite, Shorten, Expand |
| **Modes** | Work, Friends, Family, Flirt (prompt templates differ) |
| **Locales** | Turkish and English for UI copy and model instructions |
| **Themes** | Light and dark keyboard chrome; prompt may include theme-aware tone hints |
| **Typing** | QWERTY baseline; **long-press** alternate characters (e.g. i → ı) where platform allows |
| **AI result** | **Preview** with **Accept** / **Cancel** before replacing host field text |
| **Backend** | Device registration (`deviceId`), Bearer `deviceToken`, `transform` Edge Function; local + optional server usage caps |
| **Compliance** | HTTPS, minimal logging, clear iOS Full Access disclosure |

Out of scope for MVP: user-defined free-form prompts, offline on-device LLM, desktop keyboards. See [spec/overview.md](./spec/overview.md).

---

## Specification (deep dive)

| Document | Description |
|----------|-------------|
| [spec/overview.md](./spec/overview.md) | Full problem/solution, goals, risks |
| [spec/architecture.md](./spec/architecture.md) | Modules, pipeline, DB, deployment |
| [spec/api_endpoints.md](./spec/api_endpoints.md) | REST contract |
| [spec/ui_design.md](./spec/ui_design.md) | Layout zones, mockups |
| [spec/roadmap.md](./spec/roadmap.md) | 14-day breakdown (7 Android+backend, 7 iOS) |
| [spec/documentation_conventions.md](./spec/documentation_conventions.md) | Naming (English repo paths), Markdown tone |
| [spec/toolchain_versions.md](./spec/toolchain_versions.md) | SDK / CLI versions for reproducible builds |
| [spec/supabase_repo_layout.md](./spec/supabase_repo_layout.md) | `supabase/` migrations, seed, functions |

---

## Daily analysis (what each day delivers)

| Day | Analysis |
|-----|----------|
| [Day 01](./day_01/analysis.md) | Repo, plan docs, Supabase scaffold, `devices` migration, Edge stub |
| [Day 02](./day_02/analysis.md) | Gemini from Edge Function + shared prompt templates |
| [Day 03](./day_03/analysis.md) | `register-device` + `transform`; Bearer; optional Postgres usage cap |
| [Day 04](./day_04/analysis.md) | Android IME skeleton + QWERTY |
| [Day 05](./day_05/analysis.md) | Android AI bar + API wiring |
| [Day 06](./day_06/analysis.md) | Android modes, themes, long-press |
| [Day 07](./day_07/analysis.md) | Android replace, preview, smoke QA |
| [Day 08](./day_08/analysis.md) | iOS extension skeleton |
| [Day 09](./day_09/analysis.md) | iOS layout parity |
| [Day 10](./day_10/analysis.md) | iOS AI bar + API |
| [Day 11](./day_11/analysis.md) | iOS modes, themes, long-press |
| [Day 12](./day_12/analysis.md) | iOS replace + preview |
| [Day 13](./day_13/analysis.md) | Settings persistence + cross QA |
| [Day 14](./day_14/analysis.md) | Delivery, demo, doc freeze |

---

## Assets

- [keyboard_default_light.png](./assets/mockups/keyboard_default_light.png) — reference keyboard mockup (light theme)

---

## Application code (implementation root)

```
trainee/projects/native_ai_keyboard/
├── supabase/
│   ├── migrations/     # SQL migrations
│   ├── seed/           # optional local seed data
│   ├── schemas/        # optional DDL notes for tooling
│   └── functions/      # Edge Functions (register-device, transform, …)
├── android-keyboard/
└── ios-keyboard/
```

Cross-cutting work (settings, final QA, ship) in Days 13–14 spans backend + both clients as needed.
