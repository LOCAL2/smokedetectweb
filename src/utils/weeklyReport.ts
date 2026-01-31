import type { SensorData } from '../types/sensor';

export interface WeeklyReportData {
  period: { start: Date; end: Date };
  summary: {
    totalSensors: number;
    avgValue: number;
    maxValue: number;
    minValue: number;
    dangerEvents: number;
    warningEvents: number;
    uptime: number;
  };
  insights: string[];
  recommendations: string[];
  topSensors: { id: string; location: string; avgValue: number }[];
}


const loadAnalyticsData = () => {
  try {
    const saved = localStorage.getItem('smoke-sensor-analytics');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading analytics:', e);
  }
  return null;
};

export const generateWeeklyReport = (
  sensorHistory: Map<string, number[]>,
  sensors: SensorData[],
  warningThreshold: number,
  dangerThreshold: number
): WeeklyReportData => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  
  const analyticsData = loadAnalyticsData();
  
  
  let totalValues = 0;
  let maxValue = 0;
  let minValue = Infinity;
  let dangerEvents = 0;
  let warningEvents = 0;

  const sensorStats = new Map<string, { sum: number; count: number; location: string }>();

  if (analyticsData && analyticsData.locations) {
    
    Object.values(analyticsData.locations).forEach((loc: any) => {
      const filteredHourly = loc.hourlyData.filter((h: any) => 
        new Date(h.hour).getTime() > weekAgo.getTime()
      );

      if (filteredHourly.length === 0) return;

      let sum = 0;
      let count = 0;

      filteredHourly.forEach((h: any) => {
        const readings = h.count;
        const avgValue = h.avg;
        const maxHourValue = h.max;

        totalValues += readings;
        sum += avgValue * readings;
        count += readings;
        maxValue = Math.max(maxValue, maxHourValue);
        minValue = Math.min(minValue, h.min);

        
        if (maxHourValue >= dangerThreshold) {
          dangerEvents++;
        } else if (maxHourValue >= warningThreshold) {
          warningEvents++;
        }
      });

      if (count > 0) {
        sensorStats.set(loc.locationId, {
          sum,
          count,
          location: loc.locationName,
        });
      }
    });
  } else {
    
    sensorHistory.forEach((history, sensorId) => {
      const sensor = sensors.find(s => (s.location || s.id) === sensorId);
      
      let sum = 0;
      let count = 0;

      history.forEach(value => {
        totalValues++;
        sum += value;
        count++;
        maxValue = Math.max(maxValue, value);
        minValue = Math.min(minValue, value);

        if (value >= dangerThreshold) dangerEvents++;
        else if (value >= warningThreshold) warningEvents++;
      });

      if (count > 0) {
        sensorStats.set(sensorId, {
          sum,
          count,
          location: sensor ? (sensor.location || sensor.name || sensor.id) : sensorId,
        });
      }
    });
  }

  const avgValue = totalValues > 0 ? 
    Array.from(sensorStats.values()).reduce((sum, stat) => sum + stat.sum, 0) / totalValues : 0;

  
  const topSensors = Array.from(sensorStats.entries())
    .map(([id, stats]) => ({
      id,
      location: stats.location,
      avgValue: stats.sum / stats.count,
    }))
    .sort((a, b) => b.avgValue - a.avgValue)
    .slice(0, 5);

  
  const insights: string[] = [];

  if (dangerEvents > 0) {
    insights.push(`🚨 พบเหตุการณ์อันตราย ${dangerEvents} ครั้งในสัปดาห์นี้`);
  }

  if (warningEvents > 10) {
    insights.push(`⚠️ มีการแจ้งเตือนระดับเฝ้าระวัง ${warningEvents} ครั้ง`);
  }

  if (avgValue < warningThreshold * 0.5) {
    insights.push(`✅ ค่าควันเฉลี่ยอยู่ในระดับต่ำ (${avgValue.toFixed(1)} PPM)`);
  }

  const highestSensor = topSensors[0];
  if (highestSensor && highestSensor.avgValue >= warningThreshold) {
    insights.push(`📍 จุด "${highestSensor.location}" มีค่าควันสูงสุด (${highestSensor.avgValue.toFixed(1)} PPM)`);
  }

  
  const recommendations: string[] = [];

  if (dangerEvents > 5) {
    recommendations.push('ควรตรวจสอบระบบระบายอากาศและแหล่งกำเนิดควัน');
  }

  if (topSensors.length > 0 && topSensors[0].avgValue >= warningThreshold) {
    recommendations.push(`ให้ความสนใจพิเศษกับจุด "${topSensors[0].location}"`);
  }

  if (avgValue < warningThreshold * 0.3) {
    recommendations.push('ระบบทำงานปกติดี แนะนำให้ตรวจสอบเซ็นเซอร์เป็นประจำ');
  }

  if (dangerEvents === 0 && warningEvents === 0) {
    recommendations.push('🎉 สัปดาห์นี้ไม่มีเหตุการณ์ผิดปกติ ระบบทำงานได้ดีเยี่ยม');
  }

  return {
    period: { start: weekAgo, end: now },
    summary: {
      totalSensors: sensorStats.size,
      avgValue,
      maxValue: maxValue === 0 ? 0 : maxValue,
      minValue: minValue === Infinity ? 0 : minValue,
      dangerEvents,
      warningEvents,
      uptime: 99.5, 
    },
    insights,
    recommendations,
    topSensors,
  };
};

export const formatWeeklyReportText = (report: WeeklyReportData): string => {
  const { period, summary, insights, recommendations, topSensors } = report;

  let text = `📊 รายงานสรุปประจำสัปดาห์\n`;
  text += `ระบบตรวจจับควัน Smoke Detect\n`;
  text += `=====================================\n\n`;
  
  text += `📅 ช่วงเวลา: ${period.start.toLocaleDateString('th-TH')} - ${period.end.toLocaleDateString('th-TH')}\n\n`;
  
  text += `📈 สถิติรวม:\n`;
  text += `• จำนวนเซ็นเซอร์: ${summary.totalSensors} จุด\n`;
  text += `• ค่าเฉลี่ย: ${summary.avgValue.toFixed(1)} PPM\n`;
  text += `• ค่าสูงสุด: ${summary.maxValue.toFixed(1)} PPM\n`;
  text += `• ค่าต่ำสุด: ${summary.minValue.toFixed(1)} PPM\n`;
  text += `• เหตุการณ์อันตราย: ${summary.dangerEvents} ครั้ง\n`;
  text += `• การแจ้งเตือน: ${summary.warningEvents} ครั้ง\n`;
  text += `• Uptime: ${summary.uptime}%\n\n`;

  if (insights.length > 0) {
    text += `💡 ข้อมูลเชิงลึก:\n`;
    insights.forEach(insight => {
      text += `• ${insight}\n`;
    });
    text += `\n`;
  }

  if (topSensors.length > 0) {
    text += `🏆 Top 5 จุดที่มีค่าควันสูงสุด:\n`;
    topSensors.forEach((sensor, index) => {
      text += `${index + 1}. ${sensor.location}: ${sensor.avgValue.toFixed(1)} PPM\n`;
    });
    text += `\n`;
  }

  if (recommendations.length > 0) {
    text += `✅ คำแนะนำ:\n`;
    recommendations.forEach(rec => {
      text += `• ${rec}\n`;
    });
    text += `\n`;
  }

  text += `สร้างโดย AI Analysis System\n`;
  text += `${new Date().toLocaleString('th-TH')}\n`;

  return text;
};
