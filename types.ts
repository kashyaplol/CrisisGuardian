// FIX: Import React to provide the 'React' namespace for ComponentType.
import React from 'react';

export enum UserRole {
  Student = 'Student',
  Teacher = 'Teacher',
  Admin = 'Admin',
}

export type DrillMode = 'Standard' | 'Survival';

export interface DrillResult {
  id: string;
  disasterType: DisasterType;
  difficulty: Difficulty;
  date: string; // ISO Date string
  mode: DrillMode;
  score?: number; // For Standard: correct answers
  totalQuestions?: number; // For Standard: total steps
  stepsSurvived?: number; // For Survival: steps survived
}

export interface UnlockedAchievement {
  achievementId: AchievementId;
  dateUnlocked: string; // ISO Date string
}

export interface User {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
  score: number; // This is now the average score percentage from STANDARD drills
  avatar: string;
  drillHistory: DrillResult[];
  institution: string;
  // New Progression Fields
  xp: number;
  level: number;
  streak: {
    count: number;
    lastActivityDate: string | null; // ISO Date string
  };
  unlockedAchievements: UnlockedAchievement[];
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
  icon: string;
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

export type View = 'welcome' | 'signup' | 'login' | 'verifyOtp' | 'home' | 'modules' | 'drills' | 'drill' | 'dashboard' | 'contacts' | 'profile' | 'registerInstitution' | 'forgotPassword' | 'resetPassword' | 'videoLessons';

export type Theme = 'light' | 'dark';

// FIX: Corrected the value for 'Medium' to prevent duplicate keys in objects using this enum.
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

export type VideoStyle = 'cartoon' | 'realistic';

// --- Achievements System ---

export enum AchievementId {
  // Drill Completion
  FirstDrill = 'FIRST_DRILL',
  FiveDrills = 'FIVE_DRILLS',
  TenDrills = 'TEN_DRILLS',
  // Score-based
  PerfectScore = 'PERFECT_SCORE',
  HighAchiever = 'HIGH_ACHIEVER', // >90% avg score
  // Disaster Specific
  EarthquakeMaster = 'EARTHQUAKE_MASTER',
  FloodMaster = 'FLOOD_MASTER',
  FireMaster = 'FIRE_MASTER',
  CycloneMaster = 'CYCLONE_MASTER',
  // Streaks
  ThreeDayStreak = 'THREE_DAY_STREAK',
  SevenDayStreak = 'SEVEN_DAY_STREAK',
  // Learning
  KnowledgeSeeker = 'KNOWLEDGE_SEEKER', // Study all modules (not yet implemented)
}

export enum AchievementTier {
  Bronze = 'Bronze',
  Silver = 'Silver',
  Gold = 'Gold',
}

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  tier: AchievementTier;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export interface ProgressionSummary {
    xpGained: number;
    leveledUp: boolean;
    oldLevel: number;
    newLevel: number;
    oldXp: number;
    newXp: number;
    newlyUnlocked: Achievement[];
    streakUpdated: boolean;
    newStreak: number;
    // For summary modal context
    mode: DrillMode;
    score?: number;
    totalQuestions?: number;
    stepsSurvived?: number;
}