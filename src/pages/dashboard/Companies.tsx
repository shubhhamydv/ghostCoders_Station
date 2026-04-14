import { useState } from 'react';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import { Building, ArrowRight, ChevronLeft, Target, AlertCircle, ExternalLink, TrendingUp, BookOpen, Video } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const companyLogos: Record<string, string> = {
  'TCS': 'https://img.logo.dev/tcs.com?token=pk_a8bS0VO3Q0OdMBY3OFmaKw&size=80',
  'Infosys': 'https://img.logo.dev/infosys.com?token=pk_a8bS0VO3Q0OdMBY3OFmaKw&size=80',
  'Wipro': 'https://img.logo.dev/wipro.com?token=pk_a8bS0VO3Q0OdMBY3OFmaKw&size=80',
  'Google': 'https://img.logo.dev/google.com?token=pk_a8bS0VO3Q0OdMBY3OFmaKw&size=80',
  'Microsoft': 'https://img.logo.dev/microsoft.com?token=pk_a8bS0VO3Q0OdMBY3OFmaKw&size=80',
  'Amazon': 'https://img.logo.dev/amazon.com?token=pk_a8bS0VO3Q0OdMBY3OFmaKw&size=80',
  'SBI': 'https://img.logo.dev/sbi.co.in?token=pk_a8bS0VO3Q0OdMBY3OFmaKw&size=80',
  'HDFC Bank': 'https://img.logo.dev/hdfcbank.com?token=pk_a8bS0VO3Q0OdMBY3OFmaKw&size=80',
  'ICICI': 'https://img.logo.dev/icicibank.com?token=pk_a8bS0VO3Q0OdMBY3OFmaKw&size=80',
  'RBI': 'https://img.logo.dev/rbi.org.in?token=pk_a8bS0VO3Q0OdMBY3OFmaKw&size=80',
  'NABARD': 'https://img.logo.dev/nabard.org?token=pk_a8bS0VO3Q0OdMBY3OFmaKw&size=80',
  'Kotak': 'https://img.logo.dev/kotak.com?token=pk_a8bS0VO3Q0OdMBY3OFmaKw&size=80',
  'IAS': 'https://img.logo.dev/upsc.gov.in?token=pk_a8bS0VO3Q0OdMBY3OFmaKw&size=80',
  'IPS': 'https://img.logo.dev/upsc.gov.in?token=pk_a8bS0VO3Q0OdMBY3OFmaKw&size=80',
  'IFS': 'https://img.logo.dev/upsc.gov.in?token=pk_a8bS0VO3Q0OdMBY3OFmaKw&size=80',
  'IRS': 'https://img.logo.dev/upsc.gov.in?token=pk_a8bS0VO3Q0OdMBY3OFmaKw&size=80',
  'IRTS': 'https://img.logo.dev/upsc.gov.in?token=pk_a8bS0VO3Q0OdMBY3OFmaKw&size=80',
  'State PCS': 'https://img.logo.dev/upsc.gov.in?token=pk_a8bS0VO3Q0OdMBY3OFmaKw&size=80',
};

const companyEmojis: Record<string, string> = {
  'TCS': '🏢', 'Infosys': '🔷', 'Wipro': '🌸', 'Google': '🔍', 'Microsoft': '🪟', 'Amazon': '📦',
  'SBI': '🏦', 'HDFC Bank': '🏦', 'ICICI': '🏦', 'RBI': '🏛️', 'NABARD': '🌾', 'Kotak': '🏦',
  'IAS': '🏛️', 'IPS': '🛡️', 'IFS': '🌐', 'IRS': '💰', 'IRTS': '🚂', 'State PCS': '🏛️',
};

const difficultyMap: Record<string, { label: string; color: string }> = {
  'Google': { label: 'HIGH', color: 'text-destructive' },
  'Microsoft': { label: 'HIGH', color: 'text-destructive' },
  'Amazon': { label: 'HIGH', color: 'text-destructive' },
  'TCS': { label: 'LOW', color: 'text-accent' },
  'Infosys': { label: 'MEDIUM', color: 'text-muted-foreground' },
  'Wipro': { label: 'LOW', color: 'text-accent' },
  'RBI': { label: 'HIGH', color: 'text-destructive' },
  'IAS': { label: 'HIGH', color: 'text-destructive' },
  'IPS': { label: 'HIGH', color: 'text-destructive' },
};

