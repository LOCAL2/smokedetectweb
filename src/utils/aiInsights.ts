import type { SensorData } from '../types/sensor';

export interface AIInsight {
  id: string;
  type: 'warning' | 'info' | 'danger' | 'success';
  title: string;
  message: string;
  sensorId?: string;
  sensorName?: string;
  timestamp: number;
  priority: number; 
  action?: string;
}

export interface TrendAnalysis {
  direction: 'increasing' | 'decreasing' | 'stable';
  changePercent: number;
  timeWindow: number; 
  prediction: 'safe' | 'warning' | 'danger';
  estimatedTimeToThreshold?: number; 
}



export const analyzeTrend = (
  history: number[],
  currentValue: number,
  warningThreshold: number,
  dangerThreshold: number
): TrendAnalysis => {
  if (history.length < 2) {
    return {
      direction: 'stable',
      changePercent: 0,
      timeWindow: 0,
      prediction: 'safe',
    };
  }

  
  const recentHistory = history.slice(-10);
  const oldValue = recentHistory[0];
  const changePercent = ((currentValue - oldValue) / oldValue) * 100;

  
  let direction: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (Math.abs(changePercent) > 5) {
    direction = changePercent > 0 ? 'increasing' : 'decreasing';
  }

  
  const timeWindow = recentHistory.length * 0.5; 
  const rateOfChange = (currentValue - oldValue) / timeWindow;

  
  let prediction: 'safe' | 'warning' | 'danger' = 'safe';
  let estimatedTimeToThreshold: number | undefined;

  if (direction === 'increasing' && rateOfChange > 0) {
    if (currentValue >= dangerThreshold) {
      prediction = 'danger';
    } else if (currentValue >= warningThreshold) {
      prediction = 'warning';
      
      const timeToThreshold = (dangerThreshold - currentValue) / rateOfChange;
      if (timeToThreshold < 10) {
        estimatedTimeToThreshold = Math.round(timeToThreshold);
      }
    } else {
      
      const timeToWarning = (warningThreshold - currentValue) / rateOfChange;
      if (timeToWarning < 5) {
        prediction = 'warning';
        estimatedTimeToThreshold = Math.round(timeToWarning);
      }
    }
  }

  return {
    direction,
    changePercent: Math.abs(changePercent),
    timeWindow,
    prediction,
    estimatedTimeToThreshold,
  };
};



