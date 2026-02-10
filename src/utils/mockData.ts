import type { SensorData } from '../types/sensor';


const MOCK_SENSORS = [
  { id: 'demo-1', name: 'Sensor ห้องนั่งเล่น', location: 'ชั้น 1 - ห้องนั่งเล่น',  address: 'อาคาร A ชั้น 1' },
  { id: 'demo-2', name: 'Sensor ห้องครัว', location: 'ชั้น 1 - ห้องครัว', address: 'อาคาร A ชั้น 1' },
  { id: 'demo-3', name: 'Sensor ห้องนอนใหญ่', location: 'ชั้น 2 - ห้องนอนใหญ่', address: 'อาคาร A ชั้น 2' },
  { id: 'demo-4', name: 'Sensor ห้องนอนเล็ก', location: 'ชั้น 2 - ห้องนอนเล็ก', address: 'อาคาร A ชั้น 2' },
  { id: 'demo-5', name: 'Sensor โรงรถ', location: 'โรงรถ', address: 'โรงรถ อาคาร A' },
];


const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};


const generateDeterministicValue = (sensorIndex: number, baseValue: number): number => {
  const now = new Date();
  
  const timeSeed = now.getHours() * 3600 + now.getMinutes() * 60 + Math.floor(now.getSeconds() / 10) * 10;
  
  
  const seed = timeSeed + sensorIndex * 1000;
  
  
  const random1 = seededRandom(seed);
  const random2 = seededRandom(seed + 1);
  const random3 = seededRandom(seed + 2);
  
  
  let value = baseValue + (random1 - 0.5) * 30; 
  
  
  if (random2 < 0.08) { 
    value += random3 * 80; 
  }
  
  
  value = Math.max(5, Math.min(250, value));
  return Math.round(value * 10) / 10; 
};


export const generateMockSensorData = (): SensorData[] => {
  const now = new Date().toISOString();
  
  const baseValues = [23, 45, 18, 32, 28];
  
  return MOCK_SENSORS.map((sensor, index) => {
    const value = generateDeterministicValue(index, baseValues[index]);
    
    return {
      id: sensor.id,
      name: sensor.name,
      location: sensor.location,
      value,
      unit: 'ppm',
      timestamp: now,
      isOnline: true,
      address: sensor.address,
    };
  });
};


export const resetMockData = (): void => {
  
};
