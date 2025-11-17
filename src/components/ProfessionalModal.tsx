'use client';

import type { JobRequest, JobStatus } from '@/types/job';
import type { Professional } from '@/types/professional';
import type { AppDictionary, Locale } from '@/i18n/dictionary';
import { translateText } from '@/utils/translations';
import { formatVerifiedDate } from '@/utils/dateFormat';
import { statusColor, verificationColor, verificationIcon } from '@/utils/constants';

function getVerificationLabel(labels: AppDictionary, level: Professional['verificationLevel']) {
  switch (level) {
    case 'pending':
      return labels.verificationLevelPending;
    case 'basic':
      return labels.verificationLevelBasic;
    case 'enhanced':
      return labels.verificationLevelEnhanced;
  }
}

function InfoPanel({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
      <p className="text-xs text-slate-400">{title}</p>
      <p className="mt-1 text-sm font-semibold text-slate-700">{value}</p>
    </div>
  );
}

interface ProfessionalModalProps {
  labels: AppDictionary;
  locale: Locale;
  professional: Professional;
  assignedJobs: JobRequest[];
  onClose: () => void;
}

export function ProfessionalModal({
  labels,
  locale,
  professional,
  assignedJobs,
  onClose,
}: ProfessionalModalProps) {
  const statusLabelMap: Record<JobStatus, string> = {
    草稿: labels.statusDraft,
    媒合中: labels.statusMatching,
    已指派: labels.statusAssigned,
    施工中: labels.statusInProgress,
    待驗收: labels.statusAwaitingReview,
    已結案: labels.statusCompleted,
    已取消: labels.statusCancelled,
  };

  const areaSeparator = locale === 'zh' ? '、' : ', ';
  const tradeText = translateText(professional.trade, locale);
  const introductionText = translateText(professional.introduction, locale);
  const availabilityText = translateText(professional.availability, locale);
  const serviceAreasText = professional.serviceAreas
    .map((area) => translateText(area, locale))
    .join(locale === 'zh' ? areaSeparator : ', ');
  const certificationTexts = professional.certifications.map((cert) => translateText(cert, locale));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <header className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs text-slate-400">{labels.professionalModalTitle}</p>
            <h2 className="text-xl font-semibold text-slate-900">{professional.name}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {tradeText}｜
              {labels.professionalExperienceYears.replace('{0}', String(professional.yearsOfExperience))}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label={labels.modalClose}>
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
              {professional.verifiedAt && (
                <span className="text-xs text-slate-500">
                  {labels.verificationLastVerified}：{formatVerifiedDate(professional.verifiedAt, locale)}
                </span>
              )}
            </div>
            {professional.verificationNotes && (
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                {labels.verificationNotes}：{professional.verificationNotes}
              </p>
            )}
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-medium text-slate-700">{labels.professionalIntro}</p>
            <p className="mt-2 leading-relaxed">{introductionText}</p>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <InfoPanel title={labels.professionalRating} value={`⭐ ${professional.rating.toFixed(1)}`} />
            <InfoPanel title={labels.professionalCompletedJobs} value={`${professional.completedJobs}`} />
            <InfoPanel title={labels.professionalServiceAreas} value={serviceAreasText} />
            <InfoPanel title={labels.professionalAvailability} value={availabilityText} />
          </div>
          <div className="mt-4">
            <p className="text-sm font-semibold text-slate-700">{labels.professionalCertifications}</p>
            <ul className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
              {certificationTexts.map((cert) => (
                <li key={cert} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-600">
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
                    <p className="text-sm font-medium text-slate-800">{translateText(job.title, locale)}</p>
                    <p className="text-xs text-slate-500">{translateText(job.location, locale)}</p>
                    <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] ${statusColor[job.status]}`}>
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

