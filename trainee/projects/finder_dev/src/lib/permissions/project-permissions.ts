import { supabaseAdmin, supabaseServer } from "@/lib/supabase/server";

function db() {
  return (supabaseAdmin || supabaseServer) as any;
}

export async function canReviewRequests(userId: string, projectId: string): Promise<boolean> {
  const client = db();
  const { data: project } = await client
    .from("projects")
    .select("owner_id")
    .eq("id", projectId)
    .maybeSingle();

  if (project?.owner_id === userId) return true;

  const { data: member } = await client
    .from("project_members")
    .select("team_role, status")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .eq("status", "accepted")
    .maybeSingle();

  return member?.team_role === "co_leader";
}

export async function canManageMembers(userId: string, projectId: string): Promise<boolean> {
  const client = db();
  const { data: project } = await client
    .from("projects")
    .select("owner_id")
    .eq("id", projectId)
    .maybeSingle();

  if (project?.owner_id === userId) return true;

  const { data: member } = await client
    .from("project_members")
    .select("team_role, status")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .eq("status", "accepted")
    .maybeSingle();

  return member?.team_role === "co_leader";
}

