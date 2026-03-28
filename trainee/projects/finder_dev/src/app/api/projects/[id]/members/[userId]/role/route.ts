import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { HttpStatus } from "@/lib/utils/errors";
import { canManageMembers } from "@/lib/permissions/project-permissions";

const roleSchema = z.object({
  teamRole: z.enum(["leader", "co_leader", "member"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id: projectId, userId: memberUserId } = await params;
    const body = await request.json();
    const payload = roleSchema.parse(body);

    const client = (await createSupabaseServerClient()) as any;
    const {
      data: { user },
      error: authError,
    } = await client.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: HttpStatus.UNAUTHORIZED }
      );
    }

    const permitted = await canManageMembers(user.id, projectId);
    if (!permitted) {
      return NextResponse.json(
        { success: false, message: "Only owner or co-leader can manage member roles." },
        { status: HttpStatus.FORBIDDEN }
      );
    }

    const { data: projectRow } = await client
      .from("projects")
      .select("owner_id")
      .eq("id", projectId)
      .maybeSingle();

    if (projectRow?.owner_id === memberUserId) {
      return NextResponse.json(
        { success: false, message: "Owner role is implicit and cannot be reassigned." },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    const { data: memberRow, error: memberLookupError } = await client
      .from("project_members")
      .select("id, status")
      .eq("project_id", projectId)
      .eq("user_id", memberUserId)
      .maybeSingle();

    if (memberLookupError) {
      return NextResponse.json(
        { success: false, message: `Failed to locate member: ${memberLookupError.message}` },
        { status: HttpStatus.INTERNAL_SERVER_ERROR }
      );
    }

    if (!memberRow?.id) {
      return NextResponse.json(
        { success: false, message: "Member not found for this project." },
        { status: HttpStatus.NOT_FOUND }
      );
    }

    const { data: updated, error: updateError } = await client
      .from("project_members")
      .update({
        team_role: payload.teamRole,
        granted_by: user.id,
        granted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", memberRow.id)
      .select("id, project_id, user_id, team_role, status")
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, message: `Role update failed: ${updateError.message}` },
        { status: HttpStatus.INTERNAL_SERVER_ERROR }
      );
    }

    return NextResponse.json(
      { success: true, message: "Member role updated.", data: updated },
      { status: HttpStatus.OK }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid payload", details: error.flatten() },
        { status: HttpStatus.BAD_REQUEST }
      );
    }
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json(
      { success: false, message },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}

