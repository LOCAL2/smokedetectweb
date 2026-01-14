import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Clock } from 'lucide-react';

interface OfflineIndicatorProps {
  isOnline: boolean;
  cacheAge: string | null;
}

export const OfflineIndicator = ({ isOnline, cacheAge }: OfflineIndicatorProps) => {
  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(185, 28, 28, 0.95) 100%)',
            backdropFilter: 'blur(10px)',
            padding: '14px 24px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            zIndex: 1000,
            boxShadow: '0 8px 32px rgba(239, 68, 68, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <WifiOff size={20} color="#FFF" />
          </div>
          
          <div>
            <p style={{ 
              color: '#FFF', 
              fontSize: '14px', 
              fontWeight: 600, 
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#FFF',
                animation: 'pulse 1.5s infinite',
              }} />
              ออฟไลน์
            </p>
            {cacheAge && (
              <p style={{ 
                color: 'rgba(255,255,255,0.8)', 
                fontSize: '12px', 
                margin: '4px 0 0',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <Clock size={12} />
                แสดงข้อมูลจาก {cacheAge}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// CSS animation for pulse
const pulseKeyframes = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

// Inject keyframes
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = pulseKeyframes;
  document.head.appendChild(style);
}
