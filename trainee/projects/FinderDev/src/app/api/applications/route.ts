import { NextRequest, NextResponse } from "next/server";
import { applyToProject } from "@/app/actions/applications";
import { createErrorResponse, HttpStatus } from "@/lib/utils/errors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await applyToProject(body);

    return NextResponse.json(result, { status: HttpStatus.CREATED });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    return NextResponse.json(errorResponse, {
      status: errorResponse.statusCode,
    });
  }
}

