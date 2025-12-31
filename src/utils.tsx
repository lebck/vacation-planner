import type { HolidayMap } from './types';

export const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
export const parseDateLocal = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const isHalfHoliday = (dateStr: string): boolean => dateStr.endsWith('-12-24') || dateStr.endsWith('-12-31');

const getEasterDate = (year: number): Date => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
};
export const getGermanHolidays = (year: number, state: string): HolidayMap => {
  const easter = getEasterDate(year);
  const addDays = (date: Date, days: number): Date => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };

  const holidays: HolidayMap = {
    [formatDateLocal(new Date(year, 0, 1))]: "Neujahr",
    [formatDateLocal(new Date(year, 4, 1))]: "Tag der Arbeit",
    [formatDateLocal(new Date(year, 9, 3))]: "Tag der Deutschen Einheit",
    [formatDateLocal(new Date(year, 11, 25))]: "1. Weihnachtstag",
    [formatDateLocal(new Date(year, 11, 26))]: "2. Weihnachtstag",
    [formatDateLocal(addDays(easter, -2))]: "Karfreitag",
    [formatDateLocal(addDays(easter, 1))]: "Ostermontag",
    [formatDateLocal(addDays(easter, 39))]: "Christi Himmelfahrt",
    [formatDateLocal(addDays(easter, 50))]: "Pfingstmontag",
  };

  if (['BW', 'BY', 'ST'].includes(state)) holidays[formatDateLocal(new Date(year, 0, 6))] = "Heilige Drei Könige";
  if (['BW', 'BY', 'HE', 'NW', 'RP', 'SL'].includes(state)) holidays[formatDateLocal(addDays(easter, 60))] = "Fronleichnam";
  if (state === 'BY') holidays[formatDateLocal(new Date(year, 7, 15))] = "Mariä Himmelfahrt";
  if (['BB', 'HB', 'HH', 'MV', 'NI', 'SH', 'SN', 'ST', 'TH'].includes(state)) holidays[formatDateLocal(new Date(year, 9, 31))] = "Reformationstag";
  if (['BW', 'BY', 'NW', 'RP', 'SL'].includes(state)) holidays[formatDateLocal(new Date(year, 10, 1))] = "Allerheiligen";

  if (state === 'SN') {
    let d = new Date(year, 10, 22);
    while (d.getDay() !== 3) d.setDate(d.getDate() - 1);
    holidays[formatDateLocal(d)] = "Buß- und Bettag";
  }
  if (state === 'BE') holidays[formatDateLocal(new Date(year, 2, 8))] = "Internationaler Frauentag";

  return holidays;
};
