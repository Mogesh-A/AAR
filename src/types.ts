/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ChatMessage {
  id: string;
  sender: "student" | "tutor";
  content: string;
  timestamp: string;
  image?: string; // Optional base64 image to render inside user conversation bubbles
}

export interface TutorRequest {
  message: string;
  subject: string;
  learningLevel: string;
  history: { sender: string; content: string }[];
  base64Image?: string; // Optional base64-encoded image
  imageMimeType?: string; // Optional image MIME type
}

export interface TutorResponse {
  response: string;
  suggestedProblems: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  realWorldUtility: string;
}

export interface CourseMilestone {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  completed: boolean;
  xpValue: number;
  topics: string[];
}

export interface StudentProfile {
  name: string;
  gradeLevel: string;
  targetExam: string;
  preferredSubject: string;
  preferredLevel: string;
  streakCount: number;
  solvedProblemsCount: number;
  xpPoints: number;
  currentLevel: number;
  unlockedAchievements: string[];
}

export interface JavaLogLine {
  id: string;
  timestamp: string;
  level: "INFO" | "DEBUG" | "WARN" | "ERROR";
  loggerName: string;
  message: string;
}
