
import React, { useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceLine, ReferenceArea 
} from 'recharts';
import { HealthEntry, UserProfile, BzUnit, Language, TimeOfDay } from '../types';
import { parseGermanDate, formatLongDate, formatDateToGerman, getLocalizedWeekday } from '../utils/dateUtils';
import { mgToMmol, calculateHbA1c, isBzOutOfRange, isSysOutOfRange, isDiaOutOfRange } from '../utils/healthUtils';
import { uiTranslations } from '../translations';

interface HealthChartProps {
  entries: HealthEntry[];
  userProfile?: UserProfile;
  bzUnit: BzUnit;
  language: Language;
  isExporting?: boolean;
}

const TIMES_SEQUENCE: TimeOfDay[] = ['Morgens', 'Mittags', 'Abends', 'Nacht'];

const CustomXAxisTick = (props: any) => {
  const { x, y, payload, t } = props;
  if (!payload.value) return null;
  
  const [dateInfo, timeInfo] = payload.value.split('|');
  const [weekday, dateStr] = dateInfo.split('\n');
  
  const isFirstOfGroup = timeInfo === 'Morgens';
  const translatedTime = t.times[timeInfo] || timeInfo;
  const shortLabel = translatedTime.substring(0, 1).toUpperCase();

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={12} textAnchor="middle" fill="#1e3a8a" className="text-[8px] font-black">
        {shortLabel}
      </text>

      {isFirstOfGroup && (
        <>
          <line x1={0} y1={5} x2={60} y2={5} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="2 2" />
          <text x={30} y={28} textAnchor="middle" fill="#1e3a8a" className="text-[8px] font-black uppercase">
            <tspan x={30} dy="0">{weekday}</tspan>
            <tspan x={30} dy="1.2em" fill="#64748b" className="font-bold text-[7px]">{dateStr}</tspan>
          </text>
        </>
      )}
    </g>
  );
};

