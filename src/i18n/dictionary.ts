export type Locale = "zh" | "en" | "de";

export const locales: { code: Locale; label: string }[] = [
  { code: "zh", label: "中文" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
];

type Dictionary = typeof dictionaries.zh;

export const dictionaries: Record<
  Locale,
  {
    appTitle: string;
    appSubtitle: string;
    newJob: string;
    exportReport: string;
    searchPlaceholder: string;
    statusFilterLabel: string;
    statusAll: string;
    statusDraft: string;
    statusMatching: string;
    statusAssigned: string;
    statusInProgress: string;
    statusAwaitingReview: string;
    statusCompleted: string;
    statusCancelled: string;
    totalJobs: (filtered: number, total: number) => string;
    emptyListTitle: string;
    emptyListCta: string;
    selectJobTitle: string;
    selectJobSubtitle: string;
    urgency: string;
    urgencyNormal: string;
    urgencyUrgent: string;
    category: string;
    location: string;
    schedule: string;
    budget: string;
    timelineTitle: string;
    recommendedProfessionalsTitle: string;
    recommendedProfessionalsSubtitle: string;
    assignedProfessionalTitle: string;
    viewResume: string;
    assign: string;
    resume: string;
    warrantyTitle: string;
    warrantyDescription: string;
    newJobModalTitle: string;
    newJobModalSubtitle: string;
    newJobModalCancel: string;
    newJobModalSubmit: string;
    newJobRequired: string;
    newJobTitleLabel: string;
    newJobCategoryLabel: string;
    newJobUrgencyLabel: string;
    newJobLocationLabel: string;
    newJobScheduleLabel: string;
    newJobBudgetLabel: string;
    newJobDescriptionLabel: string;
    newJobTitlePlaceholder: string;
    newJobLocationPlaceholder: string;
    newJobSchedulePlaceholder: string;
    newJobBudgetPlaceholder: string;
    newJobDescriptionPlaceholder: string;
    newJobHelper: string;
    modalClose: string;
    professionalModalTitle: string;
    professionalIntro: string;
    professionalExperienceYears: string;
    professionalRating: string;
    professionalCompletedJobs: string;
    professionalServiceAreas: string;
    professionalAvailability: string;
    professionalCertifications: string;
    professionalVerificationTitle: string;
    verificationLevelPending: string;
    verificationLevelBasic: string;
    verificationLevelEnhanced: string;
    verificationLastVerified: string;
    verificationNotes: string;
    professionalRecentJobs: string;
    professionalNoJobs: string;
    roleCustomer: string;
    roleProfessional: string;
    authLoginTitle: string;
    authLoginSubtitle: string;
    authEmailLabel: string;
    authPasswordLabel: string;
    authLoginButton: string;
    authDemoTitle: string;
    authBackToHome: string;
    authLogout: string;
    landingTitle: string;
    landingSubtitle: string;
    landingBulletOne: string;
    landingBulletTwo: string;
    landingBulletThree: string;
    landingLoginLink: string;
    todosTitle: string;
    todosSubtitle: string;
    todosAddNew: string;
    todosAddPlaceholder: string;
    todosEmpty: string;
    todosCompleted: string;
    todosActive: string;
    todosAll: string;
    todosDelete: string;
    todosClearCompleted: string;
    todosMarkComplete: string;
    todosMarkActive: string;
  }
> = {
  zh: {
    appTitle: "工程師傅媒合平台",
    appSubtitle: "建立維修需求，立即找到值得信賴的師傅。",
    newJob: "新增維修需求",
    exportReport: "查看進度",
    searchPlaceholder: "搜尋需求 / 地點",
    statusFilterLabel: "狀態",
    statusAll: "全部狀態",
    statusDraft: "草稿",
    statusMatching: "媒合中",
    statusAssigned: "已指派",
    statusInProgress: "施工中",
    statusAwaitingReview: "待驗收",
    statusCompleted: "已結案",
    statusCancelled: "已取消",
    totalJobs: (filtered, total) => `共 ${filtered} 筆需求（全部 ${total}）`,
    emptyListTitle: "找不到符合條件的需求",
    emptyListCta: "建立新需求",
    selectJobTitle: "請從左側選擇需求",
    selectJobSubtitle: "或建立需求，系統將推薦合適師傅。",
    urgency: "緊急程度",
    urgencyNormal: "一般",
    urgencyUrgent: "急件",
    category: "類型",
    location: "地址",
    schedule: "期望時間",
    budget: "預算範圍",
    timelineTitle: "需求更新紀錄",
    recommendedProfessionalsTitle: "推薦師傅",
    recommendedProfessionalsSubtitle: "依地點、評價與專長推薦師傅。",
    assignedProfessionalTitle: "已指派師傅",
    viewResume: "查看履歷",
    assign: "指派",
    resume: "履歷",
    warrantyTitle: "售後保固小提醒",
    warrantyDescription: "完工後提供追蹤與提醒，保障維修品質。",
    newJobModalTitle: "新增維修需求",
    newJobModalSubtitle: "留下簡單資訊，就能收到合適師傅報價。",
    newJobModalCancel: "取消",
    newJobModalSubmit: "送出需求",
    newJobRequired: "* 為必填欄位",
    newJobTitleLabel: "需求標題 *",
    newJobCategoryLabel: "維修類型 *",
    newJobUrgencyLabel: "緊急程度 *",
    newJobLocationLabel: "維修地址 *",
    newJobScheduleLabel: "可施工時段 *",
    newJobBudgetLabel: "預算範圍（選填）",
    newJobDescriptionLabel: "需求詳情 *",
    newJobTitlePlaceholder: "例如：浴室天花板漏水",
    newJobLocationPlaceholder: "請填寫完整地址",
    newJobSchedulePlaceholder: "例如：希望週末早上 9:00-12:00",
    newJobBudgetPlaceholder: "例如：3,000 - 5,000",
    newJobDescriptionPlaceholder: "請描述問題狀況、照片等資訊",
    newJobHelper: "建立後即可收到師傅報價通知。",
    modalClose: "關閉",
    professionalModalTitle: "師傅介紹",
    professionalIntro: "自我介紹",
    professionalExperienceYears: "{0} 年經驗",
    professionalRating: "評價",
    professionalCompletedJobs: "完成案件",
    professionalServiceAreas: "服務地區",
    professionalAvailability: "可服務時段",
    professionalCertifications: "專業證照",
    professionalVerificationTitle: "認證狀態",
    verificationLevelPending: "待驗證",
    verificationLevelBasic: "基礎驗證",
    verificationLevelEnhanced: "進階驗證",
    verificationLastVerified: "最近核驗",
    verificationNotes: "核驗備註",
    professionalRecentJobs: "近期案件",
    professionalNoJobs: "尚未接到案件。",
    roleCustomer: "用戶",
    roleProfessional: "師傅",
    authLoginTitle: "登入帳號",
    authLoginSubtitle: "使用預設帳號即可體驗媒合流程。",
    authEmailLabel: "電子郵件",
    authPasswordLabel: "密碼",
    authLoginButton: "登入",
    authDemoTitle: "Demo 帳號",
    authBackToHome: "返回首頁",
    authLogout: "登出",
    landingTitle: "想修繕家裡卻沒有認識的師傅？",
    landingSubtitle: "建立需求、比較報價、追蹤進度，一個平台全部搞定。",
    landingBulletOne: "建立維修需求，系統即時推播給附近師傅。",
    landingBulletTwo: "查看師傅經驗、評價與可服務時段，安心挑人。",
    landingBulletThree: "隨時追蹤施工進度、保固提醒與售後服務。",
    landingLoginLink: "立即登入體驗",
    todosTitle: "待辦事項",
    todosSubtitle: "管理您的任務與待辦清單",
    todosAddNew: "新增待辦",
    todosAddPlaceholder: "輸入新的待辦事項...",
    todosEmpty: "目前沒有待辦事項",
    todosCompleted: "已完成",
    todosActive: "進行中",
    todosAll: "全部",
    todosDelete: "刪除",
    todosClearCompleted: "清除已完成",
    todosMarkComplete: "標記為完成",
    todosMarkActive: "標記為進行中",
  },
  en: {
    appTitle: "Home Repair Finder",
    appSubtitle: "Post your repair need and let trusted pros help you out.",
    newJob: "Create Request",
    exportReport: "View Updates",
    searchPlaceholder: "Search requests / locations",
    statusFilterLabel: "Status",
    statusAll: "All",
    statusDraft: "Draft",
    statusMatching: "Matching",
    statusAssigned: "Assigned",
    statusInProgress: "In progress",
    statusAwaitingReview: "Awaiting review",
    statusCompleted: "Completed",
    statusCancelled: "Cancelled",
    totalJobs: (filtered, total) => `${filtered} requests (total ${total})`,
    emptyListTitle: "No requests found",
    emptyListCta: "Create new request",
    selectJobTitle: "Select a request on the left",
    selectJobSubtitle: "Or create a new one to get instant recommendations.",
    urgency: "Urgency",
    urgencyNormal: "Normal",
    urgencyUrgent: "Urgent",
    category: "Category",
    location: "Address",
    schedule: "Preferred time",
    budget: "Budget range",
    timelineTitle: "Updates",
    recommendedProfessionalsTitle: "Recommended professionals",
    recommendedProfessionalsSubtitle: "Suggested by location, rating, and skill.",
    assignedProfessionalTitle: "Assigned professional",
    viewResume: "View profile",
    assign: "Assign",
    resume: "Profile",
    warrantyTitle: "After-service Tips",
    warrantyDescription: "We help track warranty period and follow-up reminders.",
    newJobModalTitle: "New repair request",
    newJobModalSubtitle: "Fill in the details and receive quotes right away.",
    newJobModalCancel: "Cancel",
    newJobModalSubmit: "Submit request",
    newJobRequired: "* Required fields",
    newJobTitleLabel: "Title *",
    newJobCategoryLabel: "Type *",
    newJobUrgencyLabel: "Urgency *",
    newJobLocationLabel: "Address *",
    newJobScheduleLabel: "Preferred time *",
    newJobBudgetLabel: "Budget range (optional)",
    newJobDescriptionLabel: "Details *",
    newJobTitlePlaceholder: "e.g. Ceiling leaking in bathroom",
    newJobLocationPlaceholder: "Full address",
    newJobSchedulePlaceholder: "e.g. Weekend mornings 9:00-12:00",
    newJobBudgetPlaceholder: "e.g. 100 - 150",
    newJobDescriptionPlaceholder: "Describe the issue, add details or photos",
    newJobHelper: "Pros will contact you once submitted.",
    modalClose: "Close",
    professionalModalTitle: "Professional profile",
    professionalIntro: "About",
    professionalExperienceYears: "{0} yrs experience",
    professionalRating: "Rating",
    professionalCompletedJobs: "Completed jobs",
    professionalServiceAreas: "Service areas",
    professionalAvailability: "Availability",
    professionalCertifications: "Certifications",
    professionalVerificationTitle: "Verification",
    verificationLevelPending: "Pending review",
    verificationLevelBasic: "Verified",
    verificationLevelEnhanced: "Enhanced verification",
    verificationLastVerified: "Last verified",
    verificationNotes: "Notes",
    professionalRecentJobs: "Recent requests",
    professionalNoJobs: "No assigned requests yet.",
    roleCustomer: "Homeowner",
    roleProfessional: "Professional",
    authLoginTitle: "Sign in",
    authLoginSubtitle: "Use the demo accounts below to explore the workflow.",
    authEmailLabel: "Email",
    authPasswordLabel: "Password",
    authLoginButton: "Sign in",
    authDemoTitle: "Demo accounts",
    authBackToHome: "Back to home",
    authLogout: "Log out",
    landingTitle: "Need a repair but don’t know any pros?",
    landingSubtitle: "Describe the problem, compare quotes, and track progress in one place.",
    landingBulletOne: "Post a repair request and nearby pros can respond instantly.",
    landingBulletTwo: "Check experience, ratings, and availability before you choose.",
    landingBulletThree: "Stay on top of updates, warranty reminders, and after-service support.",
    landingLoginLink: "Sign in to get started",
    todosTitle: "To-Do List",
    todosSubtitle: "Manage your tasks and to-dos",
    todosAddNew: "Add New",
    todosAddPlaceholder: "Enter a new task...",
    todosEmpty: "No tasks yet",
    todosCompleted: "Completed",
    todosActive: "Active",
    todosAll: "All",
    todosDelete: "Delete",
    todosClearCompleted: "Clear Completed",
    todosMarkComplete: "Mark Complete",
    todosMarkActive: "Mark Active",
  },
  de: {
    appTitle: "Handwerker-Finder",
    appSubtitle: "Beschreiben Sie Ihr Problem und finden Sie passende Handwerker.",
    newJob: "Anfrage erstellen",
    exportReport: "Fortschritt ansehen",
    searchPlaceholder: "Anfragen / Orte suchen",
    statusFilterLabel: "Status",
    statusAll: "Alle",
    statusDraft: "Entwurf",
    statusMatching: "Vermittlung",
    statusAssigned: "Zugewiesen",
    statusInProgress: "In Bearbeitung",
    statusAwaitingReview: "Abnahme ausstehend",
    statusCompleted: "Abgeschlossen",
    statusCancelled: "Abgebrochen",
    totalJobs: (filtered, total) => `${filtered} Anfragen (gesamt ${total})`,
    emptyListTitle: "Keine passenden Anfragen gefunden",
    emptyListCta: "Neue Anfrage erstellen",
    selectJobTitle: "Bitte wählen Sie links eine Anfrage",
    selectJobSubtitle: "Oder erstellen Sie eine neue Anfrage mit Empfehlungen.",
    urgency: "Dringlichkeit",
    urgencyNormal: "Normal",
    urgencyUrgent: "Dringend",
    category: "Kategorie",
    location: "Adresse",
    schedule: "Bevorzugte Zeit",
    budget: "Budgetrahmen",
    timelineTitle: "Aktivitäten",
    recommendedProfessionalsTitle: "Empfohlene Handwerker",
    recommendedProfessionalsSubtitle: "Sortiert nach Nähe, Bewertung und Fähigkeiten.",
    assignedProfessionalTitle: "Zugewiesener Handwerker",
    viewResume: "Profil ansehen",
    assign: "Zuweisen",
    resume: "Profil",
    warrantyTitle: "Service-Hinweis",
    warrantyDescription: "Wir erinnern Sie an Gewährleistung und Nachbetreuung.",
    newJobModalTitle: "Neue Reparaturanfrage",
    newJobModalSubtitle: "Füllen Sie die Angaben aus und erhalten Sie Angebote.",
    newJobModalCancel: "Abbrechen",
    newJobModalSubmit: "Anfrage absenden",
    newJobRequired: "* Pflichtfelder",
    newJobTitleLabel: "Titel *",
    newJobCategoryLabel: "Art *",
    newJobUrgencyLabel: "Dringlichkeit *",
    newJobLocationLabel: "Adresse *",
    newJobScheduleLabel: "Bevorzugte Zeit *",
    newJobBudgetLabel: "Budget (optional)",
    newJobDescriptionLabel: "Beschreibung *",
    newJobTitlePlaceholder: "z. B. Wasserleck in der Decke",
    newJobLocationPlaceholder: "Komplette Adresse",
    newJobSchedulePlaceholder: "z. B. Wochenende morgens 9:00-12:00",
    newJobBudgetPlaceholder: "z. B. 100 - 150",
    newJobDescriptionPlaceholder: "Beschreiben Sie das Problem, fügen Sie Details hinzu",
    newJobHelper: "Nach dem Absenden melden sich Handwerker bei Ihnen.",
    modalClose: "Schließen",
    professionalModalTitle: "Handwerkerprofil",
    professionalIntro: "Über mich",
    professionalExperienceYears: "{0} Jahre Erfahrung",
    professionalRating: "Bewertung",
    professionalCompletedJobs: "Abgeschlossene Aufträge",
    professionalServiceAreas: "Einsatzgebiete",
    professionalAvailability: "Verfügbarkeit",
    professionalCertifications: "Zertifikate",
    professionalVerificationTitle: "Verifizierung",
    verificationLevelPending: "Prüfung ausstehend",
    verificationLevelBasic: "Verifiziert",
    verificationLevelEnhanced: "Erweiterte Verifizierung",
    verificationLastVerified: "Zuletzt geprüft",
    verificationNotes: "Hinweise",
    professionalRecentJobs: "Aktuelle Aufträge",
    professionalNoJobs: "Noch keine Aufträge erhalten.",
    roleCustomer: "Auftraggeber",
    roleProfessional: "Handwerker",
    authLoginTitle: "Anmelden",
    authLoginSubtitle: "Nutzen Sie die Demo-Zugänge, um den Ablauf zu testen.",
    authEmailLabel: "E-Mail",
    authPasswordLabel: "Passwort",
    authLoginButton: "Anmelden",
    authDemoTitle: "Demo-Zugänge",
    authBackToHome: "Zurück zur Startseite",
    authLogout: "Abmelden",
    landingTitle: "Sie brauchen Hilfe, kennen aber keinen Handwerker?",
    landingSubtitle:
      "Problem beschreiben, Angebote vergleichen, Fortschritt verfolgen – alles auf einer Plattform.",
    landingBulletOne: "Erstellen Sie eine Anfrage und informieren Sie Handwerker in Ihrer Nähe.",
    landingBulletTwo:
      "Prüfen Sie Erfahrung, Bewertungen und Verfügbarkeit, bevor Sie sich entscheiden.",
    landingBulletThree:
      "Behalten Sie Aktualisierungen, Gewährleistung und Nachbetreuung jederzeit im Blick.",
    landingLoginLink: "Jetzt anmelden und starten",
    todosTitle: "Aufgabenliste",
    todosSubtitle: "Verwalten Sie Ihre Aufgaben",
    todosAddNew: "Neu hinzufügen",
    todosAddPlaceholder: "Neue Aufgabe eingeben...",
    todosEmpty: "Noch keine Aufgaben",
    todosCompleted: "Erledigt",
    todosActive: "Aktiv",
    todosAll: "Alle",
    todosDelete: "Löschen",
    todosClearCompleted: "Erledigte löschen",
    todosMarkComplete: "Als erledigt markieren",
    todosMarkActive: "Als aktiv markieren",
  },
};

export type AppDictionary = Dictionary;

