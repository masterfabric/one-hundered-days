"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { supabase } from "@/lib/supabase/client";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Button } from "@/components/ui/button";

type MyProject = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  tech_stack?: string[] | null;
  looking_for?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
};

function normalizeTextArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => normalizeTextArray(item))
      .filter(Boolean);
  }

  if (typeof value !== "string") return [];

  const raw = value.trim();
  if (!raw) return [];

  if ((raw.startsWith("[") && raw.endsWith("]")) || (raw.startsWith("{") && raw.endsWith("}"))) {
    try {
      const normalizedJson = raw.startsWith("{")
        ? `[${raw.slice(1, -1)}]`
        : raw;
      const parsed = JSON.parse(normalizedJson);
      if (Array.isArray(parsed)) {
        return parsed
          .map((entry) => String(entry).trim())
          .filter(Boolean);
      }
    } catch {
      // Continue with string fallback.
    }
  }

  return raw
    .split(",")
    .map((item) => item.replace(/[\[\]"]/g, "").trim())
    .filter(Boolean);
}

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<MyProject[]>([]);
  const [displayName, setDisplayName] = useState("You");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          window.location.href = "/login";
          return;
        }

        const currentUserId = session.user.id;
        if (cancelled) return;

        const [profileResult, projectsResult] = await Promise.all([
          supabase
            .from("profiles")
            .select("username, full_name, avatar_url")
            .eq("id", currentUserId)
            .maybeSingle(),
          supabase
            .from("projects")
            .select("id, title, description, status, tech_stack, looking_for, created_at, updated_at")
            .eq("owner_id", currentUserId)
            .order("updated_at", { ascending: false }),
        ]);

        if (projectsResult.error) {
          throw projectsResult.error;
        }

        if (!cancelled) {
          const profile = profileResult.data;
          setDisplayName(
            profile?.full_name ||
              profile?.username ||
              session.user.user_metadata?.user_name ||
              session.user.email?.split("@")[0] ||
              "You"
          );
          setAvatarUrl(profile?.avatar_url || undefined);
          setProjects((projectsResult.data as MyProject[]) || []);
        }
      } catch (err) {
        console.error("[MyProjectsPage] Failed to load:", err);
        if (!cancelled) {
          setError("Your projects could not be loaded. Please refresh and try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const completedCount = useMemo(
    () => projects.filter((project) => project.status === "completed").length,
    [projects]
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Sidebar />
      <Header />
      <div className="flex flex-1 relative">
        <main className="flex-1 transition-all duration-300">
          <div className="container py-10 space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-purple-500">
                  My Projects
                </span>
              </h1>
              <p className="text-muted-foreground text-lg">
                {displayName} • {projects.length} total • {completedCount} completed
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <Button
                asChild
                className="group rounded-full px-5 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 hover:from-blue-400 hover:via-purple-400 hover:to-purple-500 hover:shadow-blue-500/30 hover:-translate-y-[1px] text-white font-medium transition-all duration-500 delay-75 ease-out"
              >
                <Link href="/projects/create">Create New Project</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full px-5 py-2 border-white/15 bg-white/5 text-slate-200 hover:bg-gradient-to-r hover:from-blue-500/15 hover:via-purple-500/15 hover:to-pink-500/15 hover:border-purple-500/40 hover:text-white transition-all duration-500 ease-out"
              >
                <Link href="/projects">Browse Projects</Link>
              </Button>
            </div>

            {loading && (
              <div className="rounded-xl border border-slate-800/50 bg-white/5 p-6 text-center">
                <p className="text-slate-300">Loading your projects...</p>
              </div>
            )}

            {error && !loading && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
                <p className="text-red-300">{error}</p>
              </div>
            )}

            {!loading && !error && projects.length === 0 && (
              <div className="rounded-xl border border-slate-800/50 bg-white/5 p-8 text-center">
                <h2 className="text-xl font-semibold text-white mb-2">No projects yet</h2>
                <p className="text-slate-400 mb-5">
                  Start your first project and invite collaborators to build together.
                </p>
                <Button
                  asChild
                  className="group rounded-full px-5 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 hover:from-blue-400 hover:via-purple-400 hover:to-purple-500 hover:shadow-blue-500/30 hover:-translate-y-[1px] text-white font-medium transition-all duration-500 delay-75 ease-out"
                >
                  <Link href="/projects/create">Create Your First Project</Link>
                </Button>
              </div>
            )}

            {!loading && !error && projects.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    id={project.id}
                    title={project.title}
                    description={project.description ?? "No description provided."}
                    status={project.status || "idea"}
                    techStack={normalizeTextArray(project.tech_stack)}
                    requiredRoles={normalizeTextArray(project.looking_for)}
                    owner={{
                      name: displayName,
                      avatar: avatarUrl,
                    }}
                  />
                ))}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

