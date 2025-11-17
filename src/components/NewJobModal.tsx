'use client';

import { useState } from 'react';
import type { JobRequest } from '@/types/job';
import type { AppDictionary, Locale } from '@/i18n/dictionary';
import { translateText } from '@/utils/translations';
import {
  validateJobTitle,
  validateJobDescription,
  validateLocation,
  validateSchedule,
  validateBudget,
} from '@/utils/validation';
import { Label, Input } from './FormInput';

type NewJobFormState = {
  title: string;
  category: string;
  description: string;
  location: string;
  preferredSchedule: string;
  budgetRange: string;
  urgency: '一般' | '急件';
};

interface NewJobModalProps {
  labels: AppDictionary;
  locale: Locale;
  onClose: () => void;
  onSubmit: (job: JobRequest) => void;
}

export function NewJobModal({ labels, locale, onClose, onSubmit }: NewJobModalProps) {
  const categories =
    locale === 'en'
      ? ['Electrical & Mechanical', 'Fire safety', 'Waterproofing', 'Structural reinforcement', 'Interior repairs']
      : locale === 'de'
      ? ['Elektro & Mechanik', 'Brandschutz', 'Abdichtung', 'Strukturelle Verstärkung', 'Innenreparaturen']
      : ['機電工程', '消防工程', '防水工程', '結構補強', '室內修繕'];

  const urgencyOptions = [
    { value: '一般' as const, label: labels.urgencyNormal },
    { value: '急件' as const, label: labels.urgencyUrgent },
  ];

  const [form, setForm] = useState<NewJobFormState>({
    title: '',
    category: categories[0] ?? '',
    description: '',
    location: '',
    preferredSchedule: '',
    budgetRange: '',
    urgency: '一般',
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
      status: '媒合中',
      timeline: [
        {
          id: crypto.randomUUID(),
          kind: '建立工單',
          summary: {
            zh: '工單建立',
            en: 'Request created',
            de: 'Anfrage erstellt',
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
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label={labels.modalClose}>
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
                  handleChange('title', event.target.value);
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
                className={errors.title ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100' : ''}
                aria-invalid={!!errors.title}
                aria-describedby={errors.title ? 'title-error' : undefined}
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
                onChange={(event) => handleChange('category', event.target.value)}
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
                    onClick={() => handleChange('urgency', option.value)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
                      form.urgency === option.value
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-100'
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
                  handleChange('location', event.target.value);
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
                className={errors.location ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100' : ''}
                aria-invalid={!!errors.location}
                aria-describedby={errors.location ? 'location-error' : undefined}
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
                  handleChange('preferredSchedule', event.target.value);
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
                className={errors.preferredSchedule ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100' : ''}
                aria-invalid={!!errors.preferredSchedule}
                aria-describedby={errors.preferredSchedule ? 'schedule-error' : undefined}
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
                  handleChange('budgetRange', event.target.value);
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
                className={errors.budgetRange ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100' : ''}
                aria-invalid={!!errors.budgetRange}
                aria-describedby={errors.budgetRange ? 'budget-error' : undefined}
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
                  handleChange('description', event.target.value);
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
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'
                }`}
                aria-invalid={!!errors.description}
                aria-describedby={errors.description ? 'description-error' : undefined}
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
                isValid ? 'bg-emerald-600 hover:bg-emerald-500' : 'cursor-not-allowed bg-emerald-300'
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

