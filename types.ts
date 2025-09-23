export enum UserRole {
  Student = 'Student',
  Teacher = 'Teacher',
  Admin = 'Admin',
}

export interface DrillResult {
  id: string;
  disasterType: DisasterType;
  difficulty: Difficulty;
  score: number;
  totalQuestions: number;
  date: string; // ISO Date string
}

export interface User {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
  score: number;
  avatar: string; // Can be a data URL for uploads or an ID for default avatars
  drillHistory: DrillResult[];
  institution: string;
}

export enum DisasterType {
  Earthquake = 'Earthquake',
  Flood = 'Flood',
  Fire = 'Fire',
  Cyclone = 'Cyclone',
}

export interface DisasterModule {
  type: DisasterType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  studyMaterial: {
    introduction: string;
    keyPoints: { title: string; detail: string }[];
  };
}

export interface DrillStepOption {
  text: string;
  isCorrect: boolean;
  feedback: string;
}

export interface DrillStep {
  scenario: string;
  question: string;
  options: DrillStepOption[];
  aiAdvice: string;
}

export type View = 'welcome' | 'signup' | 'login' | 'verifyOtp' | 'home' | 'modules' | 'drills' | 'drill' | 'dashboard' | 'contacts' | 'profile' | 'registerInstitution' | 'forgotPassword' | 'resetPassword';

export type Theme = 'light' | 'dark';

export enum Difficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
}

export interface AnalyticsData {
  totalDrillsCompleted: number;
  overallScoreSum: number;
  overallQuestionSum: number;
  drillsByType: { [key in DisasterType]?: number };
  scoresByType: { [key in DisasterType]?: { scoreSum: number; questionSum: number; count: number } };
}