import { supabaseAdmin, supabaseServer } from "@/lib/supabase/server";

type ProgressEventCode =
  | "project_created"
  | "request_sent"
  | "request_accepted_as_member"
  | "project_completed_as_owner"
  | "profile_completed";

const EVENT_XP: Record<ProgressEventCode, number> = {
  project_created: 40,
  request_sent: 20,
  request_accepted_as_member: 50,
  project_completed_as_owner: 120,
  profile_completed: 30,
};

const EVENT_ACHIEVEMENT_CODES: Record<ProgressEventCode, string[]> = {
  project_created: ["first_project_created"],
  request_sent: ["first_request_sent"],
  request_accepted_as_member: ["first_request_accepted"],
  project_completed_as_owner: ["first_project_completed"],
  profile_completed: ["profile_completed"],
};

const XP_PER_LEVEL = 100;

function db(client?: any) {
  return (supabaseAdmin || client || supabaseServer) as any;
}

export function recalculateLevel(xpTotal: number): number {
  if (!Number.isFinite(xpTotal) || xpTotal < 0) return 1;
  return Math.floor(xpTotal / XP_PER_LEVEL) + 1;
}

export async function awardAchievementIfEligible(
  userId: string,
  code: string,
  projectId?: string,
  meta: Record<string, unknown> = {},
  clientArg?: any
) {
  const client = db(clientArg);
  const { data: definition, error: definitionError } = await client
    .from("achievement_definitions")
    .select("id, code, is_repeatable")
    .eq("code", code)
    .maybeSingle();

  if (definitionError || !definition?.id) {
    return { success: false, skipped: true, reason: "definition_not_found" as const };
  }

  if (!definition.is_repeatable) {
    let query = client
      .from("user_achievements")
      .select("id")
      .eq("user_id", userId)
      .eq("achievement_id", definition.id);

    if (projectId) {
      query = query.eq("project_id", projectId);
    }

    const { data: existingRow } = await query.maybeSingle();
    if (existingRow?.id) {
      return { success: true, skipped: true, reason: "already_awarded" as const };
    }
  }

  const { error: insertError } = await client.from("user_achievements").insert({
    user_id: userId,
    achievement_id: definition.id,
    project_id: projectId || null,
    meta,
  });

  if (insertError) {
    return { success: false, skipped: false, reason: "insert_failed" as const, error: insertError.message };
  }

  return { success: true, skipped: false };
}

export async function evaluateProfileCompletedAchievement(userId: string, clientArg?: any) {
  const client = db(clientArg);
  const { data: profile } = await client
    .from("profiles")
    .select("full_name, bio, github_url, website_url, linkedin_url")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) return { awarded: false, reason: "profile_not_found" as const };

  const completedFields = [
    Boolean(profile.full_name?.trim()),
    Boolean(profile.bio?.trim()),
    Boolean(profile.github_url?.trim()),
    Boolean(profile.website_url?.trim() || profile.linkedin_url?.trim()),
  ].filter(Boolean).length;

  if (completedFields < 3) {
    return { awarded: false, reason: "not_enough_fields" as const };
  }

  const awardResult = await awardAchievementIfEligible(userId, "profile_completed", undefined, {}, client);
  return { awarded: !awardResult.skipped && awardResult.success, reason: "ok" as const };
}

export async function grantXpForEvent(params: {
  userId: string;
  eventCode: ProgressEventCode;
  sourceId?: string;
  projectId?: string;
  client?: any;
}) {
  const { userId, eventCode, sourceId = "", projectId, client: clientArg } = params;
  const client = db(clientArg);
  const xpDelta = EVENT_XP[eventCode] ?? 0;

  const { error: eventInsertError } = await client.from("progress_events").insert({
    user_id: userId,
    event_code: eventCode,
    xp_delta: xpDelta,
    project_id: projectId || null,
    source_id: sourceId || "",
  });

  // unique violation means event already processed (idempotent behavior)
  if (eventInsertError) {
    if (eventInsertError.code === "23505") {
      return { success: true, skipped: true, reason: "already_processed" as const };
    }
    return { success: false, skipped: false, reason: "event_insert_failed" as const, error: eventInsertError.message };
  }

  const { data: currentProgress } = await client
    .from("user_progress")
    .select("user_id, xp_total, level")
    .eq("user_id", userId)
    .maybeSingle();

  const currentXp = Number(currentProgress?.xp_total ?? 0);
  const nextXp = Math.max(0, currentXp + xpDelta);
  const nextLevel = recalculateLevel(nextXp);

  const { error: progressError } = await client.from("user_progress").upsert({
    user_id: userId,
    xp_total: nextXp,
    level: nextLevel,
    updated_at: new Date().toISOString(),
  });

  if (progressError) {
    return { success: false, skipped: false, reason: "progress_update_failed" as const, error: progressError.message };
  }

  for (const code of EVENT_ACHIEVEMENT_CODES[eventCode] || []) {
    await awardAchievementIfEligible(userId, code, projectId, {
      event_code: eventCode,
      source_id: sourceId,
    }, client);
  }

  if (eventCode === "profile_completed") {
    await evaluateProfileCompletedAchievement(userId, client);
  }

  return { success: true, skipped: false, xpDelta, nextXp, nextLevel };
}

