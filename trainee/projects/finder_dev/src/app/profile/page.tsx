import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Github, Linkedin, Edit, Camera, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

type ProfileRow = Record<string, unknown> & {
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  about?: string | null;
  bio?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  let profileRow: ProfileRow | null = null;
  let projectsCount = 0;
  let collaborationsCount = 0;
  let achievementsCount = 0;
  let level = 1;
  let xpTotal = 0;

  if (user?.id) {
    const [profileResult, projectsResult, collaborationsResult, progressResult, achievementsResult] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", user.id),
      supabase
        .from("project_members")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "accepted"),
      supabase
        .from("user_progress")
        .select("xp_total, level")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("user_achievements")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

    profileRow = (profileResult.data as ProfileRow | null) ?? null;
    projectsCount = projectsResult.count ?? 0;
    collaborationsCount = collaborationsResult.count ?? 0;
    achievementsCount = achievementsResult.count ?? 0;
    level = Number((progressResult.data as any)?.level ?? 1);
    xpTotal = Number((progressResult.data as any)?.xp_total ?? 0);
  }

  const fallbackUsername =
    user?.email?.split("@")[0] ||
    (typeof user?.user_metadata?.user_name === "string"
      ? user.user_metadata.user_name
      : null) ||
    "user";

  const fallbackFullName =
    (typeof user?.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : null) || fallbackUsername;

  const profile = {
    username: profileRow?.username || fallbackUsername,
    identity: user?.email || profileRow?.username || fallbackUsername,
    full_name: profileRow?.full_name || fallbackFullName,
    avatar_url:
      profileRow?.avatar_url ||
      (typeof user?.user_metadata?.avatar_url === "string"
        ? user.user_metadata.avatar_url
        : null),
    about: profileRow?.about || profileRow?.bio || "No about information has been added yet.",
    github_url: profileRow?.github_url || "https://github.com",
    linkedin_url: profileRow?.linkedin_url || "https://linkedin.com",
  };

  const isEmoji =
    profile.avatar_url?.startsWith("👨") ||
    profile.avatar_url?.startsWith("👩") ||
    profile.avatar_url?.startsWith("🧑") ||
    false;
  const currentLevelBaseXp = Math.max((level - 1) * 100, 0);
  const nextLevelBaseXp = level * 100;
  const levelProgressPercent = Math.min(
    100,
    Math.max(0, ((xpTotal - currentLevelBaseXp) / Math.max(nextLevelBaseXp - currentLevelBaseXp, 1)) * 100)
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Sidebar />
      <Header />
      <div className="flex flex-1 relative">
        <main className="flex-1 transition-all duration-300">
          <div className="container py-10">
            <div className="mb-8 space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-purple-500">
                    {profile.full_name || profile.username}
                  </span>
                </h1>
                <p className="text-muted-foreground text-lg">{profile.identity}</p>
              </div>

              <div className="max-w-3xl mx-auto mt-12">
                <div className="rounded-xl border border-slate-800/50 bg-white/5 backdrop-blur-sm p-8">
                  <div className="flex flex-col items-center mb-8">
                    <div className="relative group">
                      <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative overflow-hidden cursor-pointer transition-all duration-300 hover:ring-4 hover:ring-blue-500/50">
                        {profile.avatar_url && !isEmoji ? (
                          <img
                            src={profile.avatar_url}
                            alt={profile.username}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-6xl">🧑‍💻</span>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-full">
                          <Camera className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <button
                        className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center shadow-lg border-2 border-slate-900 transition-all duration-200 hover:scale-110"
                        title="Change Avatar"
                        type="button"
                      >
                        <Camera className="h-5 w-5 text-white" />
                      </button>
                    </div>

                    <h2 className="text-2xl font-semibold text-white mb-2 mt-4">
                      {profile.full_name || profile.username}
                    </h2>
                    <p className="text-muted-foreground">{profile.identity}</p>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-violet-400/35 bg-violet-500/15 px-3 py-1">
                      <span className="text-[11px] uppercase tracking-wider text-violet-200">Level</span>
                      <span className="text-sm font-bold text-white">{level}</span>
                    </div>

                    {(profile.github_url || profile.linkedin_url) && (
                      <div className="flex gap-4 mt-4">
                        {profile.github_url && (
                          <a
                            href={profile.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                          >
                            <Github className="h-5 w-5" />
                            <span className="text-sm">GitHub</span>
                          </a>
                        )}
                        {profile.linkedin_url && (
                          <a
                            href={profile.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                          >
                            <Linkedin className="h-5 w-5" />
                            <span className="text-sm">LinkedIn</span>
                          </a>
                        )}
                      </div>
                    )}

                    <Link href="/settings" className="mt-4">
                      <Button variant="outline" className="border-slate-700 hover:bg-slate-800">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
                  </div>

                  {profile.about && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-white mb-3">About</h3>
                      <p className="text-slate-300 leading-relaxed">{profile.about}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-800/50">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-400">{projectsCount}</p>
                      <p className="text-sm text-slate-400 mt-1">Projects</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-400">{level}</p>
                      <p className="text-sm text-slate-400 mt-1">Level</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">{xpTotal}</p>
                      <p className="text-sm text-slate-400 mt-1">XP</p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-lg border border-slate-800/60 bg-slate-900/60 p-3 text-center">
                    <p className="text-sm text-slate-300">
                      Unlocked achievements: <span className="text-cyan-300 font-semibold">{achievementsCount}</span>
                    </p>
                    <div className="mt-3">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="rounded-full border-cyan-500/30 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20 hover:text-white"
                      >
                        <Link href="/profile/achievements">
                          <Trophy className="h-4 w-4 mr-1.5" />
                          View Achievements
                        </Link>
                      </Button>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>Level {level}</span>
                        <span>Level {level + 1}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500"
                          style={{ width: `${levelProgressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
