import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
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
}

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

export const SmokeChart = ({ data, sensorHistory, settings }: SmokeChartProps) => {
  const chartRef = useRef<ChartJS<'line'>>(null);
  const [viewMode, setViewMode] = useState<'average' | 'individual'>('individual');

  // Get unique sensors from history
  const sensorIds = Object.keys(sensorHistory);
  
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
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#3B82F6',
          pointBorderColor: '#FFF',
          pointBorderWidth: 2,
          pointHoverRadius: 6,
        }],
      };
    }

    // Individual sensor view
    // Find all unique timestamps
    const allTimestamps = new Set<string>();
    sensorIds.forEach(id => {
      sensorHistory[id]?.forEach(h => allTimestamps.add(h.timestamp));
    });
    
    const sortedTimestamps = Array.from(allTimestamps).sort();
    
    // Check time range to decide format
    const timeRange = sortedTimestamps.length > 1 
      ? new Date(sortedTimestamps[sortedTimestamps.length - 1]).getTime() - new Date(sortedTimestamps[0]).getTime()
      : 0;
    const showSeconds = timeRange < 10 * 60 * 1000; // Show seconds if range < 10 minutes
    
    const labels = sortedTimestamps.map(ts => 
      new Date(ts).toLocaleTimeString('th-TH', { 
        hour: '2-digit', 
        minute: '2-digit',
        ...(showSeconds && { second: '2-digit' }),
      })
    );

    const datasets = sensorIds.slice(0, 10).map((sensorId, index) => {
      const sensorData = sensorHistory[sensorId] || [];
      const displayName = sensorData[0]?.location || sensorData[0]?.sensorName || sensorId;
      
      // Map values to timestamps
      const valueMap = new Map<string, number>();
      sensorData.forEach(h => valueMap.set(h.timestamp, h.value));
      
      const values = sortedTimestamps.map(ts => valueMap.get(ts) ?? null);
      
      return {
        label: displayName,
        data: values,
        borderColor: COLORS[index % COLORS.length],
        backgroundColor: `${COLORS[index % COLORS.length]}20`,
        fill: false,
        tension: 0.3,
        pointRadius: 3,
        pointBackgroundColor: COLORS[index % COLORS.length],
        pointBorderColor: '#FFF',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        spanGaps: true,
      };
    });

    return { labels, datasets };
  };

  const chartData = prepareChartData();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'nearest' as const,
      intersect: true,
    },
    onHover: (event: any, elements: any[]) => {
      const canvas = event.native?.target as HTMLCanvasElement;
      if (canvas) {
        canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
      }
    },
    plugins: {
      legend: {
        display: viewMode === 'individual',
        position: 'bottom' as const,
        labels: {
          color: '#94A3B8',
          usePointStyle: true,
          padding: 15,
          font: { size: 11 },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#94A3B8',
        bodyColor: '#F8FAFC',
        bodyFont: { size: 14 },
        padding: 12,
        cornerRadius: 12,
        callbacks: {
          label: (item: any) => `${item.dataset.label}: ${item.raw} PPM`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#64748B',
          font: { size: 10 },
          maxTicksLimit: 8,
        },
        border: { display: false },
      },
      y: {
        min: 0,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: {
          color: '#64748B',
          font: { size: 11 },
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
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.6;
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
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.6;
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
        padding: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h3 style={{ color: '#F8FAFC', fontSize: '18px', fontWeight: 600, margin: 0 }}>
            กราฟค่าควัน (30 นาทีล่าสุด)
          </h3>
          <p style={{ color: '#64748B', fontSize: '13px', marginTop: '4px' }}>
            {viewMode === 'average' ? 'แสดงค่าเฉลี่ยจากเซ็นเซอร์ทั้งหมด' : 'แสดงแยกตามแต่ละเซ็นเซอร์'}
          </p>
        </div>
        
        {/* View Mode Toggle */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setViewMode('individual')}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              background: viewMode === 'individual' ? '#3B82F6' : 'rgba(255,255,255,0.1)',
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
            onClick={() => setViewMode('average')}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              background: viewMode === 'average' ? '#3B82F6' : 'rgba(255,255,255,0.1)',
              color: viewMode === 'average' ? '#FFF' : '#94A3B8',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            ค่าเฉลี่ย
          </button>
        </div>
      </div>

      <div style={{ height: viewMode === 'individual' ? '350px' : '300px' }}>
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
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '3px', background: '#F59E0B', borderRadius: '2px' }} />
          <span style={{ color: '#94A3B8', fontSize: '12px' }}>เฝ้าระวัง ({settings.warningThreshold} PPM)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '3px', background: '#EF4444', borderRadius: '2px' }} />
          <span style={{ color: '#94A3B8', fontSize: '12px' }}>อันตราย ({settings.dangerThreshold} PPM)</span>
        </div>
      </div>
    </motion.div>
  );
};
