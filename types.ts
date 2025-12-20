
export enum AppView {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD',
  LOADING = 'LOADING',
  EXAM = 'EXAM',
  RESULTS = 'RESULTS',
  ABOUT = 'ABOUT',
  API_SETTINGS = 'API_SETTINGS'
}

export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard'
}

export interface ExamConfig {
  difficulty: Difficulty;
  durationMinutes: number;
  questionCount: number;
  candidateName: string;
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswerIndex: number; // 0-3
  explanation: string;
  topic: string;
}

export interface ExamResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedAnswers: number;
  timeTakenSeconds: number;
  answers: Record<number, number>; // questionId -> selectedOptionIndex
}

export interface GeneratedExam {
  title: string;
  questions: Question[];
  config: ExamConfig;
}
