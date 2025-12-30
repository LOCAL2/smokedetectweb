import { motion } from 'framer-motion';
import { Construction, Clock, Wrench } from 'lucide-react';

export const MaintenancePage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          textAlign: 'center',
          maxWidth: '500px',
        }}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '30px',
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 32px',
            boxShadow: '0 20px 60px rgba(245, 158, 11, 0.3)',
          }}
        >
          <Construction size={60} color="#FFF" />
        </motion.div>

        <h1 style={{
          color: '#F8FAFC',
          fontSize: 'clamp(28px, 6vw, 40px)',
          fontWeight: 700,
          margin: '0 0 16px',
        }}>
          กำลังพัฒนา
        </h1>

        <p style={{
          color: '#94A3B8',
          fontSize: '16px',
          lineHeight: 1.6,
          margin: '0 0 32px',
        }}>
          ระบบ Smoke Detection กำลังอยู่ในระหว่างการพัฒนา
          <br />
          กรุณากลับมาใหม่ในภายหลัง
        </p>

        <div style={{
          display: 'flex',
          gap: '24px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#64748B',
            fontSize: '14px',
          }}>
            <Clock size={18} />
            <span>เร็วๆ นี้</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#64748B',
            fontSize: '14px',
          }}>
            <Wrench size={18} />
            <span>v1.4.2</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            marginTop: '48px',
            padding: '16px 24px',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(59, 130, 246, 0.2)',
          }}
        >
          <p style={{ color: '#60A5FA', fontSize: '13px', margin: 0 }}>
            ติดต่อทีมพัฒนา: Barron Nelly
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MaintenancePage;
