import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { HttpStatus } from "@/lib/utils/errors";
import { grantXpForEvent } from "@/lib/growth/progress";

const createProjectRequestSchema = z.object({
  projectId: z.string().uuid(),
  message: z.string().trim().max(1000).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = createProjectRequestSchema.parse(body);

    const client = (await createSupabaseServerClient()) as any;
    const {
      data: { user },
      error: authError,
    } = await client.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: "You must be logged in to send a request." },
        { status: HttpStatus.UNAUTHORIZED }
      );
    }

    const { data: project, error: projectError } = await client
      .from("projects")
      .select("id, owner_id")
      .eq("id", payload.projectId)
      .maybeSingle();

    if (projectError) {
      return NextResponse.json(
        { success: false, message: "Could not load project for request." },
        { status: HttpStatus.INTERNAL_SERVER_ERROR }
      );
    }

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found." },
        { status: HttpStatus.NOT_FOUND }
      );
    }

    if (project.owner_id === user.id) {
      return NextResponse.json(
        { success: false, message: "You cannot request to join your own project." },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    const { data, error } = await client
      .from("project_requests")
      .upsert(
        {
          project_id: payload.projectId,
          requester_id: user.id,
          message: payload.message || null,
          status: "pending",
          reviewed_by: null,
          reviewed_at: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "project_id,requester_id" }
      )
      .select("id, project_id, requester_id, status, reviewed_by, reviewed_at, created_at, updated_at")
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, message: `Failed to create request: ${error.message}` },
        { status: HttpStatus.INTERNAL_SERVER_ERROR }
      );
    }

    if (data?.id) {
      const growthResult = await grantXpForEvent({
        userId: user.id,
        eventCode: "request_sent",
        sourceId: String(data.id),
        projectId: payload.projectId,
        client,
      });
      if (!growthResult.success) {
        console.error("[growth] request_sent event failed:", growthResult);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Join request sent.",
        data,
      },
      { status: HttpStatus.CREATED }
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
