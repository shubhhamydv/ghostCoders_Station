import { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, X } from 'lucide-react';
import { useStationStore } from '@/store/useStationStore';

export function FocusTimerFAB() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-accent text-accent-foreground shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        aria-label="Open Focus Timer"
      >
        <Timer className="w-6 h-6" />
      </button>
      {open && <FocusTimerModal onClose={() => setOpen(false)} />}
    </>
  );
}

function FocusTimerModal({ onClose }: { onClose: () => void }) {
  const [totalSeconds] = useState(25 * 60);
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const { boostRank, addFocusMinutes } = useStationStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            setRunning(false);
            setCompleted(true);
            boostRank(15);
            addFocusMinutes(25);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running, boostRank, addFocusMinutes]);

  const handlePlayPause = () => {
    if (completed) return;
    setRunning((r) => !r);
  };

  const handleReset = () => {
    setRunning(false);
    setCompleted(false);
    setSeconds(totalSeconds);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = ((totalSeconds - seconds) / totalSeconds) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-2xl p-8 shadow-2xl w-80 animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Focus Timer</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="relative w-48 h-48 mx-auto mb-6">
          <svg className="w-full h-full -rotate-90">
            <circle cx="96" cy="96" r="88" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
            <circle cx="96" cy="96" r="88" fill="none" stroke="hsl(var(--accent))" strokeWidth="8"
              strokeDasharray={553} strokeDashoffset={553 - (553 * progress) / 100} strokeLinecap="round" className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold font-mono">{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
          </div>
        </div>
        <div className="flex justify-center gap-4">
          <button onClick={handlePlayPause} disabled={completed}
            className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-40">
            {running ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <button onClick={handleReset}
            className="w-12 h-12 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center hover:scale-110 transition-transform">
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
        {completed && <p className="text-center mt-4 text-accent font-medium">Session complete! Rank boosted by 15.</p>}
      </div>
    </div>
  );
}
