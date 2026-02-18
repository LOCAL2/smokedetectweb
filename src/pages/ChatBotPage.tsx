import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Bot, User, Loader, RotateCcw, ChevronDown,
  X, Activity, Copy, Check, RefreshCw, ThumbsUp, ThumbsDown, Square, Mic, MicOff,
  ArrowLeft, Download, Monitor, BarChart3
} from 'lucide-react';
import { streamMessageFromGroq, type ChatMessage } from '../services/groqService';
import { useSensorDataContext } from '../context/SensorDataContext';
import { useSettingsContext } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import { SmokeChart } from '../components/Dashboard/SmokeChart';
import { SensorMapView } from '../components/ChatBot/SensorMapView';
import { SensorGridInline } from '../components/ChatBot/SensorGridInline';
import type { SensorData } from '../types/sensor';

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
  'threshold': { path: '/settings', name: 'หน้าตั้งค่า' },
  'demo mode': { path: '/settings', name: 'หน้าตั้งค่า' },
  'รีเฟรช': { path: '/settings', name: 'หน้าตั้งค่า' },
  'แจ้งเตือน': { path: '/settings', name: 'หน้าตั้งค่า' },
  'mqtt': { path: '/settings', name: 'หน้าตั้งค่า' },
  'broker': { path: '/settings', name: 'หน้าตั้งค่า' },
  'gps': { path: '/settings', name: 'หน้าตั้งค่า' },
  'พิกัด': { path: '/settings', name: 'หน้าตั้งค่า' },
  'กราฟ': { path: '/', name: 'หน้าหลัก' },
  'อันดับ': { path: '/', name: 'หน้าหลัก' },
  'แผนที่': { path: '/sensors', name: 'หน้าเซ็นเซอร์' },
  'application': { path: '/download', name: 'หน้าดาวน์โหลด' },
  'โหลด': { path: '/download', name: 'หน้าดาวน์โหลด' },
};

const checkNavigation = (input: string): { path: string; name: string } | null => {
  const lower = input.toLowerCase();
  if (!lower.includes('ไป') && !lower.includes('เปิด') && !lower.includes('พา')) return null;
  for (const [keyword, nav] of Object.entries(NAVIGATION_MAP)) {
    if (lower.includes(keyword.toLowerCase())) return nav;
  }
  return null;
};


const checkRelatedPage = (input: string): { path: string; name: string } | null => {
  const lower = input.toLowerCase();
  
  const navPatterns = ['ไปหน้า', 'เปิดหน้า', 'พาไป', 'ไปที่'];
  if (navPatterns.some(p => lower.includes(p))) return null;

  for (const [keyword, nav] of Object.entries(NAVIGATION_MAP)) {
    if (lower.includes(keyword.toLowerCase())) return nav;
  }
  return null;
};


type DownloadPlatform = 'windows' | null;

const checkDownloadRequest = (input: string): DownloadPlatform => {
  const lower = input.toLowerCase();

  
  const downloadKeywords = ['ดาวน์โหลด', 'download', 'โหลด', 'ติดตั้ง', 'ขอไฟล์', 'ขอ exe'];
  const hasDownloadIntent = downloadKeywords.some(k => lower.includes(k));

  if (!hasDownloadIntent) return null;

  
  const windowsKeywords = ['windows', 'exe', 'คอม', 'computer', 'pc', 'วินโดว์', 'desktop'];

  const isWindows = windowsKeywords.some(k => lower.includes(k));

  if (isWindows) return 'windows';

  return null;
};


interface SettingsCommand {
  type: 'polling' | 'warning' | 'danger' | 'demo' | 'sound' | 'notification';
  value?: number;
  enabled?: boolean;
  message: string;
}

