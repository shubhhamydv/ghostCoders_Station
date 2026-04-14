import { useState, useMemo } from 'react';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import { Calendar, CheckCircle, Circle, Sparkles, Loader2, Clock, Target, Flame, BookOpen } from 'lucide-react';
import { streamChat } from '@/lib/ai';

interface DayPlan {
  day: number;
  title: string;
  tasks: string[];
  completed: boolean;
}

export default function Last7Days() {
  const { domain, user, language } = useStationStore();
  const config = domainConfig[domain];
  const isHi = language === 'hi';

  const defaultPlan = useMemo((): DayPlan[] => {
    if (domain === 'engineering') {
      return [
        { day: 1, title: isHi ? 'DSA मूल बातें' : 'DSA Basics', tasks: ['Arrays & Strings fundamentals', 'Solve 5 easy problems', 'Time complexity revision'], completed: false },
        { day: 2, title: isHi ? 'Arrays + Strings' : 'Arrays + Strings', tasks: ['Two pointer technique', 'Sliding window problems', 'Practice 8 medium problems'], completed: false },
        { day: 3, title: isHi ? 'Trees + Graphs' : 'Trees + Graphs', tasks: ['Binary tree traversals', 'BFS/DFS practice', 'Graph representation'], completed: false },
        { day: 4, title: isHi ? 'DP + Recursion' : 'DP + Recursion', tasks: ['Top-down vs bottom-up', 'Classic DP problems (5)', 'Memoization patterns'], completed: false },
        { day: 5, title: isHi ? 'System Design + DBMS' : 'System Design + DBMS', tasks: ['Load balancers & caching', 'SQL joins practice', 'Normalization concepts'], completed: false },
        { day: 6, title: isHi ? 'OS + Networking' : 'OS + Networking', tasks: ['Process scheduling', 'Memory management', 'TCP/IP basics'], completed: false },
        { day: 7, title: isHi ? 'मॉक इंटरव्यू' : 'Mock Interview', tasks: ['Full mock interview', 'HR questions practice', 'Review all weak areas'], completed: false },
      ];
    } else if (domain === 'commerce') {
      return [
        { day: 1, title: isHi ? 'संख्या प्रणाली' : 'Number System', tasks: ['Divisibility rules', 'HCF/LCM shortcuts', 'Practice 20 problems'], completed: false },
        { day: 2, title: isHi ? 'लाभ-हानि + SI/CI' : 'Profit-Loss + Interest', tasks: ['Profit & Loss formulas', 'Simple & Compound interest', 'Practice 15 problems'], completed: false },
        { day: 3, title: isHi ? 'Data Interpretation' : 'Data Interpretation', tasks: ['Bar/Pie chart reading', 'Table-based questions', 'Speed calculation tricks'], completed: false },
        { day: 4, title: isHi ? 'Reasoning' : 'Reasoning', tasks: ['Syllogisms rules', 'Blood relations', 'Seating arrangement'], completed: false },
        { day: 5, title: isHi ? 'Banking GK' : 'Banking Awareness', tasks: ['RBI policies review', 'Current banking news', 'Financial institutions'], completed: false },
        { day: 6, title: isHi ? 'English + Grammar' : 'English + Grammar', tasks: ['Error spotting rules', 'RC passage practice', 'Vocabulary building'], completed: false },
        { day: 7, title: isHi ? 'पूर्ण मॉक टेस्ट' : 'Full Mock Test', tasks: ['Complete mock test', 'Analyze mistakes', 'Revise weak topics'], completed: false },
      ];
    }
    return [
      { day: 1, title: isHi ? 'प्राचीन भारत' : 'Ancient India', tasks: ['Indus Valley Civilization', 'Vedic period', 'Mauryan Empire'], completed: false },
      { day: 2, title: isHi ? 'भारतीय राजनीति' : 'Indian Polity', tasks: ['Fundamental rights', 'DPSP & duties', 'Parliament structure'], completed: false },
      { day: 3, title: isHi ? 'भूगोल' : 'Geography', tasks: ['Physical geography of India', 'Climate & monsoons', 'Map work practice'], completed: false },
      { day: 4, title: isHi ? 'अर्थव्यवस्था' : 'Economy', tasks: ['Budget concepts', 'Monetary policy', 'GDP & indicators'], completed: false },
      { day: 5, title: isHi ? 'नैतिकता' : 'Ethics', tasks: ['Ethics case studies', 'Thinkers & philosophies', 'Integrity concepts'], completed: false },
      { day: 6, title: isHi ? 'समसामयिक' : 'Current Affairs', tasks: ['Last 3 months review', 'Government schemes', 'International events'], completed: false },
      { day: 7, title: isHi ? 'उत्तर लेखन अभ्यास' : 'Answer Writing', tasks: ['Practice 5 answers', 'Review model answers', 'Self-introduction prep'], completed: false },
    ];
  }, [domain, isHi]);

  const [plan, setPlan] = useState<DayPlan[]>(defaultPlan);
  const [aiCustomPlan, setAiCustomPlan] = useState('');
  const [customizing, setCustomizing] = useState(false);

  const completedDays = plan.filter(d => d.completed).length;
  const progress = Math.round((completedDays / 7) * 100);

  const toggleDay = (dayIdx: number) => {
    setPlan(prev => prev.map((d, i) => i === dayIdx ? { ...d, completed: !d.completed } : d));
  };

  const customizePlan = async () => {
    setCustomizing(true);
    setAiCustomPlan('');
    const weakAreas = user?.weakPoints?.join(', ') || 'general topics';
    let text = '';
    await streamChat({
      messages: [{ role: 'user', content: `Create a customized 7-day crash plan for a ${config.label} student before their interview at ${user?.dreamCompany || config.companies[0]}. Their weak areas: ${weakAreas}. Give specific daily tasks with time estimates. Make it practical and urgent. Format each day as: Day X: [Title]\n- Task 1 (time)\n- Task 2 (time)\n- Task 3 (time)` }],
      mode: 'interview-prep',
      context: { domain },
      onDelta: (d) => { text += d; setAiCustomPlan(text); },
      onDone: () => setCustomizing(false),
      onError: () => { setAiCustomPlan(isHi ? 'योजना बनाने में त्रुटि। बाद में प्रयास करें।' : 'Error creating plan. Try later.'); setCustomizing(false); },
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              {isHi ? 'अंतिम 7 दिन की तैयारी' : 'Last 7 Days Prep Mode'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isHi ? 'इंटरव्यू से पहले का क्रैश प्लान' : 'Crash plan before your interview'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-accent">{completedDays}/7</p>
            <p className="text-[10px] text-muted-foreground">{isHi ? 'दिन पूरे' : 'Days Done'}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-muted-foreground">{progress}% {isHi ? 'पूर्ण' : 'complete'}</span>
          <span className="text-[10px] text-muted-foreground">{7 - completedDays} {isHi ? 'शेष' : 'remaining'}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Clock, label: isHi ? 'अनुमानित समय' : 'Est. Time', value: `${7 - completedDays * 1}h/day` },
          { icon: Target, label: isHi ? 'लक्ष्य' : 'Target', value: user?.dreamCompany || config.companies[0] },
          { icon: Flame, label: isHi ? 'तीव्रता' : 'Intensity', value: completedDays >= 5 ? '🔥 Max' : completedDays >= 3 ? '⚡ High' : '💪 Building' },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-3 text-center">
            <s.icon className="w-4 h-4 mx-auto mb-1 text-accent" />
            <p className="text-sm font-bold">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {plan.map((day, i) => (
          <div key={i} className="flex gap-4 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
            {/* Timeline Line */}
            <div className="flex flex-col items-center">
              <button onClick={() => toggleDay(i)}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  day.completed ? 'bg-accent border-accent text-accent-foreground' : 'border-border hover:border-accent'
                }`}>
                {day.completed ? <CheckCircle className="w-5 h-5" /> : <span className="text-sm font-bold">{day.day}</span>}
              </button>
              {i < plan.length - 1 && <div className={`w-0.5 h-full min-h-[40px] ${day.completed ? 'bg-accent' : 'bg-border'}`} />}
            </div>

            {/* Content */}
            <div className={`flex-1 mb-4 p-4 rounded-xl border transition-all ${
              day.completed ? 'bg-accent/5 border-accent/20' : 'bg-card border-border'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-sm font-bold ${day.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {isHi ? `दिन ${day.day}` : `Day ${day.day}`} — {day.title}
                </h3>
                {day.completed && <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-semibold">✓ {isHi ? 'पूर्ण' : 'Done'}</span>}
              </div>
              <ul className="space-y-1">
                {day.tasks.map((t, j) => (
                  <li key={j} className="text-xs text-muted-foreground flex items-center gap-2">
                    <Circle className="w-2 h-2 shrink-0" /> {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* AI Customize */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            {isHi ? 'AI कस्टम प्लान' : 'AI Custom Plan'}
          </h3>
          <button onClick={customizePlan} disabled={customizing}
            className="px-4 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-semibold hover-scale disabled:opacity-40 flex items-center gap-2">
            {customizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {isHi ? 'मेरे लिए बनाएं' : 'Customize for Me'}
          </button>
        </div>
        {aiCustomPlan && (
          <div className="p-4 rounded-xl bg-muted/30 text-sm whitespace-pre-wrap animate-fade-in">
            {aiCustomPlan}
          </div>
        )}
      </div>
    </div>
  );
}
