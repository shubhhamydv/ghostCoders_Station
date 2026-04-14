import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Mic, 
  Sparkles,
  Music,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';

const lyrics = [
  "I am a passionate Software Engineer",
  "With a strong foundation in Data Structures",
  "And experience in building scalable web apps.",
  "I thrive in collaborative environments",
  "And I am always eager to learn new things.",
  "My goal is to solve complex problems",
  "Using efficient and clean code."
];

export default function SpeechPractice() {
  const [currentLine, setCurrentLine] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            if (currentLine < lyrics.length - 1) {
              setCurrentLine(c => c + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return 100;
            }
          }
          return p + 2;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentLine]);

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white">Speech Karaoke</h2>
        <p className="text-slate-400">Improve your fluency and reduce hesitation by practicing your introduction in a rhythmic style.</p>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[3rem] p-12 relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-800">
          <motion.div 
            className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            animate={{ width: `${((currentLine + progress/100) / lyrics.length) * 100}%` }}
          />
        </div>

        <div className="space-y-12 relative z-10">
          <div className="flex flex-col items-center justify-center min-h-[200px] space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentLine}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1, y: -20 }}
                className="text-center"
              >
                <h3 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                  {lyrics[currentLine].split(' ').map((word, i) => (
                    <span key={i} className="inline-block mr-3">
                      {word}
                    </span>
                  ))}
                </h3>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center gap-8">
              <button 
                onClick={() => {
                  setIsPlaying(!isPlaying);
                  if (!isPlaying) setProgress(0);
                }}
                className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl",
                  isPlaying ? "bg-slate-800 text-slate-200" : "bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/20"
                )}
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
              </button>

              <button 
                onClick={() => setIsRecording(!isRecording)}
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center transition-all",
                  isRecording ? "bg-red-500 text-white animate-pulse" : "bg-slate-800 text-slate-400 hover:text-white"
                )}
              >
                <Mic className="w-6 h-6" />
              </button>

              <button 
                onClick={() => {
                  setCurrentLine(0);
                  setProgress(0);
                  setIsPlaying(false);
                }}
                className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:text-white transition-all"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-slate-800/30 border border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <Music className="w-5 h-5 text-purple-400" />
                <h4 className="font-bold text-white">Rhythm Guide</h4>
              </div>
              <p className="text-sm text-slate-400">Follow the highlight and maintain a steady pace. This helps in building muscle memory for professional introductions.</p>
            </div>
            <div className="p-6 rounded-3xl bg-slate-800/30 border border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h4 className="font-bold text-white">AI Fluency Score</h4>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-[75%] bg-amber-500" />
                </div>
                <span className="text-amber-500 font-bold">75%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-xl font-bold text-white">Full Script</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lyrics.map((line, i) => (
            <div 
              key={i}
              className={cn(
                "p-4 rounded-2xl border transition-all",
                currentLine === i ? "bg-blue-600/10 border-blue-500/50 text-blue-400" : "bg-slate-900/50 border-slate-800 text-slate-500"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold opacity-50">{i + 1}</span>
                <p className="text-sm font-medium">{line}</p>
                {i < currentLine && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
