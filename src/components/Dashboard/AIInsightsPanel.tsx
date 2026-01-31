import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import type { AIInsight } from '../../utils/aiInsights';
import { useState } from 'react';

interface AIInsightsPanelProps {
  insights: AIInsight[];
  summary: string;
  isLoading?: boolean;
  onDismiss?: (insightId: string) => void;
}

export const AIInsightsPanel = ({ insights, isLoading, onDismiss }: AIInsightsPanelProps) => {
  const { isDark } = useTheme();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const cardBg = isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.9)';
  const borderColor = isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)';
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const textSecondary = isDark ? '#94A3B8' : '#64748B';

  const getTypeConfig = (type: AIInsight['type']) => {
    switch (type) {
      case 'danger':
        return { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', icon: AlertTriangle };
      case 'warning':
        return { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', icon: TrendingUp };
      case 'success':
        return { color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', icon: CheckCircle };
      default:
        return { color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)', icon: Info };
    }
  };

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set([...prev, id]));
    onDismiss?.(id);
  };

  const visibleInsights = insights.filter(i => !dismissedIds.has(i.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: cardBg,
        borderRadius: '20px',
        overflow: 'hidden',
        border: `1px solid ${borderColor}`,
        backdropFilter: 'blur(10px)',
        boxShadow: isDark 
          ? '0 10px 40px rgba(0, 0, 0, 0.3)' 
          : '0 10px 40px rgba(0, 0, 0, 0.08)',
      }}
    >
      {}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '20px 24px',
        background: isDark 
          ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)'
          : 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(99, 102, 241, 0.05) 100%)',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
        }}>
          <Brain size={20} color="#FFF" />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            color: textColor, 
            fontSize: '18px', 
            fontWeight: 700, 
            margin: 0,
            letterSpacing: '-0.01em',
          }}>
            AI Insights & Predictions
          </h3>
          <p style={{ 
            color: textSecondary, 
            fontSize: '13px', 
            margin: 0,
            marginTop: '2px',
          }}>
            {isLoading ? 'AI กำลังวิเคราะห์ข้อมูล...' : 'การวิเคราะห์และพยากรณ์แบบ Real-time'}
          </p>
        </div>
        {isLoading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{
              width: '20px',
              height: '20px',
              border: '3px solid',
              borderColor: `${isDark ? '#8B5CF6' : '#6366F1'} transparent transparent transparent`,
              borderRadius: '50%',
            }}
          />
        )}
      </div>

      {}
      <div style={{ padding: '16px', maxHeight: '500px', overflowY: 'auto' }}>
        {visibleInsights.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: 'center',
              padding: '40px 24px',
            }}
          >
            <CheckCircle 
              size={48} 
              style={{ 
                margin: '0 auto 16px', 
                opacity: 0.3,
                color: '#10B981',
              }} 
            />
            <p style={{ 
              margin: 0, 
              color: textSecondary,
              fontSize: '15px',
              fontWeight: 500,
            }}>
              ไม่มีการแจ้งเตือนในขณะนี้
            </p>
            <p style={{ 
              margin: '8px 0 0', 
              color: textSecondary,
              fontSize: '13px',
              opacity: 0.7,
            }}>
              ระบบกำลังตรวจสอบและวิเคราะห์ข้อมูลอย่างต่อเนื่อง
            </p>
          </motion.div>
        ) : (
          visibleInsights.map((insight) => {
            const config = getTypeConfig(insight.type);
            const Icon = config.icon;

            return (
              <div
                key={insight.id}
                style={{
                  background: config.bg,
                  border: `1px solid ${config.color}30`,
                  borderRadius: '14px',
                  padding: '16px',
                  marginBottom: '12px',
                  position: 'relative',
                }}
              >
                {}
                <button
                  onClick={() => handleDismiss(insight.id)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '8px',
                    background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.8)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    opacity: 0.6,
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                >
                  <X size={14} color={textSecondary} />
                </button>

                <div style={{ display: 'flex', gap: '12px', paddingRight: '32px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: config.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: `0 4px 12px ${config.color}40`,
                  }}>
                    <Icon size={22} color="#FFF" />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{
                      color: textColor,
                      fontSize: '15px',
                      fontWeight: 600,
                      margin: '0 0 6px',
                    }}>
                      {insight.title}
                    </h4>
                    <p style={{
                      color: textSecondary,
                      fontSize: '13px',
                      margin: '0 0 10px',
                      lineHeight: 1.6,
                    }}>
                      {insight.message}
                    </p>

                    {insight.action && (
                      <div style={{
                        display: 'inline-block',
                        padding: '6px 12px',
                        background: config.color,
                        color: '#FFF',
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: '8px',
                        boxShadow: `0 2px 8px ${config.color}40`,
                      }}>
                        💡 {insight.action}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};
