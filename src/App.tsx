import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useStationStore } from "@/store/useStationStore";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/dashboard/Home";
import WeeklyPlan from "./pages/dashboard/WeeklyPlan";
import Quizzes from "./pages/dashboard/Quizzes";
import InterviewPrep from "./pages/dashboard/InterviewPrep";
import Vault from "./pages/dashboard/Vault";
import Social from "./pages/dashboard/Social";
import Resume from "./pages/dashboard/Resume";
import Profile from "./pages/dashboard/Profile";
import SettingsPage from "./pages/dashboard/SettingsPage";
import Companies from "./pages/dashboard/Companies";
import Jobs from "./pages/dashboard/Jobs";
import SpeechPractice from "./pages/dashboard/SpeechPractice";
import MockInterview from "./pages/dashboard/MockInterview";
import WeaknessDetector from "./pages/dashboard/WeaknessDetector";
import PlacementScore from "./pages/dashboard/PlacementScore";
import CompanyPrep from "./pages/dashboard/CompanyPrep";
import Last7Days from "./pages/dashboard/Last7Days";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useStationStore();
  const themeClass =
    theme === 'commerce' ? 'theme-commerce' :
    theme === 'arts' ? 'theme-arts' :
    theme === 'violet' ? 'theme-violet' :
    theme === 'forest' ? 'theme-forest' :
    theme === 'mocha' ? 'theme-mocha' : '';
  return <div className={themeClass}>{children}</div>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ThemeWrapper>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<Home />} />
              <Route path="weekly" element={<WeeklyPlan />} />
              <Route path="quizzes" element={<Quizzes />} />
              <Route path="interview" element={<InterviewPrep />} />
              <Route path="speech" element={<SpeechPractice />} />
              <Route path="mock-interview" element={<MockInterview />} />
              <Route path="weakness" element={<WeaknessDetector />} />
              <Route path="readiness" element={<PlacementScore />} />
              <Route path="company-prep" element={<CompanyPrep />} />
              <Route path="last-7-days" element={<Last7Days />} />
              <Route path="vault" element={<Vault />} />
              <Route path="social" element={<Social />} />
              <Route path="resume" element={<Resume />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="companies" element={<Companies />} />
              <Route path="jobs" element={<Jobs />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ThemeWrapper>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
