/**
 * GameCard3D.tsx
 * 
 * Premium glassmorphism game card with:
 * - 3D tilt on hover (cursor-tracked)
 * - Edge glow activation
 * - Portal/zoom transition on click
 * - Breathing idle animation
 */

import { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface GameCard3DProps {
  id: string;
  title: string;
  tagline: string;
  time: string;
  gradient: string;
  glowColor: string;
  accentColor: string;
  preview: React.ReactNode;
  index: number;
  onSelect: (id: string) => void;
}

export const GameCard3D = ({
  id, title, tagline, time, gradient, glowColor, accentColor,
  preview, index, onSelect
}: GameCard3DProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  // Mouse tracking for 3D tilt
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  // Smooth springs
  const springConfig = { stiffness: 150, damping: 20 };
  const rotX = useSpring(rotateX, springConfig);
  const rotY = useSpring(rotateY, springConfig);

  // Derived glow position from tilt
  const glowX = useTransform(rotY, [-20, 20], ['0%', '100%']);
  const glowY = useTransform(rotX, [-20, 20], ['0%', '100%']);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    rotateX.set(-(dy / rect.height) * 20);
    rotateY.set((dx / rect.width) * 20);
  }, [rotateX, rotateY]);

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    setIsHovered(false);
  }, [rotateX, rotateY]);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => {
      onSelect(id);
      setIsClicked(false);
    }, 400);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.12,
        type: 'spring',
        stiffness: 100,
        damping: 15,
      }}
      style={{ perspective: 1000 }}
      className="cursor-pointer"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{
          rotateX: rotX,
          rotateY: rotY,
          transformStyle: 'preserve-3d',
        }}
        animate={isClicked ? {
          scale: [1, 1.08, 0],
          opacity: [1, 1, 0],
        } : {
          scale: isHovered ? 1.04 : 1,
        }}
        transition={isClicked ? { duration: 0.4, ease: 'easeIn' } : { duration: 0.3 }}
        className="relative rounded-2xl overflow-hidden select-none"
        style={{
          height: 220,
          background: gradient,
          boxShadow: isHovered
            ? `0 20px 60px ${glowColor}40, 0 0 0 1px ${glowColor}30, inset 0 1px 0 rgba(255,255,255,0.2)`
            : `0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15)`,
          transition: 'box-shadow 0.3s ease',
        }}
      >
        {/* Glass layer */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.1) 100%)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        />

        {/* Dynamic glow that follows cursor */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${glowX} ${glowY}, ${glowColor}35 0%, transparent 60%)`,
            }}
          />
        )}

        {/* Edge border with glow */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            border: `1px solid ${isHovered ? glowColor + '60' : 'rgba(255,255,255,0.2)'}`,
            transition: 'border-color 0.3s ease',
          }}
        />

        {/* Top-left corner accent */}
        <div
          className="absolute top-0 left-0 w-20 h-20 rounded-2xl pointer-events-none"
          style={{
            background: `radial-gradient(circle at 0% 0%, ${glowColor}25 0%, transparent 70%)`,
          }}
        />

        {/* Preview area (top 55%) */}
        <div
          className="absolute top-0 left-0 right-0"
          style={{
            height: '58%',
            transform: 'translateZ(10px)',
          }}
        >
          {preview}
        </div>

        {/* Content area */}
        <div
          className="absolute bottom-0 left-0 right-0 p-4"
          style={{ transform: 'translateZ(20px)' }}
        >
          {/* Divider */}
          <div
            className="w-full h-px mb-3"
            style={{ background: `linear-gradient(90deg, transparent, ${glowColor}50, transparent)` }}
          />

          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3
                className="font-bold mb-0.5 truncate"
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 15,
                  color: 'rgba(255,255,255,0.95)',
                  textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }}
              >
                {title}
              </h3>
              <p
                className="text-xs leading-snug"
                style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {tagline}
              </p>
            </div>

            <div className="ml-3 flex flex-col items-end gap-1.5">
              <span
                className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.85)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontSize: 9,
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                {time}
              </span>

              {/* Play button */}
              <motion.div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 28,
                  height: 28,
                  background: isHovered ? accentColor : 'rgba(255,255,255,0.2)',
                  boxShadow: isHovered ? `0 0 16px ${accentColor}80` : 'none',
                  transition: 'background 0.3s, box-shadow 0.3s',
                }}
                animate={isHovered ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.6, repeat: isHovered ? Infinity : 0 }}
              >
                <svg width="10" height="12" viewBox="0 0 10 12" fill="rgba(255,255,255,0.9)">
                  <path d="M0 0L10 6L0 12V0Z" />
                </svg>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Hover shimmer sweep */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)',
              backgroundSize: '200% 100%',
            }}
            animate={{ backgroundPosition: ['-100% 0', '200% 0'] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          />
        )}

        {/* Click portal burst */}
        {isClicked && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.35 }}
          >
            <motion.div
              className="rounded-full"
              style={{ background: `radial-gradient(circle, ${glowColor}60, transparent)` }}
              initial={{ width: 0, height: 0 }}
              animate={{ width: 300, height: 300 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default GameCard3D;
