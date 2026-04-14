import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  MessageSquare, 
  Target, 
  User, 
  Trophy, 
  Settings,
  Briefcase,
  BrainCircuit,
  Mic2,
  FileText,
  Zap
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'roadmap', label: 'Roadmap', icon: Map },
  { id: 'quizzes', label: 'Skill Check', icon: BrainCircuit },
  { id: 'interview', label: 'Mock Interview', icon: MessageSquare },
  { id: 'speech', label: 'Speech Practice', icon: Mic2 },
  { id: 'resume', label: 'Resume Analyzer', icon: FileText },
  { id: 'communication', label: 'Comm Booster', icon: Zap },
  { id: 'companies', label: 'Companies', icon: Target },
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
];

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <div className="w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <BrainCircuit className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            PrepAI
          </h1>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                activeTab === item.id
                  ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                activeTab === item.id ? "text-blue-400" : "text-slate-500"
              )} />
              <span className="font-medium">{item.label}</span>
              {activeTab === item.id && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-800 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600/20 transition-all">
          <User className="w-5 h-5" />
          <span className="font-medium">Sign In</span>
        </button>
      </div>
    </div>
  );
}
