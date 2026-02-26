"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { User, Settings, Bell, LayoutGrid, Users, PlusSquare } from "lucide-react";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
}

const sidebarItems: SidebarItem[] = [
  {
    id: "projects",
    label: "Projects",
    icon: <LayoutGrid className="h-5 w-5" />,
    href: "/projects",
  },
  {
    id: "developers",
    label: "Developers",
    icon: <Users className="h-5 w-5" />,
    href: "/developers",
  },
  {
    id: "create-project",
    label: "Create Project",
    icon: <PlusSquare className="h-5 w-5" />,
    href: "/projects/create",
  },
  {
    id: "profile",
    label: "Profile",
    icon: <User className="h-5 w-5" />,
    href: "/profile",
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings className="h-5 w-5" />,
    href: "/settings",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: <Bell className="h-5 w-5" />,
    href: "/notifications",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  // Persist sidebar open state across page navigations
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("sidebarOpen") === "true";
    }
    return false;
  });
  const [activeItem, setActiveItem] = useState<string | null>(null);

  // Save sidebar state to sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("sidebarOpen", isOpen.toString());
    }
  }, [isOpen]);

  // Determine active item based on pathname
  useEffect(() => {
    // Check items in order, more specific paths first
    let currentItem = null;
    
    for (const item of sidebarItems) {
      if (!item.href) continue;
      
      // Special handling for create-project - exact match only
      if (item.id === "create-project") {
        if (pathname === "/projects/create") {
          currentItem = item;
          break;
        }
        continue;
      }
      
      // Special handling for projects - match /projects but not /projects/create
      if (item.id === "projects") {
        if (pathname === "/projects" || (pathname?.startsWith("/projects/") && pathname !== "/projects/create")) {
          currentItem = item;
          break;
        }
        continue;
      }
      
      // For other items, use exact match or startsWith
      if (pathname === item.href || pathname?.startsWith(item.href + "/")) {
        currentItem = item;
        break;
      }
    }
    
    setActiveItem(currentItem?.id || null);
  }, [pathname]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleItemClick = (e: React.MouseEvent, item: SidebarItem) => {
    e.preventDefault();
    setActiveItem(item.id);
    // Keep dropdown open when navigating
    if (item.href) {
      router.push(item.href);
    }
  };

  const renderSidebarContent = () => (
    <aside
      data-sidebar
      className="h-full w-[260px] bg-slate-900/50 border-r border-white/10 flex flex-col"
    >
      {/* Logo Header */}
      <div className="p-4 relative z-10">
        <Link
          href="/"
          onClick={() => setIsOpen(false)}
          className="flex items-center space-x-2 group w-full relative z-10"
        >
          <motion.div
            className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 relative overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"
              animate={{
                opacity: [0.1, 0.3, 0.1],
                rotate: [0, 360]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            />
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
              <motion.path
                d="M7 7H17M7 12H14M7 7V17"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
              <motion.path
                d="M14 7C16.5 7 17 8.5 17 11C17 13.5 15.5 15 14 15V15"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.8"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 0.2, ease: "easeInOut" }}
              />
            </svg>
          </motion.div>
          <div className="flex flex-col">
            <span className="font-bold text-xl leading-none tracking-tight text-white">FinderDev</span>
            <span className="text-[10px] text-blue-400 font-medium uppercase tracking-[0.2em] mt-1">
              Match & Build
            </span>
          </div>
        </Link>
      </div>


      {/* Sidebar Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <motion.div
              key={item.id}
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                href={item.href || "#"}
                onClick={(e) => handleItemClick(e, item)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ease-out ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-purple-600/20 text-white border border-purple-500/30 shadow-lg shadow-purple-500/20"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div
                  className={`transition-colors ${
                    isActive ? "text-purple-400" : "text-slate-400"
                  }`}
                >
                  {item.icon}
                </div>
                <span className="text-sm font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    className="ml-auto h-2 w-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-white/10">
        <p className="text-xs text-slate-500 text-center">
          FinderDev © 2024
        </p>
      </div>
    </aside>
  );

  return (
    <>
      {/* Logo Button - Fixed at top left (hidden when sidebar is open) */}
      {!isOpen && (
        <motion.button
          data-sidebar-toggle
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-[100] flex items-center space-x-2 bg-transparent p-0 hover:opacity-80 transition-opacity"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
        <motion.div
          className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 relative overflow-hidden"
          whileHover={{ scale: 1.05 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"
            animate={{
              opacity: [0.1, 0.3, 0.1],
              rotate: [0, 360]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          />
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
            <motion.path
              d="M7 7H17M7 12H14M7 7V17"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            <motion.path
              d="M14 7C16.5 7 17 8.5 17 11C17 13.5 15.5 15 14 15V15"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 0.2, ease: "easeInOut" }}
            />
          </svg>
        </motion.div>
        <div className="flex flex-col">
          <span className="font-bold text-xl leading-none tracking-tight text-white">FinderDev</span>
          <span className="text-[10px] text-blue-400 font-medium uppercase tracking-[0.2em] mt-1">
            Match & Build
          </span>
        </div>
      </motion.button>
      )}

      {/* Dropdown Sidebar */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="fixed left-0 top-0 h-full z-[60]">
            {renderSidebarContent()}
          </div>
        </>
      )}
    </>
  );
}
