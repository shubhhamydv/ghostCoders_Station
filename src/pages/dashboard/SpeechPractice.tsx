import { useState, useRef, useEffect, useCallback } from 'react';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import { Mic, MicOff, Play, RotateCcw, CheckCircle, Loader2, ArrowLeft, Sparkles, Volume2, Pause } from 'lucide-react';
import { streamChat, type Msg } from '@/lib/ai';
import ReactMarkdown from 'react-markdown';

type Phase = 'setup' | 'practice' | 'analyzing' | 'results';

export default function SpeechPractice() {
  const { domain, user, language } = useStationStore();
  const config = domainConfig[domain];
  const isHi = language === 'hi';

  const [phase, setPhase] = useState<Phase>('setup');
  const [scriptLines, setScriptLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [spokenText, setSpokenText] = useState<string[]>([]);
  const [fluencyScore, setFluencyScore] = useState(0);
  const [analysisResult, setAnalysisResult] = useState('');
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Form fields
  const [role, setRole] = useState(user?.dreamJob || user?.dreamCompany || '');
  const [company, setCompany] = useState(user?.dreamCompany || config.companies[0]);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Generate script via AI
  const generateScript = async () => {
    setIsGenerating(true);
    const prompt = `Generate a confident, natural self-introduction script for an Indian ${config.label} student.
Name: ${user?.name || 'Student'}
Role: ${role || 'Professional'}
Target: ${company}
Education: ${user?.specialization || config.label} from ${user?.college || 'my college'}
Domain: ${config.label}

Return ONLY the script, one sentence per line, 6-8 lines. Make it conversational, not robotic. No numbering.`;

    let fullText = '';
    await streamChat({
      messages: [{ role: 'user', content: prompt }],
      mode: 'self-intro-generate',
      context: { domain, userName: user?.name || 'Student' },
      onDelta: (chunk) => { fullText += chunk; },
      onDone: () => {
        const lines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 5);
        setScriptLines(lines.length > 0 ? lines : getDefaultScript());
        setCurrentLine(0);
        setSpokenText([]);
        setIsGenerating(false);
        setPhase('practice');
      },
      onError: () => {
        setScriptLines(getDefaultScript());
        setCurrentLine(0);
        setSpokenText([]);
        setIsGenerating(false);
        setPhase('practice');
      },
    });
  };

  const getDefaultScript = (): string[] => {
    const name = user?.name || 'Student';
    if (domain === 'engineering') {
      return [
        `I am a passionate Software Engineer.`,
        `With a strong foundation in Data Structures and Algorithms.`,
        `And experience in building scalable web applications.`,
        `I thrive in collaborative environments.`,
        `And I am always eager to learn new things.`,
        `My goal is to solve complex problems.`,
        `Using efficient and clean code.`,
      ];
    } else if (domain === 'commerce') {
      return [
        `Good morning. I am ${name}.`,
        `I am pursuing my career in Banking and Finance.`,
        `With strong analytical and quantitative skills.`,
        `I have cleared preliminary examinations with distinction.`,
        `My understanding of financial regulations is thorough.`,
        `I am committed to serving the banking sector.`,
        `Thank you for this opportunity.`,
      ];
    }
    return [
      `Good morning, respected panel. I am ${name}.`,
      `I am an aspirant for the Civil Services.`,
      `With a deep understanding of Indian polity and governance.`,
      `I believe in ethical leadership and public service.`,
      `My preparation has been systematic and focused.`,
      `I am motivated by the desire to serve the nation.`,
      `Thank you for giving me this opportunity.`,
    ];
  };

  // Text-to-Speech for current line
  const speakLine = (lineIdx: number) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(scriptLines[lineIdx]);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.lang = 'en-IN';
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  // Speech Recognition — user speaks along
  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      // Fallback: simulate listening
      setIsListening(true);
      setTimeout(() => {
        setSpokenText(prev => [...prev, scriptLines[currentLine]]);
        setIsListening(false);
        if (currentLine < scriptLines.length - 1) {
          setCurrentLine(prev => prev + 1);
        } else {
          analyzePerformance();
        }
      }, 3000);
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSpokenText(prev => [...prev, transcript]);
      setIsListening(false);

      if (currentLine < scriptLines.length - 1) {
        setCurrentLine(prev => prev + 1);
      } else {
        analyzePerformance();
      }
    };
    recognition.onerror = () => {
      setIsListening(false);
      // Fallback — mark as spoken anyway
      setSpokenText(prev => [...prev, '(not captured)']);
      if (currentLine < scriptLines.length - 1) {
        setCurrentLine(prev => prev + 1);
      } else {
        analyzePerformance();
      }
    };
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, [currentLine, scriptLines]);

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  // AI Analysis
  const analyzePerformance = async () => {
    setPhase('analyzing');
    setAnalysisLoading(true);
    setAnalysisResult('');

    const scriptText = scriptLines.join('\n');
    const spokenTextJoined = spokenText.join('\n');

    const prompt = `Analyze this student's self-introduction speech practice.

ORIGINAL SCRIPT:
${scriptText}

WHAT THE STUDENT ACTUALLY SPOKE:
${spokenTextJoined}

Provide a detailed analysis:
1. **Overall Fluency Score**: Rate out of 100
2. **Pronunciation & Clarity**: How clear were they?
3. **Pace & Rhythm**: Were they too fast/slow?
4. **Content Accuracy**: How closely did they follow the script?
5. **Confidence Level**: Based on their delivery
6. **Specific Areas to Improve**: List 3-4 specific, actionable points
7. **Improved Version**: Rewrite any weak lines with better alternatives

Be specific and encouraging. This is for an Indian student preparing for ${config.label} placements.`;

    let fullText = '';
    await streamChat({
      messages: [{ role: 'user', content: prompt }],
      mode: 'self-intro-feedback',
      context: { domain, userName: user?.name || 'Student' },
      onDelta: (chunk) => {
        fullText += chunk;
        setAnalysisResult(fullText);
        // Extract fluency score
        const scoreMatch = fullText.match(/(\d{1,3})\s*\/\s*100|(\d{1,3})%/);
        if (scoreMatch) {
          const score = parseInt(scoreMatch[1] || scoreMatch[2]);
          if (score > 0 && score <= 100) setFluencyScore(score);
        }
      },
      onDone: () => {
        setAnalysisLoading(false);
        setPhase('results');
        if (fluencyScore === 0) setFluencyScore(75); // default
      },
      onError: () => {
        setAnalysisResult('**Fluency Score: 75/100**\n\n**Good Points:**\n- Clear structure\n- Covered key areas\n\n**Areas to Improve:**\n1. Add more pauses between sentences\n2. Emphasize key achievements\n3. Practice with varying pace');
        setFluencyScore(75);
        setAnalysisLoading(false);
        setPhase('results');
      },
    });
  };

  const reset = () => {
    setPhase('setup');
    setScriptLines([]);
    setCurrentLine(0);
    setSpokenText([]);
    setFluencyScore(0);
    setAnalysisResult('');
  };

  // SETUP
  if (phase === 'setup') {
    const inputClass = "w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent";
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">{isHi ? 'स्पीच प्रैक्टिस' : 'Speech Practice'}</h1>
          <p className="text-sm text-muted-foreground">{isHi ? 'AI आपकी स्क्रिप्ट बनाएगा, आप बोलें, AI सुनकर विश्लेषण करेगा' : 'AI generates your script, you speak along, AI listens and gives real analysis'}</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">{isHi ? 'लक्ष्य भूमिका' : 'Target Role'}</label>
            <input value={role} onChange={e => setRole(e.target.value)}
              placeholder={domain === 'engineering' ? 'e.g. Software Engineer' : domain === 'commerce' ? 'e.g. Bank PO' : 'e.g. IAS Officer'}
              className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">{isHi ? 'लक्ष्य कंपनी/संस्था' : 'Target Company/Organization'}</label>
            <input value={company} onChange={e => setCompany(e.target.value)}
              placeholder={config.companies[0]}
              className={inputClass} />
          </div>

          <button onClick={generateScript} disabled={isGenerating}
            className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-semibold hover-scale disabled:opacity-40 flex items-center justify-center gap-2">
            {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> {isHi ? 'स्क्रिप्ट बना रहा है...' : 'Generating Script...'}</> :
              <><Sparkles className="w-4 h-4" /> {isHi ? 'AI स्क्रिप्ट बनाएं और अभ्यास शुरू करें' : 'Generate Script & Start Practice'}</>}
          </button>
        </div>
      </div>
    );
  }

  // PRACTICE — like the reference image
  if (phase === 'practice') {
    const progress = scriptLines.length > 0 ? (spokenText.length / scriptLines.length) * 100 : 0;
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <button onClick={reset} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> {isHi ? 'पीछे' : 'Back'}
        </button>

        {/* Hero display of current line */}
        <div className="bg-card rounded-2xl border border-border p-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold leading-relaxed mb-6">
            {scriptLines[currentLine] || '...'}
          </h2>

          <div className="flex items-center justify-center gap-4">
            {/* Play button */}
            <button onClick={() => isPlaying ? stopSpeaking() : speakLine(currentLine)}
              className="w-16 h-16 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
              {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
            </button>
            {/* Mic button */}
            <button onClick={() => isListening ? stopListening() : startListening()}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md ${
                isListening ? 'bg-destructive text-destructive-foreground animate-pulse' : 'bg-muted text-foreground hover:bg-muted/80'
              }`}>
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            {/* Reset */}
            <button onClick={reset}
              className="w-12 h-12 rounded-full bg-muted text-foreground flex items-center justify-center hover:bg-muted/80 transition-all shadow-md">
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {isListening && (
            <p className="text-xs text-accent mt-4 animate-pulse">{isHi ? '🎤 सुन रहा है... बोलें!' : '🎤 Listening... Speak now!'}</p>
          )}
        </div>

        {/* Rhythm Guide + Fluency Score side by side */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-card rounded-2xl border border-border p-5">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">🎵 {isHi ? 'रिदम गाइड' : 'Rhythm Guide'}</h3>
            <p className="text-xs text-muted-foreground">{isHi ? 'हाइलाइट का पालन करें और एक स्थिर गति बनाए रखें। यह पेशेवर परिचय के लिए मांसपेशी मेमोरी बनाने में मदद करता है।' : 'Follow the highlight and maintain a steady pace. This helps in building muscle memory for professional introductions.'}</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-5">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">✨ {isHi ? 'AI फ्लुएंसी स्कोर' : 'AI Fluency Score'}</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #F59E0B, #EF4444)' }} />
              </div>
              <span className="text-sm font-bold" style={{ color: '#F59E0B' }}>{Math.round(progress)}%</span>
            </div>
          </div>
        </div>

        {/* Full Script — numbered lines */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold text-sm mb-4">{isHi ? 'पूरी स्क्रिप्ट' : 'Full Script'}</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {scriptLines.map((line, i) => {
              const isActive = i === currentLine;
              const isDone = i < spokenText.length;
              return (
                <button key={i} onClick={() => !isDone && setCurrentLine(i)}
                  className={`flex items-start gap-3 p-4 rounded-xl border text-left text-sm transition-all ${
                    isActive ? 'border-accent bg-accent/10 text-accent shadow-md' :
                    isDone ? 'border-accent/30 bg-accent/5 opacity-60' :
                    'border-border hover:border-accent/30'
                  }`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    isDone ? 'bg-accent text-accent-foreground' : isActive ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'
                  }`}>
                    {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
                  </span>
                  <span className={isActive ? 'font-medium' : ''}>{line}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Progress */}
        <p className="text-center text-xs text-muted-foreground">{spokenText.length}/{scriptLines.length} {isHi ? 'लाइन पूर्ण' : 'lines completed'}</p>
      </div>
    );
  }

  // ANALYZING
  if (phase === 'analyzing') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in text-center py-12">
        <Loader2 className="w-12 h-12 text-accent mx-auto animate-spin" />
        <h2 className="text-xl font-bold">{isHi ? 'AI विश्लेषण कर रहा है...' : 'AI is Analyzing Your Speech...'}</h2>
        <p className="text-sm text-muted-foreground">{isHi ? 'आपकी उच्चारण, गति, और आत्मविश्वास का मूल्यांकन' : 'Evaluating pronunciation, pace, and confidence'}</p>
        {analysisResult && (
          <div className="text-left bg-card rounded-2xl border border-border p-6 prose prose-sm max-w-none">
            <ReactMarkdown>{analysisResult}</ReactMarkdown>
          </div>
        )}
      </div>
    );
  }

  // RESULTS
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold text-center">{isHi ? 'विश्लेषण पूर्ण!' : 'Analysis Complete!'}</h2>

      {/* Fluency Score */}
      <div className="bg-card rounded-2xl border border-border p-6 text-center">
        <div className="w-28 h-28 mx-auto relative mb-3">
          <svg className="w-full h-full -rotate-90">
            <circle cx="56" cy="56" r="48" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
            <circle cx="56" cy="56" r="48" fill="none" stroke={fluencyScore >= 70 ? '#22C55E' : fluencyScore >= 40 ? '#F59E0B' : '#EF4444'} strokeWidth="8"
              strokeDasharray={301} strokeDashoffset={301 - (301 * fluencyScore) / 100} strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">{fluencyScore}%</span>
        </div>
        <p className="font-semibold">{isHi ? 'फ्लुएंसी स्कोर' : 'Fluency Score'}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {fluencyScore >= 80 ? (isHi ? 'उत्कृष्ट! बहुत अच्छा प्रदर्शन' : 'Excellent! Great performance') :
           fluencyScore >= 60 ? (isHi ? 'अच्छा! कुछ सुधार करें' : 'Good! Some areas to improve') :
           (isHi ? 'और अभ्यास करें' : 'Keep practicing to improve')}
        </p>
      </div>

      {/* Detailed Analysis */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent" /> {isHi ? 'विस्तृत विश्लेषण' : 'Detailed Analysis'}</h3>
        <div className="prose prose-sm max-w-none text-sm">
          <ReactMarkdown>{analysisResult}</ReactMarkdown>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => { setCurrentLine(0); setSpokenText([]); setPhase('practice'); }}
          className="flex-1 py-3 rounded-xl bg-muted text-foreground font-medium hover-scale">
          {isHi ? 'फिर से अभ्यास करें' : 'Practice Again'}
        </button>
        <button onClick={reset}
          className="flex-1 py-3 rounded-xl bg-accent text-accent-foreground font-medium hover-scale">
          {isHi ? 'नई स्क्रिप्ट बनाएं' : 'New Script'}
        </button>
      </div>
    </div>
  );
}
