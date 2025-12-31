import type { VacationData } from './types';

const STORAGE_KEY = 'vacationPlanPro';
export const VacationStorage = {
  save: (data: VacationData): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...data,
        lastUpdated: new Date().toISOString()
      }));
    } catch (err) {
      console.error("Fehler beim lokalen Speichern:", err);
    }
  },
  load: (): VacationData | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (err) {
      console.error("Fehler beim Laden der lokalen Daten:", err);
      return null;
    }
  }
};
