import React, { createContext, useContext, type ReactNode, useState, useEffect, useMemo } from 'react';
import { FERIEN_DATA } from './constants';
import type { VacationContextType, HolidayMap } from './types';
import { getGermanHolidays, parseDateLocal, formatDateLocal } from './utils';
import { VacationStorage } from './VacationStorage';

// --- CONTEXT ---
const VacationContext = createContext<VacationContextType | undefined>(undefined);

export const useVacation = (): VacationContextType => {
  const context = useContext(VacationContext);
  if (!context) throw new Error("useVacation must be used within a VacationProvider");
  return context;
};
export const VacationProvider: React.FC<{ children: ReactNode; }> = ({ children }) => {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [federalState, setFederalState] = useState<string>('HE');
  const [vacationDays, setVacationDays] = useState<string[]>([]);
  const [blockedDays, setBlockedDays] = useState<string[]>([]);
  const [vacationNotes, setVacationNotes] = useState<Record<string, string>>({});
  const [blockedNotes, setBlockedNotes] = useState<Record<string, string>>({});
  const [totalEntitlement, setTotalEntitlement] = useState<number>(30);
  const [selectionStart, setSelectionStart] = useState<string | null>(null);
  const [blockSelectionStart, setBlockSelectionStart] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const data = VacationStorage.load();
    if (data) {
      if (data.vacationDays) setVacationDays(data.vacationDays);
      if (data.blockedDays) setBlockedDays(data.blockedDays);
      if (data.vacationNotes) setVacationNotes(data.vacationNotes);
      if (data.blockedNotes) setBlockedNotes(data.blockedNotes);
      if (data.totalEntitlement) setTotalEntitlement(data.totalEntitlement);
      if (data.federalState) setFederalState(data.federalState);
      if (data.year) setYear(data.year);
    }
  }, []);

  useEffect(() => {
    const triggerSave = () => {
      setIsSaving(true);
      VacationStorage.save({
        vacationDays, blockedDays, vacationNotes, blockedNotes,
        totalEntitlement, federalState, year
      });
      const visualFeedback = setTimeout(() => setIsSaving(false), 500);
      return () => clearTimeout(visualFeedback);
    };

    const debounce = setTimeout(triggerSave, 800);
    return () => clearTimeout(debounce);
  }, [vacationDays, blockedDays, vacationNotes, blockedNotes, totalEntitlement, federalState, year]);

  const holidays = useMemo(() => getGermanHolidays(year, federalState), [year, federalState]);

  const schoolHolidays = useMemo(() => {
    const map: HolidayMap = {};
    const allYearsForState = FERIEN_DATA[federalState] || {};
    Object.keys(allYearsForState).forEach(dataYearStr => {
      const dataYear = Number(dataYearStr);
      (allYearsForState[dataYear] || []).forEach(period => {
        let curr = parseDateLocal(period.start);
        const end = parseDateLocal(period.end);
        while (curr <= end) {
          if (curr.getFullYear() === year) map[formatDateLocal(curr)] = period.name;
          curr.setDate(curr.getDate() + 1);
        }
      });
    });
    return map;
  }, [year, federalState]);

  const bridgeDays = useMemo(() => {
    const bridges: HolidayMap = {};
    Object.keys(holidays).forEach(dateStr => {
      const date = parseDateLocal(dateStr);
      if (date.getDay() === 2) {
        const monStr = formatDateLocal(new Date(date.getTime() - 86400000));
        if (!holidays[monStr]) bridges[monStr] = `Brückentag vor ${holidays[dateStr]}`;
      }
      if (date.getDay() === 4) {
        const friStr = formatDateLocal(new Date(date.getTime() + 86400000));
        if (!holidays[friStr]) bridges[friStr] = `Brückentag nach ${holidays[dateStr]}`;
      }
    });
    return bridges;
  }, [holidays]);

  const getDatesInRange = (start: Date, end: Date, includeWeekends: boolean = false): string[] => {
    const rangeStart = new Date(Math.min(start.getTime(), end.getTime()));
    const rangeEnd = new Date(Math.max(start.getTime(), end.getTime()));
    const dates: string[] = [];
    let curr = new Date(rangeStart);
    while (curr <= rangeEnd) {
      const s = formatDateLocal(curr);
      if (includeWeekends || (![0, 6].includes(curr.getDay()) && !holidays[s])) dates.push(s);
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  };

  const groupDates = (datesArray: string[], type: 'vacation' | 'blocked' = 'vacation'): string[][] => {
    if (datesArray.length === 0) return [];
    const sorted = [...datesArray].sort();
    const groups: string[][] = [];
    let current: string[] = [sorted[0]];
    for (let i = 1; i < sorted.length; i++) {
      const p = parseDateLocal(sorted[i - 1]); const n = parseDateLocal(sorted[i]);
      let isCont = true;
      if (type === 'blocked') { p.setDate(p.getDate() + 1); if (formatDateLocal(p) !== sorted[i]) isCont = false; }
      else {
        let ch = new Date(p); ch.setDate(ch.getDate() + 1);
        while (ch < n) {
          const s = formatDateLocal(ch);
          if (!([0, 6].includes(ch.getDay()) || !!holidays[s] || blockedDays.includes(s))) { isCont = false; break; }
          ch.setDate(ch.getDate() + 1);
        }
      }
      if (isCont) current.push(sorted[i]); else { groups.push(current); current = [sorted[i]]; }
    }
    groups.push(current);
    return groups;
  };

  const toggleVacation = (dateStr: string): void => {
    const d = parseDateLocal(dateStr);
    if (!!holidays[dateStr] || [0, 6].includes(d.getDay())) { setSelectionStart(null); return; }
    if (!selectionStart) { setSelectionStart(dateStr); } else {
      const range = getDatesInRange(parseDateLocal(selectionStart), d);
      if (vacationDays.includes(selectionStart)) { setVacationDays(prev => prev.filter(day => !range.includes(day))); }
      else { setVacationDays(prev => Array.from(new Set([...prev, ...range]))); setBlockedDays(prev => prev.filter(day => !range.includes(day))); }
      setSelectionStart(null);
    }
  };

  const toggleBlocked = (dateStr: string): void => {
    if (!!holidays[dateStr]) { setBlockSelectionStart(null); return; }
    if (!blockSelectionStart) { setBlockSelectionStart(dateStr); } else {
      const range = getDatesInRange(parseDateLocal(blockSelectionStart), parseDateLocal(dateStr), true);
      if (blockedDays.includes(blockSelectionStart)) { setBlockedDays(prev => prev.filter(day => !range.includes(day))); }
      else { setBlockedDays(prev => Array.from(new Set([...prev, ...range]))); setVacationDays(prev => prev.filter(day => !range.includes(day))); }
      setBlockSelectionStart(null);
    }
  };

  const value: VacationContextType = {
    year, setYear,
    federalState, setFederalState,
    vacationDays, setVacationDays,
    blockedDays, setBlockedDays,
    vacationNotes, setVacationNotes,
    blockedNotes, setBlockedNotes,
    totalEntitlement, setTotalEntitlement,
    selectionStart, setSelectionStart,
    blockSelectionStart, setBlockSelectionStart,
    isSaving,
    holidays, schoolHolidays, bridgeDays,
    toggleVacation, toggleBlocked,
    getDatesInRange, groupDates
  };

  return <VacationContext.Provider value={value}>{children}</VacationContext.Provider>;
};
