# Day 03 Analysis: `register-device` + `transform` Edge Functions

## Objective

Ship **`register-device`**: accept stable **`deviceId`** from keyboard, insert/update **Supabase Postgres** `devices` row, return opaque **`deviceToken`** (Bearer). Ship **`transform`**: validate body, verify Bearer, optional **Postgres daily usage** increment / cap, call Day 02 prompt + Gemini, return JSON per [spec/api_endpoints.md](../spec/api_endpoints.md).

**Rate limit:** optional **server** cap via Postgres; **client** debounce documented for Android/iOS (Day 05+).

## Architecture & Packages

- **Edge Functions:** `register-device`, `transform`.
- **Postgres:** `devices`, optional `usage_daily(device_id, day, transform_count)`.
- **Auth:** MVP opaque token stored with device; validate on each `transform`.

### Backend Endpoints

- **New:** `POST /functions/v1/register-device`, `POST /functions/v1/transform` (logical names per spec).

## Tasks

1. DTO validation + max body size in `transform`.
2. Wire `transform` → shared prompts → Gemini client.
3. Map Gemini failures to `502` / `504`; validation to `400` per API doc.
4. Optional: `usage_daily` upsert + `429` when over soft cap (e.g. 50/day/device).
5. curl / Postman collection for both endpoints; document Supabase URL in `README`.

## UI / Client Focus

- None (Android wires on Day 05).

## Checklist

- [ ] Register returns token; same token works on transform
- [ ] Invalid body → 400
- [ ] Optional 429 path tested if implemented
- [ ] No Gemini key in client or public tables

## Related

- [spec/api_endpoints.md](../spec/api_endpoints.md) · [spec/architecture.md](../spec/architecture.md)
