
/**
 * Formats a Date object into DD.MM.YYYY
 */
export const formatDateToGerman = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

/**
 * Formats a Date object or string into "D. MMMM YYYY" (e.g. 1. Januar 2024)
 */
export const formatLongDate = (dateStr: string, lang: string = 'de'): string => {
  const date = parseGermanDate(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
};

/**
 * Parses DD.MM.YYYY back to a Date object for comparison/sorting
 */
export const parseGermanDate = (dateStr: string): Date => {
  if (!dateStr) return new Date(NaN);
  const [day, month, year] = dateStr.split('.').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Validates if a string matches DD.MM.YYYY
 */
export const isValidGermanDate = (dateStr: string): boolean => {
  const regex = /^\d{2}\.\d{2}\.\d{4}$/;
  if (!regex.test(dateStr)) return false;
  const date = parseGermanDate(dateStr);
  return !isNaN(date.getTime());
};

/**
 * Returns a localized full weekday for a given German date string
 */
export const getLocalizedWeekday = (dateStr: string, lang: string): string => {
  const date = parseGermanDate(dateStr);
  if (isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(lang, { weekday: 'long' }).format(date);
};
