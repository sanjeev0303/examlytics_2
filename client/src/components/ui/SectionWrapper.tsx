"use client";

import React from "react";
import { motion } from "motion/react";
import type { HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

interface SectionWrapperProps extends HTMLMotionProps<"section"> {
  children: React.ReactNode;
  perspective?: boolean;
}

/**
 * Fade-in-when-visible section wrapper.
 * The previous useScroll/useTransform hooks created 10 scroll listeners
 * while y/opacity transforms were never applied to children — removed.
 */
export const SectionWrapper = ({
  children,
  className,
  perspective = false,
  ...props
}: SectionWrapperProps) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative w-full min-h-screen flex items-center justify-center py-20 px-6",
        perspective && "perspective-1000",
        className
      )}
      {...props}
    >
      <div className="container mx-auto max-w-7xl relative z-10">
        {children}
      </div>
      <div className="absolute inset-0 bg-brand-deep/50 -z-10 pointer-events-none" />
    </motion.section>
  );
};
