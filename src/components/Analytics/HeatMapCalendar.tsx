import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface DayData {
  date: string;
  maxValue: number;
  avgValue: number;
  readings: number;
}

interface HeatMapCalendarProps {
  data: DayData[];
  warningThreshold: number;
  dangerThreshold: number;
}

export const HeatMapCalendar = ({ data, warningThreshold, dangerThreshold }: HeatMapCalendarProps) => {
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);
  const { isDark } = useTheme();

  // Get current month data
  const { weeks, monthName, year, daysInMonth } = useMemo(() => {
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    const monthName = targetDate.toLocaleDateString('th-TH', { month: 'long' });
    
    // Build calendar grid
    const days: (DayData | null | 'empty')[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push('empty');
    }
    
    // Add days of month
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      // Use local date format to avoid timezone issues
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayData = data.find(item => item.date === dateStr);
      days.push(dayData || null);
    }
    
    // Group into weeks
    const result: (DayData | null | 'empty')[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    
    // Pad last week if needed
    const lastWeek = result[result.length - 1];
    while (lastWeek.length < 7) {
      lastWeek.push('empty');
    }
    
    return { weeks: result, monthName, year, daysInMonth };
  }, [data, monthOffset]);

  const getColor = (value: number | null) => {
    if (value === null) return 'transparent';
    if (value >= dangerThreshold) return '#EF4444';
    if (value >= warningThreshold) return '#F59E0B';
    if (value >= warningThreshold * 0.5) return '#84CC16';
    return '#10B981';
  };

  const getBgColor = (value: number | null) => {
    if (value === null) return isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)';
    if (value >= dangerThreshold) return isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.12)';
    if (value >= warningThreshold) return isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.12)';
    if (value >= warningThreshold * 0.5) return isDark ? 'rgba(132, 204, 22, 0.12)' : 'rgba(132, 204, 22, 0.1)';
    return isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)';
  };

  // Theme-aware colors
  const colors = {
    cardBg: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.9)',
    border: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.08)',
    headerBg: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
    textPrimary: isDark ? '#F8FAFC' : '#0F172A',
    textSecondary: isDark ? '#94A3B8' : '#64748B',
    textMuted: isDark ? '#64748B' : '#94A3B8',
    buttonBg: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    buttonBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    panelBg: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
    emptyDayBorder: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.08)',
    noDataText: isDark ? '#475569' : '#94A3B8',
  };

  const maxValue = useMemo(() => 
    Math.max(...data.map(d => d.maxValue), 1),
    [data]
  );

  // Stats for current month
  const monthStats = useMemo(() => {
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    
    const monthData = data.filter(d => {
      const date = new Date(d.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });
    
    if (monthData.length === 0) return null;
    
    const totalReadings = monthData.reduce((sum, d) => sum + d.readings, 0);
    const avgValue = monthData.reduce((sum, d) => sum + d.avgValue, 0) / monthData.length;
    const maxVal = Math.max(...monthData.map(d => d.maxValue));
    const dangerDays = monthData.filter(d => d.maxValue >= dangerThreshold).length;
    
    return { totalReadings, avgValue, maxVal, dangerDays, daysWithData: monthData.length };
  }, [data, monthOffset, dangerThreshold]);

  const dayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: colors.cardBg,
        borderRadius: '20px',
        overflow: 'hidden',
        border: `1px solid ${colors.border}`,
        boxShadow: isDark ? 'none' : '0 4px 20px rgba(0, 0, 0, 0.08)',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px',
        borderBottom: `1px solid ${colors.border}`,
        background: colors.headerBg,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(234, 88, 12, 0.2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(245, 158, 11, 0.3)',
          }}>
            <Calendar size={22} color="#F59E0B" />
          </div>
          <div>
            <h3 style={{ color: colors.textPrimary, fontSize: '16px', fontWeight: 600, margin: 0 }}>
              Heat Map ปฏิทิน
            </h3>
            <p style={{ color: colors.textMuted, fontSize: '12px', margin: '2px 0 0' }}>
              แสดงค่าสูงสุดของแต่ละวัน
            </p>
          </div>
        </div>
        
        {/* Month Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setMonthOffset(prev => prev + 1)}
            disabled={monthOffset >= 2}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: `1px solid ${colors.buttonBorder}`,
              background: colors.buttonBg,
              color: monthOffset >= 2 ? colors.noDataText : colors.textSecondary,
              cursor: monthOffset >= 2 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronLeft size={18} />
          </motion.button>
          <div style={{ 
            minWidth: '140px', 
            textAlign: 'center',
            color: colors.textPrimary,
            fontSize: '14px',
            fontWeight: 600,
          }}>
            {monthName} {year + 543}
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setMonthOffset(prev => Math.max(0, prev - 1))}
            disabled={monthOffset === 0}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: `1px solid ${colors.buttonBorder}`,
              background: colors.buttonBg,
              color: monthOffset === 0 ? colors.noDataText : colors.textSecondary,
              cursor: monthOffset === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronRight size={18} />
          </motion.button>
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        {/* Calendar Grid */}
        <div style={{ flex: 1, padding: '20px 24px' }}>
          {/* Day names */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '8px',
            marginBottom: '12px',
          }}>
            {dayNames.map((day, i) => (
              <div key={day} style={{
                textAlign: 'center',
                color: i === 0 ? '#EF4444' : i === 6 ? '#3B82F6' : colors.textMuted,
                fontSize: '12px',
                fontWeight: 600,
                padding: '8px 0',
              }}>
                {day}
              </div>
            ))}
          </div>

          {/* Weeks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {weeks.map((week, weekIndex) => (
              <div
                key={weekIndex}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '8px',
                }}
              >
                {week.map((day, dayIndex) => {
                  if (day === 'empty') {
                    return <div key={dayIndex} style={{ aspectRatio: '1' }} />;
                  }
                  
                  const dayNum = weekIndex * 7 + dayIndex - (new Date(year, new Date().getMonth() - monthOffset, 1).getDay()) + 1;
                  const isToday = monthOffset === 0 && dayNum === new Date().getDate();
                  
                  // Check if this day is in the future
                  const today = new Date();
                  const currentYear = today.getFullYear();
                  const currentMonth = today.getMonth();
                  const currentDay = today.getDate();
                  const targetMonth = currentMonth - monthOffset;
                  const isFutureDay = monthOffset === 0 
                    ? dayNum > currentDay 
                    : (year > currentYear || (year === currentYear && targetMonth > currentMonth));
                  
                  // Don't show data for future days
                  const hasData = day !== null && !isFutureDay;
                  const isSelected = selectedDay?.date === day?.date && !isFutureDay;
                  
                  return (
                    <motion.div
                      key={dayIndex}
                      whileHover={{ scale: isFutureDay ? 1 : 1.1 }}
                      whileTap={{ scale: isFutureDay ? 1 : 0.95 }}
                      onClick={() => day && !isFutureDay && setSelectedDay(isSelected ? null : day)}
                      style={{
                        aspectRatio: '1',
                        borderRadius: '10px',
                        background: isSelected 
                          ? 'rgba(59, 130, 246, 0.3)' 
                          : isFutureDay 
                            ? (isDark ? 'rgba(255, 255, 255, 0.01)' : 'rgba(0, 0, 0, 0.01)')
                            : getBgColor(day?.maxValue ?? null),
                        border: isToday 
                          ? '2px solid #3B82F6' 
                          : isSelected 
                            ? '2px solid #3B82F6'
                            : isFutureDay
                              ? `1px solid ${colors.emptyDayBorder}`
                              : hasData 
                                ? `1px solid ${getColor(day?.maxValue ?? null)}30`
                                : `1px solid ${colors.emptyDayBorder}`,
                        cursor: hasData ? 'pointer' : 'default',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                        opacity: isFutureDay ? 0.4 : 1,
                      }}
                    >
                      {dayNum > 0 && dayNum <= daysInMonth && (
                        <>
                          <span style={{ 
                            color: isToday ? '#3B82F6' : isFutureDay ? colors.noDataText : hasData ? colors.textPrimary : colors.noDataText,
                            fontSize: '13px',
                            fontWeight: isToday ? 700 : 500,
                          }}>
                            {dayNum}
                          </span>
                          {hasData && !isFutureDay && (
                            <div style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: getColor(day?.maxValue ?? null),
                              marginTop: '2px',
                              boxShadow: `0 0 6px ${getColor(day?.maxValue ?? null)}`,
                            }} />
                          )}
                        </>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: `1px solid ${colors.border}`,
          }}>
            {[
              { color: '#10B981', label: 'ปกติ' },
              { color: '#84CC16', label: 'ต่ำ' },
              { color: '#F59E0B', label: 'เฝ้าระวัง' },
              { color: '#EF4444', label: 'อันตราย' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '4px',
                  background: item.color,
                  boxShadow: `0 0 8px ${item.color}50`,
                }} />
                <span style={{ color: colors.textSecondary, fontSize: '11px' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Panel */}
        <div style={{
          width: '220px',
          borderLeft: `1px solid ${colors.border}`,
          padding: '20px',
          background: colors.headerBg,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          <h4 style={{ color: colors.textSecondary, fontSize: '12px', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {selectedDay ? 'รายละเอียดวัน' : 'สรุปเดือน'}
          </h4>
          
          {selectedDay ? (
            <>
              <div style={{
                background: colors.panelBg,
                borderRadius: '12px',
                padding: '14px',
              }}>
                <p style={{ color: colors.textMuted, fontSize: '11px', margin: '0 0 4px' }}>วันที่</p>
                <p style={{ color: colors.textPrimary, fontSize: '15px', fontWeight: 600, margin: 0 }}>
                  {(() => {
                    // Parse date string manually to avoid timezone issues
                    const [y, m, d] = selectedDay.date.split('-').map(Number);
                    const localDate = new Date(y, m - 1, d);
                    return localDate.toLocaleDateString('th-TH', { 
                      day: 'numeric', 
                      month: 'short',
                      year: 'numeric'
                    });
                  })()}
                </p>
              </div>
              <div style={{
                background: `${getColor(selectedDay.maxValue)}15`,
                borderRadius: '12px',
                padding: '14px',
                border: `1px solid ${getColor(selectedDay.maxValue)}30`,
              }}>
                <p style={{ color: colors.textMuted, fontSize: '11px', margin: '0 0 4px' }}>ค่าสูงสุด</p>
                <p style={{ color: getColor(selectedDay.maxValue), fontSize: '24px', fontWeight: 700, margin: 0 }}>
                  {selectedDay.maxValue.toFixed(0)} <span style={{ fontSize: '12px', fontWeight: 400 }}>PPM</span>
                </p>
              </div>
              <div style={{
                background: colors.panelBg,
                borderRadius: '12px',
                padding: '14px',
              }}>
                <p style={{ color: colors.textMuted, fontSize: '11px', margin: '0 0 4px' }}>ค่าเฉลี่ย</p>
                <p style={{ color: colors.textPrimary, fontSize: '18px', fontWeight: 600, margin: 0 }}>
                  {selectedDay.avgValue.toFixed(1)} PPM
                </p>
              </div>
              <div style={{
                background: colors.panelBg,
                borderRadius: '12px',
                padding: '14px',
              }}>
                <p style={{ color: colors.textMuted, fontSize: '11px', margin: '0 0 4px' }}>จำนวนการอ่าน</p>
                <p style={{ color: colors.textPrimary, fontSize: '18px', fontWeight: 600, margin: 0 }}>
                  {selectedDay.readings.toLocaleString()}
                </p>
              </div>
            </>
          ) : monthStats ? (
            <>
              <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '12px',
                padding: '14px',
                border: '1px solid rgba(59, 130, 246, 0.2)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Activity size={14} color="#3B82F6" />
                  <p style={{ color: colors.textMuted, fontSize: '11px', margin: 0 }}>วันที่มีข้อมูล</p>
                </div>
                <p style={{ color: colors.textPrimary, fontSize: '22px', fontWeight: 700, margin: 0 }}>
                  {monthStats.daysWithData} <span style={{ fontSize: '12px', fontWeight: 400, color: colors.textMuted }}>/ {daysInMonth} วัน</span>
                </p>
              </div>
              <div style={{
                background: `${getColor(monthStats.maxVal)}15`,
                borderRadius: '12px',
                padding: '14px',
                border: `1px solid ${getColor(monthStats.maxVal)}30`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <TrendingUp size={14} color={getColor(monthStats.maxVal)} />
                  <p style={{ color: colors.textMuted, fontSize: '11px', margin: 0 }}>ค่าสูงสุด</p>
                </div>
                <p style={{ color: getColor(monthStats.maxVal), fontSize: '22px', fontWeight: 700, margin: 0 }}>
                  {monthStats.maxVal.toFixed(0)} <span style={{ fontSize: '12px', fontWeight: 400 }}>PPM</span>
                </p>
              </div>
              <div style={{
                background: colors.panelBg,
                borderRadius: '12px',
                padding: '14px',
              }}>
                <p style={{ color: colors.textMuted, fontSize: '11px', margin: '0 0 8px' }}>ค่าเฉลี่ย</p>
                <p style={{ color: colors.textPrimary, fontSize: '18px', fontWeight: 600, margin: 0 }}>
                  {monthStats.avgValue.toFixed(1)} PPM
                </p>
              </div>
              {monthStats.dangerDays > 0 && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '12px',
                  padding: '14px',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                }}>
                  <p style={{ color: colors.textMuted, fontSize: '11px', margin: '0 0 8px' }}>วันที่อันตราย</p>
                  <p style={{ color: '#EF4444', fontSize: '18px', fontWeight: 600, margin: 0 }}>
                    {monthStats.dangerDays} วัน
                  </p>
                </div>
              )}
            </>
          ) : (
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: colors.textMuted,
              fontSize: '13px',
            }}>
              ไม่มีข้อมูล
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
