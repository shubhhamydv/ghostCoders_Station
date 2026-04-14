import { useState, useEffect, useMemo } from 'react';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import { Award, TrendingUp, Target, Flame, CheckCircle, Brain, Zap } from 'lucide-react';

export default function PlacementScore() {
  const { domain, user, language, quizScores, tasksDone, streak } = useStationStore();
  const config = domainConfig[domain];
  const isHi = language === 'hi';

  const mockSessions = useMemo(() => JSON.parse(localStorage.getItem('station_mock_sessions') || '[]'), []);

  // Calculate score
  const quizAccuracy = useMemo(() => {
    const { iq, eq, rq } = quizScores;
    const total = iq + eq + rq;
    return total > 0 ? Math.round((total / 3)) : 30;
  }, [quizScores]);

  const interviewPerformance = useMemo(() => {
    if (mockSessions.length === 0) return 25;
    const avg = mockSessions.reduce((sum: number, s: any) => sum + (s.total || 0), 0) / mockSessions.length;
    return Math.round(avg);
  }, [mockSessions]);

  const consistency = useMemo(() => {
    const streakScore = Math.min(100, streak * 10);
    const taskScore = Math.min(100, tasksDone * 4);
    return Math.round((streakScore + taskScore) / 2);
  }, [streak, tasksDone]);

  const totalScore = useMemo(() => {
    return Math.round(quizAccuracy * 0.4 + interviewPerformance * 0.4 + consistency * 0.2);
  }, [quizAccuracy, interviewPerformance, consistency]);

  const status = totalScore >= 70 ? { label: isHi ? '🎯 इंटरव्यू रेडी' : '🎯 Interview Ready', color: 'text-green-600' }
    : totalScore >= 40 ? { label: isHi ? '📈 औसत' : '📈 Average', color: 'text-accent' }
    : { label: isHi ? '🌱 शुरुआती' : '🌱 Beginner', color: 'text-destructive' };

  const feedback = useMemo(() => {
    const tips: string[] = [];
    if (quizAccuracy < 50) tips.push(isHi ? 'DSA और विषय ज्ञान में सुधार करें' : 'Improve DSA and subject knowledge');
    if (interviewPerformance < 50) tips.push(isHi ? 'मॉक इंटरव्यू अभ्यास बढ़ाएं' : 'Practice more mock interviews');
    if (consistency < 50) tips.push(isHi ? 'दैनिक अभ्यास की आदत बनाएं' : 'Build a daily practice habit');
    if (quizAccuracy >= 70 && interviewPerformance >= 70) tips.push(isHi ? 'बहुत अच्छा! कंपनी-विशिष्ट तैयारी करें' : 'Great! Focus on company-specific preparation');
    if (tips.length === 0) tips.push(isHi ? 'सभी क्षेत्रों में सुधार की गुंजाइश है' : 'Room for improvement in all areas');
    return tips;
  }, [quizAccuracy, interviewPerformance, consistency, isHi]);

  // SVG circular progress
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(totalScore), 300);
    return () => clearTimeout(timer);
  }, [totalScore]);

  const offset = circumference - (animatedScore / 100) * circumference;
  const scoreColor = totalScore >= 70 ? 'hsl(140, 45%, 40%)' : totalScore >= 40 ? 'hsl(var(--accent))' : 'hsl(0, 65%, 51%)';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <Award className="w-5 h-5 text-accent" />
        {isHi ? 'प्लेसमेंट तत्परता स्कोर' : 'Placement Readiness Score'}
      </h1>

      {/* Main Score */}
      <div className="bg-card rounded-2xl border border-border p-8 text-center">
        <div className="relative w-48 h-48 mx-auto mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
            <circle cx="100" cy="100" r={radius} fill="none" stroke={scoreColor} strokeWidth="12"
              strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold" style={{ color: scoreColor }}>{animatedScore}</span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
        </div>
        <p className={`text-lg font-bold ${status.color}`}>{status.label}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {isHi ? `${user?.dreamCompany || config.companies[0]} के लिए तत्परता` : `Readiness for ${user?.dreamCompany || config.companies[0]}`}
        </p>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Brain, label: isHi ? 'क्विज़ सटीकता' : 'Quiz Accuracy', value: quizAccuracy, weight: '40%' },
          { icon: Target, label: isHi ? 'इंटरव्यू प्रदर्शन' : 'Interview Perf.', value: interviewPerformance, weight: '40%' },
          { icon: Flame, label: isHi ? 'निरंतरता' : 'Consistency', value: consistency, weight: '20%' },
        ].map(item => (
          <div key={item.label} className="bg-card rounded-xl border border-border p-4">
            <item.icon className="w-5 h-5 text-accent mb-2" />
            <p className="text-2xl font-bold">{item.value}%</p>
            <p className="text-xs font-medium">{item.label}</p>
            <p className="text-[10px] text-muted-foreground">{isHi ? 'वजन' : 'Weight'}: {item.weight}</p>
            <div className="w-full h-1.5 bg-muted rounded-full mt-2">
              <div className="h-full bg-accent rounded-full transition-all duration-1000" style={{ width: `${item.value}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Feedback */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent" />
          {isHi ? 'सुधार सुझाव' : 'Improvement Feedback'}
        </h3>
        <div className="space-y-2">
          {feedback.map((f, i) => (
            <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-muted/30">
              <CheckCircle className="w-4 h-4 text-accent shrink-0" />
              <p className="text-sm">{f}</p>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      {mockSessions.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-5">
          <h3 className="text-sm font-semibold mb-3">{isHi ? 'इंटरव्यू इतिहास' : 'Interview History'}</h3>
          <div className="space-y-2">
            {mockSessions.slice(-5).reverse().map((s: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <span className="text-sm">{new Date(s.date).toLocaleDateString()}</span>
                <div className="flex gap-3 text-xs">
                  <span>{isHi ? 'आत्मविश्वास' : 'Conf'}: {s.confidence}%</span>
                  <span>{isHi ? 'स्पष्टता' : 'Clarity'}: {s.clarity}%</span>
                  <span className="font-bold text-accent">{s.total}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
