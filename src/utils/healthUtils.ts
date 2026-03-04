
import { BzUnit, HealthEntry } from '../types';

export const BZ_FACTOR = 18.0182;

/**
 * Wandelt mg/dl in mmol/l um (für Anzeige)
 */
export const mgToMmol = (mg: number | string): string => {
  const val = typeof mg === 'string' ? parseFloat(mg) : mg;
  if (isNaN(val)) return '';
  return (val / BZ_FACTOR).toFixed(1);
};

/**
 * Wandelt mmol/l in mg/dl um (für Speicherung)
 */
export const mmolToMg = (mmol: number | string): string => {
  const val = typeof mmol === 'string' ? parseFloat(mmol.replace(',', '.')) : mmol;
  if (isNaN(val)) return '';
  return Math.round(val * BZ_FACTOR).toString();
};

/**
 * Prüft, ob Blutzucker (BZ) außerhalb des Normbereichs liegt
 */
export const isBzOutOfRange = (val: string, unit: BzUnit = 'mg/dl'): boolean => {
  const num = parseFloat(val.replace(',', '.'));
  if (isNaN(num)) return false;
  
  if (unit === 'mg/dl') {
    return num < 70 || num > 140;
  } else {
    // mmol/l Normbereich ca. 3.9 - 7.8
    return num < 3.9 || num > 7.8;
  }
};

export const isSysOutOfRange = (val: string): boolean => {
  const num = parseInt(val, 10);
  if (isNaN(num)) return false;
  return num < 90 || num > 140;
};

export const isDiaOutOfRange = (val: string): boolean => {
  const num = parseInt(val, 10);
  if (isNaN(num)) return false;
  return num < 60 || num > 90;
};

export const isPulsOutOfRange = (val: string): boolean => {
  const num = parseInt(val, 10);
  if (isNaN(num)) return false;
  return num < 60 || num > 100;
};

/**
 * Berechnet den geschätzten HbA1c-Wert (eHbA1c)
 * Formel: (Durchschnitts-BZ [mg/dl] + 46.7) / 28.7
 */
export const calculateHbA1c = (entries: HealthEntry[]): { averageBz: number, hba1c: number } | null => {
  // Nur echte Messwerte nehmen (keine Auto-Platzhalter)
  const realBzEntries = entries.filter(e => e.bz && !e.bzAuto);
  
  if (realBzEntries.length === 0) return null;

  const sum = realBzEntries.reduce((acc, curr) => acc + parseFloat(curr.bz), 0);
  const averageBz = sum / realBzEntries.length;
  const hba1c = (averageBz + 46.7) / 28.7;

  return { averageBz, hba1c };
};
