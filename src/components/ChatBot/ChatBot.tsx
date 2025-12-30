import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader, Copy, Check, RefreshCw, ThumbsUp, ThumbsDown, Square, Mic, MicOff } from 'lucide-react';
import { streamMessageFromGroq, type ChatMessage } from '../../services/groqService';
import { useSensorDataContext } from '../../context/SensorDataContext';
import { useSettingsContext } from '../../context/SettingsContext';

const API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

interface ExtendedMessage extends ChatMessage {
  id: string;
  timestamp: number;
  liked?: boolean;
  disliked?: boolean;
}

const NAVIGATION_MAP: Record<string, { path: string; name: string }> = {
  'ตั้งค่า': { path: '/settings', name: 'หน้าตั้งค่า' },
  'setting': { path: '/settings', name: 'หน้าตั้งค่า' },
  'settings': { path: '/settings', name: 'หน้าตั้งค่า' },
  'เกี่ยวกับ': { path: '/about', name: 'หน้าเกี่ยวกับ' },
  'about': { path: '/about', name: 'หน้าเกี่ยวกับ' },
  'ผู้จัดทำ': { path: '/members', name: 'หน้าผู้จัดทำ' },
  'สมาชิก': { path: '/members', name: 'หน้าผู้จัดทำ' },
  'members': { path: '/members', name: 'หน้าผู้จัดทำ' },
  'คู่มือ': { path: '/guide', name: 'หน้าคู่มือ' },
  'guide': { path: '/guide', name: 'หน้าคู่มือ' },
  'ดาวน์โหลด': { path: '/download', name: 'หน้าดาวน์โหลด' },
  'download': { path: '/download', name: 'หน้าดาวน์โหลด' },
  'แอป': { path: '/download', name: 'หน้าดาวน์โหลด' },
  'หน้าหลัก': { path: '/', name: 'หน้าหลัก' },
  'dashboard': { path: '/', name: 'หน้าหลัก' },
  'เซ็นเซอร์': { path: '/sensors', name: 'หน้าเซ็นเซอร์' },
  'sensor': { path: '/sensors', name: 'หน้าเซ็นเซอร์' },
  'ปักหมุด': { path: '/sensors', name: 'หน้าเซ็นเซอร์' },
  'อัพเดท': { path: '/updates', name: 'หน้าอัพเดท' },
  'updates': { path: '/updates', name: 'หน้าอัพเดท' },
  'changelog': { path: '/updates', name: 'หน้าอัพเดท' },
};

const checkNavigation = (input: string): { path: string; name: string } | null => {
  const lower = input.toLowerCase();
  if (!lower.includes('ไป') && !lower.includes('เปิด') && !lower.includes('พา')) return null;
  for (const [keyword, nav] of Object.entries(NAVIGATION_MAP)) {
    if (lower.includes(keyword.toLowerCase())) return nav;
  }
  return null;
};

// Check if user wants features that require full page (map, chart, download)
const checkNeedsFullPage = (input: string): { type: 'map' | 'chart' | 'download' | null; query: string } => {
  const lower = input.toLowerCase();
  
  // Map keywords
  const mapKeywords = ['แผนที่', 'map', 'ตำแหน่ง', 'location', 'พิกัด', 'gps', 'ที่ตั้ง', 'อยู่ไหน'];
  if (mapKeywords.some(k => lower.includes(k))) {
    return { type: 'map', query: input };
  }
  
  // Chart keywords
  const chartKeywords = ['กราฟ', 'graph', 'chart', 'แสดงกราฟ', 'ดูกราฟ', 'ประวัติค่า', 'ประวัติควัน', 'แนวโน้ม', 'trend'];
  if (chartKeywords.some(k => lower.includes(k))) {
    return { type: 'chart', query: input };
  }
  
  // Download keywords (direct download request)
  const downloadKeywords = ['ดาวน์โหลด', 'download', 'โหลด'];
  const platformKeywords = ['android', 'apk', 'windows', 'exe', 'มือถือ', 'คอม'];
  if (downloadKeywords.some(k => lower.includes(k)) && platformKeywords.some(k => lower.includes(k))) {
    return { type: 'download', query: input };
  }
  
  return { type: null, query: '' };
};

