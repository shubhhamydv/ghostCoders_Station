/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';
import Roadmap from './components/Roadmap';
import Interview from './components/Interview';
import SpeechPractice from './components/SpeechPractice';
import Quiz from './components/Quiz';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import CommunicationTool from './components/CommunicationTool';
import Companies from './components/Companies';
import Jobs from './components/Jobs';
import { Roadmap as RoadmapType, UserProfile } from './types';
import { geminiService } from './services/gemini';
import { auth, signInWithGoogle } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleOnboardingComplete = async (data: any) => {
    setIsLoading(true);
    try {
      const generatedRoadmap = await geminiService.generateRoadmap(data);
      setRoadmap(generatedRoadmap);
      setUser({
        uid: firebaseUser?.uid || '1',
        email: firebaseUser?.email || 'user@example.com',
        displayName: firebaseUser?.displayName || 'Alex Johnson',
        academicDetails: {
          branch: data.branch,
          year: data.year,
          college: data.college
        },
        skills: data.skills,
        targetRole: data.targetRole,
        targetCompanies: data.targetCompanies,
        expectedSalary: data.expectedSalary,
        xp: 0,
        level: 1,
        badges: [],
        streak: 0,
        lastActive: new Date().toISOString()
      });
      setActiveTab('dashboard');
    } catch (error) {
      console.error("Error generating roadmap:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center space-y-8">
        <div className="w-24 h-24 rounded-3xl bg-blue-600/20 flex items-center justify-center relative">
          <div className="absolute inset-0 rounded-3xl bg-blue-500/20 animate-ping" />
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin relative z-10" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Initializing PrepAI...</h2>
          <p className="text-slate-400">Setting up your AI placement mentor.</p>
        </div>
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-12 text-center space-y-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full" />
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
            <span className="text-4xl">🚀</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">Welcome to PrepAI</h1>
            <p className="text-slate-400">Your journey to a dream placement starts here. Sign in to begin.</p>
          </div>
          <button 
            onClick={signInWithGoogle}
            className="w-full py-4 bg-white text-slate-900 rounded-2xl font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-3 shadow-xl"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#020617]">
        <Onboarding onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#020617]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <Layout activeTab={activeTab}>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'roadmap' && roadmap && <Roadmap roadmap={roadmap} />}
        {activeTab === 'quizzes' && <Quiz />}
        {activeTab === 'interview' && <Interview />}
        {activeTab === 'speech' && <SpeechPractice />}
        {activeTab === 'resume' && <ResumeAnalyzer />}
        {activeTab === 'communication' && <CommunicationTool />}
        {activeTab === 'companies' && <Companies user={user} />}
        {activeTab === 'jobs' && <Jobs user={user} />}
        {['profile', 'leaderboard'].includes(activeTab) && (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center">
              <span className="text-2xl">🚧</span>
            </div>
            <h3 className="text-xl font-bold text-white">Module Under Construction</h3>
            <p className="text-slate-400 max-w-md">We're working hard to bring the {activeTab} module to life. Stay tuned!</p>
          </div>
        )}
      </Layout>
    </div>
  );
}

