"use client";

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
          <div className="container py-10">
            <div className="mb-8 space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-purple-500">
                    Browse Projects
                  </span>
                </h1>
                <p className="text-muted-foreground text-lg">
                  Discover projects looking for collaborators
                </p>
              </div>

              <ProjectsSearchControls filters={filters} />
            </div>

            <ProjectsGrid
              searchQuery={filters.searchQuery}
              statusFilter={filters.statusFilter}
              selectedTech={filters.selectedTech}
              selectedRole={filters.selectedRole}
              onClearFilters={filters.handleClearFilters}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