export const generateInsights = (
  sensors: SensorData[],
  sensorHistory: Map<string, number[]>,
  warningThreshold: number,
  dangerThreshold: number
): AIInsight[] => {
  const insights: AIInsight[] = [];
  const now = Date.now();

  
  sensors.forEach((sensor) => {
    const history = sensorHistory.get(sensor.id) || [];
    
    
    if (sensor.value >= dangerThreshold) {
      insights.push({
        id: `current-danger-${sensor.id}-${now}`,
        type: 'danger',
        title: '🚨 ตรวจพบค่าควันระดับอันตราย',
        message: `${sensor.location || sensor.name || sensor.id} มีค่าควัน ${sensor.value.toFixed(1)} PPM ซึ่งสูงกว่าเกณฑ์อันตราย (${dangerThreshold} PPM) ต้องดำเนินการทันที`,
        sensorId: sensor.id,
        sensorName: sensor.location || sensor.name || sensor.id,
        timestamp: now,
        priority: 5,
        action: 'ดำเนินการทันที',
      });
    } else if (sensor.value >= warningThreshold) {
      insights.push({
        id: `current-warning-${sensor.id}-${now}`,
        type: 'warning',
        title: '⚠️ ค่าควันสูงกว่าปกติ',
        message: `${sensor.location || sensor.name || sensor.id} มีค่าควัน ${sensor.value.toFixed(1)} PPM ซึ่งสูงกว่าเกณฑ์เตือน (${warningThreshold} PPM) ควรตรวจสอบพื้นที่และระบายอากาศ`,
        sensorId: sensor.id,
        sensorName: sensor.location || sensor.name || sensor.id,
        timestamp: now,
        priority: 3,
        action: 'ควรตรวจสอบพื้นที่',
      });
    }

    
    if (history.length < 2) return;
    
    const trend = analyzeTrend(history, sensor.value, warningThreshold, dangerThreshold);

    
    if (trend.direction === 'increasing' && trend.changePercent > 20) {
      insights.push({
        id: `rapid-increase-${sensor.id}-${now}`,
        type: trend.prediction === 'danger' ? 'danger' : 'warning',
        title: '⚠️ ตรวจพบค่าควันเพิ่มขึ้นอย่างรวดเร็ว',
        message: `${sensor.location || sensor.name || sensor.id} มีค่าควันเพิ่มขึ้น ${trend.changePercent.toFixed(1)}% จาก ${(sensor.value / (1 + trend.changePercent/100)).toFixed(1)} เป็น ${sensor.value.toFixed(1)} PPM ใน ${trend.timeWindow.toFixed(0)} นาทีที่ผ่านมา${
          trend.estimatedTimeToThreshold
            ? ` คาดว่าจะถึงระดับอันตรายใน ${trend.estimatedTimeToThreshold} นาที`
            : ''
        }`,
        sensorId: sensor.id,
        sensorName: sensor.location || sensor.name || sensor.id,
        timestamp: now,
        priority: trend.prediction === 'danger' ? 5 : 4,
        action: 'ตรวจสอบพื้นที่โดยด่วน',
      });
    }

    
    if (trend.estimatedTimeToThreshold && trend.estimatedTimeToThreshold < 5) {
      insights.push({
        id: `predictive-${sensor.id}-${now}`,
        type: 'warning',
        title: '🔮 การพยากรณ์: ใกล้ถึงเกณฑ์อันตราย',
        message: `${sensor.location || sensor.name || sensor.id} มีค่าควันปัจจุบัน ${sensor.value.toFixed(1)} PPM และมีแนวโน้มจะถึงระดับอันตราย (${dangerThreshold} PPM) ภายใน ${trend.estimatedTimeToThreshold} นาที หากค่าควันยังคงเพิ่มขึ้นในอัตราปัจจุบัน`,
        sensorId: sensor.id,
        sensorName: sensor.location || sensor.name || sensor.id,
        timestamp: now,
        priority: 4,
        action: 'เตรียมพร้อมรับมือ',
      });
    }

    
    if (sensor.value >= dangerThreshold && history.length >= 5) {
      const recentHigh = history.slice(-5).every(v => v >= dangerThreshold);
      if (recentHigh) {
        insights.push({
          id: `sustained-danger-${sensor.id}-${now}`,
          type: 'danger',
          title: '🚨 ค่าควันสูงต่อเนื่อง',
          message: `${sensor.location || sensor.name || sensor.id} มีค่าควัน ${sensor.value.toFixed(1)} PPM อยู่ในระดับอันตราย (>${dangerThreshold} PPM) ต่อเนื่องมากกว่า 2.5 นาที ต้องดำเนินการทันที`,
          sensorId: sensor.id,
          sensorName: sensor.location || sensor.name || sensor.id,
          timestamp: now,
          priority: 5,
          action: 'อพยพและแจ้งหน่วยงานที่เกี่ยวข้อง',
        });
      }
    }

    
    if (trend.direction === 'decreasing' && trend.changePercent > 30 && sensor.value < warningThreshold) {
      const wasHigh = history.slice(-5, -1).some(v => v >= warningThreshold);
      if (wasHigh) {
        insights.push({
          id: `sudden-drop-${sensor.id}-${now}`,
          type: 'success',
          title: '✅ ค่าควันลดลงอย่างรวดเร็ว',
          message: `${sensor.location || sensor.name || sensor.id} มีค่าควันลดลง ${trend.changePercent.toFixed(1)}% จาก ${(sensor.value * (1 + trend.changePercent/100)).toFixed(1)} เป็น ${sensor.value.toFixed(1)} PPM กลับสู่ระดับปกติ (<${warningThreshold} PPM) สถานการณ์คลี่คลาย`,
          sensorId: sensor.id,
          sensorName: sensor.location || sensor.name || sensor.id,
          timestamp: now,
          priority: 2,
          action: 'ตรวจสอบพื้นที่เพื่อยืนยัน',
        });
      }
    }

    
    if (sensor.value < warningThreshold && trend.direction === 'stable') {
      const wasWarning = history.slice(-10, -5).some(v => v >= warningThreshold);
      if (wasWarning && !insights.some(i => i.sensorId === sensor.id)) {
        insights.push({
          id: `all-clear-${sensor.id}-${now}`,
          type: 'info',
          title: '💚 สถานการณ์ปกติ',
          message: `${sensor.location || sensor.name || sensor.id} มีค่าควัน ${sensor.value.toFixed(1)} PPM กลับสู่ระดับปกติ (<${warningThreshold} PPM) และมีเสถียรภาพ`,
          sensorId: sensor.id,
          sensorName: sensor.location || sensor.name || sensor.id,
          timestamp: now,
          priority: 1,
        });
      }
    }
  });

  
  const dangerSensors = sensors.filter(s => s.value >= dangerThreshold);
  if (dangerSensors.length >= 2) {
    const locations = dangerSensors.map(s => s.location || s.name || s.id).join(', ');
    const maxValue = Math.max(...dangerSensors.map(s => s.value));
    insights.push({
      id: `multi-sensor-danger-${now}`,
      type: 'danger',
      title: '🔥 ตรวจพบควันหลายจุด',
      message: `พบค่าควันระดับอันตราย (>${dangerThreshold} PPM) ใน ${dangerSensors.length} จุด: ${locations} ค่าสูงสุด ${maxValue.toFixed(1)} PPM อาจเป็นเหตุการณ์ขนาดใหญ่`,
      timestamp: now,
      priority: 5,
      action: 'แจ้งเตือนฉุกเฉินและอพยพทันที',
    });
  }

  
  return insights.sort((a, b) => b.priority - a.priority);
};



