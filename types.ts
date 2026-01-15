
export enum TaskType {
  TASK1 = 'TASK1', // 四位數顯示裝置
  TASK2 = 'TASK2'  // 鍵盤輸入顯示裝置
}

// Added Difficulty enum for task difficulty levels as required by geminiService.ts
export enum Difficulty {
  SIMPLE = 'SIMPLE',
  ADVANCED = 'ADVANCED'
}

export interface ReviewResult {
  hasError: boolean;
  score: number; // 0-100
  // Made blankResults optional to allow ReviewResult to be used for AI analysis which doesn't provide these
  blankResults?: {
    index: number;
    userValue: string;
    correctValue: string;
    isCorrect: boolean;
  }[];
  errors: string[];
  suggestions: string[];
  // Added optional fields for AI analysis results
  commentedCode?: string;
  expectedOutput?: string;
}

export interface ExamParams {
  day: string; // 僅日期 (DD)
  stationId: string; // 崗位編號 (01-99)
}
