import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wifi, Bell, BarChart3, Shield } from 'lucide-react';

export const AboutPage = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Wifi, title: 'ตรวจจับแบบ Real-time', desc: 'รับข้อมูลจากเซ็นเซอร์แบบเรียลไทม์' },
    { icon: Bell, title: 'แจ้งเตือนอัตโนมัติ', desc: 'แจ้งเตือนทันทีเมื่อตรวจพบค่าผิดปกติ' },
    { icon: BarChart3, title: 'กราฟประวัติ 24 ชม.', desc: 'ดูแนวโน้มค่าควันย้อนหลัง' },
    { icon: Shield, title: 'ปลอดภัย', desc: 'ช่วยป้องกันอัคคีภัยได้ทันท่วงที' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
      padding: 'clamp(16px, 4vw, 32px)',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
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
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              fontSize: '14px',
              cursor: 'pointer',
              marginBottom: '24px',
            }}
          >
            <ArrowLeft size={18} />
            กลับหน้าหลัก
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div>
              <h1 style={{ color: '#F8FAFC', fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 700, margin: 0 }}>
                Smoke Detection System
              </h1>
              <p style={{ color: '#64748B', fontSize: 'clamp(14px, 3vw, 16px)', margin: '4px 0 0' }}>
                ระบบตรวจจับควันอัจฉริยะ
              </p>
            </div>
          </div>
        </motion.div>

        {/* About Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: '20px',
            padding: 'clamp(20px, 4vw, 32px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ color: '#F8FAFC', fontSize: 'clamp(18px, 4vw, 20px)', fontWeight: 600, marginBottom: '16px' }}>
            เกี่ยวกับโปรเจค
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '15px', lineHeight: 1.8 }}>
            ระบบตรวจจับควันอัจฉริยะ เป็นโปรเจคสำหรับการศึกษาระดับ ปวช.3 
            พัฒนาขึ้นเพื่อช่วยตรวจจับและแจ้งเตือนเมื่อมีควันในปริมาณที่เป็นอันตราย 
            โดยใช้เซ็นเซอร์ MQ-2 ร่วมกับ ESP32 ในการวัดค่าและส่งข้อมูลมายัง Dashboard 
            แบบ Real-time ผ่าน API
          </p>
          <p style={{ color: '#94A3B8', fontSize: '15px', lineHeight: 1.8, marginTop: '12px' }}>
            ระบบสามารถตั้งค่าระดับการแจ้งเตือนได้ แบ่งเป็นระดับเฝ้าระวังและระดับอันตราย 
            พร้อมแสดงกราฟประวัติค่าควันย้อนหลัง 24 ชั่วโมง เพื่อวิเคราะห์แนวโน้ม
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              style={{
                background: 'rgba(30, 41, 59, 0.6)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <feature.icon size={28} color="#3B82F6" style={{ marginBottom: '12px' }} />
              <h3 style={{ color: '#F8FAFC', fontSize: '16px', fontWeight: 600, margin: '0 0 8px' }}>
                {feature.title}
              </h3>
              <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: '20px',
            padding: 'clamp(20px, 4vw, 32px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ color: '#F8FAFC', fontSize: 'clamp(18px, 4vw, 20px)', fontWeight: 600, marginBottom: '20px' }}>
            Tech Stack
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '12px' }}>
            {[
              { name: 'React', color: '#61DAFB' },
              { name: 'TypeScript', color: '#3178C6' },
              { name: 'Vite', color: '#646CFF' },
              { name: 'Chart.js', color: '#FF6384' },
              { name: 'Node.js', color: '#339933' },
              { name: 'ESP32', color: '#E7352C' },
              { name: 'MQ-2', color: '#10B981' },
              { name: 'REST API', color: '#F59E0B' },
            ].map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '12px',
                  borderLeft: `3px solid ${tech.color}`,
                }}
              >
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: tech.color,
                  boxShadow: `0 0 8px ${tech.color}60`,
                }} />
                <span style={{ color: '#E2E8F0', fontSize: '14px', fontWeight: 500 }}>
                  {tech.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            textAlign: 'center',
            color: '#475569',
            fontSize: '13px',
            marginTop: '40px',
          }}
        >
          © 2024 Smoke Detection System | โปรเจค ปวช.3
        </motion.p>
      </div>
    </div>
  );
};
