import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Lightbulb,
  ArrowRight,
  RefreshCcw,
  FileSearch
} from 'lucide-react';
import { cn } from '../lib/utils';
import { geminiService } from '../services/gemini';

export default function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await geminiService.analyzeResume(resumeText);
      setAnalysis(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white">AI Resume Analyzer</h2>
        <p className="text-slate-400">Upload your resume text to get instant AI-powered feedback and improvement suggestions.</p>
      </div>

      {!analysis ? (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[3rem] p-10 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Paste Resume Text</label>
              <span className="text-xs text-slate-500">{resumeText.length} characters</span>
            </div>
            <textarea 
              className="w-full h-64 bg-slate-800/50 border border-slate-700 rounded-[2rem] p-8 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all text-slate-300 resize-none placeholder:text-slate-600"
              placeholder="Paste your resume content here (Experience, Projects, Skills...)"
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-center">
            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !resumeText.trim()}
              className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-3 group disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCcw className="w-5 h-5 animate-spin" />
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analyze with AI
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <FeatureItem icon={FileSearch} title="ATS Optimization" desc="Check if your resume is machine-readable" />
            <FeatureItem icon={CheckCircle2} title="Skill Gap Analysis" desc="Identify missing technical skills" />
            <FeatureItem icon={Lightbulb} title="Better Phrasing" desc="Convert passive points to active ones" />
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Missing Skills */}
            <div className="lg:col-span-1 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
              <div className="flex items-center gap-3 text-amber-400">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-bold uppercase tracking-wider text-sm">Missing Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.missingSkills.map((skill: string) => (
                  <span key={skill} className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Improvement Tips */}
            <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
              <div className="flex items-center gap-3 text-blue-400">
                <Lightbulb className="w-5 h-5" />
                <h3 className="font-bold uppercase tracking-wider text-sm">Key Improvement Tips</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analysis.tips.map((tip: string, i: number) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700 text-xs text-slate-300 leading-relaxed">
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Phrasing Suggestions */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-8 space-y-8">
            <div className="flex items-center gap-3 text-purple-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold uppercase tracking-wider text-sm">Phrasing Suggestions</h3>
            </div>
            <div className="space-y-4">
              {analysis.phrasingSuggestions.map((item: any, i: number) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-800 space-y-2">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Original</p>
                    <p className="text-sm text-slate-400 italic">"{item.original}"</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-blue-600/10 border border-blue-500/30 space-y-2">
                    <p className="text-[10px] text-blue-500 font-bold uppercase">Improved (AI Suggested)</p>
                    <p className="text-sm text-blue-100 font-medium">"{item.improved}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <button 
              onClick={() => {
                setAnalysis(null);
                setResumeText('');
              }}
              className="px-8 py-4 rounded-2xl border border-slate-800 text-slate-400 font-bold hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              Analyze Another Resume
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function FeatureItem({ icon: Icon, title, desc }: any) {
  return (
    <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-800 text-center space-y-2">
      <Icon className="w-6 h-6 text-blue-400 mx-auto mb-2" />
      <h4 className="text-sm font-bold text-white">{title}</h4>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}
