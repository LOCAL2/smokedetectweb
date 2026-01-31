import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  TrendingUp, 
  AlertTriangle,
  Download,
  FileText,
  Trash2,
  ChevronDown,
  ChevronUp,
  BarChart3,
  FileDown,
  Sparkles,
  CalendarDays
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import { useSettingsContext } from '../context/SettingsContext';
import { HeatMapCalendar } from '../components/Analytics/HeatMapCalendar';
import { useTheme } from '../context/ThemeContext';
import { generateWeeklyReport, formatWeeklyReportText } from '../utils/weeklyReport';
import { useSensorDataContext } from '../context/SensorDataContext';

type DateRange = 7 | 14 | 30 | 45;


const generateMockData = () => {
  const locations = [
    { id: 'loc-1', name: 'ห้องนอนใหญ่' },
    { id: 'loc-2', name: 'ห้องครัว' },
    { id: 'loc-3', name: 'ห้องนั่งเล่น' },
    { id: 'loc-4', name: 'โรงรถ' },
    { id: 'loc-5', name: 'ห้องเก็บของ' },
  ];
  
  const data: any = {
    locations: {},
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastCleanup: new Date().toISOString(),
  };
  
  locations.forEach(loc => {
    const hourlyData: any[] = [];
    let danger = 0, warning = 0, sum = 0, max = 0, min = Infinity, total = 0;
    
    for (let d = 30; d >= 0; d--) {
      for (let h = 0; h < 24; h++) {
        const date = new Date();
        date.setDate(date.getDate() - d);
        date.setHours(h, 0, 0, 0);
        
        const base = 30 + Math.random() * 50;
        const spike = Math.random() > 0.9 ? Math.random() * 150 : 0;
        const avg = Math.round((base + spike) * 10) / 10;
        const hMax = Math.round((avg + Math.random() * 30) * 10) / 10;
        const hMin = Math.round(Math.max(10, avg - Math.random() * 20) * 10) / 10;
        const count = Math.floor(10 + Math.random() * 20);
        
        hourlyData.push({ hour: date.toISOString(), avg, max: hMax, min: hMin, count });
        sum += avg * count;
        total += count;
        max = Math.max(max, hMax);
        min = Math.min(min, hMin);
        if (hMax >= 150) danger += Math.floor(Math.random() * 3);
        else if (hMax >= 100) warning += Math.floor(Math.random() * 2);
      }
    }
    
    data.locations[loc.id] = {
      locationId: loc.id,
      locationName: loc.name,
      hourlyData,
      totalReadings: total,
      overallAvg: Math.round(sum / total * 10) / 10,
      overallMax: max,
      overallMin: min,
      dangerCount: danger,
      warningCount: warning,
      lastUpdated: new Date().toISOString(),
    };
  });
  
  return data;
};

