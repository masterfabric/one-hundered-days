"use client";

import * as React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SelectionSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTech: string[];
  selectedRoles: string[];
  onTechToggle: (tech: string) => void;
  onRoleToggle: (role: string) => void;
}

const techCategories = {
  "Frontend": ["React", "Next.js", "Vue.js", "Angular", "TypeScript"],
  "Backend": ["Node.js", "Express", "Django", "Python"],
  "Database": ["MongoDB", "PostgreSQL", "Firebase"],
  "Cloud & DevOps": ["AWS", "Flutter"],
};

const roleOptions = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "UI Designer",
  "UX Designer",
  "Mobile Developer",
  "DevOps Engineer",
  "Product Manager",
];

export function SelectionSidebar({
  isOpen,
  onClose,
  selectedTech,
  selectedRoles,
  onTechToggle,
  onRoleToggle,
}: SelectionSidebarProps) {
  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={onClose}
            />
            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-950 border-l border-white/10 z-50 overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-purple-500">
                    Select Technologies & Roles
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Technologies Section */}
                <div className="space-y-4">
                  <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                    Technologies
                  </p>
                  {Object.entries(techCategories).map(([category, techs]) => (
                    <div key={category} className="space-y-3">
                      <p className="text-sm font-medium text-slate-300">
                        {category}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {techs.map((tech) => {
                          const isActive = selectedTech.includes(tech);
                          return (
                            <button
                              key={tech}
                              type="button"
                              onClick={() => onTechToggle(tech)}
                              className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-out flex-shrink-0 min-w-[120px] justify-center",
                                isActive
                                  ? "bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 text-white shadow-md shadow-pink-500/50"
                                  : "bg-white/5 text-slate-300 border border-white/10 hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-purple-600/20 hover:text-pink-400 hover:border-pink-500/30 hover:shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                              )}
                            >
                              {tech}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Roles Section */}
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                    Role
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {roleOptions.map((role) => {
                      const isActive = selectedRoles.includes(role);
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => onRoleToggle(role)}
                          className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-out flex-shrink-0 min-w-[120px] justify-center",
                            isActive
                              ? "bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 text-white shadow-md shadow-pink-500/50"
                              : "bg-white/5 text-slate-300 border border-white/10 hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-purple-600/20 hover:text-pink-400 hover:border-pink-500/30 hover:shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                          )}
                        >
                          {role}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
