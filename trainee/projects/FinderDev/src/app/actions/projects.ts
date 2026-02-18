"use server";

import {
  createProjectSchema,
  updateProjectSchema,
  type CreateProjectInput,
  type UpdateProjectInput,
} from "@/lib/validations/projects";
import { AppError, ErrorMessages, HttpStatus } from "@/lib/utils/errors";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Define types for the raw Supabase response to fix "never" type errors
interface ProjectTechnology {
  technology: {
    id: number;
    name: string;
    category: string;
  };
}

interface ProjectMember {
  id: string;
  status: string;
}

interface ProjectOwner {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface FeaturedProjectResponse {
  id: string;
  title: string;
  description: string | null;
  status: string;
  repo_url: string | null;
  demo_url: string | null;
  created_at: string;
  owner: ProjectOwner;
  project_technologies: ProjectTechnology[];
  project_members: ProjectMember[];
}

/**
 * Get featured projects for homepage
 */
export async function getFeaturedProjects(limit: number = 4) {
  try {
    // Admin client kullan (RLS'yi bypass eder) - Anasayfa verileri public olmalı
    const client = supabaseAdmin || supabaseServer;

    const { data: rawData, error } = await client
      .from("projects")
      .select(`
        *,
        owner:profiles!projects_owner_id_fkey (
          id,
          username,
          full_name,
          avatar_url
        ),
        project_technologies (
          technology:technologies (
            id,
            name,
            category
          )
        ),
        project_members (
          id,
          status
        )
      `)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching featured projects:", error);
      return { success: false, data: [] };
    }

    // Explicitly cast the data to avoid "never" type inference issues
    const data = rawData as unknown as FeaturedProjectResponse[];

    // Transform data to match component expected format
    const transformedData = (data || []).map((project, index) => {
      const colors = [
        "from-blue-500 to-cyan-500",
        "from-purple-500 to-pink-500",
        "from-green-500 to-emerald-500",
        "from-orange-500 to-amber-500",
      ];
      const icons = ["🚀", "💡", "⚡", "🔥", "💎", "🎯"];

      const techNames = project.project_technologies?.map(pt => pt.technology?.name).filter(Boolean) || [];
      const acceptedMembers = project.project_members?.filter(pm => pm.status === "accepted")?.length || 0;

      return {
        id: project.id,
        title: project.title,
        description: project.description || "Proje açıklaması bulunmuyor.",
        tags: techNames,
        members: acceptedMembers + 1, // +1 for owner
        progress: project.status === "completed" ? 100 : project.status === "in_progress" ? 60 : 20,
        image: icons[index % icons.length],
        color: colors[index % colors.length],
        status: project.status,
        repoUrl: project.repo_url,
        demoUrl: project.demo_url,
        owner: project.owner,
      };
    });

    return { success: true, data: transformedData };
  } catch (error) {
    console.error("Failed to fetch featured projects:", error);
    return { success: false, data: [] };
  }
}

/**
 * Create a new project
 */
