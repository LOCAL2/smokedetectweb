import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Wrench, Rocket, Check, Calendar, Tag } from 'lucide-react';
import updatesData from '../data/updates.json';

type UpdateType = 'feature' | 'improvement' | 'release' | 'fix';

interface Update {
  version: string;
  date: string;
  title: string;
  type: UpdateType;
  changes: string[];
}

const typeConfig: Record<UpdateType, { color: string; icon: React.ElementType; label: string }> = {
  feature: { color: '#3B82F6', icon: Sparkles, label: 'ฟีเจอร์ใหม่' },
  improvement: { color: '#10B981', icon: Wrench, label: 'ปรับปรุง' },
  release: { color: '#8B5CF6', icon: Rocket, label: 'เปิดตัว' },
  fix: { color: '#F59E0B', icon: Wrench, label: 'แก้ไขบัก' },
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('th-TH', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

export const UpdatesPage = () => {
  const navigate = useNavigate();
  const updates: Update[] = updatesData.updates as Update[];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0B0F1A',
      padding: 'clamp(16px, 4vw, 24px)',
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px',
            paddingBottom: '20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          }}
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
              transition: 'all 0.2s',
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ color: '#F8FAFC', fontSize: 'clamp(20px, 5vw, 24px)', fontWeight: 600, margin: 0 }}>
              Changelog
            </h1>
            <p style={{ color: '#64748B', fontSize: '13px', margin: '4px 0 0' }}>
              Release Notes & Version History
            </p>
          </div>
        </motion.header>

        {/* Timeline */}
        <div style={{ position: 'relative' }}>
          {/* Timeline line */}
          <div style={{
            position: 'absolute',
            left: '15px',
            top: '0',
            bottom: '0',
            width: '2px',
            background: 'linear-gradient(180deg, #3B82F6 0%, #8B5CF6 50%, #10B981 100%)',
            opacity: 0.3,
          }} />

          {/* Updates */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {updates.map((update, index) => {
              const config = typeConfig[update.type] || typeConfig.feature;
              const Icon = config.icon;

              return (
                <motion.div
                  key={update.version}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    display: 'flex',
                    gap: '20px',
                  }}
                >
                  {/* Timeline dot */}
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: `${config.color}20`,
                    border: `2px solid ${config.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    zIndex: 1,
                  }}>
                    <Icon size={14} color={config.color} />
                  </div>

                  {/* Content */}
                  <div style={{
                    flex: 1,
                    background: 'rgba(30, 41, 59, 0.5)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    padding: '20px',
                    marginBottom: '8px',
                  }}>
                    {/* Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                      marginBottom: '16px',
                    }}>
                      <div>
                        <h3 style={{ 
                          color: '#F8FAFC', 
                          fontSize: '16px', 
                          fontWeight: 600, 
                          margin: '0 0 6px' 
                        }}>
                          {update.title}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Tag size={12} color="#64748B" />
                            <span style={{ color: '#94A3B8', fontSize: '12px' }}>v{update.version}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} color="#64748B" />
                            <span style={{ color: '#64748B', fontSize: '12px' }}>{formatDate(update.date)}</span>
                          </div>
                        </div>
                      </div>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: `${config.color}15`,
                        color: config.color,
                        fontSize: '11px',
                        fontWeight: 500,
                      }}>
                        {config.label}
                      </span>
                    </div>

                    {/* Changes */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {update.changes.map((change, i) => (
                        <div 
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            padding: '8px 12px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderRadius: '8px',
                          }}
                        >
                          <Check size={14} color={config.color} style={{ marginTop: '2px', flexShrink: 0 }} />
                          <span style={{ color: '#CBD5E1', fontSize: '13px', lineHeight: 1.5 }}>
                            {change}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            textAlign: 'center',
            marginTop: '40px',
            padding: '20px',
            color: '#64748B',
            fontSize: '12px',
          }}
        >
          <p style={{ margin: 0 }}>
            มีข้อเสนอแนะ? ติดต่อทีมพัฒนาได้เลย
          </p>
        </motion.div>
      </div>
    </div>
  );
};
