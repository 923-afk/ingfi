import type { Locale } from '@/i18n/dictionary';

const localeToIntl: Record<Locale, string> = {
  zh: 'zh-TW',
  en: 'en-US',
  de: 'de-DE',
};

export function formatVerifiedDate(value: string | undefined, locale: Locale) {
  if (!value) return '';
  try {
    const formatter = new Intl.DateTimeFormat(localeToIntl[locale], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    return formatter.format(new Date(value));
  } catch {
    return value;
  }
}

export function formatRelativeTime(value: string, locale: Locale) {
  const localeMap = locale === 'zh' ? 'zh-TW' : locale === 'de' ? 'de-DE' : 'en-US';
  const formatter = new Intl.RelativeTimeFormat(localeMap, { style: 'short' });
  const target = new Date(value).getTime();
  const diff = target - Date.now();
  const abs = Math.abs(diff);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (abs < hour) {
    const minutes = Math.round(diff / minute);
    return formatter.format(minutes, 'minute');
  }
  if (abs < day) {
    const hours = Math.round(diff / hour);
    return formatter.format(hours, 'hour');
  }
  const days = Math.round(diff / day);
  return formatter.format(days, 'day');
}

