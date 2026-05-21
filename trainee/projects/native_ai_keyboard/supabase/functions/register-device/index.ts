import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: { code: "METHOD_NOT_ALLOWED", message: "POST only" } }, 405);

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const deviceId = String(body?.deviceId ?? "").trim();
    const platform = String(body?.platform ?? "ios").trim() || "ios";
    const locale = typeof body?.locale === "string" ? body.locale.trim() : null;

    if (!deviceId || deviceId.length > 256) {
      return json({ error: { code: "INVALID_INPUT", message: "deviceId required" } }, 400);
    }

    const url = Deno.env.get("SUPABASE_URL") ?? "";
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!url || !key) {
      return json({ error: { code: "SERVER_ERROR", message: "Missing Supabase env" } }, 500);
    }

    const supabase = createClient(url, key);
    const { data: row, error: selErr } = await supabase
      .from("devices")
      .select("device_token")
      .eq("device_id", deviceId)
      .maybeSingle();

    if (selErr) {
      return json({ error: { code: "SERVER_ERROR", message: selErr.message } }, 500);
    }

    if (row?.device_token) {
      if (locale) {
        await supabase.from("devices").update({
          locale,
          updated_at: new Date().toISOString(),
        }).eq("device_id", deviceId);
      }
      return json({ deviceId, deviceToken: row.device_token, expiresAt: null }, 201);
    }

    const deviceToken = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
    const { error: insErr } = await supabase.from("devices").insert({
      device_id: deviceId,
      platform,
      device_token: deviceToken,
      locale,
    });

    if (insErr) {
      return json({ error: { code: "SERVER_ERROR", message: insErr.message } }, 500);
    }
    return json({ deviceId, deviceToken, expiresAt: null }, 201);
  } catch (e) {
    return json({ error: { code: "SERVER_ERROR", message: String(e) } }, 500);
  }
});
