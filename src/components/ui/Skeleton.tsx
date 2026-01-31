import { motion } from 'framer-motion';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '8px',
  className,
  style
}: SkeletonProps) => {
  return (
    <motion.div
      className={className}
      animate={{
        backgroundPosition: ['200% 0', '-200% 0'],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 100%)',
        backgroundSize: '200% 100%',
        ...style,
      }}
    />
  );
};


export const SensorCardSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    style={{
      background: 'rgba(30, 41, 59, 0.5)',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid rgba(255, 255, 255, 0.06)',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
      <Skeleton width={40} height={40} borderRadius="10px" />
      <div style={{ flex: 1 }}>
        <Skeleton width="60%" height={16} style={{ marginBottom: '8px' }} />
        <Skeleton width="40%" height={12} />
      </div>
    </div>
    <Skeleton width="50%" height={32} style={{ marginBottom: '12px' }} />
    <Skeleton width="100%" height={8} borderRadius="4px" />
  </motion.div>
);


export const ChartSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    style={{
      background: 'rgba(30, 41, 59, 0.5)',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid rgba(255, 255, 255, 0.06)',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
      <Skeleton width={32} height={32} borderRadius="8px" />
      <div>
        <Skeleton width={120} height={14} style={{ marginBottom: '6px' }} />
        <Skeleton width={80} height={11} />
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '150px' }}>
      {[40, 65, 45, 80, 55, 70, 50, 85, 60, 75].map((h, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${h}%` }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '4px 4px 0 0',
          }}
        />
      ))}
    </div>
  </motion.div>
);


export const StatsCardSkeleton = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    style={{
      background: 'rgba(30, 41, 59, 0.5)',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid rgba(255, 255, 255, 0.06)',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
      <Skeleton width={40} height={40} borderRadius="10px" />
      <Skeleton width={100} height={14} />
    </div>
    <Skeleton width={80} height={28} />
  </motion.div>
);


export const DashboardSkeleton = () => (
  <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
    {}
    <div style={{ marginBottom: '32px', paddingTop: '80px' }}>
      <Skeleton width={200} height={28} style={{ marginBottom: '8px' }} />
      <Skeleton width={300} height={14} />
    </div>

    {}
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '24px',
    }}>
      {[1, 2, 3, 4].map(i => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>

    {}
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px',
    }}>
      <ChartSkeleton />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {[1, 2, 3].map(i => (
          <SensorCardSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
);
