import { useState } from 'react';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import { MapPin, Clock, Briefcase, DollarSign, Search, ExternalLink, X, Users, TrendingUp, ChevronRight, BookOpen, CheckCircle } from 'lucide-react';

type JobType = 'all' | 'full-time' | 'internship';

interface Job {
  title: string;
  company: string;
  logo: string;
  type: 'FULL-TIME' | 'INTERNSHIP';
  location: string;
  salary: string;
  level: string;
  posted: string;
  link: string;
  description: string;
  requirements: string[];
  applicants: number;
}

const engineeringJobs: Job[] = [
  { title: 'Frontend Developer', company: 'Amazon', logo: '📦', type: 'FULL-TIME', location: 'Remote', salary: '12-18 LPA', level: 'Fresher', posted: '2 days ago', link: 'https://amazon.jobs', description: 'Build scalable web UIs using React/Next.js for Amazon retail platform.', requirements: ['React/TypeScript', 'CSS/Tailwind', 'REST APIs', 'Git'], applicants: 4200 },
  { title: 'Software Engineer Intern', company: 'Google', logo: '🔍', type: 'INTERNSHIP', location: 'Bangalore', salary: '80k-1.2L/mo', level: 'Fresher', posted: '1 day ago', link: 'https://careers.google.com', description: 'Work on core Google products with mentorship from senior engineers.', requirements: ['DSA proficiency', 'Python/Java/C++', 'Problem solving', 'CS fundamentals'], applicants: 28000 },
  { title: 'Backend Developer', company: 'Microsoft', logo: '🪟', type: 'FULL-TIME', location: 'Hyderabad', salary: '15-25 LPA', level: 'Fresher', posted: '3 days ago', link: 'https://careers.microsoft.com', description: 'Design and build backend services for Azure cloud platform.', requirements: ['Java/C#/.NET', 'Microservices', 'SQL/NoSQL', 'System Design'], applicants: 8500 },
  { title: 'SDE Intern', company: 'TCS', logo: '🏢', type: 'INTERNSHIP', location: 'Mumbai', salary: '25k/month', level: 'Fresher', posted: '5 days ago', link: 'https://tcs.com/careers', description: 'Join TCS Digital program for hands-on enterprise software development.', requirements: ['Any programming language', 'Basic DSA', 'Communication skills'], applicants: 120000 },
  { title: 'DevOps Engineer', company: 'Infosys', logo: '🔷', type: 'FULL-TIME', location: 'Pune', salary: '6-10 LPA', level: 'Fresher', posted: '1 week ago', link: 'https://infosys.com/careers', description: 'Manage CI/CD pipelines and cloud infrastructure for enterprise clients.', requirements: ['Linux', 'Docker/K8s', 'AWS/Azure', 'Jenkins'], applicants: 15000 },
  { title: 'Data Analyst', company: 'Wipro', logo: '🌸', type: 'FULL-TIME', location: 'Chennai', salary: '5-8 LPA', level: 'Fresher', posted: '4 days ago', link: 'https://wipro.com/careers', description: 'Analyze business data and create dashboards for client reporting.', requirements: ['SQL', 'Python/R', 'Excel', 'Power BI/Tableau'], applicants: 22000 },
];

const commerceJobs: Job[] = [
  { title: 'Probationary Officer', company: 'SBI', logo: '🏦', type: 'FULL-TIME', location: 'All India', salary: '8-14 LPA', level: 'Graduate', posted: '1 week ago', link: 'https://sbi.co.in/careers', description: 'Join State Bank of India as a Probationary Officer with career growth path.', requirements: ['Graduate degree', 'Age 21-30', 'Quantitative aptitude', 'Banking awareness'], applicants: 2500000 },
  { title: 'Clerk', company: 'HDFC Bank', logo: '🏦', type: 'FULL-TIME', location: 'Mumbai', salary: '4-6 LPA', level: 'Graduate', posted: '3 days ago', link: 'https://hdfcbank.com/careers', description: 'Customer service and banking operations role at HDFC branches.', requirements: ['Graduate', 'Communication skills', 'Computer literacy'], applicants: 180000 },
  { title: 'Internship - Finance', company: 'ICICI', logo: '🏦', type: 'INTERNSHIP', location: 'Delhi', salary: '20k/month', level: 'Student', posted: '2 days ago', link: 'https://icicibank.com/careers', description: 'Summer internship in ICICI corporate finance division.', requirements: ['Commerce/Finance student', 'Excel proficiency', 'Financial modeling basics'], applicants: 45000 },
  { title: 'Grade B Officer', company: 'RBI', logo: '🏛️', type: 'FULL-TIME', location: 'Mumbai', salary: '12-20 LPA', level: 'Graduate', posted: '1 week ago', link: 'https://rbi.org.in/careers', description: 'Policy-making role at Reserve Bank of India with excellent benefits.', requirements: ['Graduate 60%', 'Age limit applies', 'Economics/Finance knowledge'], applicants: 800000 },
];

