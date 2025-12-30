---
inclusion: always
---

# Updates Tracking

เมื่อมีการสร้างฟีเจอร์ใหม่ หรือแก้ไขบัก หรือปรับปรุงระบบที่สำคัญ ให้อัพเดทไฟล์ `src/data/updates.json` ด้วย

## เมื่อไหร่ต้องอัพเดท
- สร้าง component/page ใหม่
- เพิ่มฟีเจอร์ใหม่ที่ผู้ใช้เห็นได้
- แก้ไขบักที่สำคัญ
- ปรับปรุง UI/UX ที่เห็นได้ชัด

## รูปแบบข้อมูล
```json
{
  "version": "x.x.x",
  "date": "YYYY-MM-DD",
  "title": "ชื่อ Update ภาษาไทย",
  "type": "feature | improvement | release | fix",
  "changes": [
    "รายละเอียดการเปลี่ยนแปลง 1",
    "รายละเอียดการเปลี่ยนแปลง 2"
  ]
}
```

## ประเภท (type)
- `feature` - ฟีเจอร์ใหม่
- `improvement` - ปรับปรุง
- `fix` - แก้ไขบัก
- `release` - เปิดตัวเวอร์ชันใหม่

## กฎการเพิ่ม version
- เพิ่ม patch (x.x.X) สำหรับ fix
- เพิ่ม minor (x.X.0) สำหรับ feature/improvement
- เพิ่ม major (X.0.0) สำหรับ release ใหญ่

## ตัวอย่าง
เมื่อเพิ่มฟีเจอร์ใหม่ ให้เพิ่มข้อมูลใหม่ที่ **ด้านบนสุด** ของ array `updates` ในไฟล์ `src/data/updates.json`

## สำคัญ
- ใช้วันที่ปัจจุบัน (ดูจาก current_date_and_time)
- เขียนเป็นภาษาไทย
- อธิบายให้ผู้ใช้ทั่วไปเข้าใจ
