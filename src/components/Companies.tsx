import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Building2, 
  Target, 
  ArrowRight, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Briefcase,
  ExternalLink,
  Sparkles,
  RefreshCcw,
  GraduationCap
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Company, UserProfile, Roadmap as RoadmapType } from '../types';
import { geminiService } from '../services/gemini';

const COMPANIES: Company[] = [
  {
    id: '1',
    name: 'Google',
    logo: 'https://www.google.com/favicon.ico',
    type: 'Product',
    salaryRange: '20-40 LPA',
    difficulty: 'High',
    requiredSkills: { dsa: 9, aptitude: 8, coreSubjects: 8, communication: 8 },
    interviewProcess: ['Online Assessment', 'Technical Round 1', 'Technical Round 2', 'Technical Round 3', 'Googliness Round'],
    previousQuestions: ['Invert a Binary Tree', 'Design a Rate Limiter', 'Median of Two Sorted Arrays']
  },
  {
    id: '2',
    name: 'Amazon',
    logo: 'https://www.amazon.com/favicon.ico',
    type: 'Product',
    salaryRange: '18-35 LPA',
    difficulty: 'High',
    requiredSkills: { dsa: 8, aptitude: 8, coreSubjects: 7, communication: 8 },
    interviewProcess: ['Online Assessment', 'Technical Round 1', 'Technical Round 2', 'Bar Raiser Round'],
    previousQuestions: ['LRU Cache', 'Word Ladder', 'Top K Frequent Elements']
  },
  {
    id: '3',
    name: 'Microsoft',
    logo: 'https://www.microsoft.com/favicon.ico',
    type: 'Product',
    salaryRange: '15-30 LPA',
    difficulty: 'High',
    requiredSkills: { dsa: 8, aptitude: 7, coreSubjects: 8, communication: 7 },
    interviewProcess: ['Online Test', 'Technical Round 1', 'Technical Round 2', 'AA Round'],
    previousQuestions: ['Reverse Nodes in k-Group', 'Serialize and Deserialize Binary Tree']
  },
  {
    id: '4',
    name: 'TCS',
    logo: 'https://www.tcs.com/favicon.ico',
    type: 'Service',
    salaryRange: '3.5-7 LPA',
    difficulty: 'Low',
    requiredSkills: { dsa: 4, aptitude: 6, coreSubjects: 5, communication: 6 },
    interviewProcess: ['NQT Exam', 'Technical Interview', 'HR Interview'],
    previousQuestions: ['Palindrome Check', 'Factorial of a Number', 'Basic SQL Queries']
  },
  {
    id: '5',
    name: 'Infosys',
    logo: 'https://www.infosys.com/favicon.ico',
    type: 'Service',
    salaryRange: '3.6-8 LPA',
    difficulty: 'Low',
    requiredSkills: { dsa: 4, aptitude: 7, coreSubjects: 5, communication: 6 },
    interviewProcess: ['InfyTQ / HackWithInfy', 'Technical Interview', 'HR Interview'],
    previousQuestions: ['Fibonacci Series', 'String Reversal', 'Oops Concepts']
  }
];

interface CompaniesProps {
  user: UserProfile;
}