export async function createProject(input: CreateProjectInput) {
  try {
    const validatedData = createProjectSchema.parse(input);

    // Admin client kullan (RLS'yi bypass eder)
    const client = supabaseAdmin || supabaseServer;

    // Önce profiles tablosunda bir kayıt var mı kontrol et
    const { data: existingProfiles, error: profileError } = await client
      .from("profiles")
      .select("id")
      .limit(1)
      .single();

    if (profileError) {
      console.error("Profile query error:", profileError);
    }

    // @ts-ignore
    if (!existingProfiles?.id) {
      throw new AppError(
        "Henüz kayıtlı kullanıcı yok. Lütfen önce Supabase Authentication ile bir kullanıcı oluşturun ve profiles tablosuna ekleyin. (RLS politikalarını kontrol edin)",
        HttpStatus.BAD_REQUEST
      );
    }

    // @ts-ignore
    const ownerId = existingProfiles.id;

    // Şu anki Supabase şemasında tech_stack / required_roles kolonları yok,
    // bu yüzden sadece var olan kolonlara insert atıyoruz.
    const { data, error } = await client
      .from("projects")
      // @ts-ignore - Supabase type inference issue
      .insert({
        title: validatedData.title,
        description: validatedData.description,
        status: validatedData.status,
        owner_id: ownerId,
        repo_url: validatedData.githubUrl || null,
        demo_url: validatedData.liveUrl || null,
      } as any)
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      // Foreign key constraint hatası için özel mesaj
      if (error.code === "23503") {
        throw new AppError(
          `Foreign key constraint failed. Please ensure owner_id exists in profiles table: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }
      // Not null constraint hatası için özel mesaj
      if (error.code === "23502") {
        throw new AppError(
          `Required field missing: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }
      throw new AppError(
        `Failed to create project: ${error.message} (Code: ${error.code || "unknown"})`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    return { success: true, data };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      `Failed to create project: ${error instanceof Error ? error.message : "Unknown error"}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * Update an existing project
 */
export async function updateProject(input: UpdateProjectInput) {
  try {
    const validatedData = updateProjectSchema.parse(input);
    const { id, ...updateData } = validatedData;

    const updatePayload: Record<string, unknown> = {};

    if (updateData.title) updatePayload.title = updateData.title;
    if (updateData.description) updatePayload.description = updateData.description;
    if (updateData.status) updatePayload.status = updateData.status;
    // Note: tech_stack and required_roles are not columns in the projects table
    // They should be updated via relation tables. For now, we skip them to prevent errors.
    /*
    if (updateData.techStack) {
      // Logic to update project_technologies would go here
    }
    if (updateData.requiredRoles) {
      // Logic to update project_members or roles table would go here
    }
    */

    updatePayload.updated_at = new Date().toISOString();

    const { data, error } = await supabaseServer
      .from("projects")
      // @ts-ignore - Supabase type inference issue
      .update(updatePayload as any)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new AppError(
        `Failed to update project: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    if (!data) {
      throw new AppError("Project not found", HttpStatus.NOT_FOUND);
    }

    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath(`/projects/${id}`);
    return { success: true, data };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      `Failed to update project: ${error instanceof Error ? error.message : "Unknown error"}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string) {
  try {
    const { error } = await supabaseServer
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (error) {
      throw new AppError(
        `Failed to delete project: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    revalidatePath("/");
    revalidatePath("/projects");
    return { success: true };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      `Failed to delete project: ${error instanceof Error ? error.message : "Unknown error"}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * Get project by ID
 */
export async function getProjectById(projectId: string) {
  try {
    const { data, error } = await supabaseServer
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new AppError("Project not found", HttpStatus.NOT_FOUND);
      }
      throw new AppError(
        `Failed to fetch project: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    return { success: true, data };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      `Failed to fetch project: ${error instanceof Error ? error.message : "Unknown error"}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * Get projects with filtering and pagination
 */
export async function getProjects(query: Record<string, string | undefined>) {
  try {
    const limit = parseInt(query.limit || "20", 10);
    const offset = parseInt(query.offset || "0", 10);

    // Use service role for public data or ensure RLS allows
    const client = supabaseAdmin || supabaseServer;
    
    // Tüm projeleri çek - filtreleme frontend'de yapılacak
    let queryBuilder = client
      .from("projects")
      .select(`
        *,
        owner:profiles!projects_owner_id_fkey (
          id,
          username,
          full_name,
          avatar_url
        )
      `, { count: "exact" });

    // Debug logging
    console.log("Fetching projects with query:", query);

    // Tüm filtreler artık frontend'de yapılacak - Supabase'den tüm veriyi çek

    // Search ve diğer filtreler artık frontend'de yapılacak

    // Filtreleme artık frontend'de yapılacak - Supabase'den tüm veriyi çek
    // Pagination da frontend'de yapılacak, bu yüzden burada limit koymuyoruz
    // Ama performans için maksimum 1000 kayıt çekiyoruz
    queryBuilder = queryBuilder.limit(1000);

    // Order by created_at descending (en güncel önce)
    queryBuilder = queryBuilder.order("created_at", { ascending: false });

    const { data, error, count } = await queryBuilder;

    if (error) {
      console.error("[getProjects] Supabase error:", error);
      throw new AppError(
        `Failed to fetch projects: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    // Frontend'de basit filtreleme
    let filteredData = data || [];
    
    // Status filtresi
    if (query.status && query.status !== "all") {
      filteredData = filteredData.filter((p: any) => p.status === query.status);
    }
    
    // Tech Stack filtresi - AND mantığı: TÜM seçilen teknolojiler projede olmalı
    if (query.techStack) {
      const techs = query.techStack.split(",").map((t) => t.trim().toLowerCase());
      filteredData = filteredData.filter((p: any) => {
        if (!p.tech_stack || !Array.isArray(p.tech_stack)) return false;
        const projectTechs = p.tech_stack.map((t: string) => String(t).trim().toLowerCase());
        // AND mantığı: Seçilen TÜM teknolojiler projede olmalı
        return techs.every((tech) => projectTechs.includes(tech));
      });
    }
    
    // Looking For filtresi - AND mantığı: TÜM seçilen roller projede olmalı
    if (query.requiredRoles) {
      const roles = query.requiredRoles.split(",").map((r) => r.trim().toLowerCase());
      filteredData = filteredData.filter((p: any) => {
        if (!p.looking_for || !Array.isArray(p.looking_for)) return false;
        const projectRoles = p.looking_for.map((r: string) => String(r).trim().toLowerCase());
        // AND mantığı: Seçilen TÜM roller projede olmalı
        return roles.every((role) => projectRoles.includes(role));
      });
    }
    
    // Search filtresi
    if (query.search) {
      const searchTerm = query.search.trim().toLowerCase();
      filteredData = filteredData.filter((p: any) => {
        const title = (p.title || "").toLowerCase();
        const description = (p.description || "").toLowerCase();
        return title.includes(searchTerm) || description.includes(searchTerm);
      });
    }

    // Frontend filtreleme sonrası pagination uygula
    const paginatedData = filteredData.slice(offset, offset + limit);
    
    // Veriyi normalize et - Filtrelenmiş ve paginate edilmiş veriyi kullan
    const normalizedData = (paginatedData || []).map((project: any) => {
      return {
        id: project.id,
        title: project.title,
        description: project.description,
        status: project.status,
        owner_id: project.owner_id,
        repo_url: project.repo_url,
        demo_url: project.demo_url,
        created_at: project.created_at,
        updated_at: project.updated_at,
        tech_stack: project.tech_stack || [], // Array kolonu
        looking_for: project.looking_for || [], // Array kolonu (eğer varsa)
        owner: project.owner || null, // Join ile gelen owner bilgisi
      };
    });

    return {
      success: true,
      data: normalizedData,
      pagination: {
        total: filteredData.length,
        limit,
        offset,
        hasMore: filteredData.length > offset + limit,
      },
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      `Failed to fetch projects: ${error instanceof Error ? error.message : "Unknown error"}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * Get intelligent search suggestions
 */
export async function getSearchSuggestions(query: string) {
  if (!query || query.length < 2) return [];

  const client = supabaseAdmin || supabaseServer;

  // For now, we search projects by title
  const { data } = await client
    .from("projects")
    .select("title, id")
    .ilike("title", `%${query}%`)
    .limit(5);

  // Explicitly cast data to any[] to avoid 'never' inference
  const projects = data as any[] || [];

  return projects.map(p => ({
    text: p.title,
    type: 'project',
    id: p.id
  }));
}

/**
 * Get suggested projects (en güncel projeler)
 * Boş arama sonuçlarında öneri olarak gösterilir
 * Default: 9 proje (3x3 grid için)
 */
export async function getSuggestedProjects(limit: number = 9) {
  try {
    const client = supabaseAdmin || supabaseServer;

    const { data, error } = await client
      .from("projects")
      .select(`
        *,
        owner:profiles!projects_owner_id_fkey (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[getSuggestedProjects] Supabase error:", error);
      throw new AppError(
        `Failed to fetch suggested projects: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    // Veriyi normalize et
    const normalizedData = (data || []).map((project: any) => {
      return {
        id: project.id,
        title: project.title,
        description: project.description,
        status: project.status,
        owner_id: project.owner_id,
        repo_url: project.repo_url,
        demo_url: project.demo_url,
        created_at: project.created_at,
        updated_at: project.updated_at,
        tech_stack: project.tech_stack || [], // Array kolonu
        looking_for: project.looking_for || [], // Array kolonu (eğer varsa)
        owner: project.owner || null,
      };
    });

    return {
      success: true,
      data: normalizedData,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      `Failed to fetch suggested projects: ${error instanceof Error ? error.message : "Unknown error"}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