function CompanyLogo({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const [imgError, setImgError] = useState(false);
  const sizeMap = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-16 h-16' };
  const url = companyLogos[name];

  if (!url || imgError) {
    return <span className={`${sizeMap[size]} flex items-center justify-center text-2xl`}>{companyEmojis[name] || '🏢'}</span>;
  }
  return (
    <img src={url} alt={`${name} logo`} className={`${sizeMap[size]} rounded-xl object-contain bg-background p-1 border border-border`}
      onError={() => setImgError(true)} loading="lazy" />
  );
}

export default function Companies() {
  const { domain, user, tasksDone } = useStationStore();
  const config = domainConfig[domain];
  const isHi = useStationStore(s => s.language) === 'hi';
  const companyData = config.companyData as Record<string, any>;
  const [selected, setSelected] = useState<string | null>(null);

  const calcReadiness = (name: string) => {
    const baseIQ = user?.personalityScore?.iq || 30;
    const baseEQ = user?.personalityScore?.eq || 25;
    const weakCount = user?.weakPoints?.length || 0;
    const d = companyData[name];
    const difficulty = d.seats < 500 ? 0.4 : d.seats < 2000 ? 0.6 : 0.8;
    return Math.min(95, Math.max(10, Math.round(10 + baseIQ * 0.3 * difficulty + baseEQ * 0.2 * difficulty + tasksDone * 0.3 - weakCount * 3)));
  };

  if (selected && companyData[selected]) {
    const d = companyData[selected];
    const readiness = calcReadiness(selected);
    const readinessData = [
      { value: readiness, color: 'hsl(var(--accent))' },
      { value: 100 - readiness, color: 'hsl(var(--muted))' },
    ];
    const processSteps = d.process.split('→').map((s: string) => s.trim());
    const skillGaps = user?.weakPoints?.slice(0, 4) || ['DSA', 'System Design', 'Communication'];
    const recentQuestions = domain === 'engineering'
      ? ['Invert a Binary Tree', 'Design a Rate Limiter', 'Median of Two Sorted Arrays', 'LRU Cache']
      : domain === 'commerce'
      ? ['Calculate compound interest', 'Explain NPA classification', 'Current repo rate', 'SEBI functions']
      : ['Article 370 implications', 'Federalism in India', 'Ethics case study', 'Essay on governance'];

    return (
      <div className="max-w-5xl space-y-6 animate-fade-in">
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4" /> {isHi ? 'सभी कंपनियां' : 'All Companies'}
        </button>

        <div className="bg-card rounded-2xl border border-border p-6 flex items-center gap-6">
          <CompanyLogo name={selected} size="lg" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{selected}</h1>
            <div className="flex gap-2 mt-2">
              <span className="px-2 py-0.5 rounded-md bg-accent/10 text-accent text-xs font-medium">
                {domain === 'engineering' ? 'Product' : domain === 'commerce' ? 'Banking' : 'Civil Services'}
              </span>
              <span className={`px-2 py-0.5 rounded-md bg-destructive/10 text-xs font-medium ${difficultyMap[selected]?.color || 'text-muted-foreground'}`}>
                {difficultyMap[selected]?.label || 'MEDIUM'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{isHi ? 'वेतन सीमा' : 'Salary Range'}</p>
            <p className="text-xl font-bold text-accent">{d.avgSalary}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-accent" /> {isHi ? 'साक्षात्कार प्रक्रिया' : 'Interview Process'}
              </h3>
              <div className="space-y-3">
                {processSteps.map((step: string, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-accent/20 text-accent text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="text-sm font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-accent" /> {isHi ? 'हाल के प्रश्न' : 'Recent Questions'}
              </h3>
              <div className="space-y-2">
                {recentQuestions.map((q, i) => (
                  <div key={i} className="p-3 rounded-xl bg-muted/30 text-sm">{q}</div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-bold mb-1">{isHi ? 'लक्षित रोडमैप' : 'Targeted Roadmap'}</h2>
              <p className="text-sm text-muted-foreground mb-4">{isHi ? `${selected} क्रैक करने का AI-जनित मार्ग` : `AI-generated path to crack ${selected}.`}</p>
              <div className="space-y-6">
                {config.weeklyTopics.slice(0, 4).map((topic, i) => {
                  const res = (config.weeklyResources as any)[topic];
                  return (
                    <div key={i} className="relative pl-8 border-l-2 border-accent/30">
                      <span className="absolute left-[-13px] top-0 w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">{i + 1}</span>
                      <h4 className="font-semibold text-sm">{topic}</h4>
                      <p className="text-xs text-muted-foreground mt-1 mb-3">
                        Focus on mastering {topic} fundamentals. {selected} heavily tests this area in interviews.
                      </p>
                      {res?.videos?.slice(0, 1).map((url: string, vi: number) => (
                        <a key={vi} href={url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 text-xs hover:bg-accent/10 transition-colors mr-2 mb-2">
                          <Video className="w-3 h-3 text-accent" /> {topic} - Tutorial <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">{isHi ? 'आपकी तैयारी' : 'Your Readiness'}</p>
              <div className="w-40 h-40 mx-auto relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={readinessData} cx="50%" cy="50%" innerRadius={55} outerRadius={70} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                      {readinessData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{readiness}%</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{isHi ? 'तैयार' : 'Ready'}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {readiness < 40 ? (isHi ? 'और अभ्यास की ज़रूरत है' : 'Focus on the missing skills below.') :
                 readiness < 70 ? (isHi ? 'अच्छी प्रगति हो रही है' : "You're getting there.") :
                 (isHi ? 'बहुत अच्छी तैयारी' : 'Strong preparation. Keep polishing.')}
              </p>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">{isHi ? 'कौशल अंतर' : 'Skill Gaps'}</p>
              <div className="space-y-2">
                {skillGaps.map((gap, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-destructive/5 border border-destructive/20">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-destructive" />
                      <span className="text-sm font-medium">{gap}</span>
                    </div>
                    <span className="text-xs font-bold text-destructive">IMPROVE</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-4 text-center">
              <p className="text-xs text-muted-foreground">{isHi ? 'पात्रता' : 'Eligibility'}</p>
              <p className="text-sm font-medium mt-1">{d.eligibility}</p>
              <p className="text-xs text-muted-foreground mt-2">{isHi ? 'शहर' : 'Cities'}</p>
              <p className="text-sm font-medium mt-1">{d.cities?.join(', ')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">{isHi ? 'कंपनियां' : 'Companies'}</h1>
      <p className="text-sm text-muted-foreground">{isHi ? 'अपनी तैयारी के अनुसार कंपनियां देखें' : 'Explore companies based on your preparation level'}</p>

      <div className="grid sm:grid-cols-2 gap-4">
        {config.companies.map((name) => {
          const d = companyData[name];
          if (!d) return null;
          const readiness = calcReadiness(name);
          const diff = difficultyMap[name];
          return (
            <div key={name} className="bg-card rounded-2xl border border-border p-6 hover:border-accent/50 transition-all">
              <div className="flex items-start justify-between mb-4">
                <CompanyLogo name={name} />
                {diff && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    diff.label === 'HIGH' ? 'bg-destructive/10 text-destructive' :
                    diff.label === 'LOW' ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'
                  }`}>{diff.label}</span>
                )}
              </div>
              <h3 className="text-lg font-bold">{name}</h3>
              <p className="text-xs text-muted-foreground mb-4">
                {domain === 'engineering' ? 'Product Company' : domain === 'commerce' ? 'Banking Institution' : 'Civil Service'}
              </p>

              <div className="flex justify-between text-xs mb-1">
                <div><span className="text-muted-foreground uppercase tracking-wide">{isHi ? 'वेतन' : 'Salary'}</span><p className="font-bold text-accent mt-0.5">{d.avgSalary}</p></div>
                <div className="text-right"><span className="text-muted-foreground uppercase tracking-wide">{isHi ? 'तैयारी' : 'Readiness'}</span><p className="font-bold mt-0.5">{readiness}%</p></div>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1 uppercase tracking-wide">
                  <span>{isHi ? 'तैयारी प्रगति' : 'Preparation Progress'}</span>
                  <span>{readiness}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${readiness}%` }} />
                </div>
              </div>

              <button onClick={() => setSelected(name)}
                className="w-full mt-4 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-muted-foreground hover:text-accent transition-colors pt-3 border-t border-border">
                {isHi ? 'विवरण देखें' : 'View Details'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