const artsJobs: Job[] = [
  { title: 'Civil Services (IAS)', company: 'UPSC', logo: '🏛️', type: 'FULL-TIME', location: 'All India', salary: 'Grade A Pay Scale', level: 'Graduate', posted: 'Annual', link: 'https://upsc.gov.in', description: 'Premier administrative service of India. Serve the nation in leadership roles.', requirements: ['Graduate degree', 'Age 21-32 (Gen)', 'Indian citizen'], applicants: 1200000 },
  { title: 'State PCS', company: 'State Govt', logo: '🏛️', type: 'FULL-TIME', location: 'State Level', salary: '₹44,900+', level: 'Graduate', posted: 'Annual', link: 'https://uppsc.up.nic.in', description: 'State administrative services with postings in home state.', requirements: ['Graduate', 'State domicile', 'Age criteria vary'], applicants: 500000 },
  { title: 'SSC CGL', company: 'SSC', logo: '🏛️', type: 'FULL-TIME', location: 'All India', salary: '₹25,500-₹81,100', level: 'Graduate', posted: '2 weeks ago', link: 'https://ssc.nic.in', description: 'Combined Graduate Level exam for Group B and C posts in central government.', requirements: ['Graduate', 'Age 18-32', 'Computer proficiency'], applicants: 3000000 },
];

