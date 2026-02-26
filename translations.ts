
import { Language } from './types';

export const uiTranslations: Record<Language, any> = {
  de: {
    header: { pat: 'PAT.', geb: 'GEB', akt: 'AKT', namePlaceholder: 'Name Vorname', datePlaceholder: 'TT.MM.JJJJ' },
    times: { Morgens: 'Früh', Mittags: 'Mittag', Abends: 'Abend', Nacht: 'Nacht' },
    actions: { save: 'SPEICHERN', quickExp: 'SCHNELL-EXP', table: 'TABELLE', list: 'LISTE', chart: 'GRAFIK', deleteAll: 'ALLES LÖSCHEN', export: 'EXPORTFUNKTION' },
    export: { png: 'PNG Bild', odf: 'ODF (*.ods Format)', pdf: 'PDF (A4 Ausdruck)', title: 'Format wählen' },
    security: {
      title: 'DATEN & SICHERHEIT',
      infoTitle: 'Wichtiger Hinweis',
      infoText: 'Ihre Daten werden lokal gespeichert. Es findet keine Übertragung an Server statt. Ohne Backup gehen die Daten beim Löschen des Browser-Verlaufs verloren.',
      backup: 'DATEN SICHERN (BACKUP)',
      import: 'BACKUP LADEN (IMPORT)'
    },
    manual: { title: 'Bedienungsanleitung', subtitle: 'Einfache Sprache' },
    notifications: { saved: 'Gespeichert', errorDate: 'Datum ungültig', errorEmpty: 'Keine Werte', importSuccess: 'Import erfolgreich', exportRunning: 'Export läuft...' }
  },
  en: {
    header: { pat: 'NAME', geb: 'DOB', akt: 'DATE', namePlaceholder: 'Lastname Firstname', datePlaceholder: 'DD.MM.YYYY' },
    times: { Morgens: 'Morning', Mittags: 'Noon', Abends: 'Evening', Nacht: 'Night' },
    actions: { save: 'SAVE DATA', quickExp: 'QUICK EXP', table: 'TABLE', list: 'LIST', chart: 'CHART', deleteAll: 'DELETE ALL', export: 'EXPORT' },
    export: { png: 'PNG Image', odf: 'ODF (*.ods Format)', pdf: 'PDF (A4 Print)', title: 'Select Format' },
    security: {
      title: 'DATA & SECURITY',
      infoTitle: 'Important Notice',
      infoText: 'Your data is stored locally. No data is sent to servers. If you clear your browser history without a backup, your data will be lost.',
      backup: 'SAVE BACKUP (EXPORT)',
      import: 'LOAD BACKUP (IMPORT)'
    },
    manual: { title: 'User Manual', subtitle: 'Simple Language' },
    notifications: { saved: 'Data saved', errorDate: 'Invalid date', errorEmpty: 'No values entered', importSuccess: 'Import successful', exportRunning: 'Exporting...' }
  },
  fr: {
    header: { pat: 'PAT.', geb: 'NÉ(E)', akt: 'DATE', namePlaceholder: 'Nom Prénom', datePlaceholder: 'JJ.MM.AAAA' },
    times: { Morgens: 'Matin', Mittags: 'Midi', Abends: 'Soir', Nacht: 'Nuit' },
    actions: { save: 'ENREGISTRER', quickExp: 'EXP RAPIDE', table: 'TABLEAU', list: 'LISTE', chart: 'GRAPHE', deleteAll: 'TOUT EFFACER', export: 'EXPORT' },
    export: { png: 'Image PNG', odf: 'ODF (*.ods Format)', pdf: 'PDF (A4 Impression)', title: 'Choisir Format' },
    security: {
      title: 'DONNÉES & SÉCURITÉ',
      infoTitle: 'Avis important',
      infoText: 'Vos données sont stockées localement. Aucune donnée n\'est envoyée aux serveurs. Sans sauvegarde, les données seront perdues si vous effacez l\'historique.',
      backup: 'SAUVEGARDER (EXPORT)',
      import: 'CHARGER (IMPORT)'
    },
    manual: { title: 'Mode d\'emploi', subtitle: 'Langage simple' },
    notifications: { saved: 'Enregistré', errorDate: 'Date invalide', errorEmpty: 'Aucune valeur', importSuccess: 'Import réussi', exportRunning: 'Export en cours...' }
  },
  es: {
    header: { pat: 'PAT.', geb: 'NAC.', akt: 'FECHA', namePlaceholder: 'Nombre Apellido', datePlaceholder: 'DD.MM.AAAA' },
    times: { Morgens: 'Mañana', Mittags: 'Mediodía', Abends: 'Tarde', Nacht: 'Noche' },
    actions: { save: 'GUARDAR', quickExp: 'EXP RÁPIDO', table: 'TABLA', list: 'LISTA', chart: 'GRÁFICO', deleteAll: 'BORRAR TODO', export: 'EXPORTAR' },
    export: { png: 'Imagen PNG', odf: 'ODF (*.ods Format)', pdf: 'PDF (A4 Impresión)', title: 'Elegir Formato' },
    security: {
      title: 'DATOS Y SEGURIDAD',
      infoTitle: 'Aviso importante',
      infoText: 'Sus datos se guardan localmente. No se envían datos a servidores. Sin copia de seguridad, los datos se perderán si borra el historial.',
      backup: 'GUARDAR COPIA (EXPORT)',
      import: 'CARGAR COPIA (IMPORT)'
    },
    manual: { title: 'Manual de usuario', subtitle: 'Lenguaje sencillo' },
    notifications: { saved: 'Guardado', errorDate: 'Fecha inválida', errorEmpty: 'Sin valores', importSuccess: 'Importación exitosa', exportRunning: 'Exportando...' }
  },
  tr: {
    header: { pat: 'HASTA', geb: 'DOĞUM', akt: 'TARİH', namePlaceholder: 'Ad Soyad', datePlaceholder: 'GG.AA.YYYY' },
    times: { Morgens: 'Sabah', Mittags: 'Öğle', Abends: 'Akşam', Nacht: 'Gece' },
    actions: { save: 'KAYDET', quickExp: 'HIZLI-DIŞA', table: 'TABLO', list: 'LİSTE', chart: 'GRAFİK', deleteAll: 'HEPSİNİ SİL' },
    security: {
      title: 'VERİ VE GÜVENLİK',
      infoTitle: 'Önemli Not',
      infoText: 'Verileriniz yerel olarak saklanır. Sunuculara veri gönderilmez. Yedekleme yapmazsanız, tarayıcı geçmişini sildiğinizde verileriniz kaybolur.',
      backup: 'VERİLERİ YEDEKLE',
      import: 'YEDEKLEME YÜKLE'
    },
    manual: { title: 'Kullanım Kılavuzu', subtitle: 'Kolay Anlatım' },
    notifications: { saved: 'Kaydedildi', errorDate: 'Geçersiz tarih', errorEmpty: 'Değer yok', importSuccess: 'İçe aktarma başarılı', exportRunning: 'Dışa aktarılıyor...' }
  },
  ar: {
    header: { pat: 'المريض', geb: 'الميلاد', akt: 'التاريخ', namePlaceholder: 'الاسم الكامل', datePlaceholder: 'YYYY.MM.DD' },
    times: { Morgens: 'صباح', Mittags: 'ظهر', Abends: 'مساء', Nacht: 'ليل' },
    actions: { save: 'حفظ', quickExp: 'تصدير سريع', table: 'جدول', list: 'قائمة', chart: 'رسم بياني', deleteAll: 'حذف الكل' },
    security: {
      title: 'البيانات والأمان',
      infoTitle: 'ملاحظة مهمة',
      infoText: 'يتم تخزين بياناتك محلياً. لا يتم إرسال أي بيانات إلى الخوادم. بدون نسخة احتياطية، ستفقد بياناتك عند مسح سجل المتصفح.',
      backup: 'نسخ احتياطي',
      import: 'تحميل نسخة'
    },
    manual: { title: 'دليل المستخدم', subtitle: 'لغة بسيطة' },
    notifications: { saved: 'تم الحفظ', errorDate: 'التاريخ غير صالح', errorEmpty: 'لا توجد قيم', importSuccess: 'تم التحميل بنجاح', exportRunning: 'جاري التصدير...' }
  }
};
