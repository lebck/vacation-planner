import React from 'react';
import {
  Lock,
  ArrowRight,
  X,
  MessageSquare
} from 'lucide-react';
import { useVacation } from '../VacationContext';
import { parseDateLocal } from '../utils';

export const BlockedSummary: React.FC = () => {
  const { year, groupDates, blockedDays, blockedNotes, setBlockedNotes, setBlockedDays } = useVacation();
  const filtered = groupDates(blockedDays, 'blocked').filter(g => g[0].startsWith(year.toString()));

  if (filtered.length === 0) return null;

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-slate-700">
            <Lock className="text-slate-400" size={28} />
            Blockierte Termine {year}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((group, idx) => (
                <div key={idx} className="flex flex-col p-4 bg-slate-50 border border-slate-200 rounded-2xl gap-3 hover:bg-white transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-600 text-sm flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                            {parseDateLocal(group[0]).toLocaleDateString('de-DE')}
                            {group.length > 1 && <> <ArrowRight size={12} className="text-slate-300" /> {parseDateLocal(group[group.length-1]).toLocaleDateString('de-DE')}</>}
                        </span>
                        <button onClick={() => setBlockedDays(blockedDays.filter(d => !group.includes(d)))} className="text-slate-300 hover:text-rose-500 transition-colors"><X size={18} /></button>
                    </div>
                    <div className="flex items-start gap-2 bg-white/50 p-2 rounded-xl border border-slate-100">
                        <MessageSquare size={14} className={`mt-1.5 ${blockedNotes[group[0]] ? 'text-slate-500' : 'text-slate-300'}`} />
                        <textarea placeholder="Grund..." value={blockedNotes[group[0]] || ""} onChange={(e) => setBlockedNotes(prev => ({ ...prev, [group[0]]: e.target.value }))} className="w-full bg-transparent border-none focus:ring-0 text-xs h-8 py-1 resize-none" />
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};
