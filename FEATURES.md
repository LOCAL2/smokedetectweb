# 🚀 Smoke Detect System - Feature List

## ✨ Version 2.13.0 - WOW Factor Update

### 🎓 1. Interactive Onboarding Tour
**ไฟล์:** `src/components/Onboarding/OnboardingTour.tsx`

- แนะนำผู้ใช้ใหม่อัตโนมัติเมื่อเข้าใช้งานครั้งแรก
- Tour Guide แบบ step-by-step
- แสดงเฉพาะครั้งแรก (เก็บใน localStorage)
- สามารถข้ามหรือปิดได้ตลอดเวลา

**การใช้งาน:**
```tsx
import { OnboardingTour } from './components/Onboarding/OnboardingTour';

// เพิ่มใน App.tsx หรือ Dashboard
<OnboardingTour />
```

---

### 🎮 2. Try Demo Button
**ไฟล์:** `src/components/Dashboard/TryDemoButton.tsx`

- แสดงเมื่อไม่มีข้อมูล Sensor
- เปิด Demo Mode ได้ทันทีโดยไม่ต้องเข้า Settings
- UI สวยงามพร้อม animation
- ช่วยให้ผู้ใช้ทดลองระบบได้ทันที

**การใช้งาน:**
```tsx
import { TryDemoButton } from './components/Dashboard/TryDemoButton';

// แสดงเมื่อ sensors.length === 0
{sensors.length === 0 && <TryDemoButton />}
```

---

### 📱 3. Simple View Mode
**ไฟล์:** `src/components/Dashboard/SimpleView.tsx`

- โหมดแสดงผลแบบง่ายสำหรับหน้าจอเล็ก
- แสดงเฉพาะสถานะรวมและจุดที่มีปัญหา
- เหมาะสำหรับมือถือและ tablet
- ลดความซับซ้อนของ UI

**การใช้งาน:**
```tsx
import { SimpleView } from './components/Dashboard/SimpleView';

// ใช้แทน Dashboard ปกติบนมือถือ
{isMobile ? <SimpleView sensors={sensors} /> : <Dashboard />}
```

---

### 🤖 4. AI Insights & Predictive Analytics
**ไฟล์:** 
- `src/utils/aiInsights.ts` - Logic การวิเคราะห์
- `src/components/Dashboard/AIInsightsPanel.tsx` - UI Component

**ฟีเจอร์:**
- 🔮 **Predictive Alert** - พยากรณ์เมื่อใกล้ถึงเกณฑ์อันตราย
- 📈 **Trend Analysis** - วิเคราะห์การเปลี่ยนแปลงของค่าควัน
- ⚡ **Rapid Increase Detection** - ตรวจจับค่าควันเพิ่มขึ้นรวดเร็ว
- 🚨 **Multi-sensor Correlation** - ตรวจจับควันหลายจุดพร้อมกัน
- ✅ **Recovery Detection** - แจ้งเตือนเมื่อสถานการณ์คลี่คลาย
- 💚 **All Clear Status** - แจ้งเมื่อกลับสู่สภาวะปกติ

**การใช้งาน:**
```tsx
import { generateInsights, getAISummary } from './utils/aiInsights';
import { AIInsightsPanel } from './components/Dashboard/AIInsightsPanel';

const insights = generateInsights(sensors, sensorHistory, warningThreshold, dangerThreshold);
const summary = getAISummary(sensors, warningThreshold, dangerThreshold);

<AIInsightsPanel insights={insights} summary={summary} />
```

**ตัวอย่าง Insights:**
- "⚠️ ตรวจพบค่าควันเพิ่มขึ้น 25.3% ใน 3 นาทีที่ผ่านมา คาดว่าจะถึงระดับอันตรายใน 4 นาที"
- "🔮 การพยากรณ์: ห้องครัว มีแนวโน้มจะถึงระดับอันตรายภายใน 3 นาที"
- "🚨 ห้องนอน มีค่าควันอยู่ในระดับอันตรายต่อเนื่องมากกว่า 2.5 นาที"

---

### 📊 5. Weekly AI Report
**ไฟล์:** `src/utils/weeklyReport.ts`

