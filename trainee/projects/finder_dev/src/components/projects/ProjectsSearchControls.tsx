"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Filter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FILTER_OPTIONS, UNIQUE_ROLE_OPTIONS, UNIQUE_TECH_OPTIONS } from "./projects-filter-constants";
import type { ProjectsFiltersState } from "./use-projects-filters";
import { searchUsers } from "@/app/actions/users";

type ProjectsSearchControlsProps = {
  filters: ProjectsFiltersState;
  showTypeToggle?: boolean;
};

const DEVELOPER_NATIONALITY_OPTIONS = [
  "Turkey",
  "Germany",
  "United Kingdom",
  "United States",
  "Canada",
  "Netherlands",
  "France",
  "Spain",
  "Italy",
  "Poland",
  "India",
  "Pakistan",
  "Brazil",
  "Mexico",
  "Japan",
  "South Korea",
  "Australia",
  "Russia",
  "Ukraine",
  "Other",
];

const DEVELOPER_LANGUAGE_OPTIONS = [
  "Turkish",
  "English",
  "German",
  "French",
  "Spanish",
  "Italian",
  "Portuguese",
  "Russian",
  "Arabic",
  "Hindi",
  "Urdu",
  "Japanese",
  "Korean",
  "Chinese",
  "Dutch",
  "Polish",
];

