"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { KeyboardEvent } from "react";
import {
  UNIQUE_ROLE_OPTIONS,
  UNIQUE_TECH_OPTIONS,
  type StatusFilter,
} from "./projects-filter-constants";

export type SearchType = "project" | "developer";

export function useProjectsFilters() {
  const [searchType, setSearchType] = useState<SearchType>("project");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [statusTouched, setStatusTouched] = useState(false);
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showAllTech, setShowAllTech] = useState(false);
  const [showAllRoles, setShowAllRoles] = useState(false);
  const [techSearchQuery, setTechSearchQuery] = useState("");
  const [roleSearchQuery, setRoleSearchQuery] = useState("");

  const handleSearch = useCallback(() => {
    const trimmedQuery = searchInput.trim();
    setHasSearched(true);
    if (searchType === "project") {
      setSearchQuery(trimmedQuery);
    }
    if (showFilters) {
      setShowFilters(false);
    }
  }, [searchInput, searchType, showFilters]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
      }
    },
    [handleSearch]
  );

  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    setSearchQuery("");
    setHasSearched(false);
  }, []);

  const handleStatusFilter = useCallback((status: StatusFilter) => {
    setStatusTouched(true);
    setStatusFilter(status);
  }, []);

  const handleClearFilters = useCallback(() => {
    setStatusFilter("all");
    setStatusTouched(false);
    setSelectedTech([]);
    setSelectedRole([]);
  }, []);

  const handleTechToggle = useCallback((tech: string) => {
    setSelectedTech((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  }, []);

  const handleRoleToggle = useCallback((role: string) => {
    setSelectedRole((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  }, []);

  const displayedTechOptions = useMemo(() => {
    const initialTechOptions = UNIQUE_TECH_OPTIONS.slice(0, 5);
    return techSearchQuery
      ? UNIQUE_TECH_OPTIONS.filter((tech) =>
          tech.toLowerCase().includes(techSearchQuery.toLowerCase())
        )
      : showAllTech
        ? UNIQUE_TECH_OPTIONS
        : initialTechOptions;
  }, [techSearchQuery, showAllTech]);

  const displayedRoleOptions = useMemo(() => {
    const initialRoleOptions = UNIQUE_ROLE_OPTIONS.slice(0, 5);
    return roleSearchQuery
      ? UNIQUE_ROLE_OPTIONS.filter((role) =>
          role.toLowerCase().includes(roleSearchQuery.toLowerCase())
        )
      : showAllRoles
        ? UNIQUE_ROLE_OPTIONS
        : initialRoleOptions;
  }, [roleSearchQuery, showAllRoles]);

  const hasActiveFilters = useMemo(
    () => statusTouched || selectedTech.length > 0 || selectedRole.length > 0,
    [selectedRole.length, selectedTech.length, statusTouched]
  );

  const activeFilterCount = useMemo(
    () =>
      [statusTouched ? 1 : 0, selectedTech.length, selectedRole.length].reduce(
        (sum, count) => sum + count,
        0
      ),
    [selectedRole.length, selectedTech.length, statusTouched]
  );

  const handleSearchTypeChange = useCallback((type: SearchType) => {
    setSearchType(type);
    setSearchInput("");
    setSearchQuery("");
    setHasSearched(false);
    setShowFilters(false);
    setStatusTouched(false);
  }, []);

  const handleQuickSearch = useCallback(
    (term: string) => {
      const trimmed = term.trim();
      setSearchInput(trimmed);
      setHasSearched(true);
      if (searchType === "project") {
        setSearchQuery(trimmed);
      }
    },
    [searchType]
  );

  useEffect(() => {
    if (searchType !== "project") return;

    const trimmedQuery = searchInput.trim();
    const hasProjectFilters =
      statusTouched || selectedTech.length > 0 || selectedRole.length > 0;

    const timeoutId = setTimeout(() => {
      if (!trimmedQuery && !hasProjectFilters) {
        setSearchQuery("");
        setHasSearched(false);
        return;
      }

      setSearchQuery(trimmedQuery);
      setHasSearched(true);
    }, 220);

    return () => clearTimeout(timeoutId);
  }, [searchInput, searchType, selectedRole.length, selectedTech.length, statusTouched]);

  return {
    hasSearched,
    searchType,
    searchInput,
    searchQuery,
    statusFilter,
    statusTouched,
    selectedTech,
    selectedRole,
    showFilters,
    showAllTech,
    showAllRoles,
    techSearchQuery,
    roleSearchQuery,
    displayedTechOptions,
    displayedRoleOptions,
    hasActiveFilters,
    activeFilterCount,
    setSearchInput,
    setSearchType,
    setShowFilters,
    setShowAllTech,
    setShowAllRoles,
    setTechSearchQuery,
    setRoleSearchQuery,
    handleSearch,
    handleSearchTypeChange,
    handleQuickSearch,
    handleKeyDown,
    handleClearSearch,
    handleStatusFilter,
    handleClearFilters,
    handleTechToggle,
    handleRoleToggle,
  };
}

export type ProjectsFiltersState = ReturnType<typeof useProjectsFilters>;
