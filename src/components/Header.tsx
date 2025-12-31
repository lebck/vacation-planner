import React, { useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Palmtree,
  Download,
  Upload,
  Loader2,
  Save,
  CalendarPlus
} from 'lucide-react';
import { useVacation } from '../VacationContext';
import type { VacationData } from '../types';
import { BUNDESLAENDER } from '../constants';
import { buildVacationIcs } from '../utils';

export const Header: React.FC = () => {
  const { federalState: state, setFederalState: setState, year, setYear, isSaving, vacationDays, blockedDays, vacationNotes, blockedNotes, totalEntitlement, setVacationDays, setBlockedDays, setVacationNotes, setBlockedNotes, setTotalEntitlement, groupDates } = useVacation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerDownload = (payload: BlobPart, filename: string, mime: string): void => {
    const blob = new Blob([payload], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = (): void => {
    const data: VacationData = { federalState: state, year, totalEntitlement, vacationDays, blockedDays, vacationNotes, blockedNotes };
    triggerDownload(JSON.stringify(data, null, 2), `urlaubsplanung_${year}.json`, 'application/json');
  };

  const handleCalendarExport = (): void => {
    if (!vacationDays.length) {
      alert('Keine Urlaubstage vorhanden, die exportiert werden könnten.');
      return;
    }
    const grouped = groupDates(vacationDays);
    if (!grouped.length) {
      alert('Es konnten keine Urlaubsblöcke gebildet werden.');
      return;
    }
    const ics = buildVacationIcs(grouped, vacationNotes, { year, federalState: state });
    triggerDownload(ics, `urlaub_${year}.ics`, 'text/calendar;charset=utf-8');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as VacationData;
        if (data.vacationDays) setVacationDays(data.vacationDays);
        if (data.blockedDays) setBlockedDays(data.blockedDays);
        if (data.vacationNotes) setVacationNotes(data.vacationNotes);
        if (data.blockedNotes) setBlockedNotes(data.blockedNotes);
        if (data.federalState) setState(data.federalState);
        if (data.totalEntitlement) setTotalEntitlement(data.totalEntitlement);
      } catch (err) { console.error("Import Fehler:", err); }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-4">
        <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-100">
          <Palmtree className="text-white w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Urlaubsplaner</h1>
          <div className="flex items-center gap-2 text-slate-500 text-sm mt-0.5">
            <span>{BUNDESLAENDER.find(b => b.id === state)?.name}</span>
            <span>•</span>
            <span className="flex items-center gap-1 font-medium">
                {isSaving ? <Loader2 size={12} className="animate-spin text-blue-500" /> : <Save size={12} className="text-emerald-500" />}
                {isSaving ? "Speichere lokal..." : "Lokal gespeichert"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-slate-100 rounded-xl p-1 mr-2">
          <button onClick={handleExport} className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-600" title="Exportieren">
            <Download size={18} />
          </button>
          <button onClick={handleCalendarExport} className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-600" title="Kalenderdatei exportieren">
            <CalendarPlus size={18} />
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-600" title="Importieren">
            <Upload size={18} />
          </button>
          <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json" />
        </div>

        <div className="flex bg-slate-100 rounded-xl p-1">
          <button onClick={() => setYear(year - 1)} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all"><ChevronLeft size={20} /></button>
          <span className="px-4 font-bold text-lg min-w-[70px] flex items-center justify-center">{year}</span>
          <button onClick={() => setYear(year + 1)} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all"><ChevronRight size={20} /></button>
        </div>

        <select value={state} onChange={(e) => setState(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm cursor-pointer">
          {BUNDESLAENDER.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>
    </header>
  );
};