export const generateAISummaryWithGroq = async (
  sensors: SensorData[],
  sensorHistory: Map<string, number[]>,
  warningThreshold: number,
  dangerThreshold: number,
  groqApiKey?: string
): Promise<string> => {
  if (!groqApiKey) {
    return getAISummary(sensors, warningThreshold, dangerThreshold);
  }

  try {
    const total = sensors.length;
    const danger = sensors.filter(s => s.value >= dangerThreshold).length;
    const warning = sensors.filter(s => s.value >= warningThreshold && s.value < dangerThreshold).length;
    const safe = sensors.filter(s => s.value < warningThreshold).length;
    const avgValue = sensors.reduce((sum, s) => sum + s.value, 0) / total;
    const maxSensor = sensors.reduce((max, s) => s.value > max.value ? s : max, sensors[0]);

    
    const trends: string[] = [];
    sensors.forEach(sensor => {
      const history = sensorHistory.get(sensor.id) || [];
      if (history.length >= 2) {
        const trend = analyzeTrend(history, sensor.value, warningThreshold, dangerThreshold);
        if (trend.direction === 'increasing' && trend.changePercent > 15) {
          trends.push(`${sensor.location || sensor.id} เพิ่มขึ้น ${trend.changePercent.toFixed(0)}%`);
        } else if (trend.direction === 'decreasing' && trend.changePercent > 15) {
          trends.push(`${sensor.location || sensor.id} ลดลง ${trend.changePercent.toFixed(0)}%`);
        }
      }
    });

    const prompt = `คุณเป็น AI ผู้เชี่ยวชาญด้านระบบตรวจจับควัน วิเคราะห์สถานการณ์และสรุปเป็นประโยคเดียวสั้นๆ (ไม่เกิน 100 ตัวอักษร) ภาษาไทย:

ข้อมูล:
- เซ็นเซอร์ทั้งหมด: ${total} จุด
- อันตราย: ${danger} จุด
- เตือน: ${warning} จุด  
- ปกติ: ${safe} จุด
- ค่าเฉลี่ย: ${avgValue.toFixed(1)} PPM
- ค่าสูงสุด: ${maxSensor.location || maxSensor.id} (${maxSensor.value.toFixed(1)} PPM)
${trends.length > 0 ? `- แนวโน้ม: ${trends.join(', ')}` : ''}

เกณฑ์: เตือน ${warningThreshold} PPM, อันตราย ${dangerThreshold} PPM

สรุปสถานการณ์แบบกระชับ เน้นสิ่งสำคัญที่ต้องรู้:`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      throw new Error('Groq API error');
    }

    const data = await response.json();
    const summary = data.choices[0]?.message?.content?.trim();
    
    if (summary) {
      
      if (danger > 0) return `🚨 ${summary}`;
      if (warning > 0) return `⚠️ ${summary}`;
      return `✅ ${summary}`;
    }
  } catch (error) {
    console.error('Error generating AI summary:', error);
  }

  
  return getAISummary(sensors, warningThreshold, dangerThreshold);
};



