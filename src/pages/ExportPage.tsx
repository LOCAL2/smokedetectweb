import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileSpreadsheet,
  FileText,
  Download,
  Calendar,
  Clock,
  BarChart3,
  Activity,
  Bell,
} from 'lucide-react';
import { useSensorData } from '../hooks/useSensorData';
import { useSettingsContext } from '../context/SettingsContext';
import { useNotifications } from '../context/NotificationContext';
import {
  exportSensorsToCSV,
  exportHistoryToCSV,
  exportStatsToCSV,
  exportNotificationsToCSV,
  generatePDFReport,
} from '../utils/export';

export const ExportPage = () => {
  const navigate = useNavigate();
  const { settings } = useSettingsContext();
  const { sensors, history, sensorMaxValues } = useSensorData(settings);
  const { notifications } = useNotifications();

  const exportOptions = [
    {
      id: 'sensors-csv',
      title: 'ข้อมูลเซ็นเซอร์ปัจจุบัน',
      description: 'สถานะและค่าปัจจุบันของเซ็นเซอร์ทั้งหมด',
      icon: Activity,
      color: '#3B82F6',
      format: 'CSV',
      action: () => exportSensorsToCSV(sensors, 'sensors'),
    },
    {
      id: 'history-csv',
      title: 'ประวัติค่าควัน',
      description: 'ข้อมูลค่าควันย้อนหลัง 30 นาที',
      icon: Clock,
      color: '#8B5CF6',
      format: 'CSV',
      action: () => exportHistoryToCSV(history, 'smoke_history'),
    },
    {
      id: 'stats-csv',
      title: 'สถิติ 24 ชั่วโมง',
      description: 'ค่าสูงสุด ต่ำสุด และค่าเฉลี่ยของแต่ละเซ็นเซอร์',
      icon: BarChart3,
      color: '#10B981',
      format: 'CSV',
      action: () => exportStatsToCSV(sensorMaxValues, 'statistics'),
    },
    {
      id: 'alerts-csv',
      title: 'ประวัติการแจ้งเตือน',
      description: 'รายการแจ้งเตือนทั้งหมดที่บันทึกไว้',
      icon: Bell,
      color: '#EF4444',
      format: 'CSV',
      action: () => exportNotificationsToCSV(notifications, 'alerts'),
    },
    {
      id: 'report-pdf',
      title: 'รายงานสรุป',
      description: 'รายงานสถานะเซ็นเซอร์และสถิติ พร้อมพิมพ์',
      icon: FileText,
      color: '#F59E0B',
      format: 'PDF',
      action: () => generatePDFReport(sensors, sensorMaxValues),
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
        padding: 'clamp(16px, 4vw, 32px)',
      }}
    >
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 70% 30%, rgba(139, 92, 246, 0.06) 0%, transparent 50%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
        {}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '32px' }}
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
            }}
          >
            <ArrowLeft size={18} />
            กลับหน้าหลัก
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
                borderRadius: '16px',
                padding: '14px',
                border: '1px solid rgba(139, 92, 246, 0.3)',
              }}
            >
              <FileSpreadsheet size={28} color="#8B5CF6" />
            </div>
            <div>
              <h1
                style={{
                  color: '#F8FAFC',
                  fontSize: 'clamp(24px, 5vw, 32px)',
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                ส่งออกรายงาน
              </h1>
              <p style={{ color: '#64748B', fontSize: '14px', margin: '4px 0 0' }}>
                ดาวน์โหลดข้อมูลในรูปแบบ CSV หรือ PDF
              </p>
            </div>
          </div>
        </motion.div>

        {}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          {[
            { label: 'เซ็นเซอร์', value: sensors.length, icon: Activity, color: '#3B82F6' },
            { label: 'ประวัติ', value: history.length, icon: Clock, color: '#8B5CF6' },
            { label: 'สถิติ', value: sensorMaxValues.length, icon: BarChart3, color: '#10B981' },
            { label: 'แจ้งเตือน', value: notifications.length, icon: Bell, color: '#EF4444' },
          ].map((item, index) => (
            <div
              key={index}
              style={{
                background: 'rgba(30, 41, 59, 0.6)',
                borderRadius: '14px',
                padding: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  background: `${item.color}20`,
                  borderRadius: '10px',
                  padding: '10px',
                }}
              >
                <item.icon size={18} color={item.color} />
              </div>
              <div>
                <p style={{ color: '#64748B', fontSize: '12px', margin: 0 }}>{item.label}</p>
                <p style={{ color: '#F8FAFC', fontSize: '20px', fontWeight: 700, margin: 0 }}>
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
  
      {}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          {exportOptions.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + index * 0.05 }}
              style={{
                background: 'rgba(30, 41, 59, 0.6)',
                borderRadius: '16px',
                padding: '20px 24px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    background: `${option.color}20`,
                    borderRadius: '12px',
                    padding: '12px',
                  }}
                >
                  <option.icon size={22} color={option.color} />
                </div>
                <div>
                  <h3 style={{ color: '#F8FAFC', fontSize: '16px', fontWeight: 600, margin: 0 }}>
                    {option.title}
                  </h3>
                  <p style={{ color: '#64748B', fontSize: '13px', margin: '4px 0 0' }}>
                    {option.description}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={option.action}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  background: `${option.color}20`,
                  border: `1px solid ${option.color}40`,
                  borderRadius: '10px',
                  color: option.color,
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Download size={16} />
                {option.format}
              </motion.button>
            </motion.div>
          ))}
        </motion.div>

        {}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '14px',
            padding: '16px 20px',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            marginTop: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <Calendar size={18} color="#3B82F6" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <p style={{ color: '#93C5FD', fontSize: '14px', fontWeight: 500, margin: '0 0 4px' }}>
              หมายเหตุ
            </p>
            <p style={{ color: '#93C5FD', fontSize: '13px', margin: 0, opacity: 0.8 }}>
              ไฟล์ CSV สามารถเปิดด้วย Microsoft Excel, Google Sheets หรือโปรแกรมตารางคำนวณอื่นๆ
              รายงาน PDF จะเปิดหน้าต่างพิมพ์เพื่อบันทึกเป็นไฟล์ PDF
            </p>
          </div>
        </motion.div>

        {}
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
          Smoke Detection System - Export Center
        </motion.p>
      </div>
    </div>
  );
};
