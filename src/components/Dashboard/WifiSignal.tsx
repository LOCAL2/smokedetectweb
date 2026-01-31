import { Wifi, WifiOff } from 'lucide-react';

interface WifiSignalProps {
  rssi?: number; 
  isOnline: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const WifiSignal = ({ rssi, isOnline, showLabel = false, size = 'md' }: WifiSignalProps) => {
  if (!isOnline) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <WifiOff size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} color="#EF4444" />
        {showLabel && (
          <span style={{ color: '#EF4444', fontSize: size === 'sm' ? '11px' : '12px' }}>
            Offline
          </span>
        )}
      </div>
    );
  }

  
  const getSignalStrength = (rssi?: number): number => {
    if (!rssi) return 4; 
    if (rssi >= -50) return 4; 
    if (rssi >= -60) return 3; 
    if (rssi >= -70) return 2; 
    if (rssi >= -80) return 1; 
    return 0; 
  };

  const getSignalColor = (strength: number): string => {
    if (strength >= 3) return '#10B981'; 
    if (strength >= 2) return '#F59E0B'; 
    return '#EF4444'; 
  };

  const getSignalLabel = (strength: number): string => {
    if (strength >= 4) return 'Excellent';
    if (strength >= 3) return 'Good';
    if (strength >= 2) return 'Fair';
    if (strength >= 1) return 'Weak';
    return 'Poor';
  };

  const strength = getSignalStrength(rssi);
  const color = getSignalColor(strength);
  const barHeight = size === 'sm' ? 10 : size === 'lg' ? 18 : 14;
  const barWidth = size === 'sm' ? 3 : size === 'lg' ? 5 : 4;
  const gap = size === 'sm' ? 2 : 3;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: `${gap}px`, height: `${barHeight}px` }}>
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            style={{
              width: `${barWidth}px`,
              height: `${(bar / 4) * barHeight}px`,
              borderRadius: '1px',
              background: bar <= strength ? color : 'rgba(255, 255, 255, 0.15)',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>

      {}
      <Wifi size={size === 'sm' ? 12 : size === 'lg' ? 18 : 14} color={color} />

      {}
      {showLabel && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ color, fontSize: size === 'sm' ? '11px' : '12px', fontWeight: 500 }}>
            {getSignalLabel(strength)}
          </span>
          {rssi && (
            <span style={{ color: '#64748B', fontSize: '10px' }}>
              {rssi} dBm
            </span>
          )}
        </div>
      )}
    </div>
  );
};
