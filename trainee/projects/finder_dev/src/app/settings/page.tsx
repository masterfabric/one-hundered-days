"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { ToastHelper } from "@/lib/toastHelper";

type ProfileVisibility = "public" | "members_only";

export default function SettingsPage() {
    const [userId, setUserId] = useState<string | null>(null);
    const [displayName, setDisplayName] = useState("");
    const [bio, setBio] = useState("");
    const [visibility, setVisibility] = useState<ProfileVisibility>("public");
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingVisibility, setIsSavingVisibility] = useState(false);

    useEffect(() => {
        async function loadSettings() {
            const { data: authResult } = await supabase.auth.getUser();
            const currentUser = authResult.user;
            if (!currentUser) {
                ToastHelper.show("Please log in first", {
                    type: "warning",
                    description: "You need an active session to manage settings.",
                    position: "top-right",
                });
                return;
            }

            setUserId(currentUser.id);

            const { data: profileData, error } = await supabase
                .from("profiles")
                .select("full_name, bio, visibility")
                .eq("id", currentUser.id)
                .maybeSingle();

            if (error) {
                ToastHelper.show("Settings could not be loaded", {
                    type: "error",
                    description: error.message,
                    position: "top-right",
                });
                return;
            }

            setDisplayName(profileData?.full_name || "");
            setBio(profileData?.bio || "");
            setVisibility((profileData?.visibility as ProfileVisibility) || "public");
        }

        loadSettings();
    }, []);

    async function saveProfileSettings() {
        if (!userId) return;
        setIsSavingProfile(true);
        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    full_name: displayName || null,
                    bio: bio || null,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", userId);

            if (error) throw error;

            ToastHelper.show("Profile settings updated", {
                type: "success",
                description: "Display name and bio saved successfully.",
                position: "top-right",
            });
        } catch (err) {
            ToastHelper.show("Failed to save profile settings", {
                type: "error",
                description: err instanceof Error ? err.message : "Unknown error",
                position: "top-right",
            });
        } finally {
            setIsSavingProfile(false);
        }
    }

    async function saveVisibilitySettings() {
        if (!userId) return;
        setIsSavingVisibility(true);
        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    visibility,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", userId);

            if (error) throw error;

            ToastHelper.show("Profile visibility updated", {
                type: "success",
                description:
                    visibility === "public"
                        ? "Your profile is now visible to everyone."
                        : "Your profile is now visible to signed-in users only.",
                position: "top-right",
            });
        } catch (err) {
            ToastHelper.show("Failed to update visibility", {
                type: "error",
                description: err instanceof Error ? err.message : "Unknown error",
                position: "top-right",
            });
        } finally {
            setIsSavingVisibility(false);
        }
    }

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
                                                value={displayName}
                                                onChange={(e) => setDisplayName(e.target.value)}
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
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                            />
                                        </div>
                                        <Button
                                            className="bg-blue-600 hover:bg-blue-500"
                                            onClick={saveProfileSettings}
                                            disabled={!userId || isSavingProfile}
                                        >
                                            {isSavingProfile ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </div>
                                </div>

                                {/* Profile Visibility */}
                                <div className="rounded-xl border border-slate-800/50 bg-white/5 backdrop-blur-sm p-6">
                                    <h2 className="text-xl font-semibold text-white mb-4">Profile Visibility</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-slate-300 mb-2 block">
                                                Who can view your profile?
                                            </label>
                                            <div className="flex flex-col gap-3 rounded-lg border border-slate-800/60 bg-slate-900/50 p-4">
                                                <label className="flex items-center gap-3 text-slate-200 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="profile-visibility"
                                                        value="public"
                                                        checked={visibility === "public"}
                                                        onChange={() => setVisibility("public")}
                                                    />
                                                    <span>Public (everyone can view)</span>
                                                </label>
                                                <label className="flex items-center gap-3 text-slate-200 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="profile-visibility"
                                                        value="members_only"
                                                        checked={visibility === "members_only"}
                                                        onChange={() => setVisibility("members_only")}
                                                    />
                                                    <span>Members only (signed-in users only)</span>
                                                </label>
                                            </div>
                                        </div>
                                        <Button
                                            className="bg-blue-600 hover:bg-blue-500"
                                            onClick={saveVisibilitySettings}
                                            disabled={!userId || isSavingVisibility}
                                        >
                                            {isSavingVisibility ? "Updating..." : "Update Visibility"}
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
