import { create } from 'zustand';

export type Domain = 'engineering' | 'commerce' | 'arts';
export type ThemeOption = 'engineering' | 'commerce' | 'arts' | 'violet' | 'forest' | 'mocha';
export type Language = 'en' | 'hi';

interface UserProfile {
  name: string;
  state: string;
  city: string;
  college: string;
  domain: Domain;
  specialization: string;
  year: string;
  dreamCompany: string;
  dreamJob: string;
  targetSalary: string;
  timeline: string;
  personalityScore: { iq: number; eq: number; rq: number };
  weakPoints: string[];
}

interface StationState {
  domain: Domain;
  theme: ThemeOption;
  language: Language;
  isLoggedIn: boolean;
  user: UserProfile | null;
  rank: number;
  totalStudents: number;
  streak: number;
  tasksDone: number;
  focusMinutes: number;
  weeklyGoalProgress: number;
  quizScores: { iq: number; eq: number; rq: number };

  setDomain: (d: Domain) => void;
  setTheme: (t: ThemeOption) => void;
  setLanguage: (l: Language) => void;
  login: (user: UserProfile) => void;
  logout: () => void;
  boostRank: (amount: number) => void;
  completeTask: () => void;
  addFocusMinutes: (m: number) => void;
  setQuizScores: (s: { iq: number; eq: number; rq: number }) => void;
  addWeakPoint: (point: string) => void;
  removeWeakPoint: (point: string) => void;
}

export const useStationStore = create<StationState>((set) => ({
  domain: 'engineering',
  theme: 'engineering',
  language: 'en',
  isLoggedIn: false,
  user: null,
  rank: 1247,
  totalStudents: 5000,
  streak: 7,
  tasksDone: 23,
  focusMinutes: 0,
  weeklyGoalProgress: 62,
  quizScores: { iq: 0, eq: 0, rq: 0 },

  setDomain: (domain) => set({ domain, theme: domain }),
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language }),
  login: (user) => set({ isLoggedIn: true, user, domain: user.domain, theme: user.domain }),
  logout: () => set({ isLoggedIn: false, user: null }),
  boostRank: (amount) => set((s) => ({ rank: Math.max(1, s.rank - amount) })),
  completeTask: () => set((s) => ({ tasksDone: s.tasksDone + 1, weeklyGoalProgress: Math.min(100, s.weeklyGoalProgress + 5) })),
  addFocusMinutes: (m) => set((s) => ({ focusMinutes: s.focusMinutes + m })),
  setQuizScores: (scores) => set({ quizScores: scores }),
  addWeakPoint: (point) => set((s) => {
    if (!s.user) return {};
    const weakPoints = [...(s.user.weakPoints || [])];
    if (!weakPoints.includes(point)) weakPoints.push(point);
    return { user: { ...s.user, weakPoints } };
  }),
  removeWeakPoint: (point) => set((s) => {
    if (!s.user) return {};
    return { user: { ...s.user, weakPoints: (s.user.weakPoints || []).filter(w => w !== point) } };
  }),
}));

