"use client";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { User, Github, Globe, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getUserProfile } from "@/app/actions/users";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

interface ProfileData {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    website_url: string | null;
    github_url: string | null;
    created_at: string;
}

export default function UserProfilePage() {
    const params = useParams();
    const userId = params.id as string;
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadProfile() {
            if (!userId) return;
            
            setLoading(true);
            setError(null);
            try {
                const result = await getUserProfile(userId);
                if (result.success && result.data) {
                    setProfile(result.data as ProfileData);
                } else {
                    setError("Profil bulunamadı");
                }
            } catch (err) {
                console.error("Profile load error:", err);
                setError(err instanceof Error ? err.message : "Profil yüklenirken bir hata oluştu");
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, [userId]);

    const isEmoji = profile?.avatar_url?.startsWith("👨") || 
                    profile?.avatar_url?.startsWith("👩") || 
                    profile?.avatar_url?.startsWith("🧑");

    return (
        <div className="min-h-screen flex flex-col bg-slate-950">
            <Sidebar />
            <Header />
            <div className="flex flex-1 relative">
                <main className="flex-1 transition-all duration-300">
                    <div className="container py-10">
                        {loading && (
                            <div className="text-center py-20">
                                <p className="text-muted-foreground text-lg">Profil yükleniyor...</p>
                            </div>
                        )}

                        {error && (
                            <div className="text-center py-20">
                                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 max-w-md mx-auto">
                                    <p className="text-red-400 font-semibold mb-2">Hata</p>
                                    <p className="text-red-300 text-sm">{error}</p>
                                </div>
                            </div>
                        )}

                        {!loading && !error && profile && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="mb-8 space-y-6">
                                    <div className="text-center space-y-2">
                                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-purple-500">
                                                {profile.full_name || profile.username}
                                            </span>
                                        </h1>
                                        <p className="text-muted-foreground text-lg">
                                            @{profile.username}
                                        </p>
                                    </div>

                                    <div className="max-w-3xl mx-auto mt-12">
                                        <div className="rounded-xl border border-slate-800/50 bg-white/5 backdrop-blur-sm p-8">
                                            {/* Profile Header */}
                                            <div className="flex flex-col items-center mb-8">
                                                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 relative overflow-hidden">
                                                    {profile.avatar_url && !isEmoji ? (
                                                        <img 
                                                            src={profile.avatar_url} 
                                                            alt={profile.username} 
                                                            className="w-full h-full object-cover rounded-full"
                                                        />
                                                    ) : (
                                                        <span className="text-6xl">{profile.avatar_url || "🧑‍💻"}</span>
                                                    )}
                                                </div>
                                                <h2 className="text-2xl font-semibold text-white mb-2">
                                                    {profile.full_name || profile.username}
                                                </h2>
                                                <p className="text-muted-foreground">@{profile.username}</p>
                                                
                                                {/* Social Links */}
                                                {(profile.github_url || profile.website_url) && (
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
                                                        {profile.website_url && (
                                                            <a
                                                                href={profile.website_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                                                            >
                                                                <Globe className="h-5 w-5" />
                                                                <span className="text-sm">Website</span>
                                                            </a>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Bio */}
                                            {profile.bio && (
                                                <div className="mb-8">
                                                    <h3 className="text-lg font-semibold text-white mb-3">Hakkında</h3>
                                                    <p className="text-slate-300 leading-relaxed">{profile.bio}</p>
                                                </div>
                                            )}

                                            {/* Profile Stats */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-800/50">
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-blue-400">-</p>
                                                    <p className="text-sm text-slate-400 mt-1">Projeler</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-purple-400">-</p>
                                                    <p className="text-sm text-slate-400 mt-1">İşbirlikleri</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-green-400">-</p>
                                                    <p className="text-sm text-slate-400 mt-1">Başarılar</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
