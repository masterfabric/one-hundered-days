# Edge Functions

Implement handlers here, for example:

- `register-device/` — device registration; returns opaque `deviceToken`
- `transform/` — Gemini transform; requires `Authorization: Bearer <deviceToken>`

Deploy:

```bash
supabase functions deploy register-device
supabase functions deploy transform
```

Shared modules can live under `_shared/`.
