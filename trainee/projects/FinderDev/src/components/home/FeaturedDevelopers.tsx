"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { TiltCard, GradientBorder, Reveal, NeonText, Floating } from "@/components/effects/PremiumEffects";
import { getFeaturedDevelopers } from "@/app/actions/users";

interface FeaturedDeveloper {
    id: string;
    name: string;
    username: string;
    role: string;
    avatar: string;
    skills: string[];
    projects: number;
    rating: number;
    color: string;
}

function DeveloperCard({ developer, index }: { developer: FeaturedDeveloper; index: number }) {
    const isEmojiAvatar = developer.avatar.startsWith("👨") || developer.avatar.startsWith("👩") || developer.avatar.startsWith("🧑");

    return (
        <Reveal delay={index * 0.1}>
            <TiltCard>
                <GradientBorder animate>
                    <div className="bg-slate-900/90 backdrop-blur-sm rounded-2xl p-6 text-center relative overflow-hidden">
                        {/* Background glow */}
                        <motion.div
                            className={`absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-gradient-to-b ${developer.color} opacity-10 blur-3xl`}
                            animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.2, 1] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        />

                        {/* Avatar */}
                        <Floating duration={4} distance={8}>
                            <motion.div
                                className={`w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br ${developer.color} flex items-center justify-center text-5xl relative overflow-hidden`}
                                whileHover={{}}
                                transition={{ duration: 0.3 }}
                            >
                                {isEmojiAvatar ? (
                                    developer.avatar
                                ) : (
                                    <img
                                        src={developer.avatar}
                                        alt={developer.name}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                                {/* Ring effect */}
                                <motion.div
                                    className="absolute inset-0 rounded-full border-2 border-current opacity-50"
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    style={{ borderColor: developer.color.includes("blue") ? "#3b82f6" : developer.color.includes("purple") ? "#8b5cf6" : developer.color.includes("green") ? "#22c55e" : "#f97316" }}
                                />
                            </motion.div>
                        </Floating>

                        {/* Info */}
                        <h3 className="text-xl font-bold text-white mb-1">{developer.name}</h3>
                        <p className="text-white/50 text-sm mb-3">{developer.role}</p>

                        {/* Rating with animation */}
                        <motion.div
                            className="flex items-center justify-center gap-1 mb-4"
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                        >
                            <motion.span
                                animate={{ rotate: [0, 15, -15, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                ⭐
                            </motion.span>
                            <span className="text-white font-bold text-lg">{developer.rating.toFixed(1)}</span>
                            <span className="text-white/40 text-sm">({developer.projects} proje)</span>
                        </motion.div>

                        {/* Skills */}
                        {developer.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 justify-center mb-4">
                                {developer.skills.map((skill, i) => (
                                    <motion.span
                                        key={skill}
                                        className="px-3 py-1 bg-slate-800/80 text-white/70 text-xs rounded-full border border-slate-700"
                                        initial={{ opacity: 0, scale: 0 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.5 + i * 0.1 }}
                                        whileHover={{
                                            scale: 1.1,
                                            backgroundColor: "rgba(59, 130, 246, 0.2)",
                                            borderColor: "rgba(59, 130, 246, 0.5)"
                                        }}
                                    >
                                        {skill}
                                    </motion.span>
                                ))}
                            </div>
                        )}

                        {/* Button */}
                        <motion.div whileHover={{}} whileTap={{}}>
                            <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 w-full">
                                Profili Gör →
                            </Button>
                        </motion.div>
                    </div>
                </GradientBorder>
            </TiltCard>
        </Reveal>
    );
}

function LoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-slate-900/50 rounded-2xl p-6 animate-pulse">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-slate-800" />
                    <div className="h-6 bg-slate-800 rounded w-3/4 mx-auto mb-2" />
                    <div className="h-4 bg-slate-800 rounded w-1/2 mx-auto mb-4" />
                    <div className="h-4 bg-slate-800 rounded w-24 mx-auto mb-4" />
                    <div className="h-8 bg-slate-800 rounded w-full" />
                </div>
            ))}
        </div>
    );
}

export function FeaturedDevelopers() {
    const [developers, setDevelopers] = useState<FeaturedDeveloper[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadDevelopers() {
            try {
                const result = await getFeaturedDevelopers(4);
                if (result.success && result.data.length > 0) {
                    setDevelopers(result.data);
                }
            } catch (error) {
                console.error("Failed to load featured developers:", error);
            } finally {
                setLoading(false);
            }
        }
        loadDevelopers();
    }, []);

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-purple-950/10 to-slate-950" />

            <div className="container mx-auto px-4 relative z-10">
                {/* Section Header */}
                <Reveal>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <motion.span
                            className="px-5 py-2.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-mono inline-block mb-6"
                            whileHover={{}}
                        >
                            ⭐ En İyi Geliştiriciler
                        </motion.span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            <NeonText color="purple">Yetenekli Geliştiriciler</NeonText>
                        </h2>
                        <p className="text-white/60 max-w-2xl mx-auto text-lg">
                            Topluluğumuzun en aktif ve başarılı geliştiricileriyle tanışın.
                        </p>
                    </motion.div>
                </Reveal>

                {/* Developers Grid */}
                {loading ? (
                    <LoadingSkeleton />
                ) : developers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {developers.map((developer, index) => (
                            <DeveloperCard key={developer.id} developer={developer} index={index} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-white/50 text-lg">Henüz geliştirici bulunmuyor.</p>
                        <p className="text-white/30 text-sm mt-2">İlk geliştirici olun!</p>
                    </div>
                )}

                {/* View All Button */}
                <Reveal delay={0.5}>
                    <motion.div className="text-center mt-16">
                        <motion.div
                            whileHover={{}}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button asChild variant="outline" size="lg" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 px-8 py-6 text-lg">
                                <Link href="/developers">
                                    Tüm Geliştiricileri Gör
                                    <motion.span
                                        className="ml-2"
                                        animate={{ x: [0, 5, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        →
                                    </motion.span>
                                </Link>
                            </Button>
                        </motion.div>
                    </motion.div>
                </Reveal>
            </div>
        </section>
    );
}
