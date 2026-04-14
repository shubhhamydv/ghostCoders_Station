import { useState, useMemo, useEffect } from 'react';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import { TrendingUp, Flame, CheckCircle, Target, Zap, ChevronRight, Square, Check, X, Brain, Trophy, Medal, PieChart, Plus, Trash2, BarChart3, Search, Loader2, BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { streamChat } from '@/lib/ai';
import { supabase } from '@/integrations/supabase/client';
import heroImg from '@/assets/hero-study.jpg';

export default function Home() {
  const { domain, user, rank, totalStudents, streak, tasksDone, weeklyGoalProgress, boostRank, completeTask, quizScores, addWeakPoint, removeWeakPoint, language } = useStationStore();
  const config = domainConfig[domain];
  const navigate = useNavigate();
  const isHi = language === 'hi';
  const [todoChecked, setTodoChecked] = useState<boolean[]>(Array(config.todoItems.length).fill(false));
  const [weakInput, setWeakInput] = useState('');
  const [quickQuizIdx, setQuickQuizIdx] = useState(0);
  const [quickQuizAnswer, setQuickQuizAnswer] = useState<number | null>(null);
  const [quickQuizDone, setQuickQuizDone] = useState(false);
  const [quizWeakTopics, setQuizWeakTopics] = useState<string[]>([]);
  const pct = Math.round(((totalStudents - rank) / totalStudents) * 100);

  // Company probability — before & after
  const [companyInput, setCompanyInput] = useState(user?.dreamCompany || '');
  const [probCompany, setProbCompany] = useState('');
  const [probBefore, setProbBefore] = useState<number | null>(null);
  const [probAfter, setProbAfter] = useState<number | null>(null);
  const [probLoading, setProbLoading] = useState(false);

  // Analyze weak points
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisSteps, setAnalysisSteps] = useState<{ title: string; content: string; done: boolean }[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [analysisText, setAnalysisText] = useState('');

  // User custom task
  const [customTask, setCustomTask] = useState('');
  const [customTasks, setCustomTasks] = useState<{ text: string; done: boolean }[]>([]);

  // Progress tracking after completing parts
  const [closenessMsg, setClosenessMsg] = useState('');

  const quickQuestions = useMemo(() => {
    if (domain === 'engineering') {
      return [
        { q: 'What is the time complexity of binary search?', opts: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correct: 1, topic: 'Data Structures & Algorithms' },
        { q: 'Which data structure uses FIFO?', opts: ['Stack', 'Queue', 'Tree', 'Graph'], correct: 1, topic: 'Data Structures & Algorithms' },
        { q: 'What is 2^10?', opts: ['512', '1024', '2048', '256'], correct: 1, topic: 'Aptitude' },
      ];
    } else if (domain === 'commerce') {
      return [
        { q: 'If cost is ₹400, sell for ₹500, profit %?', opts: ['20%', '25%', '30%', '15%'], correct: 1, topic: 'Quantitative Aptitude' },
        { q: 'What is NPA in banking?', opts: ['New Profit Account', 'Non-Performing Asset', 'National Payment Authority', 'Net Payable Amount'], correct: 1, topic: 'Banking Awareness' },
        { q: 'RTGS minimum transfer amount?', opts: ['₹1 lakh', '₹2 lakh', '₹50,000', 'No minimum'], correct: 1, topic: 'Banking Awareness' },
      ];
    }
    return [
      { q: 'How many schedules in Indian Constitution?', opts: ['8', '10', '12', '14'], correct: 2, topic: 'Indian Polity' },
      { q: 'Article 21 deals with?', opts: ['Right to Education', 'Right to Life', 'Right to Equality', 'Right to Speech'], correct: 1, topic: 'Indian Polity' },
      { q: 'Battle of Plassey year?', opts: ['1757', '1764', '1857', '1947'], correct: 0, topic: 'Indian History' },
    ];
  }, [domain]);

  // Real-time leaderboard from DB
  const [dbLeaderboard, setDbLeaderboard] = useState<{ name: string; score: number; city: string }[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('name, score, city')
        .order('score', { ascending: false })
        .limit(10);
      if (data && data.length > 0) {
        setDbLeaderboard(data.map(d => ({ name: d.name || 'Anonymous', score: d.score || 0, city: d.city || '' })));
      }
    };
    fetchLeaderboard();

    const channel = supabase
      .channel('leaderboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchLeaderboard();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const leaderboard = useMemo(() => {
    if (dbLeaderboard.length > 0) {
      const entries = dbLeaderboard.map(d => ({ name: d.name, score: d.score, locality: d.city || user?.city || 'Your Area' }));
      const userName = user?.name || 'You';
      if (!entries.find(e => e.name === userName)) {
        const userScore = 100 + tasksDone * 5;
        entries.push({ name: userName, score: userScore, locality: user?.city || 'Your Area' });
        entries.sort((a, b) => b.score - a.score);
      }
      return entries.slice(0, 8);
    }

    const names = domain === 'engineering'
      ? ['Aarav S.', 'Priya M.', 'Rohit K.', 'Sneha J.', 'Vikram T.', 'Ananya R.', 'Karan P.', 'Neha G.']
      : domain === 'commerce'
      ? ['Deepak M.', 'Anjali S.', 'Mohit R.', 'Kavita P.', 'Suresh T.', 'Pooja L.', 'Rajesh K.', 'Divya N.']
      : ['Meera S.', 'Arjun R.', 'Riya P.', 'Suresh K.', 'Kavita M.', 'Anil T.', 'Priti J.', 'Manish D.'];
    const baseScore = 950;
    const entries = names.map((name, i) => ({ name, score: baseScore - i * 47, locality: user?.city || 'Your Area' }));
    const userScore = baseScore - Math.floor((rank / totalStudents) * entries.length) * 47 + tasksDone * 3;
    entries.push({ name: user?.name || 'You', score: userScore, locality: user?.city || 'Your Area' });
    entries.sort((a, b) => b.score - a.score);
    return entries.slice(0, 8);
  }, [domain, rank, totalStudents, user, tasksDone, dbLeaderboard]);

  const toggleTodo = (i: number) => {
    const n = [...todoChecked];
    if (!n[i]) { n[i] = true; completeTask(); checkCloseness(); } else { n[i] = false; }
    setTodoChecked(n);
  };

  const handleQuickAnswer = (idx: number) => {
    setQuickQuizAnswer(idx);
    const q = quickQuestions[quickQuizIdx];
    if (idx !== q.correct) {
      addWeakPoint(q.topic);
      setQuizWeakTopics(prev => prev.includes(q.topic) ? prev : [...prev, q.topic]);
    }
    setTimeout(() => {
      if (quickQuizIdx < quickQuestions.length - 1) {
        setQuickQuizIdx(quickQuizIdx + 1);
        setQuickQuizAnswer(null);
      } else {
        setQuickQuizDone(true);
        checkCloseness();
      }
    }, 1000);
  };

  const handleAddWeakPoint = () => { if (weakInput.trim()) { addWeakPoint(weakInput.trim()); setWeakInput(''); } };

  const addCustomTask = () => {
    if (customTask.trim()) {
      setCustomTasks(prev => [...prev, { text: customTask.trim(), done: false }]);
      setCustomTask('');
    }
  };
  const toggleCustomTask = (i: number) => {
    setCustomTasks(prev => prev.map((t, idx) => idx === i ? { ...t, done: !t.done } : t));
    completeTask();
    checkCloseness();
  };

  const generateProbability = () => {
    if (!companyInput.trim()) return;
    setProbLoading(true);
    setProbCompany(companyInput.trim());

    const knownCompany = (config.companyData as Record<string, any>)?.[companyInput.trim()];
    const baseIQ = user?.personalityScore?.iq || 30;
    const baseEQ = user?.personalityScore?.eq || 25;
    const weakCount = user?.weakPoints?.length || 0;

    if (knownCompany) {
      const difficulty = knownCompany.seats < 500 ? 0.4 : knownCompany.seats < 2000 ? 0.6 : 0.8;
      const before = Math.min(92, Math.round(10 + baseIQ * 0.2 * difficulty + baseEQ * 0.1 * difficulty - weakCount * 4));
      const after = Math.min(92, Math.round(10 + baseIQ * 0.3 * difficulty + baseEQ * 0.2 * difficulty + tasksDone * 0.3 - weakCount * 2));
      setProbBefore(Math.max(5, before));
      setProbAfter(Math.max(before + 5, Math.max(5, after)));
      setProbLoading(false);
    } else {
      setTimeout(() => {
        const before = Math.min(85, Math.round(8 + baseIQ * 0.15 - weakCount * 3));
        const after = Math.min(85, Math.round(12 + baseIQ * 0.25 + baseEQ * 0.15 + tasksDone * 0.2 - weakCount * 2));
        setProbBefore(Math.max(5, before));
        setProbAfter(Math.max(before + 5, Math.max(5, after)));
        setProbLoading(false);
      }, 800);
    }
  };

  const checkCloseness = () => {
    const totalDone = todoChecked.filter(Boolean).length + customTasks.filter(t => t.done).length;
    const total = config.todoItems.length + customTasks.length;
    const pctDone = total > 0 ? Math.round((totalDone / total) * 100) : 0;
    const target = user?.dreamCompany || config.companies[0];
    if (pctDone >= 80) setClosenessMsg(`🎯 ${isHi ? `${target} तक पहुंचने में बहुत करीब!` : `Very close to reaching ${target}!`} ${pctDone}% tasks done.`);
    else if (pctDone >= 50) setClosenessMsg(`📈 ${isHi ? 'अच्छी प्रगति!' : 'Good progress!'} ${pctDone}% done. ${isHi ? 'जारी रखें' : 'Keep going!'}`);
    else setClosenessMsg(`💪 ${pctDone}% done. ${isHi ? `${target} के लिए और अभ्यास करें` : `Practice more to reach ${target}`}`);
  };

  const analyzeWeakPoints = async () => {
    const allWeak = [...(user?.weakPoints || [])];
    if (allWeak.length === 0) return;
    setShowAnalysis(true);
    setAnalysisLoading(true);
    setCurrentStep(0);
    setAnalysisSteps([]);
    setAnalysisText('');

    const prompt = `Student: ${user?.name || 'Student'}, Domain: ${config.label}, Weak points: ${allWeak.join(', ')}.
Target: ${user?.dreamCompany || config.companies[0]}, Specialization: ${user?.specialization || config.label}.
For EACH weak point, provide a step-by-step interactive improvement guide. Format as:
## Step 1: [Weak Point Name]
**Why it matters:** One line about why this is critical
**Quick Fix (Today):** One specific action they can do right now
**This Week:** 3 actionable tasks with specifics
**Resources:** Suggest specific YouTube channels, books, or practice sites
**Milestone:** How they'll know they've improved
Do this for each weak point. Be specific to Indian placements. Keep it practical, not generic.`;

    let fullText = '';
    await streamChat({
      messages: [{ role: 'user', content: prompt }],
      mode: 'interview-prep',
      context: { domain, userName: user?.name || 'Student', company: user?.dreamCompany || config.companies[0] },
      onDelta: (chunk) => { fullText += chunk; setAnalysisText(fullText); },
      onDone: () => {
        const sections = fullText.split(/## Step \d+:/).filter(s => s.trim());
        const steps = sections.map((s, i) => {
          const lines = s.trim().split('\n');
          return { title: lines[0]?.trim() || allWeak[i] || `Step ${i + 1}`, content: lines.slice(1).join('\n').trim(), done: false };
        });
        setAnalysisSteps(steps.length > 0 ? steps : [{ title: allWeak[0], content: fullText, done: false }]);
        setAnalysisLoading(false);
      },
      onError: () => {
        const steps = allWeak.map(w => ({
          title: w,
          content: `**Why it matters:** ${w} is frequently tested.\n**Quick Fix:** Spend 30 min reviewing ${w}.\n**This Week:**\n- Practice 10 problems\n- Watch 2 tutorials\n- Take a quiz\n**Milestone:** Score 70%+ on ${w} quiz.`,
          done: false,
        }));
        setAnalysisSteps(steps);
        setAnalysisLoading(false);
      },
    });
  };

  const markStepDone = (idx: number) => {
    setAnalysisSteps(prev => prev.map((s, i) => i === idx ? { ...s, done: true } : s));
    if (idx < analysisSteps.length - 1) setCurrentStep(idx + 1);
    checkCloseness();
  };

  const knownCompanyInfo = probCompany ? (config.companyData as Record<string, any>)?.[probCompany] : null;

  // Pie chart colors - vivid, distinct
  const PIE_BEFORE_FILL = '#EF4444'; // red
  const PIE_BEFORE_BG = '#374151'; // dark gray
  const PIE_AFTER_FILL = '#22C55E'; // green
  const PIE_AFTER_BG = '#374151'; // dark gray

  return (
    <div className="max-w-5xl space-y-5 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden h-40 md:h-48">
        <img src={heroImg} alt="Study" className="w-full h-full object-cover" width={1280} height={512} />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40 flex items-center p-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-primary-foreground">{isHi ? `वापसी पर स्वागत, ${user?.name || 'Student'}` : `Welcome back, ${user?.name || 'Student'}`}</h1>
            <p className="text-sm text-primary-foreground/70 mt-1 max-w-md">{isHi ? config.affirmationHi : config.affirmation}</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Flame, label: isHi ? 'स्ट्रीक' : 'Streak', value: `${streak}d` },
          { icon: CheckCircle, label: isHi ? 'टास्क' : 'Tasks', value: String(tasksDone) },
          { icon: Target, label: isHi ? 'लक्ष्य' : 'Goal', value: `${weeklyGoalProgress}%` },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-3 text-center">
            <s.icon className="w-4 h-4 mx-auto mb-1 text-accent" />
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Job Probability — Before & After */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
          <PieChart className="w-4 h-4 text-accent" />
          {isHi ? 'नौकरी पाने की संभावना' : 'Job Probability Calculator'}
        </h3>
        <div className="flex gap-2 mb-4">
          <input value={companyInput} onChange={(e) => setCompanyInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generateProbability()}
            placeholder={isHi ? 'कंपनी का नाम (जैसे TCS, Google)' : 'Enter company name (e.g. TCS, Google)'}
            className="flex-1 px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
          <button onClick={generateProbability} disabled={!companyInput.trim() || probLoading}
            className="px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-medium hover:scale-105 transition-transform disabled:opacity-40 flex items-center gap-2">
            {probLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {isHi ? 'जांचें' : 'Check'}
          </button>
        </div>

        {probBefore !== null && probAfter !== null && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-2 gap-6">
              {/* Before */}
              <div className="text-center">
                <p className="text-xs font-semibold mb-2 uppercase tracking-wide text-destructive">{isHi ? 'तैयारी से पहले' : '🔴 Before Prep'}</p>
                <div className="w-32 h-32 mx-auto relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie data={[{ name: 'Chance', value: probBefore }, { name: 'Gap', value: 100 - probBefore }]} cx="50%" cy="50%" innerRadius={38} outerRadius={55} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                        <Cell fill={PIE_BEFORE_FILL} />
                        <Cell fill={PIE_BEFORE_BG} />
                      </Pie>
                    </RechartsPie>
                  </ResponsiveContainer>
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-destructive">{probBefore}%</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{isHi ? 'वर्तमान संभावना' : 'Current chance'}</p>
              </div>
              {/* After */}
              <div className="text-center">
                <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: PIE_AFTER_FILL }}>{isHi ? 'तैयारी के बाद' : '🟢 After Prep'}</p>
                <div className="w-32 h-32 mx-auto relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie data={[{ name: 'Chance', value: probAfter }, { name: 'Gap', value: 100 - probAfter }]} cx="50%" cy="50%" innerRadius={38} outerRadius={55} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                        <Cell fill={PIE_AFTER_FILL} />
                        <Cell fill={PIE_AFTER_BG} />
                      </Pie>
                    </RechartsPie>
                  </ResponsiveContainer>
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-bold" style={{ color: PIE_AFTER_FILL }}>{probAfter}%</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{isHi ? 'तैयारी के बाद' : 'After preparation'}</p>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-xl bg-accent/5 border border-accent/20 text-center">
              <p className="text-sm font-semibold">📈 +{probAfter - probBefore}% {isHi ? 'सुधार संभव' : 'improvement possible'}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {isHi ? `${probCompany} में चयन की संभावना बढ़ाने के लिए अभ्यास जारी रखें` : `Keep preparing to maximize your chances at ${probCompany}`}
              </p>
            </div>
            {knownCompanyInfo && (
              <div className="mt-3 p-3 rounded-xl bg-muted/50 text-xs text-muted-foreground grid grid-cols-2 gap-2">
                <p><span className="font-medium text-foreground">{isHi ? 'सीटें' : 'Seats'}:</span> {knownCompanyInfo.seats}</p>
                <p><span className="font-medium text-foreground">{isHi ? 'वेतन' : 'Salary'}:</span> {knownCompanyInfo.avgSalary}</p>
                <p className="col-span-2"><span className="font-medium text-foreground">{isHi ? 'प्रक्रिया' : 'Process'}:</span> {knownCompanyInfo.process}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Quiz */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
          <Brain className="w-4 h-4 text-accent" />
          {isHi ? 'त्वरित परीक्षा' : 'Quick Test'}
        </h3>
        {!quickQuizDone ? (
          <div className="space-y-3">
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${((quickQuizIdx) / quickQuestions.length) * 100}%` }} />
            </div>
            <p className="text-sm font-medium">{quickQuizIdx + 1}. {quickQuestions[quickQuizIdx].q}</p>
            <div className="grid grid-cols-2 gap-2">
              {quickQuestions[quickQuizIdx].opts.map((opt, oi) => {
                let cls = 'border-border hover:border-accent/50';
                if (quickQuizAnswer !== null) {
                  if (oi === quickQuestions[quickQuizIdx].correct) cls = 'border-accent bg-accent/10 text-accent';
                  else if (oi === quickQuizAnswer) cls = 'border-destructive bg-destructive/10 text-destructive';
                }
                return (
                  <button key={oi} onClick={() => quickQuizAnswer === null && handleQuickAnswer(oi)}
                    className={`text-xs py-2 px-3 rounded-xl border transition-all text-left ${cls}`}>{opt}</button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-center py-2">
              <CheckCircle className="w-6 h-6 text-accent mx-auto mb-1" />
              <p className="text-sm font-medium">{isHi ? 'परीक्षा पूर्ण!' : 'Test Complete!'}</p>
            </div>
            {quizWeakTopics.length > 0 && (
              <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20">
                <p className="text-xs font-medium text-destructive mb-1">{isHi ? 'कमजोर बिंदु:' : 'Weak Points Found:'}</p>
                <div className="flex flex-wrap gap-1">
                  {quizWeakTopics.map(t => <span key={t} className="px-2 py-1 rounded-lg bg-destructive/10 text-destructive text-[10px] font-medium">{t}</span>)}
                </div>
              </div>
            )}
            <button onClick={() => { setQuickQuizDone(false); setQuickQuizIdx(0); setQuickQuizAnswer(null); setQuizWeakTopics([]); }}
              className="w-full py-2 rounded-xl bg-muted text-foreground text-xs hover:bg-muted/80">{isHi ? 'फिर से लें' : 'Retake'}</button>
          </div>
        )}
      </div>

      {/* Weak Points + Analyze */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
          <BarChart3 className="w-4 h-4 text-accent" /> {isHi ? 'कमजोर बिंदु' : 'Weak Points'}
        </h3>
        <div className="flex flex-wrap gap-1 mb-2">
          {(user?.weakPoints || []).map(wp => (
            <span key={wp} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-destructive/10 text-destructive text-[10px]">
              {wp} <button onClick={() => removeWeakPoint(wp)}><Trash2 className="w-2.5 h-2.5" /></button>
            </span>
          ))}
          {(!user?.weakPoints || user.weakPoints.length === 0) && <p className="text-[10px] text-muted-foreground">{isHi ? 'कोई कमजोर बिंदु नहीं' : 'No weak points yet'}</p>}
        </div>
        <div className="flex gap-2 mb-2">
          <input placeholder={isHi ? 'कमजोर विषय जोड़ें...' : 'Add weak topic...'} value={weakInput} onChange={(e) => setWeakInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddWeakPoint()}
            className="flex-1 px-3 py-1.5 rounded-lg border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-accent" />
          <button onClick={handleAddWeakPoint} className="px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs"><Plus className="w-3 h-3" /></button>
        </div>
        {(user?.weakPoints?.length || 0) > 0 && (
          <button onClick={analyzeWeakPoints} disabled={analysisLoading}
            className="w-full py-2.5 rounded-xl bg-accent text-accent-foreground text-xs font-medium hover:scale-[1.01] transition-transform flex items-center justify-center gap-2 disabled:opacity-50">
            {analysisLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {isHi ? 'AI विश्लेषण — स्टेप बाय स्टेप गाइड' : 'Analyze — Step-by-Step Guide'}
          </button>
        )}
      </div>

      {/* Interactive Analysis Steps */}
      {showAnalysis && (
        <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2 text-sm"><BookOpen className="w-4 h-4 text-accent" /> {isHi ? 'सुधार गाइड' : 'Improvement Guide'}</h3>
            <button onClick={() => setShowAnalysis(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
          {analysisLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground py-4 justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-accent" /> {isHi ? 'AI विश्लेषण कर रहा है...' : 'AI is analyzing...'}
            </div>
          ) : (
            <>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {analysisSteps.map((step, i) => (
                  <button key={i} onClick={() => setCurrentStep(i)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all ${
                      i === currentStep ? 'bg-accent text-accent-foreground' : step.done ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'
                    }`}>
                    {step.done ? <CheckCircle className="w-3 h-3" /> : <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[8px]">{i + 1}</span>}
                    {step.title}
                  </button>
                ))}
              </div>
              {analysisSteps[currentStep] && (
                <div className="space-y-2 animate-fade-in">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border text-xs leading-relaxed whitespace-pre-line">
                    {analysisSteps[currentStep].content.split('\n').map((line, li) => {
                      if (line.startsWith('**') && line.endsWith('**')) return <p key={li} className="font-semibold text-accent mt-2 mb-1">{line.replace(/\*\*/g, '')}</p>;
                      if (line.startsWith('- ')) return <div key={li} className="flex items-start gap-1.5 ml-2 py-0.5"><ArrowRight className="w-3 h-3 text-accent mt-0.5 flex-shrink-0" /><span>{line.slice(2)}</span></div>;
                      if (line.trim()) return <p key={li}>{line}</p>;
                      return null;
                    })}
                  </div>
                  {!analysisSteps[currentStep].done && (
                    <button onClick={() => markStepDone(currentStep)}
                      className="px-4 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-medium flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3" /> {isHi ? 'अगले पर जाएं' : 'Got it, next'}
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Closeness Message */}
      {closenessMsg && (
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-3 text-center text-sm font-medium animate-fade-in">
          {closenessMsg}
        </div>
      )}

      {/* Today's Tasks + User Input */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
          <Target className="w-4 h-4 text-accent" /> {isHi ? 'आज के कार्य' : "Today's Tasks"}
        </h3>
        <div className="space-y-2">
          {config.todoItems.map((item, i) => (
            <button key={i} onClick={() => toggleTodo(i)}
              className={`w-full flex items-center gap-2 p-2.5 rounded-xl border transition-all text-left text-xs ${
                todoChecked[i] ? 'bg-accent/5 border-accent/30 line-through text-muted-foreground' : 'border-border hover:border-accent/50'
              }`}>
              {todoChecked[i] ? <Check className="w-3 h-3 text-accent flex-shrink-0" /> : <Square className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
              {item}
            </button>
          ))}
          {customTasks.map((t, i) => (
            <button key={`c${i}`} onClick={() => toggleCustomTask(i)}
              className={`w-full flex items-center gap-2 p-2.5 rounded-xl border transition-all text-left text-xs ${
                t.done ? 'bg-accent/5 border-accent/30 line-through text-muted-foreground' : 'border-border hover:border-accent/50'
              }`}>
              {t.done ? <Check className="w-3 h-3 text-accent flex-shrink-0" /> : <Square className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
              {t.text}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <input placeholder={isHi ? 'अपना कार्य जोड़ें...' : 'Add your own task...'} value={customTask} onChange={e => setCustomTask(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCustomTask()}
            className="flex-1 px-3 py-1.5 rounded-lg border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-accent" />
          <button onClick={addCustomTask} className="px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs"><Plus className="w-3 h-3" /></button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          {todoChecked.filter(Boolean).length + customTasks.filter(t => t.done).length}/{config.todoItems.length + customTasks.length} {isHi ? 'पूर्ण' : 'done'}
        </p>
      </div>

      {/* Rank + Leaderboard side by side */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl border border-border p-5">
          <p className="text-xs text-muted-foreground">{isHi ? 'स्थानीय रैंक' : 'Local Rank'}</p>
          <p className="text-2xl font-bold">Top {pct}%</p>
          <p className="text-[10px] text-muted-foreground">#{rank} / {totalStudents} in {user?.city || 'your area'}</p>
          <div className="h-2 bg-muted rounded-full overflow-hidden mt-3">
            <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-full h-full -rotate-90">
              <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--border))" strokeWidth="5" />
              <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--accent))" strokeWidth="5"
                strokeDasharray={176} strokeDashoffset={176 - (176 * weeklyGoalProgress) / 100} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{weeklyGoalProgress}%</span>
          </div>
          <div>
            <p className="font-semibold text-sm">{isHi ? 'साप्ताहिक प्रगति' : 'Weekly Progress'}</p>
            <p className="text-[10px] text-muted-foreground">{100 - weeklyGoalProgress}% {isHi ? 'शेष' : 'remaining'}</p>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm"><Trophy className="w-4 h-4 text-accent" /> {isHi ? 'लीडरबोर्ड' : 'Leaderboard'} — {user?.city || 'Your Area'}</h3>
        <div className="space-y-1.5">
          {leaderboard.map((entry, i) => {
            const isUser = entry.name === (user?.name || 'You');
            return (
              <div key={i} className={`flex items-center gap-2 p-2 rounded-lg text-xs ${isUser ? 'bg-accent/10 border border-accent/30' : 'bg-muted/30'}`}>
                <span className="w-5 text-center font-bold text-[10px]">
                  {i === 0 ? <Medal className="w-3 h-3 text-accent mx-auto" /> : `#${i + 1}`}
                </span>
                <span className="flex-1 font-medium">{entry.name} {isUser && <span className="text-accent text-[10px]">({isHi ? 'आप' : 'You'})</span>}</span>
                <span className="text-[10px] text-muted-foreground">{entry.score} pts</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