export const generateAIInsightsWithGroq = async (
  insights: AIInsight[],
  sensors: SensorData[],
  groqApiKey?: string
): Promise<AIInsight[]> => {
  if (!groqApiKey || insights.length === 0) {
    return insights;
  }

  try {
    
    const insightsToEnhance = insights.slice(0, 2);
    const remainingInsights = insights.slice(2);

    const enhancedInsights = await Promise.all(
      insightsToEnhance.map(async (insight) => {
        const sensor = sensors.find(s => s.id === insight.sensorId);
        if (!sensor) return insight;

        const prompt = `คุณเป็น AI ผู้เชี่ยวชาญด้านความปลอดภัย วิเคราะห์และอธิบายสถานการณ์นี้แบบละเอียด (100-120 ตัวอักษร):

สถานที่: ${sensor.location || sensor.id}
ค่าควัน: ${sensor.value.toFixed(1)} PPM
สถานะ: ${insight.type === 'danger' ? 'อันตราย' : 'เตือน'}
เกณฑ์: ${insight.type === 'danger' ? `อันตราย (${sensor.value >= 150 ? '150' : '100'} PPM)` : `เตือน (${sensor.value >= 100 ? '100' : '50'} PPM)`}

อธิบายสถานการณ์พร้อมระบุ:
1. ชื่อสถานที่
2. ค่าควันที่ตรวจพบ
3. เกณฑ์ที่เกิน
4. คำแนะนำสั้นๆ

ตัวอย่าง: "โรงรถ มีค่าควัน 57.0 PPM ซึ่งสูงกว่าเกณฑ์เตือน (50 PPM) ควรตรวจสอบพื้นที่และระบายอากาศ"

เขียนแบบเข้าใจง่าย มีรายละเอียดครบถ้วน:`;

        try {
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${groqApiKey}`,
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.7,
              max_tokens: 150,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const aiMessage = data.choices[0]?.message?.content?.trim();
            if (aiMessage) {
              return { ...insight, message: aiMessage };
            }
          }
        } catch (error) {
          console.error('Error enhancing insight:', error);
        }

        return insight;
      })
    );

    
    return [...enhancedInsights, ...remainingInsights];
  } catch (error) {
    console.error('Error enhancing insights with AI:', error);
    return insights;
  }
};



export const getAISummary = (
  sensors: SensorData[],
  warningThreshold: number,
  dangerThreshold: number
): string => {
  const total = sensors.length;
  const online = sensors.filter(s => s.isOnline).length;
  const danger = sensors.filter(s => s.value >= dangerThreshold).length;
  const warning = sensors.filter(s => s.value >= warningThreshold && s.value < dangerThreshold).length;
  const safe = sensors.filter(s => s.value < warningThreshold).length;
  const avgValue = sensors.reduce((sum, s) => sum + s.value, 0) / total;

  if (danger > 0) {
    return `🚨 สถานการณ์วิกฤต: พบควันระดับอันตราย ${danger} จุด ต้องดำเนินการทันที`;
  } else if (warning > 0) {
    return `⚠️ ต้องเฝ้าระวัง: มี ${warning} จุดที่ค่าควันสูงกว่าปกติ แนะนำให้ตรวจสอบ`;
  } else if (safe === total) {
    return `✅ ทุกอย่างปกติดี: ค่าควันทุกจุดอยู่ในเกณฑ์ปลอดภัย (เฉลี่ย ${avgValue.toFixed(1)} PPM)`;
  } else {
    return `📊 สถานะระบบ: ${online}/${total} เซ็นเซอร์ออนไลน์ ค่าเฉลี่ย ${avgValue.toFixed(1)} PPM`;
  }
};
