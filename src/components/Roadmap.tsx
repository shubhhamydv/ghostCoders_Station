import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Circle, 
  PlayCircle, 
  ExternalLink, 
  Clock,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Roadmap as RoadmapType } from '../types';

interface RoadmapProps {
  roadmap: RoadmapType;
}

export default function Roadmap({ roadmap }: RoadmapProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">{roadmap.title}</h2>
          <p className="text-slate-400">Your personalized path to becoming placement-ready.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-slate-500 font-medium">Overall Progress</p>
            <p className="text-xl font-bold text-blue-400">35%</p>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-slate-800 flex items-center justify-center relative">
             <svg className="w-full h-full -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className="text-blue-500/20"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 28}
                  strokeDashoffset={2 * Math.PI * 28 * (1 - 0.35)}
                  className="text-blue-500"
                />
             </svg>
             <span className="absolute text-xs font-bold">35%</span>
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Connection Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-800" />

        <div className="space-y-12">
          {roadmap.steps.map((step, index) => (
            <motion.div 
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-20"
            >
              {/* Step Indicator */}
              <div className={cn(
                "absolute left-4 top-0 w-8 h-8 rounded-full border-4 border-[#020617] flex items-center justify-center z-10",
                step.status === 'completed' ? "bg-emerald-500 text-white" : 
                step.status === 'in-progress' ? "bg-blue-500 text-white animate-pulse" : "bg-slate-800 text-slate-500"
              )}>
                {step.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : 
                 step.status === 'in-progress' ? <PlayCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
              </div>

              <div className={cn(
                "bg-slate-900/50 backdrop-blur-xl border rounded-3xl p-8 transition-all hover:border-slate-700 group",
                step.status === 'in-progress' ? "border-blue-500/30 ring-1 ring-blue-500/20" : "border-slate-800"
              )}>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold px-2 py-1 rounded bg-slate-800 text-slate-400 uppercase tracking-wider">
                        Step {index + 1}
                      </span>
                      {step.status === 'in-progress' && (
                        <span className="text-xs font-bold px-2 py-1 rounded bg-blue-500/10 text-blue-400 uppercase tracking-wider">
                          Active
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{step.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{step.description}</p>
                    
                    <div className="flex flex-wrap gap-4 pt-4">
                      {step.resources.map((resource, rIndex) => (
                        <a 
                          key={rIndex}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-blue-400 transition-colors"
                        >
                          <BookOpen className="w-4 h-4" />
                          {resource.title}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 min-w-[160px]">
                    <button className={cn(
                      "w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2",
                      step.status === 'completed' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                      "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20"
                    )}>
                      {step.status === 'completed' ? 'Completed' : 'Start Learning'}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
                      <Clock className="w-3 h-3" />
                      Est. 4-6 hours
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
