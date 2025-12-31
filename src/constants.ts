import type { Bundesland, FerienData } from './types';

export const FERIEN_DATA: FerienData = {
  HE: {
    2025: [{ start: '2025-04-07', end: '2025-04-19', name: 'Osterferien' }, { start: '2025-07-07', end: '2025-08-15', name: 'Sommerferien' }, { start: '2025-10-06', end: '2025-10-18', name: 'Herbstferien' }, { start: '2025-12-22', end: '2026-01-10', name: 'Weihnachtsferien' }],
    2026: [{ start: '2026-03-30', end: '2026-04-11', name: 'Osterferien' }, { start: '2026-06-29', end: '2026-08-07', name: 'Sommerferien' }, { start: '2026-10-05', end: '2026-10-17', name: 'Herbstferien' }, { start: '2026-12-21', end: '2027-01-09', name: 'Weihnachtsferien' }]
  },
  BW: {
    2025: [{ start: '2025-04-14', end: '2025-04-26', name: 'Osterferien' }, { start: '2025-06-10', end: '2025-06-21', name: 'Pfingstferien' }, { start: '2025-07-31', end: '2025-09-13', name: 'Sommerferien' }, { start: '2025-10-27', end: '2025-10-31', name: 'Herbstferien' }, { start: '2025-12-22', end: '2026-01-05', name: 'Weihnachtsferien' }],
    2026: [{ start: '2026-03-31', end: '2026-04-10', name: 'Osterferien' }, { start: '2026-05-26', end: '2026-06-05', name: 'Pfingstferien' }, { start: '2026-07-30', end: '2026-09-12', name: 'Sommerferien' }, { start: '2026-10-26', end: '2026-10-30', name: 'Herbstferien' }, { start: '2026-12-23', end: '2027-01-09', name: 'Weihnachtsferien' }]
  }
};

export const BUNDESLAENDER: Bundesland[] = [
  { id: 'BW', name: 'Baden-Württemberg' }, { id: 'BY', name: 'Bayern' }, { id: 'BE', name: 'Berlin' }, { id: 'BB', name: 'Brandenburg' }, { id: 'HB', name: 'Bremen' }, { id: 'HH', name: 'Hamburg' }, { id: 'HE', name: 'Hessen' }, { id: 'MV', name: 'Mecklenburg-Vorpommern' }, { id: 'NI', name: 'Niedersachsen' }, { id: 'NW', name: 'Nordrhein-Westfalen' }, { id: 'RP', name: 'Rheinland-Pfalz' }, { id: 'SL', name: 'Saarland' }, { id: 'SN', name: 'Sachsen' }, { id: 'ST', name: 'Sachsen-Anhalt' }, { id: 'SH', name: 'Schleswig-Holstein' }, { id: 'TH', name: 'Thüringen' },
];
