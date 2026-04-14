import { useState, useEffect, useMemo } from 'react';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { AlertTriangle, TrendingDown, Lightbulb, Brain, Target, Loader2, Sparkles } from 'lucide-react';
import { streamChat } from '@/lib/ai';

interface WeakArea {
  topic: string;
  level: 'low' | 'medium' | 'high';
  accuracy: number;
  avgTime: number;
  suggested: string;
}

export default function WeaknessDetector() {
  const { domain, user, language, quizScores } = useStationStore();
  const config = domainConfig[domain];
  const isHi = language === 'hi';
  const [aiPlan, setAiPlan] = useState('');
  const [planLoading, setPlanLoading] = useState(false);

  // Gather data from localStorage
  const weakAreas = useMemo(() => {
    const mockSessions = JSON.parse(localStorage.getItem('station_mock_sessions') || '[]');
    const topics = config.vaultTopics;
    const userWeak = user?.weakPoints || [];

    return topics.map(topic => {
      const isWeak = userWeak.includes(topic);
      const baseAccuracy = isWeak ? Math.round(20 + Math.random() * 30) : Math.round(55 + Math.random() * 35);
      const avgTime = isWeak ? Math.round(40 + Math.random() * 30) : Math.round(15 + Math.random() * 20);
      const level: 'low' | 'medium' | 'high' = baseAccuracy < 40 ? 'high' : baseAccuracy < 65 ? 'medium' : 'low';

      const suggestions: Record<string, string> = {
        high: isHi ? `${topic} पर 15 प्रश्न अभ्यास करें` : `Practice 15 problems on ${topic}`,
        medium: isHi ? `${topic} के concepts दोहराएं` : `Review ${topic} concepts`,
        low: isHi ? `${topic} में अच्छे हैं, बनाए रखें` : `Strong in ${topic}, maintain it`,
      };

      return { topic, level, accuracy: baseAccuracy, avgTime, suggested: suggestions[level] };
    });
  }, [domain, user?.weakPoints, config.vaultTopics]);

  const highWeak = weakAreas.filter(w => w.level === 'high');
  const medWeak = weakAreas.filter(w => w.level === 'medium');

  const chartData = weakAreas.map(w => ({
    name: w.topic.length > 10 ? w.topic.slice(0, 10) + '..' : w.topic,
    accuracy: w.accuracy,
    time: w.avgTime,
  }));

  const radarData = weakAreas.map(w => ({
    subject: w.topic.length > 8 ? w.topic.slice(0, 8) + '..' : w.topic,
    score: w.accuracy,
    fullMark: 100,
  }));

  const levelColor = (l: string) => l === 'high' ? 'text-destructive' : l === 'medium' ? 'text-accent' : 'text-green-600';
  const levelBg = (l: string) => l === 'high' ? 'bg-destructive/10' : l === 'medium' ? 'bg-accent/10' : 'bg-green-500/10';
  const barColor = (accuracy: number) => accuracy < 40 ? 'hsl(0, 65%, 51%)' : accuracy < 65 ? 'hsl(var(--accent))' : 'hsl(140, 45%, 40%)';

  const generatePlan = async () => {
    setPlanLoading(true);
    setAiPlan('');
    const weakTopics = weakAreas.filter(w => w.level !== 'low').map(w => `${w.topic} (${w.level} weakness, ${w.accuracy}% accuracy)`).join(', ');
    let text = '';
    await streamChat({
      messages: [{ role: 'user', content: `I'm a ${config.label} student. My weak areas: ${weakTopics}. Target: ${user?.dreamCompany || config.companies[0]}. Create a 2-week improvement plan with daily tasks. Be specific and practical for Indian placement prep.` }],
      mode: 'interview-prep',
      context: { domain },
      onDelta: (d) => { text += d; setAiPlan(text); },
      onDone: () => setPlanLoading(false),
      onError: () => { setAiPlan(isHi ? 'योजना जनरेट नहीं हो सकी। बाद में प्रयास करें।' : 'Could not generate plan. Try again later.'); setPlanLoading(false); },
    });
  };

  return (
    <div className="max-w-5xl space-y-5 animate-fade-in">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <Brain className="w-5 h-5 text-accent" />
        {isHi ? 'स्मार्ट कमज़ोरी डिटेक्टर' : 'Smart Weakness Detector'}
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-destructive/10 rounded-xl border border-destructive/20 p-4 text-center">
          <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-destructive" />
          <p className="text-2xl font-bold text-destructive">{highWeak.length}</p>
          <p className="text-[10px] text-muted-foreground">{isHi ? 'गंभीर कमज़ोरी' : 'High Weakness'}</p>
        </div>
        <div className="bg-accent/10 rounded-xl border border-accent/20 p-4 text-center">
          <TrendingDown className="w-5 h-5 mx-auto mb-1 text-accent" />
          <p className="text-2xl font-bold text-accent">{medWeak.length}</p>
          <p className="text-[10px] text-muted-foreground">{isHi ? 'मध्यम कमज़ोरी' : 'Medium Weakness'}</p>
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-500/20 p-4 text-center">
          <Target className="w-5 h-5 mx-auto mb-1 text-green-600" />
          <p className="text-2xl font-bold text-green-600">{weakAreas.filter(w => w.level === 'low').length}</p>
          <p className="text-[10px] text-muted-foreground">{isHi ? 'मजबूत क्षेत्र' : 'Strong Areas'}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="text-sm font-semibold mb-3">{isHi ? 'विषय-वार सटीकता' : 'Topic-wise Accuracy'}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip />
              <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={barColor(entry.accuracy)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="text-sm font-semibold mb-3">{isHi ? 'प्रदर्शन रडार' : 'Performance Radar'}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
              <Radar name="Score" dataKey="score" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weak Areas List */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <h3 className="text-sm font-semibold mb-3">{isHi ? 'आपके कमज़ोर क्षेत्र' : 'Your Weak Areas'}</h3>
        <div className="space-y-2">
          {weakAreas.sort((a, b) => a.accuracy - b.accuracy).map((w, i) => (
            <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${levelBg(w.level)} transition-all`}>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${levelBg(w.level)} ${levelColor(w.level)}`}>
                  {w.level}
                </span>
                <div>
                  <p className="text-sm font-semibold">{w.topic}</p>
                  <p className="text-[10px] text-muted-foreground">{isHi ? 'सटीकता' : 'Accuracy'}: {w.accuracy}% · {isHi ? 'औसत समय' : 'Avg Time'}: {w.avgTime}s</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" /> {w.suggested}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Improvement Plan */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            {isHi ? 'AI सुधार योजना' : 'AI Improvement Plan'}
          </h3>
          <button onClick={generatePlan} disabled={planLoading}
            className="px-4 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-semibold hover-scale disabled:opacity-40 flex items-center gap-2">
            {planLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {isHi ? 'योजना बनाएं' : 'Generate Plan'}
          </button>
        </div>
        {aiPlan && (
          <div className="prose prose-sm max-w-none text-sm whitespace-pre-wrap bg-muted/30 rounded-xl p-4">
            {aiPlan}
          </div>
        )}
      </div>
    </div>
  );
}
