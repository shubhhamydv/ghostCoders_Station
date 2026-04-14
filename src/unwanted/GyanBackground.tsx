/**
 * GyanBackground.tsx
 * Theme-aware animated background for the Profile page.
 * Reads data-theme attribute to adapt to paper/forest/dusk themes.
 * Floating knowledge particles (books, stars, dots), geometric rings, parallax.
 */

import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number; y: number; vx: number; vy: number;
  radius: number; opacity: number;
  pulse: number; pulseSpeed: number;
}

interface FloatingChar {
  x: number; y: number; vx: number; vy: number;
  char: string; size: number; opacity: number;
  rotation: number; rotSpeed: number; layer: number;
}

// Knowledge symbols — no religious content
const SYMBOLS = ['✦', '◈', '⟡', '⌘', '◎', '❋', '⊕', '✧', '◇', '⬡', '▷', '◈', '✦', '◎'];

const rand = (a: number, b: number) => a + Math.random() * (b - a);

// Returns palette based on current theme
function getPalette() {
  const theme = document.documentElement.getAttribute('data-theme') || 'paper';
  if (theme === 'paper') {
    return {
      bgTop: '#f5ede0', bgMid: '#ede0cc', bgBot: '#e8d8c0',
      accentR: 160, accentG: 100, accentB: 20,   // warm amber
      particleAlpha: 0.35, ringAlpha: 0.08, charAlpha: 0.12,
      vigR: 180, vigG: 130, vigB: 60, vigA: 0.10,
    };
  }
  if (theme === 'forest') {
    return {
      bgTop: '#0f1f14', bgMid: '#111f16', bgBot: '#0d1a10',
      accentR: 100, accentG: 200, accentB: 130,  // green
      particleAlpha: 0.5, ringAlpha: 0.07, charAlpha: 0.10,
      vigR: 40, vigG: 120, vigB: 60, vigA: 0.12,
    };
  }
  // dusk (dark blue)
  return {
    bgTop: '#0d1220', bgMid: '#0f1525', bgBot: '#0b101c',
    accentR: 100, accentG: 150, accentB: 240,    // blue
    particleAlpha: 0.5, ringAlpha: 0.07, charAlpha: 0.10,
    vigR: 40, vigG: 70, vigB: 180, vigA: 0.12,
  };
}

