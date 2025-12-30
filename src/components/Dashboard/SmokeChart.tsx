import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { SensorHistory } from '../../types/sensor';
import type { SettingsConfig } from '../../hooks/useSettings';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

interface SensorHistoryMap {
  [sensorId: string]: SensorHistory[];
}

interface SmokeChartProps {
  data: SensorHistory[];
  sensorHistory: SensorHistoryMap;
  settings: SettingsConfig;
  initialViewMode?: 'average' | 'individual' | 'pinned';
  initialFullscreen?: boolean;
}

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

export const SmokeChart = ({ data, sensorHistory, settings, initialViewMode = 'individual', initialFullscreen = false }: SmokeChartProps) => {
  const chartRef = useRef<ChartJS<'line'>>(null);
  const [viewMode, setViewMode] = useState<'average' | 'individual' | 'pinned'>(initialViewMode);
  const [isFullscreen, setIsFullscreen] = useState(initialFullscreen);

  // Get unique sensors from history
  const sensorIds = Object.keys(sensorHistory);
  const pinnedSensors = settings.pinnedSensors || [];
  
  // Prepare data based on view mode
  const prepareChartData = () => {
    if (viewMode === 'average') {
      const labels = data.map(item => 
        new Date(item.timestamp).toLocaleTimeString('th-TH', { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        })
      );
      const values = data.map(item => item.value);

      return {
        labels,
        datasets: [{
          label: 'ค่าเฉลี่ย (PPM)',
          data: values,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#3B82F6',
          pointBorderColor: '#1E293B',
          pointBorderWidth: 2,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: '#3B82F6',
          pointHoverBorderColor: '#FFF',
          pointHoverBorderWidth: 2,
          borderWidth: 2.5,
        }],
      };
    }

    // Individual or Pinned sensor view
    const displaySensorIds = viewMode === 'pinned' 
      ? sensorIds.filter(id => pinnedSensors.includes(id))
      : sensorIds;

    // Find all unique timestamps
    const allTimestamps = new Set<string>();
    displaySensorIds.forEach(id => {
      sensorHistory[id]?.forEach(h => allTimestamps.add(h.timestamp));
    });
    
    const sortedTimestamps = Array.from(allTimestamps).sort();
    
    const labels = sortedTimestamps.map(ts => 
      new Date(ts).toLocaleTimeString('th-TH', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
      })
    );

    const datasets = displaySensorIds.slice(0, 10).map((sensorId, index) => {
      const sensorData = sensorHistory[sensorId] || [];
      const displayName = sensorData[0]?.location || sensorData[0]?.sensorName || sensorId;
      
      // Map values to timestamps
      const valueMap = new Map<string, number>();
      sensorData.forEach(h => valueMap.set(h.timestamp, h.value));
      
      const values = sortedTimestamps.map(ts => valueMap.get(ts) ?? null);
      const color = COLORS[index % COLORS.length];
      
      return {
        label: displayName,
        data: values,
        borderColor: color,
        backgroundColor: `${color}15`,
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: color,
        pointBorderColor: '#1E293B',
        pointBorderWidth: 2,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: '#FFF',
        pointHoverBorderWidth: 2,
        borderWidth: 2.5,
        spanGaps: true,
      };
    });

    return { labels, datasets };
  };

  const chartData = prepareChartData();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
      easing: 'easeInOutQuart' as const,
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: viewMode !== 'average',
        position: 'bottom' as const,
        labels: {
          color: '#94A3B8',
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: { size: 12, weight: 500 as const },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#F8FAFC',
        titleFont: { size: 13, weight: 600 as const },
        bodyColor: '#94A3B8',
        bodyFont: { size: 12 },
        padding: 14,
        cornerRadius: 12,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        displayColors: true,
        boxWidth: 8,
        boxHeight: 8,
        boxPadding: 4,
        usePointStyle: true,
        callbacks: {
          title: (items: any) => `🕐 ${items[0]?.label || ''}`,
          label: (item: any) => {
            const value = item.raw;
            let status = '🟢';
            if (value >= settings.dangerThreshold) status = '🔴';
            else if (value >= settings.warningThreshold) status = '🟡';
            return ` ${item.dataset.label}: ${value} PPM ${status}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { 
          display: true,
          color: 'rgba(255, 255, 255, 0.03)',
          drawTicks: false,
        },
        ticks: {
          color: '#64748B',
          font: { size: 11 },
          maxTicksLimit: 6,
          padding: 8,
        },
        border: { display: false },
      },
      y: {
        min: 0,
        grid: { 
          color: 'rgba(255, 255, 255, 0.05)',
          drawTicks: false,
        },
        ticks: {
          color: '#64748B',
          font: { size: 11 },
          padding: 12,
          callback: (value: any) => `${value}`,
        },
        border: { display: false },
      },
    },
  };

  const thresholdPlugin = {
    id: 'thresholdLines',
    afterDraw: (chart: any) => {
      const ctx = chart.ctx;
      const yAxis = chart.scales.y;
      const xAxis = chart.scales.x;

      // Warning line
      const warningY = yAxis.getPixelForValue(settings.warningThreshold);
      if (warningY >= yAxis.top && warningY <= yAxis.bottom) {
        ctx.save();
        ctx.strokeStyle = '#F59E0B';
        ctx.setLineDash([6, 4]);
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.moveTo(xAxis.left, warningY);
        ctx.lineTo(xAxis.right, warningY);
        ctx.stroke();
        ctx.restore();
      }

      // Danger line
      const dangerY = yAxis.getPixelForValue(settings.dangerThreshold);
      if (dangerY >= yAxis.top && dangerY <= yAxis.bottom) {
        ctx.save();
        ctx.strokeStyle = '#EF4444';
        ctx.setLineDash([6, 4]);
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.moveTo(xAxis.left, dangerY);
        ctx.lineTo(xAxis.right, dangerY);
        ctx.stroke();
        ctx.restore();
      }
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: 'clamp(16px, 4vw, 28px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ color: '#F8FAFC', fontSize: 'clamp(16px, 4vw, 18px)', fontWeight: 600, margin: 0 }}>
            กราฟค่าควัน (30 นาทีล่าสุด)
          </h3>
          <p style={{ color: '#64748B', fontSize: '13px', marginTop: '4px' }}>
            {viewMode === 'average' 
              ? 'แสดงค่าเฉลี่ยจากเซ็นเซอร์ทั้งหมด' 
              : viewMode === 'pinned'
                ? `แสดงเฉพาะเซ็นเซอร์ที่ปักหมุด (${pinnedSensors.length})`
                : 'แสดงแยกตามแต่ละเซ็นเซอร์'}
          </p>
        </div>
        
        {/* View Mode Toggle & Fullscreen */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => setViewMode('individual')}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: viewMode === 'individual' ? 'none' : '1px solid rgba(255,255,255,0.1)',
              background: viewMode === 'individual' ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' : 'rgba(255,255,255,0.05)',
              color: viewMode === 'individual' ? '#FFF' : '#94A3B8',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            แยกเซ็นเซอร์
          </button>
          <button
            onClick={() => setViewMode('pinned')}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: viewMode === 'pinned' ? 'none' : '1px solid rgba(255,255,255,0.1)',
              background: viewMode === 'pinned' ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' : 'rgba(255,255,255,0.05)',
              color: viewMode === 'pinned' ? '#FFF' : '#94A3B8',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            ปักหมุด ({pinnedSensors.length})
          </button>
          <button
            onClick={() => setViewMode('average')}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: viewMode === 'average' ? 'none' : '1px solid rgba(255,255,255,0.1)',
              background: viewMode === 'average' ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'rgba(255,255,255,0.05)',
              color: viewMode === 'average' ? '#FFF' : '#94A3B8',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            ค่าเฉลี่ย
          </button>
          
          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(true)}
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: '#94A3B8',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Maximize2 size={16} />
            <span className="fullscreen-text">ขยาย</span>
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .fullscreen-text { display: none; }
        }
      `}</style>

      <div style={{ height: viewMode === 'average' ? '320px' : '380px', position: 'relative' }}>
        <Line 
          ref={chartRef} 
          data={chartData} 
          options={options} 
          plugins={[thresholdPlugin]}
        />
      </div>

      {/* Legend for threshold lines */}
      <div style={{ 
        display: 'flex', 
        gap: '24px', 
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '24px', 
            height: '2px', 
            background: '#F59E0B', 
            borderRadius: '2px',
            boxShadow: '0 0 8px rgba(245, 158, 11, 0.5)',
          }} />
          <span style={{ color: '#F59E0B', fontSize: '12px', fontWeight: 500 }}>
            เฝ้าระวัง ({settings.warningThreshold} PPM)
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '24px', 
            height: '2px', 
            background: '#EF4444', 
            borderRadius: '2px',
            boxShadow: '0 0 8px rgba(239, 68, 68, 0.5)',
          }} />
          <span style={{ color: '#EF4444', fontSize: '12px', fontWeight: 500 }}>
            อันตราย ({settings.dangerThreshold} PPM)
          </span>
        </div>
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              padding: 'clamp(16px, 4vw, 32px)',
            }}
          >
            {/* Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <div>
                <h3 style={{ color: '#F8FAFC', fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 600, margin: 0 }}>
                  กราฟค่าควัน
                </h3>
                <p style={{ color: '#64748B', fontSize: '14px', margin: '4px 0 0' }}>
                  ข้อมูลย้อนหลัง 30 นาที • {viewMode === 'average' ? 'ค่าเฉลี่ย' : viewMode === 'pinned' ? `ปักหมุด ${pinnedSensors.length} ตัว` : `${sensorIds.length} เซ็นเซอร์`}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsFullscreen(false)}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px',
                  padding: '12px',
                  color: '#EF4444',
                  cursor: 'pointer',
                  display: 'flex',
                }}
              >
                <X size={22} />
              </motion.button>
            </div>

            {/* View Mode Toggle */}
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              marginBottom: '24px', 
              flexWrap: 'wrap',
              background: 'rgba(30, 41, 59, 0.5)',
              padding: '8px',
              borderRadius: '14px',
              width: 'fit-content',
            }}>
              <button onClick={() => setViewMode('individual')}
                style={{ 
                  padding: '12px 24px', 
                  borderRadius: '10px', 
                  border: 'none',
                  background: viewMode === 'individual' ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' : 'transparent', 
                  color: viewMode === 'individual' ? '#FFF' : '#94A3B8', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}>
                แยกเซ็นเซอร์
              </button>
              <button onClick={() => setViewMode('pinned')}
                style={{ 
                  padding: '12px 24px', 
                  borderRadius: '10px', 
                  border: 'none',
                  background: viewMode === 'pinned' ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' : 'transparent', 
                  color: viewMode === 'pinned' ? '#FFF' : '#94A3B8', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}>
                ปักหมุด ({pinnedSensors.length})
              </button>
              <button onClick={() => setViewMode('average')}
                style={{ 
                  padding: '12px 24px', 
                  borderRadius: '10px', 
                  border: 'none',
                  background: viewMode === 'average' ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'transparent', 
                  color: viewMode === 'average' ? '#FFF' : '#94A3B8', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}>
                ค่าเฉลี่ย
              </button>
            </div>

            {/* Chart Container */}
            <div style={{ 
              flex: 1, 
              minHeight: 0,
              background: 'rgba(30, 41, 59, 0.4)',
              borderRadius: '20px',
              padding: 'clamp(16px, 3vw, 24px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              overflow: 'hidden',
            }}>
              <div style={{ height: '100%', borderRadius: '12px', overflow: 'hidden' }}>
                <Line 
                  data={chartData} 
                  options={{
                    ...options,
                    animation: { duration: 500 },
                    plugins: {
                      ...options.plugins,
                      legend: {
                        ...options.plugins.legend,
                        labels: {
                          ...options.plugins.legend.labels,
                          font: { size: 13, weight: 500 as const },
                          padding: 24,
                        },
                      },
                    },
                    scales: {
                      ...options.scales,
                      x: {
                        ...options.scales.x,
                        ticks: {
                          ...options.scales.x.ticks,
                          font: { size: 12 },
                          maxTicksLimit: 10,
                        },
                      },
                      y: {
                      ...options.scales.y,
                      ticks: {
                        ...options.scales.y.ticks,
                        font: { size: 12 },
                      },
                    },
                  },
                }} 
                plugins={[thresholdPlugin]} 
              />
              </div>
            </div>

            {/* Legend */}
            <div style={{ 
              display: 'flex', 
              gap: '32px', 
              marginTop: '20px', 
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  width: '32px', 
                  height: '3px', 
                  background: '#F59E0B', 
                  borderRadius: '2px',
                  boxShadow: '0 0 10px rgba(245, 158, 11, 0.5)',
                }} />
                <span style={{ color: '#F59E0B', fontSize: '14px', fontWeight: 500 }}>
                  เฝ้าระวัง ({settings.warningThreshold} PPM)
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  width: '32px', 
                  height: '3px', 
                  background: '#EF4444', 
                  borderRadius: '2px',
                  boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)',
                }} />
                <span style={{ color: '#EF4444', fontSize: '14px', fontWeight: 500 }}>
                  อันตราย ({settings.dangerThreshold} PPM)
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
