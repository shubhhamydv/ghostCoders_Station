/**
 * GyanChakra.tsx
 * Interactive Knowledge Wheel — no religious symbols.
 * Center shows a book icon. Colors use hsl(var(--accent)) so all themes work.
 */

import { useRef, useState, useEffect } from 'react';
import { BarChart3, Trophy, Activity, Zap, Target, Brain, Clock, Flame, BookOpen } from 'lucide-react';

const SECTIONS = [
  { id: 'overview',  label: 'Analytics',   subLabel: 'Analysis',    icon: BarChart3, angle: 0   },
  { id: 'subjects',  label: 'Subjects',     subLabel: 'Subjects',    icon: Brain,     angle: 45  },
  { id: 'quests',    label: 'Quests',       subLabel: 'Quests',      icon: Trophy,    angle: 90  },
  { id: 'wellbeing', label: 'Wellbeing',    subLabel: 'Wellbeing',   icon: Activity,  angle: 135 },
  { id: 'overview',  label: 'Performance',  subLabel: 'Performance', icon: Zap,       angle: 180 },
  { id: 'subjects',  label: 'Focus',        subLabel: 'Focus',       icon: Target,    angle: 225 },
  { id: 'quests',    label: 'Consistency',  subLabel: 'Streak',      icon: Flame,     angle: 270 },
  { id: 'wellbeing', label: 'Study Time',   subLabel: 'Study',       icon: Clock,     angle: 315 },
];

interface GyanChakraProps {
  onSectionSelect: (tab: 'overview' | 'subjects' | 'quests' | 'wellbeing') => void;
  activeTab: string;
}

// Read the resolved accent colour from CSS variables
function getAccentRGB(): string {
  const val = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  // val is like "176 78% 24%" — convert to a usable CSS hsl string
  return val ? `hsl(${val})` : '#4ade80';
}

