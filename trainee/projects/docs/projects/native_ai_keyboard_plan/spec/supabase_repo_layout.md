# Supabase repository layout (implementation)

The implementation root includes a first-class **`supabase/`** directory (similar in spirit to community projects such as [recipio/supabase](https://github.com/NurhayatYurtaslan/recipio/tree/main/supabase)) so migrations, seeds, and Edge Functions stay versioned next to app code.

Expected layout under [`trainee/projects/native_ai_keyboard/supabase/`](../../../../native_ai_keyboard/supabase/README.md):

```text
supabase/
├── config.toml              # CLI + function options (e.g. verify_jwt per function)
├── migrations/              # Versioned SQL (source of truth for tables and RLS)
├── seed/                    # Optional reference data for local dev / tests
├── schemas/                 # Optional: documented DDL snippets or views for tooling
└── functions/               # Edge Functions (Deno / TypeScript)
    ├── register-device/
    ├── transform/
    └── _shared/             # Shared modules (prompts, helpers)
```

- **`migrations/`** — apply with `supabase db push` (linked project) or `supabase db reset` (local).
- **`seed/`** — optional; use for non-production fixtures (never secrets).
- **`schemas/`** — optional; useful for human and AI-assisted reviews of table shape without opening every migration.
- **`functions/`** — deploy with `supabase functions deploy <name>`.

Example environment templates for contributors live under [`trainee/projects/native_ai_keyboard/examples/`](../../../../native_ai_keyboard/examples/README.md).
