import { RegisterForm } from "@/components/auth/RegisterForm";
import { Header } from "@/components/layout/Header";
import { InteractiveParticles } from "@/components/effects/PremiumEffects";

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

            <InteractiveParticles count={40} />

            <Header />

            <main className="flex-1 flex items-center justify-center p-4 relative z-10">
                <RegisterForm />
            </main>
        </div>
    );
}
