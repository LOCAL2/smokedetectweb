import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Smartphone, 
  Shield,
  Monitor,
  Cpu,
  Wifi,
  Bell
} from 'lucide-react';
import { LampContainer } from '../components/ui/Lamp';

type Platform = 'android' | 'windows';

export const DownloadPage = () => {
  const navigate = useNavigate();
  const [activePlatform, setActivePlatform] = useState<Platform>('android');

  const handleDownload = () => {
    const link = document.createElement('a');
    if (activePlatform === 'android') {
      link.href = 'https://github.com/LOCAL2/smokedetectweb/releases/download/v1.0.0/SmokeDetect.apk';
    } else {
      link.href = 'https://github.com/LOCAL2/smokedetectweb/releases/download/v1.0.0/SmokeDetection_Setup_v1.0.0.exe';
    }
    link.click();
  };

  const platformData = {
    android: {
      name: 'Android',
      icon: Smartphone,
      color: '#10B981',
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      version: '1.0.0',
      size: '50 MB',
      requirements: 'Android 7.0+',
      buttonText: 'ดาวน์โหลด APK',
    },
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
    <div style={{ minHeight: '100vh', background: '#0B0F1A' }}>
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/')}
        style={{
          position: 'fixed',
          top: 'clamp(16px, 4vw, 32px)',
          left: 'clamp(16px, 4vw, 32px)',
          zIndex: 100,
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.05)', 
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '10px', 
          padding: '10px 16px', 
          color: '#94A3B8', 
          fontSize: '14px',
          cursor: 'pointer',
          backdropFilter: 'blur(10px)',
        }}
      >
        <ArrowLeft size={18} /> กลับหน้าหลัก
      </motion.button>

      {/* Hero Section with Lamp */}
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
            background: 'linear-gradient(to bottom right, #CBD5E1, #64748B)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            letterSpacing: '-0.02em',
          }}>
            Download
          </h1>
        </motion.div>
      </LampContainer>

      {/* Main Content */}
      <div style={{ 
        maxWidth: '900px', 
        margin: '0 auto', 
        padding: '48px clamp(16px, 4vw, 32px) clamp(32px, 6vw, 64px)',
      }}>
        {/* Platform Selector */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          {(['android', 'windows'] as Platform[]).map((platform) => {
            const data = platformData[platform];
            const Icon = data.icon;
            const isActive = activePlatform === platform;
            return (
              <motion.button
                key={platform}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActivePlatform(platform)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  padding: '20px 24px',
                  background: isActive 
                    ? data.gradient 
                    : 'rgba(30, 41, 59, 0.5)',
                  border: isActive 
                    ? 'none' 
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  color: isActive ? '#FFF' : '#94A3B8',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: isActive ? `0 8px 32px ${data.color}40` : 'none',
                }}
              >
                <Icon size={24} />
                {data.name}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Download Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePlatform}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
              borderRadius: '24px',
              padding: 'clamp(24px, 5vw, 40px)',
              border: `1px solid ${current.color}30`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Glow Effect */}
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
              {/* Icon */}
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

              {/* Title */}
              <h2 style={{ 
                color: '#F8FAFC', 
                fontSize: 'clamp(20px, 5vw, 28px)', 
                fontWeight: 700, 
                margin: '0 0 12px' 
              }}>
                Smoke Detect
              </h2>
              
              {/* Platform Badge */}
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

              {/* Info Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                marginBottom: '28px',
                maxWidth: '320px',
                margin: '0 auto 28px',
              }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '12px',
                  padding: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}>
                  <p style={{ color: '#64748B', fontSize: '12px', margin: '0 0 4px' }}>ขนาดไฟล์</p>
                  <p style={{ color: '#F8FAFC', fontSize: '15px', fontWeight: 600, margin: 0 }}>{current.size}</p>
                </div>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '12px',
                  padding: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}>
                  <p style={{ color: '#64748B', fontSize: '12px', margin: '0 0 4px' }}>ความต้องการ</p>
                  <p style={{ color: '#F8FAFC', fontSize: '15px', fontWeight: 600, margin: 0 }}>{current.requirements}</p>
                </div>
              </div>

              {/* Download Button */}
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

        {/* Features */}
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
                background: 'rgba(30, 41, 59, 0.4)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
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
              <span style={{ color: '#E2E8F0', fontSize: '14px', fontWeight: 500 }}>
                {feature.text}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Footer */}
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
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          © 2024 Smoke Detection System
        </motion.p>
      </div>
    </div>
  );
};

export default DownloadPage;
