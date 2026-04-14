import { useState } from 'react';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import { Building, ChevronRight, Loader2, Play, Sparkles, BookOpen, Target, Users, DollarSign, MapPin, ClipboardList } from 'lucide-react';
import { streamChat } from '@/lib/ai';

export default function CompanyPrep() {
  const { domain, user, language } = useStationStore();
  const config = domainConfig[domain];
  const isHi = language === 'hi';

  const [selectedCompany, setSelectedCompany] = useState('');
  const [aiQuestions, setAiQuestions] = useState('');
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [testQuestions, setTestQuestions] = useState<{ q: string; opts: string[]; correct: number }[]>([]);
  const [testIdx, setTestIdx] = useState(0);
  const [testAnswer, setTestAnswer] = useState<number | null>(null);
  const [testScore, setTestScore] = useState(0);
  const [testDone, setTestDone] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  const companyData = config.companyData as Record<string, any>;
  const companies = config.companies;
  const info = selectedCompany ? companyData[selectedCompany] : null;

  const generateQuestions = async () => {
    if (!selectedCompany) return;
    setQuestionsLoading(true);
    setAiQuestions('');
    let text = '';
    await streamChat({
      messages: [{ role: 'user', content: `Generate 10 frequently asked interview questions for ${selectedCompany} in ${config.label} domain. Include both HR and technical questions. For each question, also give a brief tip on how to answer it. Format clearly with numbering.` }],
      mode: 'interview-prep',
      context: { domain, company: selectedCompany },
      onDelta: (d) => { text += d; setAiQuestions(text); },
      onDone: () => setQuestionsLoading(false),
      onError: () => { setAiQuestions(isHi ? 'प्रश्न लोड नहीं हो सके।' : 'Could not load questions.'); setQuestionsLoading(false); },
    });
  };

  const startCompanyTest = async () => {
    if (!selectedCompany) return;
    setTestLoading(true);
    setTestMode(true);
    setTestIdx(0);
    setTestAnswer(null);
    setTestScore(0);
    setTestDone(false);

    let text = '';
    await streamChat({
      messages: [{ role: 'user', content: `Create exactly 5 MCQ questions for ${selectedCompany} interview preparation in ${config.label} domain. Format EXACTLY as:
Q1: [question]
A) [option]
B) [option]
C) [option]
D) [option]
ANSWER: [A/B/C/D]

Repeat for Q2-Q5. Mix HR and technical questions relevant to ${selectedCompany}.` }],
      mode: 'interview-prep',
      context: { domain, company: selectedCompany },
      onDelta: (d) => { text += d; },
      onDone: () => {
        const parsed: { q: string; opts: string[]; correct: number }[] = [];
        const blocks = text.split(/Q\d+:\s*/i).filter(Boolean);
        blocks.forEach(block => {
          const lines = block.trim().split('\n').filter(Boolean);
          const q = lines[0]?.trim();
          const opts: string[] = [];
          let correct = 0;
          lines.forEach(line => {
            const optMatch = line.match(/^([A-D])\)\s*(.+)/i);
            if (optMatch) opts.push(optMatch[2].trim());
            const ansMatch = line.match(/ANSWER:\s*([A-D])/i);
            if (ansMatch) correct = 'ABCD'.indexOf(ansMatch[1].toUpperCase());
          });
          if (q && opts.length === 4) parsed.push({ q, opts, correct });
        });
        setTestQuestions(parsed.length > 0 ? parsed : [
          { q: `What is ${selectedCompany}'s core business?`, opts: ['Technology', 'Finance', 'Healthcare', 'Education'], correct: 0 },
        ]);
        setTestLoading(false);
      },
      onError: () => { setTestLoading(false); setTestMode(false); },
    });
  };

  const handleTestAnswer = (idx: number) => {
    setTestAnswer(idx);
    if (idx === testQuestions[testIdx]?.correct) setTestScore(s => s + 1);
    setTimeout(() => {
      if (testIdx < testQuestions.length - 1) {
        setTestIdx(i => i + 1);
        setTestAnswer(null);
      } else {
        setTestDone(true);
      }
    }, 1200);
  };

  return (
    <div className="max-w-5xl space-y-5 animate-fade-in">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <Building className="w-5 h-5 text-accent" />
        {isHi ? 'कंपनी-विशिष्ट तैयारी' : 'Company-Specific Preparation'}
      </h1>

      {/* Company Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {companies.map(c => (
          <button key={c} onClick={() => { setSelectedCompany(c); setAiQuestions(''); setTestMode(false); }}
            className={`p-4 rounded-xl border text-left transition-all hover-scale ${
              selectedCompany === c ? 'border-accent bg-accent/10 ring-2 ring-accent/30' : 'border-border bg-card hover:border-accent/50'
            }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Building className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold text-sm">{c}</p>
                <p className="text-[10px] text-muted-foreground">{companyData[c]?.process?.split('→')[0]?.trim() || config.label}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Company Details */}
      {info && selectedCompany && (
        <div className="bg-card rounded-2xl border border-border p-5 animate-fade-in">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Building className="w-5 h-5 text-accent" /> {selectedCompany}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              { icon: Users, label: isHi ? 'सीटें' : 'Seats', value: info.seats?.toLocaleString() },
              { icon: DollarSign, label: isHi ? 'वेतन' : 'Salary', value: info.avgSalary },
              { icon: MapPin, label: isHi ? 'शहर' : 'Cities', value: info.cities?.slice(0, 2).join(', ') },
              { icon: ClipboardList, label: isHi ? 'योग्यता' : 'Eligibility', value: info.eligibility?.slice(0, 25) },
            ].map(d => (
              <div key={d.label} className="bg-muted/30 rounded-xl p-3">
                <d.icon className="w-4 h-4 text-accent mb-1" />
                <p className="text-xs text-muted-foreground">{d.label}</p>
                <p className="text-sm font-semibold">{d.value}</p>
              </div>
            ))}
          </div>

          {/* Interview Process */}
          <div className="mb-4">
            <p className="text-xs font-semibold mb-2">{isHi ? 'इंटरव्यू प्रक्रिया' : 'Interview Process'}</p>
            <div className="flex items-center gap-2 flex-wrap">
              {info.process?.split('→').map((step: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-semibold">{step.trim()}</span>
                  {i < info.process.split('→').length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                </div>
              ))}
            </div>
          </div>

          {/* Topics to Focus */}
          <div className="mb-4">
            <p className="text-xs font-semibold mb-2">{isHi ? 'महत्वपूर्ण विषय' : 'Topics to Focus'}</p>
            <div className="flex flex-wrap gap-2">
              {config.vaultTopics.map(t => (
                <span key={t} className="px-3 py-1 rounded-full bg-muted text-xs font-medium">{t}</span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button onClick={generateQuestions} disabled={questionsLoading}
              className="flex-1 py-3 rounded-xl bg-accent text-accent-foreground font-semibold flex items-center justify-center gap-2 hover-scale disabled:opacity-40">
              {questionsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
              {isHi ? 'अक्सर पूछे जाने वाले प्रश्न' : 'Frequently Asked Questions'}
            </button>
            <button onClick={startCompanyTest} disabled={testLoading}
              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover-scale disabled:opacity-40">
              {testLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {isHi ? 'कंपनी टेस्ट शुरू करें' : 'Start Company Test'}
            </button>
          </div>

          {/* AI Questions */}
          {aiQuestions && (
            <div className="mt-4 p-4 rounded-xl bg-muted/30 text-sm whitespace-pre-wrap animate-fade-in">
              {aiQuestions}
            </div>
          )}

          {/* Company Test */}
          {testMode && !testLoading && testQuestions.length > 0 && (
            <div className="mt-4 bg-muted/30 rounded-xl p-4 animate-fade-in">
              {!testDone ? (
                <>
                  <p className="text-xs text-muted-foreground mb-2">Q{testIdx + 1}/{testQuestions.length}</p>
                  <p className="text-sm font-semibold mb-3">{testQuestions[testIdx].q}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {testQuestions[testIdx].opts.map((opt, i) => (
                      <button key={i} onClick={() => testAnswer === null && handleTestAnswer(i)}
                        className={`p-3 rounded-xl text-sm text-left border transition-all ${
                          testAnswer === null ? 'border-border hover:border-accent' :
                          i === testQuestions[testIdx].correct ? 'border-green-500 bg-green-500/10' :
                          i === testAnswer ? 'border-destructive bg-destructive/10' : 'border-border opacity-50'
                        }`}>
                        {String.fromCharCode(65 + i)}) {opt}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-2xl font-bold text-accent">{testScore}/{testQuestions.length}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {testScore >= 4 ? '🎉 Excellent!' : testScore >= 2 ? '📈 Good effort!' : '💪 Keep practicing!'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
