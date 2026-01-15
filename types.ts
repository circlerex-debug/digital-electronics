
export enum TaskType {
  TASK1 = 'TASK1', // 四位數顯示裝置
  TASK2 = 'TASK2'  // 鍵盤輸入顯示裝置
}

export enum Difficulty {
  SIMPLE = 'SIMPLE',   // 初階填空
  ADVANCED = 'ADVANCED' // 進階自由寫
}

export interface ReviewResult {
  hasError: boolean;
  score: number; // 0-100
  errors: string[];
  suggestions: string[];
  commentedCode: string; // 帶有註解的示範程式碼
  expectedOutput: string;
}

export interface ExamParams {
  day: string; // 僅日期 (DD)
  stationId: string; // 崗位編號 (01-99)
}
