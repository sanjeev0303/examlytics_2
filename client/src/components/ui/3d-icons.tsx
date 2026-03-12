import React from 'react';
import { motion } from 'motion/react';

interface IconProps {
  className?: string;
  isActive?: boolean;
  isHovered?: boolean;
}

export const Dashboard3D = ({ className = "w-6 h-6", isActive, isHovered }: IconProps) => {
  return (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{
        rotateX: isHovered || isActive ? 15 : 0,
        rotateY: isHovered || isActive ? -15 : 0,
        z: isHovered || isActive ? 10 : 0,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ perspective: "100px", filter: (isHovered || isActive) ? 'drop-shadow(0 4px 6px rgba(34, 211, 238, 0.4))' : 'none' }}
    >
      <defs>
        <linearGradient id="dashTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#C084FC" />
        </linearGradient>
        <linearGradient id="dashLeft" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>
        <linearGradient id="dashRight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2DD4BF" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>

      {/* Top box */}
      <motion.g animate={{ y: isHovered ? -3 : 0 }} transition={{ type: "spring", bounce: 0.5 }}>
        <path d="M12 3L20 7L12 11L4 7L12 3Z" fill="url(#dashTop)" stroke="url(#dashTop)" strokeWidth="0.5" strokeLinejoin="round"/>
        <path d="M4 7V13L12 17V11L4 7Z" fill="url(#dashLeft)" stroke="url(#dashLeft)" strokeWidth="0.5" strokeLinejoin="round"/>
        <path d="M20 7V13L12 17V11L20 7Z" fill="url(#dashRight)" stroke="url(#dashRight)" strokeWidth="0.5" strokeLinejoin="round"/>
      </motion.g>

      {/* Bottom Box (offset) */}
      <motion.g animate={{ y: isHovered ? 2 : 0 }} opacity={isActive ? 0.8 : 0.4} transition={{ type: "spring", bounce: 0.5 }}>
        <path d="M4 14V18L12 22V18L4 14Z" fill="url(#dashLeft)" />
        <path d="M20 14V18L12 22V18L20 14Z" fill="url(#dashRight)" />
      </motion.g>
    </motion.svg>
  );
};

export const Activity3D = ({ className = "w-6 h-6", isActive, isHovered }: IconProps) => (
  <motion.svg className={className} viewBox="0 0 24 24" fill="none"
    animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
    style={{ filter: (isHovered || isActive) ? 'drop-shadow(0 0 8px rgba(34,211,238,0.5))' : 'none' }}>
    <defs>
      <linearGradient id="actGrad" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="#22D3EE" />
        <stop offset="100%" stopColor="#818CF8" />
      </linearGradient>
      <linearGradient id="actGradDark" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="#0891B2" />
        <stop offset="100%" stopColor="#4F46E5" />
      </linearGradient>
    </defs>

    <motion.path
      d="M3 12h4l3-8 4 16 3-8h4"
      stroke="url(#actGradDark)"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      animate={{ y: 2 }}
      opacity={0.5}
    />
    <motion.path
      d="M3 12h4l3-8 4 16 3-8h4"
      stroke="url(#actGrad)"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 1 }}
      animate={isHovered ? { pathLength: [0, 1] } : { pathLength: 1 }}
      transition={{ duration: 1 }}
    />
  </motion.svg>
);

export const Book3D = ({ className = "w-6 h-6", isActive, isHovered }: IconProps) => (
  <motion.svg className={className} viewBox="0 0 24 24" fill="none"
    animate={{ rotateZ: isHovered ? -5 : 0, y: isHovered ? -2 : 0 }}
    style={{ filter: (isHovered || isActive) ? 'drop-shadow(0 4px 8px rgba(167,139,250,0.5))' : 'none' }}>
    <defs>
      <linearGradient id="bookCover" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#C084FC" />
        <stop offset="100%" stopColor="#9333EA" />
      </linearGradient>
      <linearGradient id="bookPages" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F3F4F6" />
        <stop offset="100%" stopColor="#9CA3AF" />
      </linearGradient>
    </defs>
    <motion.path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="url(#bookCover)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <motion.path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="url(#bookCover)" fillOpacity={activeOrHoverOpacity(isActive, isHovered)} />
    <motion.path d="M20 2V22" stroke="url(#bookPages)" strokeWidth="3" />
    <motion.path
      d="M8 7h8M8 11h8"
      stroke="rgba(255,255,255,0.8)"
      strokeWidth="1.5"
      strokeLinecap="round"
      animate={{ x: isHovered ? 2 : 0 }}
    />
  </motion.svg>
);

export const Target3D = ({ className = "w-6 h-6", isActive, isHovered }: IconProps) => (
  <motion.svg className={className} viewBox="0 0 24 24" fill="none"
    animate={isHovered ? { rotate: 90, scale: 1.1 } : { rotate: 0, scale: 1 }}
    transition={{ duration: 0.5 }}
    style={{ filter: (isHovered || isActive) ? 'drop-shadow(0 0 10px rgba(244,63,94,0.5))' : 'none' }}>
    <defs>
      <radialGradient id="targetRed">
        <stop offset="0%" stopColor="#FB7185" />
        <stop offset="100%" stopColor="#E11D48" />
      </radialGradient>
      <radialGradient id="targetWhite">
        <stop offset="0%" stopColor="#F1F5F9" />
        <stop offset="100%" stopColor="#CBD5E1" />
      </radialGradient>
    </defs>
    {/* Outer 3D depth */}
    <circle cx="12" cy="13" r="10" fill="#9F1239" opacity="0.5" />
    {/* Base */}
    <circle cx="12" cy="12" r="10" fill="url(#targetRed)" />
    <circle cx="12" cy="12" r="6" fill="url(#targetWhite)" />
    <circle cx="12" cy="12" r="2" fill="url(#targetRed)" />
    {/* Arrow */}
    <motion.path
      d="M20 4L13 11M20 4h-4M20 4v4"
      stroke="#FDE047"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ x: -10, y: 10, opacity: 0 }}
      animate={isHovered ? { x: 0, y: 0, opacity: 1 } : { x: -5, y: 5, opacity: 0 }}
    />
  </motion.svg>
);

