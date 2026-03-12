const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getMonthFormatter(locale: string): Intl.DateTimeFormat {
  const cached = formatterCache.get(locale);
  if (cached) {
    return cached;
  }

  const formatter = new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: 'numeric'
  });
  formatterCache.set(locale, formatter);
  return formatter;
}

function parseMonth(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const isoMonth = /^(\d{4})-(\d{2})$/;
  const match = trimmed.match(isoMonth);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    if (Number.isFinite(year) && Number.isFinite(month) && month >= 1 && month <= 12) {
      return new Date(year, month - 1, 1);
    }
  }

  const isoDate = Date.parse(trimmed);
  if (Number.isNaN(isoDate)) {
    return null;
  }

  return new Date(isoDate);
}

export function formatMonthLabel(value: string, locale = 'fr-FR'): string {
  const parsed = parseMonth(value);
  if (!parsed) {
    return value;
  }

  return getMonthFormatter(locale).format(parsed);
}