const checkSettingsCommand = (input: string): SettingsCommand | null => {
  const lower = input.toLowerCase();

  
  const pollingMatch = lower.match(/(?:ปรับ|ตั้ง|เปลี่ยน)?.*(?:ความถี่|รีเฟรช|refresh|polling).*?(\d+(?:\.\d+)?)\s*(?:วิ|วินาที|s|sec)?/);
  if (pollingMatch) {
    const seconds = parseFloat(pollingMatch[1]);
    if (seconds >= 0.5 && seconds <= 30) {
      return { type: 'polling', value: seconds * 1000, message: `ปรับความถี่รีเฟรชเป็น ${seconds} วินาทีแล้วครับ` };
    }
  }

  
  const warningMatch = lower.match(/(?:ปรับ|ตั้ง|เปลี่ยน)?.*(?:เฝ้าระวัง|warning).*?(\d+)/);
  if (warningMatch) {
    const value = parseInt(warningMatch[1]);
    if (value > 0 && value < 1000) {
      return { type: 'warning', value, message: `ปรับค่าเฝ้าระวังเป็น ${value} PPM แล้วครับ` };
    }
  }

  
  const dangerMatch = lower.match(/(?:ปรับ|ตั้ง|เปลี่ยน)?.*(?:อันตราย|danger).*?(\d+)/);
  if (dangerMatch) {
    const value = parseInt(dangerMatch[1]);
    if (value > 0 && value < 1000) {
      return { type: 'danger', value, message: `ปรับค่าอันตรายเป็น ${value} PPM แล้วครับ` };
    }
  }

  
  if (lower.includes('demo')) {
    if (lower.includes('เปิด') || lower.includes('on') || lower.includes('enable')) {
      return { type: 'demo', enabled: true, message: 'เปิด Demo Mode แล้วครับ' };
    }
    if (lower.includes('ปิด') || lower.includes('off') || lower.includes('disable')) {
      return { type: 'demo', enabled: false, message: 'ปิด Demo Mode แล้วครับ' };
    }
  }

  
  if (lower.includes('เสียง') || lower.includes('sound')) {
    if (lower.includes('เปิด') || lower.includes('on')) {
      return { type: 'sound', enabled: true, message: 'เปิดเสียงแจ้งเตือนแล้วครับ' };
    }
    if (lower.includes('ปิด') || lower.includes('off')) {
      return { type: 'sound', enabled: false, message: 'ปิดเสียงแจ้งเตือนแล้วครับ' };
    }
  }

  
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


type SettingsQueryType = 'polling' | 'warning' | 'danger' | 'demo' | 'sound' | 'notification' | 'all';

const checkSettingsQuery = (input: string): SettingsQueryType | null => {
  const lower = input.toLowerCase();

  
  const hasQuestion = ['เท่าไหร่', 'เท่าไร', 'อะไร', 'ยังไง', 'ตอนนี้', 'ปัจจุบัน', 'ค่า', 'สถานะ', 'ดู', 'แสดง', 'บอก'].some(w => lower.includes(w));
  if (!hasQuestion) return null;

  
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

const checkShowChart = (input: string): boolean => {
  const lower = input.toLowerCase();

  
  const excludeKeywords = ['ล้าง', 'ลบ', 'reset', 'clear', 'วิธี', 'ยังไง', 'อย่างไร'];
  if (excludeKeywords.some(k => lower.includes(k))) return false;

  
  const actionVerbs = ['แสดง', 'ดู', 'โชว์', 'show', 'display', 'ทำการแสดง', 'ขอดู', 'เปิด', 'ขอ'];
  
  const chartWords = ['กราฟ', 'graph', 'chart', 'แนวโน้ม', 'trend', 'ประวัติค่า', 'ประวัติควัน'];

  const hasAction = actionVerbs.some(v => lower.includes(v));
  const hasChartWord = chartWords.some(c => lower.includes(c));

  
  return hasChartWord || (hasAction && hasChartWord);
};


const checkChartViewMode = (input: string): 'average' | 'individual' | 'pinned' => {
  const lower = input.toLowerCase();

  
  const averageKeywords = ['ค่าเฉลี่ย', 'เฉลี่ย', 'average', 'avg', 'mean', 'รวม'];
  if (averageKeywords.some(k => lower.includes(k))) return 'average';

  
  const pinnedKeywords = ['ปักหมุด', 'pinned', 'pin', 'ที่ปักหมุด', 'เฉพาะปักหมุด'];
  if (pinnedKeywords.some(k => lower.includes(k))) return 'pinned';

  
  const individualKeywords = ['แยก', 'individual', 'แต่ละ', 'ทุกตัว', 'ทั้งหมด', 'แยกเซ็นเซอร์'];
  if (individualKeywords.some(k => lower.includes(k))) return 'individual';

  
  return 'individual';
};


const checkChartFullscreen = (input: string): boolean => {
  const lower = input.toLowerCase();
  const fullscreenKeywords = ['ขยาย', 'เต็มจอ', 'fullscreen', 'full screen', 'expand', 'ใหญ่', 'เต็มหน้าจอ', 'แบบใหญ่'];
  return fullscreenKeywords.some(k => lower.includes(k));
};

const checkShowMap = (input: string): boolean => {
  const lower = input.toLowerCase();
  
  const excludeKeywords = ['ล้าง', 'ลบ', 'reset', 'clear', 'วิธี', 'ยังไง', 'อย่างไร'];
  if (excludeKeywords.some(k => lower.includes(k))) return false;

  
  const actionVerbs = ['แสดง', 'ดู', 'โชว์', 'show', 'display', 'ทำการแสดง', 'ขอดู', 'เปิด', 'ขอ'];
  
  const mapWords = ['แผนที่', 'แมพ', 'map', 'ตำแหน่ง', 'location', 'พิกัด', 'gps', 'ที่ตั้ง'];
  
  const locationQuestions = ['อยู่ไหน', 'อยู่ที่ไหน', 'อยู่ตรงไหน', 'ตั้งอยู่'];

  const hasAction = actionVerbs.some(v => lower.includes(v));
  const hasMapWord = mapWords.some(m => lower.includes(m));
  const hasLocationQuestion = locationQuestions.some(q => lower.includes(q));

  
  return hasMapWord || (hasAction && hasMapWord) || hasLocationQuestion;
};


const checkMapSensorFilter = (input: string, sensors: SensorData[]): SensorData[] => {
  const lower = input.toLowerCase();

  
  if (lower.includes('ทั้งหมด') || lower.includes('all')) return sensors;

  
  const matchedSensors: SensorData[] = [];

  
  const locationKeywords = ['โรงรถ', 'ห้องนั่งเล่น', 'ห้องครัว', 'ห้องนอนใหญ่', 'ห้องนอนเล็ก', 'ชั้น 1', 'ชั้น 2', 'garage', 'living', 'kitchen', 'bedroom'];

  for (const sensor of sensors) {
    const location = (sensor.location || '').toLowerCase();
    const name = (sensor.name || '').toLowerCase();
    const id = sensor.id.toLowerCase();

    
    for (const keyword of locationKeywords) {
      if (lower.includes(keyword.toLowerCase()) &&
        (location.includes(keyword.toLowerCase()) || name.includes(keyword.toLowerCase()))) {
        if (!matchedSensors.find(s => s.id === sensor.id)) {
          matchedSensors.push(sensor);
        }
      }
    }

    
    if (lower.includes(location) && location.length > 2) {
      if (!matchedSensors.find(s => s.id === sensor.id)) {
        matchedSensors.push(sensor);
      }
    }
    if (lower.includes(name) && name.length > 2) {
      if (!matchedSensors.find(s => s.id === sensor.id)) {
        matchedSensors.push(sensor);
      }
    }
    if (lower.includes(id) && id.length > 2) {
      if (!matchedSensors.find(s => s.id === sensor.id)) {
        matchedSensors.push(sensor);
      }
    }
  }

  
  return matchedSensors.length > 0 ? matchedSensors : sensors;
};

const checkShowAllSensors = (input: string): boolean => {
  const lower = input.toLowerCase().trim();

  
  const actionVerbs = ['แสดง', 'ดู', 'โชว์', 'show', 'display', 'ทำการแสดง', 'ขอดู', 'เปิด', 'ขอ', 'list', 'ลิสต์'];
  
  const sensorWords = [
    'sensor', 'sensors',
    'เซ็นเซอร์', 'เซนเซอร์', 'เซ็นเซอ', 'เซนเซอ', 'เซ็นเซ', 'เซนเซ',
    'เซอเซอร์', 'เซอเซอ', 'เซอร์เซอร์', 'เซ็น', 'เซน'
  ];
  
  const locationKeywords = ['โรงรถ', 'ห้องนั่งเล่น', 'ห้องครัว', 'ห้องนอนใหญ่', 'ห้องนอนเล็ก', 'ห้องนอน', 'ชั้น 1', 'ชั้น 2', 'ชั้น1', 'ชั้น2'];

  const hasAction = actionVerbs.some(v => lower.includes(v));
  const hasSensor = sensorWords.some(s => lower.includes(s));
  const hasLocation = locationKeywords.some(l => lower.includes(l.toLowerCase()));

  
  if (hasLocation) return false;

  
  const isSensorOnly = sensorWords.some(s => lower === s || lower === s + 's');
  if (isSensorOnly) return true;

  
  
  const excludeKeywords = ['วิธี', 'ยังไง', 'อย่างไร', 'ตั้งค่า', 'เพิ่ม', 'ลบ', 'แก้ไข'];
  if (excludeKeywords.some(k => lower.includes(k))) return false;

  return hasAction && hasSensor;
};


const checkSpecificSensor = (input: string, sensors: SensorData[]): SensorData | null => {
  const lower = input.toLowerCase();

  
  const sensorKeywords = [
    'sensor', 'sensors', 'แสดง sensor', 'ดู sensor', 'ค่า sensor',
    'เซ็นเซอร์', 'เซนเซอร์', 'เซ็นเซอ', 'เซนเซอ', 'เซ็นเซ', 'เซนเซ',
    'เซอเซอร์', 'เซอเซอ', 'เซ็น', 'เซน'
  ];
  const hasSensorKeyword = sensorKeywords.some(k => lower.includes(k));
  if (!hasSensorKeyword) return null;

  
  if (lower.includes('ทั้งหมด') || lower.includes('all') || lower.includes('ทุกตัว')) return null;

  
  for (const sensor of sensors) {
    const location = (sensor.location || '').toLowerCase();
    const name = (sensor.name || '').toLowerCase();
    const id = sensor.id.toLowerCase();

    
    const locationKeywords = ['โรงรถ', 'ห้องนั่งเล่น', 'ห้องครัว', 'ห้องนอนใหญ่', 'ห้องนอนเล็ก', 'ชั้น 1', 'ชั้น 2', 'ห้องนอน'];
    for (const keyword of locationKeywords) {
      if (lower.includes(keyword.toLowerCase()) && (location.includes(keyword.toLowerCase()) || name.includes(keyword.toLowerCase()))) {
        return sensor;
      }
    }

    
    if (location && lower.includes(location)) return sensor;
    if (name && lower.includes(name)) return sensor;
    if (id && lower.includes(id)) return sensor;
  }
  return null;
};

const getThinkingSteps = (input: string): string[] => {
  const lower = input.toLowerCase();

  
  if (lower.includes('ดาวน์โหลด') || lower.includes('download') || lower.includes('exe') || lower.includes('แอป') || lower.includes('application') || lower.includes('ติดตั้ง')) {
    return ['ค้นหาไฟล์', 'ตรวจสอบเวอร์ชัน', 'เตรียมลิงก์'];
  }

  
  if (lower.includes('ผลกระทบ') || lower.includes('อันตราย') || lower.includes('สุขภาพ') || lower.includes('โรค')) {
    return ['วิเคราะห์หัวข้อ', 'ค้นหาข้อมูลสุขภาพ', 'สรุปผลกระทบ'];
  }

  
  if (lower.includes('ป้องกัน') || lower.includes('หลีกเลี่ยง') || lower.includes('แก้ไข')) {
    return ['วิเคราะห์ปัญหา', 'ค้นหาวิธีป้องกัน', 'สรุปคำแนะนำ'];
  }

  
  if (lower.includes('ลดควัน') || lower.includes('ลดค่า') || lower.includes('ทำให้ลด')) {
    return ['วิเคราะห์ปัญหา', 'ค้นหาวิธีลด', 'สรุปคำแนะนำ'];
  }

  
  if (lower.includes('บุหรี่') || lower.includes('สูบ') || lower.includes('cigarette') || lower.includes('tobacco')) {
    return ['วิเคราะห์คำถาม', 'ค้นหาข้อมูลควันบุหรี่', 'สรุปความรู้'];
  }

  
  if (lower.includes('ไฟไหม้') || lower.includes('เพลิง') || lower.includes('fire')) {
    return ['วิเคราะห์สถานการณ์', 'ค้นหาข้อมูลความปลอดภัย', 'สรุปวิธีรับมือ'];
  }

  
  if (lower.includes('สิ่งแวดล้อม') || lower.includes('โลกร้อน') || lower.includes('มลพิษ') || lower.includes('อากาศ')) {
    return ['วิเคราะห์ประเด็น', 'ค้นหาข้อมูลสิ่งแวดล้อม', 'สรุปผลกระทบ'];
  }

  
  if (lower.includes('วิธี') || lower.includes('ยังไง') || lower.includes('อย่างไร')) {
    return ['วิเคราะห์คำถาม', 'ค้นหาวิธีการ', 'สรุปขั้นตอน'];
  }

  
  if (lower.includes('ตอนนี้') || lower.includes('สรุปค่า') || lower.includes('ค่าเฉลี่ย') || lower.includes('สูงสุด') || lower.includes('ต่ำสุด') || lower.includes('sensor') || lower.includes('เซ็นเซอร์')) {
    return ['เชื่อมต่อ Sensor', 'ดึงข้อมูล Real-time', 'วิเคราะห์และสรุป'];
  }

  
  if (lower.includes('ตั้งค่า') || lower.includes('threshold') || lower.includes('setting')) {
    return ['ค้นหาการตั้งค่า', 'รวบรวมข้อมูล', 'สรุปวิธีการ'];
  }

  
  if (lower.includes('เปิด') || lower.includes('ปิด') || lower.includes('enable') || lower.includes('disable')) {
    return ['ตรวจสอบฟีเจอร์', 'ค้นหาวิธีการ', 'สรุปขั้นตอน'];
  }

  
  if (lower.includes('คุณคือ') || lower.includes('ชื่ออะไร') || lower.includes('ใครสร้าง') || lower.includes('แนะนำตัว')) {
    return ['รับคำถาม', 'เตรียมข้อมูล', 'แนะนำตัว'];
  }

  
  return ['วิเคราะห์คำถาม', 'ค้นหาคำตอบ', 'สรุปผล'];
};


const ALL_QUICK_ACTIONS = [
  
  { label: 'สรุปค่า Sensor ตอนนี้', query: 'สรุปค่า Sensor ตอนนี้' },
  { label: 'แสดง Sensor ทั้งหมด', query: 'แสดง Sensor ทั้งหมด' },
  { label: 'Sensor ไหนค่าสูงสุด', query: 'Sensor ไหนมีค่าสูงสุดตอนนี้' },
  { label: 'ค่าเฉลี่ยควันตอนนี้', query: 'ค่าเฉลี่ยควันตอนนี้เท่าไหร่' },
  { label: 'มี Sensor ออนไลน์กี่ตัว', query: 'ตอนนี้มี Sensor ออนไลน์กี่ตัว' },

  
  { label: 'ดู Sensor โรงรถ', query: 'แสดง sensor โรงรถ' },
  { label: 'ดู Sensor ห้องครัว', query: 'แสดง sensor ห้องครัว' },
  { label: 'ดู Sensor ห้องนั่งเล่น', query: 'แสดง sensor ห้องนั่งเล่น' },
  { label: 'ดู Sensor ห้องนอน', query: 'แสดง sensor ห้องนอน' },

  
  { label: 'ตั้งค่า Threshold ยังไง', query: 'วิธีตั้งค่า Threshold ในหน้าตั้งค่า' },
  { label: 'เปิด Demo Mode ยังไง', query: 'วิธีเปิด Demo Mode' },
  { label: 'ปรับความถี่รีเฟรชยังไง', query: 'วิธีปรับความถี่รีเฟรชข้อมูล' },
  { label: 'เปิดเสียงแจ้งเตือนยังไง', query: 'วิธีเปิดเสียงแจ้งเตือน' },
  { label: 'เชื่อมต่อ MQTT ยังไง', query: 'วิธีเชื่อมต่อ MQTT Broker' },
  { label: 'ตั้งค่าพิกัด GPS ยังไง', query: 'วิธีตั้งค่าพิกัด GPS เซ็นเซอร์' },
  { label: 'ล้างประวัติข้อมูลยังไง', query: 'วิธีล้างประวัติข้อมูล Sensor' },

  
  { label: 'ดูกราฟค่าควันยังไง', query: 'วิธีดูกราฟค่าควันในหน้าหลัก' },
  { label: 'ปักหมุด Sensor ยังไง', query: 'วิธีปักหมุด Sensor ที่สนใจ' },
  { label: 'ดูแผนที่ Sensor ยังไง', query: 'วิธีดูแผนที่ตำแหน่ง Sensor' },
  { label: 'ดูอันดับค่าควันยังไง', query: 'วิธีดูอันดับค่าควันสูงสุด' },
  { label: 'ดาวน์โหลดแอปยังไง', query: 'วิธีดาวน์โหลดแอป Windows' },

  
  { label: 'ไปหน้าตั้งค่า', query: 'ไปหน้าตั้งค่า' },
  { label: 'ไปหน้าเซ็นเซอร์', query: 'ไปหน้าเซ็นเซอร์' },
  { label: 'ไปหน้าคู่มือ', query: 'ไปหน้าคู่มือ' },
  { label: 'ไปหน้าดาวน์โหลด', query: 'ไปหน้าดาวน์โหลด' },

  
  { label: 'ค่าควันปกติเท่าไหร่', query: 'ค่าควันปกติควรอยู่ที่เท่าไหร่' },
  { label: 'ค่าสีเหลืองคืออะไร', query: 'ค่าควันสีเหลืองหมายความว่าอะไร' },
  { label: 'ค่าสีแดงคืออะไร', query: 'ค่าควันสีแดงหมายความว่าอะไร' },
  { label: 'ระบบแจ้งเตือนทำงานยังไง', query: 'ระบบแจ้งเตือนทำงานยังไง' },
];


const getRandomQuickActions = (count: number = 4) => {
  const shuffled = [...ALL_QUICK_ACTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const ChatBotPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings, updateSettings } = useSettingsContext();
  const { sensors, stats, history, sensorHistory } = useSensorDataContext();
  const { isDark } = useTheme();

  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null);
  const [showSensorButtons, setShowSensorButtons] = useState(false);
  const [filteredSensors, setFilteredSensors] = useState<SensorData[]>([]);
  const [sensorMessageId, setSensorMessageId] = useState<string | null>(null);
  const [showChart, setShowChart] = useState(false);
  const [chartMessageId, setChartMessageId] = useState<string | null>(null);
  const [chartViewMode, setChartViewMode] = useState<'average' | 'individual' | 'pinned'>('individual');
  const [chartFullscreen, setChartFullscreen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapMessageId, setMapMessageId] = useState<string | null>(null);
  const [mapFilteredSensors, setMapFilteredSensors] = useState<SensorData[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [quickActions, setQuickActions] = useState(() => getRandomQuickActions(4));
  const [, setSuggestedNav] = useState<{ path: string; name: string } | null>(null);
  const [downloadModal, setDownloadModal] = useState<{ show: boolean; platform: 'windows' | null }>({ show: false, platform: null });
  const [initialQueryProcessed, setInitialQueryProcessed] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  
  const handleDownloadConfirm = () => {
    if (!downloadModal.platform) return;

    const link = document.createElement('a');
    link.href = '/EXE/SmokeDetection_Setup_v1.0.0.exe';
    link.download = 'SmokeDetection_Setup_v1.0.0.exe';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadModal({ show: false, platform: null });

    
    setMessages(prev => [...prev, {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: `เริ่มดาวน์โหลดไฟล์สำหรับ Windows (EXE) แล้วครับ`,
      timestamp: Date.now()
    }]);
  };

  
  const getSensorContext = useCallback(() => {
    if (sensors.length === 0) {
      return `[ไม่มี Sensor ในระบบ]
ขณะนี้ยังไม่มี Sensor เชื่อมต่อกับระบบ

สาเหตุที่เป็นไปได้:
1. ยังไม่ได้เชื่อมต่อ Hardware (ESP32 + MQ-2)
2. MQTT Broker ยังไม่ได้เชื่อมต่อ
3. Demo Mode ปิดอยู่

แนะนำ: ไปที่หน้า "ตั้งค่า" เพื่อเปิด Demo Mode ทดสอบระบบ หรือตั้งค่า MQTT Broker เพื่อเชื่อมต่อ Sensor จริง`;
    }
    const sorted = [...sensors].sort((a, b) => b.value - a.value);
    const highest = sorted[0];
    const lowest = sorted[sorted.length - 1];
    const sensorList = sensors.map(s => {
      let status = 'ปกติ';
      if (s.value >= settings.dangerThreshold) status = 'อันตราย';
      else if (s.value >= settings.warningThreshold) status = 'เฝ้าระวัง';
      return `- ${s.location || s.id}: ${s.value.toFixed(1)} PPM (${status})`;
    }).join('\n');
    return `[ตอบโดยใช้ข้อมูลนี้เท่านั้น]
ค่าเฉลี่ยรวม = ${stats.averageValue.toFixed(1)} PPM
จำนวน Sensor = ${stats.totalSensors} ตัว
สูงสุด = ${highest.location || highest.id} (${highest.value.toFixed(1)} PPM)
ต่ำสุด = ${lowest.location || lowest.id} (${lowest.value.toFixed(1)} PPM)
รายละเอียด:\n${sensorList}`;
  }, [sensors, stats, settings]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, isThinking]);

  
  useEffect(() => {
    const state = location.state as { initialQuery?: string } | null;
    if (state?.initialQuery && !initialQueryProcessed) {
      setInitialQueryProcessed(true);
      
      window.history.replaceState({}, document.title);
      
      setTimeout(() => {
        handleSend(state.initialQuery);
      }, 300);
    }
  }, [location.state, initialQueryProcessed]);

  
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'th-TH';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = () => setIsListening(false);
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
      setIsThinking(false);
      if (streamingText) {
        setMessages(prev => [...prev, {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: streamingText + '\n\n[หยุดการตอบ]',
          timestamp: Date.now()
        }]);
        setStreamingText('');
      }
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLike = (id: string, liked: boolean) => {
    setMessages(prev => prev.map(m =>
      m.id === id ? { ...m, liked, disliked: liked ? false : m.disliked } : m
    ));
  };

  const handleDislike = (id: string, disliked: boolean) => {
    setMessages(prev => prev.map(m =>
      m.id === id ? { ...m, disliked, liked: disliked ? false : m.liked } : m
    ));
  };

  const regenerateResponse = async (messageIndex: number) => {
    const userMsg = messages.slice(0, messageIndex).reverse().find(m => m.role === 'user');
    if (!userMsg) return;

    
    setMessages(prev => prev.slice(0, messageIndex));
    await handleSend(userMsg.content, true);
  };

  const newChat = () => {
    setMessages([]);
    setShowSensorButtons(false);
    setSensorMessageId(null);
    setShowChart(false);
    setChartMessageId(null);
    setChartViewMode('individual');
    setChartFullscreen(false);
    setShowMap(false);
    setMapMessageId(null);
    setMapFilteredSensors([]);
    setFilteredSensors([]);
    setStreamingText('');
    setQuickActions(getRandomQuickActions(4));
    setSuggestedNav(null);
  };

  const handleSend = async (text?: string, isRegenerate = false) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;
    if (!API_KEY) {
      setMessages(prev => [...prev,
      { id: `msg-${Date.now()}`, role: 'user', content: messageText, timestamp: Date.now() },
      { id: `msg-${Date.now() + 1}`, role: 'assistant', content: 'ไม่พบ API Key', timestamp: Date.now() }
      ]);
      setInput('');
      return;
    }

    const userMessage: ExtendedMessage = { id: `msg-${Date.now()}`, role: 'user', content: messageText, timestamp: Date.now() };
    const navTarget = checkNavigation(messageText);
    const downloadPlatform = checkDownloadRequest(messageText);
    const wantsAllSensors = checkShowAllSensors(messageText);
    const wantsChart = checkShowChart(messageText);
    const wantsMap = checkShowMap(messageText);
    const specificSensor = checkSpecificSensor(messageText, sensors);
    const settingsCommand = checkSettingsCommand(messageText);
    const settingsQuery = checkSettingsQuery(messageText);

    
    if (downloadPlatform) {
      if (!isRegenerate) setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);
      setThinkingSteps(['ค้นหาไฟล์', 'ตรวจสอบเวอร์ชัน', 'เตรียมลิงก์']);
      setCurrentStep(0);
      setIsThinking(true);
      for (let i = 0; i < 3; i++) { await new Promise(r => setTimeout(r, 400)); setCurrentStep(i); }
      await new Promise(r => setTimeout(r, 300));
      setIsThinking(false);

      const platformName = 'Windows (EXE)';
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `พบไฟล์สำหรับ ${platformName} แล้วครับ กดปุ่มด้านล่างเพื่อยืนยันการดาวน์โหลด`,
        timestamp: Date.now()
      }]);

      setDownloadModal({ show: true, platform: downloadPlatform });
      setIsLoading(false);
      return;
    }

    
    if (wantsMap) {
      if (!isRegenerate) setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);
      setThinkingSteps(['ดึงข้อมูลพิกัด', 'สร้างแผนที่', 'แสดงผล']);
      setCurrentStep(0);
      setIsThinking(true);
      for (let i = 0; i < 3; i++) { await new Promise(r => setTimeout(r, 400)); setCurrentStep(i); }
      await new Promise(r => setTimeout(r, 300));
      setIsThinking(false);
      const msgId = `msg-${Date.now()}`;

      
      const filteredForMap = checkMapSensorFilter(messageText, sensors);
      setMapFilteredSensors(filteredForMap);
      setShowMap(true);
      setMapMessageId(msgId);

      
      let responseMsg = '';
      if (filteredForMap.length === sensors.length) {
        responseMsg = `แผนที่แสดงตำแหน่ง Sensor ทั้งหมด ${sensors.length} ตัว สามารถกรองดูเฉพาะสถานะที่ต้องการได้ครับ`;
      } else if (filteredForMap.length === 1) {
        const s = filteredForMap[0];
        responseMsg = `แผนที่แสดงตำแหน่ง "${s.location || s.name || s.id}" ค่าปัจจุบัน ${s.value.toFixed(1)} PPM ครับ`;
      } else {
        const names = filteredForMap.map(s => s.location || s.name || s.id).join(', ');
        responseMsg = `แผนที่แสดงตำแหน่ง ${filteredForMap.length} ตัว: ${names} ครับ`;
      }

      setMessages(prev => [...prev, {
        id: msgId, role: 'assistant',
        content: responseMsg,
        timestamp: Date.now()
      }]);
      setIsLoading(false);
      return;
    }

    
    if (wantsChart) {
      if (!isRegenerate) setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);
      setThinkingSteps(['ดึงข้อมูลประวัติ', 'สร้างกราฟ', 'แสดงผล']);
      setCurrentStep(0);
      setIsThinking(true);
      for (let i = 0; i < 3; i++) { await new Promise(r => setTimeout(r, 400)); setCurrentStep(i); }
      await new Promise(r => setTimeout(r, 300));
      setIsThinking(false);
      const msgId = `msg-${Date.now()}`;

      
      const viewMode = checkChartViewMode(messageText);
      const wantsFullscreen = checkChartFullscreen(messageText);
      setChartViewMode(viewMode);
      setChartFullscreen(wantsFullscreen);
      setShowChart(true);
      setChartMessageId(msgId);

      
      const viewModeText = viewMode === 'average' ? 'แบบค่าเฉลี่ย' : viewMode === 'pinned' ? 'เฉพาะที่ปักหมุด' : 'แยกตามเซ็นเซอร์';
      const fullscreenText = wantsFullscreen ? ' (แบบขยาย)' : '';
      setMessages(prev => [...prev, {
        id: msgId, role: 'assistant',
        content: `กราฟแสดงค่าควันย้อนหลัง 30 นาที ${viewModeText}${fullscreenText} สามารถเปลี่ยนโหมดได้ที่ปุ่มด้านบนครับ`,
        timestamp: Date.now()
      }]);
      setIsLoading(false);
      return;
    }

    
    if (settingsQuery) {
      if (!isRegenerate) setMessages(prev => [...prev, userMessage]);
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
          response = `Demo Mode: ${settings.demoMode ? 'เปิด' : 'ปิด'}`;
          break;
        case 'sound':
          response = `เสียงแจ้งเตือน: ${settings.enableSoundAlert ? 'เปิด' : 'ปิด'}`;
          break;
        case 'notification':
          response = `Notification: ${settings.enableNotification ? 'เปิด' : 'ปิด'}`;
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

    
    if (settingsCommand) {
      if (!isRegenerate) setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);
      setThinkingSteps(['ตรวจสอบคำสั่ง', 'ปรับการตั้งค่า']);
      setCurrentStep(0);
      setIsThinking(true);
      await new Promise(r => setTimeout(r, 400));
      setCurrentStep(1);

      
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

    
    if (specificSensor) {
      if (!isRegenerate) setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);
      setThinkingSteps(['ค้นหา Sensor', 'ดึงข้อมูล Real-time']);
      setCurrentStep(0);
      setIsThinking(true);
      for (let i = 0; i < 2; i++) { await new Promise(r => setTimeout(r, 400)); setCurrentStep(i); }
      await new Promise(r => setTimeout(r, 300));
      setIsThinking(false);
      const msgId = `msg-${Date.now()}`;
      setShowSensorButtons(true);
      setSensorMessageId(msgId);
      setFilteredSensors([specificSensor]);
      setMessages(prev => [...prev, {
        id: msgId, role: 'assistant',
        content: `พบ Sensor "${specificSensor.location || specificSensor.id}" กดที่ปุ่มด้านล่างเพื่อดูรายละเอียด Real-time`,
        timestamp: Date.now()
      }]);
      setIsLoading(false);
      return;
    }

    
    if (wantsAllSensors) {
      if (!isRegenerate) setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);
      setThinkingSteps(['เชื่อมต่อฐานข้อมูล', 'ดึงข้อมูล Real-time', 'เตรียมแสดงผล']);
      setCurrentStep(0);
      setIsThinking(true);
      for (let i = 0; i < 3; i++) { await new Promise(r => setTimeout(r, 400)); setCurrentStep(i); }
      await new Promise(r => setTimeout(r, 300));
      setIsThinking(false);
      const msgId = `msg-${Date.now()}`;
      setShowSensorButtons(true);
      setSensorMessageId(msgId);
      setFilteredSensors([...sensors].sort((a, b) => b.value - a.value));
      setMessages(prev => [...prev, {
        id: msgId, role: 'assistant',
        content: `พบ ${sensors.length} Sensor ในระบบ กดที่ปุ่มด้านล่างเพื่อดูรายละเอียด Real-time`,
        timestamp: Date.now()
      }]);
      setIsLoading(false);
      return;
    }

    if (navTarget) {
      if (!isRegenerate) setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);
      setThinkingSteps(['ค้นหาหน้าที่ต้องการ', 'กำลังนำทาง']);
      setCurrentStep(0);
      setIsThinking(true);
      await new Promise(r => setTimeout(r, 800));
      setIsThinking(false);
      
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `พาคุณไปยัง${navTarget.name}แล้วครับ`,
        timestamp: Date.now()
      }]);
      setIsLoading(false);
      
      await new Promise(r => setTimeout(r, 500));
      navigate(navTarget.path);
      return;
    }

    if (!isRegenerate) setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    const steps = getThinkingSteps(messageText);
    setThinkingSteps(steps);
    setCurrentStep(0);
    setIsThinking(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      for (let i = 0; i < steps.length; i++) {
        await new Promise(r => setTimeout(r, 500));
        setCurrentStep(i);
      }
      await new Promise(r => setTimeout(r, 300));
      setIsThinking(false);

      let fullResponse = '';
      const isSensorQuery = checkSensorQuery(messageText);
      const contextMessages = messages.map(m => ({ role: m.role, content: m.content }));
      const messagesWithContext = isSensorQuery
        ? [...contextMessages, { role: 'user' as const, content: `${messageText}\n\n[ข้อมูล Sensor]\n${getSensorContext()}` }]
        : [...contextMessages, { role: 'user' as const, content: messageText }];

      for await (const chunk of streamMessageFromGroq(messagesWithContext, API_KEY)) {
        if (controller.signal.aborted) break;
        fullResponse += chunk;
        setStreamingText(fullResponse);
      }

      if (!controller.signal.aborted) {
        setMessages(prev => [...prev, { id: `msg-${Date.now()}`, role: 'assistant', content: fullResponse, timestamp: Date.now() }]);
        
        
        const relatedPage = checkRelatedPage(messageText);
        if (relatedPage) {
          setSuggestedNav(relatedPage);
        }
      }
      setStreamingText('');
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        setIsThinking(false);
        setMessages(prev => [...prev, { id: `msg-${Date.now()}`, role: 'assistant', content: error.message || 'Error', timestamp: Date.now() }]);
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  if (!API_KEY) {
    return (
      <div style={{ minHeight: '100vh', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#64748B' }}>ไม่พบ API Key</p>
      </div>
    );
  }

  const hasMessages = messages.length > 0 || streamingText || isThinking;

  return (
    <div style={{ minHeight: '100vh', background: isDark ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' : '#F8FAFC', display: 'flex' }}>
      <style>{`
        .cursor{display:inline-block;width:2px;height:18px;background:#3B82F6;margin-left:2px;animation:blink 1s infinite;vertical-align:middle}
        .spin{animation:spin 1s linear infinite}
        @keyframes blink{0%,50%{opacity:1}51%,100%{opacity:0}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        .msg-actions{opacity:1;transition:opacity 0.2s}
      `}</style>

      {}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: isDark ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' : '#F8FAFC' }}>
        {}
        <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/')}
              style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', borderRadius: 8, padding: 8, color: isDark ? '#94A3B8' : '#64748B', cursor: 'pointer', display: 'flex' }}>
              <ArrowLeft size={18} />
            </motion.button>

            {}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowModelDropdown(!showModelDropdown)}
                style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', borderRadius: 10, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
                <span style={{ color: isDark ? '#E2E8F0' : '#334155', fontSize: 14, fontWeight: 500 }}>Barron 70B</span>
                <ChevronDown size={14} color={isDark ? "#94A3B8" : "#64748B"} />
              </button>
              {showModelDropdown && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowModelDropdown(false)} />
                  <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 8, background: isDark ? '#1E293B' : '#FFFFFF', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0', borderRadius: 12, padding: 8, minWidth: 200, zIndex: 100, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <div onClick={() => setShowModelDropdown(false)} style={{ padding: 12, borderRadius: 8, background: 'rgba(139,92,246,0.15)', cursor: 'pointer' }}>
                      <div style={{ color: isDark ? '#F8FAFC' : '#1E293B', fontSize: 13, fontWeight: 600 }}>Barron 70B</div>
                      <div style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 11 }}>70.6B parameters</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={newChat}
            style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', borderRadius: 8, padding: 8, color: isDark ? '#94A3B8' : '#64748B', cursor: 'pointer', display: 'flex' }}>
            <RotateCcw size={18} />
          </motion.button>
        </div>

        {}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {!hasMessages ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(20px,5vw,40px)' }}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                style={{ width: 'clamp(56px,15vw,72px)', height: 'clamp(56px,15vw,72px)', borderRadius: 20, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <Bot size={32} color="#fff" />
              </motion.div>
              <h1 style={{ color: isDark ? '#F8FAFC' : '#1E293B', fontSize: 'clamp(20px,5vw,28px)', fontWeight: 700, margin: '0 0 8px', textAlign: 'center' }}>สวัสดีครับ ผม Barron AI</h1>
              <p style={{ color: isDark ? '#64748B' : '#94A3B8', fontSize: 'clamp(13px,3vw,15px)', margin: '0 0 32px', textAlign: 'center' }}>ถามเกี่ยวกับระบบ Smoke Detect ได้เลยครับ</p>

              {/* Quick Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, maxWidth: 500, width: '100%' }}>
                <AnimatePresence mode="wait">
                  {quickActions.map((action, i) => (
                    <motion.button
                      key={action.label}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleSend(action.query)}
                      style={{ padding: '12px 18px', background: isDark ? 'rgba(30,41,59,0.8)' : '#FFFFFF', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0', borderRadius: 12, color: isDark ? '#E2E8F0' : '#334155', cursor: 'pointer', fontSize: 'clamp(12px,3vw,14px)', textAlign: 'center' }}>
                      {action.label}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>

              {/* Refresh Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setQuickActions(getRandomQuickActions(4))}
                style={{
                  marginTop: 16,
                  padding: '10px 20px',
                  background: 'transparent',
                  border: isDark ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(99, 102, 241, 0.4)',
                  borderRadius: 10,
                  color: isDark ? '#A5B4FC' : '#4F46E5',
                  cursor: 'pointer',
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                <RefreshCw size={14} />
                ดู Prompt อื่น
              </motion.button>
            </div>
          ) : (
            <div style={{ maxWidth: 800, width: '100%', margin: '0 auto', padding: 'clamp(16px,4vw,24px)' }}>
              {messages.map((msg, i) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="msg-container" style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', gap: 'clamp(8px,2vw,12px)', alignItems: 'flex-start' }}>
                    <div style={{ width: 'clamp(28px,7vw,36px)', height: 'clamp(28px,7vw,36px)', borderRadius: 10, background: msg.role === 'user' ? 'rgba(59,130,246,0.2)' : 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {msg.role === 'user' ? <User size={16} color="#60A5FA" /> : <Bot size={16} color="#fff" />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 'clamp(10px,2.5vw,12px)', fontWeight: 500 }}>{msg.role === 'user' ? 'คุณ' : 'AI Assistant'}</span>
                        <span style={{ color: isDark ? '#475569' : '#94A3B8', fontSize: 10 }}>{new Date(msg.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div style={{ color: isDark ? '#F1F5F9' : '#1E293B', fontSize: 'clamp(13px,3vw,15px)', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.content}</div>

                      {}
                      {msg.role === 'assistant' && (
                        <div className="msg-actions" style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                          <button onClick={() => copyToClipboard(msg.content, msg.id)} style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: isDark ? '#94A3B8' : '#64748B', fontSize: 11 }}>
                            {copiedId === msg.id ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                            {copiedId === msg.id ? 'คัดลอกแล้ว' : 'คัดลอก'}
                          </button>
                          <button onClick={() => regenerateResponse(i)} style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: isDark ? '#94A3B8' : '#64748B', fontSize: 11 }}>
                            <RefreshCw size={12} /> ตอบใหม่
                          </button>
                          <button onClick={() => handleLike(msg.id, !msg.liked)} style={{ background: msg.liked ? 'rgba(16,185,129,0.2)' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'), border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', display: 'flex', color: msg.liked ? '#10B981' : (isDark ? '#94A3B8' : '#64748B') }}>
                            <ThumbsUp size={12} />
                          </button>
                          <button onClick={() => handleDislike(msg.id, !msg.disliked)} style={{ background: msg.disliked ? 'rgba(239,68,68,0.2)' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'), border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', display: 'flex', color: msg.disliked ? '#EF4444' : (isDark ? '#94A3B8' : '#64748B') }}>
                            <ThumbsDown size={12} />
                          </button>
                        </div>
                      )}

                      {}
                      {msg.id === sensorMessageId && showSensorButtons && filteredSensors.length > 0 && (
                        <div style={{ marginTop: 16 }}>
                          <SensorGridInline
                            sensors={sensors}
                            filteredSensors={filteredSensors}
                            settings={settings}
                            onSelectSensor={setSelectedSensor}
                          />
                        </div>
                      )}

                      {}
                      {msg.id === chartMessageId && showChart && (
                        <div style={{ marginTop: 16 }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 12
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <BarChart3 size={16} color="#3B82F6" />
                              <span style={{ color: isDark ? '#F1F5F9' : '#1E293B', fontSize: 13, fontWeight: 600 }}>กราฟค่าควัน Real-time</span>
                            </div>
                            <button
                              onClick={() => { setShowChart(false); setChartMessageId(null); }}
                              style={{
                                background: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
                                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
                                borderRadius: 8,
                                padding: '6px 10px',
                                color: isDark ? '#94A3B8' : '#64748B',
                                fontSize: 11,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                            >
                              <X size={12} />
                              ปิด
                            </button>
                          </div>
                          <SmokeChart
                            data={history}
                            sensorHistory={sensorHistory}
                            settings={settings}
                            initialViewMode={chartViewMode}
                            initialFullscreen={chartFullscreen}
                          />
                        </div>
                      )}

                      {}
                      {msg.id === mapMessageId && showMap && (
                        <div style={{ marginTop: 16 }}>
                          <SensorMapView
                            sensors={mapFilteredSensors.length > 0 ? mapFilteredSensors : sensors}
                            settings={settings}
                            onClose={() => { setShowMap(false); setMapMessageId(null); setMapFilteredSensors([]); }}
                            onSelectSensor={(sensor) => setSelectedSensor(sensor)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {}
              {isThinking && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Bot size={16} color="#fff" />
                    </div>
                    <div style={{ background: isDark ? 'rgba(30,41,59,0.8)' : '#FFFFFF', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0', borderRadius: 16, padding: 16, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Loader size={14} color="#3B82F6" className="spin" />
                          <span style={{ color: '#94A3B8', fontSize: 13 }}>{thinkingSteps.length} ขั้นตอน</span>
                        </div>
                        <span style={{ color: currentStep >= thinkingSteps.length - 1 ? '#10B981' : '#F59E0B', fontSize: 12 }}>
                          {currentStep >= thinkingSteps.length - 1 ? 'เสร็จสิ้น' : 'กำลังดำเนินการ...'}
                        </span>
                      </div>
                      <div style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0', paddingTop: 10 }}>
                        {thinkingSteps.map((step, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                            <div style={{ width: 18, height: 18, borderRadius: '50%', background: idx <= currentStep ? 'rgba(16,185,129,0.15)' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'), border: `1.5px solid ${idx <= currentStep ? '#10B981' : '#475569'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {idx <= currentStep && <span style={{ color: '#10B981', fontSize: 10 }}>✓</span>}
                            </div>
                            <span style={{ color: idx <= currentStep ? (isDark ? '#F1F5F9' : '#1E293B') : '#64748B', fontSize: 13 }}>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {}
              {streamingText && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Bot size={16} color="#fff" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 12, marginBottom: 4 }}>AI Assistant</div>
                      <div style={{ color: isDark ? '#F1F5F9' : '#1E293B', fontSize: 15, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{streamingText}<span className="cursor" /></div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {}
        <div style={{ padding: 'clamp(12px,3vw,16px) clamp(16px,4vw,24px) clamp(16px,4vw,24px)', borderTop: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #E2E8F0', background: isDark ? 'linear-gradient(to top, #0F172A, rgba(15,23,42,0.95))' : '#FFFFFF' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: 'clamp(8px,2vw,12px)', background: isDark ? 'rgba(30,41,59,0.8)' : '#F1F5F9', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0', borderRadius: 16, padding: 6 }}>
              {}
              {recognitionRef.current && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleVoiceInput}
                  style={{ padding: '12px', background: isListening ? 'rgba(239,68,68,0.2)' : (isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF'), border: 'none', borderRadius: 10, cursor: 'pointer', display: 'flex' }}>
                  {isListening ? <MicOff size={18} color="#EF4444" /> : <Mic size={18} color={isDark ? "#94A3B8" : "#64748B"} />}
                </motion.button>
              )}

              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && !isLoading && (e.preventDefault(), handleSend())}
                placeholder={isListening ? 'กำลังฟัง...' : isLoading ? 'พิมพ์คำถามถัดไปรอไว้ได้...' : 'พิมพ์คำถามของคุณที่นี่...'}
                style={{ flex: 1, padding: '12px', background: 'transparent', border: 'none', color: isDark ? '#F1F5F9' : '#1E293B', fontSize: 'clamp(14px,3vw,15px)', outline: 'none', minWidth: 0 }} />

              {}
              {isLoading && input.trim() && (
                <div style={{
                  padding: '6px 10px',
                  background: 'rgba(59, 130, 246, 0.15)',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  marginRight: 4
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6', animation: 'pulse 1s infinite' }} />
                  <span style={{ color: '#60A5FA', fontSize: 11, whiteSpace: 'nowrap' }}>รอคิว</span>
                </div>
              )}

              {isLoading ? (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={stopGeneration}
                  style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.2)', border: 'none', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Square size={16} color="#EF4444" fill="#EF4444" />
                  <span style={{ color: '#EF4444', fontSize: 13 }}>หยุด</span>
                </motion.button>
              ) : (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleSend()} disabled={!input.trim()}
                  style={{ padding: '12px 16px', background: input.trim() ? 'linear-gradient(135deg, #3B82F6, #2563EB)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 10, cursor: input.trim() ? 'pointer' : 'not-allowed', display: 'flex' }}>
                  <Send size={18} color={input.trim() ? '#fff' : '#475569'} />
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>

      {}
      <AnimatePresence>
        {selectedSensor && <SensorModal sensor={selectedSensor} sensors={sensors} settings={settings} onClose={() => setSelectedSensor(null)} />}
      </AnimatePresence>

      {}
      <AnimatePresence>
        {downloadModal.show && downloadModal.platform && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px',
            }}
            onClick={() => setDownloadModal({ show: false, platform: null })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                borderRadius: '24px',
                padding: '32px',
                maxWidth: '400px',
                width: '100%',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                textAlign: 'center',
              }}
            >
              {}
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 12px 40px rgba(59, 130, 246, 0.4)',
              }}>
                <Monitor size={40} color="#FFF" />
              </div>

              {}
              <h3 style={{ color: '#F8FAFC', fontSize: '22px', fontWeight: 700, margin: '0 0 16px' }}>
                ยืนยันการดาวน์โหลด
              </h3>

              {}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#64748B', fontSize: '13px' }}>แพลตฟอร์ม</span>
                  <span style={{ color: '#F8FAFC', fontSize: '13px', fontWeight: 600 }}>
                    Windows
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#64748B', fontSize: '13px' }}>ประเภทไฟล์</span>
                  <span style={{ color: '#F8FAFC', fontSize: '13px', fontWeight: 600 }}>
                    EXE Installer
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#64748B', fontSize: '13px' }}>ชื่อไฟล์</span>
                  <span style={{ color: '#F8FAFC', fontSize: '13px', fontWeight: 600 }}>
                    SmokeDetection_Setup.exe
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontSize: '13px' }}>ขนาดไฟล์</span>
                  <span style={{ color: '#F8FAFC', fontSize: '13px', fontWeight: 600 }}>
                    ~159 KB
                  </span>
                </div>
              </div>

              {}
              <div style={{ display: 'flex', gap: '12px' }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDownloadModal({ show: false, platform: null })}
                  style={{
                    flex: 1,
                    padding: '14px 20px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#94A3B8',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  ยกเลิก
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownloadConfirm}
                  style={{
                    flex: 1,
                    padding: '14px 20px',
                    background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#FFF',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <Download size={18} />
                  ดาวน์โหลด
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


const SensorModal = ({ sensor, sensors, settings, onClose }: { sensor: SensorData; sensors: SensorData[]; settings: any; onClose: () => void }) => {
  const currentSensor = sensors.find(s => s.id === sensor.id) || sensor;
  const status = currentSensor.value >= settings.dangerThreshold ? 'danger' : currentSensor.value >= settings.warningThreshold ? 'warning' : 'safe';
  const statusColor = status === 'danger' ? '#EF4444' : status === 'warning' ? '#F59E0B' : '#10B981';
  const statusText = status === 'danger' ? 'อันตราย' : status === 'warning' ? 'เฝ้าระวัง' : 'ปกติ';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}
        style={{ background: 'linear-gradient(135deg, #1E293B, #0F172A)', borderRadius: 20, border: `2px solid ${statusColor}40`, width: '100%', maxWidth: 360, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', background: `${statusColor}15`, borderBottom: `1px solid ${statusColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${statusColor}20`, border: `2px solid ${statusColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={22} color={statusColor} />
            </div>
            <div>
              <h3 style={{ color: '#F8FAFC', fontSize: 16, fontWeight: 600, margin: 0 }}>{currentSensor.location || currentSensor.id}</h3>
              <p style={{ color: '#94A3B8', fontSize: 12, margin: 0 }}>ID: {currentSensor.id}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer' }}>
            <X size={18} color="#94A3B8" />
          </button>
        </div>
        <div style={{ padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 48, fontWeight: 700, color: statusColor, lineHeight: 1 }}>{currentSensor.value.toFixed(1)}</div>
          <div style={{ color: '#94A3B8', fontSize: 14, marginBottom: 12 }}>PPM</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: `${statusColor}15`, borderRadius: 20, border: `1px solid ${statusColor}40` }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor }} />
            <span style={{ color: statusColor, fontSize: 13, fontWeight: 500 }}>{statusText}</span>
          </div>
          <div style={{ marginTop: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#64748B', fontSize: 13 }}>Warning</span>
              <span style={{ color: '#F59E0B', fontSize: 13, fontWeight: 600 }}>{settings.warningThreshold} PPM</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B', fontSize: 13 }}>Danger</span>
              <span style={{ color: '#EF4444', fontSize: 13, fontWeight: 600 }}>{settings.dangerThreshold} PPM</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
