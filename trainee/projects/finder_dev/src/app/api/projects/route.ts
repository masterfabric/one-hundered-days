import { NextRequest, NextResponse } from "next/server";
import { getProjects } from "@/app/actions/projects";
import { createProject } from "@/app/actions/projects";
import { createErrorResponse, HttpStatus } from "@/lib/utils/errors";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = {
      search: searchParams.get("search") || undefined,
      status: searchParams.get("status") || undefined,
      tech: searchParams.get("tech") || undefined,
      role: searchParams.get("role") || undefined,
      limit: searchParams.get("limit") || undefined,
      offset: searchParams.get("offset") || undefined,
    };

    const result = await getProjects(query);

    return NextResponse.json(result, { status: HttpStatus.OK });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    return NextResponse.json(errorResponse, {
      status: errorResponse.statusCode,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createProject(body);

    return NextResponse.json(result, { status: HttpStatus.CREATED });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    return NextResponse.json(errorResponse, {
      status: errorResponse.statusCode,
    });
  }
}

