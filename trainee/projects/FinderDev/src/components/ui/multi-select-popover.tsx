"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Search, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { OptionsSidebar } from "@/components/ui/options-sidebar";
import { cn } from "@/lib/utils";

interface MultiSelectPopoverProps {
  options: string[];
  popularOptions?: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  onSidebarOpen?: () => void;
  onSidebarClose?: () => void;
  isOtherSidebarOpen?: boolean;
}

export function MultiSelectPopover({
  options,
  popularOptions = [],
  selected,
  onChange,
  placeholder = "Select options...",
  label,
  className,
  onSidebarOpen,
  onSidebarClose,
  isOtherSidebarOpen = false,
}: MultiSelectPopoverProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // Close sidebar if other sidebar opens
  React.useEffect(() => {
    if (isOtherSidebarOpen && isSidebarOpen) {
      setIsSidebarOpen(false);
      onSidebarClose?.();
    }
  }, [isOtherSidebarOpen, isSidebarOpen, onSidebarClose]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [popoverPosition, setPopoverPosition] = React.useState({ top: 0, left: 0, width: 0 });
  const inputRef = React.useRef<HTMLDivElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  // Filter and sort options based on search
  const { filteredOptions, hiddenCount } = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    
    if (!query) {
      // No search query - show all popular options
      const popular = popularOptions
        .filter(opt => options.includes(opt));
      // Fixed hidden count to 99+
      return { filteredOptions: popular, hiddenCount: 99 };
    }
    
    // Search query exists - show all matching options, sorted alphabetically
    // Priority: starts with query > contains query
    const startsWith = options.filter((option) =>
      option.toLowerCase().startsWith(query)
    ).sort();
    
    const contains = options.filter((option) =>
      option.toLowerCase().includes(query) && !option.toLowerCase().startsWith(query)
    ).sort();
    
    return { filteredOptions: [...startsWith, ...contains], hiddenCount: 0 };
  }, [options, popularOptions, searchQuery]);

  // Calculate popover position
  const updatePosition = React.useCallback(() => {
    if (inputRef.current) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        if (inputRef.current) {
          const rect = inputRef.current.getBoundingClientRect();
          setPopoverPosition({
            top: rect.bottom + 8,
            left: rect.left,
            width: rect.width,
          });
        }
      });
    }
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        updatePosition();
      }, 0);
      
      // Update position on scroll or resize
      const handleScroll = () => updatePosition();
      const handleResize = () => updatePosition();
      
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleResize);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener("scroll", handleScroll, true);
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [isOpen, updatePosition]);

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const removeOption = (option: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((item) => item !== option));
  };

  return (
    <div className={cn("relative w-full", className)}>
      {label && (
        <label className="text-sm font-medium text-slate-300 mb-2 block">
          {label}
        </label>
      )}
      
      {/* Input with badges */}
      <div ref={inputRef} className="relative z-0">
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (!isOpen) {
              // Calculate position before opening - use the clicked element
              const target = e.currentTarget;
              const rect = target.getBoundingClientRect();
              setPopoverPosition({
                top: rect.bottom + 8,
                left: rect.left,
                width: rect.width,
              });
            }
            setIsOpen(!isOpen);
          }}
          className={cn(
            "w-full min-h-[56px] py-4 px-4 rounded-full bg-white/5 backdrop-blur-sm border border-white/10",
            "hover:bg-white/10 hover:border-purple-500/30",
            "focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500/50",
            "outline-none transition-all duration-200 ease-out",
            "cursor-pointer flex items-center gap-2 flex-wrap",
            isOpen && "ring-2 ring-blue-500/50 border-blue-500/50"
          )}
        >
          {selected.length === 0 ? (
            <span className="text-white/40 text-sm flex-1">
              {placeholder}
            </span>
          ) : (
            <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
              <AnimatePresence>
                {selected.map((item) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0"
                  >
                    <Badge
                      variant="outline"
                      className="bg-gradient-to-r from-pink-500/20 to-purple-600/20 text-pink-400 border-pink-500/30 hover:bg-gradient-to-r hover:from-pink-500/30 hover:to-purple-600/30 transition-all duration-200 ease-out px-2 py-0.5 text-xs cursor-default"
                    >
                      <span className="truncate max-w-[120px]">{item}</span>
                      <button
                        type="button"
                        onClick={(e) => removeOption(item, e)}
                        className="ml-1.5 hover:bg-pink-500/30 rounded-full p-0.5 transition-colors flex-shrink-0"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            {selected.length > 0 && (
              <span className="text-xs text-white/40 whitespace-nowrap">
                {selected.length}
              </span>
            )}
            <div className="h-5 w-5 flex items-center justify-center">
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <svg
                  className="h-4 w-4 text-white/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Popover - Rendered via Portal to ensure it's above everything */}
        {typeof window !== "undefined" && createPortal(
          <>
            {/* Overlay - transparent, prevents clicks from going through */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[9998] bg-transparent"
                  onClick={() => {
                    setIsOpen(false);
                    setSearchQuery("");
                  }}
                />
              )}
            </AnimatePresence>

            {/* Popover - Floating above everything */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  ref={popoverRef}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="fixed z-[9999] rounded-2xl bg-slate-900/95 backdrop-blur-md border border-white/20 shadow-2xl shadow-black/50 max-h-[320px] flex flex-col overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    top: `${popoverPosition.top}px`,
                    left: `${popoverPosition.left}px`,
                    width: `${popoverPosition.width || 0}px`,
                    minWidth: `${popoverPosition.width || 0}px`,
                  }}
                >
              {/* Search Input */}
              <div className="p-3 border-b border-white/10 flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 z-10" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    className="pl-10 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-200 ease-out text-white placeholder:text-white/40 text-sm"
                  />
                </div>
              </div>

              {/* Options List - Fixed height, scrollable */}
              <div className="overflow-y-auto flex-1 p-3">
                {filteredOptions.length === 0 ? (
                  <div className="text-center py-6 text-white/40 text-sm">
                    No options found
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {filteredOptions.map((option) => {
                        const isSelected = selected.includes(option);
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleOption(option);
                            }}
                            className={cn(
                              "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ease-out flex-shrink-0 items-center gap-1.5 flex",
                              isSelected
                                ? "bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 text-white shadow-md shadow-pink-500/50"
                                : "bg-white/5 text-slate-300 border border-white/10 hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-purple-600/20 hover:text-pink-400 hover:border-pink-500/30 hover:shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                            )}
                          >
                            {isSelected && (
                              <Check className="h-3.5 w-3.5 flex-shrink-0" />
                            )}
                            <span className="whitespace-nowrap">{option}</span>
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Show hidden count message when there are more options */}
                    {hiddenCount > 0 && (
                      <div className="pt-2 border-t border-white/10">
                        <p className="text-xs text-white/50 text-center">
                          <span className="font-medium text-white/70">{hiddenCount}+</span> more options available.{" "}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsSidebarOpen(true);
                              onSidebarOpen?.();
                            }}
                            className="text-blue-400 hover:text-blue-300 underline transition-colors font-medium"
                          >
                            Search to see all
                          </button>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>,
          document.body
        )}

        {/* Options Sidebar */}
        <OptionsSidebar
          isOpen={isSidebarOpen}
          onClose={() => {
            setIsSidebarOpen(false);
            onSidebarClose?.();
          }}
          options={options}
          selected={selected}
          onToggle={toggleOption}
          title={label || "Options"}
        />
      </div>
    </div>
  );
}
