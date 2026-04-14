import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
}

const BreathBubbles = ({ onEnd }: { onEnd: () => void }) => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [popped, setPopped] = useState(0);
  const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBubbles(prev => {
        const filtered = prev.filter(b => b.y > -10);
        return [
          ...filtered.slice(-15),
          {
            id: Date.now() + Math.random(),
            x: 5 + Math.random() * 90,
            y: 100,
            size: 25 + Math.random() * 35,
            speed: 3 + Math.random() * 4,
          },
        ];
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setElapsed(p => p + 1);
      setBubbles(prev => prev.map(b => ({ ...b, y: b.y - (b.speed * 0.5) })));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setPhase(p => p === 'inhale' ? 'exhale' : 'inhale'), 5000);
    return () => clearInterval(interval);
  }, []);

  const popBubble = useCallback((id: number) => {
    setBubbles(prev => prev.filter(b => b.id !== id));
    setPopped(p => p + 1);
  }, []);

  return (
    <div className="card-base text-center relative overflow-hidden" style={{ minHeight: '420px' }}>
      <div className="mb-4 flex items-center justify-between">
        <span className="font-display text-lg font-semibold" style={{ color: 'hsl(var(--text))' }}>🫧 Breath Bubbles</span>
        <span className="stat-number text-xs" style={{ color: 'hsl(var(--muted))' }}>{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</span>
      </div>

      <motion.div
        animate={{ scale: phase === 'inhale' ? 1.2 : 0.9, opacity: phase === 'inhale' ? 1 : 0.6 }}
        transition={{ duration: 4, ease: 'easeInOut' }}
        className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
        style={{ background: 'hsl(var(--accent) / 0.2)' }}>
        <span className="font-display text-xs" style={{ color: 'hsl(var(--accent))' }}>
          {phase === 'inhale' ? 'Breathe in' : 'Breathe out'}
        </span>
      </motion.div>

      <div className="relative h-56 rounded-xl overflow-hidden" style={{ background: 'hsl(var(--surface2))' }}>
        {bubbles.map(b => (
          <motion.div
            key={b.id}
            onClick={() => popBubble(b.id)}
            whileTap={{ scale: 1.5 }}
            className="absolute cursor-pointer rounded-full"
            style={{
              width: b.size, height: b.size,
              left: `${b.x}%`, top: `${b.y}%`,
              background: 'radial-gradient(circle at 30% 30%, hsl(var(--accent) / 0.5), hsl(var(--accent) / 0.15))',
              boxShadow: 'inset 0 -2px 6px hsl(var(--accent) / 0.1), inset 0 2px 4px rgba(255,255,255,0.3)',
              transition: 'top 1s linear',
            }}
          />
        ))}
      </div>

      <p className="text-xs mt-3" style={{ color: 'hsl(var(--muted))' }}>Tap bubbles in rhythm · {popped} popped</p>
      {elapsed >= 60 && (
        <button onClick={onEnd} className="btn-3d text-sm mt-4 px-6 py-2">Done — back to studying 🌿</button>
      )}
    </div>
  );
};

export default BreathBubbles;
