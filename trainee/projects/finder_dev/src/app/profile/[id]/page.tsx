import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Github, Globe, Linkedin } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin, supabaseServer } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectCard } from "@/components/projects/ProjectCard";

type ProfileRow = Record<string, unknown> & {
  id: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  about?: string | null;
  website_url?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  user_tag?: string | null;
  visibility?: "public" | "members_only" | null;
  achievement_count?: number | null;
  achievements_count?: number | null;
  achievements?: number | string | null;
};

type OwnedProjectRow = {
  id: string;
  title: string | null;
  description: string | null;
  status: string | null;
  tech_stack?: unknown;
  looking_for?: unknown;
};

type UserProfileDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function normalizeTextArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value !== "string") return [];

  const raw = value.trim();
  if (!raw) return [];
  if (raw.startsWith("[") && raw.endsWith("]")) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      return [];
    }
  }
  if (raw.startsWith("{") && raw.endsWith("}")) {
    return raw
      .slice(1, -1)
      .split(",")
      .map((item) => item.replace(/^"|"$/g, "").trim())
      .filter(Boolean);
  }
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function getProfileEmail(userId: string): Promise<string | null> {
  if (!supabaseAdmin) return null;
  try {
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (error) return null;
    return data.user?.email || null;
  } catch {
    return null;
  }
}

