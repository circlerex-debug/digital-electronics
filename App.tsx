
import React, { useState, useEffect } from 'react';
import { 
  Terminal, CheckCircle2, AlertCircle, Cpu, Keyboard, 
  Calendar, Hash, RefreshCcw, Info, Trophy, 
  GraduationCap, Code, Settings, X, Key, ExternalLink, Send,
  PartyPopper, Sparkles, Heart, Rocket
} from 'lucide-react';
import { TaskType, ExamParams, ReviewResult, Difficulty } from './types';
import { SEGMENT_MAP } from './constants';
import { analyzeVerilogCode } from './services/geminiService';
import SevenSegment from './components/SevenSegment';

const ENCOURAGING_MESSAGES = [
  "設定成功！工程師魂燃燒吧！🔥",
  "太棒了！離拿到乙級證照又近了一步！🎓",
  "加油加油！這題一定難不倒你的！🚀",
  "準備好開始練習了嗎？祝你考試順利！✨",
  "API Key 已就緒，準備寫出完美的代碼吧！💻"
];

const App: React.FC = () => {
  const [activeTask, setActiveTask] = useState<TaskType>(TaskType.TASK1);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.SIMPLE);
  const [params, setParams] = useState<ExamParams>({
    day: '10', 
    stationId: '05'
  });
  
  const [code, setCode] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const [apiKey, setApiKey] = useState<string>(localStorage.getItem('gemini_api_key') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [showCheer, setShowCheer] = useState(false);
  const [cheerMsg, setCheerMsg] = useState("");

  const getTemplate = (task: TaskType, diff: Difficulty, p: ExamParams) => {
    const dd = p.day.padStart(2, '0');
    const ss = p.stationId.padStart(2, '0');

    if (diff === Difficulty.ADVANCED) {
      return task === TaskType.TASK1 
        ? `module no1(input ck, output reg[3:0] s, output reg[7:0] seg);\n  // 試題一：四位數顯示裝置\n  // 目標格式：日期.崗位編號 (例如：${dd}.${ss})\n  // 請撰寫完整的除頻、掃描與多工顯示邏輯\nendmodule`
        : `module no2(input ck, output reg[6:0] s, output reg[3:0] R, input[2:0] C);\n  // 試題二：鍵盤輸入顯示裝置\n  // 請撰寫鍵盤掃描 (R與C) 與七段解碼邏輯\nendmodule`;
    }
    
    if (task === TaskType.TASK1) {
      return `module no1(input ck, output reg[3:0] s, output reg[7:0] seg);
  reg [13:0] t;
  always@(posedge ck) t <= t + 1;
  
  always@(posedge t[13])
  case(s)
    4'b0001 : begin s <= 4'b0010; seg <= /* 顯示日期十位: ${dd[0]} */; end
    4'b0010 : begin s <= 4'b0100; seg <= /* 顯示日期個位加點: ${dd[1]}. */; end
    4'b0100 : begin s <= 4'b1000; seg <= /* 顯示崗位十位: ${ss[0]} */; end
    default : begin s <= 4'b0001; seg <= /* 顯示崗位個位: ${ss[1]} */; end
  endcase
endmodule`;
    }
    
    return `module no2(input ck, output reg[6:0] s, output reg [3:0] R, input [2:0] C); 
  always @ (posedge ck)
  case (R)
    4'b1110: begin // 第一列 1, 2, 3
      if(C == 3'b110) s <= 7'b1111001; // 1
      if(C == 3'b101) s <= /* 數字2顯示碼 */;
      R <= 4'b1101;
    end
    4'b1101: begin // 第二列 4, 5, 6
      /* 填入 4, 5, 6 判斷邏輯 */
      R <= 4'b1011;
    end
    4'b1011: begin // 第三列 7, 8, 9
      /* 填入 7, 8, 9 判斷邏輯 */
      R <= 4'b0111;
    end
    4'b0111: begin // 第四列 *, 0, #
      if(C == 3'b110) s <= /* * 顯示 c (編碼 01011000) */;
      if(C == 3'b101) s <= 7'b0111111; // 0
      if(C == 3'b011) s <= /* # 顯示 倒反C (編碼 01001100) */;
      R <= 4'b1110;
    end
    default: R <= 4'b1110;
  endcase
endmodule`;
  };

  useEffect(() => {
    setCode(getTemplate(activeTask, difficulty, params));
    setResult(null);
  }, [activeTask, difficulty, params.day, params.stationId]);

  const handleSaveApiKey = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    setShowSettings(false);
    
    // 觸發加油打氣特效
    const randomMsg = ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)];
    setCheerMsg(randomMsg);
    setShowCheer(true);
    setTimeout(() => setShowCheer(false), 4000);
  };

  const handleAnalyze = async () => {
    if (!apiKey) {
      setShowSettings(true);
      return;
    }
    setIsAnalyzing(true);
    const res = await analyzeVerilogCode(activeTask, difficulty, code, params, apiKey);
    setResult(res);
    setIsAnalyzing(false);
  };

  const getTask1Digits = () => {
    const dd = params.day.padStart(2, '0');
    const ss = params.stationId.padStart(2, '0');
    return [dd[0], dd[1] + '.', ss[0], ss[1]];
  };

  const getTask2Display = (key: string | null) => {
    if (!key) return '00000000';
    if (key === '*') return SEGMENT_MAP['c'];
    if (key === '#') return SEGMENT_MAP['revC'];
    return SEGMENT_MAP[key] || '00000000';
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 relative">
      {/* 全域打氣橫幅 */}
      {showCheer && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-500">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 border border-white/20">
            <div className="animate-bounce"><PartyPopper className="text-yellow-300" /></div>
            <span className="font-black tracking-wide whitespace-nowrap">{cheerMsg}</span>
            <div className="animate-pulse"><Sparkles className="text-yellow-300" /></div>
          </div>
        </div>
      )}

      {/* 設定 Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 bg-slate-50 border-b flex items-center justify-between">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <Settings size={20} className="text-indigo-500" /> API 設定
              </h3>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Gemini API Key</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="password" 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                    placeholder="貼上你的 API Key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>
                <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-xs text-indigo-600 flex items-center gap-1 hover:underline">
                  獲取免費金鑰 <ExternalLink size={12}/>
                </a>
              </div>
              <button onClick={handleSaveApiKey} className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
                <Rocket size={18} /> 儲存設定，開始練習！
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-200 relative group">
            <Cpu size={32}/>
            <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Sparkles className="text-yellow-400 animate-pulse" size={16} />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              數位電子乙級 Verilog 練習助手
              <span className="hidden md:inline-block"><Heart className="text-rose-500 fill-rose-500" size={16}/></span>
            </h1>
            <div className="flex gap-2 text-slate-400 text-xs font-bold mt-1">
              <span className="flex items-center gap-1 text-indigo-500"><CheckCircle2 size={12}/> AI 診斷</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={12}/> 硬體模擬</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={12}/> 乙級規範</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-200 flex">
            {[Difficulty.SIMPLE, Difficulty.ADVANCED].map(d => (
              <button 
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${difficulty === d ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                {d === Difficulty.SIMPLE ? '初階填空' : '進階自由寫'}
              </button>
            ))}
          </div>
          <button onClick={() => setShowSettings(true)} className={`p-2.5 rounded-2xl border transition-all relative ${!apiKey ? 'bg-amber-50 border-amber-200 text-amber-500 animate-pulse' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}>
            <Settings size={22}/>
            {!apiKey && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">環境參數設定</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500">應考日期 (日)</label>
                  <input type="text" maxLength={2} value={params.day} onChange={e=>setParams({...params, day: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-center" placeholder="DD" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500">崗位編號</label>
                  <input type="text" maxLength={2} value={params.stationId} onChange={e=>setParams({...params, stationId: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-center" placeholder="01" />
                </div>
              </div>
              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex gap-3 items-start">
                <Info size={18} className="text-indigo-600 mt-0.5 shrink-0" />
                <div className="text-xs text-indigo-900 leading-relaxed font-medium">
                  <strong>當前任務目標：</strong>
                  {activeTask === TaskType.TASK1 
                    ? `顯示「日期.崗位」，當前預期顯示：${params.day.padStart(2, '0')}.${params.stationId.padStart(2, '0')}` 
                    : '鍵盤掃描邏輯練習：按數字鍵顯示數字，按 * 顯示 c，按 # 顯示倒反的 C。'}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Cpu size={120} /></div>
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-8">硬體即時模擬器</h2>
            
            <div className="flex flex-col items-center gap-10">
              <div className="bg-slate-800 p-10 rounded-[2rem] border-[8px] border-slate-700 flex gap-5 shadow-inner">
                {activeTask === TaskType.TASK1 ? (
                  getTask1Digits().map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-3">
                      <SevenSegment bits={(d.includes('.') ? '1' : '0') + (SEGMENT_MAP[d[0]] || '00000000').substring(1)} />
                      <span className="text-[8px] font-black text-slate-600 uppercase">Digit {i}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <SevenSegment bits={getTask2Display(pressedKey)} />
                    <span className="text-[8px] font-black text-slate-600 uppercase">Output</span>
                  </div>
                )}
              </div>

              {activeTask === TaskType.TASK2 && (
                <div className="grid grid-cols-3 gap-3 w-full max-w-[220px]">
                  {['1','2','3','4','5','6','7','8','9','*','0','#'].map(k => (
                    <button 
                      key={k}
                      onMouseDown={() => setPressedKey(k)}
                      onMouseUp={() => setPressedKey(null)}
                      onMouseLeave={() => setPressedKey(null)}
                      className="h-14 bg-slate-800 border-b-4 border-slate-950 text-white font-black rounded-xl hover:bg-slate-700 active:translate-y-1 active:border-b-0 transition-all text-xl"
                    >
                      {k}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex bg-slate-50 border-b overflow-x-auto">
              {Object.entries(TaskType).map(([key, val]) => (
                <button 
                  key={val} 
                  onClick={() => setActiveTask(val as TaskType)}
                  className={`px-8 py-5 text-sm font-black transition-all whitespace-nowrap ${activeTask === val ? 'bg-white text-indigo-600 border-t-4 border-t-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}
                >
                  {val === TaskType.TASK1 ? '試題一：四位數顯示裝置' : '試題二：鍵盤輸入顯示裝置'}
                </button>
              ))}
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <Terminal size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Verilog HDL Code</span>
                </div>
                <button 
                  onClick={handleAnalyze} 
                  disabled={isAnalyzing}
                  className={`flex items-center gap-2 px-8 py-3 rounded-full font-black text-white shadow-xl transition-all active:scale-95 ${isAnalyzing ? 'bg-slate-300' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                >
                  {isAnalyzing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Send size={18}/>}
                  {isAnalyzing ? '分析中...' : '提交評分'}
                </button>
              </div>

              <textarea 
                className="w-full h-[450px] p-8 bg-slate-900 text-emerald-400 font-mono text-sm border-none rounded-[2rem] shadow-inner focus:ring-4 focus:ring-indigo-500/10 outline-none leading-relaxed resize-none overflow-y-auto"
                value={code}
                onChange={e=>setCode(e.target.value)}
                spellCheck={false}
              />
            </div>
          </div>

          {result && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="md:col-span-4 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">實作完成度</h3>
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="72" cy="72" r="64" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                    <circle cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={402} strokeDashoffset={402 - (402 * result.score / 100)} className={`${result.score >= 80 ? 'text-emerald-500' : result.score >= 60 ? 'text-amber-500' : 'text-red-500'} transition-all duration-1000 ease-in-out`} />
                  </svg>
                  <span className="absolute text-4xl font-black text-slate-800">{result.score}%</span>
                </div>
                <p className="mt-4 text-xs font-bold text-slate-500">{result.score >= 100 ? '卓越效能！' : result.score >= 60 ? '達到標準' : '仍需調整'}</p>
              </div>

              <div className="md:col-span-8 space-y-4">
                <div className={`p-6 rounded-3xl border ${result.hasError ? 'bg-red-50 border-red-100 text-red-900' : 'bg-emerald-50 border-emerald-100 text-emerald-900'}`}>
                  <h4 className="font-black mb-3 flex items-center gap-2">
                    {result.hasError ? <AlertCircle size={20}/> : <CheckCircle2 size={20}/>}
                    診斷建議報告
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {result.errors.length > 0 ? result.errors.map((e, i) => <li key={i} className="flex gap-2 leading-relaxed">❌ {e}</li>) : <li className="flex gap-2 text-emerald-600 font-bold">✨ 恭喜！邏輯完美無缺！</li>}
                    {result.suggestions.map((s, i) => <li key={i} className="flex gap-2 opacity-80 leading-relaxed italic">💡 {s}</li>)}
                  </ul>
                </div>

                <div className="bg-slate-800 rounded-3xl overflow-hidden border border-slate-700 shadow-xl">
                  <div className="px-5 py-3 bg-slate-700/50 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                    <div className="flex items-center gap-2"><Trophy size={14} className="text-indigo-400"/> 專家推薦實作示範</div>
                    <span className="text-slate-500 font-mono">Verilog HDL</span>
                  </div>
                  <pre className="p-6 text-[11px] font-mono text-indigo-100 overflow-x-auto max-h-[400px] leading-relaxed">
                    {result.commentedCode}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="text-center mt-12 mb-8 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <span>加油加油！預祝考場如魚得水</span>
          <Sparkles size={12} className="text-indigo-400" />
        </div>
        <span>© 2024 Digital Electronics Grade B Exam Assistant</span>
      </footer>
    </div>
  );
};

export default App;
