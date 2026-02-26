
import React from 'react';
import { Language } from '../types';

interface UserManualProps {
  isOpen: boolean;
  onClose: () => void;
  language?: Language;
  reason?: 'error' | 'manual';
}

const translations = {
  de: {
    title: 'HILFE & ANLEITUNG',
    subtitle: 'Alles einfach erklärt.',
    sections: [
      { t: '1. Werte eintragen', c: 'Schreiben Sie Ihre Zahlen in die Felder. Nach 3 Zahlen springt das Feld weiter. RR ist Blutdruck. BZ ist Blutzucker.' },
      { t: '2. Speichern', c: 'Drücken Sie den blauen Knopf "SPEICHERN". Dann sind Ihre Werte sicher im Programm.' },
      { t: '3. Farben', c: 'Rot bedeutet: Der Wert ist zu hoch oder zu tief. Gelb bedeutet: Das Programm hat den Wert geschätzt.' },
      { t: '4. Grafik & Liste', c: 'Unten können Sie wählen: Tabelle, Liste oder Grafik. So sehen Sie, wie es Ihnen geht.' },
      { t: '5. Daten & Sicherung', c: 'WICHTIG: Ihre Daten bleiben PRIVAT auf diesem Gerät. Nutzen Sie "DATEN SICHERN" nur, wenn Werte vorhanden sind, um ein leeres Backup zu vermeiden. Mit "IMPORT" laden Sie alte Sicherungen.' }
    ],
    button: 'VERSTANDEN'
  },
  en: {
    title: 'HELP & GUIDE',
    subtitle: 'Everything explained simply.',
    sections: [
      { t: '1. Enter values', c: 'Type your numbers in the boxes. The box moves after 3 digits. RR is blood pressure. BZ is blood sugar.' },
      { t: '2. Save', c: 'Press the blue "SAVE" button. Your values are now stored in the app.' },
      { t: '3. Colors', c: 'Red means: Value is too high or too low. Yellow means: The app estimated this value.' },
      { t: '4. Chart & List', c: 'At the bottom, choose: Table, List, or Chart to see your progress.' },
      { t: '5. Data & Backup', c: 'IMPORTANT: Your data stays PRIVATE on this device. Use "SAVE BACKUP" only when data is present to avoid empty files. Use "IMPORT" to restore files.' }
    ],
    button: 'GOT IT'
  },
  fr: {
    title: 'AIDE ET GUIDE',
    subtitle: 'Tout est expliqué simplement.',
    sections: [
      { t: '1. Entrer les valeurs', c: 'Tapez vos chiffres dans les cases. RR est la tension. BZ est le taux de sucre.' },
      { t: '2. Enregistrer', c: 'Appuyez sur le bouton bleu "ENREGISTRER". Vos données sont maintenant sauvegardées.' },
      { t: '3. Couleurs', c: 'Rouge : Trop haut ou trop bas. Jaune : La valeur a été estimée par l\'application.' },
      { t: '4. Graphique', c: 'En bas, choisissez : Tableau, Liste ou Graphique pour voir votre santé.' },
      { t: '5. Données et Sécurité', c: 'IMPORTANT: Vos données restent PRIVÉES sur cet appareil. Utilisez "SAUVEGARDER" seulement s\'il y a des données pour éviter les fichiers vides.' }
    ],
    button: 'COMPRIS'
  },
  es: {
    title: 'AYUDA Y GUÍA',
    subtitle: 'Todo explicado de forma sencilla.',
    sections: [
      { t: '1. Escribir valores', c: 'Escriba sus números en las casillas. RR es la presión. BZ es el azúcar en sangre.' },
      { t: '2. Guardar', c: 'Pulse el botón azul "GUARDAR". Sus datos están ahora seguros.' },
      { t: '3. Coulores', c: 'Rojo: Valor muy alto o muy bajo. Amarillo: El programa estimó este valor.' },
      { t: '4. Gráfico y Lista', c: 'Abajo puede elegir: Tabla, Lista o Gráfico para ver su evolución.' },
      { t: '5. Datos y Copia', c: 'IMPORTANTE: Sus datos son PRIVADOS en este dispositivo. Use "COPIA DE SEGURIDAD" solo cuando haya datos para evitar archivos vacíos.' }
    ],
    button: 'ENTENDIDO'
  },
  tr: {
    title: 'YARDIM VE KILAVUZ',
    subtitle: 'Her şey basitçe açıklandı.',
    sections: [
      { t: '1. Değerleri girin', c: 'Rakamları kutucuklara yazın. 3 rakamdan sonra diğer kutucuğa geçer. RR tansiyon, BZ kan şekeridir.' },
      { t: '2. Kaydet', c: 'Mavi "KAYDET" düğmesine basın. Değerleriniz güvenle saklanacaktır.' },
      { t: '3. Renkler', c: 'Kırmızı: Değer çok yüksek veya çok düşük. Sarı: Program bu değeri tahmin etti.' },
      { t: '4. Grafik ve Liste', c: 'Alt kısımdan seçebilirsiniz: Tablo, Liste veya Grafik. Durumunuzu oradan görebilirsiniz.' },
      { t: '5. Veri Güvenliği', c: 'ÖNEMLİ: Verileriniz bu cihazda ÖZEL kalır. Boş dosya oluşturmamak için sadece veri varken yedekleyin.' }
    ],
    button: 'ANLADIM'
  },
  ar: {
    title: 'المساعدة والدليل',
    subtitle: 'كل شيء مشروح ببساطة.',
    sections: [
      { t: '1. إدخال القيم', c: 'اكتب الأرقام في الخانات. RR هو ضغط الدم. BZ هو سكر الدم.' },
      { t: '2. الحفظ', c: 'اضغط على الزر الأزرق "حفظ". قيمك الآن مخزنة بأمان.' },
      { t: '3. الألوان', c: 'الأحمر: القيمة مرتفعة أو منخفضة جداً. الأصفر: القيمة تقديرية من البرنامج.' },
      { t: '4. الرسم والجدول', c: 'في الأسفل يمكنك الاختيار بين: جدول، قائمة أو رسم بياني لمتابعة حالتك.' },
      { t: '5. البيانات والأمان', c: 'مهم: بياناتك تبقى خاصة على هذا الجهاز. استخدم النسخ الاحتياطي فقط عند وجود بيانات.' }
    ],
    button: 'فهمت'
  }
};

