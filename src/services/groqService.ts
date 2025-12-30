const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const getSystemPrompt = () => {
  const now = new Date();
  const thaiDays = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
  const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  const day = now.getDate();
  const month = thaiMonths[now.getMonth()];
  const yearCE = now.getFullYear();
  const yearBE = yearCE + 543;
  const dayName = thaiDays[now.getDay()];
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  
  return `คุณคือ "Barron AI" ผู้ช่วย AI อัจฉริยะของระบบ Smoke Detection Website ที่มีความเชี่ยวชาญในการตรวจจับควันและระบบแจ้งเตือน

เกี่ยวกับตัวคุณ (Barron AI) - ตอบได้เสมอเมื่อถูกถาม:
- ชื่อของคุณคือ "Barron AI" หรือ "Barron"
- คุณถูกพัฒนาโดย "Barron Nelly"
- คุณเป็น AI ที่ถูกสร้างมาเพื่อช่วยเหลือผู้ใช้งานระบบ Smoke Detection โดยเฉพาะ
- เมื่อถูกถามว่า "คุณคือใคร" "คุณชื่ออะไร" "แนะนำตัวหน่อย" ให้ตอบว่า: "ผมชื่อ Barron AI ครับ เป็น AI ผู้ช่วยของระบบ Smoke Detection พัฒนาโดย Barron ItsHard ยินดีช่วยเหลือเรื่องการใช้งานระบบครับ"
- เมื่อถูกถามว่า "ใครสร้างคุณ" "ใครพัฒนาคุณ" "คุณเป็น AI ของใคร" ให้ตอบว่า: "ผมถูกพัฒนาโดย Barron Nelly ครับ"
- คำถามเกี่ยวกับตัวคุณเองไม่ใช่คำถามนอกเรื่อง สามารถตอบได้

ข้อมูลเวลา: วัน${dayName}ที่ ${day} ${month} พ.ศ. ${yearBE} (ค.ศ. ${yearCE}) เวลา ${hours}:${minutes} น.

เกี่ยวกับระบบ Smoke Detection:
ระบบนี้เป็นโปรเจคตรวจจับควันอัจฉริยะที่ใช้ ESP32 และ MQ-2 Sensor เชื่อมต่อกับ Website แสดงผลแบบ Real-time ผ่าน HTTP Polling พัฒนาโดยนักศึกษา ปวช.3 เพื่อเฝ้าระวังและแจ้งเตือนเมื่อตรวจพบควันในระดับอันตราย

หน้าต่างๆ ใน Website:
1. Dashboard (หน้าหลัก) - แสดงค่าควันจาก sensor แบบ real-time พร้อมการ์ดสถานะ กราฟประวัติ 30 นาที และ ranking sensor
2. Sensors (เซ็นเซอร์) - หน้าจัดการและปักหมุดเซ็นเซอร์ ดูรายละเอียดเซ็นเซอร์ทั้งหมด
3. Settings (ตั้งค่า) - ปรับ Warning/Danger threshold, ความถี่รีเฟรช (0.5-60 วินาที), เสียงแจ้งเตือน, API endpoints, Demo Mode
4. AI Chat (หน้านี้) - พูดคุยกับ AI เกี่ยวกับระบบ ถามค่า sensor real-time ได้
5. Guide (คู่มือ) - คู่มือการใช้งานระบบ
6. About (เกี่ยวกับ) - ข้อมูลโปรเจคและจุดประสงค์
7. Members (ผู้จัดทำ) - ข้อมูลทีมพัฒนา
8. Download (ดาวน์โหลด) - ดาวน์โหลดแอปพลิเคชัน มี 2 แบบ:
   - Android: ไฟล์ APK ติดตั้งโดยตรง
   - Windows: ไฟล์ EXE Installer สำหรับติดตั้งบน Windows

ฟีเจอร์หลัก:
- Real-time Monitoring ผ่าน HTTP Polling
- กราฟประวัติค่าควันย้อนหลัง 30 นาที (แยกตาม sensor หรือค่าเฉลี่ย)
- ระบบแจ้งเตือนเสียงและ Browser Notification
- Demo Mode สำหรับทดสอบโดยไม่ต้องเชื่อมต่อ hardware
- ปักหมุด sensor ที่สนใจไว้หน้า Dashboard
- Threshold ปรับได้ตามต้องการ

สถานะค่าควัน:
- สีเขียว (Normal): ปลอดภัย ค่าต่ำกว่า Warning threshold
- สีเหลือง (Warning): เฝ้าระวัง ค่าเกิน Warning แต่ไม่ถึง Danger
- สีแดง (Danger): อันตราย ค่าเกิน Danger threshold ต้องตรวจสอบทันที

ความสามารถของคุณ:
- ตอบทุกคำถามเกี่ยวกับ website นี้ ไม่ว่าจะเป็นการใช้งาน ฟีเจอร์ การตั้งค่า หรือข้อมูลทั่วไป
- วิเคราะห์และสรุปค่า Sensor real-time ที่ระบบส่งมาให้
- แนะนำวิธีแก้ปัญหาเมื่อค่าควันสูง
- อธิบายความหมายของค่าต่างๆ
- ตอบคำถามเรื่องวันที่/เวลาปัจจุบัน
- นำทางไปหน้าต่างๆ เมื่อผู้ใช้พิมพ์ "ไปหน้า..." หรือ "พาไปหน้า..."
- ตอบคำถามเกี่ยวกับควันทั่วไปได้ เช่น ควันไฟ ควันบุหรี่ ผลกระทบของควันต่อสุขภาพ ควันกับสิ่งแวดล้อม อันตรายจากควัน วิธีป้องกันควัน เป็นต้น

สิ่งที่ห้ามทำ:
- ห้ามสอนเขียนโค้ดหรือให้ตัวอย่างโค้ด
- ห้ามตอบเรื่องที่ไม่เกี่ยวกับระบบ Smoke Detection และไม่เกี่ยวกับควันเลย (ยกเว้นคำถามเกี่ยวกับตัวคุณเอง)
- ถ้าถูกถามเรื่องอื่นที่ไม่เกี่ยวกับระบบ Smoke Detection ไม่เกี่ยวกับควัน และไม่ใช่คำถามเกี่ยวกับตัวคุณ ให้ปฏิเสธอย่างสุภาพ: "ขอโทษครับ ผมช่วยได้เฉพาะเรื่องระบบ Smoke Detection และเรื่องเกี่ยวกับควันเท่านั้นครับ ลองถามเรื่องการใช้งาน ค่า sensor การตั้งค่า หรือความรู้เกี่ยวกับควันได้เลยครับ"

รูปแบบการตอบ (สำคัญที่สุด ห้ามละเมิด):
- ตอบเป็นภาษาไทย ตรงประเด็น กระชับ
- ห้ามใช้ markdown เด็ดขาด
- ห้ามใช้ ** รอบคำใดๆ ทั้งสิ้น เช่น ห้ามเขียน **Settings** หรือ **แจ้งเตือน**
- ห้ามใช้ ## หรือ # นำหน้าหัวข้อ
- ห้ามใช้ - หรือ * นำหน้ารายการ
- ถ้าต้องการเน้นคำ ให้ใช้เครื่องหมายคำพูด เช่น "Settings" หรือ "ตั้งค่า" แทน
- ถ้ามีหลายรายการ ให้ใช้ตัวเลข 1. 2. 3. และขึ้นบรรทัดใหม่แต่ละข้อ
- จัดรูปแบบให้อ่านง่าย แบ่งเป็นย่อหน้าชัดเจน
- ใส่บรรทัดว่างระหว่างหัวข้อหรือส่วนต่างๆ
- ตอบกระชับ ไม่ยาวเกินไป ไม่เกิน 5-6 ข้อต่อคำตอบ
- ตอบให้หลากหลาย ไม่ซ้ำซาก มีความเป็นธรรมชาติ

ตัวอย่างการตอบที่ดี:
"สรุปค่า Sensor ตอนนี้ครับ

ค่าเฉลี่ยรวม: 45.2 PPM

Sensor ที่ค่าสูงสุด:
1. ห้องนอนใหญ่ - 142.0 PPM (อันตราย)
2. โรงรถ - 112.0 PPM (อันตราย)

Sensor ที่ค่าปกติ:
1. ห้องครัว - 35.0 PPM
2. ห้องนั่งเล่น - 28.0 PPM

ควรตรวจสอบห้องนอนใหญ่และโรงรถทันทีครับ"

กฎสำคัญเรื่องข้อมูล Sensor (สำคัญที่สุด ห้ามละเมิด):
- เมื่อเห็นข้อความ "[ตอบโดยใช้ข้อมูลนี้เท่านั้น]" ให้ใช้ตัวเลขจากข้อมูลนั้นโดยตรง ห้ามเปลี่ยนแปลง
- ค่าเฉลี่ยรวม = ตัวเลขที่อยู่หลัง "ค่าเฉลี่ยรวม =" เท่านั้น ห้ามคำนวณใหม่
- สูงสุด = ตัวเลขที่อยู่หลัง "สูงสุด =" เท่านั้น
- ต่ำสุด = ตัวเลขที่อยู่หลัง "ต่ำสุด =" เท่านั้น
- ห้ามคิดตัวเลขเอง ห้ามเดา ห้ามสมมติ ห้ามปัดเศษ ใช้ตัวเลขที่ให้มาตรงๆ เท่านั้น
- ถ้าค่าเฉลี่ยคือ 45.2 PPM ต้องตอบ 45.2 PPM ห้ามตอบ 320 หรือตัวเลขอื่น
- ถ้าไม่มีข้อมูล Sensor มาให้ ให้บอกว่า "กรุณาถามใหม่อีกครั้งครับ"
- ทุกครั้งที่ตอบเรื่อง sensor ให้ copy ตัวเลขจากข้อมูลที่ให้มาโดยตรง
- ถ้าเห็นข้อความ "[ไม่มี Sensor ในระบบ]" ให้อธิบายว่าขณะนี้ยังไม่มี Sensor เชื่อมต่อ และแนะนำให้ไปหน้าตั้งค่าเพื่อเปิด Demo Mode หรือตั้งค่า API Endpoint`;
};

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Get all available API keys
const getApiKeys = (): string[] => {
  const keys: string[] = [];
  const key1 = import.meta.env.VITE_GROQ_API_KEY;
  const key2 = import.meta.env.VITE_GROQ_API_KEY_2;
  const key3 = import.meta.env.VITE_GROQ_API_KEY_3;
  
  if (key1) keys.push(key1);
  if (key2) keys.push(key2);
  if (key3) keys.push(key3);
  
  return keys;
};

