import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ArrowRight,
  Building2,
  X,
  RefreshCcw,
  GraduationCap
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Job, UserProfile } from '../types';
import { geminiService } from '../services/gemini';

const JOBS: Job[] = [
  {
    id: '1',
    title: 'Frontend Developer',
    company: 'Amazon',
    logo: 'https://www.amazon.com/favicon.ico',
    salary: '12-18 LPA',
    location: 'Remote',
    type: 'Full-time',
    experience: 'Fresher',
    description: 'We are looking for a passionate Frontend Developer to join our team. You will be responsible for building high-quality web applications using React and modern frontend technologies.',
    requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'DSA'],
    responsibilities: [
      'Develop new user-facing features using React.js',
      'Build reusable components and front-end libraries for future use',
      'Translate designs and wireframes into high quality code',
      'Optimize components for maximum performance across a vast array of web-capable devices and browsers'
    ],
    postedAt: '2 days ago'
  },
  {
    id: '2',
    title: 'Software Engineer Intern',
    company: 'Google',
    logo: 'https://www.google.com/favicon.ico',
    salary: '80k - 1.2L / month',
    location: 'Bangalore, India',
    type: 'Internship',
    experience: 'Fresher',
    description: 'Join Google as a Software Engineering Intern and work on projects that impact millions of users worldwide.',
    requiredSkills: ['C++', 'Python', 'DSA', 'Problem Solving'],
    responsibilities: [
      'Write clean, maintainable code',
      'Participate in code reviews',
      'Collaborate with senior engineers on complex features',
      'Debug and fix production issues'
    ],
    postedAt: '1 day ago'
  },
  {
    id: '3',
    title: 'Backend Developer',
    company: 'Microsoft',
    logo: 'https://www.microsoft.com/favicon.ico',
    salary: '15-25 LPA',
    location: 'Hyderabad, India',
    type: 'Full-time',
    experience: 'Fresher',
    description: 'We are seeking a Backend Developer to build scalable services and APIs using Node.js and Azure.',
    requiredSkills: ['Node.js', 'Express', 'MongoDB', 'System Design'],
    responsibilities: [
      'Design and implement scalable backend services',
      'Integrate with third-party APIs and services',
      'Optimize database queries for performance',
      'Maintain high code quality through testing'
    ],
    postedAt: '3 days ago'
  },
  {
    id: '4',
    title: 'Full Stack Developer',
    company: 'TCS',
    logo: 'https://www.tcs.com/favicon.ico',
    salary: '4-7 LPA',
    location: 'Pune, India',
    type: 'Full-time',
    experience: 'Fresher',
    description: 'TCS is looking for Full Stack Developers to work on various enterprise projects.',
    requiredSkills: ['Java', 'Spring Boot', 'React', 'SQL'],
    responsibilities: [
      'Develop end-to-end features for enterprise applications',
      'Work with cross-functional teams to deliver projects',
      'Ensure code quality and adherence to standards',
      'Provide support and maintenance for existing applications'
    ],
    postedAt: '5 days ago'
  }
];

interface JobsProps {
  user: UserProfile;
}

