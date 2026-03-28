import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { HttpStatus } from "@/lib/utils/errors";
import { evaluateProfileCompletedAchievement, grantXpForEvent } from "@/lib/growth/progress";

export async function POST() {
  try {
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

    const result = await evaluateProfileCompletedAchievement(user.id, client);
    if (result.awarded) {
      await grantXpForEvent({
        userId: user.id,
        eventCode: "profile_completed",
        sourceId: `profile:${user.id}`,
        client,
      });
    }

    return NextResponse.json(
      { success: true, awarded: result.awarded },
      { status: HttpStatus.OK }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json(
      { success: false, message },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}

