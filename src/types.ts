export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  academicDetails: {
    branch: string;
    year: string;
    college: string;
  };
  skills: {
    dsa: number; // 1-10
    aptitude: number;
    coreSubjects: number;
    communication: number;
  };
  targetRole: string;
  targetCompanies: string[];
  expectedSalary: string;
  xp: number;
  level: number;
  badges: string[];
  streak: number;
  lastActive: string;
}

export interface QuizResult {
  userId: string;
  topic: string;
  score: number;
  totalQuestions: number;
  timeTaken: number;
  timestamp: string;
  weaknesses: string[];
}

export interface Roadmap {
  userId: string;
  title: string;
  steps: RoadmapStep[];
  createdAt: string;
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  resources: { title: string; url: string }[];
  order: number;
}

export interface MockInterview {
  userId: string;
  role: string;
  company?: string;
  questions: string[];
  answers: { question: string; answer: string; feedback: string; score: number }[];
  overallFeedback: string;
  confidenceScore: number;
  timestamp: string;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  type: 'Product' | 'Service';
  salaryRange: string;
  difficulty: 'Low' | 'Medium' | 'High';
  requiredSkills: {
    dsa: number;
    aptitude: number;
    coreSubjects: number;
    communication: number;
  };
  interviewProcess: string[];
  previousQuestions: string[];
}

export interface Job {
  id: string;
  title: string;
  company: string;
  logo: string;
  salary: string;
  location: string;
  type: 'Full-time' | 'Internship';
  experience: string;
  description: string;
  requiredSkills: string[];
  responsibilities: string[];
  postedAt: string;
}