export default function Jobs() {
  const { domain, user, tasksDone } = useStationStore();
  const isHi = useStationStore(s => s.language) === 'hi';
  const [filter, setFilter] = useState<JobType>('all');
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  const allJobs = domain === 'engineering' ? engineeringJobs : domain === 'commerce' ? commerceJobs : artsJobs;

  const calcMatch = (job: Job) => {
    const baseIQ = user?.personalityScore?.iq || 30;
    const weakCount = user?.weakPoints?.length || 0;
    const companyBonus = job.company === user?.dreamCompany ? 10 : 0;
    return Math.min(95, Math.max(10, Math.round(baseIQ * 0.4 + tasksDone * 0.5 - weakCount * 3 + companyBonus)));
  };

  const calcProbability = (job: Job) => {
    const match = calcMatch(job);
    const ratio = job.applicants > 0 ? Math.round((1 / (job.applicants / 1000)) * match * 10) : match;
    return Math.min(95, Math.max(1, ratio));
  };

  const filtered = allJobs.filter(j => {
    if (filter === 'full-time' && j.type !== 'FULL-TIME') return false;
    if (filter === 'internship' && j.type !== 'INTERNSHIP') return false;
    if (search && !j.title.toLowerCase().includes(search.toLowerCase()) && !j.company.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleApply = (job: Job) => {
    setAppliedJobs(prev => new Set(prev).add(`${job.title}-${job.company}`));
    window.open(job.link, '_blank');
  };

  const toggleSave = (job: Job) => {
    const key = `${job.title}-${job.company}`;
    setSavedJobs(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  return (
    <div className="max-w-5xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">{isHi ? 'नौकरी के अवसर' : 'Job Opportunities'}</h1>
        <p className="text-sm text-muted-foreground">{isHi ? 'अपने कौशल और तैयारी के अनुसार भूमिकाएं खोजें' : 'Discover roles tailored to your skills and preparation level.'}</p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={isHi ? 'शीर्षक या कंपनी द्वारा खोजें...' : 'Search by title or company...'}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {([['all', isHi ? 'सभी' : 'All'], ['full-time', isHi ? 'पूर्णकालिक' : 'Full-time'], ['internship', isHi ? 'इंटर्नशिप' : 'Internship']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key as JobType)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${filter === key ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Job Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.map((job, i) => {
          const match = calcMatch(job);
          const prob = calcProbability(job);
          const jobKey = `${job.title}-${job.company}`;
          const isApplied = appliedJobs.has(jobKey);
          const isSaved = savedJobs.has(jobKey);

          return (
            <div key={i} className="bg-card rounded-2xl border border-border p-6 hover:border-accent/50 transition-all">
              <div className="flex items-start gap-4 mb-4">
                <span className="text-3xl">{job.logo}</span>
                <div className="flex-1">
                  <h3 className="font-bold">{job.title}</h3>
                  <p className="text-xs text-muted-foreground">{job.company}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  job.type === 'FULL-TIME' ? 'bg-muted text-foreground' : 'bg-accent/10 text-accent'
                }`}>{job.type}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="flex items-center gap-1 text-muted-foreground"><MapPin className="w-3 h-3" /> {job.location}</div>
                <div className="flex items-center gap-1 text-accent font-medium"><DollarSign className="w-3 h-3" /> {job.salary}</div>
                <div className="flex items-center gap-1 text-muted-foreground"><Briefcase className="w-3 h-3" /> {job.level}</div>
                <div className="flex items-center gap-1 text-muted-foreground"><Clock className="w-3 h-3" /> {job.posted}</div>
              </div>

              {/* Competition Stats */}
              <div className="p-3 rounded-xl bg-muted/30 mb-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-muted-foreground"><Users className="w-3 h-3" /> {job.applicants.toLocaleString()} {isHi ? 'आवेदक' : 'applicants'}</span>
                  <span className={`font-bold ${prob < 10 ? 'text-destructive' : prob < 30 ? 'text-yellow-500' : 'text-accent'}`}>{prob}% {isHi ? 'संभावना' : 'probability'}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${prob < 10 ? 'bg-destructive' : prob < 30 ? 'bg-yellow-500' : 'bg-accent'}`}
                    style={{ width: `${prob}%` }} />
                </div>
              </div>

              {/* Eligibility Match */}
              <div className="mb-4">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1 uppercase tracking-wide">
                  <span>{isHi ? 'पात्रता मैच' : 'Eligibility Match'}</span>
                  <span className={match < 40 ? 'text-destructive' : match < 70 ? 'text-muted-foreground' : 'text-accent'}>{match}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${match < 40 ? 'bg-destructive' : 'bg-accent'}`}
                    style={{ width: `${match}%` }} />
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setSelectedJob(job)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:border-accent/50 transition-all">
                  {isHi ? 'विवरण देखें' : 'View Details'}
                </button>
                {isApplied ? (
                  <button disabled className="flex-1 py-2.5 rounded-xl bg-accent/20 text-accent text-sm font-medium flex items-center justify-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> {isHi ? 'आवेदित' : 'Applied'}
                  </button>
                ) : (
                  <button onClick={() => handleApply(job)} className="flex-1 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-medium hover:scale-[1.02] transition-transform flex items-center justify-center gap-1">
                    <ExternalLink className="w-3 h-3" /> {isHi ? 'आवेदन करें' : 'Apply Now'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">{isHi ? 'कोई नौकरी नहीं मिली' : 'No jobs found matching your criteria'}</p>
        </div>
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4" onClick={() => setSelectedJob(null)}>
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedJob.logo}</span>
                  <div>
                    <h2 className="text-lg font-bold">{selectedJob.title}</h2>
                    <p className="text-sm text-muted-foreground">{selectedJob.company}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedJob(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-muted/30"><p className="text-[10px] text-muted-foreground uppercase">Location</p><p className="font-medium">{selectedJob.location}</p></div>
                <div className="p-3 rounded-xl bg-muted/30"><p className="text-[10px] text-muted-foreground uppercase">Salary</p><p className="font-medium text-accent">{selectedJob.salary}</p></div>
                <div className="p-3 rounded-xl bg-muted/30"><p className="text-[10px] text-muted-foreground uppercase">Type</p><p className="font-medium">{selectedJob.type}</p></div>
                <div className="p-3 rounded-xl bg-muted/30"><p className="text-[10px] text-muted-foreground uppercase">Posted</p><p className="font-medium">{selectedJob.posted}</p></div>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2">{isHi ? 'विवरण' : 'Description'}</h3>
                <p className="text-sm text-muted-foreground">{selectedJob.description}</p>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2">{isHi ? 'आवश्यकताएं' : 'Requirements'}</h3>
                <div className="space-y-1.5">
                  {selectedJob.requirements.map((req, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <ChevronRight className="w-3 h-3 text-accent flex-shrink-0" />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Competition analysis */}
              <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-accent" /> {isHi ? 'प्रतिस्पर्धा विश्लेषण' : 'Competition Analysis'}</h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-lg font-bold">{selectedJob.applicants.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">{isHi ? 'कुल आवेदक' : 'Total Applicants'}</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-accent">{calcMatch(selectedJob)}%</p>
                    <p className="text-[10px] text-muted-foreground">{isHi ? 'आपका मैच' : 'Your Match'}</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold" style={{ color: calcProbability(selectedJob) < 10 ? 'hsl(var(--destructive))' : 'hsl(var(--accent))' }}>{calcProbability(selectedJob)}%</p>
                    <p className="text-[10px] text-muted-foreground">{isHi ? 'चयन संभावना' : 'Selection Prob.'}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => toggleSave(selectedJob)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${savedJobs.has(`${selectedJob.title}-${selectedJob.company}`) ? 'border-accent bg-accent/10 text-accent' : 'border-border hover:border-accent/50'}`}>
                  {savedJobs.has(`${selectedJob.title}-${selectedJob.company}`) ? (isHi ? '✓ सहेजा गया' : '✓ Saved') : (isHi ? 'सहेजें' : 'Save Job')}
                </button>
                {appliedJobs.has(`${selectedJob.title}-${selectedJob.company}`) ? (
                  <button disabled className="flex-1 py-3 rounded-xl bg-accent/20 text-accent text-sm font-medium flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" /> {isHi ? 'आवेदित' : 'Applied'}
                  </button>
                ) : (
                  <button onClick={() => handleApply(selectedJob)} className="flex-1 py-3 rounded-xl bg-accent text-accent-foreground text-sm font-medium hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                    <ExternalLink className="w-4 h-4" /> {isHi ? 'आवेदन करें' : 'Apply Now'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
