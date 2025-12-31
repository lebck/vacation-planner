import type React from "react";


export interface VacationData {
  vacationDays: string[];
  blockedDays: string[];
  vacationNotes: Record<string, string>;
  blockedNotes: Record<string, string>;
  totalEntitlement: number;
  federalState: string;
  year: number;
  lastUpdated?: string;
}
export interface HolidayMap {
  [date: string]: string;
}
interface FerienPeriod {
  start: string;
  end: string;
  name: string;
}
export interface FerienData {
  [bundesland: string]: {
    [year: number]: FerienPeriod[];
  };
}
export interface Bundesland {
  id: string;
  name: string;
}
export interface DayNoteInfo {
  text: string;
  type: 'vacation' | 'blocked';
}
export interface VacationContextType {
  year: number;
  setYear: React.Dispatch<React.SetStateAction<number>>;
  federalState: string;
  setFederalState: React.Dispatch<React.SetStateAction<string>>;
  vacationDays: string[];
  setVacationDays: React.Dispatch<React.SetStateAction<string[]>>;
  blockedDays: string[];
  setBlockedDays: React.Dispatch<React.SetStateAction<string[]>>;
  vacationNotes: Record<string, string>;
  setVacationNotes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  blockedNotes: Record<string, string>;
  setBlockedNotes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  totalEntitlement: number;
  setTotalEntitlement: React.Dispatch<React.SetStateAction<number>>;
  selectionStart: string | null;
  setSelectionStart: React.Dispatch<React.SetStateAction<string | null>>;
  blockSelectionStart: string | null;
  setBlockSelectionStart: React.Dispatch<React.SetStateAction<string | null>>;
  isSaving: boolean;
  holidays: HolidayMap;
  schoolHolidays: HolidayMap;
  bridgeDays: HolidayMap;
  toggleVacation: (dateStr: string) => void;
  toggleBlocked: (dateStr: string) => void;
  getDatesInRange: (start: Date, end: Date, includeWeekends?: boolean) => string[];
  groupDates: (datesArray: string[], type?: 'vacation' | 'blocked') => string[][];
}
