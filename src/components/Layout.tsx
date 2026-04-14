import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Search, Zap } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
}

export default function Layout({ children, activeTab }: LayoutProps) {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#020617] text-slate-200">
      {/* Header */}
      <header className="h-20 border-b border-slate-800/50 flex items-center justify-between px-8 sticky top-0 bg-[#020617]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <div className="relative w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search roadmap, companies, or topics..." 
              className="w-full bg-slate-900/50 border border-slate-800 rounded-full py-2.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <Zap className="w-4 h-4 fill-current" />
            <span className="text-sm font-bold">7 Day Streak</span>
          </div>
          
          <button className="relative p-2 rounded-full hover:bg-slate-800 transition-colors">
            <Bell className="w-5 h-5 text-slate-400" />
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border-2 border-[#020617]" />
          </button>

          <div className="flex items-center gap-3 pl-6 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-200">Alex Johnson</p>
              <p className="text-xs text-slate-500">Level 12 • 2,450 XP</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-slate-800" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-8 max-w-7xl mx-auto w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
