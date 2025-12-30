import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export const MaintenancePage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Animated gradient background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 40%),
          radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.08) 0%, transparent 40%)
        `,
        transition: 'background 0.3s ease',
      }} />

      {/* Grid pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '40px' }}>
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 1, bounce: 0.4 }}
          style={{ marginBottom: '48px' }}
        >
          <div style={{
            width: '140px',
            height: '140px',
            margin: '0 auto',
            position: 'relative',
          }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '2px solid transparent',
                borderTopColor: '#3B82F6',
                borderRightColor: '#8B5CF6',
              }}
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                inset: '10px',
                borderRadius: '50%',
                border: '2px solid transparent',
                borderBottomColor: '#10B981',
                borderLeftColor: '#F59E0B',
              }}
            />
            <div style={{
              position: 'absolute',
              inset: '25px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <img 
                src="/logo.jpg" 
                alt="Logo" 
                style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%',
                  objectFit: 'cover',
                }} 
              />
            </div>
          </div>
        </motion.div>

        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '100px',
            marginBottom: '32px',
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#F59E0B',
              boxShadow: '0 0 10px #F59E0B',
            }}
          />
          <span style={{ color: '#F59E0B', fontSize: '13px', fontWeight: 500, letterSpacing: '0.5px' }}>
            UNDER DEVELOPMENT
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            fontSize: 'clamp(32px, 8vw, 56px)',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #F8FAFC 0%, #94A3B8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 16px',
            letterSpacing: '-0.02em',
          }}
        >
          Coming Soon
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            color: '#64748B',
            fontSize: 'clamp(16px, 3vw, 18px)',
            maxWidth: '500px',
            margin: '0 auto 48px',
            lineHeight: 1.7,
          }}
        >
          ระบบตรวจจับควันอัจฉริยะกำลังอยู่ในระหว่างการพัฒนา
          <br />
          เราจะกลับมาพร้อมประสบการณ์ที่ดีกว่าเดิม
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            display: 'flex',
            gap: '32px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '48px',
          }}
        >
          {[
            { label: 'Status', value: 'Building' },
            { label: 'Progress', value: '85%' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <p style={{ 
                color: '#F8FAFC', 
                fontSize: '24px', 
                fontWeight: 700, 
                margin: '0 0 4px',
                fontFamily: 'monospace',
              }}>
                {stat.value}
              </p>
              <p style={{ color: '#475569', fontSize: '12px', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Current time */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{
            padding: '20px 32px',
            background: 'rgba(30, 41, 59, 0.5)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            display: 'inline-block',
          }}
        >
          <p style={{ color: '#475569', fontSize: '11px', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Server Time
          </p>
          <p style={{ 
            color: '#F8FAFC', 
            fontSize: '28px', 
            fontWeight: 600, 
            margin: 0,
            fontFamily: 'monospace',
            letterSpacing: '2px',
          }}>
            {time.toLocaleTimeString('th-TH', { hour12: false })}
          </p>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          style={{ marginTop: '64px' }}
        >
          <p style={{ color: '#334155', fontSize: '12px', margin: 0 }}>
            Smoke Detection System © 2024
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default MaintenancePage;
