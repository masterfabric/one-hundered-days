"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { subscribeNewsletter } from "@/app/actions/newsletter";

const footerLinks = {
    platform: [
        { label: "Projeler", href: "/projects" },
        { label: "Geliştiriciler", href: "/developers" },
        { label: "Proje Oluştur", href: "/projects/create" },
        { label: "Nasıl Çalışır", href: "/how-it-works" },
    ],
    resources: [
        { label: "Dokümantasyon", href: "/docs" },
        { label: "API", href: "/api" },
        { label: "Blog", href: "/blog" },
        { label: "SSS", href: "/faq" },
    ],
    company: [
        { label: "Hakkımızda", href: "/about" },
        { label: "Kariyer", href: "/careers" },
        { label: "İletişim", href: "/contact" },
        { label: "Basın", href: "/press" },
    ],
    legal: [
        { label: "Gizlilik Politikası", href: "/privacy" },
        { label: "Kullanım Şartları", href: "/terms" },
        { label: "Çerez Politikası", href: "/cookies" },
    ],
};

const socialLinks = [
    { icon: "𝕏", href: "https://twitter.com", label: "Twitter" },
    { icon: "📘", href: "https://facebook.com", label: "Facebook" },
    { icon: "💼", href: "https://linkedin.com", label: "LinkedIn" },
    { icon: "🐙", href: "https://github.com", label: "GitHub" },
    { icon: "📸", href: "https://instagram.com", label: "Instagram" },
];

export function Footer() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email.trim()) {
            setMessage({ type: "error", text: "Lütfen bir e-posta adresi giriniz." });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const result = await subscribeNewsletter(email);
            if (result.success) {
                setMessage({ 
                    type: "success", 
                    text: result.message || "Newsletter'e başarıyla abone oldunuz!" 
                });
                setEmail(""); // Formu temizle
            }
        } catch (error) {
            setMessage({ 
                type: "error", 
                text: error instanceof Error ? error.message : "Bir hata oluştu. Lütfen tekrar deneyin." 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <footer className="relative pt-20 pb-10 border-t border-slate-800 overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                {/* Main Footer Content */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
                    {/* Brand Column */}
                    <div className="col-span-2 md:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-4"
                        >
                            <Link href="/" className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                    <span className="text-white font-bold">FD</span>
                                </div>
                                <span className="text-xl font-bold text-white">FinderDev</span>
                            </Link>
                        </motion.div>
                        <p className="text-white/50 text-sm mb-4">
                            Geliştiricileri bir araya getiren, fikirleri hayata geçiren platform.
                        </p>
                        {/* Social Links */}
                        <div className="flex gap-2">
                            {socialLinks.map((social) => (
                                <motion.a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-blue-500/20 flex items-center justify-center text-lg transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {social.icon}
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Platform Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Platform</h4>
                        <ul className="space-y-2">
                            {footerLinks.platform.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-white/50 hover:text-blue-400 text-sm transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Kaynaklar</h4>
                        <ul className="space-y-2">
                            {footerLinks.resources.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-white/50 hover:text-blue-400 text-sm transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Şirket</h4>
                        <ul className="space-y-2">
                            {footerLinks.company.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-white/50 hover:text-blue-400 text-sm transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Yasal</h4>
                        <ul className="space-y-2">
                            {footerLinks.legal.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-white/50 hover:text-blue-400 text-sm transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Newsletter */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-12"
                >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h4 className="text-white font-semibold text-lg">Güncel Kal</h4>
                            <p className="text-white/50 text-sm">En yeni projeler ve fırsatlar için bültenimize abone ol.</p>
                        </div>
                        <form onSubmit={handleNewsletterSubmit} className="flex w-full md:w-auto gap-2 flex-col md:flex-row">
                            <input
                                type="email"
                                placeholder="E-posta adresin"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                className="flex-1 md:w-64 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                            />
                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: loading ? 1 : 1.05 }}
                                whileTap={{ scale: loading ? 1 : 0.95 }}
                                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Gönderiliyor..." : "Abone Ol"}
                            </motion.button>
                        </form>
                        {message && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`text-sm mt-2 ${
                                    message.type === "success" 
                                        ? "text-green-400" 
                                        : "text-red-400"
                                }`}
                            >
                                {message.text}
                            </motion.p>
                        )}
                    </div>
                </motion.div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-800">
                    <p className="text-white/40 text-sm">
                        © 2026 FinderDev. Tüm hakları saklıdır.
                    </p>
                    <div className="flex items-center gap-2 text-white/40 text-sm">
                        <span>Made with</span>
                        <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        >
                            ❤️
                        </motion.span>
                        <span>by developers, for developers</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
