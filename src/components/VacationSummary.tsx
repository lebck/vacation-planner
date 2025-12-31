import React, { useState } from 'react';
import {
  Palmtree,
  ArrowRight,
  Check,
  X,
  Edit2,
  Trash2,
  StickyNote
} from 'lucide-react';
import { useVacation } from '../VacationContext';
import { parseDateLocal, isHalfHoliday } from '../utils';

export const VacationSummary: React.FC = () => {
  const { year, groupDates, vacationDays, vacationNotes, setVacationNotes, setVacationDays, getDatesInRange } = useVacation();
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editRange, setEditRange] = useState({ start: '', end: '' });

  const filtered = groupDates(vacationDays, 'vacation').filter(g => g[0].startsWith(year.toString()));
  if (filtered.length === 0) return null;

  const saveEdit = (oldGroup: string[]): void => {
    const range = getDatesInRange(parseDateLocal(editRange.start), parseDateLocal(editRange.end));
    setVacationDays(prev => Array.from(new Set([...prev.filter(d => !oldGroup.includes(d)), ...range])));
    if (oldGroup[0] !== editRange.start && vacationNotes[oldGroup[0]]) {
      const n = vacationNotes[oldGroup[0]];
      setVacationNotes(prev => { const next = {...prev}; delete next[oldGroup[0]]; next[editRange.start] = n; return next; });
    }
    setEditingIdx(null);
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
      <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-emerald-700">
          <Palmtree className="text-emerald-500" size={28} />
          Meine Urlaube {year}
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {filtered.map((group, idx) => {
          const start = group[0];
          const weight = group.reduce((acc, d) => acc + (isHalfHoliday(d) ? 0.5 : 1), 0);
          const isEditing = editingIdx === idx;
          return (
            <div key={idx} className={`group flex flex-col p-5 rounded-2xl border border-l-8 transition-all ${isEditing ? 'ring-2 ring-emerald-300 bg-white border-emerald-500' : 'bg-slate-50 border-slate-100 hover:bg-white border-l-emerald-500 hover:shadow-lg'}`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                      <div className="bg-emerald-100 text-emerald-700 w-12 h-12 flex items-center justify-center rounded-xl font-black text-lg">{weight}</div>
                      {isEditing ? (
                          <div className="flex items-center gap-2">
                              <input type="date" value={editRange.start} onChange={(e) => setEditRange({...editRange, start: e.target.value})} className="px-3 py-1.5 border rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"/>
                              <ArrowRight size={14} className="text-slate-400" />
                              <input type="date" value={editRange.end} onChange={(e) => setEditRange({...editRange, end: e.target.value})} className="px-3 py-1.5 border rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"/>
                          </div>
                      ) : (
                          <div className="font-bold text-slate-700 flex items-center gap-2">
                              {parseDateLocal(start).toLocaleDateString('de-DE')}
                              <ArrowRight size={14} className="text-slate-300" />
                              {parseDateLocal(group[group.length-1]).toLocaleDateString('de-DE')}
                          </div>
                      )}
                  </div>
                  <div className="flex items-center gap-1">
                      {isEditing ? (
                          <><button onClick={() => saveEdit(group)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Check size={20}/></button><button onClick={() => setEditingIdx(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><X size={20}/></button></>
                      ) : (
                          <><button onClick={() => { setEditingIdx(idx); setEditRange({ start: group[0], end: group[group.length-1] }) }} className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"><Edit2 size={20}/></button><button onClick={() => setVacationDays(vacationDays.filter(d => !group.includes(d)))} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={20}/></button></>
                      )}
                  </div>
              </div>
              <div className="mt-4 flex items-start gap-3 bg-white/50 p-3 rounded-xl border border-slate-200">
                <StickyNote size={18} className={`mt-1 ${vacationNotes[start] ? 'text-emerald-500' : 'text-slate-300'}`} />
                <textarea placeholder="Was hast du vor?" value={vacationNotes[start] || ""} onChange={(e) => setVacationNotes(prev => ({ ...prev, [start]: e.target.value }))} className="w-full bg-transparent border-none focus:ring-0 text-sm h-12 py-1 resize-none placeholder:text-slate-300 font-medium" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
