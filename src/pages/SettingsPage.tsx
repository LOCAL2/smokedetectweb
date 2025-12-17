import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import {
  ArrowLeft,
  RotateCcw,
  AlertTriangle,
  Shield,
  Skull,
  Clock,
  Bell,
  Volume2,
  Plus,
  Trash2,
  Server,
  MapPin,
} from 'lucide-react';
import type { ApiEndpoint } from '../hooks/useSettings';
import { useSettingsContext } from '../context/SettingsContext';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, resetSettings } = useSettingsContext();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
      padding: '32px',
    }}>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 30% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(59, 130, 246, 0.06) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '40px',
            paddingBottom: '24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '12px',
              color: '#F8FAFC',
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <ArrowLeft size={22} />
          </motion.button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
            <div>
              <h1 style={{ color: '#F8FAFC', fontSize: '28px', fontWeight: 700, margin: 0 }}>
                ตั้งค่าระบบ
              </h1>
              <p style={{ color: '#64748B', fontSize: '14px', margin: '4px 0 0' }}>
                ปรับแต่งค่าเซ็นเซอร์และการแจ้งเตือน (บันทึกอัตโนมัติ)
              </p>
            </div>
          </div>
        </motion.header>

        {/* Threshold Settings Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '24px',
          }}
        >
          <h2 style={{ 
            color: '#F8FAFC', 
            fontSize: '20px', 
            fontWeight: 600, 
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertTriangle size={22} color="#F59E0B" />
            ระดับค่าควัน (PPM)
          </h2>
          <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '32px' }}>
            กำหนดค่าที่จะแสดงสถานะเฝ้าระวังและอันตราย
          </p>

          {/* Warning Threshold */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ 
                background: 'rgba(245, 158, 11, 0.2)', 
                borderRadius: '12px', 
                padding: '12px',
                border: '1px solid rgba(245, 158, 11, 0.3)'
              }}>
                <AlertTriangle size={24} color="#F59E0B" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ color: '#F8FAFC', fontSize: '16px', fontWeight: 600 }}>
                  ระดับเฝ้าระวัง
                </label>
                <p style={{ color: '#64748B', fontSize: '13px', margin: '4px 0 0' }}>
                  ค่าตั้งแต่นี้จะแสดงสถานะสีเหลือง
                </p>
              </div>
              <div style={{
                background: 'rgba(245, 158, 11, 0.15)',
                borderRadius: '12px',
                padding: '8px 16px',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'center',
              }}>
                <input
                  type="text"
                  inputMode="numeric"
                  value={settings.warningThreshold}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    updateSettings({ warningThreshold: val === '' ? ('' as any) : Number(val) });
                  }}
                  onBlur={(e) => {
                    let val = Number(e.target.value) || 10;
                    val = Math.max(10, Math.min(val, settings.dangerThreshold - 10));
                    updateSettings({ warningThreshold: val });
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#F59E0B',
                    fontSize: '28px',
                    fontWeight: 700,
                    width: '80px',
                    textAlign: 'right',
                    outline: 'none',
                  }}
                />
                <span style={{ color: '#F59E0B', fontSize: '14px', marginLeft: '4px' }}>PPM</span>
              </div>
            </div>
            <input
              type="range"
              min="10"
              max="2000"
              value={Math.min(settings.warningThreshold || 10, settings.dangerThreshold - 10)}
              onChange={(e) => updateSettings({ 
                warningThreshold: Math.min(Number(e.target.value), settings.dangerThreshold - 10)
              })}
              style={{
                width: '100%',
                height: '12px',
                borderRadius: '6px',
                background: `linear-gradient(to right, #F59E0B 0%, #F59E0B ${(((settings.warningThreshold || 10) - 10) / (2000 - 10)) * 100}%, rgba(255,255,255,0.1) ${(((settings.warningThreshold || 10) - 10) / (2000 - 10)) * 100}%, rgba(255,255,255,0.1) 100%)`,
                cursor: 'pointer',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <span style={{ color: '#64748B', fontSize: '12px' }}>10 PPM</span>
              <span style={{ color: '#64748B', fontSize: '12px' }}>2000 PPM</span>
            </div>
          </div>

          {/* Danger Threshold */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ 
                background: 'rgba(239, 68, 68, 0.2)', 
                borderRadius: '12px', 
                padding: '12px',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}>
                <Skull size={24} color="#EF4444" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ color: '#F8FAFC', fontSize: '16px', fontWeight: 600 }}>
                  ระดับอันตราย
                </label>
                <p style={{ color: '#64748B', fontSize: '13px', margin: '4px 0 0' }}>
                  ค่าตั้งแต่นี้จะแสดงสถานะสีแดงและแจ้งเตือน
                </p>
              </div>
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                borderRadius: '12px',
                padding: '8px 16px',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                display: 'flex',
                alignItems: 'center',
              }}>
                <input
                  type="text"
                  inputMode="numeric"
                  value={settings.dangerThreshold}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    updateSettings({ dangerThreshold: val === '' ? ('' as any) : Number(val) });
                  }}
                  onBlur={(e) => {
                    let val = Number(e.target.value) || 50;
                    val = Math.max(settings.warningThreshold + 10, Math.min(val, 4095));
                    updateSettings({ dangerThreshold: val });
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#EF4444',
                    fontSize: '28px',
                    fontWeight: 700,
                    width: '80px',
                    textAlign: 'right',
                    outline: 'none',
                  }}
                />
                <span style={{ color: '#EF4444', fontSize: '14px', marginLeft: '4px' }}>PPM</span>
              </div>
            </div>
            <input
              type="range"
              min="50"
              max="4095"
              value={Math.max(settings.dangerThreshold || 50, settings.warningThreshold + 10)}
              onChange={(e) => updateSettings({ 
                dangerThreshold: Math.max(Number(e.target.value), settings.warningThreshold + 10)
              })}
              style={{
                width: '100%',
                height: '12px',
                borderRadius: '6px',
                background: `linear-gradient(to right, #EF4444 0%, #EF4444 ${(((settings.dangerThreshold || 50) - 50) / (4095 - 50)) * 100}%, rgba(255,255,255,0.1) ${(((settings.dangerThreshold || 50) - 50) / (4095 - 50)) * 100}%, rgba(255,255,255,0.1) 100%)`,
                cursor: 'pointer',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <span style={{ color: '#64748B', fontSize: '12px' }}>50 PPM</span>
              <span style={{ color: '#64748B', fontSize: '12px' }}>4095 PPM</span>
            </div>
          </div>

          {/* Preview */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '16px',
            padding: '24px',
          }}>
            <p style={{ color: '#94A3B8', fontSize: '14px', marginBottom: '16px', fontWeight: 500 }}>
              ตัวอย่างระดับที่ตั้งค่า:
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ 
                flex: 1, 
                textAlign: 'center', 
                padding: '20px', 
                background: 'rgba(16, 185, 129, 0.15)', 
                borderRadius: '16px', 
                border: '1px solid rgba(16, 185, 129, 0.3)' 
              }}>
                <Shield size={32} color="#10B981" style={{ marginBottom: '8px' }} />
                <p style={{ color: '#10B981', fontSize: '16px', fontWeight: 600, margin: '0 0 4px' }}>ปลอดภัย</p>
                <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>0 - {(settings.warningThreshold || 10) - 1} PPM</p>
              </div>
              <div style={{ 
                flex: 1, 
                textAlign: 'center', 
                padding: '20px', 
                background: 'rgba(245, 158, 11, 0.15)', 
                borderRadius: '16px', 
                border: '1px solid rgba(245, 158, 11, 0.3)' 
              }}>
                <AlertTriangle size={32} color="#F59E0B" style={{ marginBottom: '8px' }} />
                <p style={{ color: '#F59E0B', fontSize: '16px', fontWeight: 600, margin: '0 0 4px' }}>เฝ้าระวัง</p>
                <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>{settings.warningThreshold || 10} - {(settings.dangerThreshold || 50) - 1} PPM</p>
              </div>
              <div style={{ 
                flex: 1, 
                textAlign: 'center', 
                padding: '20px', 
                background: 'rgba(239, 68, 68, 0.15)', 
                borderRadius: '16px', 
                border: '1px solid rgba(239, 68, 68, 0.3)' 
              }}>
                <Skull size={32} color="#EF4444" style={{ marginBottom: '8px' }} />
                <p style={{ color: '#EF4444', fontSize: '16px', fontWeight: 600, margin: '0 0 4px' }}>อันตราย</p>
                <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>{settings.dangerThreshold || 50}+ PPM</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Polling Interval Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '24px',
          }}
        >
          <h2 style={{ 
            color: '#F8FAFC', 
            fontSize: '20px', 
            fontWeight: 600, 
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Clock size={22} color="#3B82F6" />
            การอัพเดทข้อมูล
          </h2>
          <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '32px' }}>
            กำหนดความถี่ในการดึงข้อมูลจากเซ็นเซอร์
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ 
              background: 'rgba(59, 130, 246, 0.2)', 
              borderRadius: '12px', 
              padding: '12px',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              <Clock size={24} color="#3B82F6" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ color: '#F8FAFC', fontSize: '16px', fontWeight: 600 }}>
                ความถี่รีเฟรช
              </label>
              <p style={{ color: '#64748B', fontSize: '13px', margin: '4px 0 0' }}>
                ระบบจะดึงข้อมูลใหม่ทุกๆ ช่วงเวลาที่กำหนด
              </p>
            </div>
            <div style={{
              background: 'rgba(59, 130, 246, 0.15)',
              borderRadius: '12px',
              padding: '12px 24px',
              border: '1px solid rgba(59, 130, 246, 0.3)',
            }}>
              <span style={{ color: '#3B82F6', fontSize: '28px', fontWeight: 700 }}>
                {settings.pollingInterval / 1000}
              </span>
              <span style={{ color: '#3B82F6', fontSize: '14px', marginLeft: '4px' }}>วินาที</span>
            </div>
          </div>
          <input
            type="range"
            min="1000"
            max="30000"
            step="1000"
            value={settings.pollingInterval}
            onChange={(e) => updateSettings({ pollingInterval: Number(e.target.value) })}
            style={{
              width: '100%',
              height: '12px',
              borderRadius: '6px',
              background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((settings.pollingInterval - 1000) / (30000 - 1000)) * 100}%, rgba(255,255,255,0.1) ${((settings.pollingInterval - 1000) / (30000 - 1000)) * 100}%, rgba(255,255,255,0.1) 100%)`,
              cursor: 'pointer',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            <span style={{ color: '#64748B', fontSize: '12px' }}>1 วินาที (เร็ว)</span>
            <span style={{ color: '#64748B', fontSize: '12px' }}>30 วินาที (ประหยัด)</span>
          </div>
        </motion.section>

        {/* Alert Settings Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '32px',
          }}
        >
          <h2 style={{ 
            color: '#F8FAFC', 
            fontSize: '20px', 
            fontWeight: 600, 
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Bell size={22} color="#10B981" />
            การแจ้งเตือน
          </h2>
          <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '32px' }}>
            ตั้งค่าการแจ้งเตือนเมื่อตรวจพบค่าผิดปกติ
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Sound Alert Toggle */}
            <div
              onClick={() => updateSettings({ enableSoundAlert: !settings.enableSoundAlert })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '20px',
                background: settings.enableSoundAlert ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                borderRadius: '16px',
                border: settings.enableSoundAlert ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{
                background: settings.enableSoundAlert ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '12px',
              }}>
                <Volume2 size={24} color={settings.enableSoundAlert ? '#10B981' : '#64748B'} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#F8FAFC', fontSize: '16px', fontWeight: 600, margin: 0 }}>
                  เสียงแจ้งเตือน
                </p>
                <p style={{ color: '#64748B', fontSize: '13px', margin: '4px 0 0' }}>
                  เล่นเสียงเมื่อตรวจพบค่าอันตราย
                </p>
              </div>
              <div style={{
                width: '56px',
                height: '32px',
                borderRadius: '16px',
                background: settings.enableSoundAlert ? '#10B981' : 'rgba(255, 255, 255, 0.1)',
                position: 'relative',
                transition: 'background 0.2s',
              }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '13px',
                  background: '#FFF',
                  position: 'absolute',
                  top: '3px',
                  left: settings.enableSoundAlert ? '27px' : '3px',
                  transition: 'left 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }} />
              </div>
            </div>

            {/* Browser Notification Toggle */}
            <div
              onClick={() => updateSettings({ enableNotification: !settings.enableNotification })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '20px',
                background: settings.enableNotification ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                borderRadius: '16px',
                border: settings.enableNotification ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{
                background: settings.enableNotification ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '12px',
              }}>
                <Bell size={24} color={settings.enableNotification ? '#10B981' : '#64748B'} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#F8FAFC', fontSize: '16px', fontWeight: 600, margin: 0 }}>
                  การแจ้งเตือนเบราว์เซอร์
                </p>
                <p style={{ color: '#64748B', fontSize: '13px', margin: '4px 0 0' }}>
                  แสดง notification บนหน้าจอ
                </p>
              </div>
              <div style={{
                width: '56px',
                height: '32px',
                borderRadius: '16px',
                background: settings.enableNotification ? '#10B981' : 'rgba(255, 255, 255, 0.1)',
                position: 'relative',
                transition: 'background 0.2s',
              }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '13px',
                  background: '#FFF',
                  position: 'absolute',
                  top: '3px',
                  left: settings.enableNotification ? '27px' : '3px',
                  transition: 'left 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }} />
              </div>
            </div>
          </div>
        </motion.section>

        {/* API Endpoints Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '32px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h2 style={{ 
                color: '#F8FAFC', 
                fontSize: '20px', 
                fontWeight: 600, 
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Server size={22} color="#8B5CF6" />
                API Endpoints
              </h2>
              <p style={{ color: '#64748B', fontSize: '14px' }}>
                จัดการ API สำหรับดึงข้อมูลจากหลายสถานที่
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const newEndpoint: ApiEndpoint = {
                  id: `endpoint-${Date.now()}`,
                  name: `สถานที่ ${(settings.apiEndpoints?.length || 0) + 1}`,
                  url: '',
                  apiKey: '',
                  enabled: true,
                };
                updateSettings({ apiEndpoints: [...(settings.apiEndpoints || []), newEndpoint] });
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#FFF',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <Plus size={18} />
              เพิ่ม API
            </motion.button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(!settings.apiEndpoints || settings.apiEndpoints.length === 0) ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '16px',
                border: '1px dashed rgba(255, 255, 255, 0.1)',
              }}>
                <Server size={40} color="#64748B" style={{ marginBottom: '12px' }} />
                <p style={{ color: '#64748B', fontSize: '14px' }}>
                  ยังไม่มี API endpoint<br />
                  กดปุ่ม "เพิ่ม API" เพื่อเริ่มต้น
                </p>
              </div>
            ) : (
              settings.apiEndpoints.map((endpoint, index) => (
                <div
                  key={endpoint.id}
                  style={{
                    padding: '20px',
                    background: endpoint.enabled ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '16px',
                    border: endpoint.enabled ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <MapPin size={20} color={endpoint.enabled ? '#8B5CF6' : '#64748B'} />
                      <input
                        type="text"
                        value={endpoint.name}
                        onChange={(e) => {
                          const updated = [...settings.apiEndpoints];
                          updated[index] = { ...endpoint, name: e.target.value };
                          updateSettings({ apiEndpoints: updated });
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#F8FAFC',
                          fontSize: '16px',
                          fontWeight: 600,
                          outline: 'none',
                          width: '200px',
                        }}
                        placeholder="ชื่อสถานที่"
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {/* Enable Toggle */}
                      <div
                        onClick={() => {
                          const updated = [...settings.apiEndpoints];
                          updated[index] = { ...endpoint, enabled: !endpoint.enabled };
                          updateSettings({ apiEndpoints: updated });
                        }}
                        style={{
                          width: '48px',
                          height: '26px',
                          borderRadius: '13px',
                          background: endpoint.enabled ? '#8B5CF6' : 'rgba(255, 255, 255, 0.1)',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                        }}
                      >
                        <div style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '11px',
                          background: '#FFF',
                          position: 'absolute',
                          top: '2px',
                          left: endpoint.enabled ? '24px' : '2px',
                          transition: 'left 0.2s',
                        }} />
                      </div>
                      {/* Delete Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          const updated = settings.apiEndpoints.filter((_, i) => i !== index);
                          updateSettings({ apiEndpoints: updated });
                        }}
                        style={{
                          background: 'rgba(239, 68, 68, 0.2)',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                        }}
                      >
                        <Trash2 size={16} color="#EF4444" />
                      </motion.button>
                    </div>
                  </div>
                  
                  <input
                    type="text"
                    value={endpoint.url}
                    onChange={(e) => {
                      const updated = [...settings.apiEndpoints];
                      updated[index] = { ...endpoint, url: e.target.value };
                      updateSettings({ apiEndpoints: updated });
                    }}
                    placeholder="URL เต็ม (เช่น http://localhost:3000/api/sensor/1)"
                    style={{
                      background: 'rgba(0, 0, 0, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      color: '#F8FAFC',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
              ))
            )}
          </div>
        </motion.section>

        {/* Reset Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={resetSettings}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '18px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              color: '#94A3B8',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={20} />
            รีเซ็ตค่าเริ่มต้น
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              localStorage.removeItem('smoke-sensor-history');
              localStorage.removeItem('smoke-sensor-max-values');
              localStorage.removeItem('smoke-sensor-individual-history');
              window.location.reload();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '18px',
              marginTop: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '16px',
              color: '#EF4444',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Trash2 size={20} />
            ล้างข้อมูลประวัติทั้งหมด
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};
