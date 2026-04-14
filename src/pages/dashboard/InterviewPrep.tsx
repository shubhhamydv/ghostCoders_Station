import { useState, useRef, useEffect } from 'react';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import { Mic, MapPin, Building, Target, MessageSquare, Presentation, ArrowRight, ArrowLeft, X, Send, CheckCircle, User, ChevronDown, ChevronUp, Shield, Brain, Heart, Eye, Sparkles, BookOpen, Video, ExternalLink, Loader2, Users } from 'lucide-react';
import { streamChat, type Msg } from '@/lib/ai';
import ReactMarkdown from 'react-markdown';

type Stage = 'overview' | 'job-target' | 'company-prep' | 'behavioral' | 'rapid-fire' | 'mindset' | 'mindset-quiz' | 'mindset-results';

export default function InterviewPrep() {
  const { domain, user, language } = useStationStore();
  const config = domainConfig[domain];
  const isHi = language === 'hi';
  const [stage, setStage] = useState<Stage>('overview');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('Foundation');
  const [aiMessages, setAiMessages] = useState<Msg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentRFQ, setCurrentRFQ] = useState(0);
  const [rfAnswers, setRfAnswers] = useState<string[]>([]);
  const [rfInput, setRfInput] = useState('');
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Mindset quiz state
  const [mindsetStep, setMindsetStep] = useState(0); // 0=info, 1=video, 2=quiz
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [scenarioAnswers, setScenarioAnswers] = useState<string[]>([]);
  const [scenarioInput, setScenarioInput] = useState('');
  const [mindsetAnalysis, setMindsetAnalysis] = useState('');
  const [mindsetAnalysisLoading, setMindsetAnalysisLoading] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  const companyData = config.companies.map((c) => {
    const info = (config.companyData as Record<string, any>)?.[c];
    return {
      name: c,
      match: info ? Math.min(95, 35 + Math.round((user?.personalityScore?.iq || 30) / 2)) : 50,
      seats: info?.seats || 'N/A',
      salary: info?.avgSalary || 'N/A',
      skills: config.vaultTopics.slice(0, 3),
      eligibility: info?.eligibility || 'Graduate',
      process: info?.process || 'Online → Interview',
      cities: info?.cities || [],
    };
  });

  const rapidFireQuestions: Record<string, string[]> = {
    engineering: ['What is polymorphism?', 'Explain REST vs GraphQL.', 'What is a deadlock?', 'Difference between TCP and UDP?', 'What is normalization?', 'Explain MVC pattern.'],
    commerce: ['What is fiscal deficit?', 'Explain REPO rate.', 'What is NPA?', 'Difference between SLR and CRR?', 'What is MUDRA loan?', 'Explain Basel III norms.'],
    arts: ['What is Article 370?', 'Explain federalism.', 'What is judicial review?', 'Difference between Fundamental Rights and DPSP?', 'What is CAG?', 'Explain PESA Act.'],
  };

  const scenarioQuestions: Record<string, { scenario: string; hint: string }[]> = {
    engineering: [
      { scenario: 'You\'re in a technical interview and the interviewer asks a question about a technology you\'ve never used. What do you do?', hint: 'Think about honesty, curiosity, and transferable skills.' },
      { scenario: 'Your team lead assigns you a task you think is poorly planned. How do you handle it?', hint: 'Balance between respect and constructive feedback.' },
      { scenario: 'You\'re about to enter the interview room and suddenly feel extremely nervous. How do you calm yourself?', hint: 'Think about breathing, positive self-talk, and preparation recall.' },
      { scenario: 'The interviewer seems disinterested and keeps checking their phone. How do you react?', hint: 'Stay professional, maintain energy, don\'t take it personally.' },
      { scenario: 'You realize you gave an incorrect answer 2 questions ago. Should you bring it up?', hint: 'Honesty vs. moving forward — both have merits.' },
    ],
    commerce: [
      { scenario: 'In a bank PO interview, you\'re asked about a recent RBI policy you haven\'t read about. What do you do?', hint: 'Admit gracefully, relate to what you do know.' },
      { scenario: 'The panel asks your opinion on a controversial economic policy. How do you answer diplomatically?', hint: 'Present both sides, then give your balanced view.' },
      { scenario: 'You\'re asked why you chose banking over other careers. Your real answer is "job security." How do you frame it?', hint: 'Reframe positively — stability enables service.' },
      { scenario: 'A co-candidate before you gave a brilliant answer. You feel intimidated. What\'s your mental approach?', hint: 'Focus on your unique strengths, not comparison.' },
      { scenario: 'The interviewer challenges your answer aggressively. How do you respond?', hint: 'Stay calm, acknowledge their point, defend with facts.' },
    ],
    arts: [
      { scenario: 'In your UPSC interview, you\'re asked about a topic from your optional subject that you\'ve forgotten. What do you do?', hint: 'Connect to broader concepts you remember.' },
      { scenario: 'The panel presents an ethical dilemma: a senior officer asks you to bypass rules for a "good cause." Your response?', hint: 'Think about rule of law, consequences, and alternatives.' },
      { scenario: 'You\'re asked to critique a government policy you actually support. How do you handle it?', hint: 'Show balanced thinking — nothing is perfect.' },
      { scenario: 'Your interview is going poorly and you feel like giving up mid-way. What do you tell yourself?', hint: 'Resilience, every question is a fresh start.' },
      { scenario: 'The chairman asks a very personal question about your family background. How do you respond?', hint: 'Be proud, connect it to your motivation for civil service.' },
    ],
  };

  // ===== AI Company Prep =====
  const startCompanyPrep = (company: string, level?: string) => {
    setSelectedCompany(company);
    const lvl = level || 'Foundation';
    setSelectedLevel(lvl);
    setAiMessages([]);
    setIsStreaming(true);
    setStage('company-prep');

    const userMsg: Msg = { role: 'user', content: `I want to start ${lvl} level interview preparation for ${company}. Please ask me the first question.` };

    let assistantText = '';
    streamChat({
      messages: [userMsg],
      mode: 'interview-prep',
      context: { domain, userName: user?.name || 'Student', company, level: lvl, specialization: user?.specialization || '', college: user?.college || '' },
      onDelta: (chunk) => { assistantText += chunk; setAiMessages([userMsg, { role: 'assistant', content: assistantText }]); },
      onDone: () => { setAiMessages([userMsg, { role: 'assistant', content: assistantText }]); setIsStreaming(false); },
      onError: (err) => { setAiMessages([userMsg, { role: 'assistant', content: `Error: ${err}` }]); setIsStreaming(false); },
    });
  };

  const sendChatAnswer = () => {
    if (!chatInput.trim() || isStreaming) return;
    const userMsg: Msg = { role: 'user', content: chatInput };
    const newMessages = [...aiMessages, userMsg];
    setAiMessages(newMessages);
    setChatInput('');
    setIsStreaming(true);

    let assistantText = '';
    streamChat({
      messages: newMessages,
      mode: 'interview-prep',
      context: { domain, userName: user?.name || 'Student', company: selectedCompany, level: selectedLevel, specialization: user?.specialization || '', college: user?.college || '' },
      onDelta: (chunk) => { assistantText += chunk; setAiMessages([...newMessages, { role: 'assistant', content: assistantText }]); },
      onDone: () => { setAiMessages([...newMessages, { role: 'assistant', content: assistantText }]); setIsStreaming(false); },
      onError: (err) => { setAiMessages([...newMessages, { role: 'assistant', content: `Error: ${err}` }]); setIsStreaming(false); },
    });
  };

  const switchLevel = (level: string) => { setSelectedLevel(level); startCompanyPrep(selectedCompany, level); };

  const startRapidFire = () => { setCurrentRFQ(0); setRfAnswers([]); setRfInput(''); setStage('rapid-fire'); };
  const submitRFAnswer = () => {
    if (!rfInput.trim()) return;
    setRfAnswers(prev => [...prev, rfInput]);
    setRfInput('');
    const questions = rapidFireQuestions[domain] || rapidFireQuestions.engineering;
    if (currentRFQ < questions.length - 1) setCurrentRFQ(prev => prev + 1);
  };

  // Mindset scenario submit
  const submitScenarioAnswer = () => {
    if (!scenarioInput.trim()) return;
    setScenarioAnswers(prev => [...prev, scenarioInput]);
    setScenarioInput('');
    const scenarios = scenarioQuestions[domain] || scenarioQuestions.engineering;
    if (scenarioIdx < scenarios.length - 1) {
      setScenarioIdx(prev => prev + 1);
    } else {
      analyzeMindset();
    }
  };

  const analyzeMindset = async () => {
    setStage('mindset-results');
    setMindsetAnalysisLoading(true);
    setMindsetAnalysis('');

    const scenarios = scenarioQuestions[domain] || scenarioQuestions.engineering;
    const qa = scenarios.map((s, i) => `Scenario: ${s.scenario}\nStudent's Response: ${scenarioAnswers[i] || '(not answered)'}`).join('\n\n');

    const prompt = `Analyze this student's responses to interview mindset scenarios for ${config.label} domain.

${qa}

Provide a detailed, encouraging analysis:
1. **Overall Mindset Score**: Rate out of 100
2. **Confidence Level**: How confident are their responses?
3. **Emotional Intelligence**: How well do they handle pressure?
4. **Professionalism**: Is their approach professional?
5. **Top 3 Strengths**: What they did well
6. **Top 3 Areas to Improve**: Specific, actionable advice
7. **Better Approach for Weakest Answer**: Rewrite their weakest response with a model answer
8. **Final Encouragement**: A personalized motivational message

Be specific to Indian ${config.label} placements/exams. Be encouraging but honest.`;

    let fullText = '';
    await streamChat({
      messages: [{ role: 'user', content: prompt }],
      mode: 'interview-prep',
      context: { domain, userName: user?.name || 'Student' },
      onDelta: (chunk) => { fullText += chunk; setMindsetAnalysis(fullText); },
      onDone: () => setMindsetAnalysisLoading(false),
      onError: () => { setMindsetAnalysis('**Mindset Score: 72/100**\n\nYou showed good awareness but can improve on handling pressure scenarios. Practice the "Pause and Redirect" technique.'); setMindsetAnalysisLoading(false); },
    });
  };

  const rfQuestions = rapidFireQuestions[domain] || rapidFireQuestions.engineering;
  const scenarios = scenarioQuestions[domain] || scenarioQuestions.engineering;

  const BackButton = ({ to }: { to: Stage }) => (
    <button onClick={() => setStage(to)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
      <ArrowLeft className="w-4 h-4" /> {isHi ? 'पीछे' : 'Back'}
    </button>
  );

  const readinessScore = user?.personalityScore
    ? Math.round((user.personalityScore.iq * 0.4 + user.personalityScore.eq * 0.3 + user.personalityScore.rq * 0.3))
    : 34;

  // ===== OVERVIEW =====
  if (stage === 'overview') {
    const applicantData = companyData.map(c => {
      const info = (config.companyData as Record<string, any>)?.[c.name];
      const seats = info?.seats || 500;
      const applicants = seats < 500 ? Math.round(seats * 120) : seats < 2000 ? Math.round(seats * 40) : Math.round(seats * 15);
      const myProbability = Math.min(95, Math.round((c.match / 100) * (seats / applicants) * 1000));
      return { ...c, applicants, myProbability };
    });

    return (
      <div className="max-w-4xl space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">{isHi ? 'इंटरव्यू तैयारी' : 'Interview Prep'}</h1>
          <p className="text-sm text-muted-foreground">{config.interviewText}</p>
        </div>

        {/* Competition Analysis */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-accent" /> {isHi ? 'प्रतिस्पर्धा विश्लेषण' : 'Competition Analysis'}</h3>
          <div className="space-y-3">
            {applicantData.map((c) => (
              <div key={c.name} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 border border-border hover:border-accent/30 transition-all cursor-pointer" onClick={() => startCompanyPrep(c.name)}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{c.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground">{c.salary}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> {c.applicants.toLocaleString()} {isHi ? 'आवेदक' : 'applicants'}</span>
                    <span className="text-xs text-muted-foreground">{c.seats} {isHi ? 'सीटें' : 'seats'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-accent">{c.myProbability}%</p>
                  <p className="text-[10px] text-muted-foreground">{isHi ? 'आपकी संभावना' : 'Your probability'}</p>
                </div>
                <div className="w-16">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${c.myProbability}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stage 1 - Job Targeting */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-accent" /> {isHi ? 'चरण 1 — नौकरी लक्ष्य' : 'Stage 1 — Job Targeting'}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-accent" /> {isHi ? 'क्षेत्र' : 'Region'}: {user?.city || 'Your Area'}</div>
              <div className="flex items-center gap-2 text-sm"><Building className="w-4 h-4 text-accent" /> {companyData.length} {isHi ? 'कंपनियां भर्ती कर रही हैं' : 'companies hiring'}</div>
              <button onClick={() => setStage('job-target')} className="mt-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover-scale flex items-center gap-2">
                {isHi ? 'कंपनियां देखें' : 'Explore Companies'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {companyData.slice(0, 3).map((c) => (
                <div key={c.name} className="flex items-center justify-between p-2 rounded-lg bg-muted text-sm cursor-pointer hover:bg-accent/10 transition-colors" onClick={() => startCompanyPrep(c.name)}>
                  <span>{c.name}</span>
                  <span className="text-xs text-accent">{c.match}% match</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stage 2 - Company Prep */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Building className="w-4 h-4 text-accent" /> {isHi ? 'चरण 2 — कंपनी-विशिष्ट तैयारी' : 'Stage 2 — Company-Specific Prep'}</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { level: 'Foundation', desc: isHi ? 'बेसिक प्रश्न' : 'Basic questions every candidate must nail', icon: BookOpen },
              { level: 'Competitive', desc: isHi ? 'गहरे प्रश्न' : 'Deeper questions that separate top 20%', icon: Brain },
              { level: 'Placement Ready', desc: isHi ? 'फाइनल राउंड' : 'Final-round questions companies actually ask', icon: Shield },
            ].map((item) => (
              <button key={item.level} onClick={() => startCompanyPrep(user?.dreamCompany || config.companies[0], item.level)}
                className="p-4 rounded-xl border border-border text-left hover:border-accent/50 hover:bg-accent/5 transition-all group">
                <item.icon className="w-5 h-5 text-accent mb-2" />
                <p className="text-sm font-medium">{item.level}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{item.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Stage 3 - Behavioral */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><User className="w-4 h-4 text-accent" /> {isHi ? 'चरण 3 — व्यवहार विश्लेषण' : 'Stage 3 — Behavioral Analysis'}</h3>
          <div className="space-y-3 text-sm">
            <div className="p-3 rounded-xl bg-muted/50">
              <p className="font-medium">{isHi ? 'तैयारी स्कोर' : 'Readiness Score'}: <span className="text-accent">{readinessScore}%</span></p>
              <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
                <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${readinessScore}%` }} />
              </div>
            </div>
            <button onClick={() => setStage('behavioral')} className="w-full px-4 py-3 rounded-xl bg-accent/5 border border-accent/20 text-left hover:bg-accent/10 transition-all">
              <p className="font-medium text-xs flex items-center gap-2"><Eye className="w-4 h-4 text-accent" /> {isHi ? 'व्यवहार और संचार गाइड' : 'Formal Behavior & Communication Guide'}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{isHi ? 'ड्रेस कोड, बॉडी लैंग्वेज, STAR मेथड' : 'Dress code, body language, STAR method'}</p>
            </button>
          </div>
        </div>

        {/* Interview Mindset & Confidence — AI-Based Interactive */}
        <button onClick={() => { setStage('mindset'); setMindsetStep(0); setScenarioIdx(0); setScenarioAnswers([]); setMindsetAnalysis(''); }}
          className="w-full bg-accent/5 border border-accent/20 rounded-2xl p-5 flex items-center gap-4 text-left hover:bg-accent/10 transition-all">
          <div className="w-12 h-12 rounded-xl bg-accent/20 text-accent flex items-center justify-center"><Heart className="w-6 h-6" /></div>
          <div className="flex-1">
            <p className="font-semibold">{isHi ? 'इंटरव्यू माइंडसेट और आत्मविश्वास (AI)' : 'Interview Mindset & Confidence (AI-Powered)'}</p>
            <p className="text-xs text-muted-foreground">{isHi ? 'जानकारी → वीडियो → AI परिदृश्य क्विज़ → विश्लेषण' : 'Learn → Watch → AI Scenario Quiz → Get Personalized Analysis'}</p>
          </div>
          <ArrowRight className="w-5 h-5 text-accent" />
        </button>

        {/* Interview Practice */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Mic className="w-4 h-4 text-accent" /> {isHi ? 'इंटरव्यू अभ्यास' : 'Interview Practice'}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <button onClick={startRapidFire} className="p-4 rounded-xl border border-border text-left hover:border-accent/50 transition-all group">
              <Mic className="w-5 h-5 text-accent mb-2" />
              <p className="text-sm font-medium">{isHi ? 'रैपिड फायर' : 'Rapid Fire'}</p>
              <p className="text-xs text-muted-foreground mt-1">{isHi ? 'तेज़ प्रश्न-उत्तर' : 'Quick Q&A — type your answers fast'}</p>
            </button>
            <button onClick={() => setStage('behavioral')} className="p-4 rounded-xl border border-border text-left hover:border-accent/50 transition-all group">
              <Presentation className="w-5 h-5 text-accent mb-2" />
              <p className="text-sm font-medium">{isHi ? 'भाषण पैटर्न' : 'Speech Patterns'}</p>
              <p className="text-xs text-muted-foreground mt-1">{isHi ? 'फॉर्मल, एलिवेटर पिच' : 'Formal, elevator pitch, technical intro'}</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== MINDSET — 3-STEP AI MODULE =====
  if (stage === 'mindset') {
    const name = user?.name || 'Student';
    const targetRole = user?.dreamCompany || config.companies[0];

    // STEP 0: Information & Tips
    if (mindsetStep === 0) {
      return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          <BackButton to="overview" />
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{isHi ? 'माइंडसेट और आत्मविश्वास' : 'Mindset & Confidence'}</h1>
            <div className="flex gap-1">
              {['Info', 'Videos', 'Quiz'].map((s, i) => (
                <span key={s} className={`px-3 py-1 rounded-lg text-xs font-medium ${i === mindsetStep ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>{s}</span>
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{isHi ? `${name}, इंटरव्यू रूम में जाने से पहले यह जानना ज़रूरी है` : `Everything ${name} needs to know before walking into that room.`}</p>

          {/* Affirmations */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Heart className="w-4 h-4 text-accent" /> {isHi ? 'दैनिक प्रतिज्ञा' : 'Your Daily Affirmations'}</h3>
            <div className="space-y-3">
              {[
                isHi ? `मैं ${name} हूँ, और मैंने यहाँ होने के लिए कड़ी मेहनत की है।` : `I am ${name}, and I have worked hard to be here.`,
                isHi ? `${targetRole} के लिए मेरी तैयारी ने मुझे पहले से मजबूत बनाया है।` : `My preparation for ${targetRole} has made me stronger.`,
                isHi ? `मुझे परफेक्ट होने की ज़रूरत नहीं। मुझे आत्मविश्वासी होना है।` : `I don't need to be perfect. I need to be confident.`,
                isHi ? `हर अस्वीकृति एक पुनर्निर्देशन है।` : `Every rejection is a redirect.`,
              ].map((aff, i) => (
                <div key={i} className="p-4 rounded-xl bg-accent/5 border border-accent/10 text-sm italic leading-relaxed flex items-start gap-3">
                  <span className="text-accent text-lg">✨</span><span>{aff}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pressure Tips */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent" /> {isHi ? 'दबाव में कैसे जीतें' : 'How to Win Under Pressure'}</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { title: isHi ? 'ठहरें' : 'The Pause', desc: isHi ? '"बहुत अच्छा प्रश्न है, मुझे सोचने दीजिए"' : '"Great question, let me think." Buys time and shows composure.', emoji: '⏸️' },
                { title: isHi ? 'रीडायरेक्ट' : 'The Redirect', desc: isHi ? 'अगर अटक जाएं तो "मैंने एक समान स्थिति में..."' : '"I haven\'t encountered that, but in a similar situation..."', emoji: '🔄' },
                { title: isHi ? 'बॉडी लैंग्वेज' : 'Body Language', desc: isHi ? 'बाहें खोलें, पीठ सीधी, शांत रहें।' : 'Open arms, straight back. Your body tells your brain you\'re confident.', emoji: '💪' },
                { title: isHi ? '"मैं करूँगा"' : '"I Will"', desc: isHi ? '"मैं सोचता हूँ" को "मैं करूँगा" से बदलें।' : 'Replace "I think" with "I will." Confident language changes perception.', emoji: '🚀' },
              ].map((tip) => (
                <div key={tip.title} className="p-4 rounded-xl bg-accent/5 border border-accent/10">
                  <p className="font-medium text-sm flex items-center gap-2"><span className="text-xl">{tip.emoji}</span> {tip.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mental Prep Checklist */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Brain className="w-4 h-4 text-accent" /> {isHi ? 'मानसिक तैयारी गाइड' : 'Mental Preparation Guide'}</h3>
            <MentalPrepChecklist isHi={isHi} />
          </div>

          {/* Ethics */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-accent" /> {isHi ? 'नैतिकता' : 'Ethics & Integrity'}</h3>
            <div className="space-y-3 text-sm">
              {[
                { title: isHi ? 'ईमानदार रहें' : 'Be Honest', desc: isHi ? 'कौशल न बढ़ाएं।' : 'Never exaggerate skills. Honesty shows maturity.' },
                { title: isHi ? 'प्रक्रिया का सम्मान' : 'Respect the Process', desc: isHi ? 'पिछले नियोक्ता की बुराई न करें।' : 'Don\'t badmouth previous employers.' },
                { title: isHi ? 'कृतज्ञता' : 'Show Gratitude', desc: isHi ? 'धन्यवाद संदेश भेजें।' : 'Thank the interviewer. Send a thank-you message after.' },
              ].map((item) => (
                <div key={item.title} className="p-4 rounded-xl bg-muted/30 border border-border">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => setMindsetStep(1)} className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-semibold hover-scale flex items-center justify-center gap-2">
            {isHi ? 'अगला: वीडियो देखें' : 'Next: Watch Videos'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      );
    }

    // STEP 1: Videos
    if (mindsetStep === 1) {
      return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          <BackButton to="overview" />
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{isHi ? 'वीडियो गाइड' : 'Video Guide'}</h1>
            <div className="flex gap-1">
              {['Info', 'Videos', 'Quiz'].map((s, i) => (
                <span key={s} className={`px-3 py-1 rounded-lg text-xs font-medium ${i === 1 ? 'bg-accent text-accent-foreground' : i < 1 ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'}`}>{s}</span>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><Video className="w-4 h-4 text-accent" /> {isHi ? 'प्रेरणादायक वीडियो' : 'Motivational Videos'}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl overflow-hidden aspect-video">
                <iframe src="https://www.youtube.com/embed/ZXsQAXx_ao0" className="w-full h-full" allowFullScreen title="Motivational" />
              </div>
              <div className="rounded-xl overflow-hidden aspect-video">
                <iframe src="https://www.youtube.com/embed/UNQhuFL6CWg" className="w-full h-full" allowFullScreen title="Interview Tips" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Video className="w-4 h-4 text-accent" /> {isHi ? 'इंटरव्यू टिप्स' : 'Interview Day Tips'}</h3>
            <div className="rounded-xl overflow-hidden aspect-video">
              <iframe src="https://www.youtube.com/embed/HG68Ymazo18" className="w-full h-full" allowFullScreen title="Interview Day" />
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setMindsetStep(0)} className="flex-1 py-3 rounded-xl bg-muted text-foreground font-medium hover-scale">
              {isHi ? 'पीछे' : 'Back'}
            </button>
            <button onClick={() => { setMindsetStep(2); setScenarioIdx(0); setScenarioAnswers([]); setScenarioInput(''); }} className="flex-1 py-3 rounded-xl bg-accent text-accent-foreground font-semibold hover-scale flex items-center justify-center gap-2">
              {isHi ? 'अगला: AI क्विज़ शुरू करें' : 'Next: Start AI Quiz'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }

    // STEP 2: Scenario Quiz
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <BackButton to="overview" />
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{isHi ? 'परिदृश्य क्विज़' : 'Scenario Quiz'}</h1>
          <div className="flex gap-1">
            {['Info', 'Videos', 'Quiz'].map((s, i) => (
              <span key={s} className={`px-3 py-1 rounded-lg text-xs font-medium ${i === 2 ? 'bg-accent text-accent-foreground' : 'bg-accent/20 text-accent'}`}>{s}</span>
            ))}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{isHi ? 'AI आपके उत्तरों का विश्लेषण करेगा और बताएगा कि बेहतर तरीका क्या हो सकता है।' : 'AI will analyze your responses and suggest better approaches.'}</p>

        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${(scenarioAnswers.length / scenarios.length) * 100}%` }} />
        </div>
        <p className="text-xs text-muted-foreground text-center">{scenarioAnswers.length}/{scenarios.length}</p>

        <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <p className="text-xs text-accent font-medium">{isHi ? 'परिदृश्य' : 'Scenario'} {scenarioIdx + 1}/{scenarios.length}</p>
          <p className="text-base font-medium leading-relaxed">{scenarios[scenarioIdx].scenario}</p>
          <p className="text-xs text-muted-foreground italic">💡 {isHi ? 'संकेत' : 'Hint'}: {scenarios[scenarioIdx].hint}</p>

          <div className="flex gap-2">
            <textarea value={scenarioInput} onChange={e => setScenarioInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), submitScenarioAnswer())}
              placeholder={isHi ? 'अपना जवाब विस्तार से लिखें...' : 'Write your detailed response here...'}
              className="flex-1 px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none" rows={4} />
          </div>
          <button onClick={submitScenarioAnswer} disabled={!scenarioInput.trim()} className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-medium hover-scale disabled:opacity-40 flex items-center justify-center gap-2">
            <Send className="w-4 h-4" />
            {scenarioIdx < scenarios.length - 1 ? (isHi ? 'अगला परिदृश्य' : 'Next Scenario') : (isHi ? 'AI विश्लेषण प्राप्त करें' : 'Get AI Analysis')}
          </button>
        </div>
      </div>
    );
  }

  // ===== MINDSET RESULTS =====
  if (stage === 'mindset-results') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <BackButton to="overview" />
        <h1 className="text-2xl font-bold">{isHi ? 'AI विश्लेषण' : 'AI Mindset Analysis'}</h1>

        {mindsetAnalysisLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin text-accent" /> {isHi ? 'AI विश्लेषण कर रहा है...' : 'AI is analyzing your responses...'}</div>
        )}

        <div className="bg-card rounded-2xl border border-border p-6 prose prose-sm max-w-none">
          <ReactMarkdown>{mindsetAnalysis}</ReactMarkdown>
        </div>

        {!mindsetAnalysisLoading && (
          <div className="flex gap-3">
            <button onClick={() => { setStage('mindset'); setMindsetStep(2); setScenarioIdx(0); setScenarioAnswers([]); setScenarioInput(''); setMindsetAnalysis(''); }}
              className="flex-1 py-3 rounded-xl bg-muted text-foreground font-medium hover-scale">{isHi ? 'फिर से करें' : 'Retake Quiz'}</button>
            <button onClick={() => setStage('overview')} className="flex-1 py-3 rounded-xl bg-accent text-accent-foreground font-medium hover-scale">{isHi ? 'वापस जाएं' : 'Back to Overview'}</button>
          </div>
        )}
      </div>
    );
  }

  // ===== JOB TARGETING =====
  if (stage === 'job-target') {
    return (
      <div className="max-w-4xl space-y-6 animate-fade-in">
        <BackButton to="overview" />
        <h1 className="text-2xl font-bold">{isHi ? 'नौकरी लक्ष्य' : 'Job Targeting'} — {user?.city || 'Your Area'}</h1>
        <div className="space-y-3">
          {companyData.map((c) => (
            <div key={c.name} className="bg-card rounded-xl border border-border overflow-hidden">
              <button onClick={() => setExpandedCompany(expandedCompany === c.name ? null : c.name)} className="w-full flex items-center gap-4 p-4 text-left">
                <Building className="w-5 h-5 text-accent" />
                <div className="flex-1">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.seats} {isHi ? 'सीटें' : 'seats'} · {c.salary}</p>
                </div>
                <span className="text-sm font-bold text-accent">{c.match}% match</span>
                {expandedCompany === c.name ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              {expandedCompany === c.name && (
                <div className="px-4 pb-4 border-t border-border pt-3 animate-fade-in space-y-3">
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">{isHi ? 'पात्रता' : 'Eligibility'}:</span> {c.eligibility}</p>
                    <p><span className="font-medium">{isHi ? 'प्रक्रिया' : 'Process'}:</span> {c.process}</p>
                    {c.cities.length > 0 && <p><span className="font-medium">{isHi ? 'शहर' : 'Cities'}:</span> {c.cities.join(', ')}</p>}
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${c.match}%` }} />
                  </div>
                  <button onClick={() => startCompanyPrep(c.name)} className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover-scale">
                    {isHi ? `${c.name} के लिए तैयारी` : `Start Prep for ${c.name}`}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ===== COMPANY PREP — AI CHATBOT =====
  if (stage === 'company-prep') {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <BackButton to="overview" />
            <h2 className="text-lg font-bold">{selectedCompany} — {isHi ? 'इंटरव्यू तैयारी' : 'Interview Prep'}</h2>
          </div>
          <div className="flex gap-2">
            {['Foundation', 'Competitive', 'Placement Ready'].map(l => (
              <button key={l} onClick={() => switchLevel(l)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${selectedLevel === l ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground hover:bg-accent/10'}`}>{l}</button>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-2xl border border-border h-[450px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {aiMessages.filter(m => m.role !== 'user' || aiMessages.indexOf(m) > 0).map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-accent text-accent-foreground rounded-br-md' : 'bg-muted rounded-bl-md'}`}>
                  {msg.role === 'assistant' ? <div className="prose prose-sm max-w-none"><ReactMarkdown>{msg.content}</ReactMarkdown></div> : msg.content}
                </div>
              </div>
            ))}
            {isStreaming && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" /> {isHi ? 'AI सोच रहा है...' : 'AI is thinking...'}</div>}
            <div ref={chatEndRef} />
          </div>
          <div className="p-4 border-t border-border flex gap-2">
            <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendChatAnswer()}
              placeholder={isHi ? 'अपना उत्तर टाइप करें...' : 'Type your answer...'} disabled={isStreaming}
              className="flex-1 px-4 py-2 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50" />
            <button onClick={sendChatAnswer} disabled={!chatInput.trim() || isStreaming} className="px-4 py-2 rounded-xl bg-accent text-accent-foreground hover-scale disabled:opacity-40">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== BEHAVIORAL =====
  if (stage === 'behavioral') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <BackButton to="overview" />
        <h1 className="text-2xl font-bold">{isHi ? 'व्यवहार और संचार गाइड' : 'Behavioral & Communication Guide'}</h1>
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4">{isHi ? 'STAR विधि' : 'STAR Method'}</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { letter: 'S', title: isHi ? 'स्थिति' : 'Situation', desc: isHi ? 'पृष्ठभूमि बताएं' : 'Set the scene' },
              { letter: 'T', title: isHi ? 'कार्य' : 'Task', desc: isHi ? 'क्या करना था' : 'Your responsibility' },
              { letter: 'A', title: isHi ? 'कार्रवाई' : 'Action', desc: isHi ? 'आपने क्या किया' : 'What you did' },
              { letter: 'R', title: isHi ? 'परिणाम' : 'Result', desc: isHi ? 'क्या हासिल हुआ' : 'Measurable outcome' },
            ].map(s => (
              <div key={s.letter} className="p-4 rounded-xl bg-muted/50 flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm">{s.letter}</span>
                <div><p className="font-medium text-sm">{s.title}</p><p className="text-xs text-muted-foreground">{s.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4">{isHi ? 'ड्रेस कोड' : 'Dress Code & Body Language'}</h3>
          <div className="space-y-3">
            {[
              { emoji: '👔', tip: isHi ? 'फॉर्मल कपड़े' : 'Formal attire — ironed, clean' },
              { emoji: '👀', tip: isHi ? 'आँख में आँख' : 'Maintain eye contact' },
              { emoji: '🤝', tip: isHi ? 'मज़बूत हैंडशेक' : 'Firm handshake' },
              { emoji: '🪑', tip: isHi ? 'सीधे बैठें' : 'Sit upright, don\'t cross arms' },
              { emoji: '😊', tip: isHi ? 'मुस्कुराएं' : 'Smile at start and end' },
            ].map(item => (
              <div key={item.emoji} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 text-sm">
                <span className="text-xl">{item.emoji}</span><span>{item.tip}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl overflow-hidden aspect-video">
          <iframe src="https://www.youtube.com/embed/S1jB5YOp5Oc" className="w-full h-full" allowFullScreen title="Body Language Tips" />
        </div>
      </div>
    );
  }

  // ===== RAPID FIRE =====
  if (stage === 'rapid-fire') {
    const allAnswered = rfAnswers.length >= rfQuestions.length;
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <BackButton to="overview" />
          <h2 className="text-lg font-bold">{isHi ? 'रैपिड फायर' : 'Rapid Fire'} — {config.label}</h2>
          <span className="text-xs text-muted-foreground">{rfAnswers.length}/{rfQuestions.length}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${(rfAnswers.length / rfQuestions.length) * 100}%` }} />
        </div>
        {!allAnswered ? (
          <div className="bg-card rounded-2xl border border-border p-6">
            <p className="text-xs text-accent mb-2">{isHi ? 'प्रश्न' : 'Question'} {currentRFQ + 1}</p>
            <p className="text-lg font-medium mb-4">{rfQuestions[currentRFQ]}</p>
            <div className="flex gap-2">
              <input value={rfInput} onChange={e => setRfInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitRFAnswer()}
                placeholder={isHi ? 'तेज़ उत्तर दें...' : 'Type your quick answer...'}
                className="flex-1 px-4 py-2 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              <button onClick={submitRFAnswer} disabled={!rfInput.trim()} className="px-4 py-2 rounded-xl bg-accent text-accent-foreground hover-scale disabled:opacity-40"><Send className="w-4 h-4" /></button>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <div className="text-center">
              <CheckCircle className="w-10 h-10 text-accent mx-auto mb-2" />
              <p className="font-bold text-lg">{isHi ? 'पूर्ण!' : 'Complete!'}</p>
            </div>
            <div className="space-y-2">
              {rfQuestions.map((q, i) => (
                <div key={i} className="p-3 rounded-xl bg-muted/30 text-sm">
                  <p className="font-medium text-xs text-accent">Q{i + 1}: {q}</p>
                  <p className="text-muted-foreground mt-1">{isHi ? 'उत्तर' : 'Your answer'}: {rfAnswers[i] || '-'}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setStage('overview')} className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-medium hover-scale">{isHi ? 'वापस' : 'Back to Interview Prep'}</button>
          </div>
        )}
      </div>
    );
  }

  return null;
}

function MentalPrepChecklist({ isHi }: { isHi: boolean }) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const toggle = (id: string) => {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id); else next.add(id);
    setChecked(next);
  };

  const sections = [
    { title: isHi ? 'इंटरव्यू से पहली रात' : 'Night Before', items: [
      { id: 'clothes', text: isHi ? 'कपड़े तैयार करें' : 'Lay out clothes — formal, ironed' },
      { id: 'resume', text: isHi ? 'रिज्यूमे रिव्यू करें' : 'Review resume — know every line' },
      { id: 'sleep', text: isHi ? '7-8 घंटे सोएं' : 'Sleep 7-8 hours' },
    ]},
    { title: isHi ? 'सुबह' : 'Morning Of', items: [
      { id: 'wake', text: isHi ? '2 घंटे पहले उठें' : 'Wake 2 hours early' },
      { id: 'eat', text: isHi ? 'हल्का भोजन' : 'Eat light, healthy meal' },
      { id: 'arrive', text: isHi ? '15 मिनट पहले पहुंचें' : 'Arrive 15 minutes early' },
    ]},
    { title: isHi ? 'दौरान' : 'During Interview', items: [
      { id: 'breathe', text: isHi ? 'धीरे सांस लें' : 'Breathe slowly — 4 sec in, 4 out' },
      { id: 'listen', text: isHi ? 'पूरा सुनें, 2 सेकंड रुकें' : 'Listen fully, pause 2 seconds' },
      { id: 'ask', text: isHi ? 'अंत में प्रश्न पूछें' : 'Ask one thoughtful question at end' },
    ]},
  ];

  return (
    <div className="space-y-4">
      {sections.map(s => (
        <div key={s.title} className="p-4 rounded-xl bg-muted/50">
          <p className="font-medium text-sm mb-3">{s.title}</p>
          <div className="space-y-2">
            {s.items.map(item => (
              <button key={item.id} onClick={() => toggle(item.id)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left text-xs transition-all ${checked.has(item.id) ? 'bg-accent/10 text-accent line-through' : 'hover:bg-muted'}`}>
                <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${checked.has(item.id) ? 'bg-accent border-accent' : 'border-border'}`}>
                  {checked.has(item.id) && <CheckCircle className="w-3 h-3 text-accent-foreground" />}
                </div>
                {item.text}
              </button>
            ))}
          </div>
        </div>
      ))}
      <p className="text-xs text-muted-foreground text-center">{checked.size}/{sections.reduce((a, s) => a + s.items.length, 0)} {isHi ? 'पूर्ण' : 'completed'}</p>
    </div>
  );
}
