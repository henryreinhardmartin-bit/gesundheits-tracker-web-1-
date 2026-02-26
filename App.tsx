
import React, { useState, useEffect, useCallback, useRef } from 'react';
import TimeSlotCard from './components/TimeSlotCard';
import HistoryTable from './components/HistoryTable';
import DailySummaryTable from './components/DailySummaryTable';
import HealthChart from './components/HealthChart';
import UserManual from './components/UserManual';
import { HealthEntry, DailyInputs, TimeOfDay, UserProfile, BzUnit, Language } from './types';
import { formatDateToGerman, isValidGermanDate, parseGermanDate } from './utils/dateUtils';
import { mmolToMg } from './utils/healthUtils';
import { uiTranslations } from './translations';
import * as htmlToImage from 'html-to-image';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

const TIMES: TimeOfDay[] = ['Morgens', 'Mittags', 'Abends', 'Nacht'];
const FIELDS = ['rrSys', 'rrDia', 'puls', 'bz'] as const;
const INPUT_SEQUENCE = TIMES.flatMap(t => FIELDS.map(f => `input-${t}-${f}`));

const HeaderInput: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  isMono?: boolean;
}> = ({ label, value, onChange, placeholder, className = '', isMono = false }) => (
  <div className={`flex items-stretch border border-black rounded overflow-hidden bg-white min-h-[28px] ${className}`}>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-2 py-0 outline-none text-black text-[11px] sm:text-xs font-black bg-transparent placeholder:font-normal placeholder:opacity-30 ${isMono ? 'font-mono' : ''}`}
    />
    <div className="bg-gray-200 border-l border-black px-1 flex items-center justify-center min-w-[24px] shrink-0">
      <span className="text-[7px] sm:text-[9px] font-black text-black uppercase leading-none tracking-tighter">{label}</span>
    </div>
  </div>
);

const ConfirmModal: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm w-full overflow-hidden text-black">
        <div className="bg-red-600 text-white p-3 border-b-4 border-black font-black uppercase text-sm italic tracking-tighter">
          <i className="fa-solid fa-triangle-exclamation mr-2"></i> {title}
        </div>
        <div className="p-4">
          <p className="font-bold text-gray-800 text-sm leading-relaxed">{message}</p>
        </div>
        <div className="p-4 bg-gray-50 flex gap-2 border-t-2 border-black">
          <button onClick={onCancel} className="flex-1 bg-white border-2 border-black py-2 rounded font-black text-xs uppercase hover:bg-gray-100 active:translate-y-0.5">Abbrechen</button>
          <button onClick={onConfirm} className="flex-1 bg-red-600 text-white border-2 border-black py-2 rounded font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-700 active:translate-y-0.5 active:shadow-none">Löschen</button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [datum, setDatum] = useState<string>(formatDateToGerman(new Date()));
  const [entries, setEntries] = useState<HealthEntry[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'daily' | 'chart'>('daily');
  const [preExportViewMode, setPreExportViewMode] = useState<'list' | 'daily' | 'chart' | null>(null);
  const [exportStep, setExportStep] = useState<'idle' | 'switching' | 'capturing'>('idle');
  const [bzUnit, setBzUnit] = useState<BzUnit>('mg/dl');
  const [language, setLanguage] = useState<Language>('de');
  const [userProfile, setUserProfile] = useState<UserProfile>({ name: '', birthday: '' });
  const [inputs, setInputs] = useState<DailyInputs>(
    TIMES.reduce((acc, time) => ({ ...acc, [time]: { bz: '', rrSys: '', rrDia: '', puls: '' } }), {})
  );
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportType, setExportType] = useState<'png' | 'pdf'>('png');
  const [isSharing, setIsSharing] = useState(false);
  
  const [confirmData, setConfirmData] = useState<{ isOpen: boolean; title: string; message: string; action: () => void } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isLoadedRef = useRef(false);
  const isExportingRef = useRef(false);
  const t = uiTranslations[language] || uiTranslations.de;

  const sortEntries = useCallback((data: HealthEntry[]) => {
    return [...data].sort((a, b) => {
      const timeA = parseGermanDate(a.datum).getTime();
      const timeB = parseGermanDate(b.datum).getTime();
      if (isNaN(timeA) || isNaN(timeB)) return isNaN(timeA) ? 1 : -1;
      if (timeA !== timeB) return timeA - timeB;
      const timeOrder = { 'Morgens': 1, 'Mittags': 2, 'Abends': 3, 'Nacht': 4 };
      return (timeOrder[a.zeitpunkt] || 0) - (timeOrder[b.zeitpunkt] || 0);
    });
  }, []);

  const requestDelete = (title: string, message: string, action: () => void) => {
    setConfirmData({ isOpen: true, title, message, action });
  };

  const handleDeleteAll = () => {
    const hasData = entries.length > 0 || userProfile.name !== '' || userProfile.birthday !== '';
    if (!hasData) return;

    requestDelete(
      t.actions.deleteAll, 
      "ACHTUNG: Hiermit werden ALLE gespeicherten Messwerte sowie Ihr Name und Geburtsdatum unwiderruflich von diesem Gerät gelöscht!", 
      () => {
        setEntries([]);
        setUserProfile({ name: '', birthday: '' });
        showNotification('success', 'Alle Daten wurden zurückgesetzt.');
      }
    );
  };

  useEffect(() => {
    const processExport = async () => {
      if (exportStep === 'switching' && viewMode === 'chart') {
        setExportStep('capturing');
      } 
      else if (exportStep === 'capturing' && viewMode === 'chart') {
        if (isExportingRef.current) return;
        isExportingRef.current = true;
        const node = document.getElementById('health-charts-container');
        if (!node) {
          showNotification('error', 'Fehler: Grafik-Modul nicht bereit.');
          setExportStep('idle');
          isExportingRef.current = false;
          return;
        }
        await new Promise(r => setTimeout(r, 1200));
        try {
          console.log("Starting PNG capture...");
          
          // Safety timeout for htmlToImage
          const capturePromise = htmlToImage.toPng(node, {
            backgroundColor: '#ffffff',
            pixelRatio: 1.5, 
            style: { 
              width: '794px', 
              minHeight: '1123px', 
              margin: '0', 
              padding: '40px', 
              display: 'block', 
              backgroundColor: '#ffffff',
              boxSizing: 'border-box'
            },
            cacheBust: true,
            skipFonts: true,
          });

          const timeoutPromise = new Promise<string>((_, reject) => 
            setTimeout(() => reject(new Error("Timeout during capture")), 15000)
          );

          const dataUrl = await Promise.race([capturePromise, timeoutPromise]);
          console.log("PNG capture successful");
          
          if (exportType === 'pdf') {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(dataUrl);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
            
            const filename = `VitalReport_${userProfile.name || 'Patient'}_${datum}.pdf`;
            
            if (isSharing && navigator.share) {
              const pdfBlob = pdf.output('blob');
              const file = new File([pdfBlob], filename, { type: 'application/pdf' });
              if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                  await navigator.share({
                    files: [file],
                    title: 'Vital-Analyse',
                    text: `Vital-Analyse von ${userProfile.name || 'Patient'}`
                  });
                  showNotification('success', 'PDF erfolgreich geteilt.');
                } catch (shareErr) {
                  if ((shareErr as Error).name !== 'AbortError') {
                    pdf.save(filename);
                    showNotification('error', 'Teilen fehlgeschlagen, Datei wurde gespeichert.');
                  }
                }
              } else {
                pdf.save(filename);
                showNotification('error', 'Teilen nicht unterstützt, Datei wurde gespeichert.');
              }
            } else {
              pdf.save(filename);
              showNotification('success', 'PDF erfolgreich gespeichert.');
            }
          } else {
            const filename = `VitalReport_${userProfile.name || 'Patient'}_${datum}.png`;
            
            if (isSharing && navigator.share) {
              const blob = await (await fetch(dataUrl)).blob();
              const file = new File([blob], filename, { type: 'image/png' });
              if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                  await navigator.share({
                    files: [file],
                    title: 'Vital-Analyse',
                    text: `Vital-Analyse von ${userProfile.name || 'Patient'}`
                  });
                  showNotification('success', 'Grafik erfolgreich geteilt.');
                } catch (shareErr) {
                  if ((shareErr as Error).name !== 'AbortError') {
                    const link = document.createElement('a');
                    link.download = filename;
                    link.href = dataUrl;
                    link.click();
                    showNotification('error', 'Teilen fehlgeschlagen, Datei wurde gespeichert.');
                  }
                }
              } else {
                const link = document.createElement('a');
                link.download = filename;
                link.href = dataUrl;
                link.click();
                showNotification('error', 'Teilen nicht unterstützt, Datei wurde gespeichert.');
              }
            } else {
              const link = document.createElement('a');
              link.download = filename;
              link.href = dataUrl;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              showNotification('success', 'Grafik erfolgreich gespeichert.');
            }
          }
        } catch (err) {
          console.error("Export Error:", err);
          showNotification('error', 'Export fehlgeschlagen.');
        } finally {
          const backMode = preExportViewMode || 'daily';
          setExportStep('idle');
          setPreExportViewMode(null);
          isExportingRef.current = false;
          setTimeout(() => setViewMode(backMode), 100);
        }
      }
    };
    processExport();
  }, [exportStep, viewMode, userProfile.name, datum, preExportViewMode, exportType, isSharing]);

  const triggerExport = (type: 'png' | 'pdf' = 'png', share: boolean = false) => {
    if (exportStep !== 'idle') return;
    setExportType(type);
    setIsSharing(share);
    setShowExportMenu(false);
    if (viewMode !== 'chart') {
      setPreExportViewMode(viewMode);
      setExportStep('switching');
      setViewMode('chart');
    } else {
      setExportStep('capturing');
    }
  };

  const handleExportODS = () => {
    if (entries.length === 0) {
      showNotification('error', t.notifications.errorEmpty);
      return;
    }
    setShowExportMenu(false);

    try {
      const exportDate = formatDateToGerman(new Date());
      const worksheetData = entries.map(e => ({
        Datum: e.datum,
        Zeitpunkt: t.times[e.zeitpunkt] || e.zeitpunkt,
        'Blutzucker (mg/dl)': e.bz,
        'Blutdruck Sys': e.rrSys,
        'Blutdruck Dia': e.rrDia,
        Puls: e.puls,
        Status: (e.bzAuto || e.rrAuto) ? 'Schätzung' : 'Manuell',
        'Exportiert am': exportDate
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Vitalwerte");
      
      XLSX.writeFile(workbook, `VitalReport_${userProfile.name || 'Patient'}_${datum}.ods`);
      showNotification('success', 'ODF-Datei erfolgreich erstellt.');
    } catch (err) {
      console.error("ODS Export Error:", err);
      showNotification('error', 'ODF-Export fehlgeschlagen.');
    }
  };

  useEffect(() => {
    const savedEntries = localStorage.getItem('gesundheits_tracker_entries');
    if (savedEntries) {
      try {
        const parsed = JSON.parse(savedEntries);
        if (Array.isArray(parsed)) setEntries(sortEntries(parsed));
      } catch (e) { console.error("Load entries error", e); }
    }
    const savedProfile = localStorage.getItem('gesundheits_tracker_profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setUserProfile({ name: parsed.name || '', birthday: parsed.birthday || '' });
        if (parsed.preferredBzUnit) setBzUnit(parsed.preferredBzUnit);
      } catch (e) { console.error("Load profile error", e); }
    }
    const savedLang = localStorage.getItem('gesundheits_tracker_lang');
    if (savedLang) setLanguage(savedLang as Language);
    setTimeout(() => { isLoadedRef.current = true; }, 100);
  }, [sortEntries]);

  useEffect(() => {
    if (!isLoadedRef.current) return;
    localStorage.setItem('gesundheits_tracker_entries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    if (!isLoadedRef.current) return;
    localStorage.setItem('gesundheits_tracker_profile', JSON.stringify({ ...userProfile, preferredBzUnit: bzUnit }));
  }, [userProfile, bzUnit]);

  useEffect(() => {
    if (!isLoadedRef.current) return;
    localStorage.setItem('gesundheits_tracker_lang', language);
  }, [language]);

  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const handleInputChange = (time: TimeOfDay, field: 'bz' | 'rrSys' | 'rrDia' | 'puls', value: string) => {
    const nextInputs = { ...inputs, [time]: { ...inputs[time], [field]: value } };
    setInputs(nextInputs);
    const currentId = `input-${time}-${field}`;
    const currentIndex = INPUT_SEQUENCE.indexOf(currentId);
    if (value.length >= 3 && currentIndex < INPUT_SEQUENCE.length - 1) {
      const nextId = INPUT_SEQUENCE[currentIndex + 1];
      document.getElementById(nextId)?.focus();
    }
  };

  const handleSave = useCallback(() => {
    if (!isValidGermanDate(datum)) {
      showNotification('error', t.notifications.errorDate);
      return;
    }
    const hasAnyInput = TIMES.some(t => 
      inputs[t].bz.trim() || inputs[t].rrSys.trim() || inputs[t].rrDia.trim() || inputs[t].puls.trim()
    );
    if (!hasAnyInput) {
      showNotification('error', t.notifications.errorEmpty);
      return;
    }

    setEntries(prev => {
      const newEntries = [...prev];
      const timestamp = Date.now();
      TIMES.forEach(time => {
        const data = inputs[time];
        const trimmedBz = data.bz.trim();
        const trimmedSys = data.rrSys.trim();
        const trimmedDia = data.rrDia.trim();
        const trimmedPuls = data.puls.trim();

        // Zeitblock nur speichern, wenn mindestens ein Feld ausgefüllt wurde
        if (!trimmedBz && !trimmedSys && !trimmedDia && !trimmedPuls) return;

        let finalBz = trimmedBz;
        if (bzUnit === 'mmol/l' && finalBz) finalBz = mmolToMg(finalBz);

        const existingIndex = newEntries.findIndex(e => e.datum === datum && e.zeitpunkt === time);
        
        // Standwerte definieren (Defaults)
        const defBz = "100";
        const defSys = "120";
        const defDia = "80";
        const defPuls = "72";

        if (existingIndex > -1) {
          newEntries[existingIndex] = { 
            ...newEntries[existingIndex], 
            bz: finalBz || newEntries[existingIndex].bz || defBz,
            rrSys: trimmedSys || newEntries[existingIndex].rrSys || defSys,
            rrDia: trimmedDia || newEntries[existingIndex].rrDia || defDia,
            puls: trimmedPuls || newEntries[existingIndex].puls || defPuls,
            bzAuto: finalBz ? false : newEntries[existingIndex].bzAuto,
            rrAuto: (trimmedSys || trimmedDia) ? false : newEntries[existingIndex].rrAuto
          };
        } else {
          newEntries.push({
            id: `E-${timestamp}-${Math.random().toString(36).substr(2, 4)}`,
            datum, 
            zeitpunkt: time, 
            bz: finalBz || defBz,
            rrSys: trimmedSys || defSys, 
            rrDia: trimmedDia || defDia, 
            puls: trimmedPuls || defPuls,
            createdAt: timestamp, 
            bzAuto: !finalBz,
            rrAuto: (!trimmedSys && !trimmedDia)
          });
        }
      });
      return sortEntries(newEntries);
    });
    // Reset Inputs nach dem Speichern
    setInputs(TIMES.reduce((acc, time) => ({ ...acc, [time]: { bz: '', rrSys: '', rrDia: '', puls: '' } }), {}));
    showNotification('success', t.notifications.saved);
  }, [datum, inputs, bzUnit, showNotification, sortEntries, t]);

  const handleExportJSON = () => {
    if (entries.length === 0) { showNotification('error', t.notifications.errorEmpty); return; }
    const data = JSON.stringify({ entries, userProfile, bzUnit, date: new Date().toISOString() }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VitalLog_Backup_${formatDateToGerman(new Date())}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShareBackup = async () => {
    if (entries.length === 0) { showNotification('error', t.notifications.errorEmpty); return; }
    const data = JSON.stringify({ entries, userProfile, bzUnit, date: new Date().toISOString() }, null, 2);
    const filename = `VitalLog_Backup_${formatDateToGerman(new Date())}.json`;
    const blob = new Blob([data], { type: 'application/json' });
    const file = new File([blob], filename, { type: 'application/json' });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'VitalLog Backup',
          text: 'Hier ist mein VitalLog Backup.'
        });
        showNotification('success', 'Backup erfolgreich geteilt.');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          window.location.href = `mailto:?subject=VitalLog Backup&body=Anbei mein Backup. (Bitte Datei manuell anhängen)`;
          handleExportJSON();
        }
      }
    } else {
      window.location.href = `mailto:?subject=VitalLog Backup&body=Anbei mein Backup. (Bitte Datei manuell anhängen)`;
      handleExportJSON();
    }
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (imported.entries) {
          setEntries(sortEntries(imported.entries));
          if (imported.userProfile) setUserProfile(imported.userProfile);
          showNotification('success', t.notifications.importSuccess);
        }
      } catch (err) { showNotification('error', 'Datei ungültig'); }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const hasAnyDataForDeletion = entries.length > 0 || userProfile.name !== '' || userProfile.birthday !== '';

  return (
    <div className="min-h-screen pb-4 bg-gray-50 text-black font-sans selection:bg-blue-200">
      <header className="bg-blue-900 text-white pt-2 pb-10 px-2 shadow-xl border-b-2 border-black print:hidden">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <h1 className="text-lg sm:text-2xl font-black italic shrink-0"><i className="fa-solid fa-heart-pulse text-red-500"></i> MED-LOG</h1>
          <div className="flex items-center gap-2 flex-grow justify-end w-full max-w-2xl">
            <HeaderInput label={t.header.pat} placeholder={t.header.namePlaceholder} value={userProfile.name} onChange={(v) => setUserProfile(p => ({ ...p, name: v }))} className="flex-[2]" />
            <HeaderInput label={t.header.geb} placeholder="TT.MM.JJJJ" value={userProfile.birthday} onChange={(v) => setUserProfile(p => ({ ...p, birthday: v }))} className="flex-[2]" isMono />
            <HeaderInput label={t.header.akt} value={datum} onChange={setDatum} className="flex-[2]" isMono />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-2 space-y-4 -mt-8 relative print:mt-0">
        <style>{`
          @media print {
            body { background: white !important; padding: 0 !important; margin: 0 !important; }
            .print\\:hidden { display: none !important; }
            main { max-width: none !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
            section { border: none !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; }
            .daily-summary-container, .history-table-container { display: none !important; }
            #health-charts-container { 
              display: block !important;
              width: 100% !important; 
              padding: 0 !important; 
              margin: 0 !important;
              border: none !important;
              box-shadow: none !important;
              overflow: visible !important;
            }
            @page {
              size: A4;
              margin: 1cm;
            }
          }
        `}</style>
        {notification && (
          <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded border-4 border-black font-black text-sm shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${notification.type === 'success' ? 'bg-green-400' : 'bg-red-500 text-white'} print:hidden animate-bounce`}>
            {notification.message}
          </div>
        )}

        <ConfirmModal 
          isOpen={confirmData?.isOpen || false} 
          title={confirmData?.title || ""} 
          message={confirmData?.message || ""} 
          onCancel={() => setConfirmData(null)}
          onConfirm={() => {
            confirmData?.action();
            setConfirmData(null);
          }}
        />

        <section className="bg-white p-3 rounded-xl shadow-xl border-2 border-black print:hidden">
          <div className="grid grid-cols-2 gap-2">
            {TIMES.map(time => (
              <TimeSlotCard key={time} label={time} translatedLabel={t.times[time]} values={inputs[time]} bzUnit={bzUnit} onChange={(f, v) => handleInputChange(time, f, v)} />
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={handleSave} className="flex-grow bg-blue-700 hover:bg-blue-800 text-white font-black py-3 rounded border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none uppercase text-xs">
              <i className="fa-solid fa-floppy-disk mr-2"></i> {t.actions.save}
            </button>
            <div className="flex flex-col border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden shrink-0">
              <button onClick={() => setBzUnit('mg/dl')} className={`flex-1 text-[8px] px-3 font-black ${bzUnit === 'mg/dl' ? 'bg-black text-white' : 'bg-white'}`}>MG/DL</button>
              <button onClick={() => setBzUnit('mmol/l')} className={`flex-1 text-[8px] px-3 font-black ${bzUnit === 'mmol/l' ? 'bg-black text-white' : 'bg-white'}`}>MMOL/L</button>
            </div>
          </div>
        </section>

        <section className="bg-white p-3 rounded-xl shadow-xl border-2 border-black min-h-[400px] print:p-0 print:border-none print:shadow-none">
          <div className="flex mb-0 border-b-2 border-black pb-3 print:hidden">
            <div className="flex items-center bg-gray-200 p-1 rounded-lg border-2 border-black shadow-inner gap-1 w-full">
              <button onClick={() => setViewMode('daily')} className={`flex-1 px-2 py-1.5 rounded-md font-black text-[9px] uppercase transition-colors ${viewMode === 'daily' ? 'bg-black text-white' : 'text-black hover:bg-black/5'}`}>{t.actions.table}</button>
              <button onClick={() => setViewMode('list')} className={`flex-1 px-2 py-1.5 rounded-md font-black text-[9px] uppercase transition-colors ${viewMode === 'list' ? 'bg-black text-white' : 'text-black hover:bg-black/5'}`}>{t.actions.list}</button>
              <button onClick={() => setViewMode('chart')} className={`flex-1 px-2 py-1.5 rounded-md font-black text-[9px] uppercase transition-colors ${viewMode === 'chart' ? 'bg-black text-white' : 'text-black hover:bg-black/5'}`}>{t.actions.chart}</button>
              
              <div className="w-px h-4 bg-black/20 mx-0.5"></div>
              
              <div className="relative flex-1">
                <button 
                  onClick={() => setShowExportMenu(!showExportMenu)} 
                  disabled={exportStep !== 'idle'}
                  className={`w-full px-2 py-1.5 rounded-md font-black text-[9px] uppercase flex items-center justify-center gap-1.5 transition-all ${showExportMenu ? 'bg-indigo-600 text-white' : 'text-indigo-700 hover:bg-indigo-50'}`}
                >
                  <i className={`fa-solid ${exportStep !== 'idle' ? 'fa-spinner fa-spin' : 'fa-file-export'}`}></i> 
                  {exportStep !== 'idle' ? 'Warten...' : t.actions.export}
                  <i className={`fa-solid fa-chevron-${showExportMenu ? 'up' : 'down'} text-[7px]`}></i>
                </button>

                {showExportMenu && (
                  <div className="absolute top-full right-0 mt-2 w-60 bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-[200] overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    <div className="bg-gray-100 p-2 border-b-2 border-black font-black text-[9px] uppercase text-gray-500">
                      {t.export.title}
                    </div>
                    <button 
                      onClick={() => triggerExport('pdf')}
                      className="w-full text-left px-3 py-2.5 hover:bg-red-50 flex items-center gap-3 border-b-2 border-black/5 transition-colors"
                    >
                      <div className="w-7 h-7 bg-red-100 text-red-600 rounded-lg flex items-center justify-center shrink-0 text-xs">
                        <i className="fa-solid fa-file-pdf"></i>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-[10px] uppercase leading-none">{t.export.pdf}</span>
                        <span className="text-[8px] text-gray-400 font-bold mt-1">Als PDF speichern</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => triggerExport('png')}
                      className="w-full text-left px-3 py-2.5 hover:bg-blue-50 flex items-center gap-3 border-b-2 border-black/5 transition-colors"
                    >
                      <div className="w-7 h-7 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0 text-xs">
                        <i className="fa-solid fa-file-image"></i>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-[10px] uppercase leading-none">{t.export.png}</span>
                        <span className="text-[8px] text-gray-400 font-bold mt-1">Als Bild speichern</span>
                      </div>
                    </button>
                    <button 
                      onClick={handleExportODS}
                      className="w-full text-left px-3 py-2.5 hover:bg-green-50 flex items-center gap-3 transition-colors"
                    >
                      <div className="w-7 h-7 bg-green-100 text-green-600 rounded-lg flex items-center justify-center shrink-0 text-xs">
                        <i className="fa-solid fa-file-excel"></i>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-[10px] uppercase leading-none">{t.export.odf}</span>
                        <span className="text-[8px] text-gray-400 font-bold mt-1">Für LibreOffice / Excel</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-visible">
            <div className={`${viewMode === 'daily' ? 'block' : 'hidden print:block'} daily-summary-container`}>
              <DailySummaryTable 
                entries={entries} 
                bzUnit={bzUnit} 
                language={language} 
                onDeleteDay={(d) => requestDelete("Tag löschen", `Möchten Sie wirklich alle Daten für den ${d} löschen?`, () => setEntries(p => p.filter(e => e.datum !== d)))} 
                onDeleteMultipleDays={(dates) => requestDelete("Auswahl löschen", `Möchten Sie wirklich alle Daten für ${dates.length} ausgewählte Tage löschen?`, () => setEntries(p => p.filter(e => !dates.includes(e.datum))))}
                onDeleteEntry={(id) => requestDelete("Eintrag löschen", "Soll dieser Einzelmesswert wirklich entfernt werden?", () => setEntries(p => p.filter(e => e.id !== id)))} 
              />
            </div>
            <div className={`${viewMode === 'chart' ? 'block' : 'hidden print:block'}`}>
              <HealthChart entries={entries} userProfile={userProfile} bzUnit={bzUnit} language={language} isExporting={exportStep !== 'idle'} />
            </div>
            {viewMode === 'list' && (
              <div className="history-table-container">
                <HistoryTable 
                  entries={entries} 
                  bzUnit={bzUnit} 
                  language={language} 
                  onDelete={(id) => requestDelete("Löschen bestätigen", "Soll dieser Tabelleneintrag unwiderruflich gelöscht werden?", () => setEntries(p => p.filter(e => e.id !== id)))} 
                  onDeleteMultiple={(ids) => requestDelete("Massenlöschung", `Möchten Sie wirklich ${ids.length} markierte Einträge löschen?`, () => setEntries(p => p.filter(e => !ids.includes(e.id))))} 
                />
              </div>
            )}
          </div>
        </section>

        <section className="bg-slate-800 text-white py-2.5 px-4 rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] print:hidden">
          <h3 className="font-black text-sm uppercase mb-1.5 flex items-center gap-2 text-blue-400 underline decoration-2 underline-offset-4"><i className="fa-solid fa-shield-halved"></i> {t.security.title}</h3>
          <p className="text-[11px] font-bold text-slate-300 mb-3 leading-relaxed italic">{t.security.infoText}</p>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={handleExportJSON} className="bg-white text-black border-2 border-black py-2 rounded-lg font-black text-[10px] uppercase shadow-[3px_3px_0px_0px_rgba(59,130,246,1)] hover:translate-y-0.5 active:shadow-none flex flex-col items-center justify-center gap-1"><i className="fa-solid fa-download"></i> Backup</button>
            <button onClick={handleShareBackup} className="bg-white text-black border-2 border-black py-2 rounded-lg font-black text-[10px] uppercase shadow-[3px_3px_0px_0px_rgba(34,197,94,1)] hover:translate-y-0.5 active:shadow-none flex flex-col items-center justify-center gap-1"><i className="fa-solid fa-envelope"></i> E-Mail</button>
            <button onClick={() => fileInputRef.current?.click()} className="bg-white text-black border-2 border-black py-2 rounded-lg font-black text-[10px] uppercase shadow-[3px_3px_0px_0px_rgba(59,130,246,1)] hover:translate-y-0.5 active:shadow-none flex flex-col items-center justify-center gap-1"><i className="fa-solid fa-upload"></i> Import</button>
            <input type="file" ref={fileInputRef} onChange={handleImportJSON} accept=".json" className="hidden" />
          </div>
        </section>

        <footer className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-4 pb-4 print:hidden border-t-2 border-black/10">
          <button onClick={() => setShowManual(true)} className="text-xs font-black text-blue-900 border-b-2 border-blue-900 uppercase py-1 hover:text-red-600 hover:border-red-600 transition-colors">
            <i className="fa-solid fa-circle-info mr-1"></i> {t.manual.title}
          </button>
          <div className="flex gap-2 flex-wrap justify-center items-center">
            {[ 
              { id: 'de', code: 'de', label: 'Deutsch' }, 
              { id: 'en', code: 'gb', label: 'English' }, 
              { id: 'fr', code: 'fr', label: 'Français' }, 
              { id: 'es', code: 'es', label: 'Español' }, 
              { id: 'tr', code: 'tr', label: 'Türkçe' }, 
              { id: 'ar', code: 'sa', label: 'العربية' } 
            ].map(l => (
              <button 
                key={l.id} 
                onClick={() => setLanguage(l.id as Language)} 
                className={`w-10 h-10 rounded-full border-2 border-black flex items-center justify-center overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:scale-90 transition-transform ${language === l.id ? 'bg-blue-600 scale-110 shadow-blue-400' : 'bg-white'}`}
                title={l.label}
              >
                <img 
                  src={`https://flagcdn.com/w40/${l.code}.png`} 
                  alt={l.label}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>
            ))}
          </div>
        </footer>

        <div className="pt-6 pb-2 flex justify-center print:hidden border-t-2 border-black/5">
          <button 
            onClick={handleDeleteAll}
            className={`flex items-center gap-3 px-8 py-4 bg-white text-red-600 border-4 border-red-600 rounded-2xl font-black uppercase text-xs sm:text-sm shadow-[6px_6px_0px_0px_rgba(220,38,38,1)] hover:translate-y-0.5 hover:shadow-none active:translate-y-1 transition-all ${!hasAnyDataForDeletion ? 'opacity-20 grayscale pointer-events-none' : ''}`}
          >
            <i className="fa-solid fa-radiation text-lg"></i>
            {t.actions.deleteAll}
          </button>
        </div>

        {/* Versions-Anzeige am unteren Ende */}
        <div className="pb-8 text-center print:hidden">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Version v3.3.5 • MED-LOG Digital
          </span>
        </div>

        <UserManual isOpen={showManual} onClose={() => setShowManual(false)} language={language} />
      </main>
    </div>
  );
};

export default App;
