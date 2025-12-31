import React, { useMemo } from 'react';
import { useVacation } from '../VacationContext';
import { formatDateLocal, isHalfHoliday } from '../utils';
import type { DayNoteInfo } from '../types';

export const MonthCalendar: React.FC<{ month: number }> = ({ month }) => {
  const { year, holidays, schoolHolidays, bridgeDays, vacationDays, blockedDays, vacationNotes, blockedNotes, groupDates, toggleVacation, toggleBlocked, selectionStart, blockSelectionStart } = useVacation();

  const mName = new Intl.DateTimeFormat('de-DE', { month: 'long' }).format(new Date(year, month));
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const dayNotes = useMemo(() => {
    const map: Record<string, DayNoteInfo> = {};
    const groupedVac = groupDates(vacationDays, 'vacation');
    groupedVac.forEach(g => { const n = vacationNotes[g[0]]; if (n) g.forEach(d => map[d] = { text: n, type: 'vacation' }); });
    const groupedBlk = groupDates(blockedDays, 'blocked');
    groupedBlk.forEach(g => { const n = blockedNotes[g[0]]; if (n) g.forEach(d => map[d] = { text: n, type: 'blocked' }); });
    return map;
  }, [vacationDays, blockedDays, vacationNotes, blockedNotes, groupDates]);

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:border-emerald-200 transition-colors group/calendar">
      <h3 className="text-xl font-black text-slate-700 mb-6 flex items-center justify-between">
          {mName}
          <div className="h-1 w-12 bg-slate-100 rounded-full group-hover/calendar:bg-emerald-100 transition-colors"></div>
      </h3>
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {['M', 'D', 'M', 'D', 'F', 'S', 'S'].map((d, i) => <div key={i} className="text-[10px] font-black text-slate-300 pb-2 uppercase">{d}</div>)}
        {Array.from({ length: firstDay }).map((_, i) => <div key={i} className="h-10"></div>)}
        {days.map(day => {
          const date = new Date(year, month, day);
          const dateStr = formatDateLocal(date);
          const isWeekend = [0, 6].includes(date.getDay());
          const holiday = holidays[dateStr];
          const schol = schoolHolidays[dateStr];
          const bridge = bridgeDays[dateStr];
          const isVac = vacationDays.includes(dateStr);
          const isBlk = blockedDays.includes(dateStr);
          const info = dayNotes[dateStr];

          let bg = "hover:bg-slate-50 text-slate-500 font-bold";
          let border = "border-2 border-transparent";
          if (isWeekend) bg = "bg-slate-50 text-slate-300 cursor-default";
          if (holiday) bg = "bg-amber-400 text-white shadow-lg shadow-amber-100 cursor-default";
          else if (isHalfHoliday(dateStr) && !isWeekend) bg = "bg-amber-100 text-amber-700 ring-2 ring-inset ring-amber-400";
          else if (isVac) bg = "bg-emerald-500 text-white shadow-lg shadow-emerald-100";
          else if (isBlk) bg = "bg-slate-600 text-white border-2 border-slate-400 border-dashed";
          else if (bridge && !isWeekend) bg = "bg-amber-50 text-amber-600 ring-2 ring-inset ring-amber-300";
          else if (schol && !isWeekend) bg = "bg-sky-50 text-sky-600 border border-sky-100";

          if (selectionStart === dateStr) bg = "bg-emerald-600 text-white ring-4 ring-emerald-200 scale-110 z-10 animate-pulse";
          if (blockSelectionStart === dateStr) bg = "bg-slate-800 text-white ring-4 ring-slate-200 scale-110 z-10 animate-pulse";

          return (
            <button
              key={day}
              onClick={() => toggleVacation(dateStr)}
              onContextMenu={(e) => { e.preventDefault(); toggleBlocked(dateStr); }}
              disabled={!!holiday || isWeekend}
              title={info ? info.text : holiday || schol || bridge}
              className={`h-10 w-full flex items-center justify-center rounded-xl text-xs transition-all relative ${bg} ${border} active:scale-90`}
            >
              {day}
              {info && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-sm text-[8px] border border-slate-100">
                  {info.type === 'vacation' ? '📝' : '📌'}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
