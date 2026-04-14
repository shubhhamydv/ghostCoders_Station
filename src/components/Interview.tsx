import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Send, 
  Bot, 
  User, 
  Sparkles,
  RefreshCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { geminiService } from '../services/gemini';

export default function Interview() {
  const [isStarted, setIsStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string, feedback?: any }[]>([
    { role: 'ai', text: "Hello! I'm your AI Interviewer. Are you ready to start your mock interview for the Software Engineer role?" }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!currentInput.trim()) return;

    const userMsg = currentInput;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setCurrentInput('');
    setIsLoading(true);

    try {
      // In a real app, we'd send this to Gemini
      const feedback = await geminiService.getInterviewFeedback(
        messages[messages.length - 1].text, // Last AI question
        userMsg,
        'Software Engineer'
      );

      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: "That's a good answer. Let's move to the next question: Can you explain how you handle conflict in a team?",
        feedback 
      }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] space-y-8">
        <div className="w-24 h-24 rounded-full bg-blue-600/20 flex items-center justify-center relative">
          <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
          <Bot className="w-12 h-12 text-blue-500 relative z-10" />
        </div>
        <div className="text-center max-w-md space-y-4">
          <h2 className="text-3xl font-bold text-white">AI Mock Interview</h2>
          <p className="text-slate-400">Practice your interview skills with our advanced AI. Get real-time feedback on your answers, confidence, and clarity.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
          <FeatureCard icon={Video} title="Video & Audio" desc="Simulate real environment" />
          <FeatureCard icon={Sparkles} title="AI Feedback" desc="Detailed answer analysis" />
          <FeatureCard icon={RefreshCcw} title="STAR Method" desc="Learn professional phrasing" />
        </div>
        <button 
          onClick={() => setIsStarted(true)}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 group"
        >
          Start Interview Session
          <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-160px)]">
      {/* Chat Area */}
      <div className="lg:col-span-2 flex flex-col bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
              <Bot className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-white font-bold">AI Interviewer</h3>
              <p className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Analysis Active
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors">
              <Mic className="w-5 h-5" />
            </button>
            <button className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors">
              <Video className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={cn(
              "flex gap-4 max-w-[85%]",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
            )}>
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                msg.role === 'ai' ? "bg-blue-600/20 text-blue-500" : "bg-purple-600/20 text-purple-500"
              )}>
                {msg.role === 'ai' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              <div className="space-y-3">
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed",
                  msg.role === 'ai' ? "bg-slate-800 text-slate-200" : "bg-blue-600 text-white"
                )}>
                  {msg.text}
                </div>
                {msg.feedback && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">AI Feedback</span>
                      <span className="text-xs font-bold px-2 py-1 rounded bg-blue-500/10 text-blue-400">Score: {msg.feedback.score}/10</span>
                    </div>
                    <p className="text-xs text-slate-400 italic">"{msg.feedback.feedback}"</p>
                    <div className="pt-2 border-t border-slate-700">
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Professional Version (STAR):</p>
                      <p className="text-xs text-slate-300">{msg.feedback.professionalAnswer}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-blue-500" />
              </div>
              <div className="bg-slate-800 p-4 rounded-2xl flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-800">
          <div className="relative flex items-center gap-3">
            <input 
              type="text" 
              placeholder="Type your answer here..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
              value={currentInput}
              onChange={e => setCurrentInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !currentInput.trim()}
              className="p-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-lg shadow-blue-600/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Sidebar */}
      <div className="space-y-6">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-8">
          <h3 className="text-lg font-bold text-white mb-6">Real-time Analysis</h3>
          <div className="space-y-6">
            <AnalysisMetric label="Confidence" value={82} color="blue" />
            <AnalysisMetric label="Clarity" value={65} color="purple" />
            <AnalysisMetric label="Body Language" value={90} color="emerald" />
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-8">
          <h3 className="text-lg font-bold text-white mb-4">Interview Tips</h3>
          <div className="space-y-4">
            <TipItem text="Maintain eye contact with the camera" />
            <TipItem text="Use the STAR method for behavioral questions" />
            <TipItem text="Keep your background professional and quiet" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-2">
      <Icon className="w-5 h-5 text-blue-400 mx-auto" />
      <h4 className="text-sm font-bold text-white">{title}</h4>
      <p className="text-xs text-slate-500">{desc}</p>
    </div>
  );
}

function AnalysisMetric({ label, value, color }: any) {
  const colors: any = {
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    emerald: "bg-emerald-500"
  };
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-slate-400 font-medium">{label}</span>
        <span className="text-white font-bold">{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className={cn("h-full rounded-full", colors[color])}
        />
      </div>
    </div>
  );
}

function TipItem({ text }: { text: string }) {
  return (
    <div className="flex gap-3">
      <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-slate-400 leading-relaxed">{text}</p>
    </div>
  );
}
