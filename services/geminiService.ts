
import { GoogleGenAI, Type } from "@google/genai";
import { TaskType, ExamParams, ReviewResult, Difficulty } from "../types";

export async function analyzeVerilogCode(
  task: TaskType,
  difficulty: Difficulty,
  code: string,
  params: ExamParams,
  apiKey: string
): Promise<ReviewResult> {
  const finalKey = apiKey || process.env.API_KEY || "";
  
  if (!finalKey) {
    return {
      hasError: true,
      score: 0,
      errors: ["未設定 API Key"],
      suggestions: ["請點擊右上角設定圖示輸入您的 Google Gemini API Key"],
      commentedCode: "// 請先設定 API Key",
      expectedOutput: ""
    };
  }

  const ai = new GoogleGenAI({ apiKey: finalKey });
  const modelName = 'gemini-3-pro-preview';
  
  const systemInstruction = `
    你是一位數位電子乙級術科檢定專家。請評分並分析學生的 Verilog 程式碼。
    應檢環境：CPLD EPM3064A。
    
    分析要點：
    1. 給出 0-100 的完成度分數。
    2. 檢查試題要求：
       - 試題一：顯示邏輯必須嚴格符合「日期.崗位編號」格式：
         Digit 0 (左一): 日期十位
         Digit 1 (左二): 日期個位，且此位的小數點(DP)必須點亮，作為日期與崗位的分隔。
         Digit 2 (右二): 崗位編號十位
         Digit 3 (右一): 崗位編號個位
       - 試題二：檢查 R (Row) 掃描邏輯與 C (Column) 判斷：
         * 按下 '*' 鍵：七段顯示器應顯示 'c' (編碼: 01011000，g,e,d 亮)。
         * 按下 '#' 鍵：七段顯示器應顯示 '倒反的 C' (編碼: 01001100，g,c,d 亮)。
         * 數字鍵顯示對應數字。
    3. 提供一個「全中文註解」的示範正確版本，包含除頻器(Divider)、掃描計數器、多工器(MUX)與編碼電路。
    
    當前環境參數：日期: ${params.day}, 崗位: ${params.stationId}。
    請嚴格以 JSON 格式回應。
  `;

  const prompt = `
    模式：${difficulty === Difficulty.SIMPLE ? '填空引導' : '自由撰寫'}
    題號：${task === TaskType.TASK1 ? '試題一 (四位數顯示)' : '試題二 (鍵盤輸入)'}
    原始程式碼：
    \`\`\`verilog
    ${code}
    \`\`\`
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hasError: { type: Type.BOOLEAN },
            score: { type: Type.NUMBER },
            errors: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            commentedCode: { type: Type.STRING },
            expectedOutput: { type: Type.STRING }
          },
          required: ["hasError", "score", "errors", "suggestions", "commentedCode", "expectedOutput"]
        }
      }
    });

    return JSON.parse(response.text || "{}") as ReviewResult;
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    return {
      hasError: true,
      score: 0,
      errors: [error.message || "AI 診斷失敗"],
      suggestions: ["請檢查網路連線或 API Key 是否正確"],
      commentedCode: "// 無法產生建議程式碼",
      expectedOutput: ""
    };
  }
}
