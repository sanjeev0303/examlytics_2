"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Dashboard3D,
  Activity3D,
  Book3D,
  Target3D,
  History3D,
  Settings3D
} from "@/components/ui/3d-icons";
import { NavLink } from "./NavItem";
import {
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "motion/react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: Dashboard3D },
  { label: "Learning Analytics", href: "/learning-analytics", icon: Activity3D },
  { label: "Exams", href: "/exams", icon: Book3D },
  { label: "Weak Topics", href: "/weak-topics", icon: Target3D },
  { label: "History", href: "/history", icon: History3D },
  { label: "Settings", href: "/settings", icon: Settings3D },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user, getToken } = useAuth();
  const queryClient = useQueryClient();

  // Prefetch data for a route when user hovers over the link.
  // React Query's prefetchQuery is a no-op when data is already fresh,
  // so this is safe to call on every hover.
  const prefetchRoute = useCallback(async (href: string) => {
    // Let Next.js prefetch the JS chunk for the page
    router.prefetch(href);

    if (!user?.id) return;
    const token = await getToken();
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    switch (href) {
      case "/dashboard":
        queryClient.prefetchQuery({ queryKey: ["examHistory"], queryFn: () => api.getExamHistory({ headers }) });
        queryClient.prefetchQuery({ queryKey: ["weakTopics"],  queryFn: () => api.getWeakTopics({ headers }) });
        queryClient.prefetchQuery({ queryKey: ["streakData"],  queryFn: () => api.getStreaks({ headers }) });
        break;
      case "/history":
        queryClient.prefetchQuery({ queryKey: ["examHistory"], queryFn: () => api.getExamHistory({ headers }) });
        break;
      case "/learning-analytics":
        queryClient.prefetchQuery({ queryKey: ["readiness-score"], queryFn: () => api.getStreaks({ headers }) });
        queryClient.prefetchQuery({ queryKey: ["streaks"],  queryFn: () => api.getStreaks({ headers }) });
        queryClient.prefetchQuery({ queryKey: ["examHistory"], queryFn: () => api.getExamHistory({ headers }) });
        break;
      case "/analytics":
        queryClient.prefetchQuery({ queryKey: ["examHistory"], queryFn: () => api.getExamHistory({ headers }) });
        queryClient.prefetchQuery({ queryKey: ["streakData"],  queryFn: () => api.getStreaks({ headers }) });
        break;
      case "/weak-topics":
        queryClient.prefetchQuery({ queryKey: ["weakTopics"], queryFn: () => api.getWeakTopics({ headers }) });
        break;
    }
  }, [user?.id, getToken, queryClient, router]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <aside
      className={cn(
        "h-screen bg-[#0F172A] backdrop-blur-3xl border-r border-[#22D3EE]/20 transition-all duration-300 ease-in-out relative flex flex-col z-50 overflow-hidden",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Animated Background Mesh */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-50 dark:opacity-20">
        <motion.div
           animate={{
            scale: [1, 1.2, 1],
            y: [0, 20, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-blue-500/20 blur-[80px]"
        />
        <motion.div
           animate={{
            scale: [1, 1.1, 1],
            y: [0, -20, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-10 -right-20 w-64 h-64 rounded-full bg-indigo-500/20 blur-[80px]"
        />
      </div>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-[#0F172A] border border-[#22D3EE]/30 rounded-full p-1 shadow-[0_0_15px_rgba(34,211,238,0.3)] z-50 cursor-pointer text-[#22D3EE]"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </motion.button>

      {/* Header */}
      <div className={cn("h-16 flex items-center px-6 border-b border-[#22D3EE]/20 mb-6 relative z-10 bg-[#0F172A]", isCollapsed ? "justify-center px-0" : "justify-between")}>
        <div className="flex items-center gap-3 overflow-hidden">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.4 }}
            className="w-8 h-8 rounded-xl bg-linear-to-br from-[#22D3EE] to-[#818CF8] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
          >
            <span className="text-white font-bold font-heading">E</span>
          </motion.div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-heading font-bold text-xl text-white truncate tracking-tight"
              >
                Examlytics
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1.5 relative z-10 w-full mb-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <NavLink
              key={item.href}
              item={item}
              isActive={isActive}
              isCollapsed={isCollapsed}
              prefetchRoute={prefetchRoute}
            />
          );
        })}
      </nav>

      {/* User Section */}
      <div className={cn("p-4 border-t border-white/10 mt-auto relative z-10", isCollapsed && "flex justify-center")}>
        <motion.div
          onClick={handleLogout}
          whileHover={{ y: -2 }}
          className={cn("flex items-center gap-3 p-2 rounded-xl transition-all duration-300 w-full group overflow-hidden border border-transparent cursor-pointer",
            !isCollapsed && "hover:border-red-500/30 hover:bg-red-500/10 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]",
            isCollapsed && "justify-center p-0"
          )}
        >
          {mounted ? (
            <div className="relative w-9 h-9 shrink-0 rounded-full flex items-center justify-center bg-zinc-800/80 overflow-hidden shadow-inner group-hover:bg-red-500/20 group-hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all duration-300">
              <LogOut size={16} className="text-zinc-400 group-hover:text-red-400 relative z-10 transition-colors" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-full bg-zinc-800/80 animate-pulse shrink-0" />
          )}

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -5, width: 0 }}
                animate={{ opacity: 1, x: 0, width: "auto" }}
                exit={{ opacity: 0, x: -5, width: 0 }}
                className="flex flex-col truncate"
              >
                <span className="text-sm font-semibold text-zinc-200 group-hover:text-red-300 transition-colors truncate">
                  {user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email : "Account"}
                </span>
                <span className="text-xs text-zinc-500 group-hover:text-red-400/80 transition-colors truncate">
                  Sign out
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </aside>
  );
}
