"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Code2, Users, Rocket, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { getSearchSuggestions } from "@/app/actions/projects";

// Placeholder suggestions
const STATIC_SUGGESTIONS = [
    { text: "React Developers", type: "role", icon: Code2, color: "text-blue-400" },
    { text: "Next.js Projects", type: "tech", icon: Rocket, color: "text-white" },
    { text: "UI Designers", type: "role", icon: Users, color: "text-purple-400" },
    { text: "Open Source", type: "category", icon: Sparkles, color: "text-yellow-400" },
];

const PLACEHOLDERS = [
    "Find a React Developer...",
    "Join a Hackathon Team...",
    "Discover Open Source Projects...",
    "Hire a UI Designer...",
];

export function SmartSearch() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const debouncedQuery = useDebounce(query, 300);

    // Placeholder animation
    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Fetch suggestions
    useEffect(() => {
        async function fetchSuggestions() {
            if (debouncedQuery.length < 2) {
                setSuggestions([]);
                return;
            }
            setLoading(true);
            try {
                const results = await getSearchSuggestions(debouncedQuery);
                setSuggestions(results);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        if (isOpen) {
            fetchSuggestions();
        }
    }, [debouncedQuery, isOpen]);

    const handleSubmit = (e?: React.FormEvent, overrideQuery?: string) => {
        e?.preventDefault();
        const q = overrideQuery || query;
        if (!q.trim()) return;

        // If it's a project ID (from suggestion), maybe go directly to project page?
        // For now, let's keep search intent
        router.push(`/projects?search=${encodeURIComponent(q)}`);
        setIsOpen(false);
    };

    const handleSuggestionClick = (item: any) => {
        if (item.type === 'project') {
            router.push(`/projects/${item.id}`);
        } else {
            handleSubmit(undefined, item.text);
        }
        setIsOpen(false);
    }

    return (
        <div className="relative w-full max-w-2xl mx-auto z-50">
            <div
                className={`relative group bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl transition-all duration-300 ${isOpen ? "shadow-[0_0_40px_rgba(59,130,246,0.15)] border-blue-500/30" : "hover:border-slate-600"
                    }`}
            >
                <div className="flex items-center px-4 py-3 md:py-4">
                    <Search className={`w-5 h-5 md:w-6 md:h-6 mr-3 transition-colors ${isOpen ? "text-blue-400" : "text-slate-500"}`} />

                    <div className="relative flex-1 h-6 overflow-hidden">
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setIsOpen(true);
                            }}
                            onFocus={() => setIsOpen(true)}
                            // onBlur={() => setTimeout(() => setIsOpen(false), 200)} // Delay for click handling
                            className="absolute inset-0 w-full h-full bg-transparent border-none outline-none text-white placeholder-transparent text-base md:text-lg"
                            autoComplete="off"
                        />

                        <AnimatePresence mode="wait">
                            {!query && (
                                <motion.span
                                    key={placeholderIndex}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 0.5 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="absolute inset-0 pointer-events-none text-slate-400 text-base md:text-lg truncate"
                                >
                                    {PLACEHOLDERS[placeholderIndex]}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-2 pl-2 border-l border-slate-800 ml-2">
                        <AnimatePresence>
                            {loading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                                </motion.div>
                            )}
                            {query && !loading && (
                                <motion.button
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    onClick={() => handleSubmit()}
                                    className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                                >
                                    <ArrowRight className="w-4 h-4" />
                                </motion.button>
                            )}
                        </AnimatePresence>
                        {!query && (
                            <span className="hidden md:block text-xs text-slate-600 font-mono px-2 py-1 rounded bg-slate-900 border border-slate-800">
                                ESC
                            </span>
                        )}
                    </div>
                </div>

                {/* Dropdown Suggestions */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, y: 10, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl overflow-hidden shadow-2xl"
                        >
                            {query ? (
                                <div className="p-2">
                                    <div className="px-3 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Sonuçlar
                                    </div>

                                    {suggestions.length > 0 ? (
                                        suggestions.map((item) => (
                                            <button
                                                key={item.id}
                                                className="w-full flex items-center px-3 py-3 hover:bg-slate-800/50 rounded-lg transition-colors group"
                                                onClick={() => handleSuggestionClick(item)}
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center mr-3 group-hover:bg-indigo-500/20 transition-colors">
                                                    <Rocket className="w-4 h-4 text-indigo-400" />
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <div className="text-sm text-slate-200 font-medium">{item.text}</div>
                                                    <div className="text-xs text-slate-500 uppercase">Proje</div>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-all opacity-0 group-hover:opacity-100" />
                                            </button>
                                        ))
                                    ) : (
                                        !loading && (
                                            <div className="px-3 py-4 text-center text-slate-500 text-sm">
                                                Sonuç bulunamadı. Enter'a basarak detaylı arama yapın.
                                            </div>
                                        )
                                    )}

                                    <button
                                        className="w-full flex items-center px-3 py-3 hover:bg-slate-800/50 rounded-lg transition-colors group border-t border-slate-800 mt-2"
                                        onClick={() => handleSubmit()}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mr-3 group-hover:bg-blue-500/20 transition-colors">
                                            <Search className="w-4 h-4 text-blue-400" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="text-sm text-slate-200">
                                                tüm projelerde ara: <span className="text-blue-400">"{query}"</span>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 group-hover:-rotate-45 transition-all" />
                                    </button>
                                </div>
                            ) : (
                                <div className="p-2">
                                    <div className="px-3 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Önerilenler
                                    </div>
                                    {STATIC_SUGGESTIONS.map((item, i) => (
                                        <button
                                            key={i}
                                            className="w-full flex items-center px-3 py-3 hover:bg-slate-800/50 rounded-lg transition-colors group"
                                            onClick={() => {
                                                setQuery(item.text);
                                                router.push(`/projects?search=${encodeURIComponent(item.text)}`);
                                            }}
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                                                <item.icon className={`w-4 h-4 ${item.color}`} />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <div className="text-sm text-slate-200 font-medium">{item.text}</div>
                                                <div className="text-xs text-slate-500 capitalize">{item.type}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Backdrop to close */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[-1] bg-black/50 backdrop-blur-[1px]"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
