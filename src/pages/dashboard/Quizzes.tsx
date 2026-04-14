import { useState, useEffect, useCallback } from 'react';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import { Brain, Zap, Clock, Star, Shield, X, ArrowRight, CheckCircle, XCircle, Timer, ArrowLeft, BookOpen, Lightbulb } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

const quizIcons = [Zap, Clock, Brain, Star, Shield];

type Difficulty = 'basic' | 'medium' | 'hard';

interface Q { q: string; options: string[]; correct: number; difficulty: Difficulty; company?: string; explanation: string; }

const questionBank: Record<string, { iq: Q[]; eq: Q[]; rq: Q[] }> = {
  engineering: {
    iq: [
      { q: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correct: 1, difficulty: 'basic', explanation: 'Binary search divides the search space in half each time, so it takes log₂(n) steps to find the element.' },
      { q: 'Which data structure uses FIFO?', options: ['Stack', 'Queue', 'Tree', 'Graph'], correct: 1, difficulty: 'basic', explanation: 'Queue follows First-In-First-Out (FIFO) — the element added first is removed first, like a real queue.' },
      { q: 'What is 2^10?', options: ['512', '1024', '2048', '256'], correct: 1, difficulty: 'basic', explanation: '2^10 = 1024. This is a fundamental number in CS as 1 KB = 1024 bytes.' },
      { q: 'Which sorting algorithm has best average case?', options: ['Bubble Sort', 'Selection Sort', 'Merge Sort', 'Insertion Sort'], correct: 2, difficulty: 'medium', explanation: 'Merge Sort has O(n log n) average and worst case, making it consistently efficient. Bubble/Selection are O(n²).' },
      { q: 'A binary tree with n nodes has how many edges?', options: ['n', 'n-1', 'n+1', '2n'], correct: 1, difficulty: 'medium', explanation: 'Every node except the root has exactly one parent edge. So n nodes → n-1 edges.' },
      { q: 'What is the amortized time for dynamic array insertion?', options: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'], correct: 1, difficulty: 'hard', company: 'Google', explanation: 'Although occasional resizing costs O(n), spreading that cost across n insertions gives O(1) amortized per insertion.' },
      { q: 'Detect cycle in directed graph using?', options: ['BFS', 'DFS + coloring', 'Dijkstra', 'Union Find'], correct: 1, difficulty: 'hard', company: 'Amazon', explanation: 'DFS with 3-color marking (white/gray/black) detects back edges which indicate cycles in directed graphs.' },
      { q: 'LRU Cache uses which data structures?', options: ['Array + Stack', 'HashMap + DLL', 'Tree + Queue', 'Graph + Heap'], correct: 1, difficulty: 'hard', company: 'Microsoft', explanation: 'HashMap gives O(1) lookup, Doubly Linked List gives O(1) insertion/deletion at both ends — perfect for LRU eviction.' },
    ],
    eq: [
      { q: 'Your teammate pushes buggy code before a demo. You:', options: ['Fix it quietly', 'Call them out publicly', 'Report to manager', 'Discuss privately after'], correct: 3, difficulty: 'basic', explanation: 'Private discussion preserves dignity and builds trust. Public call-outs damage team morale and relationships.' },
      { q: "You disagree with the tech lead's architecture. You:", options: ['Just follow orders', 'Present data-backed alternative', 'Complain to others', 'Refuse to implement'], correct: 1, difficulty: 'medium', explanation: 'Presenting a data-backed alternative shows initiative and respect. It contributes to better decisions without being confrontational.' },
      { q: 'A junior dev is struggling. You:', options: ['Let them figure it out', 'Pair program with them', 'Do their work', 'Tell the manager'], correct: 1, difficulty: 'basic', explanation: 'Pair programming teaches them while solving the problem. It builds their skills without creating dependency.' },
      { q: 'Deadline is tomorrow but code has bugs. You:', options: ['Ship anyway', 'Ask for extension with clear reasoning', 'Pull all-nighter alone', 'Blame QA'], correct: 1, difficulty: 'medium', explanation: 'Communicating proactively with reasoning shows professionalism. Shipping buggy code or blaming others damages credibility.' },
      { q: 'You receive harsh code review feedback. You:', options: ['Get defensive', 'Ignore it', 'Learn from it and improve', 'Complain to HR'], correct: 2, difficulty: 'basic', explanation: 'Code reviews are learning opportunities. Taking feedback constructively accelerates growth and earns respect.' },
    ],
    rq: [
      { q: 'What does REST stand for?', options: ['Remote Execution Service Tool', 'Representational State Transfer', 'Reliable Server Technology', 'Resource Extraction Standard'], correct: 1, difficulty: 'basic', explanation: 'REST (Representational State Transfer) is an architectural style for APIs using standard HTTP methods (GET, POST, PUT, DELETE).' },
      { q: 'Which protocol does HTTPS use for encryption?', options: ['SSH', 'TLS/SSL', 'FTP', 'SMTP'], correct: 1, difficulty: 'basic', explanation: 'HTTPS uses TLS (Transport Layer Security) / SSL to encrypt data in transit, preventing man-in-the-middle attacks.' },
      { q: 'What is Docker primarily used for?', options: ['Version control', 'Containerization', 'Testing', 'Deployment only'], correct: 1, difficulty: 'medium', explanation: 'Docker packages applications with their dependencies into containers, ensuring consistent behavior across environments.' },
      { q: 'SQL JOIN that returns all rows from both tables?', options: ['INNER JOIN', 'LEFT JOIN', 'FULL OUTER JOIN', 'CROSS JOIN'], correct: 2, difficulty: 'medium', explanation: 'FULL OUTER JOIN returns all rows from both tables, with NULLs where there is no match on either side.' },
      { q: 'What is CI/CD?', options: ['Code Integration/Code Delivery', 'Continuous Integration/Continuous Delivery', 'Central Intelligence/Central Data', 'Code Inspection/Code Debug'], correct: 1, difficulty: 'basic', explanation: 'CI automatically tests code changes; CD automatically deploys them. Together they speed up reliable software delivery.' },
      { q: 'What is eventual consistency in distributed systems?', options: ['All nodes always in sync', 'Nodes may differ temporarily', 'Data never syncs', 'Only leader has data'], correct: 1, difficulty: 'hard', company: 'Amazon', explanation: 'In eventual consistency, replicas may be temporarily out of sync but will converge to the same state over time. Used in DynamoDB, Cassandra.' },
    ],
  },
  commerce: {
    iq: [
      { q: 'If a product costs ₹400 and sells for ₹500, profit % is?', options: ['20%', '25%', '30%', '15%'], correct: 1, difficulty: 'basic', explanation: 'Profit = ₹100. Profit % = (100/400) × 100 = 25%. Always calculate profit % on cost price, not selling price.' },
      { q: 'Simple Interest on ₹1000 at 10% for 2 years?', options: ['₹100', '₹200', '₹210', '₹150'], correct: 1, difficulty: 'basic', explanation: 'SI = P × R × T / 100 = 1000 × 10 × 2 / 100 = ₹200. Simple interest is calculated only on the principal.' },
      { q: 'A train 200m long crosses a pole in 10s. Speed?', options: ['20 m/s', '72 km/h', 'Both A and B', '36 km/h'], correct: 2, difficulty: 'medium', explanation: 'Speed = 200/10 = 20 m/s. Converting: 20 × 18/5 = 72 km/h. So both 20 m/s and 72 km/h are correct.' },
      { q: 'Average of first 10 natural numbers?', options: ['5', '5.5', '6', '4.5'], correct: 1, difficulty: 'basic', explanation: 'Sum of first n natural numbers = n(n+1)/2 = 55. Average = 55/10 = 5.5. Wait — the correct answer is 5.5!' },
      { q: 'If A:B = 2:3 and B:C = 4:5, then A:C = ?', options: ['8:15', '2:5', '4:5', '6:10'], correct: 0, difficulty: 'medium', explanation: 'Make B common: A:B = 8:12, B:C = 12:15. So A:C = 8:15. Multiply ratios to equalize the common term.' },
      { q: 'Compound interest on ₹10000 at 10% for 2 years?', options: ['₹2000', '₹2100', '₹2200', '₹1900'], correct: 1, difficulty: 'hard', company: 'SBI PO', explanation: 'CI = P[(1+R/100)^T - 1] = 10000[(1.1)² - 1] = 10000 × 0.21 = ₹2100. CI > SI because interest earns interest.' },
    ],
    eq: [
      { q: 'A customer is angry about a service delay. You:', options: ['Argue with them', 'Listen empathetically and resolve', 'Ignore them', 'Pass to someone else'], correct: 1, difficulty: 'basic', explanation: 'Active listening + empathy defuses anger. Acknowledging their frustration before solving shows customer-first approach.' },
      { q: 'You notice a colleague making accounting errors. You:', options: ['Report immediately to boss', 'Help them identify and fix', 'Ignore it', 'Tell other colleagues'], correct: 1, difficulty: 'medium', explanation: 'Helping them fix errors builds trust and prevents future mistakes. It shows leadership without creating conflict.' },
      { q: 'Your bank has a new policy you disagree with. You:', options: ['Refuse to follow', 'Follow and provide feedback through proper channel', 'Complain publicly', 'Quit'], correct: 1, difficulty: 'medium', explanation: 'Following while providing constructive feedback through proper channels shows professionalism and respect for hierarchy.' },
      { q: 'A senior gives you credit for their work. You:', options: ['Accept it', 'Clarify the truth respectfully', 'Tell everyone', 'Stay silent'], correct: 1, difficulty: 'basic', explanation: 'Honesty builds long-term credibility. Respectfully clarifying shows integrity — a key trait banks value.' },
      { q: 'You are overloaded with work before an exam. You:', options: ['Skip the exam', 'Prioritize and manage time', 'Do everything poorly', 'Blame your workload'], correct: 1, difficulty: 'basic', explanation: 'Time management and prioritization are essential banking skills. Create a schedule, delegate what you can.' },
    ],
    rq: [
      { q: 'What is the full form of NABARD?', options: ['National Bank for Agriculture and Rural Development', 'National Board of Agricultural Research', 'National Bureau of Audit and Revenue', 'None of these'], correct: 0, difficulty: 'basic', explanation: 'NABARD is the apex development bank for agriculture and rural development in India, established in 1982.' },
      { q: 'Current SLR requirement by RBI is approximately?', options: ['4%', '18%', '23%', '10%'], correct: 1, difficulty: 'medium', explanation: 'SLR (Statutory Liquidity Ratio) is ~18%. Banks must maintain this percentage of deposits in gold, cash, or government securities.' },
      { q: 'What is KYC?', options: ['Keep Your Cash', 'Know Your Customer', 'Key Yield Certificate', 'Knowledge Yearly Check'], correct: 1, difficulty: 'basic', explanation: 'KYC is a mandatory process to verify customer identity. It helps prevent money laundering and fraud in banking.' },
      { q: 'RTGS minimum transfer amount?', options: ['₹1 lakh', '₹2 lakh', '₹50,000', 'No minimum'], correct: 1, difficulty: 'medium', explanation: 'RTGS (Real Time Gross Settlement) has a minimum of ₹2 lakh. For smaller amounts, use NEFT or IMPS.' },
      { q: 'What is NPA in banking?', options: ['New Profit Account', 'Non-Performing Asset', 'National Payment Authority', 'Net Payable Amount'], correct: 1, difficulty: 'basic', explanation: 'NPA is a loan where principal/interest payment is overdue for 90+ days. High NPAs indicate poor asset quality.' },
    ],
  },
  arts: {
    iq: [
      { q: 'How many schedules are in the Indian Constitution?', options: ['8', '10', '12', '14'], correct: 2, difficulty: 'basic', explanation: 'The Indian Constitution has 12 Schedules covering topics from languages to anti-defection law.' },
      { q: 'The Tropic of Cancer passes through how many Indian states?', options: ['6', '7', '8', '9'], correct: 2, difficulty: 'medium', explanation: 'Tropic of Cancer passes through 8 states: Gujarat, Rajasthan, MP, Chhattisgarh, Jharkhand, WB, Tripura, Mizoram.' },
      { q: 'Who was the first President of India?', options: ['Jawaharlal Nehru', 'Rajendra Prasad', 'S. Radhakrishnan', 'Zakir Hussain'], correct: 1, difficulty: 'basic', explanation: 'Dr. Rajendra Prasad served as the first President of India from 1950-1962, the longest-serving President.' },
      { q: 'Article 21 of the Constitution deals with?', options: ['Right to Education', 'Right to Life and Liberty', 'Right to Equality', 'Right to Freedom of Speech'], correct: 1, difficulty: 'basic', explanation: 'Article 21 guarantees Right to Life and Personal Liberty. Through judicial interpretation, it includes right to livelihood, privacy, and dignity.' },
      { q: 'The Battle of Plassey was fought in which year?', options: ['1757', '1764', '1857', '1947'], correct: 0, difficulty: 'basic', explanation: 'Battle of Plassey (1757) was between Siraj-ud-Daulah and Robert Clive. It marked the beginning of British political control in India.' },
      { q: 'The concept of "Basic Structure" doctrine came from which case?', options: ['Golaknath', 'Kesavananda Bharati', 'Minerva Mills', 'Maneka Gandhi'], correct: 1, difficulty: 'hard', company: 'UPSC', explanation: 'Kesavananda Bharati v. State of Kerala (1973) established that Parliament cannot alter the basic structure of the Constitution.' },
    ],
    eq: [
      { q: 'As a district magistrate, a flood hits. First priority?', options: ['File report to HQ', 'Organize immediate rescue', 'Wait for orders', 'Call press conference'], correct: 1, difficulty: 'basic', explanation: 'Immediate rescue saves lives. Administrative reporting can follow. A good administrator acts first in emergencies.' },
      { q: 'A local politician pressures you to bend rules. You:', options: ['Comply to avoid conflict', 'Politely refuse citing rules', 'Report to media', 'Transfer the case'], correct: 1, difficulty: 'medium', explanation: 'Polite refusal citing rules shows firmness with diplomacy — essential for civil servants dealing with political pressure.' },
      { q: 'Two communities are in conflict in your district. You:', options: ['Support the majority', 'Impose curfew immediately', 'Initiate dialogue between leaders', 'Wait for state orders'], correct: 2, difficulty: 'hard', explanation: 'Dialogue is the first step in conflict resolution. Curfew should be the last resort. A good administrator facilitates peace.' },
      { q: 'A whistleblower reports corruption in your office. You:', options: ['Suppress it', 'Investigate independently', 'Transfer the whistleblower', 'Ignore it'], correct: 1, difficulty: 'medium', explanation: 'Independent investigation upholds integrity. Protecting whistleblowers and acting on complaints builds institutional trust.' },
      { q: 'You discover your senior officer is corrupt. You:', options: ['Join them', 'Document evidence and report', 'Ignore it', 'Resign'], correct: 1, difficulty: 'basic', explanation: 'Documenting evidence and reporting through proper channels (Lokpal, CVC) is the ethical and legal duty of a civil servant.' },
    ],
    rq: [
      { q: 'UPSC Prelims has how many papers?', options: ['1', '2', '3', '4'], correct: 1, difficulty: 'basic', explanation: 'UPSC Prelims has 2 papers: GS Paper I (qualifying + merit) and CSAT Paper II (qualifying only, 33% cutoff).' },
      { q: 'Ethics paper in UPSC Mains is which paper?', options: ['GS Paper I', 'GS Paper II', 'GS Paper III', 'GS Paper IV'], correct: 3, difficulty: 'medium', explanation: 'GS Paper IV covers Ethics, Integrity, and Aptitude. It includes case studies and tests moral reasoning.' },
      { q: 'Which amendment is called Mini Constitution?', options: ['42nd', '44th', '73rd', '86th'], correct: 0, difficulty: 'medium', explanation: '42nd Amendment (1976) is called Mini Constitution because it made the most comprehensive changes — added DPSP, duties, and changed Preamble.' },
      { q: 'Panchayati Raj was constitutionalized by which amendment?', options: ['42nd', '73rd', '74th', '86th'], correct: 1, difficulty: 'basic', explanation: '73rd Amendment (1992) added Part IX to the Constitution, giving constitutional status to Panchayati Raj institutions.' },
      { q: 'What is the age limit for UPSC Civil Services (General)?', options: ['30', '32', '35', '28'], correct: 1, difficulty: 'basic', explanation: 'General category: 32 years. OBC: 35 years. SC/ST: 37 years. Number of attempts also varies by category.' },
    ],
  },
};

type QuizPhase = 'select' | 'difficulty' | 'topic' | 'playing' | 'results';
type QuizSection = 'iq' | 'eq' | 'rq';

export default function Quizzes() {
  const { domain, boostRank, setQuizScores, language } = useStationStore();
  const config = domainConfig[domain];
  const isHi = language === 'hi';
  const [phase, setPhase] = useState<QuizPhase>('select');
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('basic');
  const [currentSection, setCurrentSection] = useState<QuizSection>('iq');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<QuizSection, number[]>>({ iq: [], eq: [], rq: [] });
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [scores, setScores] = useState({ iq: 0, eq: 0, rq: 0 });
  const [showExplanation, setShowExplanation] = useState(false);

  const questions = questionBank[domain] || questionBank.engineering;
  
  const filteredQuestions = {
    iq: questions.iq.filter(q => q.difficulty === selectedDifficulty || selectedDifficulty === 'hard'),
    eq: questions.eq.filter(q => q.difficulty === selectedDifficulty || q.difficulty === 'basic'),
    rq: questions.rq.filter(q => q.difficulty === selectedDifficulty || selectedDifficulty === 'hard'),
  };

  const sectionQuestions = filteredQuestions[currentSection].length >= 3 ? filteredQuestions[currentSection] : questions[currentSection].slice(0, 5);
  const currentQuestion = sectionQuestions[currentQ];
  const sectionLabels: Record<QuizSection, string> = { iq: isHi ? 'IQ — विश्लेषणात्मक' : 'IQ — Analytical', eq: isHi ? 'EQ — स्थितिजन्य' : 'EQ — Situational', rq: isHi ? 'RQ — डोमेन ज्ञान' : 'RQ — Domain Knowledge' };
  const sections: QuizSection[] = ['iq', 'eq', 'rq'];

  useEffect(() => {
    if (phase !== 'playing' || showFeedback) return;
    if (timeLeft <= 0) { handleAnswer(-1); return; }
    const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase, showFeedback]);

  const startQuiz = (quizType: string) => {
    setSelectedQuiz(quizType);
    setPhase('difficulty');
  };

  const selectDifficulty = (d: Difficulty) => {
    setSelectedDifficulty(d);
    setPhase('topic');
  };

  const startPlaying = (topic: string) => {
    setSelectedTopic(topic);
    setPhase('playing');
    setCurrentSection('iq');
    setCurrentQ(0);
    setAnswers({ iq: [], eq: [], rq: [] });
    setScores({ iq: 0, eq: 0, rq: 0 });
    setTimeLeft(selectedDifficulty === 'hard' ? 20 : selectedDifficulty === 'medium' ? 25 : 30);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setShowExplanation(false);
  };

  const proceedToNext = useCallback(() => {
    setShowExplanation(false);
    if (currentQ < sectionQuestions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setTimeLeft(selectedDifficulty === 'hard' ? 20 : selectedDifficulty === 'medium' ? 25 : 30);
    } else {
      const sIdx = sections.indexOf(currentSection);
      if (sIdx < 2) {
        setCurrentSection(sections[sIdx + 1]);
        setCurrentQ(0);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setTimeLeft(selectedDifficulty === 'hard' ? 20 : selectedDifficulty === 'medium' ? 25 : 30);
      } else {
        setPhase('results');
        boostRank(selectedDifficulty === 'hard' ? 25 : selectedDifficulty === 'medium' ? 15 : 10);
        setQuizScores(scores);
      }
    }
  }, [currentQ, currentSection, sectionQuestions.length, sections, boostRank, selectedDifficulty, scores, setQuizScores]);

  const handleAnswer = useCallback((ansIdx: number) => {
    if (showFeedback || !currentQuestion) return;
    setSelectedAnswer(ansIdx);
    setShowFeedback(true);
    setShowExplanation(true);
    const isCorrect = ansIdx === currentQuestion.correct;
    if (isCorrect) setScores(prev => ({ ...prev, [currentSection]: prev[currentSection] + 1 }));
    setAnswers(prev => ({ ...prev, [currentSection]: [...prev[currentSection], ansIdx] }));
  }, [showFeedback, currentQuestion, currentSection]);

  const totalQs = sectionQuestions.length * 3;
  const totalCorrect = scores.iq + scores.eq + scores.rq;
  const gScore = Math.round((scores.iq / Math.max(1, sectionQuestions.length)) * 100);
  const mScore = Math.round((scores.rq / Math.max(1, sectionQuestions.length)) * 100);
  const aScore = Math.round((scores.eq / Math.max(1, sectionQuestions.length)) * 100);

  const radarData = [
    { subject: 'IQ', A: gScore },
    { subject: 'RQ', A: mScore },
    { subject: 'EQ', A: aScore },
  ];

  if (phase === 'select') {
    return (
      <div className="max-w-4xl space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">{isHi ? 'क्विज़' : 'Quizzes'}</h1>
          <p className="text-sm text-muted-foreground">{isHi ? config.labelHi : config.label} — IQ + EQ + RQ</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {config.quizTypes.map((qt, i) => {
            const Icon = quizIcons[i % quizIcons.length];
            return (
              <button key={qt} onClick={() => startQuiz(qt)}
                className="bg-card rounded-2xl border border-border p-6 text-left hover:border-accent/50 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-3 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{qt}</h3>
                <p className="text-xs text-muted-foreground">3 sections · {isHi ? 'स्तर चुनें' : 'Choose level'}</p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (phase === 'difficulty') {
    return (
      <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
        <button onClick={() => setPhase('select')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> {isHi ? 'पीछे' : 'Back'}
        </button>
        <h2 className="text-xl font-bold text-center">{isHi ? 'स्तर चुनें' : 'Choose Difficulty'}</h2>
        <p className="text-sm text-muted-foreground text-center">{selectedQuiz}</p>
        <div className="grid gap-4">
          {[
            { d: 'basic' as Difficulty, label: isHi ? 'बेसिक' : 'Basic', desc: isHi ? '30 सेकंड प्रति प्रश्न · मूल बातें' : '30s per question · Fundamentals', color: 'text-accent' },
            { d: 'medium' as Difficulty, label: isHi ? 'मध्यम' : 'Medium', desc: isHi ? '25 सेकंड · गहरी समझ' : '25s per question · Deeper understanding', color: 'text-accent' },
            { d: 'hard' as Difficulty, label: isHi ? 'कठिन' : 'Hard', desc: isHi ? '20 सेकंड · कंपनी-विशिष्ट प्रश्न' : '20s per question · Company-specific questions', color: 'text-destructive' },
          ].map(item => (
            <button key={item.d} onClick={() => selectDifficulty(item.d)}
              className="p-5 rounded-2xl border border-border bg-card text-left hover:border-accent/50 hover:shadow-md transition-all">
              <p className={`font-bold text-lg ${item.color}`}>{item.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'topic') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setPhase('select')}>
        <div className="bg-card rounded-2xl p-8 shadow-2xl w-full max-w-md animate-fade-in" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">{isHi ? 'विषय चुनें' : 'Choose Topic'}</h3>
            <button onClick={() => setPhase('select')} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{selectedQuiz} · {selectedDifficulty.toUpperCase()}</p>
          <div className="grid grid-cols-2 gap-3">
            {config.quizPopupOptions.map((opt) => (
              <button key={opt} onClick={() => startPlaying(opt)}
                className="p-4 rounded-xl border border-border text-sm font-medium text-left transition-all hover:border-accent hover:bg-accent/5 hover:-translate-y-1 hover:shadow-md">
                <Brain className="w-4 h-4 text-accent mb-2" />
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Quiz playing with explanations
  if (phase === 'playing' && currentQuestion) {
    const totalQsPlayed = sections.indexOf(currentSection) * sectionQuestions.length + currentQ;
    const overallProgress = (totalQsPlayed / (sectionQuestions.length * 3)) * 100;
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{selectedQuiz} · {selectedDifficulty.toUpperCase()}</p>
            <h2 className="text-lg font-bold">{sectionLabels[currentSection]}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1 text-sm font-mono font-bold ${timeLeft <= 10 ? 'text-destructive' : 'text-accent'}`}>
              <Timer className="w-4 h-4" /> {timeLeft}s
            </div>
            <button onClick={() => setPhase('select')} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Q{totalQsPlayed + 1}</span>
            <span>{currentSection.toUpperCase()} {currentQ + 1}/{sectionQuestions.length}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${overallProgress}%` }} />
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          {currentQuestion.company && <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full mb-2 inline-block">{isHi ? 'कंपनी' : 'Asked at'}: {currentQuestion.company}</span>}
          <p className="font-medium mb-6">{currentQuestion.q}</p>
          <div className="space-y-3">
            {currentQuestion.options.map((opt, oi) => {
              let cls = 'border-border hover:border-accent/50';
              if (showFeedback) {
                if (oi === currentQuestion.correct) cls = 'border-accent bg-accent/10 text-accent';
                else if (oi === selectedAnswer && oi !== currentQuestion.correct) cls = 'border-destructive bg-destructive/10 text-destructive';
              }
              return (
                <button key={oi} onClick={() => !showFeedback && handleAnswer(oi)} disabled={showFeedback}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border text-sm text-left transition-all ${cls}`}>
                  <span className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {String.fromCharCode(65 + oi)}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {showFeedback && oi === currentQuestion.correct && <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />}
                  {showFeedback && oi === selectedAnswer && oi !== currentQuestion.correct && <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showExplanation && currentQuestion.explanation && (
            <div className="mt-4 p-4 rounded-xl bg-accent/5 border border-accent/20 animate-fade-in">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-accent mb-1">{isHi ? 'व्याख्या' : 'Explanation'}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{currentQuestion.explanation}</p>
                </div>
              </div>
              <button onClick={proceedToNext} className="mt-3 w-full py-2 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:scale-[1.01] transition-transform flex items-center justify-center gap-1">
                {isHi ? 'अगला प्रश्न' : 'Next Question'} <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {sections.map((s) => (
            <div key={s} className={`flex-1 p-3 rounded-xl text-center text-xs ${s === currentSection ? 'bg-accent/10 border border-accent/30' : 'bg-muted'}`}>
              <p className="font-bold">{s.toUpperCase()}</p>
              <p className="text-muted-foreground">{scores[s]}/{s === currentSection ? currentQ + (showFeedback ? 1 : 0) : (sections.indexOf(s) < sections.indexOf(currentSection) ? sectionQuestions.length : 0)}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Results
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">{isHi ? 'क्विज़ पूर्ण!' : 'Quiz Complete!'}</h1>
        <p className="text-muted-foreground">{selectedQuiz} · {selectedDifficulty.toUpperCase()}</p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 text-center">
        <p className="text-4xl font-bold text-accent mb-2">{totalCorrect}/{totalQs}</p>
        <p className="text-sm text-muted-foreground">{Math.round((totalCorrect / Math.max(1, totalQs)) * 100)}%</p>
        <p className="text-xs text-accent mt-2">{isHi ? `रैंक ${selectedDifficulty === 'hard' ? 25 : 10} पोजीशन बढ़ी!` : `Rank boosted by ${selectedDifficulty === 'hard' ? 25 : 10} positions!`}</p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold mb-4 text-center">GMA Report</h3>
        <ResponsiveContainer width="100%" height={250}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
            <Radar name="Score" dataKey="A" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.3} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { letter: 'G', label: 'IQ', score: gScore },
          { letter: 'M', label: 'RQ', score: mScore },
          { letter: 'A', label: 'EQ', score: aScore },
        ].map((g) => (
          <div key={g.letter} className="bg-card rounded-xl border border-border p-4 text-center">
            <span className="text-2xl font-bold text-accent">{g.letter}</span>
            <div className="h-2 bg-muted rounded-full overflow-hidden my-2">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${g.score}%` }} />
            </div>
            <p className="text-sm font-bold">{g.score}%</p>
            <p className="text-[10px] text-muted-foreground">{g.label}</p>
          </div>
        ))}
      </div>

      <button onClick={() => setPhase('select')} className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-medium hover-scale flex items-center justify-center gap-2">
        <ArrowRight className="w-4 h-4" /> {isHi ? 'और क्विज़ लें' : 'Take Another Quiz'}
      </button>
    </div>
  );
}
