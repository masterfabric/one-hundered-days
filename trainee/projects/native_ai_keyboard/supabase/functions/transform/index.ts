import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { buildRewriteSystemPrompt, wrapUserText } from "../_shared/rewritePrompt.ts";

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

const allowedActions = new Set(["rewrite"]);

async function verifyDeviceToken(
  authHeader: string | null,
): Promise<{ ok: true; deviceId: string } | { ok: false; status: number; code: string; message: string }> {
  const m = authHeader?.match(/^Bearer\s+(.+)$/i);
  const token = m?.[1]?.trim() ?? "";
  if (!token) {
    return { ok: false, status: 401, code: "UNAUTHORIZED", message: "Missing Bearer token" };
  }
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !key) {
    return { ok: false, status: 500, code: "SERVER_ERROR", message: "Missing Supabase env" };
  }
  const supabase = createClient(url, key);
  const { data, error } = await supabase.from("devices").select("device_id").eq("device_token", token).maybeSingle();
  if (error) {
    return { ok: false, status: 500, code: "SERVER_ERROR", message: error.message };
  }
  if (!data?.device_id) {
    return { ok: false, status: 401, code: "UNAUTHORIZED", message: "Invalid token" };
  }
  return { ok: true, deviceId: data.device_id };
}

async function callGemini(systemInstruction: string, userText: string): Promise<string> {
  const apiKey = Deno.env.get("GEMINI_API_KEY")?.trim();
  if (!apiKey) {
    throw Object.assign(new Error("GEMINI_API_KEY missing"), { code: "gemini_not_configured" });
  }
  const model = (Deno.env.get("GEMINI_MODEL") ?? "gemini-2.0-flash").trim();
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${
      encodeURIComponent(apiKey)
    }`;

  const body = {
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents: [{ role: "user", parts: [{ text: userText }] }],
    generationConfig: {
      temperature: 0.34,
      maxOutputTokens: 8192,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const raw = await res.text();
  if (!res.ok) {
    const err = Object.assign(new Error(`Gemini HTTP ${res.status}`), {
      code: res.status === 429 ? "gemini_rate_limited" : "gemini_upstream",
      detail: raw.slice(0, 500),
    });
    throw err;
  }

  let parsed: {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    promptFeedback?: { blockReason?: string };
  };
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw Object.assign(new Error("Invalid Gemini JSON"), { code: "gemini_upstream" });
  }

  const block = parsed.promptFeedback?.blockReason;
  if (block) {
    throw Object.assign(new Error(`blocked: ${block}`), { code: "gemini_bad_request" });
  }

  const text = parsed.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("")?.trim() ?? "";
  if (!text) {
    throw Object.assign(new Error("empty completion"), { code: "gemini_upstream" });
  }
  return text;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return json({ error: { code: "METHOD_NOT_ALLOWED", message: "POST only" } }, 405);
  }

  const t0 = performance.now();
  const auth = await verifyDeviceToken(req.headers.get("Authorization"));
  if (!auth.ok) {
    return json({ error: { code: auth.code, message: auth.message } }, auth.status);
  }

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const text = typeof body?.text === "string" ? body.text : "";
    const action = typeof body?.action === "string" ? body.action : "";
    const mode = typeof body?.mode === "string" ? body.mode : "work";
    const locale = typeof body?.locale === "string" ? body.locale : "tr";
    const theme = typeof body?.theme === "string" ? body.theme : "system";
    const style = typeof body?.style === "string" ? body.style : "formal";
    const deviceLocales = typeof body?.deviceLocales === "string" ? body.deviceLocales : "";

    if (!text.trim()) {
      return json({ error: { code: "INVALID_INPUT", message: "text required" } }, 400);
    }
    if (text.length > 4000) {
      return json({ error: { code: "INVALID_INPUT", message: "text too long" } }, 400);
    }
    if (!allowedActions.has(action)) {
      return json({
        error: { code: "INVALID_INPUT", message: "Only action=rewrite is enabled in this MVP" },
      }, 400);
    }

    const system = buildRewriteSystemPrompt(style);
    const userBlock = wrapUserText(text, deviceLocales, locale);

    const result = await callGemini(system, userBlock);
    const latencyMs = Math.round(performance.now() - t0);

    return json({
      result,
      mode,
      action,
      locale,
      theme,
      tokensUsed: 0,
      latencyMs,
    });
  } catch (e) {
    const err = e as { code?: string; message?: string; detail?: string };
    const code = err.code ?? "gemini_upstream";
    const status = code === "gemini_rate_limited" ? 429 : code === "gemini_not_configured" ? 502 : 502;
    return json({
      error: {
        code,
        message: err.message ?? String(e),
        detail: err.detail,
      },
    }, status);
  }
});
