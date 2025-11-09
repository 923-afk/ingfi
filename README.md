## Engineer Finder Web

Multi-language Next.js 14 (App Router) prototype for a consumer-friendly repair request platform. Users可在瀏覽器快速建立維修需求、瀏覽推薦師傅、追蹤進度；同時提供中文／English／Deutsch 介面切換。

### 專案重點
- `src/app/page.tsx`：主頁整合需求列表、詳情區、師傅卡片、需求表單與履歷彈窗。
- `src/data/sampleData.ts`：Mock 工單與師傅資料，可改為串接 API。
- `src/i18n/dictionary.ts`：介面字串與語系定義（zh / en / de）。
- 支援「新增需求 → 自動指派 → 進度追蹤」，兼顧桌面與平板排版。

### 開發環境
```bash
npm install
npm run dev -- --port 4000   # 目前本機使用 4000 port
```
在瀏覽器打開 `http://localhost:4000` 即可看到最新 UI。若需更換語系，使用右上角語言切換器或修改預設 locale。

### Demo 登入
- 需求方：`user@example.com / demo123`
- 工程師：`pro@example.com / demo123`（綁定 `李建宏` 師傅，可查看被指派案件）
- 登入後右上角可隨時登出或切換語系。

### 指令清單
- `npm run dev`：啟動開發伺服器
- `npm run lint`：執行 ESLint
- `npm run build` / `npm run start`：生產環境建置與啟動

### 後續擴充建議
- 資料層：以 `DataService` pattern 串接真實後端，或導入 React Query。
- 狀態儲存：若要跨頁重用，可抽離成 Zustand / Redux store。
- 上傳功能：在需求表單加入照片、附件上傳，提供給師傅更多現場資訊。
- 驗證與通知：整合登入、Email/SMS 通知、工單更新推播。
- 無障礙：補齊 aria 標籤 / 鍵盤可達性，提升平民用戶體驗。

### 部署
專案可直接部署至 Vercel、Netlify 或任何支援 Next.js 14 的平台。建議在部署前設定 `NEXT_PUBLIC` 系列環境變數（若有），並執行 `npm run build` 驗證。
