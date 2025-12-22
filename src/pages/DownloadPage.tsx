import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Smartphone, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Monitor,
  ExternalLink,
  Cpu,
  HardDrive,
  Wifi,
  Bell,
  BarChart3,
  Settings,
  ChevronRight,
  FileDown,
  Lock,
  Activity
} from 'lucide-react';

export const DownloadPage = () => {
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    const link = document.createElement('a');
    link.href = '/APK/SmokeDetect.apk';
    link.download = 'SmokeDetect.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsDownloading(false), 2000);
  };

  const features = [
    { icon: Activity, text: 'ตรวจสอบค่าควันแบบ Real-time', color: '#3B82F6' },
    { icon: Bell, text: 'รับการแจ้งเตือนผ่าน LINE Messaging API', color: '#10B981' },
    { icon: BarChart3, text: 'ดูกราฟประวัติค่าควัน', color: '#8B5CF6' },
    { icon: Settings, text: 'ตั้งค่าระดับการแจ้งเตือน', color: '#F59E0B' },
    { icon: Wifi, text: 'รองรับหลายเซ็นเซอร์พร้อมกัน', color: '#10B981' },
  ];

  const requirements = [
    { icon: Cpu, text: 'Android 7.0 (Nougat) ขึ้นไป' },
    { icon: HardDrive, text: 'พื้นที่ว่างอย่างน้อย 50 MB' },
    { icon: Wifi, text: 'การเชื่อมต่ออินเทอร์เน็ต' },
  ];

  const installSteps = [
    { step: 1, title: 'ดาวน์โหลด', desc: 'กดปุ่มดาวน์โหลด APK ด้านบน' },
    { step: 2, title: 'เปิดไฟล์', desc: 'เปิดไฟล์ที่ดาวน์โหลดจาก Notification หรือ File Manager' },
    { step: 3, title: 'อนุญาตติดตั้ง', desc: 'หากมีข้อความแจ้งเตือน ให้อนุญาตการติดตั้งจากแหล่งที่ไม่รู้จัก' },
    { step: 4, title: 'ติดตั้ง', desc: 'กดติดตั้งและรอจนเสร็จสิ้น' },
    { step: 5, title: 'เริ่มใช้งาน', desc: 'เปิดแอปและเริ่มใช้งานได้ทันที' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
      padding: 'clamp(16px, 4vw, 32px)',
    }}>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 70% 30%, rgba(16, 185, 129, 0.08) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '40px' }}
        >
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              padding: '10px 16px',
              color: '#94A3B8',
              fontSize: '14px',
              cursor: 'pointer',
              marginBottom: '24px',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
          >
            <ArrowLeft size={18} />
            กลับหน้าหลัก
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
              borderRadius: '16px',
              padding: '14px',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}>
              <FileDown size={28} color="#10B981" />
            </div>
            <div>
              <h1 style={{ 
                color: '#F8FAFC', 
                fontSize: 'clamp(28px, 6vw, 36px)', 
                fontWeight: 700, 
                margin: 0,
                letterSpacing: '-0.02em'
              }}>
                Download Center
              </h1>
              <p style={{ color: '#64748B', fontSize: 'clamp(14px, 3vw, 16px)', margin: '4px 0 0' }}>
                Smoke Detection System - Mobile Application
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Download Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
            borderRadius: '24px',
            padding: 'clamp(24px, 5vw, 40px)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            marginBottom: '24px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative gradient */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '200px',
            background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.1) 0%, transparent 100%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', textAlign: 'center' }}>
            {/* App Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 12px 40px rgba(16, 185, 129, 0.35)',
              }}
            >
              <Smartphone size={48} color="#FFF" />
            </motion.div>

            <h2 style={{ color: '#F8FAFC', fontSize: '26px', fontWeight: 700, margin: '0 0 8px' }}>
              Smoke Detect
            </h2>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '24px'
            }}>
              <span style={{ color: '#64748B', fontSize: '14px' }}>Version 1.0.0</span>
              <span style={{ color: '#475569' }}>|</span>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px',
                background: 'rgba(16, 185, 129, 0.15)',
                padding: '4px 12px',
                borderRadius: '20px',
              }}>
                <Shield size={12} color="#10B981" />
                <span style={{ color: '#10B981', fontSize: '12px', fontWeight: 500 }}>Android</span>
              </div>
            </div>

            {/* Download Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownload}
              disabled={isDownloading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                width: '100%',
                maxWidth: '320px',
                margin: '0 auto',
                padding: '18px 36px',
                background: isDownloading 
                  ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                  : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                border: 'none',
                borderRadius: '16px',
                color: '#FFF',
                fontSize: '17px',
                fontWeight: 600,
                cursor: isDownloading ? 'default' : 'pointer',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
                transition: 'all 0.2s',
              }}
            >
              {isDownloading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Download size={22} />
                  </motion.div>
                  กำลังดาวน์โหลด...
                </>
              ) : (
                <>
                  <Download size={22} />
                  ดาวน์โหลด APK
                </>
              )}
            </motion.button>

            <p style={{ color: '#64748B', fontSize: '13px', marginTop: '16px' }}>
              ขนาดไฟล์ประมาณ 50 MB
            </p>
          </div>
        </motion.div>
    
    {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: '20px',
            padding: 'clamp(20px, 4vw, 28px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '24px',
          }}
        >
          <h3 style={{ 
            color: '#F8FAFC', 
            fontSize: '17px', 
            fontWeight: 600, 
            margin: '0 0 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <CheckCircle size={18} color="#10B981" />
            คุณสมบัติ
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px' 
          }}>
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <div style={{
                  background: `${feature.color}15`,
                  borderRadius: '8px',
                  padding: '8px',
                  flexShrink: 0,
                }}>
                  <feature.icon size={16} color={feature.color} />
                </div>
                <span style={{ color: '#CBD5E1', fontSize: '14px' }}>{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Requirements & Installation */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '24px'
        }}>
          {/* Requirements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              borderRadius: '20px',
              padding: 'clamp(20px, 4vw, 24px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <h3 style={{ 
              color: '#F8FAFC', 
              fontSize: '16px', 
              fontWeight: 600, 
              margin: '0 0 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Cpu size={16} color="#8B5CF6" />
              ความต้องการระบบ
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {requirements.map((req, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <req.icon size={16} color="#64748B" />
                  <span style={{ color: '#94A3B8', fontSize: '14px' }}>{req.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Security Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              borderRadius: '20px',
              padding: 'clamp(20px, 4vw, 24px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <h3 style={{ 
              color: '#F8FAFC', 
              fontSize: '16px', 
              fontWeight: 600, 
              margin: '0 0 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Lock size={16} color="#10B981" />
              ความปลอดภัย
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '14px', margin: 0, lineHeight: 1.7 }}>
              แอปพลิเคชันนี้ไม่มีการเก็บรวบรวมข้อมูลส่วนบุคคล และไม่มีการส่งข้อมูลไปยังเซิร์ฟเวอร์ภายนอก 
              ข้อมูลทั้งหมดจะถูกประมวลผลภายในอุปกรณ์ของผู้ใช้งานเท่านั้น
            </p>
          </motion.div>
        </div>
   
     {/* Installation Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: '20px',
            padding: 'clamp(20px, 4vw, 28px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '24px',
          }}
        >
          <h3 style={{ 
            color: '#F8FAFC', 
            fontSize: '17px', 
            fontWeight: 600, 
            margin: '0 0 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <ChevronRight size={18} color="#3B82F6" />
            วิธีติดตั้ง
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {installSteps.map((item, index) => (
              <div 
                key={index} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '16px',
                  position: 'relative',
                  paddingBottom: index < installSteps.length - 1 ? '24px' : '0',
                }}
              >
                {/* Connector Line */}
                {index < installSteps.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    left: '17px',
                    top: '36px',
                    width: '2px',
                    height: 'calc(100% - 20px)',
                    background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.1) 100%)',
                  }} />
                )}
                
                {/* Step Number */}
                <div style={{
                  minWidth: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#3B82F6',
                  fontSize: '14px',
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {item.step}
                </div>
                
                {/* Content */}
                <div style={{ paddingTop: '4px' }}>
                  <p style={{ 
                    color: '#F8FAFC', 
                    fontSize: '15px', 
                    fontWeight: 600, 
                    margin: '0 0 4px' 
                  }}>
                    {item.title}
                  </p>
                  <p style={{ 
                    color: '#94A3B8', 
                    fontSize: '14px', 
                    margin: 0,
                    lineHeight: 1.5
                  }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Warning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div style={{
              background: 'rgba(245, 158, 11, 0.2)',
              borderRadius: '10px',
              padding: '10px',
              flexShrink: 0,
            }}>
              <AlertCircle size={18} color="#F59E0B" />
            </div>
            <div>
              <p style={{ color: '#FBBF24', fontSize: '14px', fontWeight: 600, margin: '0 0 6px' }}>
                หมายเหตุสำคัญ
              </p>
              <p style={{ color: '#FCD34D', fontSize: '13px', margin: 0, lineHeight: 1.6, opacity: 0.9 }}>
                การติดตั้งไฟล์ APK จากแหล่งภายนอก อาจต้องเปิดใช้งาน "ติดตั้งจากแหล่งที่ไม่รู้จัก" 
                ในการตั้งค่าความปลอดภัยของอุปกรณ์ก่อน โดยไปที่ Settings &gt; Security &gt; Unknown Sources
              </p>
            </div>
          </div>
        </motion.div>
        {
/* Web Version Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              background: 'rgba(59, 130, 246, 0.2)',
              borderRadius: '12px',
              padding: '12px',
            }}>
              <Monitor size={22} color="#3B82F6" />
            </div>
            <div>
              <p style={{ color: '#F8FAFC', fontSize: '15px', fontWeight: 600, margin: 0 }}>
                ใช้งานผ่านเว็บเบราว์เซอร์
              </p>
              <p style={{ color: '#64748B', fontSize: '13px', margin: '4px 0 0' }}>
                ไม่ต้องติดตั้ง ใช้งานได้ทันทีบนทุกอุปกรณ์
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px',
              color: '#60A5FA',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            เปิด Dashboard
            <ExternalLink size={16} />
          </motion.button>
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
            marginTop: '40px',
          }}
        >
          Smoke Detection System - Download Center v1.0
        </motion.p>
      </div>
    </div>
  );
};
