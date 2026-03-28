import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  CircleDashed,
  Rocket,
  Handshake,
  Flag,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";

type AchievementDefinition = {
  id: string;
  code: string;
};

type UserAchievement = {
  achievement_id: string;
  earned_at: string;
};

const MOCK_ACHIEVEMENTS = [
  {
    code: "first_project_created",
    title: "Project Starter",
    description: "Create your first project.",
    xp: 40,
    icon: Rocket,
  },
  {
    code: "first_request_sent",
    title: "Explorer",
    description: "Send your first join request.",
    xp: 20,
    icon: Handshake,
  },
  {
    code: "first_request_accepted",
    title: "Teammate",
    description: "Get accepted into a project team.",
    xp: 50,
    icon: UserCheck,
  },
  {
    code: "first_project_completed",
    title: "Closer",
    description: "Complete your first owned project.",
    xp: 120,
    icon: Flag,
  },
  {
    code: "consistency_streak_7",
    title: "Consistency",
    description: "Stay active for 7 days in a row. (Mock)",
    xp: 70,
    icon: Sparkles,
  },
];

export default async function ProfileAchievementsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [progressResult, definitionsResult, earnedResult] = await Promise.all([
    supabase
      .from("user_progress")
      .select("xp_total, level")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("achievement_definitions")
      .select("id, code")
      .in(
        "code",
        MOCK_ACHIEVEMENTS.map((item) => item.code)
      ),
    supabase
      .from("user_achievements")
      .select("achievement_id, earned_at")
      .eq("user_id", user.id),
  ]);

  const level = Number((progressResult.data as any)?.level ?? 1);
  const xpTotal = Number((progressResult.data as any)?.xp_total ?? 0);

  const definitions = (definitionsResult.data || []) as AchievementDefinition[];
  const earnedRows = (earnedResult.data || []) as UserAchievement[];
  const codeById = new Map(definitions.map((d) => [d.id, d.code]));
  const earnedCodeMap = new Map<string, string>();

  for (const row of earnedRows) {
    const code = codeById.get(row.achievement_id);
    if (code && !earnedCodeMap.has(code)) {
      earnedCodeMap.set(code, row.earned_at);
    }
  }

  const unlockedCount = MOCK_ACHIEVEMENTS.filter((item) =>
    earnedCodeMap.has(item.code)
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Sidebar />
      <Header />
      <div className="flex flex-1 relative">
        <main className="flex-1 transition-all duration-300">
          <div className="container py-10 space-y-8">
            <div className="flex items-center justify-between gap-3">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-full border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
              >
                <Link href="/profile">
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  Back to Profile
                </Link>
              </Button>
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-purple-500">
                  Achievements
                </span>
              </h1>
              <p className="text-muted-foreground text-lg">
                {unlockedCount}/{MOCK_ACHIEVEMENTS.length} unlocked • Level {level} • {xpTotal} XP
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {MOCK_ACHIEVEMENTS.map((achievement) => {
                const Icon = achievement.icon;
                const earnedAt = earnedCodeMap.get(achievement.code);
                const unlocked = Boolean(earnedAt);
                return (
                  <div
                    key={achievement.code}
                    className={`rounded-xl border p-5 backdrop-blur-sm transition-all duration-300 ${
                      unlocked
                        ? "border-emerald-400/30 bg-emerald-500/10 shadow-[0_0_16px_rgba(16,185,129,0.18)]"
                        : "border-slate-800/60 bg-white/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="h-10 w-10 rounded-lg bg-slate-900/70 border border-white/10 flex items-center justify-center">
                        <Icon className={`h-5 w-5 ${unlocked ? "text-emerald-300" : "text-slate-300"}`} />
                      </div>
                      {unlocked ? (
                        <div className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-200">
                          Unlocked
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-600/50 bg-slate-700/35 px-2.5 py-1 text-xs font-medium text-slate-300">
                          <CircleDashed className="h-3.5 w-3.5" />
                          Not earned yet
                        </div>
                      )}
                    </div>
                    <h2 className="mt-3 text-white font-semibold text-lg">{achievement.title}</h2>
                    <p className="mt-1 text-sm text-slate-300">{achievement.description}</p>
                    <p className="mt-3 text-xs text-cyan-300 font-semibold">+{achievement.xp} XP</p>
                    {earnedAt && (
                      <p className="mt-2 text-xs text-emerald-300 inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Earned: {new Date(earnedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