// Settings command interface
interface SettingsCommand {
  type: 'polling' | 'warning' | 'danger' | 'demo' | 'sound' | 'notification';
  value?: number;
  enabled?: boolean;
  message: string;
}

// Check for settings commands (same as ChatBotPage)
const checkSettingsCommand = (input: string): SettingsCommand | null => {
  const lower = input.toLowerCase();
  
  // Polling interval
  const pollingMatch = lower.match(/(?:ปรับ|ตั้ง|เปลี่ยน)?.*(?:ความถี่|รีเฟรช|refresh|polling).*?(\d+(?:\.\d+)?)\s*(?:วิ|วินาที|s|sec)?/);
  if (pollingMatch) {
    const seconds = parseFloat(pollingMatch[1]);
    if (seconds >= 0.5 && seconds <= 30) {
      return { type: 'polling', value: seconds * 1000, message: `ปรับความถี่รีเฟรชเป็น ${seconds} วินาทีแล้วครับ` };
    }
  }
  
  // Warning threshold
  const warningMatch = lower.match(/(?:ปรับ|ตั้ง|เปลี่ยน)?.*(?:เฝ้าระวัง|warning).*?(\d+)/);
  if (warningMatch) {
    const value = parseInt(warningMatch[1]);
    if (value > 0 && value < 1000) {
      return { type: 'warning', value, message: `ปรับค่าเฝ้าระวังเป็น ${value} PPM แล้วครับ` };
    }
  }
  
  // Danger threshold
  const dangerMatch = lower.match(/(?:ปรับ|ตั้ง|เปลี่ยน)?.*(?:อันตราย|danger).*?(\d+)/);
  if (dangerMatch) {
    const value = parseInt(dangerMatch[1]);
    if (value > 0 && value < 1000) {
      return { type: 'danger', value, message: `ปรับค่าอันตรายเป็น ${value} PPM แล้วครับ` };
    }
  }
  
  // Demo mode
  if (lower.includes('demo')) {
    if (lower.includes('เปิด') || lower.includes('on') || lower.includes('enable')) {
      return { type: 'demo', enabled: true, message: 'เปิด Demo Mode แล้วครับ' };
    }
    if (lower.includes('ปิด') || lower.includes('off') || lower.includes('disable')) {
      return { type: 'demo', enabled: false, message: 'ปิด Demo Mode แล้วครับ' };
    }
  }
  
  // Sound alert
  if (lower.includes('เสียง') || lower.includes('sound')) {
    if (lower.includes('เปิด') || lower.includes('on')) {
      return { type: 'sound', enabled: true, message: 'เปิดเสียงแจ้งเตือนแล้วครับ' };
    }
    if (lower.includes('ปิด') || lower.includes('off')) {
      return { type: 'sound', enabled: false, message: 'ปิดเสียงแจ้งเตือนแล้วครับ' };
    }
  }
  
  // Notification
  if (lower.includes('notification') || lower.includes('แจ้งเตือน')) {
    if (lower.includes('เปิด') || lower.includes('on')) {
      return { type: 'notification', enabled: true, message: 'เปิด Notification แล้วครับ' };
    }
    if (lower.includes('ปิด') || lower.includes('off')) {
      return { type: 'notification', enabled: false, message: 'ปิด Notification แล้วครับ' };
    }
  }
  
  return null;
};

// Check for settings query (asking current values)
type SettingsQueryType = 'polling' | 'warning' | 'danger' | 'demo' | 'sound' | 'notification' | 'all';