export function GyanBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef  = useRef({ x: 0.5, y: 0.5 });
  const frameRef  = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const charsRef     = useRef<FloatingChar[]>([]);

  const initParticles = useCallback((w: number, h: number) => {
    particlesRef.current = Array.from({ length: 60 }, () => ({
      x: rand(0, w), y: rand(0, h),
      vx: rand(-0.12, 0.12), vy: rand(-0.25, -0.04),
      radius: rand(1, 2.5),
      opacity: rand(0.15, 0.55),
      pulse: rand(0, Math.PI * 2), pulseSpeed: rand(0.012, 0.028),
    }));
    charsRef.current = Array.from({ length: 16 }, () => ({
      x: rand(0, w), y: rand(0, h),
      vx: rand(-0.07, 0.07), vy: rand(-0.1, -0.02),
      char: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      size: rand(10, 28),
      opacity: rand(0.06, 0.18),
      rotation: rand(0, Math.PI * 2),
      rotSpeed: rand(-0.003, 0.003),
      layer: Math.floor(rand(1, 4)),
    }));
  }, []);

  const drawRings = useCallback((
    ctx: CanvasRenderingContext2D,
    cx: number, cy: number, t: number,
    ar: number, ag: number, ab: number, baseAlpha: number
  ) => {
    ctx.save();
    ctx.translate(cx, cy);
    // Static outer rings
    for (let i = 0; i < 3; i++) {
      const r = 90 + i * 50;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${ar},${ag},${ab},${baseAlpha - i * 0.015})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
    // Slow rotating dashed ring
    ctx.save();
    ctx.rotate(t * 0.00015);
    ctx.setLineDash([4, 8]);
    ctx.beginPath();
    ctx.arc(0, 0, 70, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${ar},${ag},${ab},${baseAlpha * 0.8})`;
    ctx.lineWidth = 0.6;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    // Counter-rotating ring
    ctx.save();
    ctx.rotate(-t * 0.0001);
    ctx.setLineDash([2, 12]);
    ctx.beginPath();
    ctx.arc(0, 0, 110, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${ar},${ag},${ab},${baseAlpha * 0.5})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    // Tick marks
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + t * 0.00012;
      const r1 = 84, r2 = 90;
      ctx.beginPath();
      ctx.moveTo(r1 * Math.cos(a), r1 * Math.sin(a));
      ctx.lineTo(r2 * Math.cos(a), r2 * Math.sin(a));
      ctx.strokeStyle = `rgba(${ar},${ag},${ab},${baseAlpha * 1.5})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
    ctx.restore();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0;
    const resize = () => {
      w = canvas.width  = window.innerWidth;
      h = canvas.height = window.innerHeight;
      initParticles(w, h);
    };
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => {
      mouseRef.current = { x: e.clientX / w, y: e.clientY / h };
    });

    const animate = (ts: number) => {
      frameRef.current = requestAnimationFrame(animate);
      const pal = getPalette();
      const { accentR: ar, accentG: ag, accentB: ab } = pal;

      ctx.clearRect(0, 0, w, h);

      // Gradient bg matching theme
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, pal.bgTop);
      bg.addColorStop(0.5, pal.bgMid);
      bg.addColorStop(1, pal.bgBot);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Subtle vignette
      const vg = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, w * 0.75);
      vg.addColorStop(0, `rgba(${pal.vigR},${pal.vigG},${pal.vigB},${pal.vigA})`);
      vg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Rings at 3 positions
      drawRings(ctx, w * 0.5  + (mx - 0.5) * 18, h * 0.32 + (my - 0.5) * 14, ts, ar, ag, ab, pal.ringAlpha);
      drawRings(ctx, w * 0.12 + (mx - 0.5) * 7,  h * 0.72 + (my - 0.5) * 6,  ts * 0.7, ar, ag, ab, pal.ringAlpha * 0.6);
      drawRings(ctx, w * 0.88 + (mx - 0.5) * 7,  h * 0.18 + (my - 0.5) * 5,  ts * 0.5, ar, ag, ab, pal.ringAlpha * 0.6);

      // Floating chars (✦ ◈ etc.)
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      charsRef.current.forEach(s => {
        s.rotation += s.rotSpeed;
        s.x += s.vx + (mx - 0.5) * s.layer * 0.25;
        s.y += s.vy;
        if (s.y < -60)  { s.y = h + 40; s.x = rand(0, w); }
        if (s.x < -40)   s.x = w + 40;
        if (s.x > w + 40) s.x = -40;
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rotation);
        ctx.globalAlpha = s.opacity * pal.charAlpha / 0.12;
        ctx.font = `${s.size}px sans-serif`;
        ctx.fillStyle = `rgba(${ar},${ag},${ab},1)`;
        ctx.fillText(s.char, 0, 0);
        ctx.restore();
      });

      // Particles
      particlesRef.current.forEach(p => {
        p.x += p.vx + (mx - 0.5) * 0.08;
        p.y += p.vy;
        if (p.y < -10) { p.y = h + 10; p.x = rand(0, w); }
        p.pulse += p.pulseSpeed;
        const alpha = p.opacity * pal.particleAlpha * (0.6 + Math.sin(p.pulse) * 0.4);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ar},${ag},${ab},${alpha})`;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [initParticles, drawRings]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0,
        width: '100%', height: '100%',
        zIndex: 0, pointerEvents: 'none',
      }}
    />
  );
}

export default GyanBackground;
