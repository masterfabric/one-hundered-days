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

type StatusFilter = "all" | "idea" | "planning" | "in_progress" | "completed";

interface ProjectsGridProps {
  searchQuery?: string;
  statusFilter?: StatusFilter;
  selectedTech?: string[];
  selectedRole?: string[];
  onClearFilters?: () => void;
}

export function ProjectsGrid({ 
  searchQuery = "", 
  statusFilter = "all",
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
      setSuggestedProjects([]); // Önerileri temizle
      
      const isSearching = searchQuery && searchQuery.trim();
      if (isSearching) {
        setHasSearched(true);
      } else {
        setHasSearched(false);
      }
      
      try {
        const query: Record<string, string> = {};
        
        // Arama terimi varsa ekle, yoksa en güncel projeleri çek
        if (isSearching) {
          query.search = searchQuery.trim();
          // Arama yapıldığında ilk 9 sonucu göster
          query.limit = "9";
        } else {
          // Initial load: En güncel 9 projeyi çek (3x3 grid için)
          query.limit = "9";
        }

        // Status filtresi ekle
        if (statusFilter && statusFilter !== "all") {
          query.status = statusFilter;
        }

        // Tech stack filtresi ekle (array contains)
        if (selectedTech && selectedTech.length > 0) {
          query.techStack = selectedTech.join(",");
        }

        // Role filtresi ekle (array contains)
        if (selectedRole && selectedRole.length > 0) {
          query.requiredRoles = selectedRole.join(",");
        }

        console.log("ProjectsGrid: Fetching projects with query:", query);

        // Server action'ı doğrudan çağırıyoruz (API route yerine)
        const result = await getProjects(query);

        console.log("ProjectsGrid: getProjects result:", {
          success: result.success,
          dataLength: result.data?.length || 0,
          firstItem: result.data?.[0],
        });

        if (!result.success) {
          throw new Error("Projeler yüklenirken bir hata oluştu.");
        }

        if (!cancelled) {
          // getProjects'ten dönen veriyi doğru şekilde map et
          const projectsData = (result.data || []) as ApiProject[];
          console.log("ProjectsGrid: Setting projects, count:", projectsData.length);
          setProjects(projectsData);

          // Eğer arama yapıldı ve sonuç bulunamadıysa, önerilen projeleri çek
          if (isSearching && projectsData.length === 0) {
            await loadSuggestedProjects();
          }
        }
      } catch (err) {
        console.error("ProjectsGrid: Error loading projects:", err);
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Projeler yüklenemedi."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    // Initial load için hemen çalıştır, arama için debounce
    // Filtreler için anında güncelleme (debounce yok)
    const hasFilters = statusFilter !== "all" || selectedTech.length > 0 || selectedRole.length > 0;
    const timeoutId = setTimeout(load, searchQuery && !hasFilters ? 300 : 0);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [searchQuery, statusFilter, selectedTech, selectedRole]);

  // Debug: Render sırasında state'i kontrol et
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
          <p className="text-muted-foreground text-lg">Projeler yükleniyor...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-20">
          <p className="text-red-500 text-lg mb-2">Hata: {error}</p>
          <p className="text-muted-foreground text-sm">Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.</p>
        </div>
      )}

      {!loading && !error && projects.length === 0 && (
        <div className="py-20">
          {hasSearched && searchQuery ? (
            <>
              <div className="text-center mb-12">
                <p className="text-muted-foreground text-lg mb-2">
                  Aradığınız kriterlere uygun proje bulunamadı.
                </p>
                <p className="text-muted-foreground text-base mb-4">
                  Bunlara göz atmak ister misiniz?
                </p>
                {onClearFilters && (
                  <Button
                    onClick={onClearFilters}
                    variant="outline"
                    className="mt-4 rounded-full px-6 py-2 border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-purple-500/30 hover:text-purple-300 transition-all duration-300 ease-out"
                  >
                    Filtreleri Temizle
                  </Button>
                )}
              </div>

              {/* Önerilen Projeler */}
              {loadingSuggestions ? (
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">Önerilen projeler yükleniyor...</p>
                </div>
              ) : suggestedProjects.length > 0 ? (
                <div>
                  <h3 className="text-2xl font-bold mb-6 text-left">Önerilen Projeler</h3>
                  <p className="text-muted-foreground text-sm mb-8 text-left">
                    En güncel projelerden seçtiklerimiz
                  </p>
                  <motion.div
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
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
                            description={project.description ?? "Açıklama bulunmuyor."}
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
                    Şu anda önerilebilecek proje bulunmuyor.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center">
              <p className="text-muted-foreground text-lg mb-4">Henüz proje bulunamadı.</p>
              {onClearFilters && (statusFilter !== "all" || selectedTech.length > 0 || selectedRole.length > 0) && (
                <Button
                  onClick={onClearFilters}
                  variant="outline"
                  className="rounded-full px-6 py-2 border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-purple-500/30 hover:text-purple-300 transition-all duration-300 ease-out"
                >
                  Filtreleri Temizle
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {!loading && !error && projects.length > 0 && (
        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {projects.map((project) => {
            // Owner bilgisini güvenli şekilde al
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

            // Debug: looking_for verisini kontrol et
            if (lookingFor.length > 0) {
              console.log(`[ProjectsGrid] Project ${project.id} looking_for:`, lookingFor);
            }

            return (
              <motion.div key={project.id} variants={itemVariants}>
                <ProjectCard
                  id={project.id}
                  title={project.title}
                  description={project.description ?? "Açıklama bulunmuyor."}
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

