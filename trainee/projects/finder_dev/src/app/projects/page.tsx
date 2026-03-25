"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { ProjectsGrid } from "@/components/projects/ProjectsGrid";
import { ProjectsSearchControls } from "@/components/projects/ProjectsSearchControls";
import { useProjectsFilters } from "@/components/projects/use-projects-filters";

export default function ProjectsPage() {
  const filters = useProjectsFilters();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Sidebar />
      <Header />
      <div className="flex flex-1 relative">
        <main className="flex-1 transition-all duration-300">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-20 right-10 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="absolute bottom-0 left-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
          </div>

          <div className="container py-10">
            <div className="space-y-4 mb-8 relative z-10">
              <div className="relative py-8 md:py-10">
                <div className="pointer-events-none absolute inset-0 -z-10">
                  <div className="absolute left-1/2 top-1/2 h-56 w-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-500/12 via-purple-500/10 to-blue-500/12 blur-3xl" />
                  <div className="absolute left-1/2 top-1/2 h-44 w-96 -translate-x-[10%] -translate-y-[38%] rounded-full bg-cyan-400/12 blur-2xl" />
                  <div className="absolute left-1/2 top-1/2 h-40 w-80 -translate-x-[85%] -translate-y-[5%] rounded-full bg-purple-500/10 blur-2xl" />
                </div>
                <div className="relative text-center space-y-2">
                  <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-purple-500">
                      Browse
                    </span>
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Search projects or developers from one place.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="relative inline-flex items-center rounded-full border border-white/10 bg-white/5 p-1">
                  <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 420, damping: 30 }}
                    className={`absolute top-1 bottom-1 w-[110px] rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 shadow-md shadow-purple-500/35 ${
                      filters.searchType === "project" ? "left-1" : "left-[111px]"
                    }`}
                  />
                  <button
                    onClick={() => filters.handleSearchTypeChange("project")}
                    className={`relative z-10 w-[110px] px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                      filters.searchType === "project" ? "text-white" : "text-slate-300 hover:text-white"
                    }`}
                  >
                    Project
                  </button>
                  <button
                    onClick={() => filters.handleSearchTypeChange("developer")}
                    className={`relative z-10 w-[110px] px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                      filters.searchType === "developer" ? "text-white" : "text-slate-300 hover:text-white"
                    }`}
                  >
                    Developer
                  </button>
                </div>
              </div>
            </div>

            <div
              className={`transition-all duration-500 ${
                filters.hasSearched ? "mb-8" : "min-h-[46vh] flex items-center justify-center"
              }`}
            >
              <div className="w-full">
                <ProjectsSearchControls filters={filters} showTypeToggle={false} />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {filters.searchType === "project" && filters.hasSearched ? (
                <motion.div
                  key="project-results"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <ProjectsGrid
                    searchQuery={filters.searchQuery}
                    statusFilter={filters.statusFilter}
                    statusTouched={filters.statusTouched}
                    selectedTech={filters.selectedTech}
                    selectedRole={filters.selectedRole}
                    onClearFilters={filters.handleClearFilters}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

