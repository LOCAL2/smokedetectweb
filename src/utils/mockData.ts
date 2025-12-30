import type { SensorData } from '../types/sensor';

// Mock sensor locations with GPS coordinates
const MOCK_SENSORS = [
  { id: 'demo-1', name: 'Sensor ห้องนั่งเล่น', location: 'ชั้น 1 - ห้องนั่งเล่น', lat: 13.7563, lng: 100.5018, address: 'อาคาร A ชั้น 1' },
  { id: 'demo-2', name: 'Sensor ห้องครัว', location: 'ชั้น 1 - ห้องครัว', lat: 13.7565, lng: 100.5020, address: 'อาคาร A ชั้น 1' },
  { id: 'demo-3', name: 'Sensor ห้องนอนใหญ่', location: 'ชั้น 2 - ห้องนอนใหญ่', lat: 13.7567, lng: 100.5015, address: 'อาคาร A ชั้น 2' },
  { id: 'demo-4', name: 'Sensor ห้องนอนเล็ก', location: 'ชั้น 2 - ห้องนอนเล็ก', lat: 13.7564, lng: 100.5022, address: 'อาคาร A ชั้น 2' },
  { id: 'demo-5', name: 'Sensor โรงรถ', location: 'โรงรถ', lat: 13.7560, lng: 100.5012, address: 'โรงรถ อาคาร A' },
];

// Seeded random number generator (deterministic based on seed)
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

// Generate deterministic value based on time and sensor index
// All users will see the same value at the same time
const generateDeterministicValue = (sensorIndex: number, baseValue: number): number => {
  const now = new Date();
  // Use current minute + second/10 as seed (changes every ~10 seconds for smooth updates)
  const timeSeed = now.getHours() * 3600 + now.getMinutes() * 60 + Math.floor(now.getSeconds() / 10) * 10;
  
  // Create unique seed for each sensor
  const seed = timeSeed + sensorIndex * 1000;
  
  // Generate base random value
  const random1 = seededRandom(seed);
  const random2 = seededRandom(seed + 1);
  const random3 = seededRandom(seed + 2);
  
  // Calculate value with some variation
  let value = baseValue + (random1 - 0.5) * 30; // Base variation ±15
  
  // Add occasional spikes (deterministic based on time)
  if (random2 < 0.08) { // 8% chance of spike
    value += random3 * 80; // Spike up to +80
  }
  
  // Clamp and round
  value = Math.max(5, Math.min(250, value));
  return Math.round(value * 10) / 10; // 1 decimal place
};

// Generate mock sensor data - deterministic across all users
export const generateMockSensorData = (): SensorData[] => {
  const now = new Date().toISOString();
  
  // Base values for each sensor (consistent pattern)
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
      lat: sensor.lat,
      lng: sensor.lng,
      address: sensor.address,
    };
  });
};

// Reset mock data (for compatibility)
export const resetMockData = (): void => {
  // No longer needed but kept for compatibility
};
