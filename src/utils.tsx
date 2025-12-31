import { FERIEN_DATA } from './constants';
import type { FerienData, HolidayMap } from './types';

const OPEN_HOLIDAYS_BASE_URL = 'https://openholidaysapi.org';
const OPEN_HOLIDAYS_COUNTRY_ISO = 'DE';
const OPEN_HOLIDAYS_LANGUAGE_ISO = 'DE';
const SCHOOL_HOLIDAY_STORAGE_KEY = 'vacationPlanPro.schoolHolidayCache';
const SCHOOL_HOLIDAY_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 30;

interface OpenHolidaysName {
  language: string;
  text: string;
}

interface OpenHolidaysSchoolHoliday {
  id: string;
  startDate: string;
  endDate: string;
  type: string;
  name: OpenHolidaysName[];
  regionalScope?: string;
  temporalScope?: string;
  nationwide?: boolean;
  subdivisions?: Array<{ code: string; shortName?: string; }>;
}

interface PersistedSchoolHolidayEntry {
  fetchedAt: number;
  map: HolidayMap;
}

type PersistedSchoolHolidayCache = Record<string, PersistedSchoolHolidayEntry>;

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

const readPersistedSchoolHolidayCache = (): PersistedSchoolHolidayCache => {
  try {
    const raw = localStorage.getItem(SCHOOL_HOLIDAY_STORAGE_KEY);
    return raw ? JSON.parse(raw) as PersistedSchoolHolidayCache : {};
  } catch (error) {
    console.error('Failed to read school holiday cache', error);
    return {};
  }
};

const writePersistedSchoolHolidayCache = (cache: PersistedSchoolHolidayCache): void => {
  try {
    localStorage.setItem(SCHOOL_HOLIDAY_STORAGE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Failed to persist school holiday cache', error);
  }
};

export const getPersistedSchoolHolidayMap = (
  cacheKey: string,
  ttlMs: number = SCHOOL_HOLIDAY_CACHE_TTL_MS
): HolidayMap | null => {
  const cache = readPersistedSchoolHolidayCache();
  const entry = cache[cacheKey];
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > ttlMs) {
    delete cache[cacheKey];
    writePersistedSchoolHolidayCache(cache);
    return null;
  }
  return entry.map;
};

export const persistSchoolHolidayMap = (cacheKey: string, map: HolidayMap): void => {
  const cache = readPersistedSchoolHolidayCache();
  cache[cacheKey] = { fetchedAt: Date.now(), map };
  writePersistedSchoolHolidayCache(cache);
};

const addPeriodToHolidayMap = (startStr: string, endStr: string, year: number, label: string, target: HolidayMap): void => {
  let cursor = parseDateLocal(startStr);
  const periodEnd = parseDateLocal(endStr);
  while (cursor <= periodEnd) {
    if (cursor.getFullYear() === year) target[formatDateLocal(cursor)] = label;
    cursor.setDate(cursor.getDate() + 1);
  }
};

const toSubdivisionCode = (state: string): string => `${OPEN_HOLIDAYS_COUNTRY_ISO}-${state.toUpperCase()}`;

export const buildSchoolHolidayMapFromStaticData = (
  year: number,
  federalState: string,
  data: FerienData = FERIEN_DATA
): HolidayMap => {
  const map: HolidayMap = {};
  const stateData = data[federalState];
  if (!stateData) return map;
  Object.values(stateData).forEach(periods => {
    (periods || []).forEach(period => {
      addPeriodToHolidayMap(period.start, period.end, year, period.name, map);
    });
  });
  return map;
};

const buildSchoolHolidayMapFromApiPayload = (payload: OpenHolidaysSchoolHoliday[], year: number): HolidayMap => {
  const map: HolidayMap = {};
  payload.forEach(item => {
    const localizedName = item.name.find(entry => entry.language === OPEN_HOLIDAYS_LANGUAGE_ISO)?.text
      ?? item.name[0]?.text
      ?? 'Schulferien';
    addPeriodToHolidayMap(item.startDate, item.endDate, year, localizedName, map);
  });
  return map;
};

export const fetchSchoolHolidayMap = async (
  year: number,
  federalState: string,
  signal?: AbortSignal
): Promise<HolidayMap> => {
  const params = new URLSearchParams({
    countryIsoCode: OPEN_HOLIDAYS_COUNTRY_ISO,
    subdivisionCode: toSubdivisionCode(federalState),
    languageIsoCode: OPEN_HOLIDAYS_LANGUAGE_ISO,
    validFrom: `${year}-01-01`,
    validTo: `${year}-12-31`
  });

  const response = await fetch(`${OPEN_HOLIDAYS_BASE_URL}/SchoolHolidays?${params.toString()}`, {
    headers: { accept: 'application/json' },
    signal
  });

  if (!response.ok) throw new Error(`OpenHolidays request failed (${response.status})`);

  const payload = await response.json() as OpenHolidaysSchoolHoliday[];

  if (payload.length === 0) throw new Error(`OpenHolidays request failed. empty response for ${federalState} ${year}`);

  return buildSchoolHolidayMapFromApiPayload(payload, year);
};

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

const escapeIcsText = (value: string): string =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");

const formatDateForIcs = (dateStr: string): string => dateStr.replace(/-/g, '');

const formatTimestampForIcs = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
};

const addDaysToDateStr = (dateStr: string, offset: number): string => {
  const date = parseDateLocal(dateStr);
  date.setDate(date.getDate() + offset);
  return formatDateLocal(date);
};

export interface VacationIcsOptions {
  year: number;
  federalState: string;
  calendarName?: string;
}

export const buildVacationIcs = (
  groupedDates: string[][],
  vacationNotes: Record<string, string>,
  options: VacationIcsOptions
): string => {
  const { year, federalState, calendarName = `Urlaub ${year}` } = options;
  const dtStamp = formatTimestampForIcs(new Date());

  const events = groupedDates.map(dates => {
    if (!dates.length) return '';
    const start = dates[0];
    const end = dates[dates.length - 1];
    const dtStart = formatDateForIcs(start);
    const dtEnd = formatDateForIcs(addDaysToDateStr(end, 1));
    const uid = `${dtStart}-${dtEnd}-${federalState}@vacation-planner.local`;

    const note = vacationNotes[start] ?? vacationNotes[end];

    return [
      'BEGIN:VEVENT',
      `DTSTAMP:${dtStamp}`,
      `UID:${uid}`,
      `SUMMARY:${note ?? "Urlaub"}`,
      'TRANSP:OPAQUE',
      `DTSTART;VALUE=DATE:${dtStart}`,
      `DTEND;VALUE=DATE:${dtEnd}`,
      'END:VEVENT'
    ].join('\r\n');
  }).filter(Boolean);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Vacation Planner//DE',
    'CALSCALE:GREGORIAN',
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    ...events,
    'END:VCALENDAR'
  ];

  return `${lines.join('\r\n')}\r\n`;
};