const HealthChart: React.FC<HealthChartProps> = ({ entries, userProfile, bzUnit, language, isExporting = false }) => {
  const t = uiTranslations[language] || uiTranslations.de;
  const stats = calculateHbA1c(entries);

  const chartData = useMemo(() => {
    const uniqueDates = (Array.from(new Set(entries.map(e => e.datum))) as string[]).sort((a, b) => 
      parseGermanDate(a).getTime() - parseGermanDate(b).getTime()
    );

    const fullData: any[] = [];

    uniqueDates.forEach((date: string) => {
      const dateObj = parseGermanDate(date);
      const weekdayShort = new Intl.DateTimeFormat(language, { weekday: 'short' }).format(dateObj);
      const datePart = date.substring(0, 5); 

      TIMES_SEQUENCE.forEach(time => {
        const entry = entries.find(e => e.datum === date && e.zeitpunkt === time);
        
        const bzVal = entry?.bz ? (bzUnit === 'mg/dl' ? parseInt(entry.bz, 10) : parseFloat(mgToMmol(entry.bz))) : null;
        const sysVal = entry?.rrSys ? parseInt(entry.rrSys, 10) : null;
        const diaVal = entry?.rrDia ? parseInt(entry.rrDia, 10) : null;
        const pulsVal = entry?.puls ? parseInt(entry.puls, 10) : null;

        fullData.push({
          name: `${weekdayShort}\n${datePart}|${time}`,
          timeSlot: time,
          datum: date,
          bzFull: bzVal, sysFull: sysVal, diaFull: diaVal, pulsFull: pulsVal,
          bzReal: entry && !entry.bzAuto ? bzVal : null,
          sysReal: entry && !entry.rrAuto ? sysVal : null,
          diaReal: entry && !entry.rrAuto ? diaVal : null,
          pulsReal: entry ? pulsVal : null,
        });
      });
    });

    return fullData;
  }, [entries, bzUnit, language]);

  const dayHighlightAreas = useMemo(() => {
    const areas: { x1: string; x2: string; isOdd: boolean }[] = [];
    if (chartData.length === 0) return areas;

    let lastDate = '';
    let startName = '';
    let currentDayCount = 0;

    chartData.forEach((item, idx) => {
      if (item.datum !== lastDate) {
        if (lastDate !== '') {
          areas.push({
            x1: startName,
            x2: chartData[idx - 1].name,
            isOdd: currentDayCount % 2 !== 0
          });
        }
        startName = item.name;
        lastDate = item.datum;
        currentDayCount++;
      }
      
      if (idx === chartData.length - 1) {
        areas.push({
          x1: startName,
          x2: item.name,
          isOdd: currentDayCount % 2 !== 0
        });
      }
    });

    return areas;
  }, [chartData]);

  // Gruppierung für die Export-Tabelle
  const exportTableRows = useMemo(() => {
    if (!isExporting) return [];
    const grouped: Record<string, Record<string, HealthEntry>> = {};
    entries.forEach(e => {
      if (!grouped[e.datum]) grouped[e.datum] = {};
      grouped[e.datum][e.zeitpunkt] = e;
    });
    return Object.keys(grouped).sort((a, b) => parseGermanDate(b).getTime() - parseGermanDate(a).getTime());
  }, [entries, isExporting]);

  if (entries.length < 1) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-gray-500">
        <i className="fa-solid fa-chart-line text-4xl mb-3 opacity-20"></i>
        <p className="text-xs font-black uppercase tracking-widest text-center">KEINE DATEN FÜR GRAFIK</p>
      </div>
    );
  }

  const ChartBox = ({ title, icon, metrics, normRange, unit }: any) => (
    <div className="mb-4 pb-2 bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
      <div className="flex items-center gap-3 mb-3 border-b-2 border-slate-100 pb-1.5">
        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-slate-100 shrink-0">
          <i className={`fas ${icon} text-[10px]`} style={{ color: metrics[0].color }}></i>
        </div>
        <div className="flex items-baseline gap-2">
          <h4 className="text-[11px] font-black text-slate-800 uppercase">
            {title}
          </h4>
          <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">[{unit}]</span>
        </div>
      </div>
      <div className={`h-[240px] ${isExporting ? 'w-[700px]' : 'w-full'}`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: -20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            
            {dayHighlightAreas.map((area, i) => (
              <ReferenceArea 
                key={i} 
                x1={area.x1} 
                x2={area.x2} 
                fill={area.isOdd ? "#f8faff" : "transparent"} 
                fillOpacity={1}
                stroke="none"
              />
            ))}

            <XAxis 
              dataKey="name" 
              interval={0} 
              height={60} 
              stroke="#cbd5e1" 
              tick={<CustomXAxisTick t={t} />}
            />
            <YAxis fontSize={9} tick={{fill: '#64748b', fontWeight: '800'}} domain={['auto', 'auto']} stroke="#cbd5e1" />
            
            <Tooltip 
              isAnimationActive={false} 
              labelFormatter={(value: any) => typeof value === 'string' ? value.split('|')[0].replace('\n', ' ') : value}
              contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '10px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} 
            />

            {normRange && <ReferenceArea y1={normRange.min} y2={normRange.max} fill="#f0fdf4" fillOpacity={0.6} stroke="none" />}
            {normRange && <ReferenceLine y={normRange.max} stroke="#fca5a5" strokeWidth={1} strokeDasharray="5 5" />}
            
            {metrics.map((m: any) => (
              <Line 
                key={`${m.fullKey}-bg`} 
                type="monotone" 
                dataKey={m.fullKey} 
                stroke="#fbbf24" 
                strokeWidth={1.5} 
                dot={false} 
                activeDot={false} 
                connectNulls={true}
                strokeOpacity={0.3}
                isAnimationActive={!isExporting} 
              />
            ))}
            
            {metrics.map((m: any) => (
              <Line 
                key={`${m.dataKey}-fg`} 
                type="monotone" 
                dataKey={m.dataKey} 
                stroke={m.color} 
                strokeWidth={2.5} 
                dot={{ r: 3.5, fill: m.color, stroke: '#fff', strokeWidth: 2 }} 
                activeDot={{ r: 6, strokeWidth: 0 }} 
                connectNulls={false}
                isAnimationActive={!isExporting} 
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div id="health-charts-container" className={`bg-white ${isExporting ? 'w-[794px] p-0' : 'w-full p-1'}`}>
      <div className={`mb-4 border-b-4 border-blue-900 pb-3 flex ${isExporting ? 'flex-row items-start' : 'flex-col sm:flex-row sm:items-start'} gap-3`}>
        <div className={`min-w-0 ${isExporting ? 'flex-1' : 'w-full sm:flex-1'}`}>
          <h2 className="text-blue-900 font-black text-xl tracking-tighter leading-none mb-1 uppercase italic">VITAL-ANALYSE</h2>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 items-center">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <i className="fa-solid fa-user-circle text-blue-900"></i> {userProfile?.name || 'Patient'}
            </p>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
              <i className="fa-solid fa-calendar-day text-slate-300"></i> {formatLongDate(userProfile?.birthday || '', language)}
            </p>
          </div>
          <p className="text-[7px] font-black text-blue-900/60 uppercase tracking-widest mt-1">
            Druckdatum: {formatLongDate(formatDateToGerman(new Date()), language)}
          </p>
        </div>
        
        <div className={`${isExporting ? 'flex-1 flex justify-center' : 'w-full sm:flex-1 flex justify-start sm:justify-center'}`}>
          {stats && (
            <div className="flex gap-2 shrink-0">
              <div className="bg-slate-50 border-2 border-slate-200 px-2 py-1 rounded-xl text-center">
                <p className="text-[6px] font-black text-slate-400 uppercase mb-0.5">Ø Glukose</p>
                <p className="text-xs font-black text-orange-600 leading-none">
                  {bzUnit === 'mg/dl' ? Math.round(stats.averageBz) : mgToMmol(stats.averageBz)}
                </p>
              </div>
              <div className="bg-blue-900 px-2 py-1 rounded-xl text-center shadow-lg shadow-blue-900/20">
                <p className="text-[6px] font-black text-blue-300 uppercase mb-0.5">eHbA1c</p>
                <p className="text-xs font-black text-white leading-none">
                  {stats.hba1c.toFixed(1)}%
                </p>
              </div>
            </div>
          )}
        </div>

        <div className={`${isExporting ? 'flex-1 flex justify-end' : 'w-full sm:flex-1 flex justify-start sm:justify-end'}`}>
          <div className="bg-blue-900 text-white px-2 py-0.5 rounded-full text-[9px] font-black italic">
            V3.0 PRO
          </div>
        </div>
      </div>

      <ChartBox title="Blutzuckerverlauf" icon="fa-droplet" metrics={[{ dataKey: 'bzReal', fullKey: 'bzFull', color: '#f97316' }]} normRange={bzUnit === 'mg/dl' ? { min: 70, max: 140 } : { min: 3.9, max: 7.8 }} unit={bzUnit} />
      <ChartBox title="Blutdruck (Systolisch / Diastolisch)" icon="fa-heartbeat" metrics={[{ dataKey: 'sysReal', fullKey: 'sysFull', color: '#1e3a8a' }, { dataKey: 'diaReal', fullKey: 'diaFull', color: '#3b82f6' }]} normRange={{ min: 60, max: 140 }} unit="mmHg" />
      <ChartBox title="Herzfrequenz (Puls)" icon="fa-bolt-lightning" metrics={[{ dataKey: 'pulsReal', fullKey: 'pulsFull', color: '#be123c' }]} normRange={{ min: 60, max: 100 }} unit="bpm" />
      
      {/* Wertetabelle für den Export (A4 "Blatt 2" oder Fortführung) */}
      {isExporting && (
        <div className="mt-12 pt-8 border-t-4 border-blue-900">
          <h3 className="text-blue-900 font-black text-xl mb-6 uppercase tracking-tight italic">Tabellarische Übersicht der Messwerte</h3>
          <table className="w-full border-collapse border-2 border-black text-[10px]">
            <thead>
              <tr className="bg-slate-100 font-black uppercase text-center border-b-2 border-black">
                <th className="border-r border-black p-2 w-32">Datum</th>
                {TIMES_SEQUENCE.map(time => (
                  <th key={time} className="border-r border-black p-2">{t.times[time]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {exportTableRows.map((date) => {
                const grouped = entries.filter(e => e.datum === date).reduce((acc, curr) => ({ ...acc, [curr.zeitpunkt]: curr }), {} as Record<string, HealthEntry>);
                return (
                  <tr key={date} className="border-b border-black/10">
                    <td className="border-r border-black p-2 font-black text-blue-900">
                      <div className="flex flex-col">
                        <span>{getLocalizedWeekday(date, language)}</span>
                        <span className="text-[8px] opacity-60">{date}</span>
                      </div>
                    </td>
                    {TIMES_SEQUENCE.map(time => {
                      const entry = grouped[time];
                      if (!entry) return <td key={time} className="border-r border-black p-2 text-center text-slate-300">-</td>;
                      
                      const displayBz = bzUnit === 'mg/dl' ? entry.bz : mgToMmol(entry.bz);
                      const bzErr = isBzOutOfRange(displayBz, bzUnit);
                      const rrErr = isSysOutOfRange(entry.rrSys) || isDiaOutOfRange(entry.rrDia);

                      return (
                        <td key={time} className="border-r border-black p-1 text-center bg-white">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center justify-center gap-1">
                              {entry.bzAuto && <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />}
                              <span className={`font-black text-[11px] ${bzErr ? 'text-red-600' : 'text-black'}`}>{displayBz}</span>
                            </div>
                            <div className="flex flex-col leading-tight border-t border-black/5 mt-0.5 pt-0.5">
                               <span className={`font-bold text-[9px] ${rrErr ? 'text-red-600' : 'text-slate-600'}`}>{entry.rrSys}/{entry.rrDia}</span>
                               <span className="text-[7px] text-slate-400">P:{entry.puls}</span>
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mt-4 flex gap-4 text-[8px] font-bold text-slate-400 uppercase italic">
            <span>● Gelber Punkt: Geschätzter Wert (keine Messung)</span>
            <span>● Rote Schrift: Wert außerhalb des Normbereichs</span>
          </div>
        </div>
      )}

      <div className="mt-8 pt-4 border-t-2 border-slate-100 flex justify-between items-center px-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-fbbf24 animate-pulse"></div>
          <p className="text-[8px] font-bold text-slate-400 italic">
            Trendlinie inkl. automatischer Schätzwerte. HbA1c ist eine statistische Schätzung.
          </p>
        </div>
        <p className="text-[8px] font-black text-blue-900/40 uppercase tracking-widest">
          ERSTELLT AM {formatLongDate(formatDateToGerman(new Date()), language)}
        </p>
      </div>
    </div>
  );
};

export default HealthChart;