export default function Companies({ user }: CompaniesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Product' | 'Service'>('All');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [companyRoadmap, setCompanyRoadmap] = useState<RoadmapType | null>(null);

  const filteredCompanies = useMemo(() => {
    return COMPANIES.filter(company => {
      const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === 'All' || company.type === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, filterType]);

  const calculateReadiness = (company: Company) => {
    const userSkills = user.skills;
    const reqSkills = company.requiredSkills;
    
    const dsaScore = Math.min(100, (userSkills.dsa / reqSkills.dsa) * 100);
    const aptitudeScore = Math.min(100, (userSkills.aptitude / reqSkills.aptitude) * 100);
    const coreScore = Math.min(100, (userSkills.coreSubjects / reqSkills.coreSubjects) * 100);
    const commScore = Math.min(100, (userSkills.communication / reqSkills.communication) * 100);
    
    return Math.round((dsaScore + aptitudeScore + coreScore + commScore) / 4);
  };

  const getMissingSkills = (company: Company) => {
    const gaps = [];
    if (user.skills.dsa < company.requiredSkills.dsa) gaps.push('DSA');
    if (user.skills.aptitude < company.requiredSkills.aptitude) gaps.push('Aptitude');
    if (user.skills.coreSubjects < company.requiredSkills.coreSubjects) gaps.push('Core Subjects');
    if (user.skills.communication < company.requiredSkills.communication) gaps.push('Communication');
    return gaps;
  };

  const handleGenerateRoadmap = async (company: Company) => {
    setIsGeneratingRoadmap(true);
    try {
      const roadmap = await geminiService.generateCompanyRoadmap(company.name, user);
      setCompanyRoadmap(roadmap);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  if (selectedCompany) {
    const readiness = calculateReadiness(selectedCompany);
    const gaps = getMissingSkills(selectedCompany);

    return (
      <div className="max-w-5xl mx-auto space-y-8 py-8">
        <button 
          onClick={() => {
            setSelectedCompany(null);
            setCompanyRoadmap(null);
          }}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
        >
          <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
          Back to Companies
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Company Header & Stats */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-10 flex items-start justify-between">
              <div className="flex gap-6">
                <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center justify-center">
                  <img src={selectedCompany.logo} alt={selectedCompany.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-4xl font-bold text-white">{selectedCompany.name}</h2>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
                      {selectedCompany.type}
                    </span>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold border",
                      selectedCompany.difficulty === 'High' ? "bg-red-500/10 border-red-500/20 text-red-400" :
                      selectedCompany.difficulty === 'Medium' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                      "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    )}>
                      {selectedCompany.difficulty} Difficulty
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Salary Range</p>
                <p className="text-2xl font-bold text-emerald-400">{selectedCompany.salaryRange}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Interview Process */}
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  Interview Process
                </h3>
                <div className="space-y-4">
                  {selectedCompany.interviewProcess.map((step, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 group-hover:bg-blue-600/20 group-hover:border-blue-500/30 group-hover:text-blue-400 transition-all">
                        {i + 1}
                      </div>
                      <p className="text-sm text-slate-300 font-medium">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Previous Questions */}
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-purple-400" />
                  Recent Questions
                </h3>
                <div className="space-y-3">
                  {selectedCompany.previousQuestions.map((q, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 text-sm text-slate-400 hover:border-purple-500/30 transition-all">
                      {q}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Company Roadmap Section */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-10 space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-white">Targeted Roadmap</h3>
                  <p className="text-sm text-slate-500">AI-generated path to crack {selectedCompany.name}.</p>
                </div>
                {!companyRoadmap && (
                  <button 
                    onClick={() => handleGenerateRoadmap(selectedCompany)}
                    disabled={isGeneratingRoadmap}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isGeneratingRoadmap ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Generate Roadmap
                  </button>
                )}
              </div>

              {companyRoadmap && (
                <div className="space-y-6">
                  {companyRoadmap.steps.map((step, i) => (
                    <div key={step.id} className="relative pl-10 pb-8 last:pb-0">
                      {i < companyRoadmap.steps.length - 1 && (
                        <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-slate-800" />
                      )}
                      <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-400 z-10">
                        {i + 1}
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-white font-bold">{step.title}</h4>
                        <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {step.resources.map((res, j) => (
                            <a 
                              key={j} 
                              href={res.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-400 hover:text-white hover:border-slate-600 transition-all"
                            >
                              {res.title}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Readiness Sidebar */}
          <div className="space-y-8">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-8 text-center space-y-6">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Your Readiness</h3>
              <div className="relative w-40 h-40 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    className="text-slate-800"
                  />
                  <motion.circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeDasharray={440}
                    initial={{ strokeDashoffset: 440 }}
                    animate={{ strokeDashoffset: 440 - (440 * readiness) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="text-blue-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-white">{readiness}%</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Ready</span>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                {readiness > 80 ? "You're in great shape! Just a few more refinements." :
                 readiness > 50 ? "You're getting there. Focus on the missing skills below." :
                 "You have some work to do. Follow the targeted roadmap."}
              </p>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Skill Gaps</h3>
              <div className="space-y-4">
                {gaps.length > 0 ? gaps.map(gap => (
                  <div key={gap} className="flex items-center justify-between p-4 rounded-2xl bg-red-500/5 border border-red-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      </div>
                      <span className="text-sm font-bold text-white">{gap}</span>
                    </div>
                    <span className="text-[10px] font-bold text-red-500 uppercase">Improve</span>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    </div>
                    <p className="text-sm text-slate-400">No major gaps found!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold text-white">Target Companies</h2>
          <p className="text-slate-400">Explore requirements and track your readiness for top tech companies.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-11 pr-6 py-3 bg-slate-900/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all text-sm text-white w-64"
            />
          </div>
          <div className="flex p-1 bg-slate-900/50 border border-slate-800 rounded-xl">
            {(['All', 'Product', 'Service'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                  filterType === type ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-500 hover:text-slate-300"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredCompanies.map((company) => {
            const readiness = calculateReadiness(company);
            return (
              <motion.div
                key={company.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => setSelectedCompany(company)}
                className="group cursor-pointer bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-8 hover:border-blue-500/30 transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[50px] rounded-full group-hover:bg-blue-600/10 transition-all" />
                
                <div className="flex items-start justify-between mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 p-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <img src={company.logo} alt={company.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider",
                      company.difficulty === 'High' ? "bg-red-500/10 border-red-500/20 text-red-400" :
                      company.difficulty === 'Medium' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                      "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    )}>
                      {company.difficulty}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">{company.name}</h3>
                    <p className="text-sm text-slate-500 font-medium">{company.type} Company</p>
                  </div>

                  <div className="flex items-center justify-between py-4 border-y border-slate-800/50">
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Salary</p>
                      <p className="text-sm font-bold text-emerald-400">{company.salaryRange}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Readiness</p>
                      <p className="text-sm font-bold text-blue-400">{readiness}%</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-slate-500">Preparation Progress</span>
                      <span className="text-blue-400">{readiness}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${readiness}%` }}
                        className="h-full bg-blue-500 rounded-full"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between text-slate-400 group-hover:text-white transition-colors">
                    <span className="text-xs font-bold uppercase tracking-widest">View Details</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
