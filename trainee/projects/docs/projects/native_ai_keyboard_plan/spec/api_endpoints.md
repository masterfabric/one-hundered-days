# Native AI Keyboard — API Endpoints

HTTP contract for MVP. **Implementation:** Supabase **Edge Functions** (TypeScript on Deno, hosted by Supabase). Base URL pattern:

```text
https://<PROJECT_REF>.supabase.co/functions/v1/<function-name>
```

Example: `https://abcdefghij.supabase.co/functions/v1/transform`

> Paths below are **logical** names; map each to one Edge Function with the same name (or a single router function — document the chosen mapping in the repo `README`).

## Authentication

MVP: `Authorization: Bearer <device_token>` where `device_token` is returned from **register-device** and stored securely on the keyboard (Android Keystore / iOS Keychain optional later).

```
Authorization: Bearer <device_token>
```

## 1. Health (optional)

| Method | Logical path | Description |
| :--- | :--- | :--- |
| `GET` | `/health` or `functions/v1/health` | Liveness check |

**Response 200:**

```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

## 2. Device registration

| Method | Logical path | Description |
| :--- | :--- | :--- |
| `POST` | `/device/register` → `functions/v1/register-device` | Register **deviceId** + platform; persist row for analytics |

**Request:**

```json
{
  "deviceId": "550e8400-e29b-41d4-a716-446655440000",
  "platform": "android",
  "locale": "tr"
}
```

| Field | Type | Required |
|-------|------|----------|
| `deviceId` | string (UUID) | yes — stable id generated once on device |
| `platform` | string | yes — `android` \| `ios` |
| `locale` | string | no |

**Response 201:**

```json
{
  "deviceId": "550e8400-e29b-41d4-a716-446655440000",
  "deviceToken": "opaque-secret-token",
  "expiresAt": null
}
```

Server stores `device_id` + `platform` in **Supabase Postgres** `devices` table; returns opaque `deviceToken` for subsequent calls.

## 3. Transform (core)

| Method | Logical path | Description |
| :--- | :--- | :--- |
| `POST` | `/transform` → `functions/v1/transform` | AI transform via Gemini (server-side only) |

**Request:**

```json
{
  "text": "merhaba yarın toplantı var mısın müsait",
  "mode": "work",
  "action": "correct",
  "locale": "tr",
  "theme": "light"
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `text` | string | yes | 1–4000 characters |
| `mode` | string | yes | `work`, `friends`, `family`, `flirt` |
| `action` | string | yes | `correct`, `rewrite`, `shorten`, `expand` |
| `locale` | string | no | `tr`, `en` (default: `tr`) |
| `theme` | string | no | `light`, `dark`, `system` — affects prompt tone hints |

**Response 200:**

```json
{
  "result": "Merhaba, yarın toplantı için müsait misiniz?",
  "mode": "work",
  "action": "correct",
  "locale": "tr",
  "tokensUsed": 128,
  "latencyMs": 840
}
```

**Errors:**

| HTTP | Code | Description |
|------|------|-------------|
| 400 | `INVALID_INPUT` | Missing or invalid field |
| 401 | `UNAUTHORIZED` | Invalid token |
| 429 | `RATE_LIMIT_EXCEEDED` | Server soft cap (Postgres) or policy |
| 502 | `AI_UNAVAILABLE` | Gemini error |
| 504 | `AI_TIMEOUT` | Request timeout |

## 4. Modes & Actions (metadata)

Can be **static in app** (bundled JSON) for MVP, or served by a read-only Edge Function / storage bucket. No secret required.

## 5. Settings

MVP options:

- **Device-only:** `GET/PUT` not on server; keyboard uses local prefs (already in plan).
- **Server sync:** optional Edge Function `settings` reading/writing `device_settings` in Postgres — same Bearer token.

## 6. Prompt preview (development only)

Edge Function `prompts-preview` behind auth; **disabled in production** (deploy flag or omit function).

## Rate limiting

- **Client:** local debounce / min interval between transform calls (not bypass-proof).
- **Server (recommended):** Edge Function checks optional `usage_daily` before Gemini; response headers optional: `X-RateLimit-Remaining`, `X-RateLimit-Reset`.
