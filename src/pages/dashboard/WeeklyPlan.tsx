import { useState } from 'react';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import { Clock, FileText, X, TrendingUp, AlertTriangle, Award, CheckCircle, BarChart3, MapPin, Video, ExternalLink, BookOpen, ChevronRight, Play, Brain, ArrowRight } from 'lucide-react';

export default function WeeklyPlan() {
  const { domain, user, completeTask, rank, totalStudents, language } = useStationStore();
  const config = domainConfig[domain];
  const isHi = language === 'hi';
  const [showReport, setShowReport] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number | null>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Set<string>>(new Set());

  const resources = config.weeklyResources as Record<string, { videos: string[]; pdfs: string[] }>;

  const steps = config.weeklyTopics.map((topic, i) => ({
    step: i + 1,
    topic,
    description: getStepDescription(domain, topic, user?.dreamCompany || config.companies[0]),
    time: `${2 + i} hours`,
    videos: resources[topic]?.videos || [],
    pdfs: resources[topic]?.pdfs || [],
    questions: getStepQuestions(domain, topic),
    quizzes: getStepQuizzes(domain, topic),
  }));

  const toggleStep = (i: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(i)) { next.delete(i); } else { next.add(i); completeTask(); }
      return next;
    });
  };

  const handleQuizAnswer = (stepIdx: number, quizIdx: number, ansIdx: number) => {
    const key = `${stepIdx}-${quizIdx}`;
    if (quizSubmitted.has(key)) return;
    setQuizAnswers(prev => ({ ...prev, [key]: ansIdx }));
    setQuizSubmitted(prev => new Set(prev).add(key));
  };

  const totalCompleted = completedSteps.size;
  const overallProgress = Math.round((totalCompleted / steps.length) * 100);
  const pct = Math.round(((totalStudents - rank) / totalStudents) * 100);

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{isHi ? 'रोडमैप' : 'Roadmap'}</h1>
          <p className="text-sm text-muted-foreground">{isHi ? 'आपकी व्यक्तिगत तैयारी योजना' : 'Your personalized preparation plan'}</p>
        </div>
        <button onClick={() => setShowReport(true)} className="px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-medium hover:scale-105 transition-transform flex items-center gap-2">
          <FileText className="w-4 h-4" /> {isHi ? 'रिपोर्ट' : 'Report'}
        </button>
      </div>

      {/* Progress bar */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">{totalCompleted}/{steps.length} {isHi ? 'स्टेप पूर्ण' : 'steps completed'}</p>
          <p className="text-sm font-bold text-accent">{overallProgress}%</p>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${overallProgress}%` }} />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, i) => {
          const done = completedSteps.has(i);
          const expanded = expandedStep === i;
          const isQuizActive = activeQuiz === i;
          return (
            <div key={i} className="relative">
              {i < steps.length - 1 && (
                <div className={`absolute left-5 top-16 w-0.5 h-[calc(100%-2rem)] ${done ? 'bg-accent' : 'bg-border'}`} />
              )}
              <div className={`bg-card rounded-2xl border transition-all ${done ? 'border-accent/40' : 'border-border'} overflow-hidden`}>
                <div className="flex items-start gap-4 p-5">
                  <button onClick={() => toggleStep(i)}
                    className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm transition-all ${
                      done ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground border-2 border-border'
                    }`}>
                    {done ? <CheckCircle className="w-5 h-5" /> : step.step}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-accent font-bold">Step {step.step}</span>
                        <h3 className={`font-bold text-base mt-0.5 ${done ? 'line-through text-muted-foreground' : ''}`}>{step.topic}</h3>
                      </div>
                      <button onClick={() => setExpandedStep(expanded ? null : i)}
                        className="px-4 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-medium hover:scale-105 transition-transform flex items-center gap-1 flex-shrink-0">
                        {isHi ? 'सीखना शुरू करें' : 'Start Learning'} <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Est. {step.time}</span>
                      <span className="text-xs text-accent flex items-center gap-1"><Brain className="w-3 h-3" /> {step.quizzes.length} {isHi ? 'क्विज़' : 'quizzes'}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{step.description}</p>

                    {/* Resource links */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {step.videos.slice(0, 2).map((url, vi) => (
                        <a key={vi} href={url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 text-xs hover:bg-accent/10 transition-colors">
                          <Play className="w-3 h-3 text-accent" /> Video {vi + 1} <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                      {step.pdfs.slice(0, 1).map((pdf, pi) => (
                        <span key={pi} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 text-xs">
                          <BookOpen className="w-3 h-3 text-accent" /> {pdf}
                        </span>
                      ))}
                      <button onClick={() => setActiveQuiz(isQuizActive ? null : i)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-medium hover:bg-accent/20 transition-colors">
                        <Brain className="w-3 h-3" /> {isHi ? 'क्विज़ लें' : 'Take Quiz'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded content */}
                {expanded && (
                  <div className="px-5 pb-5 pt-0 border-t border-border mt-0 animate-fade-in">
                    <div className="ml-14 space-y-4 pt-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-accent mb-2">{isHi ? 'अभ्यास प्रश्न' : 'Practice Questions'}</p>
                        <div className="space-y-2">
                          {step.questions.map((q, qi) => (
                            <div key={qi} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/30 text-xs">
                              <span className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-[10px] flex-shrink-0">{qi + 1}</span>
                              <span>{q}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {step.videos.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-accent mb-2">{isHi ? 'वीडियो' : 'Videos'}</p>
                          <div className="grid gap-2">
                            {step.videos.map((url, vi) => {
                              const videoId = extractYouTubeId(url);
                              return videoId ? (
                                <div key={vi} className="rounded-xl overflow-hidden aspect-video bg-muted">
                                  <iframe src={`https://www.youtube.com/embed/${videoId}`} title={`${step.topic} Video ${vi + 1}`}
                                    className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                                </div>
                              ) : (
                                <a key={vi} href={url} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-accent/10 transition-all">
                                  <Video className="w-5 h-5 text-accent" />
                                  <span className="text-xs">{isHi ? 'वीडियो' : 'Watch Video'} {vi + 1}</span>
                                  <ExternalLink className="w-3 h-3 ml-auto" />
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Quiz section */}
                {isQuizActive && (
                  <div className="px-5 pb-5 border-t border-border animate-fade-in">
                    <div className="ml-14 pt-4 space-y-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-accent flex items-center gap-2">
                        <Brain className="w-3 h-3" /> {isHi ? `${step.topic} — क्विज़` : `${step.topic} — Quiz`}
                      </p>
                      {step.quizzes.map((quiz, qi) => {
                        const key = `${i}-${qi}`;
                        const answered = quizSubmitted.has(key);
                        const selected = quizAnswers[key];
                        return (
                          <div key={qi} className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
                            <p className="text-sm font-medium">{qi + 1}. {quiz.question}</p>
                            <div className="grid grid-cols-2 gap-2">
                              {quiz.options.map((opt, oi) => {
                                let cls = 'border-border hover:border-accent/50';
                                if (answered) {
                                  if (oi === quiz.correct) cls = 'border-accent bg-accent/10 text-accent';
                                  else if (oi === selected) cls = 'border-destructive bg-destructive/10 text-destructive';
                                }
                                return (
                                  <button key={oi} onClick={() => handleQuizAnswer(i, qi, oi)}
                                    disabled={answered}
                                    className={`text-xs py-2.5 px-3 rounded-xl border transition-all text-left ${cls} disabled:cursor-default`}>
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                            {answered && (
                              <div className={`text-xs p-2 rounded-lg ${selected === quiz.correct ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'}`}>
                                {selected === quiz.correct ? (isHi ? '✅ सही!' : '✅ Correct!') : (isHi ? '❌ गलत।' : '❌ Wrong.')} {quiz.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      <p className="text-xs text-muted-foreground text-center">
                        {step.quizzes.filter((_, qi) => quizSubmitted.has(`${i}-${qi}`)).length}/{step.quizzes.length} {isHi ? 'उत्तर दिए' : 'answered'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setShowReport(false)}>
          <div className="bg-card rounded-2xl p-6 shadow-2xl w-full max-w-lg animate-fade-in max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold">{isHi ? 'साप्ताहिक प्रदर्शन' : 'Weekly Performance'}</h3>
              <button onClick={() => setShowReport(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="text-center p-4 rounded-xl border border-border mb-4">
              <p className="text-4xl font-bold text-accent">{overallProgress}%</p>
              <p className="text-xs text-muted-foreground mt-1">{totalCompleted}/{steps.length} {isHi ? 'स्टेप पूर्ण' : 'steps completed'}</p>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                <BarChart3 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <p className="font-medium">Top {pct}% in {user?.city || 'your area'}</p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-destructive/5 border border-destructive/20">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{isHi ? 'बाकी स्टेप' : 'Complete remaining steps'}</p>
                  <p className="text-xs text-muted-foreground">{steps.length - totalCompleted} {isHi ? 'बाकी' : 'remaining'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function getStepDescription(domain: string, topic: string, company: string): string {
  const descs: Record<string, Record<string, string>> = {
    engineering: {
      'Arrays & Hashing': `Master array manipulation and hash map patterns. ${company} heavily tests these in online assessments.`,
      'Trees & Graphs': `Build strong fundamentals in tree traversals and graph algorithms for ${company}.`,
      'Dynamic Programming': `Learn DP patterns — knapsack, LCS, matrix chain. ${company} asks medium-hard DP problems.`,
      'System Design Basics': `Understand scalability, load balancing, caching for ${company} senior rounds.`,
      'SQL & DBMS': `Master SQL queries, normalization, ACID properties for ${company} technical interviews.`,
      'OS Concepts': `Study processes, threads, memory management for ${company} CS fundamentals.`,
      'Mock Interview': `Full mock interviews simulating ${company}'s actual format.`,
    },
    commerce: {
      'Number System': `Master number system shortcuts for ${company} quantitative aptitude.`,
      'Profit & Loss': `Learn all P&L formulas, partnerships for ${company} exams.`,
      'Data Interpretation': `Practice reading charts and graphs for ${company} DI section.`,
      'Syllogisms': `Learn Venn diagram method for ${company} reasoning section.`,
      'Banking GK': `Study banking policies and RBI guidelines for ${company}.`,
      'English Grammar': `Focus on error spotting and reading comprehension for ${company}.`,
      'Mock Test': `Full-length mock tests simulating ${company}'s exam pattern.`,
    },
    arts: {
      'Ancient India': `Study Indus Valley, Vedic period, Mauryas, and Guptas for UPSC History.`,
      'Indian Polity': `Master constitutional framework and amendments from Laxmikanth.`,
      'Physical Geography': `Study geomorphology, climatology for Prelims and Mains.`,
      'Indian Economy': `Understand fiscal policy, monetary policy for UPSC.`,
      'Ethics Case Studies': `Practice ethical dilemma case studies with proper framework.`,
      'Current Affairs': `Review last 6 months of national and international events.`,
      'Answer Writing': `Practice structured answer writing format.`,
    },
  };
  return descs[domain]?.[topic] || `Focus on mastering ${topic} for your preparation.`;
}

function getStepQuestions(domain: string, topic: string): string[] {
  const qs: Record<string, Record<string, string[]>> = {
    engineering: {
      'Arrays & Hashing': ['Two Sum problem', 'Find duplicates', 'Longest consecutive sequence', 'Group anagrams'],
      'Trees & Graphs': ['Level order traversal', 'Validate BST', 'Number of islands', 'Dijkstra shortest path'],
      'Dynamic Programming': ['Climbing stairs', 'LCS', '0/1 Knapsack', 'Edit distance'],
      'System Design Basics': ['Design URL shortener', 'Design chat system', 'Design rate limiter'],
      'SQL & DBMS': ['Write JOIN queries', 'Explain normalization', 'ACID with examples'],
      'OS Concepts': ['Deadlock conditions', 'Page replacement', 'Process vs Thread'],
      'Mock Interview': ['Introduce yourself', 'Solve DSA problem', 'Explain a project'],
    },
    commerce: {
      'Number System': ['HCF/LCM of 3 numbers', 'Remainder theorem', 'Unit digit problems'],
      'Profit & Loss': ['Successive discounts', 'Partnership ratios', 'Marked price questions'],
      'Data Interpretation': ['Bar graph analysis', 'Pie chart calculations', 'Table-based questions'],
      'Syllogisms': ['All-Some-No combinations', 'Either-Or conclusions', 'Complementary pairs'],
      'Banking GK': ['Current repo rate', 'RBI governor functions', 'Recent mergers'],
      'English Grammar': ['Subject-verb agreement', 'Error detection', 'Para jumbles'],
      'Mock Test': ['Full prelims mock', 'Sectional time management', 'Accuracy analysis'],
    },
    arts: {
      'Ancient India': ['Harappan trade routes', 'Ashoka\'s dhamma', 'Gupta contributions'],
      'Indian Polity': ['Fundamental Rights vs DPSP', 'Amendment procedures', 'Federal structure'],
      'Physical Geography': ['Plate tectonics', 'Indian monsoon', 'Ocean currents'],
      'Indian Economy': ['GDP vs GNP', 'Fiscal deficit', 'Monetary policy tools'],
      'Ethics Case Studies': ['Conflict of interest', 'Whistleblower dilemma', 'Public duty vs personal'],
      'Current Affairs': ['Supreme Court verdicts', 'International summits', 'Government schemes'],
      'Answer Writing': ['150-word answer structure', 'Diagram integration', 'Conclusion writing'],
    },
  };
  return qs[domain]?.[topic] || ['Practice fundamentals', 'Solve 5 problems', 'Review key concepts'];
}

interface Quiz {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

function getStepQuizzes(domain: string, topic: string): Quiz[] {
  const quizzes: Record<string, Record<string, Quiz[]>> = {
    engineering: {
      'Arrays & Hashing': [
        { question: 'What is the time complexity of searching in a hash map?', options: ['O(n)', 'O(1) average', 'O(log n)', 'O(n²)'], correct: 1, explanation: 'Hash maps provide O(1) average time for search operations.' },
        { question: 'Which technique solves "Two Sum" most efficiently?', options: ['Brute force', 'Hash map', 'Sorting', 'Binary search'], correct: 1, explanation: 'Hash map allows single-pass O(n) solution for Two Sum.' },
        { question: 'What happens when two keys hash to the same index?', options: ['Error', 'Overwrite', 'Collision', 'Skip'], correct: 2, explanation: 'A collision occurs and is handled via chaining or open addressing.' },
        { question: 'Sliding window technique is best for:', options: ['Sorting arrays', 'Finding subarrays with constraints', 'Binary search', 'Graph traversal'], correct: 1, explanation: 'Sliding window efficiently finds subarrays meeting given constraints.' },
        { question: 'Two-pointer technique requires the array to be:', options: ['Unsorted', 'Sorted', 'Of even length', 'Non-negative'], correct: 1, explanation: 'Two-pointer technique typically works on sorted arrays.' },
      ],
      'Trees & Graphs': [
        { question: 'How many children can a binary tree node have at most?', options: ['1', '2', '3', 'Unlimited'], correct: 1, explanation: 'Binary tree nodes have at most 2 children (left and right).' },
        { question: 'BFS uses which data structure?', options: ['Stack', 'Queue', 'Heap', 'Array'], correct: 1, explanation: 'BFS uses a queue to explore nodes level by level.' },
        { question: 'DFS uses which data structure?', options: ['Queue', 'Stack', 'Hash map', 'Linked list'], correct: 1, explanation: 'DFS uses a stack (or recursion) to explore depth-first.' },
        { question: 'In-order traversal of BST gives:', options: ['Random order', 'Sorted order', 'Reverse order', 'Level order'], correct: 1, explanation: 'In-order traversal of BST gives elements in sorted order.' },
      ],
      'Dynamic Programming': [
        { question: 'DP is mainly used for problems with:', options: ['Random access', 'Overlapping subproblems', 'Constant space', 'No recursion'], correct: 1, explanation: 'DP optimizes problems with overlapping subproblems and optimal substructure.' },
        { question: 'Memoization is a _____ approach.', options: ['Bottom-up', 'Top-down', 'Greedy', 'Divide and conquer'], correct: 1, explanation: 'Memoization is top-down — solving from the main problem downward.' },
        { question: 'Tabulation is a _____ approach.', options: ['Top-down', 'Bottom-up', 'Recursive', 'Random'], correct: 1, explanation: 'Tabulation builds the solution bottom-up from base cases.' },
        { question: 'Fibonacci using DP has time complexity:', options: ['O(2^n)', 'O(n)', 'O(n²)', 'O(log n)'], correct: 1, explanation: 'DP reduces Fibonacci from O(2^n) to O(n) by storing computed results.' },
      ],
      'System Design Basics': [
        { question: 'What distributes traffic across servers?', options: ['Cache', 'Load balancer', 'CDN', 'Database'], correct: 1, explanation: 'Load balancers distribute incoming requests across multiple servers.' },
        { question: 'CDN is used to:', options: ['Store databases', 'Serve static content faster', 'Handle authentication', 'Process payments'], correct: 1, explanation: 'CDNs cache and serve static content from geographically close servers.' },
        { question: 'Horizontal scaling means:', options: ['Bigger server', 'More servers', 'Faster CPU', 'More RAM'], correct: 1, explanation: 'Horizontal scaling adds more machines to handle increased load.' },
        { question: 'SQL databases are:', options: ['Schema-less', 'Relational', 'Document-based', 'Key-value only'], correct: 1, explanation: 'SQL databases are relational with predefined schemas.' },
      ],
      'SQL & DBMS': [
        { question: 'Which normal form removes partial dependencies?', options: ['1NF', '2NF', '3NF', 'BCNF'], correct: 1, explanation: '2NF eliminates partial dependencies on composite primary keys.' },
        { question: 'ACID stands for:', options: ['Atomic, Consistent, Isolated, Durable', 'Available, Consistent, Independent, Distributed', 'Atomic, Cached, Isolated, Dynamic', 'None'], correct: 0, explanation: 'ACID: Atomicity, Consistency, Isolation, Durability — key DB properties.' },
        { question: 'JOIN combines rows from:', options: ['Same table', 'Multiple tables', 'Views only', 'Indexes'], correct: 1, explanation: 'JOIN combines rows from two or more tables based on related columns.' },
        { question: 'PRIMARY KEY is:', options: ['Nullable', 'Unique and not null', 'Always auto-increment', 'Optional'], correct: 1, explanation: 'Primary key uniquely identifies each row and cannot be null.' },
      ],
      'OS Concepts': [
        { question: 'Deadlock requires how many conditions simultaneously?', options: ['2', '3', '4', '5'], correct: 2, explanation: '4 conditions: mutual exclusion, hold & wait, no preemption, circular wait.' },
        { question: 'Virtual memory uses:', options: ['RAM only', 'Disk as extended RAM', 'Cache only', 'Registers'], correct: 1, explanation: 'Virtual memory uses disk space to extend available RAM.' },
        { question: 'Thread vs Process — threads share:', options: ['Nothing', 'Memory space', 'PID', 'CPU'], correct: 1, explanation: 'Threads within a process share the same memory space.' },
        { question: 'Which is NOT a page replacement algorithm?', options: ['FIFO', 'LRU', 'Optimal', 'Round Robin'], correct: 3, explanation: 'Round Robin is a CPU scheduling algorithm, not page replacement.' },
      ],
      'Mock Interview': [
        { question: 'Self-introduction should be:', options: ['5+ minutes', '1-2 minutes', '30 seconds', '10 minutes'], correct: 1, explanation: 'Keep self-introduction concise: 1-2 minutes covering key highlights.' },
        { question: 'When stuck on a problem, you should:', options: ['Stay silent', 'Think aloud', 'Give up', 'Change topic'], correct: 1, explanation: 'Thinking aloud shows your problem-solving approach to the interviewer.' },
        { question: 'STAR method is for:', options: ['Technical questions', 'Behavioral questions', 'Coding', 'Salary negotiation'], correct: 1, explanation: 'STAR (Situation, Task, Action, Result) structures behavioral answers.' },
        { question: 'Best way to end an interview:', options: ['Leave quickly', 'Ask a thoughtful question', 'Ask about salary', 'Complain about difficulty'], correct: 1, explanation: 'Asking a thoughtful question shows genuine interest in the role.' },
      ],
    },
    commerce: {
      'Number System': [
        { question: 'LCM of 12 and 18 is:', options: ['24', '36', '6', '72'], correct: 1, explanation: 'LCM(12,18) = 36. Prime factorization: 2²×3² = 36.' },
        { question: 'The unit digit of 7^4 is:', options: ['7', '9', '3', '1'], correct: 3, explanation: '7^1=7, 7^2=49, 7^3=343, 7^4=2401. Unit digit cycles: 7,9,3,1.' },
        { question: 'HCF of 24 and 36 is:', options: ['6', '12', '24', '4'], correct: 1, explanation: 'HCF(24,36) = 12. Largest number dividing both.' },
        { question: 'If n is odd, n²-1 is divisible by:', options: ['4', '6', '8', '12'], correct: 2, explanation: 'For odd n: n²-1 = (n-1)(n+1). Both are even, one divisible by 4, so product divisible by 8.' },
      ],
      'Profit & Loss': [
        { question: 'CP=₹400, SP=₹500. Profit %?', options: ['20%', '25%', '30%', '15%'], correct: 1, explanation: 'Profit = 100. Profit% = (100/400)×100 = 25%' },
        { question: 'Successive discounts of 10% and 20% equal:', options: ['30%', '28%', '25%', '32%'], correct: 1, explanation: 'Net = 100 - (10+20-10×20/100) = 100-28 = 72. So 28% discount.' },
        { question: 'If selling 12 items at cost of 15, profit% is:', options: ['20%', '25%', '15%', '30%'], correct: 1, explanation: 'Profit = (15-12)/12 × 100 = 25%' },
        { question: 'Break-even point means:', options: ['Maximum profit', 'No profit no loss', 'Maximum loss', 'Minimum cost'], correct: 1, explanation: 'Break-even is when total revenue equals total cost.' },
      ],
      'Data Interpretation': [
        { question: 'In a pie chart, 90° represents what fraction?', options: ['1/2', '1/3', '1/4', '1/6'], correct: 2, explanation: '90/360 = 1/4 of the total.' },
        { question: 'CAGR stands for:', options: ['Compound Annual Growth Rate', 'Current Annual Gain Ratio', 'Combined Asset Growth Rate', 'Central Average Growth Rate'], correct: 0, explanation: 'CAGR measures mean annual growth rate over a period.' },
        { question: 'Best chart for showing trends over time:', options: ['Pie chart', 'Bar chart', 'Line graph', 'Table'], correct: 2, explanation: 'Line graphs best show trends and changes over time periods.' },
        { question: 'If data shows 20% of 500, the value is:', options: ['80', '100', '120', '150'], correct: 1, explanation: '20% of 500 = 0.20 × 500 = 100.' },
      ],
      'Syllogisms': [
        { question: '"All A are B, All B are C" means:', options: ['All A are C', 'Some C are A', 'Both', 'Neither'], correct: 2, explanation: 'Both conclusions follow: All A are C (definite) and Some C are A (converse).' },
        { question: '"Some A are B" means:', options: ['All A are B', 'At least one A is B', 'No A is B', 'All B are A'], correct: 1, explanation: '"Some" means at least one element is shared.' },
        { question: 'If "No X is Y" then:', options: ['Some X are Y', 'No Y is X', 'All X are Y', 'Some Y are X'], correct: 1, explanation: '"No X is Y" is reversible: No Y is X.' },
        { question: 'Complementary pair occurs when:', options: ['Both true', 'Both false', 'One must be true', 'Neither true nor false'], correct: 2, explanation: 'In a complementary pair, exactly one statement must be true.' },
      ],
      'Banking GK': [
        { question: 'RBI was established in:', options: ['1930', '1935', '1947', '1950'], correct: 1, explanation: 'RBI was established on April 1, 1935 based on RBI Act, 1934.' },
        { question: 'SLR stands for:', options: ['Standard Lending Rate', 'Statutory Liquidity Ratio', 'Standard Loan Ratio', 'Scheduled Lending Rate'], correct: 1, explanation: 'SLR is the percentage of deposits banks must maintain in liquid assets.' },
        { question: 'NEFT operates:', options: ['24x7 since 2019', 'Only weekdays', 'Only business hours', 'Monthly'], correct: 0, explanation: 'NEFT became 24x7 from December 16, 2019.' },
        { question: 'KYC stands for:', options: ['Keep Your Cash', 'Know Your Customer', 'Key Yield Certificate', 'Know Your Credit'], correct: 1, explanation: 'KYC (Know Your Customer) is mandatory identity verification for banking.' },
      ],
      'English Grammar': [
        { question: '"Neither...nor" takes which verb form?', options: ['Plural always', 'Singular always', 'Agrees with nearer subject', 'Either'], correct: 2, explanation: 'With neither...nor, the verb agrees with the subject nearest to it.' },
        { question: '"Each" takes:', options: ['Plural verb', 'Singular verb', 'No verb', 'Either'], correct: 1, explanation: '"Each" is always followed by a singular verb.' },
        { question: 'Active to passive of "She writes a letter":', options: ['A letter is wrote by her', 'A letter is written by her', 'A letter was written by her', 'A letter has been written by her'], correct: 1, explanation: 'Present simple active → "is + past participle + by" in passive.' },
        { question: 'Identify the error: "He don\'t know":', options: ['He', 'don\'t', 'know', 'No error'], correct: 1, explanation: 'Correct: "He doesn\'t know." Third person singular uses "doesn\'t."' },
      ],
      'Mock Test': [
        { question: 'SBI PO Prelims has how many sections?', options: ['2', '3', '4', '5'], correct: 1, explanation: 'SBI PO Prelims has 3 sections: English, Quantitative, Reasoning.' },
        { question: 'Best strategy for mock tests:', options: ['Attempt all', 'Focus on accuracy', 'Skip reasoning', 'Guess everything'], correct: 1, explanation: 'Accuracy is key due to negative marking in banking exams.' },
        { question: 'Negative marking in IBPS is usually:', options: ['0.25 marks', '0.5 marks', '1 mark', 'No negative'], correct: 0, explanation: 'IBPS exams typically deduct 0.25 marks for wrong answers.' },
        { question: 'Time management tip for DI section:', options: ['Solve all questions', 'Pick easy sets first', 'Leave for last', 'Skip entirely'], correct: 1, explanation: 'Pick easier DI sets first to maximize marks within time.' },
      ],
    },
    arts: {
      'Ancient India': [
        { question: 'Indus Valley Civilization was discovered in:', options: ['1921', '1935', '1947', '1905'], correct: 0, explanation: 'Harappa was discovered in 1921 by Daya Ram Sahni.' },
        { question: 'Ashoka\'s Dhamma promoted:', options: ['Caste system', 'Non-violence and tolerance', 'Military expansion', 'Trade restrictions'], correct: 1, explanation: 'Ashoka\'s Dhamma emphasized non-violence, tolerance, and moral conduct.' },
        { question: 'Gupta period is known as:', options: ['Iron Age', 'Golden Age', 'Dark Age', 'Silver Age'], correct: 1, explanation: 'Gupta period (320-550 CE) is called the Golden Age of Indian culture.' },
        { question: 'Vedic literature includes:', options: ['Arthashastra', 'Rigveda, Samaveda, Yajurveda, Atharvaveda', 'Mahabharata only', 'Buddhist texts'], correct: 1, explanation: 'The four Vedas are the foundational Vedic literature.' },
      ],
      'Indian Polity': [
        { question: 'How many Fundamental Rights are in the Constitution?', options: ['5', '6', '7', '8'], correct: 1, explanation: '6 Fundamental Rights (Right to Property was removed by 44th Amendment).' },
        { question: 'Article 21 deals with:', options: ['Right to Equality', 'Right to Life and Liberty', 'Right to Education', 'Right to Freedom of Religion'], correct: 1, explanation: 'Article 21 guarantees Right to Life and Personal Liberty.' },
        { question: 'Constitutional amendment requires:', options: ['Simple majority', 'Special majority', 'Either depending on type', 'Unanimous vote'], correct: 2, explanation: 'Some amendments need simple majority, others need special majority.' },
        { question: 'DPSP are:', options: ['Enforceable in court', 'Not enforceable in court', 'Same as Fundamental Rights', 'Part of Preamble'], correct: 1, explanation: 'Directive Principles are not justiciable but fundamental in governance.' },
      ],
      'Physical Geography': [
        { question: 'Which theory explains continental drift?', options: ['Big Bang', 'Plate Tectonics', 'Evolution', 'Relativity'], correct: 1, explanation: 'Plate Tectonics theory explains how continents move on tectonic plates.' },
        { question: 'Indian monsoon is caused by:', options: ['Earthquakes', 'Differential heating of land and sea', 'Moon\'s gravity', 'Volcanic activity'], correct: 1, explanation: 'Monsoon is caused by differential heating creating pressure differences.' },
        { question: 'Highest peak in India:', options: ['K2', 'Kanchenjunga', 'Nanda Devi', 'Mount Everest'], correct: 1, explanation: 'Kanchenjunga (8,586m) is the highest peak entirely within India.' },
        { question: 'Western Ghats are also called:', options: ['Sahyadri', 'Vindhyas', 'Aravallis', 'Satpura'], correct: 0, explanation: 'Western Ghats are locally known as Sahyadri mountains.' },
      ],
      'Indian Economy': [
        { question: 'GDP measures:', options: ['Population', 'Total goods & services produced', 'Government spending only', 'Exports only'], correct: 1, explanation: 'GDP measures the total value of goods and services produced in a country.' },
        { question: 'Repo rate is set by:', options: ['SEBI', 'RBI', 'Finance Ministry', 'NITI Aayog'], correct: 1, explanation: 'RBI sets the repo rate as part of monetary policy.' },
        { question: 'Fiscal deficit means:', options: ['Excess exports', 'Government spending exceeds revenue', 'Trade surplus', 'Current account surplus'], correct: 1, explanation: 'Fiscal deficit is the gap between government expenditure and revenue.' },
        { question: 'GST was implemented in:', options: ['2015', '2016', '2017', '2018'], correct: 2, explanation: 'GST was implemented on July 1, 2017 under the 101st Amendment.' },
      ],
      'Ethics Case Studies': [
        { question: 'Ethical dilemma involves:', options: ['Easy choices', 'Conflicting moral principles', 'No consequences', 'Legal issues only'], correct: 1, explanation: 'Ethical dilemmas involve situations where moral principles conflict.' },
        { question: 'Integrity in civil service means:', options: ['Following orders blindly', 'Consistency between words and actions', 'Being popular', 'Avoiding responsibility'], correct: 1, explanation: 'Integrity is alignment between one\'s values, words, and actions.' },
        { question: 'A whistleblower should be protected because:', options: ['They cause trouble', 'They expose wrongdoing', 'They are always right', 'They have connections'], correct: 1, explanation: 'Whistleblowers expose corruption/wrongdoing, serving public interest.' },
        { question: 'Emotional intelligence helps in:', options: ['Avoiding people', 'Managing emotions and relationships', 'Getting promotions', 'Physical fitness'], correct: 1, explanation: 'EI helps understand and manage emotions for better decision-making.' },
      ],
      'Current Affairs': [
        { question: 'UPSC current affairs should cover:', options: ['Last week only', 'Last 6-12 months', 'Last 5 years', 'Only international'], correct: 1, explanation: 'Focus on last 6-12 months for Prelims and Mains current affairs.' },
        { question: 'Best source for UPSC current affairs:', options: ['Social media', 'The Hindu/Indian Express + PIB', 'Textbooks only', 'Movies'], correct: 1, explanation: 'Quality newspapers and PIB are most reliable for UPSC current affairs.' },
        { question: 'Government schemes are important for:', options: ['Prelims only', 'Mains only', 'Both Prelims and Mains', 'Neither'], correct: 2, explanation: 'Government schemes are tested in both Prelims and Mains.' },
        { question: 'International relations for UPSC requires:', options: ['Memorizing dates', 'Understanding India\'s foreign policy', 'Learning all countries\' capitals', 'Only UN topics'], correct: 1, explanation: 'Focus on India\'s bilateral relations and foreign policy principles.' },
      ],
      'Answer Writing': [
        { question: 'Ideal UPSC Mains answer should have:', options: ['Only introduction', 'Intro + Body + Conclusion', 'Bullet points only', 'One paragraph'], correct: 1, explanation: 'Structured answers with intro, body, and conclusion score better.' },
        { question: 'Word limit for a 10-mark question is usually:', options: ['100 words', '150 words', '200 words', '500 words'], correct: 1, explanation: '150 words is the standard for 10-mark UPSC questions.' },
        { question: 'Diagrams in answers are:', options: ['Not allowed', 'Optional but helpful', 'Mandatory', 'Only for geography'], correct: 1, explanation: 'Diagrams are optional but can significantly enhance your answer.' },
        { question: 'Best approach for opinion-based questions:', options: ['Give one-sided view', 'Present multiple perspectives + your view', 'Skip them', 'Copy textbook answers'], correct: 1, explanation: 'Present balanced views and then share your reasoned opinion.' },
      ],
    },
  };
  return quizzes[domain]?.[topic] || [
    { question: `What is the most important concept in ${topic}?`, options: ['Concept A', 'Concept B', 'Concept C', 'All of the above'], correct: 3, explanation: 'All concepts in this topic are interconnected and important.' },
    { question: `How would you apply ${topic} in practice?`, options: ['Theory only', 'Practice regularly', 'Skip it', 'Memorize'], correct: 1, explanation: 'Regular practice is the best way to master any topic.' },
    { question: `${topic} is important because:`, options: ['Easy marks', 'Fundamental knowledge', 'Not important', 'Only for interviews'], correct: 1, explanation: 'This topic provides fundamental knowledge crucial for your preparation.' },
    { question: `Best resource for ${topic}:`, options: ['Random websites', 'Standard textbooks + practice', 'Social media', 'Movies'], correct: 1, explanation: 'Standard textbooks combined with practice give the best results.' },
  ];
}
