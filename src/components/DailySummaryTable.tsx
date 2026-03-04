
import React, { useState } from 'react';
import { HealthEntry, TimeOfDay, BzUnit, Language } from '../types';
import { parseGermanDate, getLocalizedWeekday } from '../utils/dateUtils';
import { isBzOutOfRange, isSysOutOfRange, isDiaOutOfRange, mgToMmol } from '../utils/healthUtils';
import { uiTranslations } from '../translations';

interface DailySummaryTableProps {
  entries: HealthEntry[];
  bzUnit: BzUnit;
  language: Language;
  onDeleteDay: (date: string) => void;
  onDeleteMultipleDays: (dates: string[]) => void;
  onDeleteEntry: (id: string) => void;
}

const DailySummaryTable: React.FC<DailySummaryTableProps> = ({ 
  entries, 
  bzUnit, 
  language, 
  onDeleteDay, 
  onDeleteMultipleDays,
  onDeleteEntry 
}) => {
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const groupedByDate: Record<string, Record<string, HealthEntry>> = {};
  const t = uiTranslations[language];
  
  entries.forEach(entry => {
    if (!groupedByDate[entry.datum]) groupedByDate[entry.datum] = {};
    groupedByDate[entry.datum][entry.zeitpunkt] = entry;
  });

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => 
    parseGermanDate(b).getTime() - parseGermanDate(a).getTime()
  );

  const times: TimeOfDay[] = ['Morgens', 'Mittags', 'Abends', 'Nacht'];

  const toggleSelectDate = (date: string) => {
    setSelectedDates(prev => 
      prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
    );
  };

  const handleBulkDelete = () => {
    if (selectedDates.length === 0) return;
    onDeleteMultipleDays(selectedDates);
    setSelectedDates([]);
  };

  const ValueCell: React.FC<{ entry?: HealthEntry; isSelected: boolean }> = ({ entry, isSelected }) => {
    if (!entry) return <td className={`px-0 py-1 text-center text-[8px] font-black border-l border-black/5 ${isSelected ? 'text-white/20' : 'text-gray-300'}`}>-</td>;

    const displayBz = bzUnit === 'mg/dl' ? entry.bz : mgToMmol(entry.bz);
    
    // Farben anpassen
    let bzColor = entry.bzAuto ? 'text-amber-500' : (isBzOutOfRange(displayBz, bzUnit) ? 'text-red-600 font-bold' : 'text-black');
    let rrColor = entry.rrAuto ? 'text-amber-500' : (isSysOutOfRange(entry.rrSys) || isDiaOutOfRange(entry.rrDia) ? 'text-red-600 font-bold' : 'text-black');
    
    if (isSelected) {
      bzColor = 'text-white';
      rrColor = 'text-white/90';
    }

    return (
      <td className={`px-0.5 py-1 border-l border-black/10 relative group min-w-[42px] sm:min-w-[55px] ${isSelected ? 'bg-transparent' : 'bg-white'}`}>
        <div className="flex flex-col gap-0 text-[10px] sm:text-[11px] leading-none text-center">
          <div className={`${bzColor} font-black truncate`}>
            {displayBz}
          </div>
          <div className={`${rrColor} text-[8px] sm:text-[9px] font-bold opacity-90 border-t border-black/5 mt-0.5 pt-0.5`}>
            {entry.rrSys}/{entry.rrDia}
          </div>
          <div className={`text-[7px] sm:text-[8px] mt-0.5 font-bold ${isSelected ? 'text-white/40' : 'text-gray-400'}`}>
            P:{entry.puls}
          </div>
        </div>
        <button 
          onClick={() => onDeleteEntry(entry.id)}
          className="absolute inset-0 bg-red-600/90 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity print:hidden"
        >
          <i className="fa-solid fa-trash-can text-[10px]"></i>
        </button>
      </td>
    );
  };

  if (sortedDates.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <i className="fa-solid fa-folder-open text-4xl mb-3 opacity-20"></i>
        <p className="text-xs font-black uppercase tracking-widest">{t.notifications.errorEmpty}</p>
      </div>
    );
  }

  return (
    <div className="daily-summary-container">
      {/* Transparentes Auswahlmenü - nur anzeigen wenn Auswahl existiert */}
      <div className={`flex items-center justify-between bg-white/40 backdrop-blur-md text-black px-3 py-2 rounded-xl border-2 border-black/20 transition-all duration-300 print:hidden shadow-lg mb-2 ${selectedDates.length > 0 ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible pointer-events-none hidden'}`}>
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-sm">
            <i className="fa-solid fa-check-double text-[10px]"></i>
          </div>
          <span className="text-[10px] font-black uppercase tracking-tight">{selectedDates.length} Tage markiert</span>
        </div>
        <button 
          onClick={handleBulkDelete}
          className="bg-red-600 text-white px-4 py-1.5 rounded-lg font-black text-[9px] uppercase border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all"
        >
          Auswahl löschen
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border-2 border-black bg-white shadow-md max-w-full">
        <table className="w-full text-left border-collapse table-fixed min-w-0">
          <thead>
            <tr className="bg-blue-800 text-white text-[7px] font-black uppercase tracking-tight border-b border-white/10">
              <th className="px-1 py-0.5 border-r border-white/10 w-[70px] sm:w-32"></th>
              <th colSpan={4} className="px-1 py-0.5 text-center">Verlauf</th>
              <th className="px-1 py-0.5 print:hidden w-6 sm:w-8"></th>
            </tr>
            <tr className="bg-blue-900 text-white text-[8px] sm:text-[10px] font-black uppercase tracking-tighter">
              <th className="px-1 py-2 w-[70px] sm:w-32 border-r border-white/10 flex items-center gap-1">
                <span className="print:hidden">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 accent-blue-600 cursor-pointer border-2 border-white rounded shadow-sm"
                    checked={selectedDates.length === sortedDates.length && sortedDates.length > 0}
                    onChange={() => {
                      if (selectedDates.length === sortedDates.length) setSelectedDates([]);
                      else setSelectedDates(sortedDates);
                    }}
                  />
                </span>
                Datum
              </th>
              {times.map(time => (
                <th key={time} className="px-0.5 py-2 text-center border-l border-white/10">
                  {t.times[time]}
                </th>
              ))}
              <th className="px-1 py-2 w-6 sm:w-8 border-l border-white/10 print:hidden"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10">
            {sortedDates.map((date, idx) => {
              const fullWeekday = getLocalizedWeekday(date, language);
              const shortWeekday = fullWeekday.substring(0, 2);
              const isSelected = selectedDates.includes(date);
              
              return (
                <tr key={date} className={`${isSelected ? 'bg-slate-800 text-white' : (idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50')} transition-colors`}>
                  <td className={`px-1 sm:px-2 py-1.5 font-black text-[9px] sm:text-[10px] whitespace-nowrap flex items-center gap-1 overflow-hidden ${isSelected ? 'bg-transparent text-white' : 'bg-white text-blue-900'}`}>
                    <span className="print:hidden shrink-0">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 accent-blue-600 cursor-pointer border-2 border-black rounded"
                        checked={isSelected}
                        onChange={() => toggleSelectDate(date)}
                      />
                    </span>
                    <div className="flex flex-col items-start gap-0 truncate">
                      <span className={`text-[10px] sm:text-[11px] font-black uppercase leading-tight tracking-tighter truncate w-full ${isSelected ? 'text-white' : 'text-black'}`}>
                        <span className="sm:hidden">{shortWeekday}</span>
                        <span className="hidden sm:inline">{fullWeekday}</span>
                      </span>
                      <span className={`text-[8px] sm:text-[9px] leading-none ${isSelected ? 'text-white/40' : 'text-blue-900/40'}`}>{date.substring(0, 5)}</span>
                    </div>
                  </td>
                  {times.map(time => (
                    <ValueCell key={time} entry={groupedByDate[date][time]} isSelected={isSelected} />
                  ))}
                  <td className={`px-0.5 py-1 text-center print:hidden border-l border-black/10 ${isSelected ? 'bg-transparent' : 'bg-white'}`}>
                    <button 
                      onClick={() => onDeleteDay(date)}
                      className={`${isSelected ? 'text-white/20 hover:text-red-400' : 'text-gray-300 hover:text-red-600'} p-0.5 transition-colors`}
                      title="Löschen"
                    >
                      <i className="fa-solid fa-trash-can text-[10px] sm:text-xs"></i>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="bg-gray-100 px-2 py-1 flex justify-between items-center border-t border-black/10">
          <div className="flex gap-2 sm:gap-4 text-[7px] font-black uppercase tracking-tighter text-gray-500">
            <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> Schätzung</span>
            <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 bg-red-700 rounded-full"></span> Grenzwert</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailySummaryTable;
