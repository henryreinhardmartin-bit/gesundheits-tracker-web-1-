
import React from 'react';
import { TimeOfDay, BzUnit } from '../types';
import { isBzOutOfRange, isSysOutOfRange, isDiaOutOfRange, isPulsOutOfRange } from '../utils/healthUtils';

interface InputGroupProps {
  children: React.ReactNode;
  unit: string;
  isAlert: boolean;
  bgColor?: string;
}

const InputGroup: React.FC<InputGroupProps> = ({ children, unit, isAlert, bgColor = 'bg-white' }) => (
  <div className={`flex items-stretch border border-black rounded-md overflow-hidden shadow-sm transition-colors min-h-[28px] ${
    isAlert ? 'border-red-600 bg-red-50' : `${bgColor} focus-within:border-blue-700`
  }`}>
    {children}
    <div className={`px-1 flex items-center justify-center border-l transition-colors min-w-[24px] shrink-0 ${
      isAlert ? 'bg-red-200 border-red-600' : 'bg-black/5 border-black'
    }`}>
      <span className={`text-[7px] font-black uppercase tracking-tighter leading-none ${
        isAlert ? 'text-red-900' : 'text-black'
      }`}>{unit}</span>
    </div>
  </div>
);

interface TimeSlotCardProps {
  label: TimeOfDay;
  translatedLabel?: string;
  values: { bz: string; rrSys: string; rrDia: string; puls: string };
  bzUnit: BzUnit;
  onChange: (field: 'bz' | 'rrSys' | 'rrDia' | 'puls', value: string) => void;
}

const TimeSlotCard: React.FC<TimeSlotCardProps> = ({ label, translatedLabel, values, bzUnit, onChange }) => {
  const iconMap: Record<TimeOfDay, string> = {
    Morgens: 'fa-sun text-yellow-500',
    Mittags: 'fa-cloud-sun text-orange-400',
    Abends: 'fa-moon text-indigo-400',
    Nacht: '', 
  };

  const isNight = label === 'Nacht';
  const displayLabel = translatedLabel || label;

  return (
    <div className={`p-1.5 rounded-lg border-2 border-black shadow-sm h-full transition-colors ${isNight ? 'bg-slate-50' : 'bg-white hover:border-blue-900'}`}>
      <div className="flex items-center justify-between mb-1 border-b border-black/20 pb-0.5">
        <div className="flex items-center gap-1 overflow-hidden">
          {!isNight && iconMap[label] && (
            <div className="w-4 flex justify-center">
              <i className={`fas ${iconMap[label]} text-[10px]`}></i>
            </div>
          )}
          <h3 className="font-black text-black uppercase text-[10px] tracking-tight truncate flex items-center gap-1">
            {isNight && (
              <i className="fa-solid fa-star text-yellow-500 text-[9px] drop-shadow-[0_0_2px_rgba(234,179,8,0.5)]"></i>
            )}
            {displayLabel}
          </h3>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-1">
        <div className="flex gap-1">
          <InputGroup unit="S" isAlert={isSysOutOfRange(values.rrSys)} bgColor="bg-blue-100">
            <input
              id={`input-${label}-rrSys`}
              type="text" inputMode="numeric" placeholder="Sys"
              className="w-full px-1 py-0 outline-none text-[11px] font-black font-mono bg-transparent text-black placeholder-black/20 text-center"
              value={values.rrSys} onChange={(e) => onChange('rrSys', e.target.value)}
            />
          </InputGroup>
          <InputGroup unit="D" isAlert={isDiaOutOfRange(values.rrDia)} bgColor="bg-cyan-100">
            <input
              id={`input-${label}-rrDia`}
              type="text" inputMode="numeric" placeholder="Dia"
              className="w-full px-1 py-0 outline-none text-[11px] font-black font-mono bg-transparent text-black placeholder-black/20 text-center"
              value={values.rrDia} onChange={(e) => onChange('rrDia', e.target.value)}
            />
          </InputGroup>
        </div>
        <div className="flex gap-1">
          <InputGroup unit="P" isAlert={isPulsOutOfRange(values.puls)} bgColor="bg-rose-100">
            <input
              id={`input-${label}-puls`}
              type="text" inputMode="numeric" placeholder="Puls"
              className="w-full px-1 py-0 outline-none text-[11px] font-black font-mono bg-transparent text-black placeholder-black/20 text-center"
              value={values.puls} onChange={(e) => onChange('puls', e.target.value)}
            />
          </InputGroup>
          <InputGroup unit={bzUnit === 'mg/dl' ? 'MG' : 'ML'} isAlert={isBzOutOfRange(values.bz, bzUnit)} bgColor="bg-amber-100">
            <input
              id={`input-${label}-bz`}
              type="text" 
              inputMode={bzUnit === 'mg/dl' ? 'numeric' : 'decimal'} 
              placeholder={bzUnit === 'mg/dl' ? 'BZ' : '0.0'}
              className="w-full px-1 py-0 outline-none text-[11px] font-black font-mono bg-transparent text-black placeholder-black/20 text-center"
              value={values.bz} onChange={(e) => onChange('bz', e.target.value)}
            />
          </InputGroup>
        </div>
      </div>
    </div>
  );
};

export default TimeSlotCard;
