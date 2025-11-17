'use client';

import { locales, type Locale } from '@/i18n/dictionary';

interface LanguageSwitcherProps {
  locale: Locale;
  onChange: (value: Locale) => void;
}

export function LanguageSwitcher({ locale, onChange }: LanguageSwitcherProps) {
  return (
    <select
      value={locale}
      onChange={(event) => onChange(event.target.value as Locale)}
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
      aria-label="選擇語言"
    >
      {locales.map((item) => (
        <option key={item.code} value={item.code}>
          {item.label}
        </option>
      ))}
    </select>
  );
}

