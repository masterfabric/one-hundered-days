"use client";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
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
                                        Settings
                                    </span>
                                </h1>
                                <p className="text-muted-foreground text-lg">
                                    Manage your account settings and preferences
                                </p>
                            </div>
                            
                            <div className="max-w-2xl mx-auto mt-12 space-y-6">
                                {/* Profile Settings */}
                                <div className="rounded-xl border border-slate-800/50 bg-white/5 backdrop-blur-sm p-6">
                                    <h2 className="text-xl font-semibold text-white mb-4">Profile Settings</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-slate-300 mb-2 block">
                                                Display Name
                                            </label>
                                            <Input 
                                                placeholder="Enter your display name"
                                                className="bg-white/5 border-slate-800/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-slate-300 mb-2 block">
                                                Bio
                                            </label>
                                            <textarea 
                                                placeholder="Tell us about yourself"
                                                className="w-full px-3 py-2 rounded-md bg-white/5 border border-slate-800/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                                rows={4}
                                            />
                                        </div>
                                        <Button className="bg-blue-600 hover:bg-blue-500">
                                            Save Changes
                                        </Button>
                                    </div>
                                </div>

                                {/* Account Settings */}
                                <div className="rounded-xl border border-slate-800/50 bg-white/5 backdrop-blur-sm p-6">
                                    <h2 className="text-xl font-semibold text-white mb-4">Account Settings</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-slate-300 mb-2 block">
                                                Email
                                            </label>
                                            <Input 
                                                type="email"
                                                placeholder="your.email@example.com"
                                                className="bg-white/5 border-slate-800/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-slate-300 mb-2 block">
                                                Change Password
                                            </label>
                                            <Input 
                                                type="password"
                                                placeholder="Enter new password"
                                                className="bg-white/5 border-slate-800/50 mb-2"
                                            />
                                            <Input 
                                                type="password"
                                                placeholder="Confirm new password"
                                                className="bg-white/5 border-slate-800/50"
                                            />
                                        </div>
                                        <Button className="bg-blue-600 hover:bg-blue-500">
                                            Update Account
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
