export type JobStatus =
  | "草稿"
  | "媒合中"
  | "已指派"
  | "施工中"
  | "待驗收"
  | "已結案"
  | "已取消";

export type TimelineKind = "建立工單" | "更新" | "訊息" | "照片" | "完工";

export interface TimelineEntry {
  id: string;
  date: string; // ISO timestamp
  kind: TimelineKind;
  summary: {
    zh: string;
    en: string;
    de: string;
  };
}

export interface JobRequest {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  preferredSchedule: string;
  budgetRange?: string;
  urgency: "一般" | "急件";
  status: JobStatus;
  assignedProfessionalId?: string;
  timeline: TimelineEntry[];
}

