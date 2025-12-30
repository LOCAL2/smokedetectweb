---
inclusion: fileMatch
fileMatchPattern: "**/ChatBotPage.tsx"
---

# ChatBot Sync Rule

เมื่อแก้ไขไฟล์ `src/pages/ChatBotPage.tsx` ต้องตรวจสอบและอัพเดท `src/components/ChatBot/ChatBot.tsx` ด้วยเสมอ

## ไฟล์ที่เกี่ยวข้อง
- `src/pages/ChatBotPage.tsx` - หน้า Chat เต็มจอ (/chat)
- `src/components/ChatBot/ChatBot.tsx` - Popup ChatBot มุมขวาล่าง

## สิ่งที่ต้อง Sync
1. **Settings Commands** - คำสั่งปรับการตั้งค่า (polling, threshold, demo mode, etc.)
2. **Settings Query** - การถามค่าตั้งค่าปัจจุบัน
3. **Navigation** - การนำทางไปหน้าต่างๆ
4. **Sensor Query** - การถามข้อมูล sensor

## สิ่งที่ไม่ต้อง Sync (เพราะ popup จะนำทางไป /chat แทน)
- Map display
- Chart display  
- Download modal
- Sensor grid inline

## วิธีการ Sync
1. ตรวจสอบ function ที่แก้ไขใน ChatBotPage.tsx
2. หา function ที่เหมือนกันใน ChatBot.tsx
3. อัพเดทให้ตรงกัน (ถ้าเป็น feature ที่ popup รองรับ)

## ตัวอย่าง Functions ที่ต้อง Sync
- `checkSettingsCommand()` - ตรวจจับคำสั่งตั้งค่า
- `checkSettingsQuery()` - ตรวจจับการถามค่าตั้งค่า
- `checkNavigation()` - ตรวจจับการนำทาง
- `getSensorContext()` - สร้าง context ข้อมูล sensor
- `getThinkingSteps()` - ขั้นตอนการคิด

## สำคัญ
- ถ้าเพิ่ม feature ใหม่ที่ต้องแสดง UI พิเศษ (map, chart) ให้ใช้วิธีนำทางไป /chat แทน
- อย่าลืมอัพเดท `checkNeedsFullPage()` ใน ChatBot.tsx ถ้าเพิ่ม feature ใหม่ที่ต้องไป /chat
