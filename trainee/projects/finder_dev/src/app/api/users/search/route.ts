import { NextRequest, NextResponse } from "next/server";
import { searchUsers } from "@/app/actions/users";
import { createErrorResponse, HttpStatus } from "@/lib/utils/errors";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = {
      search: searchParams.get("search") || undefined,
      limit: searchParams.get("limit") || undefined,
      offset: searchParams.get("offset") || undefined,
    };

    const result = await searchUsers(query);

    return NextResponse.json(result, { status: HttpStatus.OK });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    return NextResponse.json(errorResponse, {
      status: errorResponse.statusCode,
    });
  }
}