export const History3D = ({ className = "w-6 h-6", isActive, isHovered }: IconProps) => (
  <motion.svg className={className} viewBox="0 0 24 24" fill="none"
    animate={isHovered ? { rotateZ: -180 } : { rotateZ: 0 }}
    transition={{ duration: 0.7, ease: "backInOut" }}
    style={{ filter: (isHovered || isActive) ? 'drop-shadow(0 0 8px rgba(52,211,153,0.5))' : 'none' }}>
    <defs>
      <linearGradient id="hourglassGlass" x1="0" y1="0" x2="0" y2="24">
        <stop offset="0%" stopColor="#6EE7B7" stopOpacity="0.3" />
        <stop offset="50%" stopColor="#10B981" stopOpacity="0.1" />
        <stop offset="100%" stopColor="#047857" stopOpacity="0.3" />
      </linearGradient>
      <linearGradient id="sand" x1="0" y1="0" x2="0" y2="24">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#EAB308" />
      </linearGradient>
    </defs>
    {/* Deep shadow */}
    <path d="M6 3h12a1 1 0 0 1 1 1v2l-4 6 4 6v2a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-2l4-6-4-6V4a1 1 0 0 1 1-1z" fill="#000" opacity="0.3" transform="translate(0,2)" />
    {/* Glass */}
    <path d="M6 3h12a1 1 0 0 1 1 1v2l-4 6 4 6v2a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-2l4-6-4-6V4a1 1 0 0 1 1-1z" fill="url(#hourglassGlass)" stroke="#34D399" strokeWidth="1.5" strokeLinejoin="round" />
    {/* Sand top */}
    <motion.path d="M7.5 6h9l-2.5 3.75h-4z" fill="url(#sand)" animate={isHovered ? { opacity: 0 } : { opacity: 1 }} />
    {/* Sand bottom */}
    <motion.path d="M10 14.25h4l2.5 3.75h-9z" fill="url(#sand)" animate={isHovered ? { opacity: 1 } : { opacity: 0.5 }} />
  </motion.svg>
);

export const Settings3D = ({ className = "w-6 h-6", isActive, isHovered }: IconProps) => (
  <motion.svg className={className} viewBox="0 0 24 24" fill="none"
    animate={isHovered ? { rotate: 90 } : { rotate: 0 }}
    transition={{ duration: 1, ease: "linear", repeat: isHovered ? Infinity : 0 }}
    style={{ filter: (isHovered || isActive) ? 'drop-shadow(0 0 8px rgba(148,163,184,0.5))' : 'none' }}>
    <defs>
      <linearGradient id="gearMetal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#CBD5E1" />
        <stop offset="50%" stopColor="#64748B" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>
    </defs>
    <path fill="#0f172a" d="M12 2A10 10 0 1 0 22 12 10 10 0 0 0 12 2Zm0 13a3 3 0 1 1 3-3 3 3 0 0 1-3 3Z" opacity="0.3" transform="translate(0,2)"/>
    <path
      d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
      fill="url(#gearMetal)"
    />
    <path fillRule="evenodd" clipRule="evenodd"
      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
      fill="url(#gearMetal)"
    />
  </motion.svg>
);

const activeOrHoverOpacity = (isActive?: boolean, isHovered?: boolean) => {
  if (isActive) return 1;
  if (isHovered) return 0.8;
  return 0.4;
};
