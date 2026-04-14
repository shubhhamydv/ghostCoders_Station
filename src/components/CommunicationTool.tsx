import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Sparkles, 
  ArrowRight, 
  RefreshCcw, 
  Copy, 
  Check,
  Zap,
  Star
} from 'lucide-react';
import { cn } from '../lib/utils';
import { geminiService } from '../services/gemini';

export default function CommunicationTool() {
  const [inputText, setInputText] = useState('');
  const [isImproving, setIsImproving] = useState(false);
  const [variations, setVariations] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleImprove = async () => {
    if (!inputText.trim()) return;
    setIsImproving(true);
    try {
      const result = await geminiService.improveCommunication(inputText);
      setVariations(result.variations);
    } catch (error) {
      console.error(error);
    } finally {
      setIsImproving(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white">Communication Booster</h2>
        <p className="text-slate-400">Convert simple sentences into high-impact professional answers using the STAR method.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Input Section */}
        <div className="space-y-8">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-10 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Your Basic Answer</label>
                <span className="text-xs text-slate-500">{inputText.length} characters</span>
              </div>
              <textarea 
                className="w-full h-48 bg-slate-800/50 border border-slate-700 rounded-[2rem] p-8 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all text-slate-300 resize-none placeholder:text-slate-600"
                placeholder="e.g. I made a project using React and Node.js"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
              />
            </div>

            <button 
              onClick={handleImprove}
              disabled={isImproving || !inputText.trim()}
              className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              {isImproving ? (
                <>
                  <RefreshCcw className="w-5 h-5 animate-spin" />
                  Improving...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-current" />
                  Boost Professionalism
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center gap-3 text-purple-400">
              <Star className="w-5 h-5" />
              <h3 className="font-bold uppercase tracking-wider text-sm">The STAR Method</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <StarStep label="S" title="Situation" desc="Set the context" />
              <StarStep label="T" title="Task" desc="What was required?" />
              <StarStep label="A" title="Action" desc="What did you do?" />
              <StarStep label="R" title="Result" desc="What was the outcome?" />
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-8">
          <AnimatePresence mode="wait">
            {variations.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">AI Suggestions</h3>
                  <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Professional
                  </span>
                </div>
                
                {variations.map((variation, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2rem] p-8 hover:border-blue-500/30 transition-all"
                  >
                    <p className="text-slate-300 leading-relaxed pr-8">{variation}</p>
                    <button 
                      onClick={() => copyToClipboard(variation, i)}
                      className="absolute top-6 right-6 p-2 rounded-lg bg-slate-800 text-slate-500 hover:text-white transition-all"
                    >
                      {copiedIndex === i ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </motion.div>
                ))}

                <button 
                  onClick={() => {
                    setVariations([]);
                    setInputText('');
                  }}
                  className="w-full py-4 rounded-2xl border border-slate-800 text-slate-400 font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Start Over
                </button>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 p-12 bg-slate-900/50 backdrop-blur-xl border border-dashed border-slate-800 rounded-[2.5rem]">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-slate-600" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-slate-400">No suggestions yet</h4>
                  <p className="text-sm text-slate-600 max-w-xs">Enter a basic answer on the left to see professional AI-powered variations here.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function StarStep({ label, title, desc }: any) {
  return (
    <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-800 space-y-1">
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center text-xs font-bold">{label}</span>
        <span className="text-xs font-bold text-white">{title}</span>
      </div>
      <p className="text-[10px] text-slate-500 leading-tight">{desc}</p>
    </div>
  );
}
