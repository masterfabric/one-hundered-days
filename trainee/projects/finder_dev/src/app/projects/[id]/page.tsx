import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, ExternalLink, FileText, Github, Users, Hourglass } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProjectById } from "@/app/actions/projects";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProjectRequestButton } from "@/components/projects/ProjectRequestButton";
import { OwnerRequestsPanel } from "@/components/projects/OwnerRequestsPanel";
import { OwnerProjectActions } from "@/components/projects/OwnerProjectActions";
import { TeamRoleManager } from "@/components/projects/TeamRoleManager";

type ProjectDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
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

function normalizeTextArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeTextArray(item)).filter(Boolean);
  }
  if (typeof value !== "string") return [];

  const raw = value.trim();
  if (!raw) return [];

  if ((raw.startsWith("[") && raw.endsWith("]")) || (raw.startsWith("{") && raw.endsWith("}"))) {
    try {
      const normalizedJson = raw.startsWith("{") ? `[${raw.slice(1, -1)}]` : raw;
      const parsed = JSON.parse(normalizedJson);
      if (Array.isArray(parsed)) {
        return parsed.map((entry) => String(entry).trim()).filter(Boolean);
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

function getMockDeadline(createdAt?: string): string {
  const baseDate = createdAt ? new Date(createdAt) : new Date();
  if (Number.isNaN(baseDate.getTime())) return "TBD (mock)";
  baseDate.setDate(baseDate.getDate() + 45);
  return formatDate(baseDate.toISOString());
}

export default async function ProjectDetailPage({ params, searchParams }: ProjectDetailPageProps) {
  const [{ id }] = await Promise.all([params, searchParams]);
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
  const documentationUrl = project.documentation_url || project.document_url || null;
  const techStack = normalizeTextArray(project.tech_stack);
  const lookingFor = normalizeTextArray(project.looking_for).map((role) => role.replace(/_/g, " "));
  const owner = project.owner || null;
  const ownerName = owner?.full_name || owner?.username || "Unknown user";
  const ownerUsername = owner?.username ? `@${owner.username}` : "";
  const ownerAvatar = owner?.avatar_url;
  const rawTeamCapacity = Number(
    project.team_capacity ?? project.capacity ?? project.teamCapacity
  );
  const teamCapacity = Number.isFinite(rawTeamCapacity) && rawTeamCapacity > 0 ? rawTeamCapacity : null;
  const deadlineLabel = project.deadline ? formatDate(project.deadline) : getMockDeadline(project.created_at);
  const estimatedStartLabel = project.estimated_start_date
    ? formatDate(project.estimated_start_date)
    : formatDate(project.created_at);
  const authClient = (await createSupabaseServerClient()) as any;
  const {
    data: { user },
  } = await authClient.auth.getUser();
  const currentUserId = user?.id ?? null;
  const isOwner = currentUserId ? project.owner_id === currentUserId : false;
  let initialRequestStatus: "pending" | "accepted" | "rejected" | null = null;
  let ownerPendingRequests: Array<{
    id: string;
    requester_profile_id: string;
    requester_name: string;
    requester_label: string;
    message: string | null;
    created_at: string;
  }> = [];
  let canManageTeamRoles = false;
  if (currentUserId && !isOwner) {
    const { data: myRequest } = await authClient
      .from("project_requests")
      .select("status")
      .eq("project_id", id)
      .eq("requester_id", currentUserId)
      .maybeSingle();
    const status = myRequest?.status;
    if (status === "pending" || status === "accepted" || status === "rejected") {
      initialRequestStatus = status;
    }
  }
  if (currentUserId) {
    if (isOwner) {
      canManageTeamRoles = true;
    } else {
      const { data: currentMemberRow } = await authClient
        .from("project_members")
        .select("team_role, status")
        .eq("project_id", id)
        .eq("user_id", currentUserId)
        .eq("status", "accepted")
        .maybeSingle();
      canManageTeamRoles = currentMemberRow?.team_role === "co_leader";
    }
  }

  if (currentUserId && canManageTeamRoles) {
    const { data: pendingRows } = await authClient
      .from("project_requests")
      .select("id, requester_id, message, created_at")
      .eq("project_id", id)
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    const requesterIds = Array.from(
      new Set((pendingRows || []).map((row: any) => row.requester_id).filter(Boolean))
    );
    let profilesById = new Map<
      string,
      { full_name: string | null; username: string | null; user_tag: string | null }
    >();

    if (requesterIds.length > 0) {
      const { data: requesterProfiles } = await authClient
        .from("profiles")
        .select("id, full_name, username, user_tag")
        .in("id", requesterIds);

      profilesById = new Map(
        (requesterProfiles || []).map((profile: any) => [
          profile.id,
          { full_name: profile.full_name, username: profile.username, user_tag: profile.user_tag },
        ])
      );
    }

    ownerPendingRequests = (pendingRows || []).map((row: any) => {
      const profile = profilesById.get(row.requester_id);
      const displayName =
        profile?.full_name || profile?.username || profile?.user_tag || "Unknown user";
      const label = profile?.user_tag
        ? `#${profile.user_tag}`
        : profile?.username
        ? `@${profile.username}`
        : "Profile";
      return {
        id: row.id,
        requester_profile_id: row.requester_id,
        requester_name: displayName,
        requester_label: label,
        message: row.message || null,
        created_at: row.created_at,
      };
    });
  }

  const { data: acceptedMemberRows } = await authClient
    .from("project_members")
    .select("user_id, role_title, team_role")
    .eq("project_id", id)
    .eq("status", "accepted");

  const acceptedMemberUserIds = Array.from(
    new Set(
      (acceptedMemberRows || [])
        .map((row: any) => row.user_id)
        .filter((memberUserId: string | null) => Boolean(memberUserId) && memberUserId !== project.owner_id)
    )
  );

  let acceptedProfilesById = new Map<
    string,
    { id: string; full_name: string | null; username: string | null; avatar_url: string | null }
  >();
  if (acceptedMemberUserIds.length > 0) {
    const { data: acceptedProfiles } = await authClient
      .from("profiles")
      .select("id, full_name, username, avatar_url")
      .in("id", acceptedMemberUserIds);
    acceptedProfilesById = new Map(
      (acceptedProfiles || []).map((profile: any) => [profile.id, profile])
    );
  }

  const teamMembers = [
    {
      id: owner?.id || "owner",
      profileId: owner?.id || null,
      name: ownerName,
      role: ownerUsername ? `Owner • ${ownerUsername}` : "Owner",
      avatar:
        ownerAvatar ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(ownerName)}&eyes=default&eyebrows=default&mouth=smile&accessoriesProbability=0&facialHairProbability=0&skinColor=f2d3b1`,
    },
    ...(acceptedMemberRows || [])
      .filter((row: any) => Boolean(row.user_id) && row.user_id !== project.owner_id)
      .map((row: any) => {
        const profile = acceptedProfilesById.get(row.user_id);
        const displayName = profile?.full_name || profile?.username || "Team Member";
        const teamRole: string = row.team_role || "member";
        const rolePrefix =
          teamRole === "leader"
            ? "Leader"
            : teamRole === "co_leader"
            ? "Co-Leader"
            : "Member";
        return {
          id: row.user_id as string,
          profileId: row.user_id as string,
          name: displayName,
          role: `${rolePrefix}${row.role_title ? ` • ${row.role_title}` : ""}`,
          teamRole,
          avatar:
            profile?.avatar_url ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`,
        };
      }),
  ];

  const teamCurrent = teamMembers.length;

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
              <div className="flex items-center gap-3">
                {!currentUserId ? (
                  <Link href="/login">
                    <Button
                      variant="outline"
                      className="rounded-full bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-violet-400/40"
                    >
                      Login to Request
                    </Button>
                  </Link>
                ) : isOwner ? (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-violet-500/15 text-violet-200 border-violet-400/30 hover:bg-violet-500/15 cursor-default">
                      You are project owner
                    </Badge>
                    <OwnerProjectActions
                      projectId={id}
                      projectStatus={String(project.status || "idea")}
                    />
                  </div>
                ) : (
                  <ProjectRequestButton projectId={id} initialStatus={initialRequestStatus} />
                )}
              </div>
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

                {(githubUrl || liveUrl || documentationUrl) && (
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
                    {documentationUrl && (
                      <a href={documentationUrl} target="_blank" rel="noopener noreferrer">
                        <Button className="rounded-full bg-slate-900/70 hover:bg-slate-800 text-white border border-slate-700">
                          <FileText className="h-4 w-4 mr-2" />
                          Documentation
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
                          {role}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">No role requirements listed.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
                  <h3 className="text-sm uppercase tracking-wider text-slate-400 mb-3">
                    Capacity & Deadline
                  </h3>
                  <div className="space-y-4">
                    <div className="rounded-lg border border-slate-700/70 bg-slate-900/60 p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="inline-flex items-center gap-2 text-slate-300">
                          <Users className="h-4 w-4 text-blue-300" />
                          Team Capacity
                        </span>
                        <span className="text-white font-semibold">
                          {teamCapacity ? `${teamCurrent}/${teamCapacity}` : `${teamCurrent} members`}
                        </span>
                      </div>
                      {teamCapacity ? (
                        <div className="mt-2 h-2 rounded-full bg-slate-800">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                            style={{ width: `${Math.min((teamCurrent / teamCapacity) * 100, 100)}%` }}
                          />
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-slate-500">
                          Team capacity not configured yet.
                        </p>
                      )}
                    </div>

                    <div className="rounded-lg border border-slate-700/70 bg-slate-900/60 p-3">
                      <p className="inline-flex items-center gap-2 text-sm text-slate-300">
                        <Calendar className="h-4 w-4 text-cyan-300" />
                        Estimated Start
                      </p>
                      <p className="text-white font-semibold mt-1">{estimatedStartLabel}</p>
                    </div>

                    <div className="rounded-lg border border-slate-700/70 bg-slate-900/60 p-3">
                      <p className="inline-flex items-center gap-2 text-sm text-slate-300">
                        <Hourglass className="h-4 w-4 text-purple-300" />
                        Deadline
                      </p>
                      <p className="text-white font-semibold mt-1">{deadlineLabel}</p>
                      {!project.deadline && (
                        <p className="text-xs text-slate-500 mt-1">
                          Mock value for now; Supabase field will be connected later.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
                  <h3 className="text-sm uppercase tracking-wider text-slate-400 mb-3">
                    Team
                  </h3>
                  <div className="space-y-3">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 rounded-lg border border-slate-700/70 bg-slate-900/60 p-3"
                      >
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="h-11 w-11 rounded-full object-cover border border-white/20"
                        />
                        <div className="min-w-0">
                          {member.profileId ? (
                            <Link href={`/profile/${member.profileId}`} className="text-white font-medium truncate hover:text-violet-200 transition-colors block">
                              {member.name}
                            </Link>
                          ) : (
                            <p className="text-white font-medium truncate">{member.name}</p>
                          )}
                          <p className="text-slate-400 text-sm truncate">{member.role}</p>
                        </div>
                      </div>
                    ))}
                    {teamMembers.length <= 1 && (
                      <p className="text-xs text-slate-500">
                        No accepted team members yet.
                      </p>
                    )}
                  </div>
                </div>

                {canManageTeamRoles && (
                  <TeamRoleManager
                    projectId={id}
                    members={teamMembers
                      .filter((member) => member.profileId && member.id !== (owner?.id || ""))
                      .map((member) => ({
                        userId: member.id,
                        displayName: member.name,
                        currentRole:
                          member.teamRole === "leader" || member.teamRole === "co_leader"
                            ? member.teamRole
                            : "member",
                      }))}
                  />
                )}

                {canManageTeamRoles && (
                  <OwnerRequestsPanel
                    projectId={id}
                    initialRequests={ownerPendingRequests}
                  />
                )}
              </aside>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
