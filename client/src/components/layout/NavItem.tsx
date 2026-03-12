"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  item: any;
  isActive: boolean;
  isCollapsed: boolean;
  prefetchRoute: (href: string) => void;
}

export function NavLink({ item, isActive, isCollapsed, prefetchRoute }: NavItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
      <Link
        href={item.href}
        onMouseEnter={() => {
          prefetchRoute(item.href);
          setIsHovered(true);
        }}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
          isActive
            ? "bg-[#0F172A] text-[#22D3EE] font-semibold border border-white/10 shadow-[0_0_15px_rgba(34,211,238,0.1)]"
            : "text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent hover:shadow-lg"
        )}
      >
        {isActive && (
          <motion.div
            layoutId="activeNavIndicator"
            className="absolute left-0 w-1 h-6 bg-[linear-gradient(to_bottom,#22D3EE,#A78BFA)] rounded-r-full shadow-[0_0_10px_#22D3EE]"
            initial={false}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}

        {/* Render our 3D Icon */}
        <div className="relative z-10 flex shrink-0 items-center justify-center">
          {isActive && (
            <div className="absolute inset-0 bg-[#22D3EE] rounded-full blur-[10px] opacity-20"></div>
          )}
          <item.icon
            className="w-6 h-6 transition-colors z-10"
            isActive={isActive}
            isHovered={isHovered}
          />
        </div>

        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, width: 0 }}
              className={cn("truncate z-10 tracking-wide", isActive ? "text-[#22D3EE]" : "text-zinc-300 group-hover:text-white")}
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>

        {isCollapsed && (
          <div className="absolute left-14 px-3 py-1.5 bg-[#0F172A] border border-white/10 text-[#22D3EE] text-xs font-semibold tracking-wider rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            {item.label}
          </div>
        )}
      </Link>
    </motion.div>
  );
}
