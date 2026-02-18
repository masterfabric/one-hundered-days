"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GradientBorder, Reveal } from "@/components/effects/PremiumEffects";
import Link from "next/link";
import { Github, Mail, Lock, ArrowLeft } from "lucide-react";

export function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // Input validation
            if (!email || !email.trim()) {
                setError("Lütfen e-posta adresinizi girin.");
                setIsLoading(false);
                return;
            }

            if (!password || !password.trim()) {
                setError("Lütfen şifrenizi girin.");
                setIsLoading(false);
                return;
            }

            const { supabase } = await import("@/lib/supabase/client");

            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email: email.trim().toLowerCase(),
                password,
            });

            if (authError) {
                console.error("Login error:", authError);
                
                // Handle different error types
                let message = "Giriş yapılırken bir sorun oluştu.";
                
                // Check error message and status
                const errorMessage = authError.message || "";
                const errorStatus = authError.status || 0;

                if (errorMessage.includes("Invalid login credentials") || 
                    errorMessage.includes("invalid") || 
                    errorStatus === 400) {
                    message = "Hatalı e-posta veya şifre. Lütfen bilgilerinizi kontrol edin.";
                } else if (errorMessage.includes("Email not confirmed") || 
                          errorMessage.includes("email_not_confirmed")) {
                    message = "Lütfen önce e-posta adresinizi onaylayın. E-posta kutunuzu kontrol edin.";
                } else if (errorMessage.includes("Too many requests") || 
                          errorMessage.includes("rate_limit")) {
                    message = "Çok fazla deneme yaptınız. Lütfen birkaç dakika sonra tekrar deneyin.";
                } else if (errorMessage.includes("User not found")) {
                    message = "Bu e-posta adresi ile kayıtlı bir kullanıcı bulunamadı.";
                } else {
                    message = `Giriş hatası: ${errorMessage}`;
                }

                setError(message);
                setIsLoading(false);
                return;
            }

            // Success - Wait a bit for session to be established
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Force page reload to ensure Header picks up the new session
            window.location.href = "/dashboard";
        } catch (err: any) {
            console.error("Login error:", err);
            let message = "Giriş yapılırken bir sorun oluştu.";

            // Handle different error formats
            const errorMessage = err?.message || err?.error?.message || String(err);
            
            if (errorMessage.includes("Invalid login credentials") || 
                errorMessage.includes("invalid")) {
                message = "Hatalı e-posta veya şifre. Lütfen bilgilerinizi kontrol edin.";
            } else if (errorMessage.includes("Email not confirmed") || 
                      errorMessage.includes("email_not_confirmed")) {
                message = "Lütfen önce e-posta adresinizi onaylayın. E-posta kutunuzu kontrol edin.";
            } else if (errorMessage.includes("network") || 
                      errorMessage.includes("fetch")) {
                message = "Bağlantı hatası. İnternet bağlantınızı kontrol edin ve tekrar deneyin.";
            }

            setError(message);
            setIsLoading(false);
        }
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
            setError("GitHub ile giriş yapılırken bir sorun oluştu.");
        }
    };

    return (
        <Reveal>
            <div className="w-full max-w-md mx-auto relative px-4">
                <Link href="/" className="absolute -top-12 left-4 text-slate-500 hover:text-white flex items-center gap-2 transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                    <span>Geri Dön</span>
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
                                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Hoş Geldiniz</h1>
                                <p className="text-slate-400 text-sm">Fikirlerinizi gerçeğe dönüştürmek için giriş yapın</p>
                            </div>

                            <form onSubmit={handleSubmit} className="w-full space-y-5">
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
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">E-posta Adresi</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                        <Input
                                            type="email"
                                            placeholder="adiniz@ornek.com"
                                            className="pl-10 bg-slate-950/50 border-slate-800 text-slate-200 focus:border-blue-500/50 focus:ring-blue-500/10 h-11"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-end mr-1">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Şifre</label>
                                        <Link href="#" className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors font-medium">
                                            Şifremi Unuttum?
                                        </Link>
                                    </div>
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

                                <div className="pt-2">
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
                                            "Devam Et"
                                        )}
                                    </Button>

                                    <div className="relative my-8">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-slate-800" />
                                        </div>
                                        <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                                            <span className="bg-[#0f172a] px-3 text-slate-500">Veya sosyal hesapla</span>
                                        </div>
                                    </div>

                                    <Button
                                        variant="outline"
                                        type="button"
                                        className="w-full border-slate-800 bg-transparent hover:bg-slate-800 text-slate-300 h-11 transition-colors"
                                        onClick={handleGithubLogin}
                                    >
                                        <Github className="mr-2 h-4 w-4" />
                                        GitHub ile Giriş Yap
                                    </Button>
                                </div>
                            </form>

                            <div className="mt-8 text-center text-sm text-slate-500">
                                Hesabınız yok mu?{" "}
                                <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium hover:underline decoration-blue-500/30 underline-offset-4 transition-colors">
                                    Hemen Kayıt Olun
                                </Link>
                            </div>
                        </div>
                    </div>
                </GradientBorder>
            </div>
        </Reveal>
    );
}
