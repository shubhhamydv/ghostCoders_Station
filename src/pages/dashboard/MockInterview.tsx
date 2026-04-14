import { useState, useRef, useEffect, useCallback } from 'react';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import { streamChat, type Msg } from '@/lib/ai';
import { Video, Mic, MicOff, Play, SkipForward, MessageSquare, Award, TrendingUp, AlertCircle, Bot, User, Loader2, RotateCcw } from 'lucide-react';

interface Feedback {
  confidence: number;
  clarity: number;
  suggestions: string[];
}

interface InterviewMessage {
  role: 'ai' | 'user';
  text: string;
  feedback?: Feedback;
}

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export default function MockInterview() {
  const { domain, user, language } = useStationStore();
  const config = domainConfig[domain];
  const isHi = language === 'hi';

  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [aiMessages, setAiMessages] = useState<Msg[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [overallScore, setOverallScore] = useState({ confidence: 0, clarity: 0, total: 0 });
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const startInterview = async () => {
    setStarted(true);
    setAiLoading(true);
    const systemMsg: Msg = {
      role: 'user',
      content: `Start a mock interview for a ${config.label} student named ${user?.name || 'Student'} targeting ${user?.dreamCompany || config.companies[0]}. Specialization: ${user?.specialization || config.label}. Ask the first HR question to start. Keep it realistic for Indian campus placements.`
    };
    setAiMessages([systemMsg]);
    let response = '';
    await streamChat({
      messages: [systemMsg],
      mode: 'mock-interview',
      context: { domain, userName: user?.name || 'Student', company: user?.dreamCompany || config.companies[0] },
      onDelta: (d) => { response += d; },
      onDone: () => {
        setMessages([{ role: 'ai', text: response }]);
        setAiLoading(false);
        setQuestionCount(1);
      },
      onError: () => {
        setMessages([{ role: 'ai', text: isHi ? 'नमस्ते! मैं आज आपका इंटरव्यू ले रहा हूं। अपने बारे में बताइए।' : "Hello! I'll be conducting your interview today. Tell me about yourself." }]);
        setAiLoading(false);
        setQuestionCount(1);
      }
    });
  };

  const startListening = useCallback(() => {
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = isHi ? 'hi-IN' : 'en-IN';
    let finalTranscript = '';
    recognition.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript + ' ';
        else interim += e.results[i][0].transcript;
      }
      setTranscript(finalTranscript + interim);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setTranscript('');
  }, [isHi]);

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const submitAnswer = async () => {
    if (!transcript.trim()) return;
    stopListening();
    const userAnswer = transcript.trim();
    setMessages(prev => [...prev, { role: 'user', text: userAnswer }]);
    setTranscript('');
    setAiLoading(true);

    const newAiMessages: Msg[] = [
      ...aiMessages,
      { role: 'assistant', content: messages.filter(m => m.role === 'ai').pop()?.text || '' },
      { role: 'user', content: userAnswer }
    ];
    setAiMessages(newAiMessages);

    const feedbackPrompt: Msg[] = [
      ...newAiMessages,
      { role: 'user', content: `Evaluate my last answer. Give: 1) Confidence score (0-100), 2) Clarity score (0-100), 3) 2-3 specific improvement suggestions. Then ask the next interview question. Format: CONFIDENCE: [score]\nCLARITY: [score]\nSUGGESTIONS:\n- [suggestion]\nNEXT QUESTION:\n[question]` }
    ];

    let response = '';
    await streamChat({
      messages: feedbackPrompt,
      mode: 'mock-interview',
      context: { domain, userName: user?.name || 'Student', company: user?.dreamCompany || config.companies[0] },
      onDelta: (d) => { response += d; },
      onDone: () => {
        const confMatch = response.match(/CONFIDENCE:\s*(\d+)/i);
        const clarMatch = response.match(/CLARITY:\s*(\d+)/i);
        const sugMatch = response.match(/SUGGESTIONS:\s*([\s\S]*?)(?:NEXT QUESTION:|$)/i);
        const nextMatch = response.match(/NEXT QUESTION:\s*([\s\S]*)/i);

        const confidence = confMatch ? Math.min(100, parseInt(confMatch[1])) : Math.round(40 + Math.random() * 40);
        const clarity = clarMatch ? Math.min(100, parseInt(clarMatch[1])) : Math.round(40 + Math.random() * 40);
        const suggestions = sugMatch
          ? sugMatch[1].split('\n').filter(s => s.trim().startsWith('-')).map(s => s.replace(/^-\s*/, '').trim()).filter(Boolean)
          : ['Try using the STAR method', 'Be more specific with examples'];
        const nextQ = nextMatch ? nextMatch[1].trim() : response;

        const feedback: Feedback = { confidence, clarity, suggestions };

        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], feedback };
          return [...updated, { role: 'ai', text: nextQ }];
        });

        setOverallScore(prev => ({
          confidence: Math.round((prev.confidence * questionCount + confidence) / (questionCount + 1)),
          clarity: Math.round((prev.clarity * questionCount + clarity) / (questionCount + 1)),
          total: Math.round(((prev.confidence * questionCount + confidence) / (questionCount + 1) + (prev.clarity * questionCount + clarity) / (questionCount + 1)) / 2),
        }));
        setQuestionCount(c => c + 1);
        setAiLoading(false);

        if (questionCount >= 7) setSessionComplete(true);
      },
      onError: () => {
        setMessages(prev => [...prev, { role: 'ai', text: isHi ? 'अगला प्रश्न: अपने सबसे बड़े तकनीकी प्रोजेक्ट के बारे में बताएं।' : 'Next question: Tell me about your biggest technical project.' }]);
        setAiLoading(false);
      },
    });
  };

  // Save session to localStorage
  useEffect(() => {
    if (sessionComplete) {
      const sessions = JSON.parse(localStorage.getItem('station_mock_sessions') || '[]');
      sessions.push({
        date: new Date().toISOString(),
        domain,
        questions: questionCount,
        confidence: overallScore.confidence,
        clarity: overallScore.clarity,
        total: overallScore.total,
      });
      localStorage.setItem('station_mock_sessions', JSON.stringify(sessions));
    }
  }, [sessionComplete]);

  if (!started) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="bg-primary p-8 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-accent/20 flex items-center justify-center mb-4">
              <Video className="w-10 h-10 text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-primary-foreground">{isHi ? 'AI मॉक इंटरव्यू' : 'AI Mock Interview'}</h1>
            <p className="text-primary-foreground/70 mt-2 max-w-md mx-auto text-sm">
              {isHi ? 'वास्तविक इंटरव्यू जैसा अनुभव। AI आपसे सवाल पूछेगा और फीडबैक देगा।' :
                'Experience a realistic interview. AI will ask questions and provide instant feedback on your answers.'}
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: MessageSquare, label: isHi ? 'HR + तकनीकी' : 'HR + Technical', desc: isHi ? '8 प्रश्न' : '8 Questions' },
                { icon: Award, label: isHi ? 'तुरंत फीडबैक' : 'Instant Feedback', desc: isHi ? 'हर उत्तर पर' : 'After each answer' },
                { icon: TrendingUp, label: isHi ? 'स्कोर ट्रैकिंग' : 'Score Tracking', desc: isHi ? 'आत्मविश्वास + स्पष्टता' : 'Confidence + Clarity' },
              ].map(f => (
                <div key={f.label} className="bg-muted/50 rounded-xl p-4 text-center">
                  <f.icon className="w-5 h-5 mx-auto mb-2 text-accent" />
                  <p className="text-xs font-semibold">{f.label}</p>
                  <p className="text-[10px] text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
            <button onClick={startInterview}
              className="w-full py-4 rounded-xl bg-accent text-accent-foreground font-bold text-lg flex items-center justify-center gap-3 hover-scale animate-pulse-glow">
              <Play className="w-6 h-6" /> {isHi ? 'इंटरव्यू शुरू करें' : 'Start Interview'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Video className="w-5 h-5 text-accent" />
          {isHi ? 'मॉक इंटरव्यू' : 'Mock Interview'} — Q{questionCount}/8
        </h1>
        {overallScore.total > 0 && (
          <div className="flex gap-3 text-xs">
            <span className="px-3 py-1 rounded-full bg-accent/10 text-accent font-semibold">
              {isHi ? 'आत्मविश्वास' : 'Confidence'}: {overallScore.confidence}%
            </span>
            <span className="px-3 py-1 rounded-full bg-accent/10 text-accent font-semibold">
              {isHi ? 'स्पष्टता' : 'Clarity'}: {overallScore.clarity}%
            </span>
          </div>
        )}
      </div>

      {/* Interview Screen */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* AI Interviewer */}
        <div className="bg-card rounded-2xl border border-border p-4 flex flex-col items-center justify-center min-h-[300px]">
          <div className={`w-24 h-24 rounded-full bg-primary flex items-center justify-center mb-4 ${aiLoading ? 'animate-pulse' : ''}`}>
            <Bot className="w-12 h-12 text-primary-foreground" />
          </div>
          <p className="text-sm font-semibold">{isHi ? 'AI इंटरव्यूअर' : 'AI Interviewer'}</p>
          <p className="text-[10px] text-muted-foreground mt-1">{config.label} {isHi ? 'विशेषज्ञ' : 'Expert'}</p>
          {aiLoading && <Loader2 className="w-4 h-4 animate-spin text-accent mt-3" />}
        </div>

        {/* Chat Area */}
        <div className="md:col-span-2 bg-card rounded-2xl border border-border flex flex-col min-h-[400px] max-h-[500px]">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''} animate-fade-in`}>
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm ${
                    msg.role === 'ai' ? 'bg-muted' : 'bg-accent text-accent-foreground'
                  }`}>
                    {msg.text}
                  </div>
                  {msg.feedback && (
                    <div className="mt-2 p-3 rounded-xl bg-accent/5 border border-accent/20 text-xs space-y-2">
                      <div className="flex gap-4">
                        <div>
                          <span className="text-muted-foreground">{isHi ? 'आत्मविश्वास' : 'Confidence'}:</span>
                          <div className="w-24 h-2 bg-muted rounded-full mt-1">
                            <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${msg.feedback.confidence}%` }} />
                          </div>
                          <span className="font-bold text-accent">{msg.feedback.confidence}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{isHi ? 'स्पष्टता' : 'Clarity'}:</span>
                          <div className="w-24 h-2 bg-muted rounded-full mt-1">
                            <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${msg.feedback.clarity}%` }} />
                          </div>
                          <span className="font-bold text-accent">{msg.feedback.clarity}%</span>
                        </div>
                      </div>
                      {msg.feedback.suggestions.length > 0 && (
                        <div>
                          <p className="font-semibold text-muted-foreground mb-1">💡 {isHi ? 'सुझाव' : 'Suggestions'}:</p>
                          {msg.feedback.suggestions.map((s, j) => (
                            <p key={j} className="text-muted-foreground">• {s}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-accent-foreground" />
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-border p-4">
            {sessionComplete ? (
              <div className="text-center space-y-3">
                <div className="text-2xl font-bold text-accent">{overallScore.total}% {isHi ? 'कुल स्कोर' : 'Overall Score'}</div>
                <p className="text-sm text-muted-foreground">
                  {overallScore.total >= 70 ? (isHi ? '🎉 शानदार! आप इंटरव्यू के लिए तैयार हैं!' : '🎉 Excellent! You are interview ready!') :
                    overallScore.total >= 40 ? (isHi ? '📈 अच्छा प्रयास! और अभ्यास करें।' : '📈 Good effort! Keep practicing.') :
                      (isHi ? '💪 अभ्यास जारी रखें, सुधार होगा।' : '💪 Keep practicing, you will improve.')}
                </p>
                <button onClick={() => { setStarted(false); setMessages([]); setAiMessages([]); setQuestionCount(0); setSessionComplete(false); setOverallScore({ confidence: 0, clarity: 0, total: 0 }); }}
                  className="px-6 py-2 rounded-xl bg-accent text-accent-foreground font-semibold hover-scale flex items-center gap-2 mx-auto">
                  <RotateCcw className="w-4 h-4" /> {isHi ? 'फिर से शुरू करें' : 'Start Again'}
                </button>
              </div>
            ) : (
              <>
                {transcript && (
                  <div className="mb-3 p-3 rounded-xl bg-muted/50 text-sm italic text-muted-foreground">
                    "{transcript}"
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={isListening ? stopListening : startListening}
                    disabled={aiLoading}
                    className={`p-3 rounded-xl font-semibold transition-all ${
                      isListening ? 'bg-destructive text-destructive-foreground animate-pulse' : 'bg-accent text-accent-foreground'
                    } disabled:opacity-40`}>
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  <input
                    value={transcript}
                    onChange={e => setTranscript(e.target.value)}
                    placeholder={isHi ? 'अपना उत्तर बोलें या टाइप करें...' : 'Speak or type your answer...'}
                    className="flex-1 px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    onKeyDown={e => e.key === 'Enter' && submitAnswer()}
                  />
                  <button onClick={submitAnswer} disabled={!transcript.trim() || aiLoading}
                    className="px-4 py-3 rounded-xl bg-accent text-accent-foreground font-semibold hover-scale disabled:opacity-40">
                    {aiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <SkipForward className="w-5 h-5" />}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
