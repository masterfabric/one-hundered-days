import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { HttpStatus } from "@/lib/utils/errors";
import { grantXpForEvent } from "@/lib/growth/progress";
import { canReviewRequests } from "@/lib/permissions/project-permissions";

const reviewSchema = z.object({
  status: z.enum(["accepted", "rejected"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const payload = reviewSchema.parse(body);

    const client = (await createSupabaseServerClient()) as any;
    const {
      data: { user },
      error: authError,
    } = await client.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: "You must be logged in." },
        { status: HttpStatus.UNAUTHORIZED }
      );
    }

    const { data: requestRow, error: requestError } = await client
      .from("project_requests")
      .select("id, project_id, status")
      .eq("id", id)
      .maybeSingle();

    if (requestError) {
      return NextResponse.json(
        { success: false, message: "Failed to load request." },
        { status: HttpStatus.INTERNAL_SERVER_ERROR }
      );
    }

    if (!requestRow) {
      return NextResponse.json(
        { success: false, message: "Request not found." },
        { status: HttpStatus.NOT_FOUND }
      );
    }

    const { data: projectRow, error: projectError } = await client
      .from("projects")
      .select("id, owner_id")
      .eq("id", requestRow.project_id)
      .maybeSingle();

    if (projectError) {
      return NextResponse.json(
        { success: false, message: "Failed to validate project owner." },
        { status: HttpStatus.INTERNAL_SERVER_ERROR }
      );
    }

    const permitted = projectRow?.id
      ? await canReviewRequests(user.id, projectRow.id)
      : false;
    if (!projectRow || !permitted) {
      return NextResponse.json(
        { success: false, message: "Only project owner or co-leader can review requests." },
        { status: HttpStatus.FORBIDDEN }
      );
    }

    const { data: updatedRow, error: updateError } = await client
      .from("project_requests")
      .update({
        status: payload.status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, project_id, requester_id, status, reviewed_by, reviewed_at, updated_at")
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, message: `Failed to update request: ${updateError.message}` },
        { status: HttpStatus.INTERNAL_SERVER_ERROR }
      );
    }

    // On accept, ensure requester is added to project_members as accepted.
    if (payload.status === "accepted") {
      const { data: existingMember, error: memberLookupError } = await client
        .from("project_members")
        .select("id, status")
        .eq("project_id", requestRow.project_id)
        .eq("user_id", updatedRow.requester_id)
        .maybeSingle();

      if (memberLookupError) {
        return NextResponse.json(
          { success: false, message: `Failed to verify project membership: ${memberLookupError.message}` },
          { status: HttpStatus.INTERNAL_SERVER_ERROR }
        );
      }

      if (existingMember) {
        const { error: memberUpdateError } = await client
          .from("project_members")
          .update({
            status: "accepted",
            team_role: "member",
            granted_by: user.id,
            granted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingMember.id);

        if (memberUpdateError) {
          return NextResponse.json(
            { success: false, message: `Failed to activate membership: ${memberUpdateError.message}` },
            { status: HttpStatus.INTERNAL_SERVER_ERROR }
          );
        }
      } else {
        const { error: memberInsertError } = await client.from("project_members").insert({
          project_id: requestRow.project_id,
          user_id: updatedRow.requester_id,
          role_title: "Contributor",
          status: "accepted",
          team_role: "member",
          granted_by: user.id,
          granted_at: new Date().toISOString(),
        });

        if (memberInsertError) {
          return NextResponse.json(
            { success: false, message: `Failed to create membership: ${memberInsertError.message}` },
            { status: HttpStatus.INTERNAL_SERVER_ERROR }
          );
        }
      }

      const growthResult = await grantXpForEvent({
        userId: updatedRow.requester_id,
        eventCode: "request_accepted_as_member",
        sourceId: String(requestRow.id),
        projectId: String(requestRow.project_id),
        client,
      });
      if (!growthResult.success) {
        console.error("[growth] request_accepted_as_member event failed:", growthResult);
      }
    }

    return NextResponse.json(
      { success: true, message: "Request updated.", data: updatedRow },
      { status: HttpStatus.OK }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid request payload.", details: error.flatten() },
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
