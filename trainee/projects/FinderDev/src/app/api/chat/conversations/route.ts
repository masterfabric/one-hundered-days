import { NextRequest, NextResponse } from "next/server";
import { createConversation } from "@/app/actions/chat";
import { createErrorResponse, HttpStatus } from "@/lib/utils/errors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createConversation(body);

    return NextResponse.json(result, { status: HttpStatus.CREATED });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    return NextResponse.json(errorResponse, {
      status: errorResponse.statusCode,
    });
  }
}

