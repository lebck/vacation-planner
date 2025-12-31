import React from 'react';
import { Info } from 'lucide-react';
import { VacationProvider } from './VacationContext';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { MonthCalendar } from './components/MonthCalendar';
import { VacationSummary } from './components/VacationSummary';
import { BlockedSummary } from './components/BlockedSummary';

const App: React.FC = () => {
  return (
    <VacationProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8 select-none">
        <div className="max-w-6xl mx-auto space-y-6">
          
          <Header />
          <StatsCards />

          <div className="flex items-center bg-white p-4 rounded-2xl border border-slate-200 text-slate-500 text-sm gap-3 shadow-sm">
              <Info size={18} className="text-indigo-500 shrink-0" />
              <p><b>Linksklick:</b> Urlaub planen. <b>Rechtsklick:</b> Termin blockieren. Daten werden automatisch im Browser gespeichert.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 12 }, (_, i) => <MonthCalendar key={i} month={i} />)}
          </div>

          <div className="space-y-6">
              <VacationSummary />
              <BlockedSummary />
          </div>
        </div>
      </div>
    </VacationProvider>
  );
}

export default App;