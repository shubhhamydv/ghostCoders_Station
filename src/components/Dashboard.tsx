import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowUpRight,
  Target,
  MessageSquare,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const data = [
  { name: 'Week 1', score: 45 },
  { name: 'Week 2', score: 52 },
  { name: 'Week 3', score: 48 },
  { name: 'Week 4', score: 61 },
  { name: 'Week 5', score: 55 },
  { name: 'Week 6', score: 72 },
  { name: 'Week 7', score: 78 },
];

const skillData = [
  { name: 'DSA', value: 85, color: '#3b82f6' },
  { name: 'Aptitude', value: 70, color: '#8b5cf6' },
  { name: 'System Design', value: 45, color: '#ec4899' },
  { name: 'Communication', value: 90, color: '#10b981' },
  { name: 'Core Subjects', value: 65, color: '#f59e0b' },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back, Alex! 👋</h2>
          <p className="text-slate-400">You're on track to reach your target of <span className="text-blue-400 font-medium">Google SDE-1</span>.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95">
          <Zap className="w-4 h-4 fill-current" />
          Start Daily Practice
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Overall Readiness" 
          value="78%" 
          change="+12%" 
          icon={Target} 
          color="blue"
        />
        <StatCard 
          title="Questions Solved" 
          value="245" 
          change="+18" 
          icon={CheckCircle2} 
          color="green"
        />
        <StatCard 
          title="Mock Interviews" 
          value="12" 
          change="+2" 
          icon={MessageSquare} 
          color="purple"
        />
        <StatCard 
          title="Weak Topics" 
          value="4" 
          change="-2" 
          icon={AlertCircle} 
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Readiness Trend */}
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white">Readiness Trend</h3>
            <select className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>Last 30 Days</option>
              <option>Last 3 Months</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Breakdown */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8">
          <h3 className="text-xl font-bold text-white mb-8">Skill Breakdown</h3>
          <div className="space-y-6">
            {skillData.map((skill) => (
              <div key={skill.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-medium">{skill.name}</span>
                  <span className="text-white font-bold">{skill.value}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.value}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: skill.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 font-medium transition-all flex items-center justify-center gap-2 group">
            View Detailed Analysis
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Daily Task Tracker */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-white">Daily Task Tracker</h3>
            <p className="text-sm text-slate-500">Complete these tasks to maintain your streak.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
            <Zap className="w-4 h-4 fill-current" />
            <span className="text-sm font-bold">7 Day Streak</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TaskItem title="Solve 2 DSA Problems" desc="Focus on Dynamic Programming" completed={true} />
          <TaskItem title="Mock Interview Session" desc="Practice behavioral questions" completed={false} />
          <TaskItem title="Revise OS Concepts" desc="Process Scheduling & Deadlocks" completed={false} />
        </div>
      </div>
    </div>
  );
}

function TaskItem({ title, desc, completed }: any) {
  return (
    <div className={cn(
      "p-6 rounded-2xl border transition-all flex items-start gap-4",
      completed ? "bg-emerald-500/5 border-emerald-500/20" : "bg-slate-800/30 border-slate-800"
    )}>
      <div className={cn(
        "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1",
        completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-700"
      )}>
        {completed && <CheckCircle2 className="w-4 h-4" />}
      </div>
      <div>
        <h4 className={cn("font-bold text-sm", completed ? "text-emerald-400" : "text-white")}>{title}</h4>
        <p className="text-xs text-slate-500 mt-1">{desc}</p>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon: Icon, color }: any) {
  const colors: any = {
    blue: "from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/20",
    green: "from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/20",
    purple: "from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/20",
    amber: "from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/20",
  };

  return (
    <div className={cn(
      "relative overflow-hidden p-6 rounded-3xl border bg-gradient-to-br transition-all hover:scale-[1.02] duration-300",
      colors[color]
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-xl bg-white/5 border border-white/10">
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs font-bold px-2 py-1 rounded-full bg-white/5">
          {change}
        </span>
      </div>
      <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
      <h4 className="text-2xl font-bold text-white">{value}</h4>
    </div>
  );
}
