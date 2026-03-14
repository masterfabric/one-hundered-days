import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, ExternalLink, Github, UserRound } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProjectById } from "@/app/actions/projects";

type ProjectDetailPageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(value?: string) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  let result: Awaited<ReturnType<typeof getProjectById>> | null = null;

  try {
    result = await getProjectById(id);
  } catch {
    notFound();
  }

  if (!result || !result.success || !result.data) {
    notFound();
  }

  const project = result.data as Record<string, any>;
  const githubUrl = project.github_url || project.repo_url;
  const liveUrl = project.live_url || project.demo_url;
  const techStack = Array.isArray(project.tech_stack) ? project.tech_stack : [];
  const lookingFor = Array.isArray(project.looking_for) ? project.looking_for : [];
  const owner = project.owner || null;
  const ownerName = owner?.full_name || owner?.username || "Unknown user";
  const ownerUsername = owner?.username ? `@${owner.username}` : "";
  const ownerAvatar = owner?.avatar_url;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Sidebar />
      <Header />
      <div className="flex flex-1 relative">
        <main className="flex-1 transition-all duration-300">
          <div className="container py-10 px-4 md:px-8 max-w-6xl space-y-8">
            <div className="flex items-center justify-between gap-4">
              <Link href="/projects">
                <Button
                  variant="outline"
                  className="rounded-full bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-blue-400/40"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Projects
                </Button>
              </Link>
            </div>

            <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl p-8">
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
                {project.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-slate-300">
                <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/30">
                  {String(project.status || "idea").replace(/_/g, " ")}
                </Badge>
                <span className="inline-flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-blue-300" />
                  {formatDate(project.created_at)}
                </span>
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <article className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Açıklama</h2>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {project.description || "No description has been shared for this project."}
                </p>

                {(githubUrl || liveUrl) && (
                  <div className="mt-8 flex flex-wrap gap-3">
                    {githubUrl && (
                      <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                        <Button className="rounded-full bg-slate-900/70 hover:bg-slate-800 text-white border border-slate-700">
                          <Github className="h-4 w-4 mr-2" />
                          GitHub
                        </Button>
                      </a>
                    )}
                    {liveUrl && (
                      <a href={liveUrl} target="_blank" rel="noopener noreferrer">
                        <Button className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Live Demo
                        </Button>
                      </a>
                    )}
                  </div>
                )}
              </article>

              <aside className="space-y-6">
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
                  <h3 className="text-sm uppercase tracking-wider text-slate-400 mb-3">
                    Technologies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {techStack.length > 0 ? (
                      techStack.map((tech: string) => (
                        <Badge
                          key={tech}
                          variant="outline"
                          className="bg-blue-500/10 border-blue-400/30 text-blue-200"
                        >
                          {tech}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">No technologies listed.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
                  <h3 className="text-sm uppercase tracking-wider text-slate-400 mb-3">
                    Required Roles
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {lookingFor.length > 0 ? (
                      lookingFor.map((role: string) => (
                        <Badge
                          key={role}
                          variant="secondary"
                          className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/30 text-purple-100"
                        >
                          {role.replace(/_/g, " ")}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">No role requirements listed.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
                  <h3 className="text-sm uppercase tracking-wider text-slate-400 mb-3">
                    Project Owner
                  </h3>
                  <div className="flex items-center gap-3">
                    {ownerAvatar ? (
                      <img
                        src={ownerAvatar}
                        alt={ownerName}
                        className="h-11 w-11 rounded-full object-cover border border-white/20"
                      />
                    ) : (
                      <div className="h-11 w-11 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
                        <UserRound className="h-5 w-5 text-slate-300" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-white font-medium truncate">{ownerName}</p>
                      {ownerUsername && <p className="text-slate-400 text-sm">{ownerUsername}</p>}
                    </div>
                  </div>
                </div>
              </aside>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
