# Open issues (native_ai_keyboard)

Known items that are not closed yet. Update or remove an entry when resolved.

---

## 1. Issue reports: Resend email not delivered (DB row is created)

**Status:** Open — `issue_reports` rows insert successfully; `mailSent` / `mailDetail` in the Edge response or Resend delivery is still unclear.

**Likely causes (checklist):**

- Supabase **Edge secrets:** are `RESEND_API_KEY` and `REPORT_TO_EMAIL` set? (`supabase secrets list`)
- With **`onboarding@resend.dev`** (default `RESEND_FROM`), Resend often delivers only to the **email used to sign up for Resend**; if `REPORT_TO_EMAIL` differs, the inbox may stay empty.
- Durable fix: **verify a domain** in Resend and set **`RESEND_FROM`** to an address on that domain.
- Check spam / Promotions; Resend **Dashboard → Emails / Logs**.

**Technical references:**

- Edge: [`supabase/functions/submit-issue-report/index.ts`](../supabase/functions/submit-issue-report/index.ts) — `mailDetail`, `console.log` / `console.warn` logs.
- Docs: [`supabase/functions/README.md`](../supabase/functions/README.md) (secrets + troubleshooting).

**Optional follow-ups:**

- [ ] Set `REPORT_TO_EMAIL` to the Resend account email and submit another report.
- [ ] Verify domain + `RESEND_FROM` end to end.
- [ ] Optionally surface a short in-app hint when HTTP 201 succeeds but `mailSent` is false (today only DB persistence is guaranteed).

---

## Adding a new entry

Use a short title, status (Open / Watching), observed behavior, relevant file paths, and a small checklist.
