"use client";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { User, Github, Linkedin, Edit, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ProfilePage() {
    // Mock profile data - sadece UI için
    const profile = {
        username: "johndoe",
        full_name: "John Doe",
        avatar_url: null,
        bio: "Full-stack developer passionate about building amazing web applications.",
        github_url: "https://github.com",
        linkedin_url: "https://linkedin.com",
    };

    const isEmoji = false;

    return (
        <div className="min-h-screen flex flex-col bg-slate-950">
            <Sidebar />
            <Header />
            <div className="flex flex-1 relative">
                <main className="flex-1 transition-all duration-300">
                    <div className="container py-10">
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
                                            <div className="relative group">
                                                <div 
                                                    className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative overflow-hidden cursor-pointer transition-all duration-300 hover:ring-4 hover:ring-blue-500/50"
                                                >
                                                    {profile.avatar_url && !isEmoji ? (
                                                        <img 
                                                            src={profile.avatar_url} 
                                                            alt={profile.username} 
                                                            className="w-full h-full object-cover rounded-full"
                                                        />
                                                    ) : (
                                                        <span className="text-6xl">🧑‍💻</span>
                                                    )}
                                                    
                                                    {/* Upload Overlay */}
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-full">
                                                        <Camera className="h-8 w-8 text-white" />
                                                    </div>
                                                </div>
                                                
                                                {/* Upload Button Badge */}
                                                <motion.button
                                                    className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center shadow-lg border-2 border-slate-900 transition-all duration-200 hover:scale-110"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    title="Avatar Değiştir"
                                                >
                                                    <Camera className="h-5 w-5 text-white" />
                                                </motion.button>
                                            </div>
                                            
                                            <h2 className="text-2xl font-semibold text-white mb-2 mt-4">
                                                {profile.full_name || profile.username}
                                            </h2>
                                            <p className="text-muted-foreground">@{profile.username}</p>
                                            
                                            {/* Social Links */}
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

                                            {/* Edit Profile Button */}
                                            <Link href="/settings" className="mt-4">
                                                <Button variant="outline" className="border-slate-700 hover:bg-slate-800">
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Profili Düzenle
                                                </Button>
                                            </Link>
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
                    </div>
                </main>
            </div>
        </div>
    );
}