export function GyanChakra({ onSectionSelect, activeTab }: GyanChakraProps) {
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const [rotation,  setRotation]  = useState(0);
  const [rotation2, setRotation2] = useState(0);
  const [pulse, setPulse] = useState(0);
  const rafRef   = useRef<number>(0);
  const lastRef  = useRef<number>(0);
  const [accentColor, setAccentColor] = useState('hsl(var(--accent))');

  // Re-read accent whenever theme changes
  useEffect(() => {
    const update = () => setAccentColor(getAccentRGB());
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const animate = (ts: number) => {
      rafRef.current = requestAnimationFrame(animate);
      const dt = ts - lastRef.current;
      lastRef.current = ts;
      if (dt > 100) return;
      setRotation(r  => r  + dt * 0.008);
      setRotation2(r => r  - dt * 0.012);
      setPulse(ts * 0.002);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const SIZE = 280, CX = 140, CY = 140;
  const COUNT = SECTIONS.length;

  const segPath = (i: number, r1: number, r2: number, gap = 0.06) => {
    const step  = (Math.PI * 2) / COUNT;
    const start = i * step - Math.PI / 2 + gap;
    const end   = start + step - gap;
    return [
      `M ${CX + r1 * Math.cos(start)} ${CY + r1 * Math.sin(start)}`,
      `L ${CX + r2 * Math.cos(start)} ${CY + r2 * Math.sin(start)}`,
      `A ${r2} ${r2} 0 0 1 ${CX + r2 * Math.cos(end)} ${CY + r2 * Math.sin(end)}`,
      `L ${CX + r1 * Math.cos(end)} ${CY + r1 * Math.sin(end)}`,
      `A ${r1} ${r1} 0 0 0 ${CX + r1 * Math.cos(start)} ${CY + r1 * Math.sin(start)} Z`,
    ].join(' ');
  };

  const iconPos = (i: number, r: number) => {
    const a = i * (Math.PI * 2 / COUNT) - Math.PI / 2 + (Math.PI / COUNT);
    return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
  };

  const pulseScale = 0.92 + Math.sin(pulse) * 0.08;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ position: 'relative', width: SIZE, height: SIZE }}>
        {/* Outer ambient glow */}
        <div style={{
          position: 'absolute', inset: -24, borderRadius: '50%',
          background: 'radial-gradient(circle, hsl(var(--accent) / 0.07) 0%, transparent 70%)',
          transform: `scale(${pulseScale})`, transition: 'transform 0.1s ease-out',
          pointerEvents: 'none',
        }} />

        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ overflow: 'visible' }}>
          <defs>
            <radialGradient id="chakra-center-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor={accentColor} stopOpacity="0.9" />
              <stop offset="60%"  stopColor={accentColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={accentColor} stopOpacity="0"   />
            </radialGradient>
            <filter id="chakra-glow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Outermost decorative tick ring */}
          <g transform={`rotate(${rotation}, ${CX}, ${CY})`}>
            <circle cx={CX} cy={CY} r={128} fill="none"
              stroke="hsl(var(--accent) / 0.08)" strokeWidth="1" />
            {Array.from({ length: 24 }).map((_, i) => {
              const a = (i / 24) * Math.PI * 2 - Math.PI / 2;
              return (
                <line key={i}
                  x1={CX + 122 * Math.cos(a)} y1={CY + 122 * Math.sin(a)}
                  x2={CX + 128 * Math.cos(a)} y2={CY + 128 * Math.sin(a)}
                  stroke="hsl(var(--accent) / 0.22)" strokeWidth="1"
                />
              );
            })}
          </g>

          {/* Inner counter-rotating dashed ring */}
          <g transform={`rotate(${rotation2}, ${CX}, ${CY})`}>
            <circle cx={CX} cy={CY} r={50} fill="none"
              stroke="hsl(var(--accent) / 0.14)" strokeWidth="1"
              strokeDasharray="4 6" />
          </g>

          {/* Segment ring */}
          {SECTIONS.map((section, i) => {
            const isHov    = hoveredSegment === i;
            const isActive = activeTab === section.id;
            const ip       = iconPos(i, 88);
            return (
              <g key={i}
                style={{ cursor: 'pointer' }}
                onClick={() => onSectionSelect(section.id as any)}
                onMouseEnter={() => setHoveredSegment(i)}
                onMouseLeave={() => setHoveredSegment(null)}
              >
                <path
                  d={segPath(i, 58, 118)}
                  fill={isHov || isActive ? 'hsl(var(--accent) / 0.22)' : 'hsl(var(--accent) / 0.05)'}
                  stroke={isHov || isActive ? 'hsl(var(--accent) / 0.60)' : 'hsl(var(--accent) / 0.18)'}
                  strokeWidth={isHov || isActive ? 1.5 : 0.8}
                  filter={isHov || isActive ? 'url(#chakra-glow)' : undefined}
                  style={{ transition: 'fill 0.2s, stroke 0.2s' }}
                />
                {/* Icon */}
                <foreignObject x={ip.x - 9} y={ip.y - 9} width={18} height={18}
                  style={{ pointerEvents: 'none', overflow: 'visible' }}>
                  <div style={{
                    color: isHov || isActive ? accentColor : 'hsl(var(--accent) / 0.45)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'color 0.2s',
                  }}>
                    <section.icon size={11} />
                  </div>
                </foreignObject>

                {/* Tooltip on hover */}
                {isHov && (() => {
                  const op = iconPos(i, 140);
                  return (
                    <foreignObject x={op.x - 40} y={op.y - 18} width={80} height={36}
                      style={{ overflow: 'visible', pointerEvents: 'none' }}>
                      <div style={{
                        background: 'hsl(var(--surface) / 0.96)',
                        border: '1px solid hsl(var(--accent) / 0.35)',
                        borderRadius: 8, padding: '3px 8px', textAlign: 'center',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                      }}>
                        <div style={{ color: accentColor, fontSize: 10, fontWeight: 700, fontFamily: 'serif' }}>
                          {section.label}
                        </div>
                        <div style={{ color: 'hsl(var(--muted))', fontSize: 8 }}>
                          {section.subLabel}
                        </div>
                      </div>
                    </foreignObject>
                  );
                })()}
              </g>
            );
          })}

          {/* Inner sacred geometry lines */}
          {Array.from({ length: 6 }).map((_, i) => {
            const a = (i / 6) * Math.PI * 2 + rotation * 0.002;
            return (
              <line key={i}
                x1={CX} y1={CY}
                x2={CX + 34 * Math.cos(a)} y2={CY + 34 * Math.sin(a)}
                stroke="hsl(var(--accent) / 0.14)" strokeWidth="0.8"
              />
            );
          })}

          {/* Center pulsing glow circle */}
          <circle cx={CX} cy={CY} r={22 * pulseScale}
            fill="url(#chakra-center-glow)"
            filter="url(#chakra-glow)"
            style={{ pointerEvents: 'none' }}
          />

          {/* Center ring outline */}
          <circle cx={CX} cy={CY} r={15}
            fill="hsl(var(--accent) / 0.08)"
            stroke="hsl(var(--accent) / 0.35)"
            strokeWidth="1"
            style={{ pointerEvents: 'none' }}
          />

          {/* Center book icon via foreignObject */}
          <foreignObject x={CX - 9} y={CY - 9} width={18} height={18}
            style={{ pointerEvents: 'none', overflow: 'visible' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: accentColor, filter: `drop-shadow(0 0 4px ${accentColor})`,
            }}>
              <BookOpen size={13} />
            </div>
          </foreignObject>

          {/* Outer label ring */}
          <circle cx={CX} cy={CY} r={118}
            fill="none" stroke="hsl(var(--accent) / 0.12)" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Tab shortcut buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', maxWidth: 300 }}>
        {SECTIONS.slice(0, 4).map((s, i) => (
          <button key={i}
            onClick={() => onSectionSelect(s.id as any)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 12px', borderRadius: 20,
              background: activeTab === s.id ? 'hsl(var(--accent-soft))' : 'hsl(var(--surface2))',
              border: `1px solid ${activeTab === s.id ? 'hsl(var(--accent) / 0.5)' : 'hsl(var(--accent) / 0.14)'}`,
              cursor: 'pointer', transition: 'all 0.2s',
              color: activeTab === s.id ? 'hsl(var(--accent))' : 'hsl(var(--muted))',
              fontSize: 10, fontWeight: 600,
            }}
          >
            <s.icon size={10} />
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default GyanChakra;