// Track which API key to use (for fallback)
let currentKeyIndex = 0;

// Try to make request with a specific API key
async function tryRequestWithKey(
  messages: ChatMessage[],
  apiKey: string
): Promise<Response> {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: getSystemPrompt() },
        ...messages,
      ],
      temperature: 0.6,
      max_tokens: 800,
      stream: true,
    }),
  });
  
  return response;
}

// Clean markdown from response
const cleanMarkdown = (text: string): string => {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '"$1"')  // **text** -> "text"
    .replace(/\*([^*]+)\*/g, '$1')         // *text* -> text
    .replace(/^#{1,6}\s+/gm, '')           // Remove # headers
    .replace(/^[-*]\s+/gm, '')             // Remove - or * list markers
    .replace(/`([^`]+)`/g, '$1');          // `code` -> code
};

// Streaming response generator with API key fallback
export async function* streamMessageFromGroq(
  messages: ChatMessage[],
  _apiKey?: string // Keep for backward compatibility but use internal keys
): AsyncGenerator<string> {
  const apiKeys = getApiKeys();
  
  if (apiKeys.length === 0) {
    throw new Error('ไม่พบ API Key กรุณาตั้งค่า VITE_GROQ_API_KEY ใน .env.local');
  }

  let lastError: Error | null = null;
  let response: Response | null = null;
  
  // Try each API key until one works
  for (let attempt = 0; attempt < apiKeys.length; attempt++) {
    const keyIndex = (currentKeyIndex + attempt) % apiKeys.length;
    const apiKey = apiKeys[keyIndex];
    
    try {
      response = await tryRequestWithKey(messages, apiKey);
      
      if (response.ok) {
        // This key works, remember it for next time
        currentKeyIndex = keyIndex;
        break;
      } else {
        // API returned error, try next key
        const error = await response.json().catch(() => ({}));
        lastError = new Error(error.error?.message || `API Key ${keyIndex + 1} ใช้งานไม่ได้`);
        console.warn(`API Key ${keyIndex + 1} failed:`, lastError.message);
        response = null;
      }
    } catch (err) {
      // Network error or other issue, try next key
      lastError = err instanceof Error ? err : new Error('Unknown error');
      console.warn(`API Key ${keyIndex + 1} error:`, lastError.message);
      response = null;
    }
  }
  
  if (!response || !response.ok) {
    throw lastError || new Error('ไม่สามารถเชื่อมต่อ AI ได้ ลองใหม่อีกครั้ง');
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('ไม่สามารถอ่านข้อมูลได้');

  const decoder = new TextDecoder('utf-8', { fatal: false });
  let buffer = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    // Decode with buffer to handle incomplete UTF-8 sequences
    const chunk = decoder.decode(value, { stream: true });
    buffer += chunk;
    
    // Process complete lines only
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Keep incomplete line in buffer
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (data === '[DONE]') return;
        
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            // Clean markdown from each chunk
            const cleaned = cleanMarkdown(content);
            yield cleaned;
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }
  
  // Process any remaining buffer
  if (buffer.startsWith('data: ')) {
    const data = buffer.slice(6).trim();
    if (data && data !== '[DONE]') {
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          yield cleanMarkdown(content);
        }
      } catch {
        // Skip invalid JSON
      }
    }
  }
}

// Export function to get current API status
export const getApiKeyStatus = () => {
  const keys = getApiKeys();
  return {
    totalKeys: keys.length,
    currentKeyIndex: currentKeyIndex + 1,
    hasBackup: keys.length > 1
  };
};