export const AnalyticsPage = () => {
  const navigate = useNavigate();
  const { settings } = useSettingsContext();
  const { isDark } = useTheme();
  const { sensors } = useSensorDataContext();
  const { getSummary, exportAsText, exportAsJSON, resetData, analytics } = useAnalyticsData(
    settings.warningThreshold,
    settings.dangerThreshold
  );
  
  const [dateRange, setDateRange] = useState<DateRange>(7);
  const [expandedLocations, setExpandedLocations] = useState<Set<string>>(new Set());
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showWeeklyReportMenu, setShowWeeklyReportMenu] = useState(false);

  
  const handleDownloadWeeklyReport = async (format: 'txt' | 'md' | 'pdf') => {
    
    const report = generateWeeklyReport(
      new Map(), 
      sensors,
      settings.warningThreshold,
      settings.dangerThreshold
    );
    
    const reportText = formatWeeklyReportText(report);
    
    if (format === 'txt') {
      const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `weekly-report-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'md') {
      const blob = new Blob([reportText], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `weekly-report-${new Date().toISOString().split('T')[0]}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '800px';
      tempDiv.style.padding = '40px';
      tempDiv.style.background = '#FFFFFF';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '14px';
      tempDiv.style.lineHeight = '1.6';
      tempDiv.style.color = '#000000';
      
      
      const lines = reportText.split('\n');
      let html = '';
      lines.forEach(line => {
        if (line.startsWith('📊') || line.startsWith('===')) {
          html += `<h1 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #8B5CF6;">${line}</h1>`;
        } else if (line.startsWith('📅') || line.startsWith('📈') || line.startsWith('💡') || line.startsWith('✅')) {
          html += `<h2 style="font-size: 16px; font-weight: bold; margin: 15px 0 8px; color: #6366F1;">${line}</h2>`;
        } else if (line.startsWith('•')) {
          html += `<p style="margin: 5px 0 5px 20px;">${line}</p>`;
        } else if (line.trim() === '') {
          html += '<br/>';
        } else {
          html += `<p style="margin: 5px 0;">${line}</p>`;
        }
      });
      
      tempDiv.innerHTML = html;
      document.body.appendChild(tempDiv);
      
      try {
        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          backgroundColor: '#FFFFFF',
          logging: false,
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });
        
        const imgWidth = 210; 
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297; 
        
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= 297;
        }
        
        pdf.save(`weekly-report-${new Date().toISOString().split('T')[0]}.pdf`);
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('ไม่สามารถสร้าง PDF ได้ กรุณาลองใหม่อีกครั้ง');
      } finally {
        document.body.removeChild(tempDiv);
      }
    }
    
    setShowWeeklyReportMenu(false);
  };

  
  const cardBg = isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.9)';
  const cardBorder = isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.08)';
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const textSecondary = isDark ? '#94A3B8' : '#64748B';
  const textMuted = isDark ? '#64748B' : '#94A3B8';
  const itemBg = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
  const buttonBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  const buttonBorder = isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)';
  const headerBorder = isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.08)';
  
  
  const toggleLocation = (locationId: string) => {
    setExpandedLocations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(locationId)) {
        newSet.delete(locationId);
      } else {
        newSet.add(locationId);
      }
      return newSet;
    });
  };
  
  
  const hasMockData = Object.keys(analytics.locations).length > 0;

  const summary = useMemo(() => getSummary(dateRange), [getSummary, dateRange]);

  const totalReadings = summary.reduce((sum, s) => sum + (s?.totalReadings || 0), 0);
  const totalDanger = summary.reduce((sum, s) => sum + (s?.dangerCount || 0), 0);
  const totalWarning = summary.reduce((sum, s) => sum + (s?.warningCount || 0), 0);
  const overallMax = summary.length > 0 ? Math.max(...summary.map(s => s?.max || 0)) : 0;

  
  const heatMapData = useMemo(() => {
    const dayMap = new Map<string, { maxValue: number; avgValue: number; readings: number }>();
    
    Object.values(analytics.locations).forEach((loc: any) => {
      if (loc.hourlyData) {
        loc.hourlyData.forEach((h: any) => {
          const date = h.hour.split('T')[0];
          const existing = dayMap.get(date);
          if (existing) {
            existing.maxValue = Math.max(existing.maxValue, h.max);
            existing.avgValue = (existing.avgValue * existing.readings + h.avg * h.count) / (existing.readings + h.count);
            existing.readings += h.count;
          } else {
            dayMap.set(date, { maxValue: h.max, avgValue: h.avg, readings: h.count });
          }
        });
      }
    });
    
    return Array.from(dayMap.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));
  }, [analytics.locations]);

  const handleExportText = () => {
    const text = exportAsText(dateRange);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smoke-report-${dateRange}days-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const json = exportAsJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smoke-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);
    
    
    const container = document.createElement('div');
    container.style.cssText = 'position: absolute; left: -9999px; top: 0; width: 800px; background: white; padding: 40px; font-family: sans-serif;';
    container.innerHTML = `
      <div style="color: #0f172a;">
        <h1 style="font-size: 24px; margin-bottom: 8px;">Smoke Detect Analytics Report</h1>
        <p style="color: #64748b; font-size: 12px; margin-bottom: 24px;">
          ช่วงเวลา: ${startDate.toLocaleDateString('th-TH')} - ${now.toLocaleDateString('th-TH')} (${dateRange} วัน)<br>
          สร้างเมื่อ: ${now.toLocaleString('th-TH')}
        </p>
        
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 16px; font-weight: 600; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0;">สรุปภาพรวม</h2>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
            <div style="background: #f8fafc; padding: 12px; border-radius: 8px;">
              <div style="font-size: 11px; color: #64748b;">สถานที่ทั้งหมด</div>
              <div style="font-size: 20px; font-weight: 700;">${summary.length}</div>
            </div>
            <div style="background: #f8fafc; padding: 12px; border-radius: 8px;">
              <div style="font-size: 11px; color: #64748b;">การอ่านค่าทั้งหมด</div>
              <div style="font-size: 20px; font-weight: 700;">${totalReadings.toLocaleString()}</div>
            </div>
            <div style="background: #f8fafc; padding: 12px; border-radius: 8px;">
              <div style="font-size: 11px; color: #64748b;">ค่าสูงสุด</div>
              <div style="font-size: 20px; font-weight: 700;">${overallMax} PPM</div>
            </div>
            <div style="background: #f8fafc; padding: 12px; border-radius: 8px;">
              <div style="font-size: 11px; color: #64748b;">แจ้งเตือนอันตราย</div>
              <div style="font-size: 20px; font-weight: 700; color: #ef4444;">${totalDanger}</div>
            </div>
            <div style="background: #f8fafc; padding: 12px; border-radius: 8px;">
              <div style="font-size: 11px; color: #64748b;">แจ้งเตือนเฝ้าระวัง</div>
              <div style="font-size: 20px; font-weight: 700; color: #f59e0b;">${totalWarning}</div>
            </div>
          </div>
        </div>
        
        <div>
          <h2 style="font-size: 16px; font-weight: 600; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0;">รายละเอียดแต่ละสถานที่</h2>
          ${summary.map((loc, i) => loc ? `
            <div style="margin-bottom: 12px; padding: 12px; background: #f8fafc; border-radius: 8px;">
              <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">${i + 1}. ${loc.locationName}</div>
              <div style="font-size: 12px; color: #475569;">
                ค่าสูงสุด: ${loc.max} PPM | ค่าเฉลี่ย: ${loc.avg} PPM | ค่าต่ำสุด: ${loc.min} PPM<br>
                จำนวนการอ่าน: ${loc.totalReadings.toLocaleString()} | อันตราย: ${loc.dangerCount} | เฝ้าระวัง: ${loc.warningCount}
              </div>
            </div>
          ` : '').join('')}
        </div>
        
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center;">
          Smoke Detect System - Analytics Report
        </div>
      </div>
    `;
    
    document.body.appendChild(container);
    
    try {
      const canvas = await html2canvas(container, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`smoke-report-${dateRange}days-${now.toISOString().split('T')[0]}.pdf`);
    } finally {
      document.body.removeChild(container);
    }
  };

  const handleGenerateMockData = () => {
    const mockData = generateMockData();
    localStorage.setItem('smoke-sensor-analytics', JSON.stringify(mockData));
    window.location.reload();
  };

  const handleReset = () => {
    resetData();
    setShowResetConfirm(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (value: number) => {
    if (value >= settings.dangerThreshold) return '#EF4444';
    if (value >= settings.warningThreshold) return '#F59E0B';
    return '#10B981';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: isDark ? '#0B0F1A' : '#F1F5F9',
      padding: 'clamp(16px, 4vw, 24px)',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '32px',
            paddingBottom: '20px',
            borderBottom: headerBorder,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: buttonBg,
                border: buttonBorder,
                borderRadius: '10px',
                padding: '10px 16px',
                color: textSecondary,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 style={{ color: textColor, fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 600, margin: 0 }}>
                Analytics
              </h1>
              <p style={{ color: textMuted, fontSize: '13px', margin: '4px 0 0' }}>
                สรุปข้อมูล Sensor ย้อนหลัง
              </p>
            </div>
          </div>

          {}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {([7, 14, 30, 45] as DateRange[]).map(days => (
              <button
                key={days}
                onClick={() => setDateRange(days)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: dateRange === days ? 'none' : buttonBorder,
                  background: dateRange === days 
                    ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' 
                    : buttonBg,
                  color: dateRange === days ? '#FFF' : textSecondary,
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {days === 45 ? '1.5 เดือน' : `${days} วัน`}
              </button>
            ))}
          </div>
        </motion.header>

        {}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div style={{
            background: cardBg,
            borderRadius: '16px',
            padding: '20px',
            border: cardBorder,
            boxShadow: isDark ? 'none' : '0 4px 15px rgba(0, 0, 0, 0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '10px',
                background: 'rgba(59, 130, 246, 0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <MapPin size={20} color="#3B82F6" />
              </div>
              <span style={{ color: textSecondary, fontSize: '14px' }}>สถานที่ทั้งหมด</span>
            </div>
            <p style={{ color: textColor, fontSize: '28px', fontWeight: 700, margin: 0 }}>
              {summary.length}
            </p>
          </div>

          <div style={{
            background: cardBg,
            borderRadius: '16px',
            padding: '20px',
            border: cardBorder,
            boxShadow: isDark ? 'none' : '0 4px 15px rgba(0, 0, 0, 0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <BarChart3 size={20} color="#10B981" />
              </div>
              <span style={{ color: textSecondary, fontSize: '14px' }}>การอ่านค่าทั้งหมด</span>
            </div>
            <p style={{ color: textColor, fontSize: '28px', fontWeight: 700, margin: 0 }}>
              {totalReadings.toLocaleString()}
            </p>
          </div>

          <div style={{
            background: cardBg,
            borderRadius: '16px',
            padding: '20px',
            border: cardBorder,
            boxShadow: isDark ? 'none' : '0 4px 15px rgba(0, 0, 0, 0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '10px',
                background: 'rgba(139, 92, 246, 0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <TrendingUp size={20} color="#8B5CF6" />
              </div>
              <span style={{ color: textSecondary, fontSize: '14px' }}>ค่าสูงสุด</span>
            </div>
            <p style={{ color: getStatusColor(overallMax), fontSize: '28px', fontWeight: 700, margin: 0 }}>
              {overallMax} PPM
            </p>
          </div>

          <div style={{
            background: cardBg,
            borderRadius: '16px',
            padding: '20px',
            border: cardBorder,
            boxShadow: isDark ? 'none' : '0 4px 15px rgba(0, 0, 0, 0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <AlertTriangle size={20} color="#EF4444" />
              </div>
              <span style={{ color: textSecondary, fontSize: '14px' }}>แจ้งเตือน</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#EF4444', fontSize: '24px', fontWeight: 700, margin: 0 }}>{totalDanger}</p>
                <p style={{ color: textMuted, fontSize: '11px', margin: 0 }}>อันตราย</p>
              </div>
              <span style={{ color: '#475569', fontSize: '20px' }}>/</span>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#F59E0B', fontSize: '24px', fontWeight: 700, margin: 0 }}>{totalWarning}</p>
                <p style={{ color: textMuted, fontSize: '11px', margin: 0 }}>เฝ้าระวัง</p>
              </div>
            </div>
          </div>
        </motion.div>

        {}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '24px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={handleExportPDF}
            disabled={summary.length === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '10px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: summary.length === 0 ? 'rgba(100, 116, 139, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: summary.length === 0 ? '#64748B' : '#F87171',
              fontSize: '14px',
              fontWeight: 500,
              cursor: summary.length === 0 ? 'not-allowed' : 'pointer',
              opacity: summary.length === 0 ? 0.5 : 1,
            }}
          >
            <FileDown size={18} />
            Export PDF
          </button>
          <button
            onClick={handleExportText}
            disabled={summary.length === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '10px',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              background: summary.length === 0 ? 'rgba(100, 116, 139, 0.1)' : 'rgba(59, 130, 246, 0.1)',
              color: summary.length === 0 ? '#64748B' : '#60A5FA',
              fontSize: '14px',
              fontWeight: 500,
              cursor: summary.length === 0 ? 'not-allowed' : 'pointer',
              opacity: summary.length === 0 ? 0.5 : 1,
            }}
          >
            <FileText size={18} />
            Export Text
          </button>
          <button
            onClick={handleExportJSON}
            disabled={summary.length === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '10px',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              background: summary.length === 0 ? 'rgba(100, 116, 139, 0.1)' : 'rgba(16, 185, 129, 0.1)',
              color: summary.length === 0 ? '#64748B' : '#34D399',
              fontSize: '14px',
              fontWeight: 500,
              cursor: summary.length === 0 ? 'not-allowed' : 'pointer',
              opacity: summary.length === 0 ? 0.5 : 1,
            }}
          >
            <Download size={18} />
            Export JSON
          </button>

          {}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowWeeklyReportMenu(!showWeeklyReportMenu)}
              disabled={sensors.length === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: '10px',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                background: sensors.length === 0 ? 'rgba(100, 116, 139, 0.1)' : 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(99, 102, 241, 0.15))',
                color: sensors.length === 0 ? '#64748B' : '#A78BFA',
                fontSize: '14px',
                fontWeight: 600,
                cursor: sensors.length === 0 ? 'not-allowed' : 'pointer',
                opacity: sensors.length === 0 ? 0.5 : 1,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (sensors.length > 0) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <CalendarDays size={18} />
              📊 Weekly AI Report
              <ChevronDown size={16} style={{ 
                transform: showWeeklyReportMenu ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform 0.2s',
              }} />
            </button>

            {}
            {showWeeklyReportMenu && sensors.length > 0 && (
              <>
                <div 
                  style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 10,
                  }}
                  onClick={() => setShowWeeklyReportMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    background: isDark ? '#1E293B' : '#FFFFFF',
                    borderRadius: '12px',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                    overflow: 'hidden',
                    minWidth: '200px',
                    zIndex: 20,
                  }}
                >
                  <button
                    onClick={() => handleDownloadWeeklyReport('txt')}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 16px',
                      border: 'none',
                      background: 'transparent',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <FileText size={16} />
                    Text File (.txt)
                  </button>
                  <button
                    onClick={() => handleDownloadWeeklyReport('md')}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 16px',
                      border: 'none',
                      background: 'transparent',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <FileText size={16} />
                    Markdown (.md)
                  </button>
                  <button
                    onClick={() => handleDownloadWeeklyReport('pdf')}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 16px',
                      border: 'none',
                      background: 'transparent',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <FileDown size={16} />
                    PDF Document (.pdf)
                  </button>
                </motion.div>
              </>
            )}
          </div>
          
          <div style={{ flex: 1 }} />
          
          {}
          <button
            onClick={handleGenerateMockData}
            disabled={hasMockData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '10px',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              background: hasMockData ? 'rgba(100, 116, 139, 0.1)' : 'rgba(139, 92, 246, 0.1)',
              color: hasMockData ? '#64748B' : '#A78BFA',
              fontSize: '14px',
              fontWeight: 500,
              cursor: hasMockData ? 'not-allowed' : 'pointer',
              opacity: hasMockData ? 0.5 : 1,
            }}
          >
            <Sparkles size={18} />
            Mock Data
          </button>
          <button
            onClick={() => setShowResetConfirm(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '10px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#F87171',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <Trash2 size={18} />
            Reset Data
          </button>
        </motion.div>

        {}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 style={{ 
            color: textColor, 
            fontSize: '18px', 
            fontWeight: 600, 
            margin: '0 0 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <MapPin size={20} color="#3B82F6" />
            รายละเอียดแต่ละสถานที่
          </h2>

          {summary.length === 0 ? (
            <div style={{
              background: cardBg,
              borderRadius: '16px',
              padding: '60px 40px',
              textAlign: 'center',
              border: `1px dashed ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Calendar size={48} color={textMuted} style={{ marginBottom: '16px' }} />
              <h3 style={{ color: textSecondary, fontSize: '16px', margin: '0 0 8px' }}>
                ยังไม่มีข้อมูลในช่วงเวลานี้
              </h3>
              <p style={{ color: textMuted, fontSize: '14px', margin: 0 }}>
                ข้อมูลจะถูกบันทึกอัตโนมัติเมื่อมีการอ่านค่า Sensor
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {summary.map((loc, index) => loc && (
                <motion.div
                  key={loc.locationId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    background: cardBg,
                    borderRadius: '16px',
                    border: cardBorder,
                    overflow: 'hidden',
                    boxShadow: isDark ? 'none' : '0 4px 15px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  {}
                  <button
                    onClick={() => toggleLocation(loc.locationId)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '20px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: `${getStatusColor(loc.max)}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: textColor,
                        fontSize: '14px',
                        fontWeight: 600,
                      }}>
                        {index + 1}
                      </div>
                      <div>
                        <h3 style={{ color: textColor, fontSize: '16px', fontWeight: 600, margin: 0 }}>
                          {loc.locationName}
                        </h3>
                        <p style={{ color: textMuted, fontSize: '12px', margin: '4px 0 0' }}>
                          {loc.totalReadings.toLocaleString()} การอ่านค่า
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ color: textMuted, fontSize: '12px', margin: '0 0 4px' }}>ค่าสูงสุด</p>
                        <p style={{ 
                          color: getStatusColor(loc.max), 
                          fontSize: '18px', 
                          fontWeight: 700, 
                          margin: 0 
                        }}>
                          {loc.max} PPM
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ color: textMuted, fontSize: '12px', margin: '0 0 4px' }}>ค่าเฉลี่ย</p>
                        <p style={{ color: textColor, fontSize: '18px', fontWeight: 700, margin: 0 }}>
                          {loc.avg} PPM
                        </p>
                      </div>
                      {expandedLocations.has(loc.locationId) ? (
                        <ChevronUp size={20} color={textMuted} />
                      ) : (
                        <ChevronDown size={20} color={textMuted} />
                      )}
                    </div>
                  </button>

                  {}
                  {expandedLocations.has(loc.locationId) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{
                        padding: '0 20px 20px',
                        borderTop: headerBorder,
                      }}
                    >
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '16px',
                        marginTop: '16px',
                      }}>
                        <div style={{
                          background: itemBg,
                          borderRadius: '10px',
                          padding: '14px',
                        }}>
                          <p style={{ color: textMuted, fontSize: '12px', margin: '0 0 4px' }}>ค่าต่ำสุด</p>
                          <p style={{ color: '#10B981', fontSize: '20px', fontWeight: 600, margin: 0 }}>
                            {loc.min} PPM
                          </p>
                        </div>
                        <div style={{
                          background: itemBg,
                          borderRadius: '10px',
                          padding: '14px',
                        }}>
                          <p style={{ color: textMuted, fontSize: '12px', margin: '0 0 4px' }}>แจ้งเตือนอันตราย</p>
                          <p style={{ color: '#EF4444', fontSize: '20px', fontWeight: 600, margin: 0 }}>
                            {loc.dangerCount} ครั้ง
                          </p>
                        </div>
                        <div style={{
                          background: itemBg,
                          borderRadius: '10px',
                          padding: '14px',
                        }}>
                          <p style={{ color: textMuted, fontSize: '12px', margin: '0 0 4px' }}>แจ้งเตือนเฝ้าระวัง</p>
                          <p style={{ color: '#F59E0B', fontSize: '20px', fontWeight: 600, margin: 0 }}>
                            {loc.warningCount} ครั้ง
                          </p>
                        </div>
                        <div style={{
                          background: itemBg,
                          borderRadius: '10px',
                          padding: '14px',
                        }}>
                          <p style={{ color: textMuted, fontSize: '12px', margin: '0 0 4px' }}>จำนวนชั่วโมง</p>
                          <p style={{ color: textColor, fontSize: '20px', fontWeight: 600, margin: 0 }}>
                            {loc.hourlyData.length} ชม.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ marginTop: '32px' }}
        >
          <HeatMapCalendar 
            data={heatMapData}
            warningThreshold={settings.warningThreshold}
            dangerThreshold={settings.dangerThreshold}
          />
        </motion.div>

        {}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            marginTop: '32px',
            padding: '16px',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <Calendar size={16} color="#60A5FA" />
          <p style={{ color: textSecondary, fontSize: '13px', margin: 0 }}>
            ข้อมูลเริ่มเก็บตั้งแต่: {formatDate(analytics.createdAt)} | 
            ข้อมูลจะถูกลบอัตโนมัติหลังจาก 45 วัน
          </p>
        </motion.div>
      </div>

      {}
      {showResetConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              background: isDark ? '#1E293B' : '#FFFFFF',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '400px',
              width: '100%',
              textAlign: 'center',
              boxShadow: isDark ? 'none' : '0 20px 60px rgba(0, 0, 0, 0.15)',
            }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Trash2 size={32} color="#EF4444" />
            </div>
            <h3 style={{ color: textColor, fontSize: '20px', margin: '0 0 12px' }}>
              ยืนยันการลบข้อมูล?
            </h3>
            <p style={{ color: textSecondary, fontSize: '14px', margin: '0 0 24px' }}>
              ข้อมูล Analytics ทั้งหมดจะถูกลบและไม่สามารถกู้คืนได้
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowResetConfirm(false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '10px',
                  border: buttonBorder,
                  background: 'transparent',
                  color: textSecondary,
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleReset}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  color: '#FFF',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                ลบข้อมูล
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
