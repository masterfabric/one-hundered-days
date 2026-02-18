import { NextRequest, NextResponse } from "next/server";
import { getUserApplications } from "@/app/actions/applications";
import { createErrorResponse, HttpStatus } from "@/lib/utils/errors";
import { parseNumber } from "@/lib/utils/helpers";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseNumber(searchParams.get("limit") || undefined, 20);
    const offset = parseNumber(searchParams.get("offset") || undefined, 0);
    const status = searchParams.get("status") || undefined;

    const result = await getUserApplications(limit, offset, status);

    return NextResponse.json(result, { status: HttpStatus.OK });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    return NextResponse.json(errorResponse, {
      status: errorResponse.statusCode,
    });
  }
}

