"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Filter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FILTER_OPTIONS } from "./projects-filter-constants";
import type { ProjectsFiltersState } from "./use-projects-filters";

type ProjectsSearchControlsProps = {
  filters: ProjectsFiltersState;
};

export function ProjectsSearchControls({ filters }: ProjectsSearchControlsProps) {
  return (
    <div className="mx-auto max-w-3xl w-[768px]">
      <div className="flex items-center justify-between gap-3 w-full flex-nowrap">
        <div className="relative flex-1 group min-w-0">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-400 transition-colors duration-200 ease-out z-10">
            <Search className="h-5 w-5" />
          </div>
          <Input
            placeholder="Search projects by title or description..."
            className="w-full pl-12 pr-28 py-4 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-200 ease-out text-white placeholder:text-white/40"
            value={filters.searchInput}
            onChange={(e) => filters.setSearchInput(e.target.value)}
            onKeyDown={filters.handleKeyDown}
          />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1.5 flex-nowrap">
            {filters.searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={filters.handleClearSearch}
                className="p-1.5 rounded-full hover:bg-white/10 transition-all duration-200 ease-out text-muted-foreground hover:text-white flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </motion.button>
            )}
            <Button
              onClick={filters.handleSearch}
              className="group rounded-full px-5 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 hover:from-blue-400 hover:via-purple-400 hover:to-purple-500 hover:shadow-blue-500/30 hover:translate-y-0 text-white font-medium transition-all duration-300 ease-out w-[140px] flex-shrink-0 justify-center"
            >
              <Search className="h-4 w-4 mr-2 transition-transform duration-300 ease-out group-hover:scale-110" />
              Search
            </Button>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => filters.setShowFilters(!filters.showFilters)}
          className={`group rounded-full px-6 py-4 border-white/10 backdrop-blur-sm hover:bg-white/15 hover:border-purple-500/30 hover:text-purple-300 hover:shadow-blue-500/30 hover:translate-y-0 transition-all duration-300 ease-out relative flex-shrink-0 w-auto min-w-[120px] justify-center ${
            filters.hasActiveFilters
              ? "bg-purple-500/20 border-purple-500/30 text-purple-300"
              : "bg-white/5"
          }`}
        >
          <Filter className="h-4 w-4 mr-2 transition-transform duration-300 ease-out group-hover:rotate-12" />
          Filters
          {filters.hasActiveFilters && filters.activeFilterCount > 0 && (
            <span className="ml-2 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold shadow-md shadow-purple-500/50">
              {filters.activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {filters.showFilters && (
          <motion.div
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mt-4 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 space-y-6 h-auto max-h-[500px] overflow-y-auto w-full max-w-3xl"
          >
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                Filter by Status
              </p>
              <div className="flex flex-wrap gap-2">
                {FILTER_OPTIONS.map((option) => {
                  const isAll = option.value === "all";
                  const hasAnyFilter =
                    filters.statusFilter !== "all" ||
                    filters.selectedTech.length > 0 ||
                    filters.selectedRole.length > 0;
                  const isActive = isAll
                    ? filters.statusFilter === "all" && !hasAnyFilter
                    : filters.statusFilter === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => filters.handleStatusFilter(option.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-out flex-shrink-0 min-w-[120px] justify-center ${
                        isActive
                          ? "bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 text-white shadow-md shadow-pink-500/50"
                          : "bg-white/5 text-slate-300 border border-white/10 hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-purple-600/20 hover:text-pink-400 hover:border-pink-500/30 hover:shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                  Technologies
                </p>
                {filters.techSearchQuery && (
                  <button
                    onClick={() => filters.setTechSearchQuery("")}
                    className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Search className="h-4 w-4" />
                </div>
                <Input
                  type="text"
                  placeholder="Search technologies..."
                  value={filters.techSearchQuery}
                  onChange={(e) => {
                    filters.setTechSearchQuery(e.target.value);
                    if (e.target.value && !filters.showAllTech) {
                      filters.setShowAllTech(true);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-200 ease-out text-white placeholder:text-white/40 text-sm"
                />
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                {filters.displayedTechOptions.length > 0 ? (
                  filters.displayedTechOptions.map((tech) => {
                    const isActive = filters.selectedTech.includes(tech);
                    return (
                      <button
                        key={tech}
                        onClick={() => filters.handleTechToggle(tech)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-out flex-shrink-0 min-w-[120px] justify-center ${
                          isActive
                            ? "bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 text-white shadow-md shadow-pink-500/50"
                            : "bg-white/5 text-slate-300 border border-white/10 hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-purple-600/20 hover:text-pink-400 hover:border-pink-500/30 hover:shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                        }`}
                      >
                        {tech}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-400 py-2">
                    No technologies found matching &quot;{filters.techSearchQuery}&quot;
                  </p>
                )}
                {!filters.techSearchQuery && (
                  <button
                    onClick={() => filters.setShowAllTech(!filters.showAllTech)}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-out flex-shrink-0 bg-white/5 text-slate-300 border border-white/10 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-600/20 hover:text-blue-400 hover:border-blue-500/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                  >
                    {filters.showAllTech ? "Show Less" : "See All"}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                  Role
                </p>
                {filters.roleSearchQuery && (
                  <button
                    onClick={() => filters.setRoleSearchQuery("")}
                    className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Search className="h-4 w-4" />
                </div>
                <Input
                  type="text"
                  placeholder="Search roles..."
                  value={filters.roleSearchQuery}
                  onChange={(e) => {
                    filters.setRoleSearchQuery(e.target.value);
                    if (e.target.value && !filters.showAllRoles) {
                      filters.setShowAllRoles(true);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-200 ease-out text-white placeholder:text-white/40 text-sm"
                />
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                {filters.displayedRoleOptions.length > 0 ? (
                  filters.displayedRoleOptions.map((role) => {
                    const isActive = filters.selectedRole.includes(role);
                    return (
                      <button
                        key={role}
                        onClick={() => filters.handleRoleToggle(role)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-out flex-shrink-0 min-w-[120px] justify-center ${
                          isActive
                            ? "bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 text-white shadow-md shadow-pink-500/50"
                            : "bg-white/5 text-slate-300 border border-white/10 hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-purple-600/20 hover:text-pink-400 hover:border-pink-500/30 hover:shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                        }`}
                      >
                        {role}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-400 py-2">
                    No roles found matching &quot;{filters.roleSearchQuery}&quot;
                  </p>
                )}
                {!filters.roleSearchQuery && (
                  <button
                    onClick={() => filters.setShowAllRoles(!filters.showAllRoles)}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-out flex-shrink-0 bg-white/5 text-slate-300 border border-white/10 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-600/20 hover:text-blue-400 hover:border-blue-500/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                  >
                    {filters.showAllRoles ? "Show Less" : "See All"}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {filters.searchQuery && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-muted-foreground mt-4 text-center"
        >
          Searching for:{" "}
          <span className="text-blue-400 font-medium">&quot;{filters.searchQuery}&quot;</span>
        </motion.p>
      )}
    </div>
  );
}
