"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);

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
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[56px] py-4 px-4 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-200 ease-out text-left flex items-center gap-2 flex-wrap"
      >
        {selected.length === 0 ? (
          <span className="text-white/40 text-sm">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-2 flex-1">
            <AnimatePresence>
              {selected.map((item) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Badge
                    variant="outline"
                    className="bg-gradient-to-r from-pink-500/20 to-purple-600/20 text-pink-400 border-pink-500/30 hover:bg-gradient-to-r hover:from-pink-500/30 hover:to-purple-600/30 transition-all duration-200 ease-out cursor-default"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={(e) => removeOption(item, e)}
                      className="ml-2 hover:bg-pink-500/30 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        <span className="text-white/40 text-xs ml-auto">
          {selected.length} selected
        </span>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute z-50 w-full mt-2 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 max-h-[300px] overflow-y-auto"
            >
              <div className="flex flex-wrap gap-2">
                {options.map((option) => {
                  const isSelected = selected.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleOption(option)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-out flex-shrink-0 min-w-[120px] justify-center",
                        isSelected
                          ? "bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 text-white shadow-md shadow-pink-500/50"
                          : "bg-white/5 text-slate-300 border border-white/10 hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-purple-600/20 hover:text-pink-400 hover:border-pink-500/30 hover:shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
