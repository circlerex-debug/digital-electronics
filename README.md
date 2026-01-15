
# 數位電子乙級 Verilog 練習助手 🎓

這是一個專為「數位電子乙級」術科檢定開發的 AI 練習平台。整合了 **Gemini 2.5/3.0** 模型，為應檢人提供即時的 Verilog 代碼診斷與硬體模擬。

## ✨ 主要功能

- **試題一模擬**：四位數顯示裝置（日期.崗位編號 格式）。
- **試題二模擬**：3x4 鍵盤掃描邏輯驗證，包含特殊符號 `*` (c) 與 `#` (revC)。
- **AI 專家診斷**：自動評分、抓錯，並提供中文註解的正確示範代碼。
- **熱血加油打氣**：設定 API Key 時提供隨機鼓勵語錄，陪伴您備考。

## 🚀 如何使用

1. 將本專案上傳至 GitHub。
2. 開啟 `index.html`。
3. 點擊右上角 **設定 (Settings)** 圖示。
4. 貼上您的 [Google Gemini API Key](https://aistudio.google.com/app/apikey)。
5. 開始撰寫代碼並提交評分！

## 🛠 技術棧

- **React / TypeScript**: 介面開發。
- **Tailwind CSS**: 現代化 UI 設計。
- **Lucide React**: 圖標系統。
- **Google GenAI SDK**: AI 診斷核心。

## ⚠️ 安全提示

本專案使用 `LocalStorage` 儲存 API Key，不會上傳至伺服器。請勿將您的 API Key 直接寫死在 `App.tsx` 的程式碼中，以免公開於 GitHub 造成額外費用。

---
**加油！祝您順利取得乙級證照！🔥**
