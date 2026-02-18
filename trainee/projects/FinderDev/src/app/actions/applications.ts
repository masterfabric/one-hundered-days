"use server";

import {
  createApplicationSchema,
  updateApplicationStatusSchema,
  type CreateApplicationInput,
  type UpdateApplicationStatusInput,
} from "@/lib/validations/applications";
import { AppError, ErrorMessages, HttpStatus } from "@/lib/utils/errors";
import { supabaseServer } from "@/lib/supabase/server";
/**
 * Apply to a project
 */
export async function applyToProject(input: CreateApplicationInput) {
  try {
    const validatedData = createApplicationSchema.parse(input);

    // TODO: Get authenticated user ID from session/auth
    // For now, using a placeholder - replace with actual auth
    const userId = "00000000-0000-0000-0000-000000000000"; // Replace with actual user ID

    const { data, error } = await (supabaseServer
      .from("project_members" as any) as any)
      .insert({
        project_id: validatedData.projectId,
        user_id: userId,
        role_title: validatedData.role,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      // Check for duplicate application
      if (error.code === "23505") {
        throw new AppError(
          "You have already applied to this project",
          HttpStatus.CONFLICT
        );
      }
      throw new AppError(
        `Failed to create application: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    return { success: true, data };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      `Failed to create application: ${error instanceof Error ? error.message : "Unknown error"}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * Update application status
 */
export async function updateApplicationStatus(input: UpdateApplicationStatusInput) {
  try {
    const validatedData = updateApplicationStatusSchema.parse(input);

    // Explicitly cast to any to avoid 'never' inference issues with localized Zod types vs DB types
    const updatePayload: any = {
      status: validatedData.status,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await (supabaseServer
      .from("project_members" as any) as any)
      .update(updatePayload)
      .eq("id", validatedData.applicationId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new AppError("Application not found", HttpStatus.NOT_FOUND);
      }
      throw new AppError(
        `Failed to update application: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    return { success: true, data };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      `Failed to update application: ${error instanceof Error ? error.message : "Unknown error"}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * Get applications by project ID
 */
export async function getApplicationsByProject(
  projectId: string,
  limit: number = 20,
  offset: number = 0
) {
  try {
    const { data, error, count } = await supabaseServer
      .from("project_members")
      .select("*", { count: "exact" })
      .eq("project_id", projectId)
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (error) {
      throw new AppError(
        `Failed to fetch applications: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    return {
      success: true,
      data: data || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      `Failed to fetch applications: ${error instanceof Error ? error.message : "Unknown error"}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * Get user's applications
 */
export async function getUserApplications(
  limit: number = 20,
  offset: number = 0,
  status?: string
) {
  try {
    // TODO: Get authenticated user ID from session/auth
    // For now, using a placeholder - replace with actual auth
    const userId = "00000000-0000-0000-0000-000000000000"; // Replace with actual user ID

    let queryBuilder = supabaseServer
      .from("project_members")
      .select("*", { count: "exact" })
      .eq("user_id", userId);

    if (status) {
      queryBuilder = queryBuilder.eq("status", status);
    }

    const { data, error, count } = await queryBuilder
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (error) {
      throw new AppError(
        `Failed to fetch applications: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    return {
      success: true,
      data: data || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      `Failed to fetch applications: ${error instanceof Error ? error.message : "Unknown error"}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
