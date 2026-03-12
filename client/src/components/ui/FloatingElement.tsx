"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  depth?: number;
}

export const FloatingElement = ({
  children,
  className,
  delay = 0,
  depth = 1,
}: FloatingElementProps) => {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      animate={
        prefersReduced
          ? {} // No animation — respect OS accessibility setting
          : {
              y: [0, -10 * depth, 0],
              rotate: [0, 1 * depth, -1 * depth, 0],
            }
      }
      transition={{
        duration: 5 + Math.random() * 2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay,
      }}
      className={cn("absolute", className)}
    >
      {children}
    </motion.div>
  );
};
