import { NextRequest, NextResponse } from "next/server";
import { getUserProfile } from "@/app/actions/users";
import { updateUserProfile } from "@/app/actions/users";
import { createErrorResponse, HttpStatus } from "@/lib/utils/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await getUserProfile(id);

    return NextResponse.json(result, { status: HttpStatus.OK });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    return NextResponse.json(errorResponse, {
      status: errorResponse.statusCode,
    });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // TODO: Implement authentication check here
    // Users can only update their own profile
    
    const body = await request.json();
    const result = await updateUserProfile({ ...body, id });

    return NextResponse.json(result, { status: HttpStatus.OK });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    return NextResponse.json(errorResponse, {
      status: errorResponse.statusCode,
    });
  }
}

