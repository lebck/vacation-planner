import React, { useMemo } from 'react';
import {
  Calendar,
  Settings2,
  CheckCircle2,
} from 'lucide-react';
import { useVacation } from '../VacationContext';
import { isHalfHoliday } from '../utils';

export const StatsCards: React.FC = () => {
  const { totalEntitlement, setTotalEntitlement, vacationDays, year } = useVacation();
  
  const usedDaysCount = useMemo(() => vacationDays.filter(d => d.startsWith(year.toString())).reduce((acc, dStr) => acc + (isHalfHoliday(dStr) ? 0.5 : 1), 0), [vacationDays, year]);
  const remainingDays = totalEntitlement - usedDaysCount;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Anspruch</p>
          <div className="flex items-center gap-2">
            <input type="number" value={totalEntitlement} onChange={(e) => setTotalEntitlement(parseInt(e.target.value) || 0)} className="text-3xl font-black w-16 bg-transparent border-none p-0 focus:ring-0"/>
            <span className="text-slate-400 font-bold">Tage</span>
          </div>
        </div>
        <Settings2 className="text-slate-200 w-10 h-10" />
      </div>
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verbraucht</p>
          <p className="text-3xl font-black text-emerald-500">{usedDaysCount} <span className="text-slate-300 text-lg">Tage</span></p>
        </div>
        <CheckCircle2 className="text-emerald-100 w-12 h-12" />
      </div>
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Resturlaub</p>
          <p className={`text-3xl font-black ${remainingDays < 0 ? 'text-rose-500' : 'text-blue-500'}`}>{remainingDays} <span className="text-slate-300 text-lg">Tage</span></p>
        </div>
        <Calendar className="text-blue-100 w-12 h-12" />
      </div>
    </div>
  );
};