const UserManual: React.FC<UserManualProps> = ({ isOpen, onClose, language = 'de' }) => {
  if (!isOpen) return null;

  const content = translations[language as keyof typeof translations] || translations.de;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in text-slate-900">
      <div className="bg-white w-full max-w-md border-4 border-black rounded-xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-blue-900 text-white p-4 border-b-4 border-black flex justify-between items-center">
          <div>
            <h2 className="font-black italic tracking-tighter text-xl leading-none">{content.title}</h2>
            <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mt-1">{content.subtitle}</p>
          </div>
          <button onClick={onClose} className="bg-red-600 text-white w-10 h-10 border-2 border-black rounded-lg flex items-center justify-center hover:bg-red-700 active:translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm leading-snug">
          {content.sections.map((sec, i) => (
            <section key={i} className="space-y-2 group">
              <h3 className="font-black uppercase text-blue-900 flex items-center gap-2 text-base">
                <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs border border-blue-900 shrink-0">{i + 1}</span>
                {sec.t}
              </h3>
              <p className="text-gray-700 font-medium pl-8">{sec.c}</p>
            </section>
          ))}
          
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 p-4 rounded-lg">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Med-Log Digital Assistant V3.3</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t-2 border-black">
          <button 
            onClick={onClose}
            className="w-full bg-black text-white font-black py-4 rounded-xl border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] hover:bg-gray-800 active:translate-x-0.5 active:shadow-none transition-all uppercase text-sm tracking-widest"
          >
            {content.button}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManual;
