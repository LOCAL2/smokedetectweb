import { useState, useEffect, useCallback } from 'react';

const ANALYTICS_STORAGE_KEY = 'smoke-sensor-analytics';
const DATA_RETENTION_DAYS = 45; // 1 เดือน 15 วัน

export interface HourlyData {
  hour: string; // ISO string
  avg: number;
  max: number;
  min: number;
  count: number;
}

export interface LocationAnalytics {
  locationId: string;
  locationName: string;
  hourlyData: HourlyData[];
  totalReadings: number;
  overallAvg: number;
  overallMax: number;
  overallMin: number;
  dangerCount: number;
  warningCount: number;
  lastUpdated: string;
}

export interface AnalyticsData {
  locations: Record<string, LocationAnalytics>;
  createdAt: string;
  lastCleanup: string;
}

const getEmptyAnalytics = (): AnalyticsData => ({
  locations: {},
  createdAt: new Date().toISOString(),
  lastCleanup: new Date().toISOString(),
});

const loadAnalyticsFromStorage = (): AnalyticsData => {
  try {
    const saved = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading analytics:', e);
  }
  return getEmptyAnalytics();
};

const saveAnalyticsToStorage = (data: AnalyticsData) => {
  try {
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving analytics:', e);
  }
};

export const useAnalyticsData = (warningThreshold: number, dangerThreshold: number) => {
  const [analytics, setAnalytics] = useState<AnalyticsData>(loadAnalyticsFromStorage);

  // Cleanup old data (older than 45 days)
  const cleanupOldData = useCallback(() => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - DATA_RETENTION_DAYS);
    const cutoffTime = cutoffDate.getTime();

    setAnalytics(prev => {
      const newLocations: Record<string, LocationAnalytics> = {};
      
      Object.entries(prev.locations).forEach(([locId, loc]) => {
        const filteredHourly = loc.hourlyData.filter(
          h => new Date(h.hour).getTime() > cutoffTime
        );
        
        if (filteredHourly.length > 0) {
          // Recalculate stats
          const totalReadings = filteredHourly.reduce((sum, h) => sum + h.count, 0);
          const weightedSum = filteredHourly.reduce((sum, h) => sum + h.avg * h.count, 0);
          const overallAvg = totalReadings > 0 ? weightedSum / totalReadings : 0;
          const overallMax = Math.max(...filteredHourly.map(h => h.max));
          const overallMin = Math.min(...filteredHourly.map(h => h.min));
          
          newLocations[locId] = {
            ...loc,
            hourlyData: filteredHourly,
            totalReadings,
            overallAvg,
            overallMax,
            overallMin,
          };
        }
      });

      const newData = {
        ...prev,
        locations: newLocations,
        lastCleanup: new Date().toISOString(),
      };
      
      saveAnalyticsToStorage(newData);
      return newData;
    });
  }, []);

  // Run cleanup on mount and daily
  useEffect(() => {
    const lastCleanup = new Date(analytics.lastCleanup);
    const now = new Date();
    const hoursSinceCleanup = (now.getTime() - lastCleanup.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceCleanup > 24) {
      cleanupOldData();
    }
  }, [analytics.lastCleanup, cleanupOldData]);

  // Record sensor reading
  const recordReading = useCallback((
    locationId: string,
    locationName: string,
    value: number
  ) => {
    const now = new Date();
    const hourKey = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours()).toISOString();

    setAnalytics(prev => {
      const location = prev.locations[locationId] || {
        locationId,
        locationName,
        hourlyData: [],
        totalReadings: 0,
        overallAvg: 0,
        overallMax: 0,
        overallMin: Infinity,
        dangerCount: 0,
        warningCount: 0,
        lastUpdated: now.toISOString(),
      };

      // Find or create hourly bucket
      let hourlyIndex = location.hourlyData.findIndex(h => h.hour === hourKey);
      let hourly: HourlyData;
      
      if (hourlyIndex === -1) {
        hourly = { hour: hourKey, avg: value, max: value, min: value, count: 1 };
        location.hourlyData.push(hourly);
      } else {
        hourly = location.hourlyData[hourlyIndex];
        const newCount = hourly.count + 1;
        hourly.avg = (hourly.avg * hourly.count + value) / newCount;
        hourly.max = Math.max(hourly.max, value);
        hourly.min = Math.min(hourly.min, value);
        hourly.count = newCount;
      }

      // Update overall stats
      const newTotalReadings = location.totalReadings + 1;
      location.overallAvg = (location.overallAvg * location.totalReadings + value) / newTotalReadings;
      location.totalReadings = newTotalReadings;
      location.overallMax = Math.max(location.overallMax, value);
      location.overallMin = Math.min(location.overallMin === Infinity ? value : location.overallMin, value);
      location.lastUpdated = now.toISOString();

      // Track danger/warning counts
      if (value >= dangerThreshold) {
        location.dangerCount++;
      } else if (value >= warningThreshold) {
        location.warningCount++;
      }

      const newData = {
        ...prev,
        locations: {
          ...prev.locations,
          [locationId]: location,
        },
      };

      saveAnalyticsToStorage(newData);
      return newData;
    });
  }, [warningThreshold, dangerThreshold]);

  // Get summary for date range
  const getSummary = useCallback((days: number) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffTime = cutoffDate.getTime();

    const locationSummaries = Object.values(analytics.locations).map(loc => {
      const filteredHourly = loc.hourlyData.filter(
        h => new Date(h.hour).getTime() > cutoffTime
      );

      if (filteredHourly.length === 0) {
        return null;
      }

      const totalReadings = filteredHourly.reduce((sum, h) => sum + h.count, 0);
      const weightedSum = filteredHourly.reduce((sum, h) => sum + h.avg * h.count, 0);
      const avg = totalReadings > 0 ? weightedSum / totalReadings : 0;
      const max = Math.max(...filteredHourly.map(h => h.max));
      const min = Math.min(...filteredHourly.map(h => h.min));

      return {
        locationId: loc.locationId,
        locationName: loc.locationName,
        totalReadings,
        avg: Math.round(avg * 10) / 10,
        max,
        min,
        dangerCount: loc.dangerCount,
        warningCount: loc.warningCount,
        hourlyData: filteredHourly,
      };
    }).filter(Boolean);

    // Sort by max value descending
    locationSummaries.sort((a, b) => (b?.max || 0) - (a?.max || 0));

    return locationSummaries;
  }, [analytics.locations]);

  // Reset all data
  const resetData = useCallback(() => {
    const newData = getEmptyAnalytics();
    saveAnalyticsToStorage(newData);
    setAnalytics(newData);
  }, []);

  // Export data as JSON
  const exportAsJSON = useCallback(() => {
    return JSON.stringify(analytics, null, 2);
  }, [analytics]);

  // Export data as text
  const exportAsText = useCallback((days: number) => {
    const summary = getSummary(days);
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let text = `รายงานสรุปค่าควัน Smoke Detection System\n`;
    text += `=====================================\n\n`;
    text += `ช่วงเวลา: ${startDate.toLocaleDateString('th-TH')} - ${now.toLocaleDateString('th-TH')} (${days} วัน)\n`;
    text += `สร้างเมื่อ: ${now.toLocaleString('th-TH')}\n\n`;

    if (summary.length === 0) {
      text += `ไม่มีข้อมูลในช่วงเวลานี้\n`;
      return text;
    }

    text += `สรุปภาพรวม\n`;
    text += `-----------\n`;
    text += `จำนวนสถานที่: ${summary.length} แห่ง\n`;
    
    const totalReadings = summary.reduce((sum, s) => sum + (s?.totalReadings || 0), 0);
    text += `จำนวนการอ่านค่าทั้งหมด: ${totalReadings.toLocaleString()} ครั้ง\n\n`;

    text += `สถานที่ที่มีค่าสูงสุด\n`;
    text += `-------------------\n`;
    summary.slice(0, 5).forEach((s, i) => {
      if (s) {
        text += `${i + 1}. ${s.locationName}\n`;
        text += `   ค่าสูงสุด: ${s.max} PPM | ค่าเฉลี่ย: ${s.avg} PPM | ค่าต่ำสุด: ${s.min} PPM\n`;
        text += `   จำนวนครั้งที่อ่าน: ${s.totalReadings.toLocaleString()} ครั้ง\n`;
        text += `   แจ้งเตือนอันตราย: ${s.dangerCount} ครั้ง | เฝ้าระวัง: ${s.warningCount} ครั้ง\n\n`;
      }
    });

    text += `\nรายละเอียดทุกสถานที่\n`;
    text += `====================\n\n`;
    
    summary.forEach((s, i) => {
      if (s) {
        text += `${i + 1}. ${s.locationName} (${s.locationId})\n`;
        text += `   ค่าสูงสุด: ${s.max} PPM\n`;
        text += `   ค่าเฉลี่ย: ${s.avg} PPM\n`;
        text += `   ค่าต่ำสุด: ${s.min} PPM\n`;
        text += `   จำนวนการอ่าน: ${s.totalReadings.toLocaleString()} ครั้ง\n`;
        text += `   แจ้งเตือนอันตราย: ${s.dangerCount} ครั้ง\n`;
        text += `   แจ้งเตือนเฝ้าระวัง: ${s.warningCount} ครั้ง\n\n`;
      }
    });

    return text;
  }, [getSummary]);

  return {
    analytics,
    recordReading,
    getSummary,
    resetData,
    exportAsJSON,
    exportAsText,
    cleanupOldData,
  };
};
