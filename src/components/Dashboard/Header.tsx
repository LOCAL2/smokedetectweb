import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Settings, Info, Users, BookOpen, Download, Bot, Menu, X, History } from 'lucide-react';
import { useSettingsContext } from '../../context/SettingsContext';

interface HeaderProps {
  onSettingsClick: () => void;
}

export const Header = ({ onSettingsClick }: HeaderProps) => {
  const navigate = useNavigate();
  const { settings } = useSettingsContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { icon: Bot, label: 'AI Chat', onClick: () => navigate('/chat'), highlight: true },
    { icon: BookOpen, label: 'คู่มือ', onClick: () => navigate('/guide') },
    { icon: Download, label: 'App', onClick: () => navigate('/download'), color: '#10B981' },
    { icon: History, label: 'Changelog', onClick: () => navigate('/updates') },
    { icon: Info, label: 'เกี่ยวกับ', onClick: () => navigate('/about') },
    { icon: Users, label: 'ผู้จัดทำ', onClick: () => navigate('/members') },
    { icon: Settings, label: 'ตั้งค่า', onClick: onSettingsClick },
  ];
  
  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Logo */}
        <motion.div 
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.location.reload()}
          title="คลิกเพื่อรีเฟรช"
        >
          <img src="/logo.jpg" alt="Logo" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ color: '#F8FAFC', fontSize: 'clamp(16px, 4vw, 24px)', fontWeight: 700, margin: 0 }}>
                Smoke Detection
              </h1>
              {settings.demoMode && (
                <span style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#FFF', fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '20px' }}>
                  Demo
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Desktop Menu */}
        <div className="desktop-menu" style={{ display: 'flex', gap: '8px' }}>
          {menuItems.map((item, i) => (
            <motion.button key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={item.onClick}
              style={{
                background: item.highlight ? 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))' : item.color ? `${item.color}15` : 'rgba(255,255,255,0.05)',
                border: `1px solid ${item.highlight ? 'rgba(99,102,241,0.3)' : item.color ? `${item.color}40` : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '10px', padding: '10px 14px', color: item.highlight ? '#A5B4FC' : item.color || '#94A3B8',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 500,
              }}>
              <item.icon size={16} />
              <span>{item.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Mobile Hamburger */}
        <motion.button className="mobile-menu-btn" whileTap={{ scale: 0.95 }} onClick={() => setMobileMenuOpen(true)}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px', color: '#94A3B8', cursor: 'pointer', display: 'none' }}>
          <Menu size={22} />
        </motion.button>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000 }}
            onClick={() => setMobileMenuOpen(false)}>
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.25 }}
              onClick={e => e.stopPropagation()}
              style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '280px', background: 'linear-gradient(180deg, #1E293B, #0F172A)', padding: '20px', display: 'flex', flexDirection: 'column' }}>
              
              {/* Close Button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <span style={{ color: '#F8FAFC', fontSize: '16px', fontWeight: 600 }}>เมนู</span>
                <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', padding: '8px', color: '#94A3B8', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Menu Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {menuItems.map((item, i) => (
                  <motion.button key={i} whileTap={{ scale: 0.98 }} 
                    onClick={() => { item.onClick(); setMobileMenuOpen(false); }}
                    style={{
                      background: item.highlight ? 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${item.highlight ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: '12px', padding: '14px 16px', color: item.highlight ? '#A5B4FC' : item.color || '#E2E8F0',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', fontWeight: 500, textAlign: 'left',
                    }}>
                    <item.icon size={20} />
                    {item.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .desktop-menu { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
};
