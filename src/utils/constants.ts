import type { JobStatus } from '@/types/job';
import type { VerificationLevel as ProfessionalVerificationLevel } from '@/types/professional';

export const urgencyPill = (urgency: string) =>
  urgency === '急件' ? 'text-orange-600 bg-orange-100' : 'text-slate-600 bg-slate-100';

export const statusColor: Record<JobStatus, string> = {
  草稿: 'bg-slate-200 text-slate-700',
  媒合中: 'bg-orange-100 text-orange-700',
  已指派: 'bg-blue-100 text-blue-700',
  施工中: 'bg-purple-100 text-purple-700',
  待驗收: 'bg-teal-100 text-teal-700',
  已結案: 'bg-emerald-100 text-emerald-700',
  已取消: 'bg-rose-100 text-rose-700',
};

export const verificationColor: Record<ProfessionalVerificationLevel, string> = {
  pending: 'text-orange-600 bg-orange-100 border border-orange-200',
  basic: 'text-sky-700 bg-sky-100 border border-sky-200',
  enhanced: 'text-emerald-700 bg-emerald-100 border border-emerald-200',
};

export const verificationIcon: Record<ProfessionalVerificationLevel, string> = {
  pending: '⏳',
  basic: '✔️',
  enhanced: '🛡️',
};

