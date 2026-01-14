import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Monitor, Settings, Bell, BarChart3, Wifi,
  AlertTriangle, Shield, ChevronDown, Server, Clock,
  Volume2, TrendingUp, Eye, Pin, Sliders, Activity,
  Gauge, MousePointer, Layers, Zap, Target, CircuitBoard
} from 'lucide-react';
import { LampContainer } from '../components/ui/Lamp';
import { useTheme } from '../context/ThemeContext';

interface GuideSection {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  items: { title: string; desc: string; icon: React.ElementType }[];
}

export const GuidePage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [expandedSection, setExpandedSection] = useState<string | null>('dashboard');

  // Theme colors
  const cardBg = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255, 255, 255, 0.9)';
  const cardBorder = isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0, 0, 0, 0.08)';
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const textSecondary = isDark ? '#94A3B8' : '#64748B';
  const textMuted = isDark ? '#64748B' : '#94A3B8';
  const dividerColor = isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0, 0, 0, 0.08)';
  const itemBg = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0, 0, 0, 0.02)';
  const itemBorder = isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0, 0, 0, 0.05)';

  const sections: GuideSection[] = [
    {
      id: 'dashboard', title: 'Dashboard หลัก', icon: Monitor, color: '#3B82F6',
      items: [
        { title: 'Real-time Data', desc: 'แสดงข้อมูลเซ็นเซอร์แบบ Real-time อัพเดททุก 1-5 วินาที', icon: Activity },
        { title: 'Status Cards', desc: 'แสดงจำนวนเซ็นเซอร์, สถานะออนไลน์, ค่าเฉลี่ย และการแจ้งเตือน', icon: Layers },
        { title: 'Smoke Chart', desc: 'กราฟแสดงแนวโน้มค่าควันย้อนหลัง 30 นาที', icon: TrendingUp },
        { title: 'Sensor Ranking', desc: 'เรียงลำดับเซ็นเซอร์ตามค่าควันจากมากไปน้อย', icon: Gauge },
      ]
    },
    {
      id: 'status', title: 'ระดับสถานะควัน', icon: AlertTriangle, color: '#F59E0B',
      items: [
        { title: 'ปลอดภัย (Safe)', desc: 'ค่าควัน 0-49 PPM แสดงสีเขียว ไม่มีการแจ้งเตือน', icon: Shield },
        { title: 'เฝ้าระวัง (Warning)', desc: 'ค่าควัน 50-199 PPM แสดงสีเหลือง ควรตรวจสอบพื้นที่', icon: AlertTriangle },
        { title: 'อันตราย (Danger)', desc: 'ค่าควัน 200+ PPM แสดงสีแดง แจ้งเตือนทันที', icon: Zap },
      ]
    },
    {
      id: 'sensors', title: 'การจัดการเซ็นเซอร์', icon: Wifi, color: '#10B981',
      items: [
        { title: 'ปักหมุดเซ็นเซอร์', desc: 'คลิกไอคอน Pin เพื่อแสดงเซ็นเซอร์ที่หน้า Dashboard', icon: Pin },
        { title: 'ดูรายละเอียด', desc: 'คลิกที่การ์ดเพื่อดูสถิติ 24 ชั่วโมง', icon: Eye },
        { title: 'สถานะออนไลน์', desc: 'ไอคอน WiFi เขียว = ออนไลน์, แดง = ออฟไลน์', icon: Wifi },
      ]
    },
    {
      id: 'charts', title: 'การอ่านกราฟ', icon: BarChart3, color: '#06B6D4',
      items: [
        { title: 'แกน X/Y', desc: 'แกน X = เวลา 30 นาที, แกน Y = ค่าควัน PPM', icon: TrendingUp },
        { title: 'เส้น Threshold', desc: 'เส้นประเหลือง = เฝ้าระวัง, เส้นประแดง = อันตราย', icon: Target },
        { title: 'การตีความ', desc: 'เส้นพุ่งขึ้นเร็ว = มีควัน, เส้นลดลง = สถานการณ์ดีขึ้น', icon: Gauge },
      ]
    },
    {
      id: 'settings', title: 'การตั้งค่าระบบ', icon: Settings, color: '#8B5CF6',
      items: [
        { title: 'Threshold', desc: 'ปรับระดับ Warning (50 PPM) และ Danger (200 PPM)', icon: Sliders },
        { title: 'ความถี่อัพเดท', desc: 'ตั้งค่า 1-30 วินาที แนะนำ 3-5 วินาที', icon: Clock },
        { title: 'API Endpoints', desc: 'เพิ่ม/ลบ แหล่งข้อมูลเซ็นเซอร์', icon: Server },
      ]
    },
    {
      id: 'alerts', title: 'ระบบแจ้งเตือน', icon: Bell, color: '#EF4444',
      items: [
        { title: 'Alert Banner', desc: 'แถบแจ้งเตือนสีแดงเมื่อมีเซ็นเซอร์อยู่ในระดับอันตราย', icon: AlertTriangle },
        { title: 'เสียงแจ้งเตือน', desc: 'เสียง Beep ดังทุก 30 วินาทีหากยังอยู่ในระดับอันตราย', icon: Volume2 },
        { title: 'LINE Notification', desc: 'แจ้งเตือนผ่าน LINE จาก ESP32 โดยตรง', icon: CircuitBoard },
      ]
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: isDark ? '#0B0F1A' : '#F1F5F9' }}>
      {/* Header with Back Button */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: 'clamp(16px, 4vw, 24px)',
          paddingBottom: '0',
        }}
      >
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '14px',
            padding: '14px 24px',
            color: isDark ? '#94A3B8' : '#64748B',
            fontSize: '15px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={20} />
          กลับหน้าหลัก
        </button>
      </motion.header>

      <LampContainer>
        <motion.h1 initial={{ opacity: 0.5, y: 100 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          className={`mt-8 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl ${
            isDark 
              ? 'bg-gradient-to-br from-slate-300 to-slate-500' 
              : 'bg-gradient-to-br from-slate-600 to-slate-800'
          }`}>
          User Guide
        </motion.h1>
      </LampContainer>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(24px, 5vw, 48px) clamp(16px, 4vw, 32px)' }}>
        <motion.div initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          style={{ background: cardBg, borderRadius: '16px', padding: '20px 24px',
            border: cardBorder, marginBottom: '24px', boxShadow: isDark ? 'none' : '0 4px 15px rgba(0, 0, 0, 0.05)' }}>
          <p style={{ color: textMuted, fontSize: '13px', margin: '0 0 12px', fontWeight: 500 }}>เลือกหัวข้อ</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {sections.map((section) => (
              <button key={section.id}
                onClick={() => { setExpandedSection(section.id); document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px',
                  background: expandedSection === section.id ? `${section.color}15` : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
                  border: `1px solid ${expandedSection === section.id ? `${section.color}40` : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')}`,
                  borderRadius: '8px', color: expandedSection === section.id ? section.color : textSecondary,
                  fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}>
                <section.icon size={14} />{section.title}
              </button>
            ))}
          </div>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {sections.map((section, idx) => (
            <motion.section key={section.id} id={section.id} initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + idx * 0.1, duration: 0.8, ease: "easeInOut" }}
              style={{ background: cardBg, borderRadius: '20px',
                border: `1px solid ${expandedSection === section.id ? `${section.color}40` : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)')}`,
                overflow: 'hidden', transition: 'border-color 0.3s', boxShadow: isDark ? 'none' : '0 4px 15px rgba(0, 0, 0, 0.05)' }}>
              <button onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '14px', padding: '20px 24px',
                  background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px',
                  background: `linear-gradient(135deg, ${section.color}20 0%, ${section.color}10 100%)`,
                  border: `1px solid ${section.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <section.icon size={22} color={section.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ color: textColor, fontSize: '17px', fontWeight: 600, margin: 0 }}>{section.title}</h2>
                  <p style={{ color: textMuted, fontSize: '13px', margin: '2px 0 0' }}>{section.items.length} หัวข้อย่อย</p>
                </div>
                <motion.div animate={{ rotate: expandedSection === section.id ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={20} color={textMuted} />
                </motion.div>
              </button>

              <AnimatePresence>
                {expandedSection === section.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '0 24px 24px', borderTop: dividerColor }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px', paddingTop: '20px' }}>
                        {section.items.map((item, itemIdx) => (
                          <div key={itemIdx} style={{ background: itemBg, borderRadius: '12px', padding: '16px', border: itemBorder }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${section.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <item.icon size={16} color={section.color} />
                              </div>
                              <h3 style={{ color: isDark ? '#E2E8F0' : '#334155', fontSize: '14px', fontWeight: 600, margin: 0 }}>{item.title}</h3>
                            </div>
                            <p style={{ color: textSecondary, fontSize: '13px', margin: 0, lineHeight: 1.6, paddingLeft: '42px' }}>{item.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.8, ease: "easeInOut" }}
          style={{ background: cardBg, borderRadius: '20px', padding: '24px', border: cardBorder, marginTop: '32px', boxShadow: isDark ? 'none' : '0 4px 15px rgba(0, 0, 0, 0.05)' }}>
          <h3 style={{ color: textColor, fontSize: '16px', fontWeight: 600, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Target size={18} color="#10B981" />Quick Reference
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ background: itemBg, borderRadius: '12px', padding: '16px' }}>
              <p style={{ color: textMuted, fontSize: '12px', margin: '0 0 12px', fontWeight: 500 }}>สีสถานะ</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10B981' }} />
                  <span style={{ color: isDark ? '#CBD5E1' : '#334155', fontSize: '13px' }}>ปลอดภัย (0-49 PPM)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B' }} />
                  <span style={{ color: isDark ? '#CBD5E1' : '#334155', fontSize: '13px' }}>เฝ้าระวัง (50-199 PPM)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444' }} />
                  <span style={{ color: isDark ? '#CBD5E1' : '#334155', fontSize: '13px' }}>อันตราย (200+ PPM)</span>
                </div>
              </div>
            </div>
            <div style={{ background: itemBg, borderRadius: '12px', padding: '16px' }}>
              <p style={{ color: textMuted, fontSize: '12px', margin: '0 0 12px', fontWeight: 500 }}>การใช้งานด่วน</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Pin size={14} color="#3B82F6" /><span style={{ color: isDark ? '#CBD5E1' : '#334155', fontSize: '13px' }}>คลิก Pin เพื่อปักหมุด</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Eye size={14} color="#8B5CF6" /><span style={{ color: isDark ? '#CBD5E1' : '#334155', fontSize: '13px' }}>คลิกการ์ดเพื่อดูรายละเอียด</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MousePointer size={14} color="#10B981" /><span style={{ color: isDark ? '#CBD5E1' : '#334155', fontSize: '13px' }}>Hover กราฟเพื่อดูค่า</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        <motion.p initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.8, ease: "easeInOut" }}
          style={{ textAlign: 'center', color: '#475569', fontSize: '13px', marginTop: '48px', paddingTop: '24px', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)'}` }}>
          Smoke Detection System - User Guide v2.0
        </motion.p>
      </div>
    </div>
  );
};
