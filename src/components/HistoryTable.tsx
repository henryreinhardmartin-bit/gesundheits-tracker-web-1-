
import React, { useState, useMemo } from 'react';
import { HealthEntry, BzUnit, Language } from '../types';
import { parseGermanDate, getLocalizedWeekday } from '../utils/dateUtils';
import { isBzOutOfRange, isSysOutOfRange, isDiaOutOfRange, isPulsOutOfRange, mgToMmol } from '../utils/healthUtils';
import { uiTranslations } from '../translations';

interface HistoryTableProps {
  entries: HealthEntry[];
  bzUnit: BzUnit;
  language: Language;
  onDelete: (id: string) => void;
  onDeleteMultiple: (ids: string[]) => void;
}

const HistoryTable: React.FC<HistoryTableProps> = ({ entries, bzUnit, language, onDelete, onDeleteMultiple }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const t = uiTranslations[language];

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      const dateA = parseGermanDate(a.datum).getTime();
      const dateB = parseGermanDate(b.datum).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return b.createdAt - a.createdAt;
    });
  }, [entries]);

  const toggleSelectAll = () => {
    if (selectedIds.length === sortedEntries.length && sortedEntries.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedEntries.map(e => e.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    onDeleteMultiple(selectedIds);
    setSelectedIds([]);
  };

  return (
    <div>
      {/* Auswahlmenü - nur anzeigen wenn nötig */}
      <div className={`flex items-center justify-between bg-white/40 backdrop-blur-md text-black px-3 py-2 rounded-xl border-2 border-black/20 transition-all duration-300 shadow-lg mb-2 ${selectedIds.length > 0 ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible pointer-events-none hidden'}`}>
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-sm">
            <i className="fa-solid fa-check-double text-[10px]"></i>
          </div>
          <span className="text-[10px] font-black uppercase tracking-tight">{selectedIds.length} markiert</span>
        </div>
        <button 
          onClick={handleBulkDelete}
          className="bg-red-600 text-white px-4 py-1.5 rounded-lg font-black text-[9px] uppercase border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all"
        >
          Auswahl löschen
        </button>
      </div>

      <div className="overflow-x-auto rounded border border-black bg-white shadow-md">
        <table className="w-full text-left border-collapse min-w-0">
          <thead className="bg-gray-200 border-b border-black">
            <tr>
              <th className="w-8 px-1 py-1.5 text-center border-r border-black/10">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 accent-blue-600 cursor-pointer border-2 border-black rounded"
                  checked={selectedIds.length === sortedEntries.length && sortedEntries.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-1 py-1.5 text-[8px] sm:text-[9px] font-black text-black uppercase tracking-tighter">Datum</th>
              <th className="px-1 py-1.5 text-[8px] sm:text-[9px] font-black text-black uppercase tracking-tighter">Zeit</th>
              <th className="px-1 py-1.5 text-[8px] sm:text-[9px] font-black text-black uppercase tracking-tighter text-center">BZ</th>
              <th className="px-1 py-1.5 text-[8px] sm:text-[9px] font-black text-black uppercase tracking-tighter text-center">RR</th>
              <th className="px-1 py-1.5 text-[8px] sm:text-[9px] font-black text-black uppercase tracking-tighter text-center">Puls</th>
              <th className="w-8 px-1 py-1.5 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-[9px] sm:text-[10px]">
            {sortedEntries.map((entry) => {
              const isSelected = selectedIds.includes(entry.id);
              const displayBz = bzUnit === 'mg/dl' ? entry.bz : mgToMmol(entry.bz);
              
              let bzColor = entry.bzAuto ? 'text-amber-500' : (isBzOutOfRange(displayBz, bzUnit) ? 'text-red-700 bg-red-50' : 'text-black');
              let rrColor = entry.rrAuto ? 'text-amber-500' : (isSysOutOfRange(entry.rrSys) || isDiaOutOfRange(entry.rrDia) ? 'text-red-700 bg-red-50' : 'text-black');
              // Fixed: Removed extra closing parenthesis that was breaking the block scope
              let pulsColor = isPulsOutOfRange(entry.puls) ? 'text-red-700 bg-red-50' : 'text-black';

              if (isSelected) {
                bzColor = 'text-white';
                rrColor = 'text-white';
                pulsColor = 'text-white';
              }

              const timeDisplay = t.times[entry.zeitpunkt] || entry.zeitpunkt;
              const weekday = getLocalizedWeekday(entry.datum, language).substring(0, 2) + ".";

              return (
                <tr key={entry.id} className={`transition-all ${isSelected ? 'bg-slate-800 text-white' : 'hover:bg-gray-50'}`}>
                  <td className="px-1 py-1 text-center border-r border-gray-100/10">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 accent-blue-600 cursor-pointer"
                      checked={isSelected}
                      onChange={() => toggleSelectOne(entry.id)}
                    />
                  </td>
                  <td className="px-1 py-1 font-bold whitespace-nowrap uppercase text-[8px] flex flex-col">
                    <span className={`text-[9px] sm:text-[10px] font-black leading-none ${isSelected ? 'text-white' : 'text-black/60'}`}>{weekday}</span> 
                    <span className={`text-[7px] sm:text-[8px] ${isSelected ? 'text-white/40' : 'text-blue-900/60'}`}>{entry.datum.substring(0, 5)}</span>
                  </td>
                  <td className={`px-1 py-1 font-black uppercase text-[8px] truncate max-w-[40px] ${isSelected ? 'text-white' : 'text-black'}`}>
                    {timeDisplay}
                  </td>
                  <td className={`px-1 py-1 font-black text-center ${bzColor}`}>{displayBz || '-'}</td>
                  <td className={`px-1 py-1 font-black text-center whitespace-nowrap ${rrColor}`}>{entry.rrSys || '-'}/{entry.rrDia || '-'}</td>
                  <td className={`px-1 py-1 font-black text-center ${pulsColor}`}>{entry.puls || '-'}</td>
                  <td className="px-1 py-1 text-right">
                    <button onClick={() => onDelete(entry.id)} className={`${isSelected ? 'text-white/60 hover:text-red-400' : 'text-gray-300 hover:text-red-600'} transition-all p-1`}><i className="fa-solid fa-trash-can text-xs sm:text-sm"></i></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryTable;