const checkSettingsQuery = (input: string): SettingsQueryType | null => {
  const lower = input.toLowerCase();
  
  // Must contain question words
  const hasQuestion = ['เท่าไหร่', 'เท่าไร', 'อะไร', 'ยังไง', 'ตอนนี้', 'ปัจจุบัน', 'ค่า', 'สถานะ', 'ดู', 'แสดง', 'บอก', 'เปิดอยู่', 'ปิดอยู่'].some(w => lower.includes(w));
  if (!hasQuestion) return null;
  
  // Check for "all settings"
  if ((lower.includes('ตั้งค่า') || lower.includes('setting')) && (lower.includes('ทั้งหมด') || lower.includes('all'))) {
    return 'all';
  }
  
  if (lower.includes('ความถี่') || lower.includes('รีเฟรช') || lower.includes('refresh') || lower.includes('polling')) {
    return 'polling';
  }
  if (lower.includes('เฝ้าระวัง') || lower.includes('warning')) {
    return 'warning';
  }
  if (lower.includes('อันตราย') || lower.includes('danger')) {
    return 'danger';
  }
  if (lower.includes('demo')) {
    return 'demo';
  }
  if (lower.includes('เสียง') || lower.includes('sound')) {
    return 'sound';
  }
  if (lower.includes('notification')) {
    return 'notification';
  }
  
  return null;
};

const checkSensorQuery = (input: string): boolean => {
  const lower = input.toLowerCase();
  const keywords = ['sensor', 'เซ็นเซอร์', 'ค่าควัน', 'ค่า', 'สถานะ', 'ตอนนี้', 'สรุป', 'เท่าไหร่', 'ppm', 'เฉลี่ย', 'ทั้งหมด'];
  return keywords.some(k => lower.includes(k));
};

const getThinkingSteps = (input: string): string[] => {
  const lower = input.toLowerCase();
  
  // Download related
  if (['ดาวน์โหลด', 'download', 'โหลด', 'apk', 'exe', 'ติดตั้ง'].some(k => lower.includes(k))) {
    return ['ตรวจสอบแพลตฟอร์ม', 'เตรียมลิงก์', 'แสดงผล'];
  }
  
  // Health/Effect related
  if (['สุขภาพ', 'อันตราย', 'ผลกระทบ', 'เป็นอันตราย', 'health', 'effect'].some(k => lower.includes(k))) {
    return ['วิเคราะห์คำถาม', 'ค้นหาข้อมูลสุขภาพ', 'สรุปผล'];
  }
  
  // Prevention related
  if (['ป้องกัน', 'หลีกเลี่ยง', 'ลด', 'prevent', 'avoid'].some(k => lower.includes(k))) {
    return ['วิเคราะห์คำถาม', 'ค้นหาวิธีป้องกัน', 'สรุปคำแนะนำ'];
  }
  
  // Smoke types
  if (['ควันบุหรี่', 'ควันไฟ', 'ควันรถ', 'cigarette', 'fire smoke'].some(k => lower.includes(k))) {
    return ['วิเคราะห์ประเภทควัน', 'ค้นหาข้อมูล', 'สรุปผล'];
  }
  
  // Sensor related
  if (checkSensorQuery(input)) {
    return ['ดึงข้อมูล Sensor', 'วิเคราะห์ค่าควัน', 'สรุปผล'];
  }
  
  // Settings related
  if (['ตั้งค่า', 'setting', 'config', 'ปรับ', 'เปลี่ยน'].some(k => lower.includes(k))) {
    return ['ตรวจสอบการตั้งค่า', 'ดำเนินการ', 'ยืนยันผล'];
  }
  
  // Navigation
  if (['ไป', 'เปิด', 'พา', 'นำทาง'].some(k => lower.includes(k))) {
    return ['ค้นหาหน้า', 'เตรียมนำทาง'];
  }
  
  // Default
  return ['วิเคราะห์คำถาม', 'ค้นหาคำตอบ', 'สรุปผล'];
};

