"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { CursorSpotlight, NeonText } from "@/components/effects/PremiumEffects";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getUser() {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login");
                return;
            }
            setUser(session.user);
            setLoading(false);
        }
        getUser();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                Yükleniyor...
            </div>
        )
    }

    return (
        <CursorSpotlight>
            <div className="min-h-screen flex flex-col bg-slate-950">
                <Sidebar />
                <Header />
                <div className="flex flex-1 relative">
                    <main className="flex-1 transition-all duration-300">
                        <div className="container py-10">
                            <div className="mb-10">
                                <h1 className="text-3xl font-bold mb-2">
                                    <NeonText color="cyan">Hoş Geldiniz</NeonText>
                                </h1>
                                <p className="text-slate-400">{user?.email}</p>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-blue-500/50 transition-colors">
                                    <h3 className="text-xl font-semibold mb-2 text-white">Projelerim</h3>
                                    <p className="text-slate-400 text-sm">Henüz bir projeniz yok.</p>
                                    <Link href="/projects/create">
                                        <Button className="mt-4 w-full" variant="secondary">Proje Oluştur</Button>
                                    </Link>
                                </div>

                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-purple-500/50 transition-colors">
                                    <h3 className="text-xl font-semibold mb-2 text-white">Başvurularım</h3>
                                    <p className="text-slate-400 text-sm">Bekleyen başvuru bulunmamaktadır.</p>
                                </div>

                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-green-500/50 transition-colors">
                                    <h3 className="text-xl font-semibold mb-2 text-white">Mesajlar</h3>
                                    <p className="text-slate-400 text-sm">Gelen kutunuz boş.</p>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </CursorSpotlight>
    );
}
