import { useNavigate } from 'react-router-dom';
import { ArrowRight, TrendingUp, Users, Award, Cpu, Landmark, BookOpen, LogIn } from 'lucide-react';
import { useStationStore, type Domain } from '@/store/useStationStore';

const tickerMessages = [
  'Raj (IAS) overtook 234 students in Mumbai',
  'Shyam (TCS) moved to Top 8% in Andheri',
  'Priya cleared SBI PO Prelims — Top 2% Delhi',
  'Arjun got placed at Infosys 7.2 LPA from Pune',
  'Meera (UPSC) cracked Mains — Jaipur topper',
];

const domains: { id: Domain; icon: typeof Cpu; title: string; desc: string; stat: string; pkg: string; companies: string }[] = [
  { id: 'engineering', icon: Cpu, title: 'Engineering', desc: 'Tech placements, DSA, System Design, Full-stack prep', stat: '87% placement rate', pkg: 'Avg 8.2 LPA', companies: 'TCS, Infosys, Google, Amazon' },
  { id: 'commerce', icon: Landmark, title: 'Commerce & Banking', desc: 'SBI PO, IBPS, RBI, Banking & Finance readiness', stat: '72% selection rate', pkg: 'Avg 6.5 LPA', companies: 'SBI, HDFC, RBI, ICICI' },
  { id: 'arts', icon: BookOpen, title: 'Arts & Civil Services', desc: 'UPSC, IAS, IPS — complete prelims to interview prep', stat: '94% prelims clear rate', pkg: 'Grade A postings', companies: 'IAS, IPS, IFS, IRS' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { setDomain } = useStationStore();

  return (
    <div className="min-h-screen bg-background">
      {/* Ticker */}
      <div className="bg-primary text-primary-foreground py-2 overflow-hidden">
        <div className="animate-ticker whitespace-nowrap flex gap-12 text-sm">
          {[...tickerMessages, ...tickerMessages].map((m, i) => (
            <span key={i} className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-accent" /> {m}
            </span>
          ))}
        </div>
      </div>

      {/* Nav */}
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Station</h2>
        <div className="flex gap-3">
          <button onClick={() => navigate('/auth')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
            <LogIn className="w-4 h-4" /> Login
          </button>
          <button onClick={() => navigate('/auth')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-medium hover-scale">
            Get Started <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-16 text-center animate-slide-up">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
          Find Your <span className="text-accent">Station</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          AI-powered placement readiness. From your current level to job-ready — personalized for your domain, city, and ambition.
        </p>
        <button
          onClick={() => navigate('/auth')}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-accent text-accent-foreground font-semibold text-lg hover-scale shadow-lg"
        >
          Find Your Station <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Domain Cards */}
      <div className="max-w-6xl mx-auto px-6 pb-20 grid md:grid-cols-3 gap-6">
        {domains.map((d) => (
          <button
            key={d.id}
            onClick={() => { setDomain(d.id); navigate('/auth'); }}
            className="group bg-card rounded-2xl p-8 text-left border border-border hover:border-accent transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
              <d.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">{d.title}</h3>
            <p className="text-muted-foreground text-sm mb-4">{d.desc}</p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-accent"><Award className="w-3 h-3" />{d.stat}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><TrendingUp className="w-3 h-3" />{d.pkg}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Users className="w-3 h-3" />{d.companies}</div>
            </div>
          </button>
        ))}
      </div>

      {/* How it works */}
      <div className="bg-card border-t border-border py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">How Station Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Pick Your Domain', desc: 'Engineering, Commerce, or Arts — each with its own AI path' },
              { step: '02', title: 'AI Profiles You', desc: 'Personality quiz + academic data = your unique readiness score' },
              { step: '03', title: 'Climb Your Rank', desc: 'Weekly plans, quizzes, interview prep — watch yourself rise' },
            ].map((s) => (
              <div key={s.step} className="text-left">
                <span className="text-4xl font-bold text-accent/30">{s.step}</span>
                <h3 className="text-lg font-semibold mt-2 mb-1">{s.title}</h3>
                <p className="text-muted-foreground text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
