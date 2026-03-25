"use client";

import { useEffect, useState } from "react";
import { ProjectCard } from "./ProjectCard";
import { motion } from "framer-motion";
import { getProjects, getSuggestedProjects } from "@/app/actions/projects";
import { Button } from "@/components/ui/button";

type ApiProject = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  owner_id: string;
  repo_url: string | null;
  demo_url: string | null;
  created_at?: string;
  updated_at?: string;
  tech_stack?: string[] | null;
  looking_for?: string[] | null;
  owner?: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
};

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// ... imports

type StatusFilter =
  | "all"
  | "idea"
  | "in development"
  | "MVP Ready"
  | "Recruiting"
  | "Refactoring"
  | "planning"
  | "in_progress"
  | "completed";

interface ProjectsGridProps {
  searchQuery?: string;
  statusFilter?: StatusFilter;
  statusTouched?: boolean;
  selectedTech?: string[];
  selectedRole?: string[];
  onClearFilters?: () => void;
}

export function ProjectsGrid({ 
  searchQuery = "", 
  statusFilter = "all",
  statusTouched = false,
  selectedTech = [],
  selectedRole = [],
  onClearFilters
}: ProjectsGridProps) {
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [suggestedProjects, setSuggestedProjects] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSuggestedProjects() {
      if (cancelled) return;
      
      setLoadingSuggestions(true);
      try {
        const result = await getSuggestedProjects(9);
        if (result.success && !cancelled) {
          setSuggestedProjects(result.data as ApiProject[]);
          console.log("ProjectsGrid: Loaded suggested projects, count:", result.data.length);
        }
      } catch (err) {
        console.error("ProjectsGrid: Error loading suggested projects:", err);
      } finally {
        if (!cancelled) {
          setLoadingSuggestions(false);
        }
      }
    }

    async function load() {
      setLoading(true);
      setError(null);
      setSuggestedProjects([]);
      
      const isSearching = searchQuery && searchQuery.trim();
      if (isSearching) {
        setHasSearched(true);
      } else {
        setHasSearched(false);
      }
      
      try {
        const query: Record<string, string> = {};
        
        // Add search query if present, otherwise fetch recent projects.
        if (isSearching) {
          query.search = searchQuery.trim();
          query.limit = "9";
        } else {
          query.limit = "9";
        }

        // Add status filter
        if (statusTouched && statusFilter) {
          query.status = statusFilter;
        }

        // Add tech stack filter
        if (selectedTech && selectedTech.length > 0) {
          query.techStack = selectedTech.join(",");
        }

        // Add role filter
        if (selectedRole && selectedRole.length > 0) {
          query.requiredRoles = selectedRole.join(",");
        }

        console.log("ProjectsGrid: Fetching projects with query:", query);

        const result = await getProjects(query);

        console.log("ProjectsGrid: getProjects result:", {
          success: result.success,
          dataLength: result.data?.length || 0,
          firstItem: result.data?.[0],
        });

        if (!result.success) {
          throw new Error("An error occurred while loading projects.");
        }

        if (!cancelled) {
          const projectsData = (result.data || []) as ApiProject[];
          console.log("ProjectsGrid: Setting projects, count:", projectsData.length);
          setProjects(projectsData);

          if (isSearching && projectsData.length === 0) {
            await loadSuggestedProjects();
          }
        }
      } catch (err) {
        console.error("ProjectsGrid: Error loading projects:", err);
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Projects could not be loaded."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    // Run immediately for initial load and filters, debounce search input.
    const hasFilters = statusFilter !== "all" || selectedTech.length > 0 || selectedRole.length > 0;
    const timeoutId = setTimeout(load, searchQuery && !hasFilters ? 300 : 0);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [searchQuery, statusFilter, statusTouched, selectedTech, selectedRole]);

  console.log("ProjectsGrid render:", {
    loading,
    projectsCount: projects.length,
    hasError: !!error,
    searchQuery,
  });

  return (
    <div>
      {loading && (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">Loading projects...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-20">
          <p className="text-red-500 text-lg mb-2">Error: {error}</p>
          <p className="text-muted-foreground text-sm">Please refresh the page or try again later.</p>
        </div>
      )}

      {!loading && !error && projects.length === 0 && (
        <div className="py-20">
          {hasSearched && searchQuery ? (
            <>
              <div className="text-center mb-12">
                <p className="text-muted-foreground text-lg mb-2">
                  No projects match your current criteria.
                </p>
                <p className="text-muted-foreground text-base mb-4">
                  Want to check these suggestions instead?
                </p>
                {onClearFilters && (
                  <Button
                    onClick={onClearFilters}
                    variant="outline"
                    className="mt-4 rounded-full px-6 py-2 border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-purple-500/30 hover:text-purple-300 transition-all duration-300 ease-out"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>

              {loadingSuggestions ? (
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">Loading suggested projects...</p>
                </div>
              ) : suggestedProjects.length > 0 ? (
                <div>
                  <h3 className="text-2xl font-bold mb-6 text-left">Suggested Projects</h3>
                  <p className="text-muted-foreground text-sm mb-8 text-left">
                    Handpicked from the latest projects
                  </p>
                  <motion.div
                    className="grid gap-6 max-w-6xl mx-auto justify-center [grid-template-columns:repeat(auto-fit,minmax(280px,360px))]"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {suggestedProjects.map((project) => {
                      const ownerName = project.owner?.full_name || 
                                       project.owner?.username || 
                                       "Unknown Owner";
                      const ownerAvatar = project.owner?.avatar_url || undefined;

                      // Tech stack ve looking_for verilerini güvenli şekilde al
                      const techStack = Array.isArray(project.tech_stack) 
                        ? project.tech_stack.filter(Boolean) 
                        : [];
                      const lookingFor = Array.isArray(project.looking_for) 
                        ? project.looking_for.filter(Boolean) 
                        : [];

                      return (
                        <motion.div key={project.id} variants={itemVariants}>
                          <ProjectCard
                            id={project.id}
                            title={project.title}
                            description={project.description ?? "No description provided."}
                            status={project.status || "planning"}
                            techStack={techStack}
                            owner={{
                              name: ownerName,
                              avatar: ownerAvatar,
                            }}
                            requiredRoles={lookingFor}
                          />
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-muted-foreground text-sm mt-4">
                    There are no suggested projects right now.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center">
              <p className="text-muted-foreground text-lg mb-4">No projects found yet.</p>
              {onClearFilters && (statusFilter !== "all" || selectedTech.length > 0 || selectedRole.length > 0) && (
                <Button
                  onClick={onClearFilters}
                  variant="outline"
                  className="rounded-full px-6 py-2 border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-purple-500/30 hover:text-purple-300 transition-all duration-300 ease-out"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {!loading && !error && projects.length > 0 && (
        <motion.div
          className="grid gap-6 max-w-6xl mx-auto justify-center [grid-template-columns:repeat(auto-fit,minmax(280px,360px))]"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {projects.map((project) => {
            const ownerName = project.owner?.full_name || 
                             project.owner?.username || 
                             "Unknown Owner";
            const ownerAvatar = project.owner?.avatar_url || undefined;

            const techStack = Array.isArray(project.tech_stack) 
              ? project.tech_stack.filter(Boolean) 
              : [];
            const lookingFor = Array.isArray(project.looking_for) 
              ? project.looking_for.filter(Boolean) 
              : [];

            if (lookingFor.length > 0) {
              console.log(`[ProjectsGrid] Project ${project.id} looking_for:`, lookingFor);
            }

            return (
              <motion.div key={project.id} variants={itemVariants}>
                <ProjectCard
                  id={project.id}
                  title={project.title}
                  description={project.description ?? "No description provided."}
                  status={project.status || "planning"}
                  techStack={techStack}
                  owner={{
                    name: ownerName,
                    avatar: ownerAvatar,
                  }}
                  requiredRoles={lookingFor}
                />
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

