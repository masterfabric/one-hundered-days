"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GradientBorder, Reveal } from "@/components/effects/PremiumEffects";
import Link from "next/link";
import { Github, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { signUpWithPasswordAction } from "@/app/actions/auth";

export function RegisterForm() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // Input validation
            if (!name || !name.trim()) {
                setError("Please enter your name.");
                setIsLoading(false);
                return;
            }

            if (!email || !email.trim()) {
                setError("Please enter your email address.");
                setIsLoading(false);
                return;
            }

            if (!password || password.length < 6) {
                setError("Password must be at least 6 characters.");
                setIsLoading(false);
                return;
            }

            if (password !== confirmPassword) {
                setError("Passwords do not match.");
                setIsLoading(false);
                return;
            }

            const result = await signUpWithPasswordAction({
                fullName: name.trim(),
                email: email.trim().toLowerCase(),
                password,
            });

            if (!result.success) {
                setError(result.error || "An issue occurred while signing up.");
                setIsLoading(false);
                return;
            }

            if (result.needsEmailConfirmation) {
                setNeedsEmailConfirmation(true);
                setSuccess(true);
            } else {
                setSuccess(true);
                router.replace("/dashboard");
                router.refresh();
            }
        } catch (err) {
            console.error("Registration error:", err);
            setError(err instanceof Error ? err.message : "An issue occurred while signing up.");
        }
        setIsLoading(false);
    };

    const handleGithubLogin = async () => {
        try {
            const { supabase } = await import("@/lib/supabase/client");
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (err: any) {
            console.error("Github login error:", err);
            setError("An issue occurred while signing up with GitHub.");
        }
    };

    if (success) {
        return (
            <Reveal>
                <div className="w-full mx-auto relative px-4" style={{ width: "680px", maxWidth: "95vw" }}>
                    <GradientBorder animate borderWidth={1}>
                        <div className="bg-slate-900/95 backdrop-blur-xl p-8 rounded-2xl relative overflow-hidden min-h-[400px] flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 border border-green-500/20">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                >
                                    <span className="text-4xl">🎉</span>
                                </motion.div>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                {needsEmailConfirmation ? "Email Confirmation Required" : "Welcome!"}
                            </h2>
                            <p className="text-slate-400 mb-8 italic">
                                {needsEmailConfirmation ? (
                                    <>
                                        Your account has been created successfully! <br />
                                        Activate your account by clicking the confirmation link sent to your email. <br />
                                        <span className="text-xs text-slate-500 mt-2 block">Don&apos;t forget to check your inbox!</span>
                                    </>
                                ) : (
                                    <>
                                        Your account has been created successfully. <br />
                                        You just took your first step into one of the most talented communities.
                                    </>
                                )}
                            </p>
                            <Link href={needsEmailConfirmation ? "/login" : "/dashboard"} className="w-full">
                                <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-11">
                                    {needsEmailConfirmation ? "Go to Login" : "Go to Dashboard"}
                                </Button>
                            </Link>
                        </div>
                    </GradientBorder>
                </div>
            </Reveal>
        );
    }

    return (
        <Reveal>
            <div className="w-full mx-auto relative px-4" style={{ width: "680px", maxWidth: "95vw" }}>
                <Link href="/" className="absolute -top-12 left-4 text-slate-500 hover:text-white flex items-center gap-2 transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                    <span>Go Back</span>
                </Link>

                <GradientBorder animate borderWidth={1}>
                    <div className="bg-slate-900/90 backdrop-blur-2xl p-8 md:p-10 rounded-2xl relative overflow-hidden border border-white/5">
                        {/* Background Glow */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]" />
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px]" />

                        <div className="relative z-10 flex flex-col items-center">
                            {/* Animated Logo Section */}
                            <motion.div
                                className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-blue-500/10 relative overflow-hidden mb-8"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                />
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
                                    <motion.path
                                        d="M7 7H17M7 12H14M7 7V17"
                                        stroke="white"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 1.5, ease: "easeInOut" }}
                                    />
                                    <motion.path
                                        d="M14 7C16.5 7 17 8.5 17 11C17 13.5 15.5 15 14 15V15"
                                        stroke="white"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        opacity="0.8"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 1.5, delay: 0.2, ease: "easeInOut" }}
                                    />
                                </svg>
                            </motion.div>

                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Join Us</h1>
                                <p className="text-slate-400 text-sm">Sign up to build the future together</p>
                            </div>

                            <form onSubmit={handleSubmit} className="w-full space-y-4">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                        <Input
                                            type="text"
                                            placeholder="Your full name"
                                            className="pl-10 bg-slate-950/50 border-slate-800 text-slate-200 focus:border-blue-500/50 focus:ring-blue-500/10 h-11"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                        <Input
                                            type="email"
                                            placeholder="yourname@example.com"
                                            className="pl-10 bg-slate-950/50 border-slate-800 text-slate-200 focus:border-blue-500/50 focus:ring-blue-500/10 h-11"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            className="pl-10 bg-slate-950/50 border-slate-800 text-slate-200 focus:border-blue-500/50 focus:ring-blue-500/10 h-11"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Confirm Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            className="pl-10 bg-slate-950/50 border-slate-800 text-slate-200 focus:border-blue-500/50 focus:ring-blue-500/10 h-11"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button
                                        type="submit"
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-11 shadow-lg shadow-blue-600/20 active:opacity-90 transition-all duration-200"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 bg-white rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                                <span className="w-2 h-2 bg-white rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                            </div>
                                        ) : (
                                            "Sign Up"
                                        )}
                                    </Button>

                                    <div className="relative my-6">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-slate-800" />
                                        </div>
                                        <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                                            <span className="bg-[#0f172a] px-3 text-slate-500">Or continue with social login</span>
                                        </div>
                                    </div>

                                    <Button
                                        variant="outline"
                                        type="button"
                                        className="w-full border-slate-800 bg-transparent hover:bg-slate-800 text-slate-300 h-11 transition-colors"
                                        onClick={handleGithubLogin}
                                    >
                                        <Github className="mr-2 h-4 w-4" />
                                        Continue with GitHub
                                    </Button>
                                </div>
                            </form>

                            <div className="mt-8 text-center text-sm text-slate-500">
                                Already have an account?{" "}
                                <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium hover:underline decoration-blue-500/30 underline-offset-4 transition-colors">
                                    Sign in
                                </Link>
                            </div>
                        </div>
                    </div>
                </GradientBorder>
            </div>
        </Reveal>
    );
}
