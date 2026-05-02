const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

interface InclusiveDateRange {
  dateFrom?: string | null;
  dateTo?: string | null;
}

interface GmailDateRange {
  after?: string;
  before?: string;
}

function parseIsoDate(value: string | null | undefined): Date | null {
  if (!value || !ISO_DATE_PATTERN.test(value)) return null;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function normalizeInclusiveDateRange({
  dateFrom,
  dateTo,
}: InclusiveDateRange): GmailDateRange {
  let from = parseIsoDate(dateFrom);
  let to = parseIsoDate(dateTo);

  if (from && to && from.getTime() > to.getTime()) {
    [from, to] = [to, from];
  }

  return {
    after: from ? formatIsoDate(from) : undefined,
    before: to ? formatIsoDate(addUtcDays(to, 1)) : undefined,
  };
}
