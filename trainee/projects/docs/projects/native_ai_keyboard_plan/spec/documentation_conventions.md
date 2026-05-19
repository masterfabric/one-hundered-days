# Documentation conventions

## Wording

- Prefer **positive statements** of what the stack *is* (e.g. “MVP backend is Supabase Edge Functions and Postgres”) instead of repeated comparisons to other frameworks.
- Avoid parenthetical negatives in headings and tables where they may confuse parsers or readers (e.g. “(no X)”); use a short **Scope** or **Out of scope** bullet instead.

## Naming (files, assets, code)

- Use **English** for repository paths, file names, asset names, and code identifiers so the project stays approachable for international contributors.
- User-facing **UI strings** may stay locale-specific (e.g. Turkish and English in app resources); that rule applies to **repository and code symbols**, not to end-user copy.

## Markdown

- Use consistent `##` / `###` heading levels within each spec file.
- Prefer fenced code blocks with a language tag (` ```text `, ` ```mermaid `, ` ```sql `).