export default function Jobs({ user }: JobsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Full-time' | 'Internship'>('All');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplyPopup, setShowApplyPopup] = useState(false);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [improvementRoadmap, setImprovementRoadmap] = useState<any>(null);

  const filteredJobs = useMemo(() => {
    return JOBS.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           job.company.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === 'All' || job.type === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, filterType]);

  const calculateEligibility = (job: Job) => {
    // Basic matching logic based on user skills and job requirements
    // In a real app, this would be more sophisticated or AI-driven
    const userSkillsList = Object.keys(user.skills).map(s => s.toLowerCase());
    const jobSkills = job.requiredSkills.map(s => s.toLowerCase());
    
    let matches = 0;
    jobSkills.forEach(skill => {
      if (userSkillsList.some(us => us.includes(skill) || skill.includes(us))) {
        matches++;
      }
    });

    // Add some weight based on skill levels
    const avgSkillLevel = Object.values(user.skills).reduce((a, b) => a + b, 0) / 4;
    const levelWeight = (avgSkillLevel / 10) * 40; // Max 40% from level
    const matchWeight = (matches / jobSkills.length) * 60; // Max 60% from keyword match
    
    return Math.min(100, Math.round(levelWeight + matchWeight));
  };

  const getMissingSkills = (job: Job) => {
    const userSkillsList = Object.keys(user.skills).map(s => s.toLowerCase());
    return job.requiredSkills.filter(skill => 
      !userSkillsList.some(us => us.includes(skill.toLowerCase()) || skill.toLowerCase().includes(us))
    );
  };

  const handleApply = () => {
    setShowApplyPopup(true);
    setTimeout(() => setShowApplyPopup(false), 3000);
  };

  const handleImproveToApply = async (job: Job) => {
    setIsGeneratingRoadmap(true);
    try {
      const missing = getMissingSkills(job);
      const roadmap = await geminiService.generateRoadmap({
        ...user,
        targetRole: job.title,
        missingSkills: missing
      });
      setImprovementRoadmap(roadmap);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold text-white">Job Opportunities</h2>
          <p className="text-slate-400">Discover roles tailored to your skills and preparation level.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="text"
              placeholder="Search by title or company..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-11 pr-6 py-3 bg-slate-900/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all text-sm text-white w-72"
            />
          </div>
          <div className="flex p-1 bg-slate-900/50 border border-slate-800 rounded-xl">
            {(['All', 'Full-time', 'Internship'] as const).map((type) => (
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

      {/* Job Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredJobs.map((job) => {
            const eligibility = calculateEligibility(job);
            return (
              <motion.div
                key={job.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-8 hover:border-blue-500/30 transition-all flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 p-3 flex items-center justify-center">
                      <img src={job.logo} alt={job.company} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{job.title}</h3>
                      <p className="text-sm text-slate-500 font-medium">{job.company}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {job.type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <span className="text-xs">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400">{job.salary}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <GraduationCap className="w-4 h-4 text-purple-400" />
                    <span className="text-xs">{job.experience}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="text-xs">{job.postedAt}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-slate-500">Eligibility Match</span>
                    <span className={cn(
                      eligibility > 70 ? "text-emerald-400" : eligibility > 40 ? "text-amber-400" : "text-red-400"
                    )}>{eligibility}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${eligibility}%` }}
                      className={cn(
                        "h-full rounded-full",
                        eligibility > 70 ? "bg-emerald-500" : eligibility > 40 ? "bg-amber-500" : "bg-red-500"
                      )}
                    />
                  </div>
                </div>

                <div className="mt-auto flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedJob(job)}
                    className="flex-1 py-3 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition-all"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={handleApply}
                    className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
                  >
                    Apply Now
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Job Details Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedJob(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-800 flex items-start justify-between sticky top-0 bg-slate-900 z-10">
                <div className="flex gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center justify-center">
                    <img src={selectedJob.logo} alt={selectedJob.company} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-white">{selectedJob.title}</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-blue-400 font-bold">{selectedJob.company}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-700" />
                      <span className="text-slate-500 text-sm">{selectedJob.location}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedJob(null)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-500 hover:text-white transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-10 overflow-y-auto space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2 space-y-10">
                    <section className="space-y-4">
                      <h3 className="text-xl font-bold text-white">Job Description</h3>
                      <p className="text-slate-400 leading-relaxed">{selectedJob.description}</p>
                    </section>

                    <section className="space-y-4">
                      <h3 className="text-xl font-bold text-white">Responsibilities</h3>
                      <ul className="space-y-3">
                        {selectedJob.responsibilities.map((resp, i) => (
                          <li key={i} className="flex items-start gap-3 text-slate-400">
                            <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm leading-relaxed">{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>

                  <div className="space-y-8">
                    <div className="p-8 rounded-[2rem] bg-slate-800/30 border border-slate-800 space-y-6">
                      <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Required Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.requiredSkills.map(skill => (
                          <span key={skill} className="px-3 py-1.5 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-8 rounded-[2rem] bg-blue-600/5 border border-blue-500/20 space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider">Eligibility</h4>
                        <span className="text-xl font-bold text-blue-400">{calculateEligibility(selectedJob)}%</span>
                      </div>
                      <div className="space-y-4">
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Based on your current profile and quiz results, you are a strong match for this role.
                        </p>
                        <button 
                          onClick={() => handleImproveToApply(selectedJob)}
                          disabled={isGeneratingRoadmap}
                          className="w-full py-3 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
                        >
                          {isGeneratingRoadmap ? <RefreshCcw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                          How to become 100% eligible?
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {improvementRoadmap && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 rounded-[2.5rem] bg-slate-800/30 border border-slate-800 space-y-8"
                  >
                    <div className="flex items-center gap-3 text-emerald-400">
                      <Sparkles className="w-5 h-5" />
                      <h3 className="text-xl font-bold">Your Improvement Roadmap</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {improvementRoadmap.steps.slice(0, 4).map((step: any, i: number) => (
                        <div key={i} className="flex gap-4">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 flex-shrink-0">
                            {i + 1}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">{step.title}</h4>
                            <p className="text-xs text-slate-500 mt-1">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="p-8 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-end gap-4 sticky bottom-0">
                <button 
                  onClick={() => setSelectedJob(null)}
                  className="px-8 py-3 rounded-xl border border-slate-800 text-slate-400 font-bold hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleApply}
                  className="px-12 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
                >
                  Confirm Application
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Apply Success Popup */}
      <AnimatePresence>
        {showApplyPopup && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-[100] bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold"
          >
            <CheckCircle2 className="w-6 h-6" />
            Application submitted successfully (Demo)
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
