import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  Trash2,
  CheckCheck,
  AlertTriangle,
  AlertCircle,
  Info,
  Download,
  Filter,
  Calendar,
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { exportNotificationsToCSV } from '../utils/export';

type FilterType = 'all' | 'danger' | 'warning' | 'info' | 'unread';

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, clearOld } =
    useNotifications();
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.isRead;
    return n.type === filter;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'danger':
        return <AlertTriangle size={18} color="#EF4444" />;
      case 'warning':
        return <AlertCircle size={18} color="#F59E0B" />;
      default:
        return <Info size={18} color="#3B82F6" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'danger':
        return { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)' };
      case 'warning':
        return { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)' };
      default:
        return { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)' };
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'เมื่อสักครู่';
    if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
    if (days < 7) return `${days} วันที่แล้ว`;
    return date.toLocaleDateString('th-TH');
  };

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
          background: 'radial-gradient(circle at 30% 20%, rgba(239, 68, 68, 0.06) 0%, transparent 50%)',
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
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)',
                borderRadius: '16px',
                padding: '14px',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                position: 'relative',
              }}
            >
              <Bell size={28} color="#EF4444" />
              {unreadCount > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#EF4444',
                    color: '#FFF',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: '10px',
                    minWidth: '18px',
                    textAlign: 'center',
                  }}
                >
                  {unreadCount}
                </div>
              )}
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
                ประวัติการแจ้งเตือน
              </h1>
              <p style={{ color: '#64748B', fontSize: '14px', margin: '4px 0 0' }}>
                {notifications.length} รายการ ({unreadCount} ยังไม่อ่าน)
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
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          {}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(['all', 'unread', 'danger', 'warning'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '8px 16px',
                  background: filter === f ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: filter === f ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: filter === f ? '#60A5FA' : '#94A3B8',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Filter size={14} />
                {f === 'all' ? 'ทั้งหมด' : f === 'unread' ? 'ยังไม่อ่าน' : f === 'danger' ? 'อันตราย' : 'เฝ้าระวัง'}
              </button>
            ))}
          </div>

          {}
          <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              style={{
                padding: '8px 16px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                color: '#10B981',
                fontSize: '13px',
                cursor: unreadCount === 0 ? 'default' : 'pointer',
                opacity: unreadCount === 0 ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <CheckCheck size={14} />
              อ่านทั้งหมด
            </button>
            <button
              onClick={() => exportNotificationsToCSV(notifications)}
              disabled={notifications.length === 0}
              style={{
                padding: '8px 16px',
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '8px',
                color: '#8B5CF6',
                fontSize: '13px',
                cursor: notifications.length === 0 ? 'default' : 'pointer',
                opacity: notifications.length === 0 ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Download size={14} />
              Export
            </button>
            <button
              onClick={() => clearOld(7)}
              style={{
                padding: '8px 16px',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '8px',
                color: '#F59E0B',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Calendar size={14} />
              ลบเก่ากว่า 7 วัน
            </button>
            <button
              onClick={clearAll}
              disabled={notifications.length === 0}
              style={{
                padding: '8px 16px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#EF4444',
                fontSize: '13px',
                cursor: notifications.length === 0 ? 'default' : 'pointer',
                opacity: notifications.length === 0 ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Trash2 size={14} />
              ลบทั้งหมด
            </button>
          </div>
        </motion.div>
 
       {}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
        >
          {filteredNotifications.length === 0 ? (
            <div
              style={{
                background: 'rgba(30, 41, 59, 0.6)',
                borderRadius: '16px',
                padding: '60px 20px',
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Bell size={48} color="#475569" style={{ marginBottom: '16px' }} />
              <h3 style={{ color: '#94A3B8', fontSize: '16px', margin: '0 0 8px' }}>
                ไม่มีการแจ้งเตือน
              </h3>
              <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
                {filter === 'all'
                  ? 'ยังไม่มีประวัติการแจ้งเตือน'
                  : 'ไม่พบรายการที่ตรงกับตัวกรอง'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification, index) => {
              const colors = getTypeColor(notification.type);
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => markAsRead(notification.id)}
                  style={{
                    background: notification.isRead ? 'rgba(30, 41, 59, 0.4)' : colors.bg,
                    borderRadius: '14px',
                    padding: '16px 20px',
                    border: `1px solid ${notification.isRead ? 'rgba(255, 255, 255, 0.08)' : colors.border}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    opacity: notification.isRead ? 0.7 : 1,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div
                      style={{
                        background: colors.bg,
                        borderRadius: '10px',
                        padding: '10px',
                        flexShrink: 0,
                      }}
                    >
                      {getIcon(notification.type)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          marginBottom: '6px',
                        }}
                      >
                        <h4
                          style={{
                            color: '#F8FAFC',
                            fontSize: '15px',
                            fontWeight: 600,
                            margin: 0,
                          }}
                        >
                          {notification.sensorName}
                        </h4>
                        <span style={{ color: '#64748B', fontSize: '12px', flexShrink: 0 }}>
                          {formatTime(notification.timestamp)}
                        </span>
                      </div>
                      <p style={{ color: '#94A3B8', fontSize: '13px', margin: '0 0 8px' }}>
                        {notification.location}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span
                          style={{
                            color: notification.type === 'danger' ? '#EF4444' : '#F59E0B',
                            fontSize: '18px',
                            fontWeight: 700,
                          }}
                        >
                          {notification.value} PPM
                        </span>
                        <span style={{ color: '#64748B', fontSize: '13px' }}>
                          {notification.message}
                        </span>
                      </div>
                    </div>
                    {!notification.isRead && (
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#3B82F6',
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>

        {}
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
          Smoke Detection System - Notification History
        </motion.p>
      </div>
    </div>
  );
};
