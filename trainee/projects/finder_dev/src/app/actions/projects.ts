"use server";

import {
  createProjectSchema,
  updateProjectSchema,
  type CreateProjectInput,
  type UpdateProjectInput,
} from "@/lib/validations/projects";
import { AppError, ErrorMessages, HttpStatus } from "@/lib/utils/errors";
import {
  supabaseServer,
  supabaseAdmin,
  createSupabaseServerClient,
} from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Define types for the raw Supabase response to fix "never" type errors
interface ProjectMember {
  project_id: string;
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
  github_url: string | null;
  live_url: string | null;
  created_at: string;
  owner_id: string;
  tech_stack?: unknown;
}

function normalizeTextArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => normalizeTextArray(item))
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (typeof value !== "string") return [];

  const raw = value.trim();
  if (!raw) return [];

  // JSON array string case: ["Full Stack Developer"]
  if (raw.startsWith("[") && raw.endsWith("]")) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      // continue to other parsers
    }
  }

  // Postgres text[] can sometimes appear as "{React,Node.js}".
  if (raw.startsWith("{") && raw.endsWith("}")) {
    return raw
      .slice(1, -1)
      .split(",")
      .map((item) => item.replace(/^"|"$/g, "").trim())
      .filter(Boolean);
  }

  // Fallback for comma-separated plain strings.
  return raw
    .split(",")
    .map((item) => item.replace(/[\[\]"]/g, "").trim())
    .filter(Boolean);
}

function toCanonicalStatus(status: unknown): string {
  const normalized = String(status || "").trim().toLowerCase().replace(/[_-]+/g, " ");
  if (normalized === "idea") return "idea";
  if (
    normalized === "in development" ||
    normalized === "in progress" ||
    normalized === "development"
  ) {
    return "in development";
  }
  if (normalized === "mvp ready" || normalized === "mvpready") return "mvp ready";
  if (normalized === "recruiting") return "recruiting";
  if (normalized === "refactoring") return "refactoring";
  return normalized;
}

function toCanonicalRole(role: unknown): string {
  return String(role || "")
    .replace(/[\[\]"]/g, "")
    .replace(/[_-]+/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * Get featured projects for homepage
 */
export async function getFeaturedProjects(limit: number = 4) {
  try {
    // Admin client kullan (RLS'yi bypass eder) - Anasayfa verileri public olmalı
    const client = (supabaseAdmin || supabaseServer) as any;

    // Keep query schema-safe: avoid FK-dependent joins.
    const { data: rawData, error } = await client
      .from("projects")
      .select("id, title, description, status, github_url, live_url, created_at, owner_id, tech_stack")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching featured projects:", error);
      return { success: false, data: [] };
    }

    const data = (rawData as unknown as FeaturedProjectResponse[]) || [];
    const ownerIds = Array.from(new Set(data.map((project) => project.owner_id).filter(Boolean)));
    const projectIds = data.map((project) => project.id);

    const [ownersResult, membersResult] = await Promise.all([
      ownerIds.length > 0
        ? client
            .from("profiles")
            .select("id, username, full_name, avatar_url")
            .in("id", ownerIds)
        : Promise.resolve({ data: [], error: null } as any),
      projectIds.length > 0
        ? client
            .from("project_members")
            .select("project_id, status")
            .in("project_id", projectIds)
            .eq("status", "accepted")
        : Promise.resolve({ data: [], error: null } as any),
    ]);

    const ownersById = new Map<string, ProjectOwner>();
    (ownersResult.data || []).forEach((owner: any) => {
      ownersById.set(owner.id, owner as ProjectOwner);
    });

    const acceptedMembersByProjectId = new Map<string, number>();
    (membersResult.data || []).forEach((member: ProjectMember) => {
      const key = member.project_id;
      acceptedMembersByProjectId.set(key, (acceptedMembersByProjectId.get(key) || 0) + 1);
    });

    // Transform data to match component expected format
    const transformedData = data.map((project, index) => {
      const colors = [
        "from-blue-500 to-cyan-500",
        "from-purple-500 to-pink-500",
        "from-green-500 to-emerald-500",
        "from-orange-500 to-amber-500",
      ];
      const icons = ["🚀", "💡", "⚡", "🔥", "💎", "🎯"];

      const techNames = normalizeTextArray(project.tech_stack).slice(0, 4);
      const acceptedMembers = acceptedMembersByProjectId.get(project.id) || 0;
      const owner = ownersById.get(project.owner_id) || null;

      return {
        id: project.id,
        title: project.title,
        description: project.description || "No project description available.",
        tags: techNames,
        members: acceptedMembers + 1, // +1 for owner
        progress: project.status === "completed" ? 100 : project.status === "in_progress" ? 60 : 20,
        image: icons[index % icons.length],
        color: colors[index % colors.length],
        status: project.status,
        repoUrl: project.github_url,
        demoUrl: project.live_url,
        owner,
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
    const rawInput = input as unknown as Record<string, unknown>;
    const validatedData = createProjectSchema.parse(input);

    const authClient = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      throw new AppError(
        "You must be signed in to perform this action.",
        HttpStatus.UNAUTHORIZED
      );
    }

    // Regular client kullan (RLS politikaları authenticated kullanıcıya göre çalışsın)
    const client = supabaseServer;

    const techStackFromCsv =
      typeof rawInput.techStackText === "string"
        ? rawInput.techStackText
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];
    const techStackFromObjects = (validatedData.techStack || [])
      .map((item) => item.name?.trim())
      .filter(Boolean) as string[];
    const techStackArray = (techStackFromCsv.length > 0 ? techStackFromCsv : techStackFromObjects)
      .filter(Boolean);

    const rawLookingFor = Array.isArray(rawInput.lookingFor)
      ? rawInput.lookingFor
          .map((role) => String(role).trim())
          .filter(Boolean)
      : [];
    const validatedLookingFor = (validatedData.requiredRoles || [])
      .map((role) => String(role.role || "").replace(/_/g, " ").trim())
      .filter(Boolean);
    const lookingForArray =
      rawLookingFor.length > 0 ? rawLookingFor : validatedLookingFor;

    const projectData = {
      title: validatedData.title,
      description: validatedData.description,
      status: validatedData.status,
      owner_id: user.id,
      tech_stack: techStackArray.length > 0 ? techStackArray : ["Other"],
      looking_for: lookingForArray.length > 0 ? lookingForArray : ["other"],
      github_url: validatedData.githubUrl || null,
      live_url: validatedData.liveUrl || null,
    };

    console.log("Gönderilen Veri:", projectData);

    // Şu anki Supabase şemasında tech_stack / required_roles kolonları yok,
    // bu yüzden sadece var olan kolonlara insert atıyoruz.
    const { data, error } = await client
      .from("projects")
      // @ts-ignore - Supabase type inference issue
      .insert(projectData as any)
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
    const client = (await createSupabaseServerClient()) as any;
    let { data, error } = await client
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
      .eq("id", projectId)
      .single();

    // Fallback if FK relation cache is stale.
    if (error?.code === "PGRST200") {
      const base = await client
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (base.error) {
        error = base.error;
      } else {
        let owner = null;
        if (base.data?.owner_id) {
          const ownerResult = await client
            .from("profiles")
            .select("id, username, full_name, avatar_url")
            .eq("id", base.data.owner_id)
            .maybeSingle();
          owner = ownerResult.data || null;
        }
        data = {
          ...base.data,
          owner,
        } as any;
        error = null as any;
      }
    }

    if (error) {
      if (error.code === "PGRST116") {
        throw new AppError("Project not found", HttpStatus.NOT_FOUND);
      }
      throw new AppError(
        `Failed to fetch project: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    const normalizedData = {
      ...(data as Record<string, unknown>),
      tech_stack: normalizeTextArray((data as any)?.tech_stack),
      looking_for: normalizeTextArray((data as any)?.looking_for),
    };

    return { success: true, data: normalizedData };
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

    // Use SSR client so authenticated user's session is forwarded to RLS.
    const client = (await createSupabaseServerClient()) as any;
    
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

    let { data, error, count } = await queryBuilder;

    // Fallback: If FK relation is not yet visible in schema cache, query manually and merge.
    if (error?.code === "PGRST200") {
      console.warn("[getProjects] FK relation cache miss. Falling back to manual owner merge.");

      const baseResult = await client
        .from("projects")
        .select("*", { count: "exact" })
        .limit(1000)
        .order("created_at", { ascending: false });

      if (baseResult.error) {
        throw new AppError(
          `Failed to fetch projects: ${baseResult.error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      const ownerIds = Array.from(
        new Set((baseResult.data || []).map((p: any) => p.owner_id).filter(Boolean))
      );

      const profilesById = new Map<string, any>();
      if (ownerIds.length > 0) {
        const profilesResult = await client
          .from("profiles")
          .select("id, username, full_name, avatar_url")
          .in("id", ownerIds);

        if (!profilesResult.error) {
          (profilesResult.data || []).forEach((profile: any) =>
            profilesById.set(profile.id, profile)
          );
        }
      }

      data = (baseResult.data || []).map((project: any) => ({
        ...project,
        owner: project.owner_id ? profilesById.get(project.owner_id) || null : null,
      }));
      error = null;
      count = baseResult.count;
    }

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
    if (query.status) {
      const requestedStatus = String(query.status).trim().toLowerCase();
      if (requestedStatus === "all") {
        const allowedStatuses = new Set([
          "idea",
          "in development",
          "mvp ready",
          "recruiting",
          "refactoring",
        ]);
        filteredData = filteredData.filter((p: any) =>
          allowedStatuses.has(toCanonicalStatus(p.status))
        );
      } else {
        const targetStatus = toCanonicalStatus(requestedStatus);
        filteredData = filteredData.filter(
          (p: any) => toCanonicalStatus(p.status) === targetStatus
        );
      }
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
      const roles = query.requiredRoles
        .split(",")
        .map((r) => toCanonicalRole(r))
        .filter(Boolean);
      filteredData = filteredData.filter((p: any) => {
        const projectRoles = normalizeTextArray(p.looking_for).map((r) => toCanonicalRole(r));
        if (projectRoles.length === 0) return false;
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
        const projectTechs = normalizeTextArray(p.tech_stack).map((t) => t.toLowerCase());
        const projectRoles = normalizeTextArray(p.looking_for).map((r) => r.toLowerCase());

        return (
          title.includes(searchTerm) ||
          description.includes(searchTerm) ||
          projectTechs.some((tech) => tech.includes(searchTerm)) ||
          projectRoles.some((role) => role.includes(searchTerm))
        );
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
        github_url: project.github_url || null,
        live_url: project.live_url || null,
        // Backward-compat aliases for existing UI.
        repo_url: project.github_url || null,
        demo_url: project.live_url || null,
        created_at: project.created_at,
        updated_at: project.updated_at,
        tech_stack: normalizeTextArray(project.tech_stack),
        looking_for: normalizeTextArray(project.looking_for),
        owner: project.owner || null, // Join ile gelen owner bilgisi
      };
    });

    console.log("[getProjects] Join check owner sample:", normalizedData[0]?.owner ?? null);

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
    const client = (supabaseAdmin || supabaseServer) as any;

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
        github_url: project.github_url || null,
        live_url: project.live_url || null,
        repo_url: project.github_url || null,
        demo_url: project.live_url || null,
        created_at: project.created_at,
        updated_at: project.updated_at,
        tech_stack: normalizeTextArray(project.tech_stack),
        looking_for: normalizeTextArray(project.looking_for),
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
