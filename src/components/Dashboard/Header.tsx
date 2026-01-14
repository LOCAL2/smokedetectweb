import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Settings, Info, Users, BookOpen, Download, Bot, Menu, X, History, BarChart3, ChevronRight } from 'lucide-react';
import { useSettingsContext } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';
import { ThemeToggle } from '../ThemeToggle';

interface HeaderProps {
  onSettingsClick: () => void;
}

export const Header = ({ onSettingsClick }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSettingsContext();
  const { isDark } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const menuItems = [
    { icon: Bot, label: 'AI Chat', path: '/chat', gradient: 'linear-gradient(135deg, #6366F1, #8B5CF6)' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics', gradient: 'linear-gradient(135deg, #8B5CF6, #A855F7)' },
    { icon: BookOpen, label: 'คู่มือ', path: '/guide', gradient: 'linear-gradient(135deg, #3B82F6, #6366F1)' },
    { icon: Download, label: 'App', path: '/download', gradient: 'linear-gradient(135deg, #10B981, #059669)' },
    { icon: History, label: 'Changelog', path: '/changelog', gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)' },
    { icon: Info, label: 'เกี่ยวกับ', path: '/about', gradient: 'linear-gradient(135deg, #0EA5E9, #3B82F6)' },
    { icon: Users, label: 'ผู้จัดทำ', path: '/members', gradient: 'linear-gradient(135deg, #EC4899, #F43F5E)' },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Theme-aware colors - Transparent design
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const textSecondary = isDark ? '#94A3B8' : '#475569';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
  const hoverBg = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
  const activeBg = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)';
  const navBg = isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.6)';

  return (
    <>
      <motion.header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: '16px 24px',
          background: 'transparent',
          transition: 'all 0.3s ease',
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo Section */}
          <motion.div
            style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div style={{ position: 'relative' }}>
              <motion.div
                animate={{
                  boxShadow: ['0 0 20px rgba(99, 102, 241, 0.3)', '0 0 35px rgba(139, 92, 246, 0.5)', '0 0 20px rgba(99, 102, 241, 0.3)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  position: 'absolute',
                  inset: '-4px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  opacity: 0.5,
                  filter: 'blur(8px)',
                }}
              />
              <img
                src="/logo.jpg"
                alt="Logo"
                style={{
                  position: 'relative',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{
                color: textColor,
                fontSize: '20px',
                fontWeight: 700,
                margin: 0,
                letterSpacing: '-0.02em',
              }}>
                Smoke Detection
              </h1>
              {settings.demoMode && (
                <motion.span
                  animate={{
                    boxShadow: ['0 0 10px rgba(245, 158, 11, 0.3)', '0 0 20px rgba(245, 158, 11, 0.5)', '0 0 10px rgba(245, 158, 11, 0.3)']
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{
                    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                    color: '#FFF',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Demo
                </motion.span>
              )}
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="desktop-menu" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Navigation Container with Glass Effect */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px',
              borderRadius: '16px',
              background: navBg,
              border: `1px solid ${borderColor}`,
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}>
              {menuItems.map((item, i) => {
                const active = isActive(item.path);
                const hovered = hoveredIndex === i;

                return (
                  <motion.button
                    key={i}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => navigate(item.path)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      borderRadius: '12px',
                      border: 'none',
                      background: active
                        ? activeBg
                        : hovered
                          ? hoverBg
                          : 'transparent',
                      color: active ? textColor : textSecondary,
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      overflow: 'hidden',
                    }}
                  >
                    <item.icon
                      size={16}
                      style={{
                        transition: 'all 0.3s ease',
                        color: active || hovered ? textColor : textSecondary,
                      }}
                    />
                    <span>{item.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Divider */}
            <div style={{ width: '1px', height: '32px', background: borderColor, margin: '0 8px' }} />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Settings Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSettingsClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                border: `1px solid ${borderColor}`,
                background: hoverBg,
                color: textSecondary,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              <Settings size={20} />
            </motion.button>
          </nav>

          {/* Mobile Menu Button */}
          <motion.button
            className="mobile-menu-btn"
            whileTap={{ scale: 0.95 }}
            onClick={() => setMobileMenuOpen(true)}
            style={{
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              border: `1px solid ${borderColor}`,
              background: hoverBg,
              color: textColor,
              cursor: 'pointer',
            }}
          >
            <Menu size={24} />
          </motion.button>
        </div>
      </motion.header>

      {/* Spacer */}
      <div style={{ height: '80px' }} />

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(8px)',
                zIndex: 200,
              }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={e => e.stopPropagation()}
              style={{
                position: 'fixed',
                right: 0,
                top: 0,
                bottom: 0,
                width: '300px',
                background: isDark
                  ? 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)'
                  : 'linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%)',
                borderLeft: `1px solid ${borderColor}`,
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 201,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ color: textColor, fontSize: '18px', fontWeight: 700, margin: 0 }}>เมนู</h2>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    border: `1px solid ${borderColor}`,
                    background: hoverBg,
                    color: textSecondary,
                    cursor: 'pointer',
                  }}
                >
                  <X size={20} />
                </motion.button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
                {menuItems.map((item, i) => {
                  const active = isActive(item.path);

                  return (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px',
                        borderRadius: '14px',
                        border: `1px solid ${active ? 'rgba(99, 102, 241, 0.3)' : borderColor}`,
                        background: active
                          ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))'
                          : hoverBg,
                        color: active ? '#A5B4FC' : textColor,
                        fontSize: '15px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <item.icon size={20} />
                        {item.label}
                      </div>
                      <ChevronRight size={16} style={{ opacity: 0.5 }} />
                    </motion.button>
                  );
                })}
              </div>

              <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: `1px solid ${borderColor}` }}>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { onSettingsClick(); setMobileMenuOpen(false); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '16px',
                    borderRadius: '14px',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
                    color: '#A5B4FC',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Settings size={20} />
                  ตั้งค่า
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 1024px) {
          .desktop-menu { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
};
