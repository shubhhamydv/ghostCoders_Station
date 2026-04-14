import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  GraduationCap, 
  Code2, 
  Building2, 
  IndianRupee, 
  ArrowRight, 
  Sparkles,
  ChevronRight,
  Target
} from 'lucide-react';
import { cn } from '../lib/utils';

interface OnboardingProps {
  onComplete: (data: any) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    branch: '',
    year: '',
    college: '',
    skills: {
      dsa: 5,
      aptitude: 5,
      coreSubjects: 5,
      communication: 5
    },
    targetRole: '',
    targetCompanies: [] as string[],
    expectedSalary: ''
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const companies = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'TCS', 'Infosys', 'Wipro', 'Zomato', 'Swiggy', 'Uber'];

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center py-12">
      <div className="w-full max-w-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-12 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-600/20 blur-[100px] rounded-full" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-12">
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    step >= i ? "w-8 bg-blue-500" : "w-4 bg-slate-800"
                  )} 
                />
              ))}
            </div>
            <span className="text-slate-500 text-sm font-medium">Step {step} of 4</span>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-bold text-white mb-3">Let's build your profile</h2>
                  <p className="text-slate-400">Tell us about your academic background to personalize your journey.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400 ml-1">Branch of Study</label>
                    <div className="relative">
                      <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input 
                        type="text" 
                        placeholder="e.g. Computer Science"
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                        value={formData.branch}
                        onChange={e => setFormData({...formData, branch: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-400 ml-1">Current Year</label>
                      <select 
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all appearance-none"
                        value={formData.year}
                        onChange={e => setFormData({...formData, year: e.target.value})}
                      >
                        <option value="">Select Year</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-400 ml-1">College Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. IIT Bombay"
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                        value={formData.college}
                        onChange={e => setFormData({...formData, college: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-bold text-white mb-3">Assess your skills</h2>
                  <p className="text-slate-400">Be honest! This helps our AI identify your weaknesses.</p>
                </div>

                <div className="space-y-8">
                  {Object.entries(formData.skills).map(([skill, value]) => (
                    <div key={skill} className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-slate-300 capitalize">{skill.replace(/([A-Z])/g, ' $1')}</label>
                        <span className="text-blue-400 font-bold">{value}/10</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        value={value}
                        onChange={e => setFormData({
                          ...formData, 
                          skills: { ...formData.skills, [skill]: parseInt(e.target.value) }
                        })}
                        className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-bold text-white mb-3">Target Career</h2>
                  <p className="text-slate-400">Where do you see yourself working?</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400 ml-1">Target Job Role</label>
                    <div className="relative">
                      <Code2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input 
                        type="text" 
                        placeholder="e.g. Full Stack Developer"
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                        value={formData.targetRole}
                        onChange={e => setFormData({...formData, targetRole: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400 ml-1">Preferred Companies</label>
                    <div className="flex flex-wrap gap-2">
                      {companies.map(company => (
                        <button
                          key={company}
                          onClick={() => {
                            const current = formData.targetCompanies;
                            if (current.includes(company)) {
                              setFormData({...formData, targetCompanies: current.filter(c => c !== company)});
                            } else {
                              setFormData({...formData, targetCompanies: [...current, company]});
                            }
                          }}
                          className={cn(
                            "px-4 py-2 rounded-xl border text-sm font-medium transition-all",
                            formData.targetCompanies.includes(company)
                              ? "bg-blue-600 border-blue-500 text-white"
                              : "border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300"
                          )}
                        >
                          {company}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-10 h-10 text-blue-500" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-3">Ready to launch!</h2>
                  <p className="text-slate-400">Our AI is preparing your personalized placement roadmap based on your profile.</p>
                </div>

                <div className="bg-slate-800/30 border border-slate-800 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                      <Target className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Target Goal</p>
                      <p className="text-white font-bold">{formData.targetRole || 'Software Engineer'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Dream Companies</p>
                      <p className="text-white font-bold">{formData.targetCompanies.join(', ') || 'Top Tech Companies'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-12 flex gap-4">
            {step > 1 && (
              <button 
                onClick={prevStep}
                className="flex-1 py-4 rounded-2xl border border-slate-800 text-slate-400 font-bold hover:bg-slate-800 transition-all"
              >
                Back
              </button>
            )}
            <button 
              onClick={step === 4 ? () => onComplete(formData) : nextStep}
              className="flex-[2] py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group"
            >
              {step === 4 ? 'Generate My Roadmap' : 'Continue'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { AnimatePresence } from 'motion/react';
