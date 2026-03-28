"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import {
    GradientBorder,
    NeonText,
    Reveal,
} from "@/components/effects/PremiumEffects";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { Compass, FilePlus2, FolderKanban, MessageSquare, Sparkles } from "lucide-react";

type DashboardMetrics = {
    projects: number;
    completedProjects: number;
    collaborations: number;
    unreadNotifications: number;
    xpTotal: number;
    level: number;
    achievements: number;
};

type ActivityItem = {
    id: string;
    label: string;
    timestamp: string;
};

function formatActivityTime(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Unknown time";
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

export default function DashboardPage() {
    const router = useRouter();
    const [username, setUsername] = useState("Developer");
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        projects: 0,
        completedProjects: 0,
        collaborations: 0,
        unreadNotifications: 0,
        xpTotal: 0,
        level: 1,
        achievements: 0,
    });
    const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getUser() {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login");
                return;
            }
            const currentUser = session.user;

            try {
                const [
                    profileResult,
                    projectsCountResult,
                    completedProjectsCountResult,
                    collaborationsCountResult,
                    recentProjectsResult,
                    progressResult,
                    achievementsResult,
                ] = await Promise.all([
                    supabase
                        .from("profiles")
                        .select("username, full_name")
                        .eq("id", currentUser.id)
                        .maybeSingle(),
                    supabase
                        .from("projects")
                        .select("id", { count: "exact", head: true })
                        .eq("owner_id", currentUser.id),
                    supabase
                        .from("projects")
                        .select("id", { count: "exact", head: true })
                        .eq("owner_id", currentUser.id)
                        .eq("status", "completed"),
                    supabase
                        .from("project_members")
                        .select("id", { count: "exact", head: true })
                        .eq("user_id", currentUser.id)
                        .eq("status", "accepted"),
                    supabase
                        .from("projects")
                        .select("id, title, created_at, updated_at")
                        .eq("owner_id", currentUser.id)
                        .order("updated_at", { ascending: false })
                        .limit(4),
                    supabase
                        .from("user_progress")
                        .select("xp_total, level")
                        .eq("user_id", currentUser.id)
                        .maybeSingle(),
                    supabase
                        .from("user_achievements")
                        .select("id", { count: "exact", head: true })
                        .eq("user_id", currentUser.id),
                ]);

                const fallbackUsername =
                    profileResult.data?.username ||
                    profileResult.data?.full_name ||
                    currentUser.user_metadata?.user_name ||
                    currentUser.email?.split("@")[0] ||
                    "Developer";

                setUsername(fallbackUsername);
                setMetrics({
                    projects: projectsCountResult.count ?? 0,
                    completedProjects: completedProjectsCountResult.count ?? 0,
                    collaborations: collaborationsCountResult.count ?? 0,
                    unreadNotifications: 0,
                    xpTotal: Number(progressResult.data?.xp_total ?? 0),
                    level: Number(progressResult.data?.level ?? 1),
                    achievements: achievementsResult.count ?? 0,
                });

                const activities =
                    recentProjectsResult.data?.map((project: any) => ({
                        id: project.id,
                        label: `Updated project: ${project.title || "Untitled Project"}`,
                        timestamp: project.updated_at || project.created_at || new Date().toISOString(),
                    })) || [];

                setRecentActivities(activities);
            } catch (error) {
                console.error("[Dashboard] Failed to load metrics:", error);
            } finally {
                setLoading(false);
            }
        }
        getUser();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                Loading...
            </div>
        );
    }

    const dashboardCards = [
        {
            title: "My Projects",
            description:
                metrics.projects === 0
                    ? "You don't have any projects yet."
                    : `${metrics.projects} projects total • ${metrics.completedProjects} completed.`,
            cta: metrics.projects === 0 ? "Create Project" : "Manage Projects",
            href: metrics.projects === 0 ? "/projects/create" : "/my-projects",
            icon: FolderKanban,
            borderClass: "hover:border-blue-500/60",
            glowClass: "from-blue-500/20 to-cyan-500/10",
        },
        {
            title: "Collaborations",
            description:
                metrics.collaborations === 0
                    ? "You have no active collaborations yet."
                    : `You're currently collaborating on ${metrics.collaborations} project(s).`,
            cta: "Browse Projects",
            href: "/projects",
            icon: FilePlus2,
            borderClass: "hover:border-purple-500/60",
            glowClass: "from-purple-500/20 to-pink-500/10",
        },
        {
            title: "Messages",
            description:
                metrics.unreadNotifications > 0
                    ? `You have ${metrics.unreadNotifications} unread notification(s).`
                    : "No unread notifications.",
            cta: "View Notifications",
            href: "/notifications",
            icon: MessageSquare,
            borderClass: "hover:border-green-500/60",
            glowClass: "from-green-500/20 to-emerald-500/10",
        },
    ];

    const firstName = username.trim().split(/\s+/)[0] || username;

    return (
        <div className="min-h-screen flex flex-col bg-slate-950">
            <Sidebar />
            <Header />
            <div className="flex flex-1 relative">
                <main className="flex-1 transition-all duration-300">
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -top-20 right-10 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
                        <div className="absolute bottom-0 left-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
                    </div>

                    <div className="container py-10 space-y-8 relative z-10">
                        <Reveal>
                            <div className="relative overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/50 backdrop-blur-sm p-6 md:p-8">
                                <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl" />
                                <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl" />
                                <div className="relative z-10">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs text-cyan-300 mb-4">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        Workspace Overview
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                                        <NeonText color="cyan">{`Welcome, ${firstName}`}</NeonText>
                                    </h1>
                                </div>
                            </div>
                        </Reveal>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {dashboardCards.map((card, index) => {
                                const Icon = card.icon;
                                return (
                                    <Reveal key={card.title} delay={index * 0.08}>
                                        <GradientBorder animate className="h-full">
                                            <motion.div
                                                whileHover={{ scale: 1.012 }}
                                                transition={{ duration: 0.2, ease: "easeOut" }}
                                                className={`group h-full rounded-2xl border border-slate-800 bg-slate-900/65 p-6 backdrop-blur-sm transition-colors duration-300 ${card.borderClass}`}
                                            >
                                                <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${card.glowClass} border border-white/10`}>
                                                    <Icon className="h-5 w-5 text-white" />
                                                </div>

                                                <h3 className="text-xl font-semibold text-white mb-2">
                                                    {card.title}
                                                </h3>
                                                <p className="text-slate-400 text-sm mb-6">
                                                    {card.description}
                                                </p>

                                                <Button asChild className="w-full" variant="secondary">
                                                    <Link href={card.href}>{card.cta}</Link>
                                                </Button>
                                            </motion.div>
                                        </GradientBorder>
                                    </Reveal>
                                );
                            })}
                        </div>

                        <Reveal delay={0.18}>
                            <div className="grid gap-6 lg:grid-cols-3">
                                <Link
                                    href="/profile/achievements"
                                    className="rounded-2xl border border-slate-800/80 bg-slate-900/45 backdrop-blur-sm p-6 block transition-all duration-200 hover:border-cyan-500/40 hover:bg-slate-900/65 hover:shadow-[0_0_18px_rgba(34,211,238,0.18)]"
                                >
                                    <h2 className="text-lg font-semibold text-white mb-2">Achievements</h2>
                                    <p className="text-slate-300 text-sm leading-relaxed mb-2">
                                        Level: <span className="text-cyan-300 font-semibold">{metrics.level}</span> • XP:{" "}
                                        <span className="text-purple-300 font-semibold">{metrics.xpTotal}</span>
                                    </p>
                                    <p className="text-xs text-slate-500 mb-3">
                                        Total unlocked achievements: {metrics.achievements}
                                    </p>
                                    <p className="text-xs text-cyan-300 font-medium">Open achievements →</p>
                                </Link>
                                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/45 backdrop-blur-sm p-6">
                                    <div className="flex items-center gap-2 mb-2 text-cyan-300">
                                        <Compass className="h-4 w-4" />
                                        <h2 className="text-lg font-semibold text-white">Next Step</h2>
                                    </div>
                                    <p className="text-slate-400 text-sm mb-4">
                                        Publish your first project and start receiving applications from developers.
                                    </p>
                                    <Button
                                        asChild
                                        size="sm"
                                        className="group rounded-full px-5 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 hover:from-blue-400 hover:via-purple-400 hover:to-purple-500 hover:shadow-blue-500/30 hover:-translate-y-[1px] text-white font-medium transition-all duration-500 delay-75 ease-out"
                                    >
                                        <Link href="/projects/create">Create your first project</Link>
                                    </Button>
                                </div>
                                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/45 backdrop-blur-sm p-6">
                                    <h2 className="text-lg font-semibold text-white mb-2">Recent Activity</h2>
                                    {recentActivities.length === 0 ? (
                                        <p className="text-slate-400 text-sm leading-relaxed">
                                            No recent activity yet. Create or update a project to see activity here.
                                        </p>
                                    ) : (
                                        <ul className="space-y-3">
                                            {recentActivities.map((activity) => (
                                                <li
                                                    key={activity.id}
                                                    className="rounded-lg border border-slate-800/60 bg-slate-900/70 p-3 transition-all duration-200 hover:border-purple-500/40 hover:bg-slate-900/85 hover:shadow-[0_0_16px_rgba(168,85,247,0.2)]"
                                                >
                                                    <Link href={`/projects/${activity.id}`} className="block">
                                                        <p className="text-sm text-slate-200">{activity.label}</p>
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            {formatActivityTime(activity.timestamp)}
                                                        </p>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </main>
            </div>
        </div>
    );
}
