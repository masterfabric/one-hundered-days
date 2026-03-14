"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { searchUsers } from "@/app/actions/users";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TiltCard, GradientBorder } from "@/components/effects/PremiumEffects";

interface Developer {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    website_url: string | null;
    github_url: string | null;
}

const containerVariants = {
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

interface DevelopersGridProps {
    searchQuery?: string;
}

export function DevelopersGrid({ searchQuery = "" }: DevelopersGridProps) {
    const [developers, setDevelopers] = useState<Developer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            try {
                console.log("[DevelopersGrid] Starting data fetch...");
                const query: Record<string, string> = {
                    limit: "1000", // Fetch all developers
                };
                if (searchQuery) {
                    query.search = searchQuery;
                    console.log("[DevelopersGrid] Search query:", searchQuery);
                }

                console.log("[DevelopersGrid] Calling searchUsers with query:", query);
                const result = await searchUsers(query);
                console.log("[DevelopersGrid] searchUsers sonucu:", {
                    success: result.success,
                    dataLength: result.data?.length || 0,
                    data: result.data
                });

                if (!result.success) {
                    console.error("[DevelopersGrid] searchUsers failed:", result);
                    throw new Error("An error occurred while loading developers.");
                }

                const developersData = result.data || [];
                console.log("[DevelopersGrid] Number of developers fetched:", developersData.length);

                if (!cancelled) {
                    setDevelopers(developersData);
                    if (developersData.length === 0) {
                        console.warn("[DevelopersGrid] No developers found!");
                    }
                }
            } catch (err) {
                console.error("[DevelopersGrid] Error caught:", err);
                if (!cancelled) {
                    const errorMessage = err instanceof Error 
                        ? err.message 
                        : "Developers could not be loaded.";
                    setError(errorMessage);
                    console.error("[DevelopersGrid] Error message:", errorMessage);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                    console.log("[DevelopersGrid] Loading completed");
                }
            }
        }

        const timeoutId = setTimeout(load, 300);

        return () => {
            cancelled = true;
            clearTimeout(timeoutId);
        };
    }, [searchQuery]);

    return (
        <div className="container py-10">
            {loading && (
                <div className="text-center py-20">
                    <p className="text-muted-foreground text-lg">Loading developers...</p>
                </div>
            )}
            
            {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
                    <p className="text-red-400 font-semibold mb-2">An Error Occurred:</p>
                    <p className="text-red-300 text-sm">{error}</p>
                    <p className="text-red-200 text-xs mt-2">
                        Please check the console or refresh the page.
                    </p>
                </div>
            )}

            {!loading && developers.length === 0 && !error && (
                <div className="text-center py-20">
                    <p className="text-muted-foreground text-lg mb-2">No developers found yet.</p>
                    <p className="text-muted-foreground text-sm">
                        There may be no developers in the database, or something might have gone wrong.
                    </p>
                </div>
            )}

            {!loading && developers.length > 0 && (
                <motion.div
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                {developers.map((dev, index) => {
                    const colors = [
                        "from-blue-500 to-cyan-500",
                        "from-purple-500 to-pink-500",
                        "from-green-500 to-emerald-500",
                        "from-orange-500 to-amber-500",
                    ];
                    const color = colors[index % colors.length];
                    const isEmoji = dev.avatar_url?.startsWith("👨") || dev.avatar_url?.startsWith("👩") || dev.avatar_url?.startsWith("🧑");

                    return (
                        <motion.div key={dev.id} variants={itemVariants}>
                            <TiltCard>
                                <GradientBorder>
                                    <div className="bg-slate-900/90 backdrop-blur-sm rounded-2xl p-6 text-center relative overflow-hidden h-full flex flex-col items-center">
                                        {/* Glow */}
                                        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-gradient-to-b ${color} opacity-10 blur-3xl`} />

                                        <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-4xl mb-4 relative z-10`}>
                                            {dev.avatar_url && !isEmoji ? (
                                                <img src={dev.avatar_url} alt={dev.username} className="w-full h-full object-cover rounded-full" />
                                            ) : (
                                                <span>{dev.avatar_url || "🧑‍💻"}</span>
                                            )}
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-1">{dev.full_name || dev.username}</h3>
                                        <p className="text-white/50 text-sm mb-4">@{dev.username}</p>

                                        {dev.bio && (
                                            <p className="text-white/70 text-sm mb-6 line-clamp-2">{dev.bio}</p>
                                        )}

                                        <div className="mt-auto w-full">
                                            <Link href={`/profile/${dev.id}`} className="w-full block">
                                                <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800">
                                                    View Profile
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </GradientBorder>
                            </TiltCard>
                        </motion.div>
                    )
                })}
                </motion.div>
            )}

            {/* Debug info - show only in development */}
            {process.env.NODE_ENV === 'development' && !loading && (
                <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <p className="text-xs text-slate-400">
                        Debug: {developers.length} developers loaded. 
                        {error && ` Error: ${error}`}
                    </p>
                </div>
            )}
        </div>
    );
}
