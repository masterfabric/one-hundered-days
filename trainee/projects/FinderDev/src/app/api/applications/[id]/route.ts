import { NextRequest, NextResponse } from "next/server";
import { updateApplicationStatus } from "@/app/actions/applications";
import { createErrorResponse, HttpStatus } from "@/lib/utils/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // This would need a getApplicationById action
    // For now, return not implemented
    return NextResponse.json(
      { error: "Not implemented" },
      { status: HttpStatus.NOT_FOUND }
    );
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    return NextResponse.json(errorResponse, {
      status: errorResponse.statusCode,
    });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = await updateApplicationStatus({
      ...body,
      applicationId: id,
    });

    return NextResponse.json(result, { status: HttpStatus.OK });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    return NextResponse.json(errorResponse, {
      status: errorResponse.statusCode,
    });
  }
}

