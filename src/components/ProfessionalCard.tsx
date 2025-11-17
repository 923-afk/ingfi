'use client';

import type { Professional } from '@/types/professional';
import type { AppDictionary, Locale } from '@/i18n/dictionary';
import { translateText } from '@/utils/translations';
import { formatVerifiedDate } from '@/utils/dateFormat';
import { verificationColor, verificationIcon } from '@/utils/constants';

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

interface ProfessionalCardProps {
  professional: Professional;
  labels: AppDictionary;
  locale: Locale;
}

export function ProfessionalCard({ professional, labels, locale }: ProfessionalCardProps) {
  const tradeText = translateText(professional.trade, locale);
  const introductionText = translateText(professional.introduction, locale);
  const availabilityText = translateText(professional.availability, locale);
  const verificationLabel = getVerificationLabel(labels, professional.verificationLevel);

  return (
    <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-800">{professional.name}</p>
      <p className="text-xs text-slate-500">
        {tradeText}｜
        {labels.professionalExperienceYears.replace('{0}', String(professional.yearsOfExperience))}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${verificationColor[professional.verificationLevel]}`}
        >
          <span>{verificationIcon[professional.verificationLevel]}</span>
          <span>{verificationLabel}</span>
        </span>
        {professional.verifiedAt && (
          <span className="text-[10px] text-slate-400">
            {labels.verificationLastVerified}：{formatVerifiedDate(professional.verifiedAt, locale)}
          </span>
        )}
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

