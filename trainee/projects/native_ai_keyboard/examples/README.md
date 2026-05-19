# Example environment files

Copy to a **local** path ignored by git (e.g. `supabase/.env.local`) before running `supabase functions serve`.

| File | Purpose |
|------|---------|
| [supabase.env.example](./supabase.env.example) | Variable names for hosted + local Supabase |
| [supabase.env.local.example](./supabase.env.local.example) | Local-only values for `supabase functions serve` |

Never commit files containing `GEMINI_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY`.
