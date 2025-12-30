import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Wifi, Bell, BarChart3, Shield, 
  Cpu, Target, CheckCircle, Clock, Smartphone,
  Palette, Server, CircuitBoard
} from 'lucide-react';
import { LampContainer } from '../components/ui/Lamp';
import { LinkPreview } from '../components/ui/LinkPreview';

export const AboutPage = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Wifi, title: 'Real-time Monitoring', desc: 'ตรวจจับค่าควันแบบเรียลไทม์ อัพเดททุกวินาที', color: '#3B82F6' },
    { icon: Bell, title: 'Smart Alert', desc: 'แจ้งเตือนอัตโนมัติผ่าน LINE เมื่อพบค่าผิดปกติ', color: '#10B981' },
    { icon: BarChart3, title: 'Analytics', desc: 'วิเคราะห์ข้อมูลย้อนหลัง 24 ชม. ด้วยกราฟ', color: '#8B5CF6' },
    { icon: Shield, title: 'Safety First', desc: 'ช่วยป้องกันอัคคีภัยได้ทันท่วงที', color: '#F59E0B' },
  ];

  const techStack = {
    frontend: [
      { name: 'React', url: 'https://react.dev' },
      { name: 'TypeScript', url: 'https://www.typescriptlang.org' },
      { name: 'Vite', url: 'https://vitejs.dev' },
      { name: 'Chart.js', url: 'https://www.chartjs.org' },
      { name: 'Framer Motion', url: 'https://www.framer.com/motion' },
    ],
    backend: [
      { name: 'Node.js', url: 'https://nodejs.org' },
      { name: 'REST API', url: 'https://restfulapi.net' },
      { name: 'WebSocket', url: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API' },
    ],
    hardware: [
      { name: 'ESP32', url: 'https://www.espressif.com/en/products/socs/esp32' },
      { name: 'MQ-2 Sensor', url: 'https://www.allnewstep.com/product/222/mq-2-ppm-mq2-lpg-smoke-methane-gas-%E0%B9%80%E0%B8%8B%E0%B8%99%E0%B9%80%E0%B8%8B%E0%B8%AD%E0%B8%A3%E0%B9%8C-mq-2-%E0%B8%95%E0%B8%A3%E0%B8%A7%E0%B8%88%E0%B8%88%E0%B8%B1%E0%B8%9A%E0%B8%84%E0%B8%A7%E0%B8%B1%E0%B8%99-%E0%B9%81%E0%B8%81%E0%B9%8A%E0%B8%AA%E0%B8%A1%E0%B8%B5%E0%B9%80%E0%B8%97%E0%B8%99-lpg-smoke-co-for-arduino' },
      { name: 'WiFi Module', url: 'https://www.espressif.com/en/products/modules' },
    ],
  };

  const howItWorks = [
    { step: 1, title: 'ตรวจจับ', desc: 'เซ็นเซอร์ MQ-2 ตรวจจับปริมาณควันในอากาศ', icon: Cpu },
    { step: 2, title: 'ส่งข้อมูล', desc: 'ESP32 ส่งข้อมูลผ่าน WiFi ไปยัง Server', icon: Wifi },
    { step: 3, title: 'ประมวลผล', desc: 'Server วิเคราะห์และเก็บข้อมูลลง Database', icon: BarChart3 },
    { step: 4, title: 'แจ้งเตือน', desc: 'ส่งการแจ้งเตือนผ่าน LINE หากพบค่าผิดปกติ', icon: Bell },
  ];

  const specifications = [
    { label: 'ช่วงการวัด', value: '0 - 4,095 PPM' },
    { label: 'ความถี่อัพเดท', value: '0.5 - 30 วินาที' },
    { label: 'จำนวนเซ็นเซอร์', value: '1' },
    { label: 'ประวัติข้อมูล', value: '24 ชั่วโมง' },
    { label: 'การแจ้งเตือน', value: 'LINE Messaging API' },
    { label: 'แพลตฟอร์ม', value: 'Web, Android, Windows' },
  ];

  const projectGoals = [
    'พัฒนาระบบตรวจจับควันที่มีประสิทธิภาพและราคาประหยัด',
    'สร้าง Dashboard แสดงผลข้อมูลแบบ Real-time',
    'เชื่อมต่อการแจ้งเตือนผ่าน LINE Messaging API',
    'รองรับการใช้งานหลายเซ็นเซอร์พร้อมกัน',
    'พัฒนาแอปพลิเคชันสำหรับ Android และ Windows',
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0B0F1A' }}>
      {/* Hero Section with Lamp Effect */}
      <div style={{ position: 'relative' }}>
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')}
          style={{
            position: 'absolute',
            top: 'clamp(16px, 4vw, 32px)',
            left: 'clamp(16px, 4vw, 32px)',
            zIndex: 100,
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px', padding: '10px 16px', color: '#94A3B8', fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={18} /> กลับหน้าหลัก
        </motion.button>

        <LampContainer>
          <motion.h1
            initial={{ opacity: 0.5, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
          >
            Smoke Detection <br /> System
          </motion.h1>
        </LampContainer>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'clamp(24px, 5vw, 48px) clamp(16px, 4vw, 32px)' }}>
        {/* Project Description */}
        <motion.section initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }} style={{ marginBottom: '48px' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '20px', padding: 'clamp(24px, 4vw, 32px)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 style={{ color: '#F8FAFC', fontSize: '20px', fontWeight: 600, margin: '0 0 16px' }}>เกี่ยวกับโปรเจค</h2>
            <p style={{ color: '#94A3B8', fontSize: '15px', lineHeight: 1.8, margin: '0 0 16px' }}>
              ระบบตรวจจับควันอัจฉริยะ เป็นโปรเจคสำหรับการศึกษาระดับ ปวช.3 พัฒนาขึ้นเพื่อช่วยตรวจจับและแจ้งเตือนเมื่อมีควันในปริมาณที่เป็นอันตราย โดยใช้เซ็นเซอร์ MQ-2 ร่วมกับ ESP32 ในการวัดค่าและส่งข้อมูลมายัง Dashboard แบบ Real-time ผ่าน REST API
            </p>
            <p style={{ color: '#94A3B8', fontSize: '15px', lineHeight: 1.8, margin: 0 }}>
              ระบบสามารถตั้งค่าระดับการแจ้งเตือนได้ แบ่งเป็นระดับเฝ้าระวังและระดับอันตราย พร้อมแสดงกราฟประวัติค่าควันย้อนหลัง 24 ชั่วโมง รองรับการเชื่อมต่อหลายเซ็นเซอร์พร้อมกัน และสามารถแจ้งเตือนผ่าน LINE Messaging API ได้ทันที
            </p>
          </div>
        </motion.section>

        {/* Features Grid */}
        <motion.section initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8, ease: "easeInOut" }} style={{ marginBottom: '48px' }}>
          <h2 style={{ color: '#F8FAFC', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Target size={18} color="#3B82F6" /> คุณสมบัติหลัก
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {features.map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + index * 0.1 }}
                style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${feature.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <feature.icon size={24} color={feature.color} />
                </div>
                <h3 style={{ color: '#F8FAFC', fontSize: '16px', fontWeight: 600, margin: '0 0 8px' }}>{feature.title}</h3>
                <p style={{ color: '#64748B', fontSize: '14px', margin: 0, lineHeight: 1.6 }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* How It Works */}
        <motion.section initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8, ease: "easeInOut" }} style={{ marginBottom: '48px' }}>
          <h2 style={{ color: '#F8FAFC', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Clock size={18} color="#10B981" /> หลักการทำงาน
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {howItWorks.map((item, index) => (
              <div key={index} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '16px', right: '16px', width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#FFF' }}>{item.step}</div>
                <item.icon size={24} color="#64748B" style={{ marginBottom: '12px' }} />
                <h3 style={{ color: '#F8FAFC', fontSize: '15px', fontWeight: 600, margin: '0 0 6px' }}>{item.title}</h3>
                <p style={{ color: '#64748B', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Specifications */}
        <motion.section initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8, ease: "easeInOut" }} style={{ marginBottom: '48px' }}>
          <h2 style={{ color: '#F8FAFC', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Smartphone size={18} color="#F59E0B" /> ข้อมูลจำเพาะ
          </h2>
          <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            {specifications.map((spec, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: index < specifications.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <span style={{ color: '#94A3B8', fontSize: '14px' }}>{spec.label}</span>
                <span style={{ color: '#F8FAFC', fontSize: '14px', fontWeight: 500 }}>{spec.value}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Project Goals */}
        <motion.section initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8, ease: "easeInOut" }} style={{ marginBottom: '48px' }}>
          <h2 style={{ color: '#F8FAFC', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle size={18} color="#10B981" /> วัตถุประสงค์ของโปรเจค
          </h2>
          <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {projectGoals.map((goal, index) => (
                <li key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 0', borderBottom: index < projectGoals.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <CheckCircle size={18} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ color: '#E2E8F0', fontSize: '14px', lineHeight: 1.6 }}>{goal}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.section>

        {/* Tech Stack */}
        <motion.section initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.8, ease: "easeInOut" }} style={{ marginBottom: '48px' }}>
          <h2 style={{ color: '#F8FAFC', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Cpu size={18} color="#8B5CF6" /> เทคโนโลยีที่ใช้
          </h2>
          
          {/* Frontend */}
          <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Palette size={20} color="#FFF" />
              </div>
              <div>
                <h3 style={{ color: '#F8FAFC', fontSize: '16px', fontWeight: 600, margin: 0 }}>Frontend</h3>
                <p style={{ color: '#64748B', fontSize: '12px', margin: 0 }}>User Interface & Experience</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {techStack.frontend.map((tech) => (
                <LinkPreview key={tech.name} url={tech.url}>
                  <span style={{ 
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)', 
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '10px', 
                    padding: '10px 16px', 
                    color: '#E2E8F0', 
                    fontSize: '14px', 
                    fontWeight: 500, 
                    display: 'inline-block', 
                    cursor: 'pointer', 
                    transition: 'all 0.2s',
                  }}>{tech.name}</span>
                </LinkPreview>
              ))}
            </div>
          </div>

          {/* Backend & Hardware Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {/* Backend */}
            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Server size={20} color="#FFF" />
                </div>
                <div>
                  <h3 style={{ color: '#F8FAFC', fontSize: '16px', fontWeight: 600, margin: 0 }}>Backend</h3>
                  <p style={{ color: '#64748B', fontSize: '12px', margin: 0 }}>Server & API</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {techStack.backend.map((tech) => (
                  <LinkPreview key={tech.name} url={tech.url}>
                    <span style={{ 
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)', 
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      borderRadius: '10px', 
                      padding: '10px 16px', 
                      color: '#E2E8F0', 
                      fontSize: '14px', 
                      fontWeight: 500, 
                      display: 'inline-block', 
                      cursor: 'pointer', 
                      transition: 'all 0.2s',
                    }}>{tech.name}</span>
                  </LinkPreview>
                ))}
              </div>
            </div>

            {/* Hardware */}
            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CircuitBoard size={20} color="#FFF" />
                </div>
                <div>
                  <h3 style={{ color: '#F8FAFC', fontSize: '16px', fontWeight: 600, margin: 0 }}>Hardware</h3>
                  <p style={{ color: '#64748B', fontSize: '12px', margin: 0 }}>IoT & Sensors</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {techStack.hardware.map((tech) => (
                  <LinkPreview key={tech.name} url={tech.url}>
                    <span style={{ 
                      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)', 
                      border: '1px solid rgba(245, 158, 11, 0.2)',
                      borderRadius: '10px', 
                      padding: '10px 16px', 
                      color: '#E2E8F0', 
                      fontSize: '14px', 
                      fontWeight: 500, 
                      display: 'inline-block', 
                      cursor: 'pointer', 
                      transition: 'all 0.2s',
                    }}>{tech.name}</span>
                  </LinkPreview>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <motion.p initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0, duration: 0.8, ease: "easeInOut" }}
          style={{ textAlign: 'center', color: '#475569', fontSize: '13px', marginTop: '48px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          © 2024 Smoke Detection System
        </motion.p>
      </div>
    </div>
  );
};
