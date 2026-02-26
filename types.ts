
export type TimeOfDay = 'Morgens' | 'Mittags' | 'Abends' | 'Nacht';
export type BzUnit = 'mg/dl' | 'mmol/l';
export type Language = 'de' | 'en' | 'fr' | 'es' | 'tr' | 'ar';

export interface HealthEntry {
  id: string;
  datum: string; // Format: DD.MM.YYYY
  zeitpunkt: TimeOfDay;
  bz: string;    // Blutzucker (wird intern immer in mg/dl gespeichert)
  rrSys: string; // Blutdruck Systolisch
  rrDia: string; // Blutdruck Diastolisch
  puls: string;  // Puls
  createdAt: number;
  bzAuto?: boolean; 
  rrAuto?: boolean; 
}

export interface DailyInputs {
  [key: string]: {
    bz: string;
    rrSys: string;
    rrDia: string;
    puls: string;
  };
}

export interface UserProfile {
  name: string;
  birthday: string;
  preferredBzUnit?: BzUnit;
}
