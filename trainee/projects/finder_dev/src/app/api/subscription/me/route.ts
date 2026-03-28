import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { HttpStatus } from "@/lib/utils/errors";
import { getUserFeatureGates } from "@/lib/premium/feature-gates";

export async function GET() {
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

    const data = await getUserFeatureGates(user.id);
    return NextResponse.json({ success: true, data }, { status: HttpStatus.OK });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json(
      { success: false, message },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}

