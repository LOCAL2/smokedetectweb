import { motion } from 'framer-motion';
import type { Easing } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

// Skeleton shimmer animation
const shimmer = {
  initial: { backgroundPosition: '-200% 0' },
  animate: { 
    backgroundPosition: '200% 0',
    transition: { repeat: Infinity, duration: 1.5, ease: 'linear' as Easing }
  }
};

const getSkeletonStyle = (isDark: boolean) => ({
  background: isDark
    ? 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 100%)'
    : 'linear-gradient(90deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.04) 100%)',
  backgroundSize: '200% 100%',
  borderRadius: '8px',
});

// Status Card Skeleton
export const StatusCardSkeleton = () => {
  const { isDark } = useTheme();
  const skeletonStyle = getSkeletonStyle(isDark);
  const cardBg = isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.8)';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        background: cardBg,
        borderRadius: '20px',
        padding: '24px',
        border: `1px solid ${borderColor}`,
        boxShadow: isDark ? 'none' : '0 4px 15px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <motion.div {...shimmer} style={{ ...skeletonStyle, width: '80px', height: '14px', marginBottom: '12px' }} />
          <motion.div {...shimmer} style={{ ...skeletonStyle, width: '100px', height: '32px', marginBottom: '8px' }} />
          <motion.div {...shimmer} style={{ ...skeletonStyle, width: '120px', height: '12px' }} />
        </div>
        <motion.div {...shimmer} style={{ ...skeletonStyle, width: '48px', height: '48px', borderRadius: '14px' }} />
      </div>
    </motion.div>
  );
};

// Chart Skeleton
export const ChartSkeleton = () => {
  const { isDark } = useTheme();
  const skeletonStyle = getSkeletonStyle(isDark);
  const cardBg = isDark
    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(241, 245, 249, 0.95) 100%)';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        background: cardBg,
        borderRadius: '24px',
        padding: '28px',
        border: `1px solid ${borderColor}`,
        boxShadow: isDark ? 'none' : '0 4px 15px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <motion.div {...shimmer} style={{ ...skeletonStyle, width: '180px', height: '20px', marginBottom: '8px' }} />
          <motion.div {...shimmer} style={{ ...skeletonStyle, width: '140px', height: '14px' }} />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <motion.div {...shimmer} style={{ ...skeletonStyle, width: '80px', height: '36px', borderRadius: '10px' }} />
          <motion.div {...shimmer} style={{ ...skeletonStyle, width: '80px', height: '36px', borderRadius: '10px' }} />
        </div>
      </div>
      <motion.div {...shimmer} style={{ ...skeletonStyle, width: '100%', height: '320px', borderRadius: '12px' }} />
    </motion.div>
  );
};

// Sensor Card Skeleton
export const SensorCardSkeleton = () => {
  const { isDark } = useTheme();
  const skeletonStyle = getSkeletonStyle(isDark);
  const cardBg = isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.8)';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        background: cardBg,
        borderRadius: '20px',
        padding: '20px',
        border: `1px solid ${borderColor}`,
        boxShadow: isDark ? 'none' : '0 4px 15px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <motion.div {...shimmer} style={{ ...skeletonStyle, width: '44px', height: '44px', borderRadius: '12px' }} />
        <div style={{ flex: 1 }}>
          <motion.div {...shimmer} style={{ ...skeletonStyle, width: '120px', height: '16px', marginBottom: '6px' }} />
          <motion.div {...shimmer} style={{ ...skeletonStyle, width: '80px', height: '12px' }} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
        <motion.div {...shimmer} style={{ ...skeletonStyle, width: '80px', height: '36px' }} />
        <motion.div {...shimmer} style={{ ...skeletonStyle, width: '40px', height: '16px' }} />
      </div>
      <motion.div {...shimmer} style={{ ...skeletonStyle, width: '100%', height: '6px', borderRadius: '3px' }} />
    </motion.div>
  );
};

// Ranking Skeleton
export const RankingSkeleton = () => {
  const { isDark } = useTheme();
  const skeletonStyle = getSkeletonStyle(isDark);
  const cardBg = isDark
    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(241, 245, 249, 0.95) 100%)';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
  const itemBorder = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        background: cardBg,
        borderRadius: '24px',
        padding: '28px',
        border: `1px solid ${borderColor}`,
        boxShadow: isDark ? 'none' : '0 4px 15px rgba(0, 0, 0, 0.05)',
      }}
    >
      <motion.div {...shimmer} style={{ ...skeletonStyle, width: '160px', height: '20px', marginBottom: '20px' }} />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: `1px solid ${itemBorder}` }}>
          <motion.div {...shimmer} style={{ ...skeletonStyle, width: '28px', height: '28px', borderRadius: '8px' }} />
          <div style={{ flex: 1 }}>
            <motion.div {...shimmer} style={{ ...skeletonStyle, width: '100px', height: '14px', marginBottom: '4px' }} />
            <motion.div {...shimmer} style={{ ...skeletonStyle, width: '60px', height: '10px' }} />
          </div>
          <motion.div {...shimmer} style={{ ...skeletonStyle, width: '60px', height: '20px' }} />
        </div>
      ))}
    </motion.div>
  );
};

// Full Dashboard Skeleton
export const DashboardSkeleton = () => {
  const { isDark } = useTheme();
  const skeletonStyle = getSkeletonStyle(isDark);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Status Cards */}
      <div className="status-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
      }}>
        {[1, 2, 3, 4].map((i) => <StatusCardSkeleton key={i} />)}
      </div>
      
      {/* Charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))',
        gap: '24px',
      }}>
        <ChartSkeleton />
        <RankingSkeleton />
      </div>
      
      {/* Sensor Cards */}
      <div className="sensor-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
      }}>
        {[1, 2, 3].map((i) => <SensorCardSkeleton key={i} />)}
      </div>
    </div>
  );
};
