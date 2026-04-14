import { useStationStore, domainConfig, type ThemeOption } from '@/store/useStationStore';
import { User, TrendingUp, Award, Calendar } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

const themes: { id: ThemeOption; label: string; color: string }[] = [
  { id: 'engineering', label: 'Slate & Copper', color: 'bg-[hsl(210,29%,24%)]' },
  { id: 'commerce', label: 'Forest & Brass', color: 'bg-[hsl(153,40%,15%)]' },
  { id: 'arts', label: 'Burgundy & Bronze', color: 'bg-[hsl(350,40%,22%)]' },
  { id: 'violet', label: 'Violet Dusk', color: 'bg-[hsl(270,30%,20%)]' },
  { id: 'forest', label: 'Forest Calm', color: 'bg-[hsl(140,30%,18%)]' },
  { id: 'mocha', label: 'Mocha Warm', color: 'bg-[hsl(25,35%,18%)]' },
];

export default function Profile() {
  const { theme, setTheme, user, rank, totalStudents, streak, tasksDone } = useStationStore();
  const radarData = [
    { subject: 'DSA', A: 72, fullMark: 100 },
    { subject: 'System Design', A: 58, fullMark: 100 },
    { subject: 'Communication', A: 81, fullMark: 100 },
    { subject: 'Aptitude', A: 65, fullMark: 100 },
    { subject: 'Domain Knowledge', A: 70, fullMark: 100 },
  ];

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-card rounded-2xl border border-border p-6 flex items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
          <User className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{user?.name || 'Student'}</h1>
          <p className="text-sm text-muted-foreground">{user?.college || 'College'} · {user?.specialization || 'Specialization'}</p>
          <p className="text-xs text-accent mt-1">Dream: {user?.dreamCompany || 'Not set'} · Timeline: {user?.timeline || '6'} months</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Rank</p>
          <p className="text-2xl font-bold">#{rank}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: TrendingUp, label: 'Rank', value: `Top ${Math.round(((totalStudents - rank) / totalStudents) * 100)}%` },
          { icon: Award, label: 'Streak', value: `${streak} days` },
          { icon: Calendar, label: 'Tasks', value: String(tasksDone) },
          { icon: User, label: 'Level', value: 'Intermediate' },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-4 text-center">
            <s.icon className="w-4 h-4 mx-auto mb-1 text-accent" />
            <p className="text-sm font-bold">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Skill Radar */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold mb-4">Skill Radar</h3>
        <ResponsiveContainer width="100%" height={250}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
            <Radar name="Skills" dataKey="A" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Theme Picker */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold mb-4">Theme</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {themes.map((t) => (
            <button key={t.id} onClick={() => setTheme(t.id)}
              className={`p-3 rounded-xl border text-center transition-all ${theme === t.id ? 'border-accent ring-2 ring-accent/30' : 'border-border hover:border-accent/50'}`}>
              <div className={`w-8 h-8 rounded-full mx-auto mb-2 ${t.color}`} />
              <p className="text-[10px] font-medium">{t.label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
