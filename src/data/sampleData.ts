import { JobRequest, TimelineEntry } from "@/types/job";
import { Professional } from "@/types/professional";

const localized = (zh: string, en: string, de: string) => ({ zh, en, de });

const timeline = (entries: Omit<TimelineEntry, "id">[]): TimelineEntry[] =>
  entries.map((entry) => ({ ...entry, id: crypto.randomUUID() }));

export const professionals: Professional[] = [
  {
    id: "pro-li-jianhong",
    name: "李建宏",
    trade: "機電工程技師",
    yearsOfExperience: 12,
    rating: 4.8,
    completedJobs: 186,
    certifications: ["丙級電匠", "甲級消防設備士", "高壓氣體特考"],
    serviceAreas: ["台北市", "新北市", "桃園市"],
    availability: "週一至週六 08:00-18:00，可夜間值勤",
    introduction: "專精中央空調與消防系統維護，具有大型商辦機電統包經驗。",
    verificationLevel: "enhanced",
    verifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    verificationNotes: "實地查核設備與證照文件，比對官方註冊資料。",
  },
  {
    id: "pro-huang-yating",
    name: "黃雅婷",
    trade: "防水工程師",
    yearsOfExperience: 9,
    rating: 4.6,
    completedJobs: 142,
    certifications: ["高架作業安全證", "防水施工專業技術士"],
    serviceAreas: ["桃園市", "新竹縣", "新竹市"],
    availability: "週一至週五 09:00-17:00，週末需預約",
    introduction: "擅長各式屋頂防水與外牆補漏，提供 1 年保固與檢測報告。",
    verificationLevel: "basic",
    verifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString(),
    verificationNotes: "完成電話訪查與施工案例佐證，待補上原始發票。",
  },
  {
    id: "pro-chen-junxiang",
    name: "陳俊祥",
    trade: "結構補強技師",
    yearsOfExperience: 15,
    rating: 4.9,
    completedJobs: 204,
    certifications: ["土木技師證照", "鋼構組立 A 級"],
    serviceAreas: ["台北市", "基隆市", "宜蘭縣"],
    availability: "可配合夜間及週末緊急工程",
    introduction: "專注老屋結構補強與耐震評估，提供完整安全檢測與補強方案。",
    verificationLevel: "enhanced",
    verifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString(),
    verificationNotes: "合作建築師推薦，檢附耐震評估報告與大型案場經驗。",
  },
];

export const jobs: JobRequest[] = [
  {
    id: "job-hvac-leak",
    title: "商辦大樓冷氣漏水檢修",
    category: "機電工程",
    description:
      "20 樓中央空調排水疑似堵塞，天花板出現滲水痕跡，需要檢查排水管與保溫層。",
    location: "台北市信義區松高路 101 號 20 樓",
    preferredSchedule: "希望 3 天內進場，施工時間 20:00-24:00",
    budgetRange: "35,000 - 50,000",
    urgency: "急件",
    status: "媒合中",
    timeline: timeline([
      {
        date: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
        kind: "建立工單",
        summary: localized("工單建立", "Request created", "Anfrage erstellt"),
      },
      {
        date: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        kind: "更新",
        summary: localized(
          "補充現場照片 3 張",
          "Uploaded 3 site photos",
          "3 Fotos vom Einsatzort hochgeladen"
        ),
      },
    ]),
  },
  {
    id: "job-firepump-maintenance",
    title: "地下室消防泵浦保養",
    category: "消防工程",
    description:
      "年度消防設備保養，泵浦異常震動，需檢查軸承與壓力錶，並出具檢測報告。",
    location: "新北市板橋區民生路 200 號 B2",
    preferredSchedule: "下週一至週三 09:00-17:00",
    budgetRange: "25,000 - 30,000",
    urgency: "一般",
    status: "已指派",
    assignedProfessionalId: "pro-li-jianhong",
    timeline: timeline([
      {
        date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        kind: "建立工單",
        summary: localized("工單建立", "Request created", "Anfrage erstellt"),
      },
      {
        date: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
        kind: "更新",
        summary: localized("已指派 李建宏 技師", "Assigned to Li Jianhong", "Li Jianhong zugewiesen"),
      },
      {
        date: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        kind: "訊息",
        summary: localized(
          "需求方：需帶備用壓力錶與校正證明",
          "Customer: bring spare pressure gauge and calibration proof",
          "Kunde: Ersatzdruckmesser und Kalibrierungsnachweis mitbringen"
        ),
      },
    ]),
  },
  {
    id: "job-roof-waterproof",
    title: "屋頂防水層翻修",
    category: "防水工程",
    description:
      "透天厝屋頂老化，雨天滲漏，需重新做 PU 防水與排水坡度調整。",
    location: "桃園市中壢區環北路 66 號",
    preferredSchedule: "希望 2 週內開工，週一至週五 09:00-17:00",
    budgetRange: "80,000 - 120,000",
    urgency: "一般",
    status: "待驗收",
    assignedProfessionalId: "pro-huang-yating",
    timeline: timeline([
      {
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        kind: "建立工單",
        summary: localized("工單建立", "Request created", "Anfrage erstellt"),
      },
      {
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        kind: "照片",
        summary: localized(
          "職人上傳施工進度照片",
          "Pro uploaded progress photos",
          "Handwerker hat Fortschrittsfotos hochgeladen"
        ),
      },
      {
        date: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        kind: "完工",
        summary: localized(
          "完成收尾，待業主驗收",
          "Finishing work completed, awaiting customer review",
          "Abschlussarbeiten erledigt, Abnahme steht aus"
        ),
      },
    ]),
  },
];

