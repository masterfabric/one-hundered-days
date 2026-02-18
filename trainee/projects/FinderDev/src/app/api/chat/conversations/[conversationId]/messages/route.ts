import { NextRequest, NextResponse } from "next/server";
import { sendMessage } from "@/app/actions/chat";
import { getMessages } from "@/app/actions/chat";
import { createErrorResponse, HttpStatus } from "@/lib/utils/errors";
import { parseNumber } from "@/lib/utils/helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseNumber(searchParams.get("limit") || undefined, 50);
    const offset = parseNumber(searchParams.get("offset") || undefined, 0);
    const before = searchParams.get("before") || undefined;

    const result = await getMessages(conversationId, limit, offset, before);

    return NextResponse.json(result, { status: HttpStatus.OK });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    return NextResponse.json(errorResponse, {
      status: errorResponse.statusCode,
    });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const body = await request.json();
    const result = await sendMessage({
      ...body,
      conversationId,
    });

    return NextResponse.json(result, { status: HttpStatus.CREATED });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    return NextResponse.json(errorResponse, {
      status: errorResponse.statusCode,
    });
  }
}

