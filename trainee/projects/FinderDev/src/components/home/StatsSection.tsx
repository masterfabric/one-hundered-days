"use client";

import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Reveal, NeonText, TiltCard } from "@/components/effects/PremiumEffects";
import { getHomeStats } from "@/app/actions/stats";

interface Stats {
    developers: number;
    projects: number;
    collaborations: number;
    satisfaction: number;
}

function formatNumber(num: number): string {
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K+';
    }
    return num.toString() + '+';
}

const defaultStats = [
    { key: 'developers', label: "Geliştirici", icon: "👨‍💻", color: "from-blue-500 to-cyan-500" },
    { key: 'projects', label: "Proje", icon: "🚀", color: "from-purple-500 to-pink-500" },
    { key: 'collaborations', label: "İşbirliği", icon: "🤝", color: "from-green-500 to-emerald-500" },
    { key: 'satisfaction', label: "Memnuniyet", icon: "⭐", color: "from-orange-500 to-amber-500", suffix: "%" },
];

function AnimatedCounter({ value, delay, color }: { value: string; delay: number; color: string }) {
    return (
        <motion.span
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.6, type: "spring", stiffness: 100 }}
            className={`text-5xl md:text-6xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}
        >
            {value}
        </motion.span>
    );
}

function StatCard({ stat, value, index }: { stat: typeof defaultStats[0]; value: string; index: number }) {
    return (
        <Reveal delay={index * 0.1}>
            <TiltCard glareEnable>
                <motion.div
                    whileHover={{ y: -5 }}
                    className="relative group"
                >
                    <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 text-center hover:border-blue-500/50 transition-all duration-300 relative overflow-hidden">
                        {/* Animated background glow */}
                        <motion.div
                            className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                        />

                        {/* Glow effect on hover */}
                        <motion.div
                            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"
                            style={{
                                background: `radial-gradient(circle at center, ${stat.color.includes("blue") ? "rgba(59,130,246,0.2)" : stat.color.includes("purple") ? "rgba(139,92,246,0.2)" : stat.color.includes("green") ? "rgba(34,197,94,0.2)" : "rgba(249,115,22,0.2)"}, transparent 70%)`
                            }}
                        />

                        <div className="relative z-10">
                            {/* Icon with animation */}
                            <motion.span
                                className="text-4xl mb-4 block"
                                animate={{
                                    rotate: [0, 5, -5, 0],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    delay: index * 0.5
                                }}
                            >
                                {stat.icon}
                            </motion.span>

                            {/* Animated value */}
                            <AnimatedCounter value={value} delay={index * 0.15} color={stat.color} />

                            {/* Label */}
                            <p className="text-white/60 mt-3 font-medium text-lg">{stat.label}</p>
                        </div>

                        {/* Decorative corner lines */}
                        <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-white/10 rounded-tl" />
                        <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-white/10 rounded-tr" />
                        <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-white/10 rounded-bl" />
                        <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-white/10 rounded-br" />
                    </div>
                </motion.div>
            </TiltCard>
        </Reveal>
    );
}

function LoadingSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-slate-900/50 rounded-2xl p-8 animate-pulse">
                    <div className="w-12 h-12 bg-slate-800 rounded-full mx-auto mb-4" />
                    <div className="h-12 bg-slate-800 rounded w-24 mx-auto mb-3" />
                    <div className="h-4 bg-slate-800 rounded w-20 mx-auto" />
                </div>
            ))}
        </div>
    );
}

export function StatsSection() {
    const ref = useRef(null);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            try {
                const result = await getHomeStats();
                if (result.success) {
                    setStats(result.data);
                }
            } catch (error) {
                console.error("Failed to load stats:", error);
            } finally {
                setLoading(false);
            }
        }
        loadStats();
    }, []);

    const getStatValue = (key: string, suffix?: string): string => {
        if (!stats) return "0";
        const value = stats[key as keyof Stats];
        if (suffix === "%") return value.toString() + "%";
        return formatNumber(value);
    };

    return (
        <section ref={ref} className="py-24 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-blue-950/10 to-slate-950" />

            {/* Animated background lines */}
            <div className="absolute inset-0 opacity-10">
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent w-full"
                        style={{ top: `${20 + i * 20}%` }}
                        animate={{
                            x: ["-100%", "100%"],
                            opacity: [0, 1, 0],
                        }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            delay: i * 0.5,
                            ease: "linear",
                        }}
                    />
                ))}
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <Reveal>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <motion.span
                            className="px-5 py-2.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-mono inline-block mb-6"
                            whileHover={{ scale: 1.05 }}
                        >
                            📊 Rakamlarla FinderDev
                        </motion.span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            <NeonText color="blue">Büyüyen Topluluğumuz</NeonText>
                        </h2>
                        <p className="text-white/60 max-w-2xl mx-auto text-lg">
                            FinderDev ile binlerce geliştirici bir araya geliyor ve harika projeler üretiyor.
                        </p>
                    </motion.div>
                </Reveal>

                {loading ? (
                    <LoadingSkeleton />
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {defaultStats.map((stat, index) => (
                            <StatCard
                                key={stat.key}
                                stat={stat}
                                value={getStatValue(stat.key, stat.suffix)}
                                index={index}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