export function ProjectsSearchControls({
  filters,
  showTypeToggle = true,
}: ProjectsSearchControlsProps) {
  const projectFiltersButtonRef = useRef<HTMLButtonElement | null>(null);
  const developerFiltersButtonRef = useRef<HTMLButtonElement | null>(null);
  const projectFiltersPanelRef = useRef<HTMLDivElement | null>(null);
  const developerFiltersPanelRef = useRef<HTMLDivElement | null>(null);

  const [developerResults, setDeveloperResults] = useState<
    Array<{
      id: string;
      username: string;
      full_name: string | null;
      email?: string | null;
      avatar_url: string | null;
      user_tag?: string | null;
      role?: string | null;
      title?: string | null;
      headline?: string | null;
      skills?: unknown;
      specializations?: unknown;
      expertise?: unknown;
      technologies?: unknown;
      tech_stack?: unknown;
      languages?: unknown;
      language_stack?: unknown;
      langs?: unknown;
      nationality?: string | null;
      country?: string | null;
      location?: string | null;
    }>
  >([]);
  const [isDeveloperLoading, setIsDeveloperLoading] = useState(false);
  const [showDeveloperFilters, setShowDeveloperFilters] = useState(false);
  const [developerFilterState, setDeveloperFilterState] = useState({
    selectedRoles: [] as string[],
    selectedTechnologies: [] as string[],
    selectedNationalities: [] as string[],
    selectedLanguages: [] as string[],
    roleSearchQuery: "",
    technologySearchQuery: "",
    nationalitySearchQuery: "",
    languageSearchQuery: "",
    showAllRoles: false,
    showAllTechnologies: false,
    showAllNationalities: false,
    showAllLanguages: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadDevelopers() {
      const query = filters.searchInput.trim();
      const hasAdvancedFilterQuery =
        developerFilterState.selectedRoles.length > 0 ||
        developerFilterState.selectedTechnologies.length > 0 ||
        developerFilterState.selectedNationalities.length > 0 ||
        developerFilterState.selectedLanguages.length > 0;
      if (
        filters.searchType !== "developer" ||
        (query.length === 0 && !hasAdvancedFilterQuery)
      ) {
        if (!cancelled) {
          setDeveloperResults([]);
          setIsDeveloperLoading(false);
        }
        return;
      }

      setIsDeveloperLoading(true);
      try {
        const result = await searchUsers({
          search: query,
          limit: hasAdvancedFilterQuery ? "100" : "12",
          offset: "0",
        });
        if (!cancelled && result.success) {
          setDeveloperResults((result.data || []) as any[]);
        }
      } catch {
        if (!cancelled) {
          setDeveloperResults([]);
        }
      } finally {
        if (!cancelled) {
          setIsDeveloperLoading(false);
        }
      }
    }

    const timeoutId = setTimeout(loadDevelopers, 250);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [developerFilterState, filters.searchInput, filters.searchType]);

  useEffect(() => {
    if (filters.searchType !== "developer") {
      setShowDeveloperFilters(false);
      setDeveloperFilterState({
        selectedRoles: [],
        selectedTechnologies: [],
        selectedNationalities: [],
        selectedLanguages: [],
        roleSearchQuery: "",
        technologySearchQuery: "",
        nationalitySearchQuery: "",
        languageSearchQuery: "",
        showAllRoles: false,
        showAllTechnologies: false,
        showAllNationalities: false,
        showAllLanguages: false,
      });
    }
  }, [filters.searchType]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (filters.showFilters) {
        const clickedProjectPanel = projectFiltersPanelRef.current?.contains(target);
        const clickedProjectButton = projectFiltersButtonRef.current?.contains(target);
        if (!clickedProjectPanel && !clickedProjectButton) {
          filters.setShowFilters(false);
        }
      }

      if (showDeveloperFilters) {
        const clickedDeveloperPanel = developerFiltersPanelRef.current?.contains(target);
        const clickedDeveloperButton = developerFiltersButtonRef.current?.contains(target);
        if (!clickedDeveloperPanel && !clickedDeveloperButton) {
          setShowDeveloperFilters(false);
        }
      }
    }

    if (!filters.showFilters && !showDeveloperFilters) return;

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [filters, showDeveloperFilters]);

  const toTokens = (value: unknown): string[] => {
    if (value == null) return [];
    if (Array.isArray(value)) return value.flatMap((item) => toTokens(item));
    if (typeof value === "string") {
      const raw = value.trim();
      if (!raw) return [];
      if ((raw.startsWith("[") && raw.endsWith("]")) || (raw.startsWith("{") && raw.endsWith("}"))) {
        try {
          const normalized = raw.startsWith("{") ? `[${raw.slice(1, -1)}]` : raw;
          const parsed = JSON.parse(normalized);
          return toTokens(parsed);
        } catch {
          return raw
            .split(",")
            .map((token) => token.replace(/[\[\]"]/g, "").trim())
            .filter(Boolean);
        }
      }
      return raw
        .split(",")
        .map((token) => token.replace(/[\[\]"]/g, "").trim())
        .filter(Boolean);
    }
    if (typeof value === "object") {
      return Object.values(value as Record<string, unknown>).flatMap((item) => toTokens(item));
    }
    return [String(value)];
  };

  const includesAnyTerm = (fields: unknown[], terms: string[]) => {
    if (terms.length === 0) return true;
    const haystack = fields
      .flatMap((field) => toTokens(field))
      .join(" ")
      .toLowerCase();
    return terms.some((term) => haystack.includes(term.toLowerCase()));
  };

  const filteredDeveloperResults = useMemo(() => {
    return developerResults.filter((developer) => {
      const roleMatches = includesAnyTerm(
        [
          developer.role,
          developer.title,
          developer.headline,
          developer.specializations,
          developer.expertise,
        ],
        developerFilterState.selectedRoles
      );

      const technologyMatches = includesAnyTerm(
        [developer.skills, developer.technologies, developer.tech_stack, developer.expertise],
        developerFilterState.selectedTechnologies
      );

      const nationalityMatches = includesAnyTerm(
        [developer.nationality, developer.country, developer.location],
        developerFilterState.selectedNationalities
      );

      const languageMatches = includesAnyTerm(
        [developer.languages, developer.language_stack, developer.langs],
        developerFilterState.selectedLanguages
      );

      return roleMatches && technologyMatches && nationalityMatches && languageMatches;
    });
  }, [developerFilterState, developerResults]);

  const displayedDeveloperRoleOptions = useMemo(() => {
    const initialOptions = UNIQUE_ROLE_OPTIONS.slice(0, 8);
    return developerFilterState.roleSearchQuery
      ? UNIQUE_ROLE_OPTIONS.filter((role) =>
          role.toLowerCase().includes(developerFilterState.roleSearchQuery.toLowerCase())
        )
      : developerFilterState.showAllRoles
      ? UNIQUE_ROLE_OPTIONS
      : initialOptions;
  }, [developerFilterState.roleSearchQuery, developerFilterState.showAllRoles]);

  const displayedDeveloperTechnologyOptions = useMemo(() => {
    const initialOptions = UNIQUE_TECH_OPTIONS.slice(0, 10);
    return developerFilterState.technologySearchQuery
      ? UNIQUE_TECH_OPTIONS.filter((tech) =>
          tech.toLowerCase().includes(developerFilterState.technologySearchQuery.toLowerCase())
        )
      : developerFilterState.showAllTechnologies
      ? UNIQUE_TECH_OPTIONS
      : initialOptions;
  }, [developerFilterState.showAllTechnologies, developerFilterState.technologySearchQuery]);

  const displayedDeveloperNationalityOptions = useMemo(() => {
    const initialOptions = DEVELOPER_NATIONALITY_OPTIONS.slice(0, 8);
    return developerFilterState.nationalitySearchQuery
      ? DEVELOPER_NATIONALITY_OPTIONS.filter((item) =>
          item.toLowerCase().includes(developerFilterState.nationalitySearchQuery.toLowerCase())
        )
      : developerFilterState.showAllNationalities
      ? DEVELOPER_NATIONALITY_OPTIONS
      : initialOptions;
  }, [developerFilterState.nationalitySearchQuery, developerFilterState.showAllNationalities]);

  const displayedDeveloperLanguageOptions = useMemo(() => {
    const initialOptions = DEVELOPER_LANGUAGE_OPTIONS.slice(0, 8);
    return developerFilterState.languageSearchQuery
      ? DEVELOPER_LANGUAGE_OPTIONS.filter((item) =>
          item.toLowerCase().includes(developerFilterState.languageSearchQuery.toLowerCase())
        )
      : developerFilterState.showAllLanguages
      ? DEVELOPER_LANGUAGE_OPTIONS
      : initialOptions;
  }, [developerFilterState.languageSearchQuery, developerFilterState.showAllLanguages]);

  const activeDeveloperFilterCount =
    developerFilterState.selectedRoles.length +
    developerFilterState.selectedTechnologies.length +
    developerFilterState.selectedNationalities.length +
    developerFilterState.selectedLanguages.length;

  const activeProjectFilterLabels = useMemo(() => {
    const labels: string[] = [];
    if (filters.statusTouched) {
      labels.push(
        filters.statusFilter === "all"
          ? "Status: All"
          : `Status: ${filters.statusFilter}`
      );
    }
    labels.push(...filters.selectedTech.map((item) => `Tech: ${item}`));
    labels.push(...filters.selectedRole.map((item) => `Role: ${item}`));
    return labels;
  }, [filters.selectedRole, filters.selectedTech, filters.statusFilter, filters.statusTouched]);

  const activeDeveloperFilterLabels = useMemo(() => {
    return [
      ...developerFilterState.selectedRoles.map((item) => `Role: ${item}`),
      ...developerFilterState.selectedTechnologies.map((item) => `Tech: ${item}`),
      ...developerFilterState.selectedNationalities.map((item) => `Country: ${item}`),
      ...developerFilterState.selectedLanguages.map((item) => `Language: ${item}`),
    ];
  }, [
    developerFilterState.selectedLanguages,
    developerFilterState.selectedNationalities,
    developerFilterState.selectedRoles,
    developerFilterState.selectedTechnologies,
  ]);

  return (
    <div className="mx-auto max-w-3xl w-[768px] relative">
      {showTypeToggle && (
        <div className="mb-4 flex items-center justify-center">
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
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`search-row-${filters.searchType}`}
          initial={{ opacity: 0, y: 8, scale: 0.995 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.995 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex items-center justify-between gap-3 w-full flex-nowrap"
        >
          <div className="relative flex-1 group min-w-0">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-400 transition-colors duration-200 ease-out z-10">
              <Search className="h-5 w-5" />
            </div>
            <Input
              placeholder={
                filters.searchType === "project"
                  ? "Search projects by title or description..."
                  : "Search developers by name or ID (uuid/user tag)..."
              }
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

            {filters.searchType === "developer" &&
              (filters.searchInput.trim().length > 0 || activeDeveloperFilterCount > 0) &&
              filteredDeveloperResults.length > 0 && (
              <div className="absolute top-[110%] left-0 w-full z-20 rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-xl p-2 shadow-xl shadow-purple-900/30">
                <ul className="space-y-1">
                  {filteredDeveloperResults.map((developer) => (
                    <li key={developer.id}>
                      <Link
                        href={`/profile/${developer.id}`}
                        className="block rounded-xl border border-transparent hover:border-purple-500/40 hover:bg-white/5 p-3 transition-all duration-200"
                      >
                        <p className="text-sm font-semibold text-white">
                          {developer.full_name || developer.username}
                        </p>
                        <p className="text-xs text-slate-400">
                          @{developer.email || developer.username || "unknown"}
                          {developer.user_tag ? ` • #${developer.user_tag}` : ""}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {filters.searchType === "project" && (
            <Button
              ref={projectFiltersButtonRef}
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
          )}
          {filters.searchType === "developer" && (
            <Button
              ref={developerFiltersButtonRef}
              variant="outline"
              onClick={() => setShowDeveloperFilters((prev) => !prev)}
              className={`group rounded-full px-6 py-4 border-white/10 backdrop-blur-sm hover:bg-white/15 hover:border-purple-500/30 hover:text-purple-300 hover:shadow-blue-500/30 hover:translate-y-0 transition-all duration-300 ease-out relative flex-shrink-0 w-auto min-w-[120px] justify-center ${
                activeDeveloperFilterCount > 0
                  ? "bg-purple-500/20 border-purple-500/30 text-purple-300"
                  : "bg-white/5"
              }`}
            >
              <Filter className="h-4 w-4 mr-2 transition-transform duration-300 ease-out group-hover:rotate-12" />
              Filters
              {activeDeveloperFilterCount > 0 && (
                <span className="ml-2 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold shadow-md shadow-purple-500/50">
                  {activeDeveloperFilterCount}
                </span>
              )}
            </Button>
          )}
        </motion.div>
      </AnimatePresence>

      {filters.searchType === "project" && activeProjectFilterLabels.length > 0 && (
        <div className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Selected Filters</p>
            <button
              onClick={filters.handleClearFilters}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeProjectFilterLabels.map((label) => (
              <span
                key={label}
                className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/15 px-3 py-1 text-xs text-blue-200"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {filters.searchType === "developer" && activeDeveloperFilterLabels.length > 0 && (
        <div className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Selected Filters</p>
            <button
              onClick={() =>
                setDeveloperFilterState((prev) => ({
                  ...prev,
                  selectedRoles: [],
                  selectedTechnologies: [],
                  selectedNationalities: [],
                  selectedLanguages: [],
                }))
              }
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeDeveloperFilterLabels.map((label) => (
              <span
                key={label}
                className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/15 px-3 py-1 text-xs text-blue-200"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {filters.searchType === "developer" &&
        isDeveloperLoading &&
        (filters.searchInput.trim().length > 0 || activeDeveloperFilterCount > 0) && (
          <p className="mt-2 text-xs text-slate-400">Searching developers...</p>
      )}

      <AnimatePresence mode="wait">
        {filters.searchType === "project" && filters.showFilters && (
          <motion.div
            ref={projectFiltersPanelRef}
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed right-4 top-24 z-50 p-6 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/10 space-y-6 w-[min(460px,calc(100vw-2rem))] max-h-[calc(100vh-7rem)] overflow-y-auto shadow-2xl shadow-purple-900/30"
          >
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                Filter by Status
              </p>
              <div className="flex flex-wrap gap-2">
                {FILTER_OPTIONS.map((option) => {
                  const isActive =
                    option.value === "all"
                      ? filters.statusTouched && filters.statusFilter === "all"
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
                  className="w-full pl-10 pr-10 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-200 ease-out text-white placeholder:text-white/40 text-sm"
                />
                {(filters.showAllTech || filters.techSearchQuery) && (
                  <button
                    onClick={() => {
                      filters.setTechSearchQuery("");
                      filters.setShowAllTech(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Reset technologies list"
                    title="Reset technologies list"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
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
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-out flex-shrink-0 bg-blue-500/15 text-blue-300 border border-blue-500/30 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-600/20 hover:text-blue-200 hover:border-blue-400/40 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
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
                  className="w-full pl-10 pr-10 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-200 ease-out text-white placeholder:text-white/40 text-sm"
                />
                {(filters.showAllRoles || filters.roleSearchQuery) && (
                  <button
                    onClick={() => {
                      filters.setRoleSearchQuery("");
                      filters.setShowAllRoles(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Reset roles list"
                    title="Reset roles list"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
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
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-out flex-shrink-0 bg-blue-500/15 text-blue-300 border border-blue-500/30 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-600/20 hover:text-blue-200 hover:border-blue-400/40 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                  >
                    {filters.showAllRoles ? "Show Less" : "See All"}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {filters.searchType === "developer" && showDeveloperFilters && (
          <motion.div
            ref={developerFiltersPanelRef}
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed right-4 top-24 z-50 p-4 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/10 w-[min(460px,calc(100vw-2rem))] max-h-[calc(100vh-7rem)] overflow-y-auto shadow-2xl shadow-purple-900/30"
          >
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-3">
              Developer Filters
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Role</p>
                <div className="relative">
                  <Input
                    value={developerFilterState.roleSearchQuery}
                    onChange={(e) =>
                      setDeveloperFilterState((prev) => ({
                        ...prev,
                        roleSearchQuery: e.target.value,
                        showAllRoles: e.target.value ? true : prev.showAllRoles,
                      }))
                    }
                    placeholder="Search roles..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 pr-10"
                  />
                  {(developerFilterState.showAllRoles || developerFilterState.roleSearchQuery) && (
                    <button
                      onClick={() =>
                        setDeveloperFilterState((prev) => ({
                          ...prev,
                          roleSearchQuery: "",
                          showAllRoles: false,
                        }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                      aria-label="Reset developer roles list"
                      title="Reset developer roles list"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {displayedDeveloperRoleOptions.map((role) => {
                    const isActive = developerFilterState.selectedRoles.includes(role);
                    return (
                      <button
                        key={role}
                        onClick={() =>
                          setDeveloperFilterState((prev) => ({
                            ...prev,
                            selectedRoles: prev.selectedRoles.includes(role)
                              ? prev.selectedRoles.filter((item) => item !== role)
                              : [...prev.selectedRoles, role],
                          }))
                        }
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 text-white shadow-md shadow-pink-500/50"
                            : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {role}
                      </button>
                    );
                  })}
                  {!developerFilterState.roleSearchQuery && (
                    <button
                      onClick={() =>
                        setDeveloperFilterState((prev) => ({
                          ...prev,
                          showAllRoles: !prev.showAllRoles,
                        }))
                      }
                      className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-out flex-shrink-0 bg-blue-500/15 text-blue-300 border border-blue-500/30 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-600/20 hover:text-blue-200 hover:border-blue-400/40 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                    >
                      {developerFilterState.showAllRoles ? "Show Less" : "See All"}
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Technology</p>
                <div className="relative">
                  <Input
                    value={developerFilterState.technologySearchQuery}
                    onChange={(e) =>
                      setDeveloperFilterState((prev) => ({
                        ...prev,
                        technologySearchQuery: e.target.value,
                        showAllTechnologies: e.target.value ? true : prev.showAllTechnologies,
                      }))
                    }
                    placeholder="Search technologies..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 pr-10"
                  />
                  {(developerFilterState.showAllTechnologies || developerFilterState.technologySearchQuery) && (
                    <button
                      onClick={() =>
                        setDeveloperFilterState((prev) => ({
                          ...prev,
                          technologySearchQuery: "",
                          showAllTechnologies: false,
                        }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                      aria-label="Reset developer technologies list"
                      title="Reset developer technologies list"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {displayedDeveloperTechnologyOptions.map((tech) => {
                    const isActive = developerFilterState.selectedTechnologies.includes(tech);
                    return (
                      <button
                        key={tech}
                        onClick={() =>
                          setDeveloperFilterState((prev) => ({
                            ...prev,
                            selectedTechnologies: prev.selectedTechnologies.includes(tech)
                              ? prev.selectedTechnologies.filter((item) => item !== tech)
                              : [...prev.selectedTechnologies, tech],
                          }))
                        }
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 text-white shadow-md shadow-pink-500/50"
                            : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {tech}
                      </button>
                    );
                  })}
                  {!developerFilterState.technologySearchQuery && (
                    <button
                      onClick={() =>
                        setDeveloperFilterState((prev) => ({
                          ...prev,
                          showAllTechnologies: !prev.showAllTechnologies,
                        }))
                      }
                      className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-out flex-shrink-0 bg-blue-500/15 text-blue-300 border border-blue-500/30 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-600/20 hover:text-blue-200 hover:border-blue-400/40 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                    >
                      {developerFilterState.showAllTechnologies ? "Show Less" : "See All"}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Nationality</p>
                  <div className="relative">
                    <Input
                      value={developerFilterState.nationalitySearchQuery}
                      onChange={(e) =>
                        setDeveloperFilterState((prev) => ({
                          ...prev,
                          nationalitySearchQuery: e.target.value,
                          showAllNationalities: e.target.value ? true : prev.showAllNationalities,
                        }))
                      }
                      placeholder="Search country..."
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 pr-10"
                    />
                    {(developerFilterState.showAllNationalities || developerFilterState.nationalitySearchQuery) && (
                      <button
                        onClick={() =>
                          setDeveloperFilterState((prev) => ({
                            ...prev,
                            nationalitySearchQuery: "",
                            showAllNationalities: false,
                          }))
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        aria-label="Reset developer nationality list"
                        title="Reset developer nationality list"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {displayedDeveloperNationalityOptions.map((item) => {
                      const isActive = developerFilterState.selectedNationalities.includes(item);
                      return (
                        <button
                          key={item}
                          onClick={() =>
                            setDeveloperFilterState((prev) => ({
                              ...prev,
                              selectedNationalities: prev.selectedNationalities.includes(item)
                                ? prev.selectedNationalities.filter((n) => n !== item)
                                : [...prev.selectedNationalities, item],
                            }))
                          }
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                            isActive
                              ? "bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 text-white shadow-md shadow-pink-500/50"
                              : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                    {!developerFilterState.nationalitySearchQuery && (
                      <button
                        onClick={() =>
                          setDeveloperFilterState((prev) => ({
                            ...prev,
                            showAllNationalities: !prev.showAllNationalities,
                          }))
                        }
                        className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-out flex-shrink-0 bg-blue-500/15 text-blue-300 border border-blue-500/30 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-600/20 hover:text-blue-200 hover:border-blue-400/40 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                      >
                        {developerFilterState.showAllNationalities ? "Show Less" : "See All"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Languages</p>
                  <div className="relative">
                    <Input
                      value={developerFilterState.languageSearchQuery}
                      onChange={(e) =>
                        setDeveloperFilterState((prev) => ({
                          ...prev,
                          languageSearchQuery: e.target.value,
                          showAllLanguages: e.target.value ? true : prev.showAllLanguages,
                        }))
                      }
                      placeholder="Search language..."
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 pr-10"
                    />
                    {(developerFilterState.showAllLanguages || developerFilterState.languageSearchQuery) && (
                      <button
                        onClick={() =>
                          setDeveloperFilterState((prev) => ({
                            ...prev,
                            languageSearchQuery: "",
                            showAllLanguages: false,
                          }))
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        aria-label="Reset developer languages list"
                        title="Reset developer languages list"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {displayedDeveloperLanguageOptions.map((item) => {
                      const isActive = developerFilterState.selectedLanguages.includes(item);
                      return (
                        <button
                          key={item}
                          onClick={() =>
                            setDeveloperFilterState((prev) => ({
                              ...prev,
                              selectedLanguages: prev.selectedLanguages.includes(item)
                                ? prev.selectedLanguages.filter((lang) => lang !== item)
                                : [...prev.selectedLanguages, item],
                            }))
                          }
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                            isActive
                              ? "bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 text-white shadow-md shadow-pink-500/50"
                              : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                    {!developerFilterState.languageSearchQuery && (
                      <button
                        onClick={() =>
                          setDeveloperFilterState((prev) => ({
                            ...prev,
                            showAllLanguages: !prev.showAllLanguages,
                          }))
                        }
                        className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-out flex-shrink-0 bg-blue-500/15 text-blue-300 border border-blue-500/30 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-600/20 hover:text-blue-200 hover:border-blue-400/40 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                      >
                        {developerFilterState.showAllLanguages ? "Show Less" : "See All"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {activeDeveloperFilterCount > 0 && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() =>
                    setDeveloperFilterState({
                      selectedRoles: [],
                      selectedTechnologies: [],
                      selectedNationalities: [],
                      selectedLanguages: [],
                      roleSearchQuery: "",
                      technologySearchQuery: "",
                      nationalitySearchQuery: "",
                      languageSearchQuery: "",
                      showAllRoles: false,
                      showAllTechnologies: false,
                      showAllNationalities: false,
                      showAllLanguages: false,
                    })
                  }
                  className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
                >
                  Clear developer filters
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
