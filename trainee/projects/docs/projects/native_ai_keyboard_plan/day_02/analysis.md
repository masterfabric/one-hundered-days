# Day 02 Analysis: Gemini + Prompt Templates in Edge Functions

## Objective

From an **Edge Function** (`transform` dev branch or separate `gemini-smoke`), call **Google Gemini** using **`GEMINI_API_KEY`** from **Supabase Secrets**. Implement **prompt template map** (`mode`, `action`, `locale`, optional `theme`) as shared TypeScript under `supabase/functions/_shared/`.

## Architecture & Packages

- **Runtime:** Deno inside Supabase Edge Functions (Supabase-managed TypeScript runtime).
- **Shared:** `_shared/prompts.ts` — all TR/EN combinations; theme-aware wording where needed.

### Backend Endpoints

- **Internal:** Gemini HTTP from Edge only.
- **Optional:** dev-only route to print resolved system prompt (never in production).

## Tasks

1. Add Secret `GEMINI_API_KEY` in Supabase; read via `Deno.env.get` in function.
2. Implement `generate(systemPrompt, userText)` with timeout + single retry.
3. Cover MVP **mode × action × locale** matrix; export builder function.
4. Unit-test locally with `supabase functions serve` + curl (or Deno test if used).
5. Document model id (e.g. flash) in `supabase/README` or root README.

## UI / Client Focus

- None.

## Checklist

- [ ] Gemini succeeds from Edge with test prompt
- [ ] All MVP template keys return non-empty system strings
- [ ] Secret never logged or returned to client

## Related

- [spec/architecture.md](../spec/architecture.md) · [spec/overview.md](../spec/overview.md)