**ฟีเจอร์:**
- สรุปสถิติรายสัปดาห์อัตโนมัติ
- วิเคราะห์แนวโน้มและให้คำแนะนำ
- Top 5 จุดที่มีค่าควันสูงสุด
- Export เป็น Text หรือ PDF

**การใช้งาน:**
```tsx
import { generateWeeklyReport, formatWeeklyReportText } from './utils/weeklyReport';

const report = generateWeeklyReport(sensorHistory, sensors, warningThreshold, dangerThreshold);
const reportText = formatWeeklyReportText(report);

// ดาวน์โหลดหรือส่งผ่าน LINE
console.log(reportText);
```

**ตัวอย่างรายงาน:**
```
📊 รายงานสรุปประจำสัปดาห์
ระบบตรวจจับควัน Smoke Detect
=====================================

📅 ช่วงเวลา: 18/01/2026 - 25/01/2026

📈 สถิติรวม:
• จำนวนเซ็นเซอร์: 5 จุด
• ค่าเฉลี่ย: 32.5 PPM
• ค่าสูงสุด: 185.2 PPM
• เหตุการณ์อันตราย: 2 ครั้ง
• การแจ้งเตือน: 15 ครั้ง

💡 ข้อมูลเชิงลึก:
• 🚨 พบเหตุการณ์อันตราย 2 ครั้งในสัปดาห์นี้
• 📍 จุด "ห้องครัว" มีค่าควันสูงสุด (78.3 PPM)

✅ คำแนะนำ:
• ควรตรวจสอบระบบระบายอากาศ
• ให้ความสนใจพิเศษกับจุด "ห้องครัว"
```

---

## 🎯 การใช้งานทั้งหมดใน Dashboard

```tsx
import { OnboardingTour } from './components/Onboarding/OnboardingTour';
import { TryDemoButton } from './components/Dashboard/TryDemoButton';
import { SimpleView } from './components/Dashboard/SimpleView';
import { AIInsightsPanel } from './components/Dashboard/AIInsightsPanel';
import { generateInsights, getAISummary } from './utils/aiInsights';

export const Dashboard = () => {
  const { sensors, sensorHistory } = useSensorDataContext();
  const { settings } = useSettingsContext();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // AI Insights
  const insights = generateInsights(
    sensors, 
    sensorHistory, 
    settings.warningThreshold, 
    settings.dangerThreshold
  );
  const summary = getAISummary(sensors, settings.warningThreshold, settings.dangerThreshold);

  return (
    <>
      <OnboardingTour />
      
      {sensors.length === 0 ? (
        <TryDemoButton />
      ) : isMobile ? (
        <SimpleView sensors={sensors} />
      ) : (
        <>
          <AIInsightsPanel insights={insights} summary={summary} />
          {/* Rest of dashboard */}
        </>
      )}
    </>
  );
};
```

---

## 📦 ไฟล์ที่สร้างใหม่

1. `src/components/Onboarding/OnboardingTour.tsx`
2. `src/components/Dashboard/TryDemoButton.tsx`
3. `src/components/Dashboard/SimpleView.tsx`
4. `src/components/Dashboard/AIInsightsPanel.tsx`
5. `src/utils/aiInsights.ts`
6. `src/utils/weeklyReport.ts`

---

## 🎨 Design Principles

- **Minimal & Clean** - UI สะอาดตา ไม่ซับซ้อน
- **Mobile-First** - รองรับมือถือเป็นหลัก
- **Animated** - ใช้ Framer Motion สำหรับ animation
- **Dark Mode** - รองรับ Dark/Light Mode ทั้งหมด
- **Accessible** - ใช้งานง่าย เข้าใจได้ทันที

---

## 🚀 Next Steps

1. เพิ่ม AI Insights Panel เข้า Dashboard
2. เพิ่ม Simple View toggle button
3. เพิ่มปุ่มดาวน์โหลด Weekly Report
4. เชื่อมต่อ LINE API สำหรับส่งรายงาน
5. เพิ่ม PDF export สำหรับรายงาน

---

**Created:** 2026-01-25  
**Version:** 2.13.0  
**Author:** Barron Nelly
