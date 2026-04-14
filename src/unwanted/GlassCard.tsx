/**
 * GlassCard.tsx
 * Theme-aware glassmorphism card.
 * Uses hsl(var(--surface)) / hsl(var(--border)) so it adapts to
 * paper (cream), forest (dark green) and dusk (dark blue) themes.
 * 3D tilt + directional border glow + corner highlights.
 */

import { useRef, useState, useCallback, type ReactNode, type CSSProperties } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  intensity?: number;
  delay?: number;
}

export function GlassCard({
  children,
  className = '',
  style = {},
  intensity = 7,
  delay = 0,
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt]   = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [glow,  setGlow]  = useState({ x: 50, y: 50, on: false });
  const rafRef = useRef<number>(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
      const dy = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
      setTilt({ x: -dy * intensity, y: dx * intensity });
      const gx = ((e.clientX - rect.left) / rect.width)  * 100;
      const gy = ((e.clientY - rect.top)  / rect.height) * 100;
      setGlare({ x: gx, y: gy, opacity: 0.09 });
      setGlow({ x: gx, y: gy, on: true });
    });
  }, [intensity]);

  const handleMouseLeave = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setTilt({ x: 0, y: 0 });
    setGlare(g => ({ ...g, opacity: 0 }));
    setGlow(g => ({ ...g, on: false }));
  }, []);

  return (
    <div
      ref={cardRef}
      className={className}
      style={{
        ...style,
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(0)`,
        transition: 'transform 0.2s ease-out',
        transformStyle: 'preserve-3d',
        position: 'relative',
        willChange: 'transform',
        // Use theme CSS variables so all 3 themes work
        background: 'hsl(var(--surface) / 0.82)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid hsl(var(--accent) / 0.18)',
        borderRadius: '16px',
        boxShadow: `
          0 4px 28px hsl(var(--bg) / 0.4),
          0 0 0 1px hsl(var(--accent) / 0.06),
          inset 0 1px 0 hsl(var(--accent) / 0.10)
        `,
        animationDelay: `${delay}ms`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Directional border glow on hover */}
      {glow.on && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '16px',
          background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, hsl(var(--accent) / 0.22) 0%, transparent 65%)`,
          pointerEvents: 'none', zIndex: 0,
        }} />
      )}

      {/* Corner ambient */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: 56, height: 56,
        background: 'radial-gradient(circle at 0% 0%, hsl(var(--accent) / 0.10) 0%, transparent 70%)',
        borderRadius: '16px 0 0 0', pointerEvents: 'none', zIndex: 1,
      }} />
      <div style={{
        position: 'absolute', bottom: 0, right: 0, width: 56, height: 56,
        background: 'radial-gradient(circle at 100% 100%, hsl(var(--accent) / 0.07) 0%, transparent 70%)',
        borderRadius: '0 0 16px 0', pointerEvents: 'none', zIndex: 1,
      }} />

      {/* Glare sweep */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 'inherit',
        pointerEvents: 'none', zIndex: 2,
        transition: 'opacity 0.25s ease',
        opacity: glare.opacity,
        background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.18) 0%, transparent 60%)`,
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 3 }}>
        {children}
      </div>
    </div>
  );
}

export default GlassCard;
