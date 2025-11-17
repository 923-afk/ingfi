'use client';

import Link from "next/link";
import { useEffect, useMemo, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { professionals as initialProfessionals } from "@/data/sampleData";
import type { JobRequest, JobStatus } from "@/types/job";
import type { Professional, VerificationLevel } from "@/types/professional";
import {
  dictionaries,
  locales,
  type AppDictionary,
  type Locale,
} from "@/i18n/dictionary";
import { useAuth } from "@/context/AuthContext";
import { useJobs } from "@/hooks/useJobs";
import { useToast } from "@/components/Toast";
import {
  validateJobTitle,
  validateJobDescription,
  validateLocation,
  validateSchedule,
  validateBudget,
} from "@/utils/validation";

type JobFilterStatus = JobStatus | "全部狀態";

const LOCALE_STORAGE_KEY = "engineer-finder-locale";

const urgencyPill = (urgency: string) =>
  urgency === "急件" ? "text-orange-600 bg-orange-100" : "text-slate-600 bg-slate-100";

const statusColor: Record<JobStatus, string> = {
  草稿: "bg-slate-200 text-slate-700",
  媒合中: "bg-orange-100 text-orange-700",
  已指派: "bg-blue-100 text-blue-700",
  施工中: "bg-purple-100 text-purple-700",
  待驗收: "bg-teal-100 text-teal-700",
  已結案: "bg-emerald-100 text-emerald-700",
  已取消: "bg-rose-100 text-rose-700",
};

const verificationColor: Record<VerificationLevel, string> = {
  pending: "text-orange-600 bg-orange-100 border border-orange-200",
  basic: "text-sky-700 bg-sky-100 border border-sky-200",
  enhanced: "text-emerald-700 bg-emerald-100 border border-emerald-200",
};

const verificationIcon: Record<VerificationLevel, string> = {
  pending: "⏳",
  basic: "✔️",
  enhanced: "🛡️",
};

const TEXT_TRANSLATIONS: Record<Locale, Record<string, string>> = {
  zh: {},
  en: {
    "商辦大樓冷氣漏水檢修": "Office HVAC Leak Repair",
    "地下室消防泵浦保養": "Basement Fire Pump Maintenance",
    "屋頂防水層翻修": "Rooftop Waterproofing Renovation",
    "機電工程": "HVAC & Electrical",
    "消防工程": "Fire Safety",
    "防水工程": "Waterproofing",
    "20 樓中央空調排水疑似堵塞，天花板出現滲水痕跡，需要檢查排水管與保溫層。":
      "Central AC drainage on the 20th floor appears clogged; ceiling shows leakage. Inspect drain pipes and insulation.",
    "年度消防設備保養，泵浦異常震動，需檢查軸承與壓力錶，並出具檢測報告。":
      "Annual fire equipment maintenance: pump vibrates abnormally; inspect bearings and pressure gauge, provide inspection report.",
    "透天厝屋頂老化，雨天滲漏，需重新做 PU 防水與排水坡度調整。":
      "Townhouse roof is aging with rain leakage. Reapply PU waterproofing and adjust drainage slope.",
    "台北市信義區松高路 101 號 20 樓": "20F, No.101 Songgao Rd, Xinyi Dist., Taipei",
    "新北市板橋區民生路 200 號 B2": "B2, No.200 Minsheng Rd, Banqiao Dist., New Taipei",
    "桃園市中壢區環北路 66 號": "No.66 Huanbei Rd, Zhongli Dist., Taoyuan",
    "希望 3 天內進場，施工時間 20:00-24:00":
      "Prefer start within 3 days, working hours 20:00–24:00",
    "下週一至週三 09:00-17:00": "Next Mon–Wed 09:00–17:00",
    "希望 2 週內開工，週一至週五 09:00-17:00":
      "Prefer start within 2 weeks, Mon–Fri 09:00–17:00",
    "機電工程技師": "HVAC Engineer",
    "防水工程師": "Waterproofing Specialist",
    "結構補強技師": "Structural Reinforcement Engineer",
    "週一至週六 08:00-18:00，可夜間值勤": "Mon–Sat 08:00–18:00, night shifts available",
    "週一至週五 09:00-17:00，週末需預約": "Mon–Fri 09:00–17:00, weekends by appointment",
    "可配合夜間及週末緊急工程": "Available for night and weekend emergency work",
    "專精中央空調與消防系統維護，具有大型商辦機電統包經驗。":
      "Specialized in central AC and fire system maintenance with extensive commercial MEP experience.",
    "擅長各式屋頂防水與外牆補漏，提供 1 年保固與檢測報告。":
      "Experienced in roof waterproofing and exterior leak repair, providing 1-year warranty and inspection reports.",
    "專注老屋結構補強與耐震評估，提供完整安全檢測與補強方案。":
      "Focused on structural reinforcement and seismic assessment for older buildings with comprehensive safety solutions.",
    "丙級電匠": "Class C Electrician License",
    "甲級消防設備士": "Class A Fire Equipment Technician",
    "高壓氣體特考": "High-Pressure Gas Certification",
    "高架作業安全證": "High-Rise Work Safety Permit",
    "防水施工專業技術士": "Waterproofing Technician License",
    "土木技師證照": "Civil Engineer License",
    "鋼構組立 A 級": "Steel Structure Assembly Class A",
    "台北市": "Taipei City",
    "新北市": "New Taipei City",
    "桃園市": "Taoyuan City",
    "新竹縣": "Hsinchu County",
    "新竹市": "Hsinchu City",
    "基隆市": "Keelung City",
    "宜蘭縣": "Yilan County",
  },
  de: {
    "商辦大樓冷氣漏水檢修": "Kühlwasserleck im Bürogebäude",
    "地下室消防泵浦保養": "Wartung der Feuerlöschpumpe im Keller",
    "屋頂防水層翻修": "Sanierung der Dachabdichtung",
    "機電工程": "HLK & Elektro",
    "消防工程": "Brandschutz",
    "防水工程": "Abdichtung",
    "20 樓中央空調排水疑似堵塞，天花板出現滲水痕跡，需要檢查排水管與保溫層。":
      "Abfluss der zentralen Klimaanlage im 20. Stock vermutlich verstopft; Decke zeigt Wasserspuren. Rohrleitungen und Dämmung prüfen.",
    "年度消防設備保養，泵浦異常震動，需檢查軸承與壓力錶，並出具檢測報告。":
      "Jährliche Wartung der Feuerlöschanlage: Pumpe vibriert ungewöhnlich; Lager und Manometer prüfen und Prüfbericht erstellen.",
    "透天厝屋頂老化，雨天滲漏，需重新做 PU 防水與排水坡度調整。":
      "Dach eines Reihenhauses ist gealtert und undicht. PU-Abdichtung erneuern und Gefälle anpassen.",
    "台北市信義區松高路 101 號 20 樓":
      "20. Stock, Songgao-Str. 101, Bezirk Xinyi, Taipeh",
    "新北市板橋區民生路 200 號 B2":
      "B2, Minsheng-Str. 200, Bezirk Banqiao, Neu-Taipeh",
    "桃園市中壢區環北路 66 號":
      "Huanbei-Str. 66, Bezirk Zhongli, Taoyuan",
    "希望 3 天內進場，施工時間 20:00-24:00":
      "Baubeginn innerhalb von 3 Tagen, Arbeitszeit 20:00–24:00",
    "下週一至週三 09:00-17:00": "Nächster Mo–Mi 09:00–17:00",
    "希望 2 週內開工，週一至週五 09:00-17:00":
      "Baustart innerhalb von 2 Wochen, Mo–Fr 09:00–17:00",
    "機電工程技師": "HLK-Techniker",
    "防水工程師": "Fachkraft für Abdichtung",
    "結構補強技師": "Experte für Strukturverstärkung",
    "週一至週六 08:00-18:00，可夜間值勤":
      "Mo–Sa 08:00–18:00, Nacht­einsätze möglich",
    "週一至週五 09:00-17:00，週末需預約":
      "Mo–Fr 09:00–17:00, Wochenenden nach Vereinbarung",
    "可配合夜間及週末緊急工程":
      "Auch für Nacht- und Wochenendnotfälle verfügbar",
    "專精中央空調與消防系統維護，具有大型商辦機電統包經驗。":
      "Spezialist für zentrale Klimaanlagen und Brandschutzsysteme mit Erfahrung in Großprojekten.",
    "擅長各式屋頂防水與外牆補漏，提供 1 年保固與檢測報告。":
      "Erfahren in Dachabdichtung und Fassadenabdichtung, bietet 1 Jahr Garantie und Prüfbericht.",
    "專注老屋結構補強與耐震評估，提供完整安全檢測與補強方案。":
      "Konzentriert sich auf Strukturverstärkung älterer Gebäude und Erdbebenbewertungen mit kompletten Sicherheitslösungen.",
    "丙級電匠": "Elektromonteur Klasse C",
    "甲級消防設備士": "Brandschutztechniker Klasse A",
    "高壓氣體特考": "Spezialprüfung Hochdruckgas",
    "高架作業安全證": "Sicherheitsnachweis für Arbeiten in der Höhe",
    "防水施工專業技術士": "Facharbeiter Abdichtung",
    "土木技師證照": "Bauingenieur-Lizenz",
    "鋼構組立 A 級": "Stahlbau-Montage Klasse A",
    "台北市": "Taipeh",
    "新北市": "Neu-Taipeh",
    "桃園市": "Taoyuan",
    "新竹縣": "Bezirk Hsinchu",
    "新竹市": "Stadt Hsinchu",
    "基隆市": "Keelung",
    "宜蘭縣": "Bezirk Yilan",
  },
};

const translateText = (text: string, locale: Locale) =>
  locale === "zh" ? text : TEXT_TRANSLATIONS[locale]?.[text] ?? text;

const localeToIntl: Record<Locale, string> = {
  zh: "zh-TW",
  en: "en-US",
  de: "de-DE",
};

const getVerificationLabel = (labels: AppDictionary, level: VerificationLevel) => {
  switch (level) {
    case "pending":
      return labels.verificationLevelPending;
    case "basic":
      return labels.verificationLevelBasic;
    case "enhanced":
      return labels.verificationLevelEnhanced;
  }
};

const formatVerifiedDate = (value: string | undefined, locale: Locale) => {
  if (!value) return "";
  try {
    const formatter = new Intl.DateTimeFormat(localeToIntl[locale], {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    return formatter.format(new Date(value));
  } catch {
    return value;
  }
};

function formatRelativeTime(value: string, locale: Locale) {
  const localeMap = locale === "zh" ? "zh-TW" : locale === "de" ? "de-DE" : "en-US";
  const formatter = new Intl.RelativeTimeFormat(localeMap, { style: "short" });
  const target = new Date(value).getTime();
  const diff = target - Date.now();
  const abs = Math.abs(diff);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (abs < hour) {
    const minutes = Math.round(diff / minute);
    return formatter.format(minutes, "minute");
  }
  if (abs < day) {
    const hours = Math.round(diff / hour);
    return formatter.format(hours, "hour");
  }
  const days = Math.round(diff / day);
  return formatter.format(days, "day");
}

export default function Home() {
  const { jobs, addJob, updateJob, isLoading: jobsLoading } = useJobs();
  const [professionals] = useState<Professional[]>(initialProfessionals);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobFilterStatus>("全部狀態");
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [locale, setLocale] = useState<Locale>("zh");
  const { user, logout, isLoading } = useAuth();
  const { showToast } = useToast();

  // Set initial selected job when jobs load
  useEffect(() => {
    if (jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs, selectedJobId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (saved && locales.some((item) => item.code === saved)) {
        setLocale(saved as Locale);
      }
    }
  }, []);

  const handleLocaleChange = (value: Locale) => {
    setLocale(value);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCALE_STORAGE_KEY, value);
    }
  };

  const t: AppDictionary = dictionaries[locale];
  const statusLabel: Record<JobStatus, string> = {
    草稿: t.statusDraft,
    媒合中: t.statusMatching,
    已指派: t.statusAssigned,
    施工中: t.statusInProgress,
    待驗收: t.statusAwaitingReview,
    已結案: t.statusCompleted,
    已取消: t.statusCancelled,
  };

  const isProfessional = user?.role === "professional";
  const professionalId = user?.professionalId;
  const canCreateJob = user?.role === "customer";

  const visibleJobs = useMemo(() => {
    if (isProfessional && professionalId) {
      return jobs.filter((job) => job.assignedProfessionalId === professionalId);
    }
    return jobs;
  }, [jobs, isProfessional, professionalId]);

  const filteredJobs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return visibleJobs.filter((job) => {
      const matchesStatus = statusFilter === "全部狀態" || job.status === statusFilter;
      if (term.length === 0) {
        return matchesStatus;
      }
      const title = job.title.toLowerCase();
      const location = job.location.toLowerCase();
      const localizedTitle = translateText(job.title, locale).toLowerCase();
      const localizedLocation = translateText(job.location, locale).toLowerCase();
      return (
        matchesStatus &&
        (title.includes(term) ||
          location.includes(term) ||
          localizedTitle.includes(term) ||
          localizedLocation.includes(term))
      );
    });
  }, [visibleJobs, searchTerm, statusFilter, locale]);

  useEffect(() => {
    if (filteredJobs.length === 0) {
      setSelectedJobId(null);
      return;
    }
    if (!filteredJobs.some((job) => job.id === selectedJobId)) {
      setSelectedJobId(filteredJobs[0].id);
    }
  }, [filteredJobs, selectedJobId]);

  const selectedJob = filteredJobs.find((job) => job.id === selectedJobId) ?? null;

  const handleAssign = async (job: JobRequest, professional: Professional) => {
    try {
      await updateJob(job.id, {
        status: "已指派",
        assignedProfessionalId: professional.id,
        timeline: [
          ...job.timeline,
          {
            id: crypto.randomUUID(),
            kind: "更新",
            summary: {
              zh: `${professional.name} 已指派`,
              en: `${professional.name} assigned`,
              de: `${professional.name} zugewiesen`,
            },
            date: new Date().toISOString(),
          },
        ],
      });
      showToast(`${professional.name} 已指派到此需求`, 'success');
    } catch (error) {
      console.error('Failed to assign professional:', error);
      showToast('指派失敗，請稍後再試', 'error');
    }
  };

  const handleCreateJob = async (job: JobRequest) => {
    try {
      await addJob(job);
      setSelectedJobId(job.id);
      showToast('需求已建立', 'success');
    } catch (error) {
      console.error('Failed to create job:', error);
      showToast('建立需求失敗，請稍後再試', 'error');
    }
  };

  const assignedProfessional =
    selectedJob?.assignedProfessionalId &&
    professionals.find((item) => item.id === selectedJob.assignedProfessionalId);

  if (isLoading || jobsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600"></div>
          <p className="text-sm text-slate-500">載入中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{t.appTitle}</h1>
              <p className="text-sm text-slate-500">{t.appSubtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher locale={locale} onChange={handleLocaleChange} />
              <Link
                href="/login"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-emerald-500"
              >
                {t.landingLoginLink}
              </Link>
            </div>
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-6 px-6 py-12">
          <div className="grid gap-8 rounded-3xl border border-slate-200 bg-white p-10 shadow-sm lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h2 className="text-3xl font-semibold text-slate-900">{t.landingTitle}</h2>
              <p className="mt-3 text-base text-slate-600">{t.landingSubtitle}</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-emerald-500">✔</span>
                  <span>{t.landingBulletOne}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-emerald-500">✔</span>
                  <span>{t.landingBulletTwo}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-emerald-500">✔</span>
                  <span>{t.landingBulletThree}</span>
                </li>
              </ul>
              <Link
                href="/login"
                className="mt-8 inline-flex items-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
              >
                {t.landingLoginLink} →
              </Link>
            </div>
            <div className="rounded-2xl bg-slate-100 p-6 text-sm text-slate-600">
              <p className="font-semibold text-slate-700">{t.authDemoTitle}</p>
              <p className="mt-2 text-xs text-slate-500 leading-6">
                user@example.com / demo123
                <br />
                pro@example.com / demo123
              </p>
              <p className="mt-6 text-xs text-slate-400">登入後可完整體驗媒合流程。</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{t.appTitle}</h1>
            <p className="text-sm text-slate-500">{t.appSubtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher locale={locale} onChange={handleLocaleChange} />
            <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 sm:flex">
              <span>{user.name}</span>
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-slate-500">
                {user.role === "professional" ? t.roleProfessional : t.roleCustomer}
              </span>
            </div>
            <Link
              href="/todos"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              {t.todosTitle}
            </Link>
            {canCreateJob ? (
              <button
                onClick={() => setIsNewJobOpen(true)}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-emerald-500"
              >
                {t.newJob}
              </button>
            ) : null}
            <button
              onClick={logout}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              {t.authLogout}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-6 lg:flex-row">
        <section className="flex h-[80vh] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white lg:w-80">
          <div className="border-b border-slate-200 p-4">
            <div className="mb-3 flex gap-2">
              <div className="relative flex-1">
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  placeholder={t.searchPlaceholder}
                />
                <span
                  className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400"
                  aria-hidden="true"
                >
                  🔍
                </span>
              </div>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as JobFilterStatus)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              >
                <option value="全部狀態">{t.statusAll}</option>
                <option value="草稿">{t.statusDraft}</option>
                <option value="媒合中">{t.statusMatching}</option>
                <option value="已指派">{t.statusAssigned}</option>
                <option value="施工中">{t.statusInProgress}</option>
                <option value="待驗收">{t.statusAwaitingReview}</option>
                <option value="已結案">{t.statusCompleted}</option>
                <option value="已取消">{t.statusCancelled}</option>
              </select>
            </div>
            <p className="text-xs text-slate-400">
              {t.totalJobs(filteredJobs.length, visibleJobs.length)}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredJobs.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-sm text-slate-400">
                <span>{t.emptyListTitle}</span>
                {canCreateJob ? (
                  <button
                    onClick={() => setIsNewJobOpen(true)}
                    className="rounded-full border border-emerald-500 px-3 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                  >
                    {t.emptyListCta}
                  </button>
                ) : null}
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {filteredJobs.map((job) => {
                  const titleText = translateText(job.title, locale);
                  const locationText = translateText(job.location, locale);
                  const categoryText = translateText(job.category, locale);
                  return (
                    <li key={job.id}>
                      <button
                        onClick={() => setSelectedJobId(job.id)}
                        className={`w-full px-4 py-3 text-left transition ${
                          job.id === selectedJobId ? "bg-emerald-50" : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{titleText}</p>
                            <p className="text-xs text-slate-500">{locationText}</p>
                          </div>
                          <span
                            className={`rounded-full px-2 py-1 text-[11px] font-medium ${statusColor[job.status]}`}
                          >
                            {statusLabel[job.status]}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                            {categoryText}
                          </span>
                          {job.budgetRange ? (
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                              💰 {job.budgetRange}
                            </span>
                          ) : null}
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${urgencyPill(
                              job.urgency
                            )}`}
                          >
                            ⚡ {job.urgency === "急件" ? t.urgencyUrgent : t.urgencyNormal}
                          </span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <section className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {selectedJob ? (
            (() => {
              const jobTitleText = translateText(selectedJob.title, locale);
              const jobCategoryText = translateText(selectedJob.category, locale);
              const jobDescriptionText = translateText(selectedJob.description, locale);
              const jobLocationText = translateText(selectedJob.location, locale);
              const jobScheduleText = translateText(selectedJob.preferredSchedule, locale);
              const jobBudgetText = selectedJob.budgetRange
                ? translateText(selectedJob.budgetRange, locale)
                : undefined;
              return (
            <div className="h-full overflow-y-auto">
              <div className="border-b border-slate-200 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="mb-3 flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor[selectedJob.status]}`}
                      >
                        {statusLabel[selectedJob.status]}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                        {jobCategoryText}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${urgencyPill(
                          selectedJob.urgency
                        )}`}
                      >
                        {selectedJob.urgency === "急件" ? t.urgencyUrgent : t.urgencyNormal}
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900">{jobTitleText}</h2>
                    <p className="mt-1 text-sm text-slate-500">{jobDescriptionText}</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <InfoBlock label={t.location} value={jobLocationText} icon="📍" />
                  <InfoBlock label={t.schedule} value={jobScheduleText} icon="🗓️" />
                  <InfoBlock
                    label={t.urgency}
                    value={selectedJob.urgency === "急件" ? t.urgencyUrgent : t.urgencyNormal}
                    icon="⚡"
                    badgeClass={urgencyPill(selectedJob.urgency)}
                  />
                  {selectedJob.budgetRange ? (
                    <InfoBlock label={t.budget} value={jobBudgetText ?? selectedJob.budgetRange} icon="💰" />
                  ) : null}
                </div>
              </div>

              <div className="grid gap-6 p-6 lg:grid-cols-[2fr_1fr]">
                <article className="rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-semibold text-slate-700">{t.timelineTitle}</h3>
                  <ol className="mt-4 space-y-4">
                    {[...selectedJob.timeline]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((entry) => (
                        <li
                          key={entry.id}
                          className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3"
                        >
                          <div className="h-10 w-10 shrink-0 rounded-lg bg-emerald-100 text-center text-lg leading-10 text-emerald-600">
                            {entry.kind === "建立工單"
                              ? "✨"
                              : entry.kind === "更新"
                              ? "✏️"
                              : entry.kind === "訊息"
                              ? "💬"
                              : entry.kind === "照片"
                              ? "📷"
                              : "✅"}
                          </div>
                          <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">{entry.summary[locale]}</p>
                            <p className="text-xs text-slate-400">
                              {formatRelativeTime(entry.date, locale)}
                            </p>
                          </div>
          </li>
                      ))}
        </ol>
                </article>

                <aside className="space-y-4">
                  {assignedProfessional ? (
                    <section className="rounded-xl border border-slate-200 p-5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-700">
                          {t.assignedProfessionalTitle}
                        </h3>
                        <button
                          onClick={() => setSelectedProfessional(assignedProfessional)}
                          className="text-xs font-medium text-emerald-600 hover:text-emerald-500"
                        >
                          {t.viewResume}
                        </button>
                      </div>
                      <ProfessionalCard professional={assignedProfessional} labels={t} locale={locale} />
                    </section>
                  ) : (
                    <section className="rounded-xl border border-slate-200 p-5">
                      <h3 className="text-sm font-semibold text-slate-700">
                        {t.recommendedProfessionalsTitle}
                      </h3>
                      <p className="mb-4 mt-1 text-xs text-slate-400">
                        {t.recommendedProfessionalsSubtitle}
                      </p>
                      <div className="space-y-3">
                        {professionals.map((professional) => (
                          <div key={professional.id} className="rounded-lg border border-slate-100 p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  {professional.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {translateText(professional.trade, locale)}｜
                                  {t.professionalExperienceYears.replace(
                                    "{0}",
                                    String(professional.yearsOfExperience)
                                  )}
                                </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${verificationColor[professional.verificationLevel]}`}
                              >
                                <span>{verificationIcon[professional.verificationLevel]}</span>
                                <span>{getVerificationLabel(t, professional.verificationLevel)}</span>
                              </span>
                            </div>
                              </div>
                              <div className="text-right text-xs text-amber-500">
                                ⭐ {professional.rating.toFixed(1)}
                                <p className="text-[10px] text-slate-400">
                                  {t.professionalCompletedJobs}: {professional.completedJobs}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 flex gap-2">
                              <button
                                onClick={() => handleAssign(selectedJob, professional)}
                                className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-500"
                              >
                                {t.assign}
                              </button>
                              <button
                                onClick={() => setSelectedProfessional(professional)}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
                              >
                                {t.resume}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                  <section className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-400">
                    <p className="font-medium text-slate-500">{t.warrantyTitle}</p>
                    <p className="mt-1 text-xs">{t.warrantyDescription}</p>
                  </section>
                </aside>
              </div>
            </div>
              );
            })()
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-12 text-slate-500">
              <span className="text-4xl">🛠️</span>
              <div className="text-center">
                <p className="text-lg font-semibold text-slate-700">{t.selectJobTitle}</p>
                <p className="text-sm text-slate-500">{t.selectJobSubtitle}</p>
              </div>
              {canCreateJob ? (
                <button
                  onClick={() => setIsNewJobOpen(true)}
                  className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
                >
                  {t.newJob}
                </button>
              ) : null}
        </div>
          )}
        </section>
      </main>

      {isNewJobOpen ? (
        <NewJobModal
          labels={t}
          locale={locale}
          onClose={() => setIsNewJobOpen(false)}
          onSubmit={(payload) => {
            handleCreateJob(payload);
            setIsNewJobOpen(false);
          }}
        />
      ) : null}

      {selectedProfessional ? (
        <ProfessionalModal
          labels={t}
          locale={locale}
          professional={selectedProfessional}
          assignedJobs={jobs.filter(
            (job) => job.assignedProfessionalId === selectedProfessional.id
          )}
          onClose={() => setSelectedProfessional(null)}
        />
      ) : null}
    </div>
  );
}

function InfoBlock({
  icon,
  label,
  value,
  badgeClass,
}: {
  icon: string;
  label: string;
  value: string;
  badgeClass?: string;
}) {
  const content = (
    <div className="flex items-start gap-3">
      <div className="text-lg">{icon}</div>
      <div>
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p
          className={`mt-1 text-sm font-medium text-slate-800 ${
            badgeClass ? `inline-flex rounded-full px-3 py-1 ${badgeClass}` : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );

  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
      {badgeClass ? (
        <div className="inline-flex items-center">{content}</div>
      ) : (
        content
      )}
    </div>
  );
}

function LanguageSwitcher({
  locale,
  onChange,
}: {
  locale: Locale;
  onChange: (value: Locale) => void;
}) {
  return (
    <select
      value={locale}
      onChange={(event) => onChange(event.target.value as Locale)}
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
    >
      {locales.map((item) => (
        <option key={item.code} value={item.code}>
          {item.label}
        </option>
      ))}
    </select>
  );
}

function ProfessionalCard({
  professional,
  labels,
  locale,
}: {
  professional: Professional;
  labels: AppDictionary;
  locale: Locale;
}) {
  const tradeText = translateText(professional.trade, locale);
  const introductionText = translateText(professional.introduction, locale);
  const availabilityText = translateText(professional.availability, locale);
  const verificationLabel = getVerificationLabel(labels, professional.verificationLevel);
  return (
    <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-800">{professional.name}</p>
      <p className="text-xs text-slate-500">
        {tradeText}｜
        {labels.professionalExperienceYears.replace(
          "{0}",
          String(professional.yearsOfExperience)
        )}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${verificationColor[professional.verificationLevel]}`}
        >
          <span>{verificationIcon[professional.verificationLevel]}</span>
          <span>{verificationLabel}</span>
        </span>
        {professional.verifiedAt ? (
          <span className="text-[10px] text-slate-400">
            {labels.verificationLastVerified}：{formatVerifiedDate(professional.verifiedAt, locale)}
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-600">
          ⭐ {professional.rating.toFixed(1)}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5">
          {labels.professionalCompletedJobs}: {professional.completedJobs}
        </span>
      </div>
      <p className="mt-3 text-xs text-slate-500">{introductionText}</p>
      <p className="mt-2 text-[11px] text-slate-400">{availabilityText}</p>
    </div>
  );
}

type NewJobFormState = {
  title: string;
  category: string;
  description: string;
  location: string;
  preferredSchedule: string;
  budgetRange: string;
  urgency: "一般" | "急件";
};

function NewJobModal({
  labels,
  locale,
  onClose,
  onSubmit,
}: {
  labels: AppDictionary;
  locale: Locale;
  onClose: () => void;
  onSubmit: (job: JobRequest) => void;
}) {
  const categories =
    locale === "en"
      ? [
          "Electrical & Mechanical",
          "Fire safety",
          "Waterproofing",
          "Structural reinforcement",
          "Interior repairs",
        ]
      : locale === "de"
      ? [
          "Elektro & Mechanik",
          "Brandschutz",
          "Abdichtung",
          "Strukturelle Verstärkung",
          "Innenreparaturen",
        ]
      : ["機電工程", "消防工程", "防水工程", "結構補強", "室內修繕"];

  const urgencyOptions = [
    { value: "一般" as const, label: labels.urgencyNormal },
    { value: "急件" as const, label: labels.urgencyUrgent },
  ];

  const [form, setForm] = useState<NewJobFormState>({
    title: "",
    category: categories[0] ?? "",
    description: "",
    location: "",
    preferredSchedule: "",
    budgetRange: "",
    urgency: "一般",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof NewJobFormState, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof NewJobFormState, string>> = {};

    const titleValidation = validateJobTitle(form.title);
    if (!titleValidation.valid) {
      newErrors.title = titleValidation.error;
    }

    const descriptionValidation = validateJobDescription(form.description);
    if (!descriptionValidation.valid) {
      newErrors.description = descriptionValidation.error;
    }

    const locationValidation = validateLocation(form.location);
    if (!locationValidation.valid) {
      newErrors.location = locationValidation.error;
    }

    const scheduleValidation = validateSchedule(form.preferredSchedule);
    if (!scheduleValidation.valid) {
      newErrors.preferredSchedule = scheduleValidation.error;
    }

    const budgetValidation = validateBudget(form.budgetRange);
    if (!budgetValidation.valid) {
      newErrors.budgetRange = budgetValidation.error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValid = validateForm();

  const handleChange = (key: keyof NewJobFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    const job: JobRequest = {
      id: crypto.randomUUID(),
      title: form.title.trim(),
      category: form.category,
      description: form.description.trim(),
      location: form.location.trim(),
      preferredSchedule: form.preferredSchedule.trim(),
      budgetRange: form.budgetRange.trim() || undefined,
      urgency: form.urgency,
      status: "媒合中",
      timeline: [
        {
          id: crypto.randomUUID(),
          kind: "建立工單",
          summary: {
            zh: "工單建立",
            en: "Request created",
            de: "Anfrage erstellt",
          },
          date: new Date().toISOString(),
        },
      ],
    };
    onSubmit(job);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-lg">
        <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{labels.newJobModalTitle}</h2>
            <p className="text-xs text-slate-500">{labels.newJobModalSubtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
            aria-label={labels.modalClose}
          >
            ✕
          </button>
        </header>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>{labels.newJobTitleLabel}</Label>
              <Input
                value={form.title}
                onChange={(event) => {
                  handleChange("title", event.target.value);
                  if (errors.title) {
                    const validation = validateJobTitle(event.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      title: validation.valid ? undefined : validation.error,
                    }));
                  }
                }}
                onBlur={() => {
                  const validation = validateJobTitle(form.title);
                  setErrors((prev) => ({
                    ...prev,
                    title: validation.valid ? undefined : validation.error,
                  }));
                }}
                placeholder={labels.newJobTitlePlaceholder}
                className={errors.title ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100" : ""}
                aria-invalid={!!errors.title}
                aria-describedby={errors.title ? "title-error" : undefined}
              />
              {errors.title && (
                <p id="title-error" className="mt-1 text-xs text-rose-600" role="alert">
                  {errors.title}
                </p>
              )}
            </div>
            <div>
              <Label>{labels.newJobCategoryLabel}</Label>
              <select
                value={form.category}
                onChange={(event) => handleChange("category", event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {translateText(category, locale)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>{labels.newJobUrgencyLabel}</Label>
              <div className="flex gap-2">
                {urgencyOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleChange("urgency", option.value)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
                      form.urgency === option.value
                        ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                        : "border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label>{labels.newJobLocationLabel}</Label>
              <Input
                value={form.location}
                onChange={(event) => {
                  handleChange("location", event.target.value);
                  if (errors.location) {
                    const validation = validateLocation(event.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      location: validation.valid ? undefined : validation.error,
                    }));
                  }
                }}
                onBlur={() => {
                  const validation = validateLocation(form.location);
                  setErrors((prev) => ({
                    ...prev,
                    location: validation.valid ? undefined : validation.error,
                  }));
                }}
                placeholder={labels.newJobLocationPlaceholder}
                className={errors.location ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100" : ""}
                aria-invalid={!!errors.location}
                aria-describedby={errors.location ? "location-error" : undefined}
              />
              {errors.location && (
                <p id="location-error" className="mt-1 text-xs text-rose-600" role="alert">
                  {errors.location}
                </p>
              )}
            </div>
            <div>
              <Label>{labels.newJobScheduleLabel}</Label>
              <Input
                value={form.preferredSchedule}
                onChange={(event) => {
                  handleChange("preferredSchedule", event.target.value);
                  if (errors.preferredSchedule) {
                    const validation = validateSchedule(event.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      preferredSchedule: validation.valid ? undefined : validation.error,
                    }));
                  }
                }}
                onBlur={() => {
                  const validation = validateSchedule(form.preferredSchedule);
                  setErrors((prev) => ({
                    ...prev,
                    preferredSchedule: validation.valid ? undefined : validation.error,
                  }));
                }}
                placeholder={labels.newJobSchedulePlaceholder}
                className={errors.preferredSchedule ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100" : ""}
                aria-invalid={!!errors.preferredSchedule}
                aria-describedby={errors.preferredSchedule ? "schedule-error" : undefined}
              />
              {errors.preferredSchedule && (
                <p id="schedule-error" className="mt-1 text-xs text-rose-600" role="alert">
                  {errors.preferredSchedule}
                </p>
              )}
            </div>
            <div>
              <Label>{labels.newJobBudgetLabel}</Label>
              <Input
                value={form.budgetRange}
                onChange={(event) => {
                  handleChange("budgetRange", event.target.value);
                  if (errors.budgetRange) {
                    const validation = validateBudget(event.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      budgetRange: validation.valid ? undefined : validation.error,
                    }));
                  }
                }}
                onBlur={() => {
                  const validation = validateBudget(form.budgetRange);
                  setErrors((prev) => ({
                    ...prev,
                    budgetRange: validation.valid ? undefined : validation.error,
                  }));
                }}
                placeholder={labels.newJobBudgetPlaceholder}
                className={errors.budgetRange ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100" : ""}
                aria-invalid={!!errors.budgetRange}
                aria-describedby={errors.budgetRange ? "budget-error" : undefined}
              />
              {errors.budgetRange && (
                <p id="budget-error" className="mt-1 text-xs text-rose-600" role="alert">
                  {errors.budgetRange}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label>{labels.newJobDescriptionLabel}</Label>
              <textarea
                value={form.description}
                onChange={(event) => {
                  handleChange("description", event.target.value);
                  if (errors.description) {
                    const validation = validateJobDescription(event.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      description: validation.valid ? undefined : validation.error,
                    }));
                  }
                }}
                onBlur={() => {
                  const validation = validateJobDescription(form.description);
                  setErrors((prev) => ({
                    ...prev,
                    description: validation.valid ? undefined : validation.error,
                  }));
                }}
                placeholder={labels.newJobDescriptionPlaceholder}
                className={`h-32 w-full rounded-lg border px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 ${
                  errors.description
                    ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                    : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100"
                }`}
                aria-invalid={!!errors.description}
                aria-describedby={errors.description ? "description-error" : undefined}
              />
              {errors.description && (
                <p id="description-error" className="mt-1 text-xs text-rose-600" role="alert">
                  {errors.description}
                </p>
              )}
            </div>
          </div>
        </div>
        <footer className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <p className="text-xs text-slate-400">{labels.newJobHelper}</p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              {labels.newJobModalCancel}
            </button>
            <button
              disabled={!isValid}
              onClick={handleSubmit}
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
                isValid
                  ? "bg-emerald-600 hover:bg-emerald-500"
                  : "cursor-not-allowed bg-emerald-300"
              }`}
            >
              {labels.newJobModalSubmit}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function ProfessionalModal({
  labels,
  locale,
  professional,
  assignedJobs,
  onClose,
}: {
  labels: AppDictionary;
  locale: Locale;
  professional: Professional;
  assignedJobs: JobRequest[];
  onClose: () => void;
}) {
  const statusLabelMap: Record<JobStatus, string> = {
    草稿: labels.statusDraft,
    媒合中: labels.statusMatching,
    已指派: labels.statusAssigned,
    施工中: labels.statusInProgress,
    待驗收: labels.statusAwaitingReview,
    已結案: labels.statusCompleted,
    已取消: labels.statusCancelled,
  };

  const areaSeparator = locale === "zh" ? "、" : ", ";
  const tradeText = translateText(professional.trade, locale);
  const introductionText = translateText(professional.introduction, locale);
  const availabilityText = translateText(professional.availability, locale);
  const serviceAreasText = professional.serviceAreas
    .map((area) => translateText(area, locale))
    .join(locale === "zh" ? areaSeparator : ", ");
  const certificationTexts = professional.certifications.map((cert) =>
    translateText(cert, locale)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <header className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs text-slate-400">{labels.professionalModalTitle}</p>
            <h2 className="text-xl font-semibold text-slate-900">{professional.name}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {tradeText}｜
              {labels.professionalExperienceYears.replace(
                "{0}",
                String(professional.yearsOfExperience)
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
            aria-label={labels.modalClose}
          >
            ✕
          </button>
        </header>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="text-sm font-semibold text-slate-700">{labels.professionalVerificationTitle}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${verificationColor[professional.verificationLevel]}`}
              >
                <span>{verificationIcon[professional.verificationLevel]}</span>
                <span>{getVerificationLabel(labels, professional.verificationLevel)}</span>
              </span>
              {professional.verifiedAt ? (
                <span className="text-xs text-slate-500">
                  {labels.verificationLastVerified}：{formatVerifiedDate(professional.verifiedAt, locale)}
                </span>
              ) : null}
            </div>
            {professional.verificationNotes ? (
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                {labels.verificationNotes}：{professional.verificationNotes}
              </p>
            ) : null}
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-medium text-slate-700">{labels.professionalIntro}</p>
            <p className="mt-2 leading-relaxed">{introductionText}</p>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <InfoPanel title={labels.professionalRating} value={`⭐ ${professional.rating.toFixed(1)}`} />
            <InfoPanel
              title={labels.professionalCompletedJobs}
              value={`${professional.completedJobs}`}
            />
            <InfoPanel
              title={labels.professionalServiceAreas}
              value={serviceAreasText}
            />
            <InfoPanel title={labels.professionalAvailability} value={availabilityText} />
          </div>
          <div className="mt-4">
            <p className="text-sm font-semibold text-slate-700">{labels.professionalCertifications}</p>
            <ul className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
              {certificationTexts.map((cert) => (
                <li
                  key={cert}
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-600"
                >
                  {cert}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-700">{labels.professionalRecentJobs}</p>
            {assignedJobs.length === 0 ? (
              <p className="mt-2 text-xs text-slate-400">{labels.professionalNoJobs}</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {assignedJobs.map((job) => (
                  <li key={job.id} className="rounded-lg border border-slate-100 p-3">
                    <p className="text-sm font-medium text-slate-800">
                      {translateText(job.title, locale)}
                    </p>
                    <p className="text-xs text-slate-500">{translateText(job.location, locale)}</p>
                    <span
                      className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] ${statusColor[job.status]}`}
                    >
                      {statusLabelMap[job.status]}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoPanel({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
      <p className="text-xs text-slate-400">{title}</p>
      <p className="mt-1 text-sm font-semibold text-slate-700">{value}</p>
    </div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <p className="text-xs font-semibold text-slate-500">{children}</p>;
}

function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return (
    <input
      {...rest}
      className={`mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 ${
        className ?? ""
      }`}
    />
  );
}