// Quick action prompts
const ALL_QUICK_PROMPTS = [
  'สรุปค่า Sensor ตอนนี้',
  'ตั้งค่า Threshold ยังไง',
  'ไปหน้าตั้งค่า',
  'Sensor ไหนค่าสูงสุด',
  'ค่าเฉลี่ยควันเท่าไหร่',
  'มี Sensor กี่ตัว',
  'วิธีดูกราฟ',
  'ไปหน้าดาวน์โหลด',
  'ไปหน้าคู่มือ',
  'เปิด Demo Mode ยังไง',
  'ปรับความถี่รีเฟรช',
  'ดูประวัติค่าควัน',
];

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const ChatBot = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sensors, stats } = useSensorDataContext();
  const { settings, updateSettings } = useSettingsContext();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [quickPrompts, setQuickPrompts] = useState<string[]>(() => shuffleArray(ALL_QUICK_PROMPTS).slice(0, 3));
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const shufflePrompts = () => {
    setQuickPrompts(shuffleArray(ALL_QUICK_PROMPTS).slice(0, 3));
  };

  const getSensorContext = () => {
    if (sensors.length === 0) {
      return `[ข้อมูล Sensor]
ไม่มีข้อมูล Sensor ในขณะนี้

สาเหตุที่เป็นไปได้:
1. ยังไม่ได้เปิด Demo Mode - ไปที่หน้าตั้งค่าเพื่อเปิด Demo Mode
2. ยังไม่ได้ตั้งค่า API Endpoint - ไปที่หน้าตั้งค่าเพื่อเพิ่ม API Endpoint

แนะนำให้ผู้ใช้ไปหน้าตั้งค่าเพื่อเปิด Demo Mode หรือเพิ่ม API Endpoint`;
    }
    
    const sorted = [...sensors].sort((a, b) => b.value - a.value);
    const lowest = [...sensors].sort((a, b) => a.value - b.value)[0];
    const sensorList = sensors.map(s => {
      const status = s.value >= settings.dangerThreshold ? '🔴 อันตราย' : 
                     s.value >= settings.warningThreshold ? '🟡 เฝ้าระวัง' : '🟢 ปลอดภัย';
      return `- ${s.location || s.id}: ${s.value.toFixed(1)} PPM (${status})`;
    }).join('\n');
    
    return `[ข้อมูล Sensor Real-time]
จำนวนเซ็นเซอร์ = ${stats.totalSensors} ตัว
ค่าเฉลี่ย = ${stats.averageValue.toFixed(1)} PPM
สูงสุด = ${sorted[0]?.location || sorted[0]?.id} (${sorted[0]?.value.toFixed(1)} PPM)
ต่ำสุด = ${lowest.location || lowest.id} (${lowest.value.toFixed(1)} PPM)
รายละเอียด:\n${sensorList}`;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, isThinking]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'th-TH';
      recognitionRef.current.onresult = (e: any) => setInput(Array.from(e.results).map((r: any) => r[0].transcript).join(''));
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
    else { recognitionRef.current.start(); setIsListening(true); }
  };

  const stopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
      setIsThinking(false);
      if (streamingText) {
        setMessages(prev => [...prev, { id: `msg-${Date.now()}`, role: 'assistant', content: streamingText + '\n[หยุด]', timestamp: Date.now() }]);
        setStreamingText('');
      }
    }
  };

  const copyText = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLike = (id: string, liked: boolean) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, liked, disliked: liked ? false : m.disliked } : m));
  };

  const handleDislike = (id: string, disliked: boolean) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, disliked, liked: disliked ? false : m.liked } : m));
  };

  const regenerate = async (idx: number) => {
    const userMsg = messages.slice(0, idx).reverse().find(m => m.role === 'user');
    if (!userMsg) return;
    setMessages(prev => prev.slice(0, idx));
    await handleSend(userMsg.content, true);
  };

  const handleSend = async (text?: string, isRegen = false) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;
    if (!API_KEY) {
      setMessages(prev => [...prev, { id: `msg-${Date.now()}`, role: 'user', content: msg, timestamp: Date.now() }, { id: `msg-${Date.now()+1}`, role: 'assistant', content: 'ไม่พบ API Key', timestamp: Date.now() }]);
      setInput('');
      return;
    }

    const userMessage: ExtendedMessage = { id: `msg-${Date.now()}`, role: 'user', content: msg, timestamp: Date.now() };
    const navTarget = checkNavigation(msg);
    const settingsQuery = checkSettingsQuery(msg);
    const settingsCommand = checkSettingsCommand(msg);
    const fullPageFeature = checkNeedsFullPage(msg);

    // Handle features that need full page (map, chart, download)
    if (fullPageFeature.type) {
      if (!isRegen) setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);
      
      const featureNames: Record<string, string> = { map: 'แผนที่', chart: 'กราฟ', download: 'ดาวน์โหลด' };
      const featureName = featureNames[fullPageFeature.type] || '';
      setThinkingSteps([`เตรียม${featureName}`, 'นำทางไปหน้า Chat']);
      setCurrentStep(0);
      setIsThinking(true);
      await new Promise(r => setTimeout(r, 500));
      setCurrentStep(1);
      await new Promise(r => setTimeout(r, 300));
      setIsThinking(false);
      
      setMessages(prev => [...prev, { 
        id: `msg-${Date.now()}`, 
        role: 'assistant', 
        content: `กำลังพาไปหน้า Chat เพื่อแสดง${featureName}ครับ...`, 
        timestamp: Date.now() 
      }]);
      
      await new Promise(r => setTimeout(r, 500));
      setIsLoading(false);
      setIsOpen(false);
      
      // Navigate to /chat with the query as state
      navigate('/chat', { state: { initialQuery: fullPageFeature.query } });
      return;
    }

    // Handle settings query (asking current values)
    if (settingsQuery) {
      if (!isRegen) setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);
      setThinkingSteps(['ดึงค่าตั้งค่า', 'สรุปข้อมูล']);
      setCurrentStep(0);
      setIsThinking(true);
      await new Promise(r => setTimeout(r, 400));
      setCurrentStep(1);
      await new Promise(r => setTimeout(r, 300));
      setIsThinking(false);
      
      let response = '';
      switch (settingsQuery) {
        case 'polling':
          response = `ความถี่รีเฟรชปัจจุบัน: ${(settings.pollingInterval / 1000).toFixed(1)} วินาที`;
          break;
        case 'warning':
          response = `ค่าเฝ้าระวังปัจจุบัน: ${settings.warningThreshold} PPM`;
          break;
        case 'danger':
          response = `ค่าอันตรายปัจจุบัน: ${settings.dangerThreshold} PPM`;
          break;
        case 'demo':
          response = `Demo Mode: ${settings.demoMode ? 'เปิดอยู่' : 'ปิดอยู่'}`;
          break;
        case 'sound':
          response = `เสียงแจ้งเตือน: ${settings.enableSoundAlert ? 'เปิดอยู่' : 'ปิดอยู่'}`;
          break;
        case 'notification':
          response = `Notification: ${settings.enableNotification ? 'เปิดอยู่' : 'ปิดอยู่'}`;
          break;
        case 'all':
          response = `การตั้งค่าปัจจุบัน:
• ความถี่รีเฟรช: ${(settings.pollingInterval / 1000).toFixed(1)} วินาที
• ค่าเฝ้าระวัง: ${settings.warningThreshold} PPM
• ค่าอันตราย: ${settings.dangerThreshold} PPM
• Demo Mode: ${settings.demoMode ? 'เปิด' : 'ปิด'}
• เสียงแจ้งเตือน: ${settings.enableSoundAlert ? 'เปิด' : 'ปิด'}
• Notification: ${settings.enableNotification ? 'เปิด' : 'ปิด'}`;
          break;
      }
      
      setMessages(prev => [...prev, { 
        id: `msg-${Date.now()}`, 
        role: 'assistant', 
        content: response,
        timestamp: Date.now()
      }]);
      setIsLoading(false);
      return;
    }

    // Handle settings commands (change settings)
    if (settingsCommand) {
      if (!isRegen) setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);
      setThinkingSteps(['ตรวจสอบคำสั่ง', 'ปรับการตั้งค่า']);
      setCurrentStep(0);
      setIsThinking(true);
      await new Promise(r => setTimeout(r, 400));
      setCurrentStep(1);
      
      // Apply settings
      switch (settingsCommand.type) {
        case 'polling':
          updateSettings({ pollingInterval: settingsCommand.value! });
          break;
        case 'warning':
          updateSettings({ warningThreshold: settingsCommand.value! });
          break;
        case 'danger':
          updateSettings({ dangerThreshold: settingsCommand.value! });
          break;
        case 'demo':
          updateSettings({ demoMode: settingsCommand.enabled! });
          break;
        case 'sound':
          updateSettings({ enableSoundAlert: settingsCommand.enabled! });
          break;
        case 'notification':
          updateSettings({ enableNotification: settingsCommand.enabled! });
          break;
      }
      
      await new Promise(r => setTimeout(r, 300));
      setIsThinking(false);
      setMessages(prev => [...prev, { 
        id: `msg-${Date.now()}`, 
        role: 'assistant', 
        content: settingsCommand.message,
        timestamp: Date.now()
      }]);
      setIsLoading(false);
      return;
    }

    if (navTarget) {
      if (!isRegen) setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);
      setThinkingSteps(['ค้นหาหน้า', 'นำทาง']);
      setCurrentStep(0);
      setIsThinking(true);
      await new Promise(r => setTimeout(r, 800));
      setIsThinking(false);
      // Add response message before navigating
      setMessages(prev => [...prev, { 
        id: `msg-${Date.now()}`, 
        role: 'assistant', 
        content: `พาคุณไปยัง${navTarget.name}แล้วครับ`, 
        timestamp: Date.now() 
      }]);
      await new Promise(r => setTimeout(r, 500));
      setIsLoading(false);
      setIsOpen(false);
      navigate(navTarget.path);
      return;
    }

    if (!isRegen) setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    const steps = getThinkingSteps(msg);
    setThinkingSteps(steps);
    setCurrentStep(0);
    setIsThinking(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      for (let i = 0; i < steps.length; i++) { await new Promise(r => setTimeout(r, 500)); setCurrentStep(i); }
      await new Promise(r => setTimeout(r, 300));
      setIsThinking(false);

      let fullResponse = '';
      const isSensorQuery = checkSensorQuery(msg);
      const contextMsgs = messages.map(m => ({ role: m.role, content: m.content }));
      const msgsWithContext = isSensorQuery
        ? [...contextMsgs, { role: 'user' as const, content: `${msg}\n\n${getSensorContext()}` }]
        : [...contextMsgs, { role: 'user' as const, content: msg }];

      for await (const chunk of streamMessageFromGroq(msgsWithContext, API_KEY)) {
        if (controller.signal.aborted) break;
        fullResponse += chunk;
        setStreamingText(fullResponse);
      }

      if (!controller.signal.aborted) {
        setMessages(prev => [...prev, { id: `msg-${Date.now()}`, role: 'assistant', content: fullResponse, timestamp: Date.now() }]);
      }
      setStreamingText('');
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setIsThinking(false);
        setMessages(prev => [...prev, { id: `msg-${Date.now()}`, role: 'assistant', content: err.message || 'Error', timestamp: Date.now() }]);
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  if (!API_KEY || location.pathname === '/chat') return null;

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button 
        whileHover={{ scale: 1.1 }} 
        whileTap={{ scale: 0.95 }} 
        onClick={() => setIsOpen(!isOpen)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          position: 'fixed', 
          bottom: 'clamp(20px,4vw,28px)', 
          right: 'clamp(20px,4vw,28px)', 
          width: '60px', 
          height: '60px', 
          borderRadius: '16px', 
          background: isOpen ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' : 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', 
          border: 'none',
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          boxShadow: isOpen ? '0 8px 32px rgba(239,68,68,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset' : '0 8px 32px rgba(99,102,241,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset', 
          zIndex: 1002,
        }}
      >
        {isOpen ? <X size={26} color="#FFF" strokeWidth={2.5} /> : <MessageCircle size={26} color="#FFF" strokeWidth={2.5} />}
        
        {/* Pulse animation - only when closed */}
        {!isOpen && (
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '16px',
              border: '2px solid #6366F1',
            }}
          />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.3, originX: 1, originY: 1 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{ position: 'fixed', bottom: 'calc(clamp(20px,4vw,28px) + 70px)', right: 'clamp(16px,4vw,24px)', width: 'min(380px, calc(100vw - 32px))', height: 'min(520px, calc(100vh - 140px))', background: '#0F172A', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', zIndex: 1001, transformOrigin: 'bottom right' }}>
            
            {/* Header */}
            <div style={{ padding: 'clamp(12px,3vw,16px)', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={20} color="#FFF" />
                </div>
                <div>
                  <h3 style={{ color: '#FFF', fontSize: 14, fontWeight: 600, margin: 0 }}>AI Assistant</h3>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, margin: 0 }}>Smoke Detection</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {messages.length > 0 && (
                  <button onClick={() => { setMessages([]); setStreamingText(''); }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex' }}>
                    <RefreshCw size={14} color="#FFF" />
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex' }}>
                  <X size={16} color="#FFF" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 'clamp(12px,3vw,16px)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.length === 0 && !streamingText && !isThinking && (
                <div style={{ textAlign: 'center', padding: '24px 12px' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <MessageCircle size={24} color="#6366F1" />
                  </div>
                  <p style={{ color: '#F8FAFC', fontSize: 14, fontWeight: 500, margin: '0 0 4px' }}>สวัสดีครับ</p>
                  <p style={{ color: '#64748B', fontSize: 12, margin: '0 0 16px' }}>ถามเกี่ยวกับระบบได้เลย</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <AnimatePresence mode="wait">
                      {quickPrompts.map(q => (
                        <motion.button 
                          key={q}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          onClick={() => { setInput(q); setTimeout(() => handleSend(q), 50); }}
                          style={{ padding: '10px 14px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, color: '#A5B4FC', fontSize: 12, cursor: 'pointer', textAlign: 'center' }}
                        >
                          {q}
                        </motion.button>
                      ))}
                    </AnimatePresence>
                    <button 
                      onClick={shufflePrompts}
                      style={{ padding: '8px 14px', background: 'transparent', border: '1px dashed rgba(99,102,241,0.3)', borderRadius: 10, color: '#64748B', fontSize: 11, cursor: 'pointer', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    >
                      <RefreshCw size={12} />
                      ดู Prompt อื่น
                    </button>
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={msg.id} className="msg-box" style={{ display: 'flex', gap: 8, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: msg.role === 'user' ? '#3B82F6' : '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {msg.role === 'user' ? <User size={14} color="#FFF" /> : <Bot size={14} color="#FFF" />}
                  </div>
                  <div style={{ maxWidth: '80%' }}>
                    <div style={{ padding: '10px 14px', borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: msg.role === 'user' ? '#3B82F6' : '#1E293B', color: '#F8FAFC', fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.content}</div>
                    {msg.role === 'assistant' && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                        <button onClick={() => copyText(msg.content, msg.id)} style={{ background: copiedId === msg.id ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.1)', border: '1px solid ' + (copiedId === msg.id ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.2)'), borderRadius: 6, padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: copiedId === msg.id ? '#10B981' : '#A5B4FC', fontSize: 11, transition: 'all 0.2s' }}>
                          {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                          <span>{copiedId === msg.id ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                        </button>
                        <button onClick={() => regenerate(i)} style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: '#A5B4FC', fontSize: 11, transition: 'all 0.2s' }}>
                          <RefreshCw size={12} />
                          <span>ตอบใหม่</span>
                        </button>
                        <button onClick={() => handleLike(msg.id, !msg.liked)} style={{ background: msg.liked ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.1)', border: '1px solid ' + (msg.liked ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.2)'), borderRadius: 6, padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: msg.liked ? '#10B981' : '#A5B4FC', transition: 'all 0.2s' }}>
                          <ThumbsUp size={12} />
                        </button>
                        <button onClick={() => handleDislike(msg.id, !msg.disliked)} style={{ background: msg.disliked ? 'rgba(239,68,68,0.2)' : 'rgba(99,102,241,0.1)', border: '1px solid ' + (msg.disliked ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.2)'), borderRadius: 6, padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: msg.disliked ? '#EF4444' : '#A5B4FC', transition: 'all 0.2s' }}>
                          <ThumbsDown size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isThinking && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Bot size={14} color="#FFF" /></div>
                  <div style={{ background: '#1E293B', borderRadius: 14, padding: 12, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <Loader size={12} color="#3B82F6" className="spin" />
                      <span style={{ color: '#94A3B8', fontSize: 12 }}>{thinkingSteps.length} ขั้นตอน</span>
                      <span style={{ color: currentStep >= thinkingSteps.length - 1 ? '#10B981' : '#F59E0B', fontSize: 11, marginLeft: 'auto' }}>
                        {currentStep >= thinkingSteps.length - 1 ? '✓' : '...'}
                      </span>
                    </div>
                    {thinkingSteps.map((step, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                        <div style={{ width: 14, height: 14, borderRadius: '50%', background: idx <= currentStep ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${idx <= currentStep ? '#10B981' : '#475569'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {idx <= currentStep && <span style={{ color: '#10B981', fontSize: 8 }}>✓</span>}
                        </div>
                        <span style={{ color: idx <= currentStep ? '#F8FAFC' : '#64748B', fontSize: 11 }}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {streamingText && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Bot size={14} color="#FFF" /></div>
                  <div style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: '14px 14px 14px 4px', background: '#1E293B', color: '#F8FAFC', fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{streamingText}<span className="cursor" /></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: 'clamp(10px,2.5vw,14px)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', gap: 8, background: '#1E293B', borderRadius: 12, padding: 4 }}>
                {recognitionRef.current && (
                  <button onClick={toggleVoice} style={{ padding: '10px', background: isListening ? 'rgba(239,68,68,0.2)' : 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex' }}>
                    {isListening ? <MicOff size={16} color="#EF4444" /> : <Mic size={16} color="#94A3B8" />}
                  </button>
                )}
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  placeholder={isListening ? 'กำลังฟัง...' : 'ถามเกี่ยวกับระบบ...'}
                  disabled={isLoading && !abortController}
                  style={{ flex: 1, padding: '10px 12px', background: 'transparent', border: 'none', color: '#F8FAFC', fontSize: 13, outline: 'none', minWidth: 0 }} />
                {isLoading ? (
                  <button onClick={stopGeneration} style={{ padding: '10px 12px', background: 'rgba(239,68,68,0.2)', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex' }}>
                    <Square size={14} color="#EF4444" fill="#EF4444" />
                  </button>
                ) : (
                  <button onClick={() => handleSend()} disabled={!input.trim()} style={{ padding: '10px 12px', background: input.trim() ? '#6366F1' : '#374151', border: 'none', borderRadius: 8, cursor: input.trim() ? 'pointer' : 'not-allowed', display: 'flex' }}>
                    <Send size={14} color="#FFF" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .cursor{display:inline-block;width:2px;height:14px;background:#6366F1;margin-left:2px;animation:blink 1s infinite;vertical-align:middle}
        .spin{animation:spin 1s linear infinite}
        @keyframes blink{0%,50%{opacity:1}51%,100%{opacity:0}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
      `}</style>
    </>
  );
};
