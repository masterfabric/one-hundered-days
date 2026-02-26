"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { TiltCard, GradientBorder, Reveal, NeonText } from "@/components/effects/PremiumEffects";
import { getFeaturedProjects } from "@/app/actions/projects";

interface FeaturedProject {
    id: string;
    title: string;
    description: string;
    tags: string[];
    members: number;
    progress: number;
    image: string;
    color: string;
    status: string;
    repoUrl: string | null;
    demoUrl: string | null;
}

function ProjectCard({ project, index }: { project: FeaturedProject; index: number }) {
    return (
        <Reveal delay={index * 0.1} direction={index % 2 === 0 ? "left" : "right"}>
            <TiltCard className="h-full">
                <GradientBorder animate>
                    <div className="bg-slate-900/90 backdrop-blur-sm rounded-2xl overflow-hidden h-full">
                        {/* Header with gradient */}
                        <div className={`h-36 bg-gradient-to-br ${project.color} relative flex items-center justify-center overflow-hidden group`}>
                            <motion.span
                                className="text-6xl"
                                whileHover={{}}
                                transition={{ duration: 0.5 }}
                            >
                                {project.image}
                            </motion.span>
                            {/* Animated overlay pattern */}
                            <motion.div
                                className="absolute inset-0 opacity-20"
                                style={{
                                    backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                                    backgroundSize: "24px 24px"
                                }}
                                animate={{
                                    backgroundPosition: ["0px 0px", "24px 24px"],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                            />
                            {/* Shine effect on hover */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100"
                                initial={{ x: "-100%" }}
                                whileHover={{}}
                                transition={{ duration: 0.8 }}
                            />
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                                {project.title}
                            </h3>
                            <p className="text-white/60 text-sm mb-4 line-clamp-2">
                                {project.description}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {project.tags.slice(0, 3).map((tag) => (
                                    <motion.span
                                        key={tag}
                                        className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full border border-blue-500/20"
                                        whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.2)" }}
                                    >
                                        {tag}
                                    </motion.span>
                                ))}
                            </div>

                            {/* Progress bar */}
                            <div className="mb-4">
                                <div className="flex justify-between text-xs text-white/50 mb-1">
                                    <span>İlerleme</span>
                                    <span>{project.progress}%</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full bg-gradient-to-r ${project.color}`}
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${project.progress}%` }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.5 + index * 0.1, duration: 1, ease: "easeOut" }}
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-white/50 text-sm">
                                    <span className="mr-1">👥</span>
                                    <span>{project.members} üye</span>
                                </div>
                                <motion.div whileHover={{ x: 5 }}>
                                    <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                                        Detaylar →
                                    </Button>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </GradientBorder>
            </TiltCard>
        </Reveal>
    );
}

function LoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-slate-900/50 rounded-2xl overflow-hidden animate-pulse">
                    <div className="h-36 bg-slate-800" />
                    <div className="p-6 space-y-4">
                        <div className="h-6 bg-slate-800 rounded w-3/4" />
                        <div className="h-4 bg-slate-800 rounded w-full" />
                        <div className="flex gap-2">
                            <div className="h-6 bg-slate-800 rounded-full w-16" />
                            <div className="h-6 bg-slate-800 rounded-full w-16" />
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function FeaturedProjects() {
    const [projects, setProjects] = useState<FeaturedProject[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProjects() {
            try {
                const result = await getFeaturedProjects(4);
                if (result.success && result.data.length > 0) {
                    setProjects(result.data);
                }
            } catch (error) {
                console.error("Failed to load featured projects:", error);
            } finally {
                setLoading(false);
            }
        }
        loadProjects();
    }, []);

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950" />

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
                            className="px-5 py-2.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-mono inline-block mb-6"
                            whileHover={{}}
                        >
                            🔥 Öne Çıkan Projeler
                        </motion.span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            <NeonText color="cyan">Heyecan Verici Projeler</NeonText>
                        </h2>
                        <p className="text-white/60 max-w-2xl mx-auto text-lg">
                            Topluluğumuzun üzerinde çalıştığı en popüler ve yenilikçi projeler.
                        </p>
                    </motion.div>
                </Reveal>

                {/* Projects Grid */}
                {loading ? (
                    <LoadingSkeleton />
                ) : projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {projects.map((project, index) => (
                            <ProjectCard key={project.id} project={project} index={index} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-white/50 text-lg">Henüz proje bulunmuyor.</p>
                        <p className="text-white/30 text-sm mt-2">İlk projeyi ekleyen siz olun!</p>
                    </div>
                )}

                {/* View All Button */}
                <Reveal delay={0.5}>
                    <motion.div className="text-center mt-16">
                        <motion.div
                            whileHover={{}}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button asChild variant="outline" size="lg" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 px-8 py-6 text-lg">
                                <Link href="/projects">
                                    Tüm Projeleri Gör
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
