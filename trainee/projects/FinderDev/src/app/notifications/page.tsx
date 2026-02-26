"use client";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
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
                                        Notifications
                                    </span>
                                </h1>
                                <p className="text-muted-foreground text-lg">
                                    Stay updated with your project activities
                                </p>
                            </div>
                            
                            <div className="max-w-2xl mx-auto mt-12">
                                <div className="flex flex-col items-center justify-center py-16 px-6 rounded-xl border border-slate-800/50 bg-white/5 backdrop-blur-sm">
                                    <div className="h-16 w-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                                        <Bell className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-white mb-2">No notifications yet</h2>
                                    <p className="text-muted-foreground text-center">
                                        You'll see notifications about your projects, applications, and messages here.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
