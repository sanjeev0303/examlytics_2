"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'motion/react';
import { BrainCircuit, Trophy, Medal, Cuboid, Target, Clock, Zap, Loader2 } from 'lucide-react';

// Spline is ~2 MB — load it lazily, never on the server
const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center gap-4 text-[#22D3EE] font-mono text-sm animate-pulse w-full h-full">
      <Loader2 className="w-10 h-10 animate-spin" />
      Initializing Knowledge Graph...
    </div>
  ),
});

export function SplineHero() {
  const [tutorHovered, setTutorHovered] = useState(false);

  return (
    <div className="w-full h-125 md:h-162.5 relative rounded-[2.5rem] overflow-hidden bg-[#0F172A] border border-white/10 shadow-2xl">
      {/* Background Environment / Gradients */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.1),rgba(167,139,250,0.05),transparent)] z-0"></div>

      {/* Soft Fog / Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#22D3EE]/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#A78BFA]/20 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Holographic UI grids in background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-size-[2rem_2rem] mask-[radial-gradient(ellipse_60%_60%_at_50%_100%,#000_10%,transparent_100%)] z-0"></div>

      {/* Center Spline (AI Analytics Engine / Neural Core) — dynamic import handles SSR & loading */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <Spline scene="https://prod.spline.design/o3v1HPnOwXUx88B6/scene.splinecode" />
      </div>

      {/* Floating Dashboard Cards (Left side) */}
      <motion.div
        className="absolute top-8 left-8 z-10 flex flex-col gap-4 pointer-events-auto"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-[linear-gradient(to_right,white,rgba(255,255,255,0.7))] mb-2 tracking-tight">
          AI Engine
        </h2>

        {/* Floating Card: Accuracy */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          animate={{ y: [0, -5, 0] }}
          transition={{ y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
          className="px-5 py-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] flex items-center gap-4 w-64 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-[#22D3EE]/20 flex items-center justify-center shrink-0 group-hover:bg-[#22D3EE]/30 transition-colors">
            <Target className="w-5 h-5 text-[#22D3EE]" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 font-bold tracking-wider uppercase mb-1">Accuracy</p>
            <p className="text-xl font-bold text-white">92%</p>
          </div>
        </motion.div>

        {/* Floating Card: Rank */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          animate={{ y: [0, 6, 0] }}
          transition={{ y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 } }}
          className="px-5 py-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(167,139,250,0.2)] flex items-center gap-4 w-64 mt-2 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-[#A78BFA]/20 flex items-center justify-center shrink-0 group-hover:bg-[#A78BFA]/30 transition-colors">
            <Zap className="w-5 h-5 text-[#A78BFA]" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 font-bold tracking-wider uppercase mb-1">Rank</p>
            <p className="text-xl font-bold text-white">Top 15%</p>
          </div>
        </motion.div>

        {/* Floating Card: Time Usage */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          animate={{ y: [0, -4, 0] }}
          transition={{ y: { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 } }}
          className="px-5 py-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center gap-4 w-64 mt-2 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 font-bold tracking-wider uppercase mb-1">Time Usage</p>
            <p className="text-xl font-bold text-white">78% efficiency</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Gamified Achievement Objects (Floating around scene) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {/* Top 10% Trophy */}
        <motion.div
          className="absolute top-1/4 right-[35%] flex flex-col items-center pointer-events-auto lg:flex"
          animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          whileHover={{ scale: 1.15, filter: 'brightness(1.2)' }}
        >
          <div className="w-12 h-12 rounded-2xl bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] flex items-center justify-center backdrop-blur-md shadow-[0_0_30px_rgba(245,158,11,0.15)] cursor-pointer">
            <Trophy className="w-6 h-6 text-[#F59E0B]" />
          </div>
          <motion.span
            initial={{ opacity: 0.8 }}
            whileHover={{ opacity: 1 }}
            className="mt-3 text-[10px] uppercase font-bold text-[#F59E0B] bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-md border border-[#F59E0B]/20"
          >
            Top 10%
          </motion.span>
        </motion.div>

        {/* Speed Master Medal */}
        <motion.div
          className="absolute bottom-1/3 left-[40%] flex flex-col items-center pointer-events-auto md:flex"
          animate={{ y: [0, 12, 0], rotate: [0, -8, 8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          whileHover={{ scale: 1.15, filter: 'brightness(1.2)' }}
        >
          <div className="w-12 h-12 rounded-2xl bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.2)] flex items-center justify-center backdrop-blur-md shadow-[0_0_30px_rgba(59,130,246,0.15)] cursor-pointer">
            <Medal className="w-6 h-6 text-[#3B82F6]" />
          </div>
          <span className="mt-3 text-[10px] uppercase font-bold text-[#3B82F6] bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-md border border-[#3B82F6]/20">
            Speed Master
          </span>
        </motion.div>

        {/* Accuracy Expert Cube */}
        <motion.div
          className="absolute top-1/3 left-[55%] flex flex-col items-center pointer-events-auto lg:flex"
          animate={{ y: [0, -10, 0], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          whileHover={{ scale: 1.15, filter: 'brightness(1.2)' }}
        >
          <div className="w-12 h-12 rounded-2xl bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] flex items-center justify-center backdrop-blur-md shadow-[0_0_30px_rgba(16,185,129,0.15)] cursor-pointer">
            <Cuboid className="w-6 h-6 text-[#10B981]" />
          </div>
          <span className="mt-3 text-[10px] uppercase font-bold text-[#10B981] bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-md border border-[#10B981]/20">
            Accuracy Expert
          </span>
        </motion.div>
      </div>

      {/* Right Side — AI Tutor Character */}
      <motion.div
        className="absolute bottom-12 right-12 z-20 flex flex-col items-end pointer-events-auto"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        onMouseEnter={() => setTutorHovered(true)}
        onMouseLeave={() => setTutorHovered(false)}
      >
        {/* Speech Bubble */}
        <AnimatePresence>
          <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10, originX: 1, originY: 1 }}
              animate={{
                opacity: tutorHovered ? 1 : 0.8,
                scale: tutorHovered ? 1 : 0.9,
                y: tutorHovered ? -10 : 0
              }}
              className="mb-4 bg-white/5 backdrop-blur-2xl border border-white/10 p-5 rounded-2xl rounded-br-sm shadow-[0_10px_40px_rgba(0,0,0,0.5)] max-w-65 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.1),transparent)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <p className="text-sm leading-relaxed text-zinc-200">
                {tutorHovered ? (
                   <span className="text-cyan-100">"Your accuracy improved by <strong className="text-cyan-400">12%</strong>! Your weakest topic is probability, let's practice!"</span>
                ) : (
                  <span>"Hello! I'm your AI tutor. I've analyzed your recent exam performance."</span>
                )}
              </p>
            </motion.div>
        </AnimatePresence>

        {/* AI Robot / Mascot */}
        <motion.div
          animate={tutorHovered ? {
            y: [0, -15, 0],
            rotate: [0, -5, 5, 0]
          } : {
            y: [0, -8, 0],
            rotate: 0
          }}
          transition={{ duration: tutorHovered ? 0.5 : 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 rounded-4xl bg-[#0F172A] border border-[#22D3EE]/30 shadow-[0_0_40px_rgba(34,211,238,0.2)] flex items-center justify-center cursor-help overflow-hidden relative group"
        >
          <div className="absolute inset-0 bg-[#22D3EE]/5 group-hover:bg-[#22D3EE]/20 transition-colors duration-500" />

          {/* Animated Core */}
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-12 h-12 bg-[#22D3EE]/20 rounded-full blur-xl group-hover:bg-[#22D3EE]/40 transition-colors"></div>
          </div>

          <BrainCircuit className={`w-10 h-10 text-[#22D3EE] transition-transform duration-300 relative z-10 ${tutorHovered ? 'scale-110' : ''}`} />

          {/* Robot 'eyes' / Indicators */}
          <div className="absolute top-6 flex gap-4 z-10">
            <div className={`w-1.5 bg-[#22D3EE] rounded-full transition-all duration-300 shadow-[0_0_10px_#22D3EE] ${tutorHovered ? 'h-4 bg-cyan-300' : 'h-2'}`} />
            <div className={`w-1.5 bg-[#22D3EE] rounded-full transition-all duration-300 shadow-[0_0_10px_#22D3EE] ${tutorHovered ? 'h-4 bg-cyan-300' : 'h-2'}`} />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
