import { createContext, useContext, useState, type ReactNode } from 'react';

type Language = 'th' | 'en';

interface Translations {
  [key: string]: {
    th: string;
    en: string;
  };
}

const translations: Translations = {
  
  'nav.guide': { th: 'คู่มือ', en: 'Guide' },
  'nav.app': { th: 'App', en: 'App' },
  'nav.about': { th: 'เกี่ยวกับ', en: 'About' },
  'nav.members': { th: 'ผู้จัดทำ', en: 'Team' },
  'nav.settings': { th: 'ตั้งค่า', en: 'Settings' },
  'nav.back': { th: 'กลับหน้าหลัก', en: 'Back to Home' },

  
  'dashboard.title': { th: 'Smoke Detection', en: 'Smoke Detection' },
  'dashboard.totalSensors': { th: 'เซ็นเซอร์ทั้งหมด', en: 'Total Sensors' },
  'dashboard.online': { th: 'ออนไลน์', en: 'Online' },
  'dashboard.average': { th: 'ค่าเฉลี่ย', en: 'Average' },
  'dashboard.alerts': { th: 'การแจ้งเตือน', en: 'Alerts' },
  'dashboard.checkpoints': { th: 'จุดตรวจวัด', en: 'Checkpoints' },
  'dashboard.ready': { th: 'พร้อมใช้งาน', en: 'Ready' },
  'dashboard.fromAllSensors': { th: 'จากเซ็นเซอร์ทั้งหมด', en: 'From all sensors' },
  'dashboard.pinnedSensors': { th: 'เซ็นเซอร์ที่ปักหมุด', en: 'Pinned Sensors' },
  'dashboard.noPinned': { th: 'ยังไม่มีเซ็นเซอร์ที่ปักหมุด', en: 'No pinned sensors' },
  'dashboard.noPinnedDesc': { th: 'ไปที่หน้าเซ็นเซอร์ทั้งหมดเพื่อปักหมุดเซ็นเซอร์ที่ต้องการแสดงที่หน้าหลัก', en: 'Go to sensors page to pin sensors you want to display on dashboard' },
  'dashboard.goPin': { th: 'ไปปักหมุดเซ็นเซอร์', en: 'Pin Sensors' },
  'dashboard.manageSensors': { th: 'จัดการเซ็นเซอร์', en: 'Manage Sensors' },

  
  'status.safe': { th: 'ปลอดภัย', en: 'Safe' },
  'status.warning': { th: 'เฝ้าระวัง', en: 'Warning' },
  'status.danger': { th: 'อันตราย', en: 'Danger' },
  'status.online': { th: 'ออนไลน์', en: 'Online' },
  'status.offline': { th: 'ออฟไลน์', en: 'Offline' },

  
  'sensor.currentValue': { th: 'ค่าปัจจุบัน (Real-time)', en: 'Current Value (Real-time)' },
  'sensor.stats24h': { th: 'สถิติ 24 ชั่วโมง', en: '24h Statistics' },
  'sensor.max': { th: 'ค่าสูงสุด', en: 'Maximum' },
  'sensor.min': { th: 'ค่าต่ำสุด', en: 'Minimum' },
  'sensor.avg': { th: 'ค่าเฉลี่ย', en: 'Average' },
  'sensor.info': { th: 'ข้อมูลเซ็นเซอร์', en: 'Sensor Info' },
  'sensor.lastUpdate': { th: 'อัพเดทล่าสุด', en: 'Last Update' },
  'sensor.signalStrength': { th: 'ความแรงสัญญาณ', en: 'Signal Strength' },
  'sensor.close': { th: 'ปิดหน้าต่าง', en: 'Close' },

  
  'chart.title': { th: 'แนวโน้มค่าควัน', en: 'Smoke Trend' },
  'chart.last30min': { th: '30 นาทีล่าสุด', en: 'Last 30 minutes' },
  'chart.ranking': { th: 'อันดับเซ็นเซอร์', en: 'Sensor Ranking' },

  
  'alert.detected': { th: 'ตรวจพบค่าควันสูง', en: 'High smoke detected' },
  'alert.sensorsInDanger': { th: 'เซ็นเซอร์อยู่ในระดับอันตราย', en: 'sensors in danger level' },
  'alert.noAlerts': { th: 'ไม่มีการแจ้งเตือน', en: 'No alerts' },
  'alert.allNormal': { th: 'ทุกเซ็นเซอร์ปกติ', en: 'All sensors normal' },
  'alert.history': { th: 'ประวัติการแจ้งเตือน', en: 'Alert History' },

  
  'settings.title': { th: 'ตั้งค่าระบบ', en: 'System Settings' },
  'settings.threshold': { th: 'ระดับค่าควัน', en: 'Smoke Threshold' },
  'settings.warning': { th: 'ระดับเฝ้าระวัง', en: 'Warning Level' },
  'settings.danger': { th: 'ระดับอันตราย', en: 'Danger Level' },
  'settings.updateFreq': { th: 'ความถี่การอัพเดท', en: 'Update Frequency' },
  'settings.sound': { th: 'เสียงแจ้งเตือน', en: 'Sound Alert' },
  'settings.notification': { th: 'การแจ้งเตือน', en: 'Notifications' },
  'settings.language': { th: 'ภาษา', en: 'Language' },
  'settings.reset': { th: 'รีเซ็ตการตั้งค่า', en: 'Reset Settings' },

  
  'export.title': { th: 'ส่งออกรายงาน', en: 'Export Report' },
  'export.csv': { th: 'ดาวน์โหลด CSV', en: 'Download CSV' },
  'export.pdf': { th: 'ดาวน์โหลด PDF', en: 'Download PDF' },
  'export.24h': { th: 'รายงาน 24 ชั่วโมง', en: '24h Report' },
  'export.weekly': { th: 'รายงานรายสัปดาห์', en: 'Weekly Report' },
  'export.monthly': { th: 'รายงานรายเดือน', en: 'Monthly Report' },

  
  'common.loading': { th: 'กำลังโหลด...', en: 'Loading...' },
  'common.error': { th: 'เกิดข้อผิดพลาด', en: 'Error occurred' },
  'common.retry': { th: 'ลองใหม่', en: 'Retry' },
  'common.save': { th: 'บันทึก', en: 'Save' },
  'common.cancel': { th: 'ยกเลิก', en: 'Cancel' },
  'common.confirm': { th: 'ยืนยัน', en: 'Confirm' },
  'common.seconds': { th: 'วินาที', en: 'seconds' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'th';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('app-language', lang);
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
