import { motion } from 'framer-motion';
import { Gamepad2, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useSettingsContext } from '../../context/SettingsContext';

export const TryDemoButton = () => {
  const { isDark } = useTheme();
  const { updateSettings } = useSettingsContext();

  const handleEnableDemo = () => {
    updateSettings({ demoMode: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: isDark 
          ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.95) 100%)',
        borderRadius: '24px',
        padding: '48px 32px',
        border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)'}`,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
        boxShadow: isDark 
          ? '0 20px 60px rgba(0, 0, 0, 0.3)'
          : '0 20px 60px rgba(0, 0, 0, 0.08)',
      }}
    >
      {}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.1) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {}
        <div
          style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 24px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 40px rgba(139, 92, 246, 0.3)',
          }}
        >
          <Gamepad2 size={40} color="#FFF" />
        </div>

        {}
        <h2 style={{
          color: isDark ? '#F8FAFC' : '#0F172A',
          fontSize: '28px',
          fontWeight: 700,
          margin: '0 0 12px',
          letterSpacing: '-0.02em',
        }}>
          ยังไม่มีข้อมูล Sensor
        </h2>

        {}
        <p style={{
          color: isDark ? '#94A3B8' : '#64748B',
          fontSize: '16px',
          margin: '0 0 32px',
          lineHeight: 1.6,
          maxWidth: '500px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          ลองใช้งาน <strong style={{ color: isDark ? '#A78BFA' : '#8B5CF6' }}>Demo Mode</strong> เพื่อดูตัวอย่างการทำงานของระบบ<br />
          พร้อมข้อมูลจำลองแบบ Real-time
        </p>

        {}
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 15px 50px rgba(139, 92, 246, 0.4)' }}
          whileTap={{ scale: 0.98 }}
          onClick={handleEnableDemo}
          style={{
            padding: '16px 40px',
            background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
            border: 'none',
            borderRadius: '14px',
            color: '#FFF',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(139, 92, 246, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.3s ease',
          }}
        >
          <Gamepad2 size={20} />
          ทดลองใช้งาน Demo Mode
        </motion.button>

        {}
        <p style={{
          color: isDark ? '#64748B' : '#94A3B8',
          fontSize: '13px',
          margin: '24px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}>
          <Sparkles size={14} />
          สามารถปิด Demo Mode ได้ที่หน้าตั้งค่า
        </p>
      </div>
    </motion.div>
  );
};
