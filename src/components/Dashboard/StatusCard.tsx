import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatusCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: string;
  delay?: number;
}

export const StatusCard = ({ title, value, subtitle, icon: Icon, color, delay = 0 }: StatusCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="status-card"
      style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100px',
        height: '100px',
        background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
        borderRadius: '50%',
        transform: 'translate(30%, -30%)',
      }} />
      
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ color: '#94A3B8', fontSize: '14px', marginBottom: '8px', fontWeight: 500 }}>
            {title}
          </p>
          <motion.h3
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: delay + 0.2 }}
            style={{ 
              color: '#F8FAFC', 
              fontSize: '32px', 
              fontWeight: 700, 
              margin: 0,
              letterSpacing: '-0.02em'
            }}
          >
            {value}
          </motion.h3>
          {subtitle && (
            <p style={{ color: '#64748B', fontSize: '13px', marginTop: '4px' }}>
              {subtitle}
            </p>
          )}
        </div>
        <div style={{
          background: `linear-gradient(135deg, ${color}30 0%, ${color}10 100%)`,
          borderRadius: '14px',
          padding: '12px',
          border: `1px solid ${color}40`,
        }}>
          <Icon size={24} color={color} />
        </div>
      </div>
    </motion.div>
  );
};