export default async function UserProfileDetailPage({
  params,
  searchParams,
}: UserProfileDetailPageProps) {
  const [{ id: userId }] = await Promise.all([params, searchParams]);
  const authClient = await createClient();
  const {
    data: { user: viewer },
  } = await authClient.auth.getUser();
  const dataClient = (supabaseAdmin || supabaseServer) as any;

  const [profileResult, projectsResult, collaborationsResult] = await Promise.all([
    dataClient.from("profiles").select("*").eq("id", userId).maybeSingle(),
    dataClient
      .from("projects")
      .select("id, title, description, status, tech_stack, looking_for", {
        count: "exact",
      })
      .eq("owner_id", userId)
      .order("created_at", { ascending: false })
      .limit(6),
    dataClient
      .from("project_members")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "accepted"),
  ]);

  const profile = (profileResult.data as ProfileRow | null) ?? null;
  if (!profile) {
    notFound();
  }

  const profileVisibility = profile.visibility || "public";
  if (profileVisibility === "members_only" && !viewer) {
    notFound();
  }

  const displayName = profile.full_name || profile.username || "Developer";
  const username = profile.username || "user";
  const profileEmail = await getProfileEmail(userId);
  const profileIdentity = profileEmail || username;
  const aboutText =
    (typeof profile.about === "string" && profile.about) ||
    (typeof profile.bio === "string" && profile.bio) ||
    "No about information has been added yet.";
  const rawAchievementsValue =
    profile.achievement_count ?? profile.achievements_count ?? profile.achievements;
  const achievementsCount =
    typeof rawAchievementsValue === "number"
      ? rawAchievementsValue
      : typeof rawAchievementsValue === "string"
      ? Number.parseInt(rawAchievementsValue, 10) || 0
      : 0;
  const projectsCount = projectsResult.count ?? 0;
  const collaborationsCount = collaborationsResult.count ?? 0;

  const isEmoji =
    profile.avatar_url?.startsWith("👨") ||
    profile.avatar_url?.startsWith("👩") ||
    profile.avatar_url?.startsWith("🧑") ||
    false;
  const ownedProjects = ((projectsResult.data as OwnedProjectRow[] | null) || []).map((project) => ({
    id: project.id,
    title: project.title || "Untitled Project",
    description: project.description || "No description provided.",
    status: project.status || "idea",
    techStack: normalizeTextArray(project.tech_stack),
    requiredRoles: normalizeTextArray(project.looking_for),
  }));

  const languageTags = normalizeTextArray(
    profile.languages || profile.language_stack || profile.langs
  );
  const technologyTags = normalizeTextArray(
    profile.skills || profile.tech_stack || profile.technologies
  );
  const topLanguages = languageTags.slice(0, 10);
  const topTechnologies = technologyTags.slice(0, 12);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Sidebar />
      <Header />
      <div className="flex flex-1 relative">
        <main className="flex-1 transition-all duration-300">
          <div className="container py-10 space-y-10">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-purple-500">
                    {displayName}
                  </span>
                </h1>
                <p className="text-muted-foreground text-lg">
                  @{profileIdentity}
                  {profile.user_tag ? ` • #${String(profile.user_tag)}` : ""}
                </p>
              </div>

              <div className="max-w-5xl mx-auto mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="h-full transition-all duration-300 ease-out rounded-xl border-slate-800/50 bg-white/5 backdrop-blur-sm hover:border-pink-500/30 hover:shadow-[0_0_20px_rgba(236,72,153,0.35)]">
                    <CardContent className="p-8">
                      <div className="flex flex-col items-center mb-8 text-center">
                        <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 relative overflow-hidden border border-white/10">
                          {profile.avatar_url && !isEmoji ? (
                            <img
                              src={profile.avatar_url}
                              alt={username}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <span className="text-6xl">{profile.avatar_url || "🧑‍💻"}</span>
                          )}
                        </div>
                        <h2 className="text-2xl font-semibold text-white mb-2">{displayName}</h2>
                        <p className="text-slate-400">@{profileIdentity}</p>

                        {(profile.github_url || profile.website_url || profile.linkedin_url) && (
                          <div className="flex flex-wrap justify-center gap-3 mt-5">
                            {profile.github_url && (
                              <a
                                href={profile.github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-slate-300 hover:text-white hover:border-blue-500/40 transition-colors"
                              >
                                <Github className="h-4 w-4" />
                                <span className="text-sm">GitHub</span>
                              </a>
                            )}
                            {profile.website_url && (
                              <a
                                href={profile.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-slate-300 hover:text-white hover:border-blue-500/40 transition-colors"
                              >
                                <Globe className="h-4 w-4" />
                                <span className="text-sm">Website</span>
                              </a>
                            )}
                            {profile.linkedin_url && (
                              <a
                                href={profile.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-slate-300 hover:text-white hover:border-blue-500/40 transition-colors"
                              >
                                <Linkedin className="h-4 w-4" />
                                <span className="text-sm">LinkedIn</span>
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">About</h3>
                        <p className="text-slate-300 leading-relaxed">{aboutText}</p>
                      </div>

                      {(topLanguages.length > 0 || topTechnologies.length > 0) && (
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <h4 className="text-sm uppercase tracking-wider text-slate-500 font-medium mb-2">
                              Languages
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {topLanguages.length > 0 ? (
                                topLanguages.map((language) => (
                                  <Badge
                                    key={language}
                                    variant="outline"
                                    className="text-xs bg-blue-500/10 text-blue-300 border-blue-500/30"
                                  >
                                    {language}
                                  </Badge>
                                ))
                              ) : (
                                <p className="text-sm text-slate-500">No language data yet.</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm uppercase tracking-wider text-slate-500 font-medium mb-2">
                              Technologies
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {topTechnologies.length > 0 ? (
                                topTechnologies.map((tech) => (
                                  <Badge
                                    key={tech}
                                    variant="secondary"
                                    className="text-xs bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-200 border-purple-500/40"
                                  >
                                    {tech}
                                  </Badge>
                                ))
                              ) : (
                                <p className="text-sm text-slate-500">No technology data yet.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card className="h-full transition-all duration-300 ease-out rounded-xl border-slate-800/50 bg-white/5 backdrop-blur-sm hover:border-pink-500/30 hover:shadow-[0_0_20px_rgba(236,72,153,0.35)]">
                    <CardContent className="p-6">
                      <h3 className="text-sm uppercase tracking-wider text-slate-500 font-medium mb-4">
                        Profile Stats
                      </h3>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-4 text-center">
                          <p className="text-2xl font-bold text-blue-400">{projectsCount}</p>
                          <p className="text-sm text-slate-400 mt-1">Projects</p>
                        </div>
                        <div className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-4 text-center">
                          <p className="text-2xl font-bold text-purple-400">{collaborationsCount}</p>
                          <p className="text-sm text-slate-400 mt-1">Collaborations</p>
                        </div>
                        <div className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-4 text-center">
                          <p className="text-2xl font-bold text-green-400">{achievementsCount}</p>
                          <p className="text-sm text-slate-400 mt-1">Achievements</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Projects</h2>
                <Button asChild variant="ghost" className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10">
                  <Link href="/projects">Explore All Projects</Link>
                </Button>
              </div>

              {ownedProjects.length === 0 ? (
                <div className="rounded-xl border border-slate-800/50 bg-white/5 backdrop-blur-sm p-6 text-center">
                  <p className="text-slate-400">No projects published yet.</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {ownedProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      id={project.id}
                      title={project.title}
                      description={project.description}
                      status={project.status}
                      techStack={project.techStack}
                      owner={{
                        name: displayName,
                        avatar: profile.avatar_url || undefined,
                      }}
                      requiredRoles={project.requiredRoles}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
