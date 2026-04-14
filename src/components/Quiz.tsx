import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BrainCircuit, 
  Timer, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RefreshCcw,
  Trophy,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { geminiService } from '../services/gemini';

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export default function Quiz() {
  const [topic, setTopic] = useState('DSA');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const startQuiz = async () => {
    setIsLoading(true);
    try {
      const data = await geminiService.generateQuiz(topic, difficulty);
      setQuestions(data.questions);
      setIsStarted(true);
      setTimeLeft(60);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let timer: any;
    if (isStarted && !isFinished && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && !isFinished) {
      handleNext();
    }
    return () => clearInterval(timer);
  }, [isStarted, isFinished, timeLeft]);

  const handleOptionSelect = (index: number) => {
    if (showExplanation) return;
    setSelectedOption(index);
    setShowExplanation(true);
    if (index === questions[currentIndex].correctIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
      setShowExplanation(false);
      setTimeLeft(60);
    } else {
      setIsFinished(true);
    }
  };

  if (!isStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] space-y-8">
        <div className="w-24 h-24 rounded-[2rem] bg-blue-600/20 flex items-center justify-center relative">
          <div className="absolute inset-0 rounded-[2rem] bg-blue-500/20 animate-ping" />
          <BrainCircuit className="w-12 h-12 text-blue-500 relative z-10" />
        </div>
        <div className="text-center max-w-md space-y-4">
          <h2 className="text-3xl font-bold text-white">Skill Verification</h2>
          <p className="text-slate-400">Test your knowledge and identify your weaknesses. Our AI will generate a custom quiz for you.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-xl">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 ml-1">Select Topic</label>
            <select 
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all appearance-none text-white"
              value={topic}
              onChange={e => setTopic(e.target.value)}
            >
              <option>DSA</option>
              <option>Aptitude</option>
              <option>Operating Systems</option>
              <option>DBMS</option>
              <option>Computer Networks</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 ml-1">Difficulty</label>
            <select 
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all appearance-none text-white"
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
        </div>

        <button 
          onClick={startQuiz}
          disabled={isLoading}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 group disabled:opacity-50"
        >
          {isLoading ? 'Generating Quiz...' : 'Start Quiz Now'}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    );
  }

  if (isFinished) {
    const percentage = (score / questions.length) * 100;
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] space-y-8">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-6"
        >
          <div className="w-32 h-32 rounded-full bg-blue-600/20 flex items-center justify-center mx-auto relative">
            <Trophy className="w-16 h-16 text-blue-500" />
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
          </div>
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">Quiz Completed!</h2>
            <p className="text-slate-400">You scored <span className="text-blue-400 font-bold">{score} out of {questions.length}</span></p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm mx-auto">
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Accuracy</p>
              <p className="text-xl font-bold text-white">{percentage}%</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
              <p className="text-xs text-slate-500 uppercase font-bold mb-1">XP Gained</p>
              <p className="text-xl font-bold text-emerald-400">+{score * 50}</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center pt-4">
            <button 
              onClick={() => setIsStarted(false)}
              className="px-6 py-3 rounded-xl border border-slate-800 text-slate-400 font-bold hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              Try Again
            </button>
            <button className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">
              View Weaknesses
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center">
            <BrainCircuit className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h3 className="text-white font-bold">{topic} Quiz</h3>
            <p className="text-xs text-slate-500 font-medium">Question {currentIndex + 1} of {questions.length}</p>
          </div>
        </div>
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl border font-bold",
          timeLeft < 10 ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-slate-900/50 border-slate-800 text-slate-400"
        )}>
          <Timer className="w-4 h-4" />
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>

      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-8"
        >
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-10 space-y-8">
            <h4 className="text-2xl font-bold text-white leading-relaxed">
              {currentQuestion.question}
            </h4>

            <div className="grid grid-cols-1 gap-4">
              {currentQuestion.options.map((option, index) => {
                const isCorrect = index === currentQuestion.correctIndex;
                const isSelected = index === selectedOption;
                
                return (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(index)}
                    disabled={showExplanation}
                    className={cn(
                      "w-full p-6 rounded-2xl border text-left transition-all flex items-center justify-between group",
                      !showExplanation && "hover:border-blue-500/50 hover:bg-blue-500/5 border-slate-800 text-slate-300",
                      showExplanation && isCorrect && "bg-emerald-500/10 border-emerald-500/50 text-emerald-400",
                      showExplanation && isSelected && !isCorrect && "bg-red-500/10 border-red-500/50 text-red-400",
                      showExplanation && !isCorrect && !isSelected && "border-slate-800 text-slate-600"
                    )}
                  >
                    <span className="font-medium">{option}</span>
                    {showExplanation && isCorrect && <CheckCircle2 className="w-5 h-5" />}
                    {showExplanation && isSelected && !isCorrect && <XCircle className="w-5 h-5" />}
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700 space-y-2"
              >
                <div className="flex items-center gap-2 text-blue-400 font-bold text-sm uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4" />
                  Explanation
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </motion.div>
            )}
          </div>

          {showExplanation && (
            <div className="flex justify-end">
              <button 
                onClick={handleNext}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 group"
              >
                {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
