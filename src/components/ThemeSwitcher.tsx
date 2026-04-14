import { useStationStore, type Domain } from '@/store/useStationStore';
import { Cpu, Landmark, BookOpen } from 'lucide-react';

const dots: { domain: Domain; icon: typeof Cpu; label: string }[] = [
  { domain: 'engineering', icon: Cpu, label: 'Engineering' },
  { domain: 'commerce', icon: Landmark, label: 'Commerce' },
  { domain: 'arts', icon: BookOpen, label: 'Arts' },
];

export function ThemeSwitcher() {
  const { domain, setDomain } = useStationStore();

  return (
    <div className="flex gap-2 items-center">
      {dots.map((d) => (
        <button
          key={d.domain}
          onClick={() => setDomain(d.domain)}
          title={d.label}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            domain === d.domain
              ? 'bg-accent text-accent-foreground scale-110 shadow-md'
              : 'bg-muted text-muted-foreground hover:bg-secondary'
          }`}
        >
          <d.icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}
