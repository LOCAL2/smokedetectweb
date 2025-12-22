import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Monitor, 
  Settings, 
  Bell, 
  BarChart3, 
  Wifi,
  AlertTriangle,
  Shield,
  Skull,
  ChevronDown,
  Server,
  Clock,
  Volume2,
  TrendingUp,
  Eye,
  Pin,
  Sliders,
  Activity,
  Gauge,
  MousePointer,
  Layers,
  Zap,
  Target,
  BookOpen
} from 'lucide-react';

interface GuideSection {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  description: string;
  content: GuideContent[];
}

interface GuideContent {
  subtitle: string;
  icon?: React.ElementType;
  iconColor?: string;
  description?: string;
  items: string[];
  tip?: string;
}

export const GuidePage = () => {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState<string | null>('overview');

  const sections: GuideSection[] = [
    {
      id: 'overview',
      title: 'ภาพรวมระบบ',
      icon: Layers,
      color: '#3B82F6',
      description: 'ทำความเข้าใจโครงสร้างและการทำงานของระบบตรวจจับควัน',
      content: [
        {
          subtitle: 'Dashboard หลัก',
          icon: Monitor,
          iconColor: '#3B82F6',
          description: 'หน้าจอหลักสำหรับติดตามสถานะเซ็นเซอร์ทั้งหมด',
          items: [
            'แสดงข้อมูลเซ็นเซอร์แบบ Real-time อัพเดททุก 1-5 วินาที',
            'Status Cards แสดงจำนวนเซ็นเซอร์ทั้งหมด, ออนไลน์, ค่าเฉลี่ย และการแจ้งเตือน',
            'กราฟแสดงแนวโน้มค่าควันย้อนหลัง 30 นาที',
            'Sensor Ranking แสดงเซ็นเซอร์ที่มีค่าสูงสุดเรียงลำดับ',
            'เซ็นเซอร์ที่ปักหมุดจะแสดงที่หน้าหลักเพื่อติดตามได้สะดวก'
          ],
          tip: 'คลิกที่การ์ดเซ็นเซอร์เพื่อดูรายละเอียดและสถิติ 24 ชั่วโมง'
        },
        {
          subtitle: 'การนำทาง',
          icon: MousePointer,
          iconColor: '#8B5CF6',
          items: [
            'Header: ปุ่มเกี่ยวกับ, ผู้จัดทำ และตั้งค่า',
            'หน้าเซ็นเซอร์: ดูรายการเซ็นเซอร์ทั้งหมดและจัดการปักหมุด',
            'หน้าตั้งค่า: ปรับค่า Threshold, API และการแจ้งเตือน',
            'หน้าคู่มือ: คู่มือการใช้งานที่คุณกำลังอ่านอยู่',
            'หน้าดาวน์โหลด: ดาวน์โหลดแอปพลิเคชันมือถือ'
          ]
        }
      ]
    },
    {
      id: 'status-levels',
      title: 'ระดับสถานะควัน',
      icon: AlertTriangle,
      color: '#F59E0B',
      description: 'ทำความเข้าใจความหมายของสีและระดับการแจ้งเตือน',
      content: [
        {
          subtitle: 'ระดับปลอดภัย (Safe)',
          icon: Shield,
          iconColor: '#10B981',
          description: 'สถานะปกติ ไม่มีความเสี่ยง',
          items: [
            'ค่าควันต่ำกว่าระดับเฝ้าระวังที่ตั้งไว้',
            'แสดงสถานะด้วยสีเขียว',
            'ไม่มีการแจ้งเตือนใดๆ',
            'ค่าเริ่มต้น: 0-49 PPM'
          ]
        },
        {
          subtitle: 'ระดับเฝ้าระวัง (Warning)',
          icon: AlertTriangle,
          iconColor: '#F59E0B',
          description: 'ควรเฝ้าระวังและตรวจสอบพื้นที่',
          items: [
            'ค่าควันอยู่ระหว่างระดับเฝ้าระวังและอันตราย',
            'แสดงสถานะด้วยสีเหลือง/ส้ม',
            'แจ้งเตือนตามการตั้งค่าที่กำหนด',
            'ค่าเริ่มต้น: 50-199 PPM'
          ],
          tip: 'หากค่าอยู่ในระดับนี้ต่อเนื่อง ควรตรวจสอบพื้นที่จริง'
        },
        {
          subtitle: 'ระดับอันตราย (Danger)',
          icon: Skull,
          iconColor: '#EF4444',
          description: 'ต้องดำเนินการทันที',
          items: [
            'ค่าควันสูงกว่าระดับอันตรายที่ตั้งไว้',
            'แสดงสถานะด้วยสีแดงพร้อมเอฟเฟกต์กระพริบ',
            'แจ้งเตือนทันทีพร้อมเสียง (ถ้าเปิดใช้งาน)',
            'ค่าเริ่มต้น: 200+ PPM'
          ],
          tip: 'เมื่อถึงระดับนี้ ระบบจะส่งแจ้งเตือนผ่าน LINE โดยอัตโนมัติ'
        }
      ]
    },
   
 {
      id: 'sensor-cards',
      title: 'การ์ดเซ็นเซอร์',
      icon: Activity,
      color: '#10B981',
      description: 'วิธีอ่านและใช้งานการ์ดแสดงข้อมูลเซ็นเซอร์',
      content: [
        {
          subtitle: 'ส่วนประกอบของการ์ด',
          icon: Layers,
          iconColor: '#10B981',
          items: [
            'ชื่อเซ็นเซอร์: แสดงที่มุมซ้ายบน',
            'สถานที่: แสดงใต้ชื่อเซ็นเซอร์พร้อมไอคอน Pin',
            'สถานะออนไลน์: ไอคอน WiFi ที่มุมขวาบน (เขียว=ออนไลน์, แดง=ออฟไลน์)',
            'ค่าควัน: ตัวเลขขนาดใหญ่ตรงกลาง หน่วย PPM',
            'แถบสถานะ: แสดงระดับความปลอดภัยด้วยสีและข้อความ',
            'Progress Bar: แสดงระดับค่าควันเทียบกับ Threshold'
          ]
        },
        {
          subtitle: 'การปักหมุดเซ็นเซอร์',
          icon: Pin,
          iconColor: '#3B82F6',
          description: 'ปักหมุดเซ็นเซอร์ที่สำคัญเพื่อแสดงที่หน้าหลัก',
          items: [
            'ไปที่หน้า "เซ็นเซอร์ทั้งหมด" จาก Dashboard',
            'คลิกไอคอน Pin ที่มุมขวาบนของการ์ดเซ็นเซอร์',
            'เซ็นเซอร์ที่ปักหมุดจะแสดงที่หน้า Dashboard หลัก',
            'คลิกไอคอน Pin อีกครั้งเพื่อเลิกปักหมุด'
          ],
          tip: 'ปักหมุดเซ็นเซอร์ในพื้นที่สำคัญเพื่อติดตามได้สะดวก'
        },
        {
          subtitle: 'การดูรายละเอียด',
          icon: Eye,
          iconColor: '#8B5CF6',
          items: [
            'คลิกที่การ์ดเซ็นเซอร์เพื่อเปิด Detail Panel',
            'แสดงค่าปัจจุบันแบบ Real-time',
            'แสดงสถิติ 24 ชั่วโมง: ค่าสูงสุด, ต่ำสุด, เฉลี่ย',
            'แสดงข้อมูลเซ็นเซอร์: ID, สถานะ, เวลาอัพเดทล่าสุด'
          ]
        }
      ]
    },
    {
      id: 'charts',
      title: 'การอ่านกราฟ',
      icon: BarChart3,
      color: '#06B6D4',
      description: 'วิธีวิเคราะห์ข้อมูลจากกราฟแสดงผล',
      content: [
        {
          subtitle: 'กราฟแนวโน้มค่าควัน',
          icon: TrendingUp,
          iconColor: '#06B6D4',
          description: 'กราฟหลักที่แสดงค่าเฉลี่ยของทุกเซ็นเซอร์',
          items: [
            'แกน X: แสดงเวลาย้อนหลัง 30 นาที',
            'แกน Y: แสดงค่าควันในหน่วย PPM',
            'เส้นกราฟสีฟ้า: ค่าเฉลี่ยของเซ็นเซอร์ทั้งหมด',
            'เส้นประสีเหลือง: ระดับเฝ้าระวัง (Warning Threshold)',
            'เส้นประสีแดง: ระดับอันตราย (Danger Threshold)',
            'พื้นที่ใต้กราฟแสดงด้วยสี Gradient'
          ]
        },
        {
          subtitle: 'Sensor Ranking',
          icon: Gauge,
          iconColor: '#F59E0B',
          description: 'แสดงเซ็นเซอร์เรียงตามค่าสูงสุด',
          items: [
            'แสดงเซ็นเซอร์ที่มีค่าสูงสุดอยู่ด้านบน',
            'แสดงค่าสูงสุด, ต่ำสุด และค่าเฉลี่ย',
            'Progress Bar แสดงระดับเทียบกับ Threshold',
            'สีของ Progress Bar เปลี่ยนตามระดับสถานะ'
          ]
        },
        {
          subtitle: 'การตีความข้อมูล',
          icon: Target,
          iconColor: '#10B981',
          items: [
            'เส้นกราฟอยู่ต่ำและคงที่ = อากาศปกติ',
            'เส้นกราฟพุ่งขึ้นเร็ว = อาจมีควันเกิดขึ้น ควรตรวจสอบ',
            'เส้นกราฟอยู่สูงต่อเนื่อง = มีควันในพื้นที่ ต้องดำเนินการ',
            'เส้นกราฟลดลงหลังจากสูง = สถานการณ์กำลังดีขึ้น'
          ],
          tip: 'สังเกตแนวโน้มมากกว่าค่าเดี่ยว เพื่อประเมินสถานการณ์ได้แม่นยำ'
        }
      ]
    },
    
{
      id: 'settings',
      title: 'การตั้งค่าระบบ',
      icon: Settings,
      color: '#8B5CF6',
      description: 'ปรับแต่งระบบให้เหมาะกับการใช้งาน',
      content: [
        {
          subtitle: 'ระดับค่าควัน (Threshold)',
          icon: Sliders,
          iconColor: '#F59E0B',
          description: 'กำหนดระดับการแจ้งเตือน',
          items: [
            'Warning Threshold: ค่าที่เริ่มเข้าสู่ระดับเฝ้าระวัง (ค่าเริ่มต้น 50 PPM)',
            'Danger Threshold: ค่าที่เข้าสู่ระดับอันตราย (ค่าเริ่มต้น 200 PPM)',
            'ใช้ Slider เลื่อนปรับค่า หรือพิมพ์ค่าโดยตรงในช่อง Input',
            'ค่าจะถูกบันทึกอัตโนมัติทันทีที่เปลี่ยน'
          ],
          tip: 'ปรับค่าให้เหมาะกับสภาพแวดล้อม เช่น ห้องครัวอาจต้องตั้งค่าสูงกว่าปกติ'
        },
        {
          subtitle: 'ความถี่การอัพเดท',
          icon: Clock,
          iconColor: '#3B82F6',
          description: 'กำหนดความถี่ในการดึงข้อมูล',
          items: [
            'ค่าน้อย (1-2 วินาที): อัพเดทเร็ว เหมาะกับการติดตามใกล้ชิด',
            'ค่ากลาง (3-5 วินาที): สมดุลระหว่างความเร็วและทรัพยากร',
            'ค่ามาก (10+ วินาที): ประหยัดทรัพยากร เหมาะกับการติดตามทั่วไป',
            'แนะนำ: 3-5 วินาที สำหรับการใช้งานปกติ'
          ]
        },
        {
          subtitle: 'การแจ้งเตือน',
          icon: Bell,
          iconColor: '#EF4444',
          description: 'ตั้งค่าการแจ้งเตือนเมื่อตรวจพบอันตราย',
          items: [
            'เสียงแจ้งเตือน: เปิด/ปิด เสียง Beep เมื่อถึงระดับอันตราย',
            'Browser Notification: แจ้งเตือนแม้ไม่ได้เปิดหน้าเว็บอยู่',
            'ต้องอนุญาตการแจ้งเตือนในเบราว์เซอร์ก่อนใช้งาน',
            'เสียงจะดังทุก 30 วินาทีหากยังอยู่ในระดับอันตราย'
          ]
        },
        {
          subtitle: 'API Endpoints',
          icon: Server,
          iconColor: '#10B981',
          description: 'จัดการแหล่งข้อมูลเซ็นเซอร์',
          items: [
            'เพิ่ม Endpoint: กรอก URL และชื่อสถานที่',
            'เลือกประเภท: WebSocket (Real-time) หรือ HTTP (Polling)',
            'เปิด/ปิด: Toggle เพื่อเปิดหรือปิดการใช้งานแต่ละ Endpoint',
            'ลบ: คลิกไอคอนถังขยะเพื่อลบ Endpoint'
          ],
          tip: 'WebSocket เหมาะกับการติดตาม Real-time, HTTP เหมาะกับเซ็นเซอร์ที่อัพเดทไม่บ่อย'
        }
      ]
    },
    {
      id: 'alerts',
      title: 'ระบบแจ้งเตือน',
      icon: Bell,
      color: '#EF4444',
      description: 'ทำความเข้าใจระบบแจ้งเตือนทั้งหมด',
      content: [
        {
          subtitle: 'Alert Banner',
          icon: AlertTriangle,
          iconColor: '#EF4444',
          description: 'แถบแจ้งเตือนที่ด้านบนของ Dashboard',
          items: [
            'ปรากฏเมื่อมีเซ็นเซอร์อยู่ในระดับอันตราย',
            'แสดงจำนวนเซ็นเซอร์ที่มีค่าผิดปกติ',
            'พื้นหลังสีแดงพร้อมเอฟเฟกต์กระพริบ',
            'หายไปอัตโนมัติเมื่อค่ากลับสู่ปกติ'
          ]
        },
        {
          subtitle: 'เสียงแจ้งเตือน',
          icon: Volume2,
          iconColor: '#F59E0B',
          description: 'เสียง Beep เมื่อตรวจพบอันตราย',
          items: [
            'เปิดใช้งานได้ในหน้าตั้งค่า',
            'ดังเป็นเสียง Beep 3 ครั้งติดกัน',
            'ดังซ้ำทุก 30 วินาทีหากยังอยู่ในระดับอันตราย',
            'หยุดอัตโนมัติเมื่อค่ากลับสู่ปกติ'
          ]
        },
        {
          subtitle: 'Browser Notification',
          icon: Bell,
          iconColor: '#3B82F6',
          description: 'การแจ้งเตือนของเบราว์เซอร์',
          items: [
            'แจ้งเตือนแม้ไม่ได้เปิดหน้าเว็บอยู่',
            'ต้องอนุญาตการแจ้งเตือนในเบราว์เซอร์ก่อน',
            'แสดงชื่อเซ็นเซอร์และค่าควันที่ตรวจพบ',
            'คลิกที่ Notification เพื่อกลับมาที่หน้าเว็บ'
          ]
        },
        {
          subtitle: 'LINE Notification',
          icon: Zap,
          iconColor: '#10B981',
          description: 'การแจ้งเตือนผ่าน LINE',
          items: [
            'ส่งแจ้งเตือนผ่าน LINE เมื่อตรวจพบอันตราย',
            'ทำงานจาก ESP32 โดยตรง (ไม่ต้องเปิดเว็บ)',
            'แจ้งเตือนเมื่อค่าควันเกิน Threshold',
            'แจ้งเตือนเมื่อค่ากลับสู่ปกติ'
          ],
          tip: 'LINE Notification ตั้งค่าที่ฝั่ง ESP32 ไม่ใช่ที่เว็บ'
        }
      ]
    },
    {

      id: 'sensors-page',
      title: 'หน้าเซ็นเซอร์',
      icon: Wifi,
      color: '#10B981',
      description: 'จัดการและดูรายการเซ็นเซอร์ทั้งหมด',
      content: [
        {
          subtitle: 'รายการเซ็นเซอร์',
          icon: Activity,
          iconColor: '#10B981',
          items: [
            'แสดงเซ็นเซอร์ทั้งหมดในระบบ',
            'แสดงสถานะออนไลน์/ออฟไลน์ของแต่ละเซ็นเซอร์',
            'แสดงค่าควันปัจจุบันและสถานที่',
            'เรียงลำดับตามค่าควันจากมากไปน้อย'
          ]
        },
        {
          subtitle: 'การจัดการปักหมุด',
          icon: Pin,
          iconColor: '#3B82F6',
          description: 'เลือกเซ็นเซอร์ที่จะแสดงที่หน้าหลัก',
          items: [
            'คลิกไอคอน Pin เพื่อปักหมุดเซ็นเซอร์',
            'เซ็นเซอร์ที่ปักหมุดจะแสดงที่ Dashboard หลัก',
            'ไอคอน Pin สีฟ้า = ปักหมุดแล้ว',
            'ไอคอน Pin สีเทา = ยังไม่ได้ปักหมุด'
          ],
          tip: 'ปักหมุดเซ็นเซอร์ในพื้นที่เสี่ยงสูงเพื่อติดตามได้ง่าย'
        }
      ]
    }
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

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
        background: 'radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative' }}>
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
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
              borderRadius: '16px',
              padding: '14px',
              border: '1px solid rgba(59, 130, 246, 0.3)',
            }}>
              <BookOpen size={28} color="#3B82F6" />
            </div>
            <div>
              <h1 style={{ 
                color: '#F8FAFC', 
                fontSize: 'clamp(28px, 6vw, 36px)', 
                fontWeight: 700, 
                margin: 0,
                letterSpacing: '-0.02em'
              }}>
                คู่มือการใช้งาน
              </h1>
              <p style={{ color: '#64748B', fontSize: 'clamp(14px, 3vw, 16px)', margin: '4px 0 0' }}>
                Smoke Detection System - Web Dashboard
              </p>
            </div>
          </div>
        </motion.div>
       
 {/* Quick Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: '16px',
            padding: '20px 24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '24px',
          }}
        >
          <p style={{ color: '#94A3B8', fontSize: '13px', margin: '0 0 12px', fontWeight: 500 }}>
            เลือกหัวข้อ
          </p>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: '8px' 
          }}>
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setExpandedSection(section.id);
                  document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  background: expandedSection === section.id 
                    ? `${section.color}20` 
                    : 'rgba(255, 255, 255, 0.03)',
                  border: expandedSection === section.id 
                    ? `1px solid ${section.color}40`
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  color: expandedSection === section.id ? section.color : '#94A3B8',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <section.icon size={14} />
                {section.title}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {sections.map((section, sectionIndex) => (
            <motion.section
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + sectionIndex * 0.03 }}
              style={{
                background: 'rgba(30, 41, 59, 0.6)',
                borderRadius: '20px',
                border: expandedSection === section.id 
                  ? `1px solid ${section.color}40`
                  : '1px solid rgba(255, 255, 255, 0.1)',
                overflow: 'hidden',
                transition: 'border-color 0.3s',
              }}
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: 'clamp(16px, 4vw, 24px)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{
                  background: `${section.color}20`,
                  borderRadius: '12px',
                  padding: '12px',
                  border: `1px solid ${section.color}40`,
                  flexShrink: 0,
                }}>
                  <section.icon size={22} color={section.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ 
                    color: '#F8FAFC', 
                    fontSize: 'clamp(16px, 4vw, 18px)', 
                    fontWeight: 600, 
                    margin: 0 
                  }}>
                    {section.title}
                  </h2>
                  <p style={{ 
                    color: '#64748B', 
                    fontSize: '13px', 
                    margin: '4px 0 0',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {section.description}
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: expandedSection === section.id ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ flexShrink: 0 }}
                >
                  <ChevronDown size={20} color="#64748B" />
                </motion.div>
              </button>

              {/* Section Content */}
              <AnimatePresence>
                {expandedSection === section.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ 
                      padding: '0 clamp(16px, 4vw, 24px) clamp(16px, 4vw, 24px)',
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '24px',
                        paddingTop: '20px'
                      }}>
                        {section.content.map((block, blockIndex) => (
                          <div 
                            key={blockIndex}
                            style={{
                              background: 'rgba(255, 255, 255, 0.02)',
                              borderRadius: '14px',
                              padding: '20px',
                              border: '1px solid rgba(255, 255, 255, 0.06)',
                            }}
                          >
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '10px', 
                              marginBottom: block.description ? '8px' : '14px' 
                            }}>
                              {block.icon && (
                                <div style={{
                                  background: `${block.iconColor || '#64748B'}15`,
                                  borderRadius: '8px',
                                  padding: '8px',
                                }}>
                                  <block.icon size={16} color={block.iconColor || '#64748B'} />
                                </div>
                              )}
                              <h3 style={{ 
                                color: '#E2E8F0', 
                                fontSize: '15px', 
                                fontWeight: 600, 
                                margin: 0 
                              }}>
                                {block.subtitle}
                              </h3>
                            </div>
                            
                            {block.description && (
                              <p style={{ 
                                color: '#94A3B8', 
                                fontSize: '13px', 
                                margin: '0 0 14px',
                                paddingLeft: block.icon ? '42px' : '0'
                              }}>
                                {block.description}
                              </p>
                            )}
                            
                            <ul style={{ 
                              margin: 0, 
                              paddingLeft: block.icon ? '62px' : '20px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px'
                            }}>
                              {block.items.map((item, itemIndex) => (
                                <li 
                                  key={itemIndex} 
                                  style={{ 
                                    color: '#94A3B8', 
                                    fontSize: '14px', 
                                    lineHeight: 1.6 
                                  }}
                                >
                                  {item}
                                </li>
                              ))}
                            </ul>

                            {block.tip && (
                              <div style={{
                                marginTop: '16px',
                                marginLeft: block.icon ? '42px' : '0',
                                background: 'rgba(59, 130, 246, 0.1)',
                                borderRadius: '10px',
                                padding: '12px 14px',
                                border: '1px solid rgba(59, 130, 246, 0.2)',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                              }}>
                                <Zap size={14} color="#3B82F6" style={{ marginTop: '2px', flexShrink: 0 }} />
                                <p style={{ 
                                  color: '#93C5FD', 
                                  fontSize: '13px', 
                                  margin: 0,
                                  lineHeight: 1.5
                                }}>
                                  {block.tip}
                                </p>
                              </div>
                            )}
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
 
       {/* Quick Reference Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
            borderRadius: '20px',
            padding: 'clamp(20px, 4vw, 28px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginTop: '32px',
          }}
        >
          <h3 style={{ 
            color: '#F8FAFC', 
            fontSize: '16px', 
            fontWeight: 600, 
            margin: '0 0 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Target size={18} color="#10B981" />
            Quick Reference
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px' 
          }}>
            {/* Status Colors */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              padding: '16px',
            }}>
              <p style={{ color: '#94A3B8', fontSize: '12px', margin: '0 0 12px', fontWeight: 500 }}>
                สีสถานะ
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10B981' }} />
                  <span style={{ color: '#CBD5E1', fontSize: '13px' }}>ปลอดภัย (0-49 PPM)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B' }} />
                  <span style={{ color: '#CBD5E1', fontSize: '13px' }}>เฝ้าระวัง (50-199 PPM)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444' }} />
                  <span style={{ color: '#CBD5E1', fontSize: '13px' }}>อันตราย (200+ PPM)</span>
                </div>
              </div>
            </div>

            {/* Shortcuts */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              padding: '16px',
            }}>
              <p style={{ color: '#94A3B8', fontSize: '12px', margin: '0 0 12px', fontWeight: 500 }}>
                การใช้งานด่วน
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Pin size={14} color="#3B82F6" />
                  <span style={{ color: '#CBD5E1', fontSize: '13px' }}>คลิก Pin เพื่อปักหมุด</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Eye size={14} color="#8B5CF6" />
                  <span style={{ color: '#CBD5E1', fontSize: '13px' }}>คลิกการ์ดเพื่อดูรายละเอียด</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Settings size={14} color="#64748B" />
                  <span style={{ color: '#CBD5E1', fontSize: '13px' }}>ตั้งค่าที่ปุ่มมุมขวาบน</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            textAlign: 'center',
            color: '#475569',
            fontSize: '13px',
            marginTop: '40px',
          }}
        >
          Smoke Detection System - User Guide v2.0
        </motion.p>
      </div>
    </div>
  );
};
