import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Clock, AlertTriangle } from 'lucide-react';
import { useTrendAnalysis } from '../../hooks/useTrendAnalysis';
import { useTheme } from '../../context/ThemeContext';
import type { SensorHistory } from '../../types/sensor';

interface TrendAnalysisPanelProps {
    history: SensorHistory[];
    delay?: number;
}

export const TrendAnalysisPanel = ({ history, delay = 0 }: TrendAnalysisPanelProps) => {
    const { isDark } = useTheme();
    const { trend, trendValue, peakTime, prediction } = useTrendAnalysis(history);

    const cardBg = isDark
        ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)'
        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(241, 245, 249, 0.9) 100%)';

    const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? '#F8FAFC' : '#0F172A';
    const textSecondary = isDark ? '#94A3B8' : '#64748B';

    const getTrendIcon = () => {
        switch (trend) {
            case 'rising': return <TrendingUp size={24} color="#EF4444" />;
            case 'falling': return <TrendingDown size={24} color="#10B981" />;
            default: return <Minus size={24} color="#3B82F6" />;
        }
    };

    const getTrendColor = () => {
        switch (trend) {
            case 'rising': return '#EF4444';
            case 'falling': return '#10B981';
            default: return '#3B82F6';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            style={{
                background: cardBg,
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '24px',
                border: `1px solid ${borderColor}`,
                boxShadow: isDark ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{
                    padding: 10,
                    borderRadius: 12,
                    background: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <TrendingUp size={20} color="#3B82F6" />
                </div>
                <div>
                    <h3 style={{ color: textColor, fontSize: 16, fontWeight: 600, margin: 0 }}>วิเคราะห์แนวโน้ม</h3>
                    <p style={{ color: textSecondary, fontSize: 12, margin: 0 }}>Smart Trend Analysis</p>
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    borderRadius: 16
                }}>
                    <div>
                        <span style={{ color: textSecondary, fontSize: 13 }}>สถานะปัจจุบัน</span>
                        <div style={{ color: getTrendColor(), fontSize: 18, fontWeight: 600, marginTop: 4 }}>
                            {trend === 'rising' ? 'กำลังเพิ่มขึ้น' : trend === 'falling' ? 'กำลังลดลง' : 'คงที่'}
                        </div>
                    </div>
                    <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isDark ? 'none' : '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                        {getTrendIcon()}
                    </div>
                </div>

                {}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{ padding: 12, borderRadius: 12, border: `1px solid ${borderColor}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <AlertTriangle size={14} color={textSecondary} />
                            <span style={{ color: textSecondary, fontSize: 12 }}>การเปลี่ยนแปลง</span>
                        </div>
                        <span style={{ color: textColor, fontSize: 16, fontWeight: 600 }}>
                            {trendValue.toFixed(1)}%
                        </span>
                    </div>
                    <div style={{ padding: 12, borderRadius: 12, border: `1px solid ${borderColor}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <Clock size={14} color={textSecondary} />
                            <span style={{ color: textSecondary, fontSize: 12 }}>ช่วงพีคสูงสุด</span>
                        </div>
                        <span style={{ color: textColor, fontSize: 16, fontWeight: 600 }}>
                            {peakTime || '-'}
                        </span>
                    </div>
                </div>

                {}
                <div style={{
                    marginTop: 'auto',
                    padding: 12,
                    borderRadius: 12,
                    background: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
                    border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)'}`
                }}>
                    <div style={{ color: '#10B981', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                        ✨ AI Insight
                    </div>
                    <p style={{ color: isDark ? '#D1FAE5' : '#065F46', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                        {prediction}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};
