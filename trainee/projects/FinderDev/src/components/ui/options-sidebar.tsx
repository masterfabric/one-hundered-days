"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X, Search, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface OptionsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
  title: string;
}

export function OptionsSidebar({
  isOpen,
  onClose,
  options,
  selected,
  onToggle,
  title,
}: OptionsSidebarProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  // Disable body scroll when sidebar is open
  React.useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Filter and sort options based on search
  const filteredOptions = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    
    if (!query) {
      return options.sort();
    }
    
    // Priority: starts with query > contains query
    const startsWith = options.filter((option) =>
      option.toLowerCase().startsWith(query)
    ).sort();
    
    const contains = options.filter((option) =>
      option.toLowerCase().includes(query) && !option.toLowerCase().startsWith(query)
    ).sort();
    
    return [...startsWith, ...contains];
  }, [options, searchQuery]);

  return (
    <>
      {typeof window !== "undefined" && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/50"
                style={{ zIndex: 10001 }}
                onClick={onClose}
              />
              {/* Sidebar */}
              <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed w-[420px] bg-slate-950 backdrop-blur-md border-l border-white/20 flex flex-col shadow-2xl shadow-black/50"
              style={{ 
                right: 0, 
                top: 0,
                height: "100vh",
                maxHeight: "100vh",
                overflow: "hidden",
                position: "fixed",
                zIndex: 10002
              }}
              onClick={(e) => e.stopPropagation()}
            >
            {/* Header */}
            <div 
              className="p-6 border-b border-white/10 flex-shrink-0 bg-white/5 backdrop-blur-sm"
              style={{ flexShrink: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-purple-500">
                  {title === "Role" ? "Roles" : title}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 z-10" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 py-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-200 ease-out text-white placeholder:text-white/40 text-sm"
                />
              </div>
            </div>

            {/* Options List - Scrollable area */}
            <div 
              className="bg-slate-950"
              style={{
                flex: "1 1 0%",
                minHeight: 0,
                overflowY: "auto",
                overflowX: "hidden",
                WebkitOverflowScrolling: "touch",
                msOverflowStyle: "auto",
                position: "relative"
              }}
            >
              <div className="p-6" style={{ minHeight: "min-content" }}>
                <div className="flex flex-wrap gap-2" style={{ gap: "0.5rem" }}>
                  {filteredOptions.map((option) => {
                    const isSelected = selected.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => onToggle(option)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ease-out flex-shrink-0 items-center gap-1.5 flex",
                          isSelected
                            ? "bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 text-white shadow-md shadow-pink-500/50"
                            : "bg-white/5 text-slate-300 border border-white/10 hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-purple-600/20 hover:text-pink-400 hover:border-pink-500/30 hover:shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                        )}
                        style={{
                          lineHeight: "1.5",
                          margin: 0
                        }}
                      >
                        {isSelected && (
                          <Check className="h-3.5 w-3.5 flex-shrink-0" />
                        )}
                        <span className="whitespace-nowrap">{option}</span>
                      </button>
                    );
                  })}
                </div>
                
                {/* Results count */}
                {searchQuery && filteredOptions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-white/50 text-center">
                      {filteredOptions.length} {filteredOptions.length === 1 ? "option" : "options"} found
                    </p>
                  </div>
                )}
                
                {searchQuery && filteredOptions.length === 0 && (
                  <div className="mt-8 text-center">
                    <p className="text-sm text-white/40">No options found</p>
                    <p className="text-xs text-white/30 mt-1">Try a different search term</p>
                  </div>
                )}
              </div>
            </div>
            </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
