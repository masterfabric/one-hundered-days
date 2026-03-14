"use client";

import { useCallback, useMemo, useState } from "react";
import type { KeyboardEvent } from "react";
import {
  UNIQUE_ROLE_OPTIONS,
  UNIQUE_TECH_OPTIONS,
  type StatusFilter,
} from "./projects-filter-constants";

export function useProjectsFilters() {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showAllTech, setShowAllTech] = useState(false);
  const [showAllRoles, setShowAllRoles] = useState(false);
  const [techSearchQuery, setTechSearchQuery] = useState("");
  const [roleSearchQuery, setRoleSearchQuery] = useState("");

  const handleSearch = useCallback(() => {
    const trimmedQuery = searchInput.trim();
    setSearchQuery(trimmedQuery);
    if (showFilters) {
      setShowFilters(false);
    }
    console.log("ProjectsPage: Search triggered with query:", trimmedQuery);
  }, [searchInput, showFilters]);

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
  }, []);

  const handleStatusFilter = useCallback((status: StatusFilter) => {
    setStatusFilter(status);
    if (status === "all") {
      setSelectedTech([]);
      setSelectedRole([]);
    }
    setShowFilters(false);
  }, []);

  const handleClearFilters = useCallback(() => {
    setStatusFilter("all");
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
    () => statusFilter !== "all" || selectedTech.length > 0 || selectedRole.length > 0,
    [statusFilter, selectedRole.length, selectedTech.length]
  );

  const activeFilterCount = useMemo(
    () =>
      [statusFilter !== "all" ? 1 : 0, selectedTech.length, selectedRole.length].reduce(
        (sum, count) => sum + count,
        0
      ),
    [selectedRole.length, selectedTech.length, statusFilter]
  );

  return {
    searchInput,
    searchQuery,
    statusFilter,
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
    setShowFilters,
    setShowAllTech,
    setShowAllRoles,
    setTechSearchQuery,
    setRoleSearchQuery,
    handleSearch,
    handleKeyDown,
    handleClearSearch,
    handleStatusFilter,
    handleClearFilters,
    handleTechToggle,
    handleRoleToggle,
  };
}

export type ProjectsFiltersState = ReturnType<typeof useProjectsFilters>;
