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

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getUser() {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login");
                return;
            }
            setUser(session.user);
            setLoading(false);
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
            description: "You don't have any projects yet.",
            cta: "Create Project",
            href: "/projects/create",
            icon: FolderKanban,
            borderClass: "hover:border-blue-500/60",
            glowClass: "from-blue-500/20 to-cyan-500/10",
        },
        {
            title: "My Applications",
            description: "There are no pending applications.",
            cta: "Browse Projects",
            href: "/projects",
            icon: FilePlus2,
            borderClass: "hover:border-purple-500/60",
            glowClass: "from-purple-500/20 to-pink-500/10",
        },
        {
            title: "Messages",
            description: "Your inbox is empty.",
            cta: "View Notifications",
            href: "/notifications",
            icon: MessageSquare,
            borderClass: "hover:border-green-500/60",
            glowClass: "from-green-500/20 to-emerald-500/10",
        },
    ];

    const breathingTransition = (delay = 0) => ({
        duration: 4.2,
        delay,
        repeat: Infinity,
        ease: "easeInOut" as const,
    });

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
                                        <NeonText color="cyan">Welcome</NeonText>
                                    </h1>
                                    <p className="text-slate-400">{user?.email}</p>
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
                                                animate={{ scale: [1, 1.012, 1], opacity: [0.98, 1, 0.98] }}
                                                transition={breathingTransition(index * 0.12)}
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
                            <div className="grid gap-6 lg:grid-cols-2">
                                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/45 backdrop-blur-sm p-6">
                                    <h2 className="text-lg font-semibold text-white mb-2">Quick Tip</h2>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        Keep your profile updated and add project details to get better collaboration matches.
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/45 backdrop-blur-sm p-6">
                                    <div className="flex items-center gap-2 mb-2 text-cyan-300">
                                        <Compass className="h-4 w-4" />
                                        <h2 className="text-lg font-semibold text-white">Next Step</h2>
                                    </div>
                                    <p className="text-slate-400 text-sm mb-4">
                                        Publish your first project and start receiving applications from developers.
                                    </p>
                                    <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-500 text-white">
                                        <Link href="/projects/create">Create your first project</Link>
                                    </Button>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </main>
            </div>
        </div>
    );
}
