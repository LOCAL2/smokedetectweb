import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Shield,
  Monitor,
  Cpu,
  Wifi,
  Bell
} from 'lucide-react';
import { LampContainer } from '../components/ui/Lamp';
import { useTheme } from '../context/ThemeContext';

type Platform = 'windows';

export const DownloadPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [activePlatform] = useState<Platform>('windows');

  
  const cardBg = isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.9)';
  const cardBorder = isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0, 0, 0, 0.08)';
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const textSecondary = isDark ? '#94A3B8' : '#64748B';
  const textMuted = isDark ? '#64748B' : '#94A3B8';
  const itemBg = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
  const itemBorder = isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.05)';

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = 'https://github.com/LOCAL2/smokedetectweb/releases/download/v1.0.0/SmokeDetection_Setup_v1.0.0.exe';
    link.click();
  };

  const platformData = {
    windows: {
      name: 'Windows',
      icon: Monitor,
      color: '#3B82F6',
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
      version: '1.0.0',
      size: '159 KB',
      requirements: 'Windows 10/11',
      buttonText: 'ดาวน์โหลด EXE',
    },
  };

  const features = [
    { icon: Cpu, text: 'ดูค่าควันแบบ Real-time' },
    { icon: Bell, text: 'รับการแจ้งเตือนทันที' },
    { icon: Wifi, text: 'เชื่อมต่อผ่าน WiFi' },
  ];

  const current = platformData[activePlatform];
  const PlatformIcon = current.icon;

  return (
    <div style={{ minHeight: '100vh', background: isDark ? '#0B0F1A' : '#F1F5F9' }}>
      {}
      <motion.button
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: 'clamp(16px, 4vw, 24px)',
          left: 'clamp(16px, 4vw, 24px)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '14px',
          padding: '14px 24px',
          color: textSecondary,
          fontSize: '15px',
          fontWeight: 500,
          cursor: 'pointer',
          zIndex: 100,
        }}
      >
        <ArrowLeft size={20} />
        กลับหน้าหลัก
      </motion.button>

      {}
      <LampContainer>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          style={{ textAlign: 'center' }}
        >
          <h1 style={{ 
            fontSize: 'clamp(36px, 8vw, 64px)', 
            fontWeight: 700, 
            background: isDark 
              ? 'linear-gradient(to bottom right, #CBD5E1, #64748B)'
              : 'linear-gradient(to bottom right, #475569, #1E293B)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            letterSpacing: '-0.02em',
          }}>
            Download
          </h1>
        </motion.div>
      </LampContainer>

      {}
      <div style={{ 
        maxWidth: '900px', 
        margin: '0 auto', 
        padding: '48px clamp(16px, 4vw, 32px) clamp(32px, 6vw, 64px)',
      }}>
        {}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePlatform}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{
              background: isDark 
                ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)'
                : 'rgba(255, 255, 255, 0.95)',
              borderRadius: '24px',
              padding: 'clamp(24px, 5vw, 40px)',
              border: `1px solid ${current.color}30`,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: isDark ? 'none' : '0 8px 32px rgba(0, 0, 0, 0.08)',
            }}
          >
            {}
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '300px',
              height: '300px',
              background: `radial-gradient(circle, ${current.color}20 0%, transparent 70%)`,
              pointerEvents: 'none',
            }} />

            <div style={{ position: 'relative', textAlign: 'center' }}>
              {}
              <motion.div
                key={`icon-${activePlatform}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                style={{
                  width: '88px',
                  height: '88px',
                  borderRadius: '22px',
                  background: current.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  boxShadow: `0 12px 40px ${current.color}50`,
                }}
              >
                <PlatformIcon size={44} color="#FFF" />
              </motion.div>

              {}
              <h2 style={{ 
                color: textColor, 
                fontSize: 'clamp(20px, 5vw, 28px)', 
                fontWeight: 700, 
                margin: '0 0 12px' 
              }}>
                Smoke Detect
              </h2>
              
              {}
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px',
                background: `${current.color}20`,
                padding: '8px 16px',
                borderRadius: '24px',
                marginBottom: '24px',
              }}>
                <Shield size={14} color={current.color} />
                <span style={{ color: current.color, fontSize: '13px', fontWeight: 600 }}>
                  {current.name} • v{current.version}
                </span>
              </div>

              {}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                marginBottom: '28px',
                maxWidth: '320px',
                margin: '0 auto 28px',
              }}>
                <div style={{
                  background: itemBg,
                  borderRadius: '12px',
                  padding: '14px',
                  border: itemBorder,
                }}>
                  <p style={{ color: textMuted, fontSize: '12px', margin: '0 0 4px' }}>ขนาดไฟล์</p>
                  <p style={{ color: textColor, fontSize: '15px', fontWeight: 600, margin: 0 }}>{current.size}</p>
                </div>
                <div style={{
                  background: itemBg,
                  borderRadius: '12px',
                  padding: '14px',
                  border: itemBorder,
                }}>
                  <p style={{ color: textMuted, fontSize: '12px', margin: '0 0 4px' }}>ความต้องการ</p>
                  <p style={{ color: textColor, fontSize: '15px', fontWeight: 600, margin: 0 }}>{current.requirements}</p>
                </div>
              </div>

              {}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleDownload}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  width: '100%',
                  maxWidth: '300px',
                  margin: '0 auto',
                  padding: '18px 32px',
                  background: current.gradient,
                  border: 'none',
                  borderRadius: '14px',
                  color: '#FFF',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: `0 8px 32px ${current.color}50`,
                }}
              >
                <Download size={20} />
                {current.buttonText}
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>

        {}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginTop: '32px',
          }}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: cardBg,
                borderRadius: '12px',
                padding: '16px',
                border: cardBorder,
                boxShadow: isDark ? 'none' : '0 4px 15px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <feature.icon size={20} color="#6366F1" />
              </div>
              <span style={{ color: isDark ? '#E2E8F0' : '#334155', fontSize: '14px', fontWeight: 500 }}>
                {feature.text}
              </span>
            </div>
          ))}
        </motion.div>

        {}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{ 
            textAlign: 'center', 
            color: '#475569', 
            fontSize: '13px', 
            marginTop: '48px',
            paddingTop: '24px',
            borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.08)'}`,
          }}
        >
          © 2024 Smoke Detect System
        </motion.p>
      </div>
    </div>
  );
};

export default DownloadPage;
