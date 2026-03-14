"use client";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { DevelopersGrid } from "@/components/developers/DevelopersGrid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function DevelopersPage() {
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = () => {
        setSearchQuery(searchInput);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

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
                                        Browse Developers
                                    </span>
                                </h1>
                                <p className="text-muted-foreground text-lg">
                                    Find talented developers for your next project
                                </p>
                            </div>
                            <div className="flex gap-4 justify-center">
                                <Input
                                    placeholder="Search developers by name or bio..."
                                    className="max-w-sm"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                <Button onClick={handleSearch}>Search</Button>
                            </div>
                        </div>
                        <DevelopersGrid searchQuery={searchQuery} />
                    </div>
                </main>
            </div>
        </div>
    );
}
