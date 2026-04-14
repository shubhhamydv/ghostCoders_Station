import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { FocusTimerFAB } from '@/components/FocusTimer';
import { Timer } from 'lucide-react';

export default function Dashboard() {
  return (
    <>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-14 flex items-center justify-between border-b border-border px-4 bg-card">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <HeaderFocusButton />
            </header>
            <main className="flex-1 p-6 overflow-auto bg-background">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
      <FocusTimerFAB />
    </>
  );
}

function HeaderFocusButton() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center gap-3">
      <button onClick={() => setOpen(true)} className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent/10 text-accent font-medium hover:bg-accent/20 transition-colors">
        <Timer className="w-3 h-3" /> Focus
      </button>
      {open && <FocusTimerInline onClose={() => setOpen(false)} />}
    </div>
  );
}

// Inline focus timer triggered by header button
import { useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, X } from 'lucide-react';
import { useStationStore } from '@/store/useStationStore';

function FocusTimerInline({ onClose }: { onClose: () => void }) {
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const { boostRank, addFocusMinutes } = useStationStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) { setRunning(false); setCompleted(true); boostRank(15); addFocusMinutes(25); return 0; }
          return s - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } };
  }, [running, boostRank, addFocusMinutes]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = ((25 * 60 - seconds) / (25 * 60)) * 100;

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
          <button onClick={() => !completed && setRunning(!running)} disabled={completed}
            className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-40">
            {running ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <button onClick={() => { setRunning(false); setCompleted(false); setSeconds(25 * 60); if (intervalRef.current) clearInterval(intervalRef.current); }}
            className="w-12 h-12 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center hover:scale-110 transition-transform">
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
        {completed && <p className="text-center mt-4 text-accent font-medium">Session complete! Rank boosted.</p>}
      </div>
    </div>
  );
}