// Domain content configurations
export const domainConfig = {
  engineering: {
    label: 'Engineering',
    labelHi: 'इंजीनियरिंग',
    tag: 'TECH',
    affirmation: '"The engineer who solves today\'s problem builds tomorrow\'s infrastructure."',
    affirmationHi: '"जो इंजीनियर आज की समस्या हल करता है, वह कल का बुनियादी ढांचा बनाता है।"',
    quizTypes: ['Rapid Fire', 'Code Debug', 'System Design', 'Aptitude', 'Placement Guarantee'],
    quizPopupOptions: ['Data Structures & Algorithms', 'System Design', 'Operating Systems', 'Database Management', 'Web Development'],
    todoItems: ['Solve 5 DSA problems on Arrays', 'Watch System Design video — Load Balancers', 'Practice SQL joins — 10 queries', 'Read OS chapter on Process Scheduling'],
    vaultTopics: ['DSA', 'System Design', 'DBMS', 'Operating Systems', 'Networking', 'Web Dev'],
    socialFeed: [
      'Priya (TCS) moved to Top 5% in Mumbai',
      'Arjun cleared Infosys Round 2 from Pune',
      'Neha got placed at Wipro — 6.5 LPA from Bangalore',
    ],
    interviewText: 'Target companies hiring in your area: TCS, Infosys, Wipro, Cognizant, Accenture',
    weeklyTopics: ['Arrays & Hashing', 'Trees & Graphs', 'Dynamic Programming', 'System Design Basics', 'SQL & DBMS', 'OS Concepts', 'Mock Interview'],
    companies: ['TCS', 'Infosys', 'Wipro', 'Google', 'Microsoft', 'Amazon'],
    weeklyResources: {
      'Arrays & Hashing': { videos: ['https://www.youtube.com/watch?v=KLlXCFG5TnA', 'https://www.youtube.com/watch?v=0IAPZzGSbME'], pdfs: ['Arrays cheat sheet', 'Hashing patterns guide'] },
      'Trees & Graphs': { videos: ['https://www.youtube.com/watch?v=fAAZixBzIAI'], pdfs: ['Tree traversal notes', 'Graph algorithms summary'] },
      'Dynamic Programming': { videos: ['https://www.youtube.com/watch?v=oBt53YbR9Kk'], pdfs: ['DP patterns handbook'] },
      'System Design Basics': { videos: ['https://www.youtube.com/watch?v=xpDnVSmNFX0'], pdfs: ['System Design primer'] },
      'SQL & DBMS': { videos: ['https://www.youtube.com/watch?v=HXV3zeQKqGY'], pdfs: ['SQL commands cheat sheet'] },
      'OS Concepts': { videos: ['https://www.youtube.com/watch?v=26QPDBe-NB8'], pdfs: ['OS fundamentals notes'] },
      'Mock Interview': { videos: ['https://www.youtube.com/watch?v=1qw5ITr3k9E'], pdfs: ['Interview preparation guide'] },
    },
    companyData: {
      'TCS': { seats: 40000, avgSalary: '3.6-7 LPA', cities: ['Mumbai', 'Pune', 'Chennai', 'Hyderabad', 'Bangalore'], eligibility: '60% aggregate, no backlogs', process: 'Online Test → Technical → HR' },
      'Infosys': { seats: 35000, avgSalary: '3.6-8 LPA', cities: ['Mysore', 'Pune', 'Hyderabad', 'Bangalore'], eligibility: '65% aggregate, no backlogs', process: 'Online Test → Technical → HR' },
      'Wipro': { seats: 25000, avgSalary: '3.5-6.5 LPA', cities: ['Bangalore', 'Hyderabad', 'Chennai', 'Pune'], eligibility: '60% aggregate', process: 'Online Test → Technical → HR' },
      'Google': { seats: 500, avgSalary: '25-45 LPA', cities: ['Bangalore', 'Hyderabad', 'Gurgaon'], eligibility: 'Top tier colleges, strong DSA', process: 'Phone Screen → 4-5 Onsite → Team Match' },
      'Microsoft': { seats: 800, avgSalary: '18-35 LPA', cities: ['Hyderabad', 'Bangalore', 'Noida'], eligibility: 'Strong problem solving', process: 'Online → Phone → Onsite (4 rounds)' },
      'Amazon': { seats: 1200, avgSalary: '20-40 LPA', cities: ['Hyderabad', 'Bangalore', 'Gurgaon'], eligibility: 'DSA + System Design', process: 'Online → Phone → Onsite (5 rounds)' },
    },
  },
  commerce: {
    label: 'Commerce',
    labelHi: 'वाणिज्य',
    tag: 'FINANCE',
    affirmation: '"In the world of finance, discipline is the currency that compounds."',
    affirmationHi: '"वित्त की दुनिया में, अनुशासन वह मुद्रा है जो चक्रवृद्धि होती है।"',
    quizTypes: ['Speed Mathematics', 'Case Study', 'Quantitative Analysis', 'Reasoning', 'Banking Guarantee'],
    quizPopupOptions: ['Quantitative Aptitude', 'Banking Awareness', 'Financial Statements', 'Reasoning Ability', 'Current Affairs'],
    todoItems: ['Practice 20 Quant problems — Profit & Loss', 'Read banking awareness — RBI policies', 'Solve reasoning puzzles — Seating arrangement', 'Review financial statements analysis'],
    vaultTopics: ['Quantitative Aptitude', 'Reasoning', 'Banking Awareness', 'Financial Analysis', 'Economics', 'Current Affairs'],
    socialFeed: [
      'Rohit cleared SBI PO Prelims from Delhi',
      'Anjali (IBPS Clerk) moved to Top 3% in Kolkata',
      'Vikram got selected for RBI Grade B from Chennai',
    ],
    interviewText: 'Upcoming bank exams: SBI PO, IBPS Clerk, RBI Grade B, NABARD',
    weeklyTopics: ['Number System', 'Profit & Loss', 'Data Interpretation', 'Syllogisms', 'Banking GK', 'English Grammar', 'Mock Test'],
    companies: ['SBI', 'HDFC Bank', 'ICICI', 'RBI', 'NABARD', 'Kotak'],
    weeklyResources: {
      'Number System': { videos: ['https://www.youtube.com/watch?v=SjlmCbnD99o'], pdfs: ['Number system shortcuts'] },
      'Profit & Loss': { videos: ['https://www.youtube.com/watch?v=sMGElBhW_K4'], pdfs: ['Profit & Loss formulas'] },
      'Data Interpretation': { videos: ['https://www.youtube.com/watch?v=4N7kqm2yHxI'], pdfs: ['DI practice sets'] },
      'Syllogisms': { videos: ['https://www.youtube.com/watch?v=UsMzzv6CZ2Y'], pdfs: ['Syllogism rules'] },
      'Banking GK': { videos: ['https://www.youtube.com/watch?v=cg8F9u_KmQ4'], pdfs: ['Banking awareness capsule'] },
      'English Grammar': { videos: ['https://www.youtube.com/watch?v=QhBrz0OvbQI'], pdfs: ['Grammar rules handbook'] },
      'Mock Test': { videos: ['https://www.youtube.com/watch?v=3IYG5B5yBT0'], pdfs: ['Previous year papers'] },
    },
    companyData: {
      'SBI': { seats: 2000, avgSalary: '8-14 LPA', cities: ['All India'], eligibility: 'Graduate, 21-30 years', process: 'Prelims → Mains → Interview' },
      'HDFC Bank': { seats: 5000, avgSalary: '4-8 LPA', cities: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai'], eligibility: 'Graduate', process: 'Online Test → GD → Interview' },
      'ICICI': { seats: 3000, avgSalary: '4-7 LPA', cities: ['Mumbai', 'Hyderabad', 'Chennai'], eligibility: 'Graduate, 55%', process: 'Aptitude → GD → Interview' },
      'RBI': { seats: 400, avgSalary: '12-20 LPA', cities: ['Mumbai', 'Delhi', 'Chennai', 'Kolkata'], eligibility: 'Graduate, 60%', process: 'Phase I → Phase II → Interview' },
      'NABARD': { seats: 200, avgSalary: '10-16 LPA', cities: ['Mumbai', 'Regional offices'], eligibility: 'Graduate/PG, 60%', process: 'Prelims → Mains → Interview' },
      'Kotak': { seats: 2000, avgSalary: '4-7 LPA', cities: ['Mumbai', 'Pune', 'Delhi'], eligibility: 'Graduate', process: 'Aptitude → Interview' },
    },
  },
  arts: {
    label: 'Arts',
    labelHi: 'कला / सिविल सेवा',
    tag: 'CIVIL SERVICES',
    affirmation: '"A nation\'s strength lies in the clarity of its administrators."',
    affirmationHi: '"एक राष्ट्र की ताकत उसके प्रशासकों की स्पष्टता में निहित है।"',
    quizTypes: ['Rapid Prelims', 'Essay Analysis', 'Current Affairs', 'Ethics & Integrity', 'UPSC Guarantee'],
    quizPopupOptions: ['Indian History', 'Indian Polity', 'Geography', 'Economy', 'Ethics & Governance'],
    todoItems: ['Read Laxmikanth Chapter 12 — Fundamental Rights', 'Write practice essay — Federalism', 'Current affairs — last 30 days review', 'Map work — Rivers of India'],
    vaultTopics: ['History', 'Polity', 'Geography', 'Economy', 'Ethics', 'Current Affairs'],
    socialFeed: [
      'Meera (IAS 2024) cleared Mains from Jaipur',
      'Suresh moved to Top 1% UPSC aspirants in Lucknow',
      'Kavita cleared IFS interview round from Bhopal',
    ],
    interviewText: 'UPSC Calendar: Prelims June, Mains September, Interview January',
    weeklyTopics: ['Ancient India', 'Indian Polity', 'Physical Geography', 'Indian Economy', 'Ethics Case Studies', 'Current Affairs', 'Answer Writing'],
    companies: ['IAS', 'IPS', 'IFS', 'IRS', 'IRTS', 'State PCS'],
    weeklyResources: {
      'Ancient India': { videos: ['https://www.youtube.com/watch?v=VQPfrYMoHKU'], pdfs: ['Ancient India NCERT notes'] },
      'Indian Polity': { videos: ['https://www.youtube.com/watch?v=E_anJkj2dEg'], pdfs: ['Laxmikanth summary'] },
      'Physical Geography': { videos: ['https://www.youtube.com/watch?v=MMzd40i8TfA'], pdfs: ['Geography map practice'] },
      'Indian Economy': { videos: ['https://www.youtube.com/watch?v=9fPhJZJPl6o'], pdfs: ['Economy basics notes'] },
      'Ethics Case Studies': { videos: ['https://www.youtube.com/watch?v=CjWUgFBm4xQ'], pdfs: ['Ethics case study examples'] },
      'Current Affairs': { videos: ['https://www.youtube.com/watch?v=X7M7h9A1bYI'], pdfs: ['Monthly current affairs'] },
      'Answer Writing': { videos: ['https://www.youtube.com/watch?v=1hN_T-x2WQE'], pdfs: ['Answer writing framework'] },
    },
    companyData: {
      'IAS': { seats: 180, avgSalary: 'Grade A (₹56,100-₹2,50,000)', cities: ['All India'], eligibility: 'Graduate, 21-32 years (Gen)', process: 'Prelims → Mains (9 papers) → Interview' },
      'IPS': { seats: 150, avgSalary: 'Grade A (₹56,100-₹2,25,000)', cities: ['All India'], eligibility: 'Graduate, 21-32 years (Gen)', process: 'Prelims → Mains → Interview + Physical' },
      'IFS': { seats: 30, avgSalary: 'Grade A (₹56,100-₹2,50,000)', cities: ['Delhi + Abroad'], eligibility: 'Graduate, 21-32 years', process: 'Prelims → Mains → Interview' },
      'IRS': { seats: 150, avgSalary: 'Grade A (₹56,100-₹1,77,500)', cities: ['All India'], eligibility: 'Graduate', process: 'Prelims → Mains → Interview' },
      'IRTS': { seats: 50, avgSalary: 'Grade A', cities: ['All India'], eligibility: 'Engineering Graduate', process: 'Prelims → Mains → Interview' },
      'State PCS': { seats: 500, avgSalary: '₹44,900-₹1,50,000', cities: ['State Level'], eligibility: 'Graduate', process: 'Prelims → Mains → Interview' },
    },
  },
};
