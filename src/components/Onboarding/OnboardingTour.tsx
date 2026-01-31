import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface TourStep {
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    target: '[data-tour="dashboard"]',
    title: '🏠 Dashboard หลัก',
    description: 'แสดงข้อมูลเซ็นเซอร์แบบ Real-time พร้อมกราฟและสถิติ',
    position: 'bottom',
  },
  {
    target: '[data-tour="settings"]',
    title: '⚙️ ตั้งค่าระบบ',
    description: 'ปรับค่า Threshold, API Endpoints และการแจ้งเตือน',
    position: 'bottom',
  },
  {
    target: '[data-tour="demo-mode"]',
    title: '🎮 Demo Mode',
    description: 'ทดลองใช้งานด้วยข้อมูลจำลอง ไม่ต้องมี API',
    position: 'left',
  },
];

export const OnboardingTour = () => {
  const { isDark } = useTheme();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('onboarding-tour-completed');
    if (!hasSeenTour) {
      const timer = setTimeout(() => setIsActive(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const updatePosition = () => {
      const step = tourSteps[currentStep];
      const element = document.querySelector(step.target);
      
      if (element) {
        const rect = element.getBoundingClientRect();
        let top = 0;
        let left = 0;

        switch (step.position) {
          case 'bottom':
            top = rect.bottom + 16;
            left = rect.left + rect.width / 2;
            break;
          case 'top':
            top = rect.top - 16;
            left = rect.left + rect.width / 2;
            break;
          case 'left':
            top = rect.top + rect.height / 2;
            left = rect.left - 16;
            break;
          case 'right':
            top = rect.top + rect.height / 2;
            left = rect.right + 16;
            break;
        }

        setPosition({ top, left });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isActive, currentStep]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding-tour-completed', 'true');
    setIsActive(false);
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding-tour-completed', 'true');
    setIsActive(false);
  };

  if (!isActive) return null;

  const step = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;

  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const textSecondary = isDark ? '#94A3B8' : '#64748B';
  const borderColor = isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)';

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
        }}
        onClick={handleSkip}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            transform: step.position === 'bottom' || step.position === 'top' 
              ? 'translateX(-50%)' 
              : step.position === 'left' 
                ? 'translate(-100%, -50%)' 
                : 'translate(0, -50%)',
            zIndex: 9999,
            maxWidth: '360px',
            background: cardBg,
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(139, 92, 246, 0.2)',
            border: `1px solid ${borderColor}`,
          }}
        >
          {}
          <button
            onClick={handleSkip}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';
            }}
          >
            <X size={16} color={textSecondary} />
          </button>

          {}
          <h3 style={{
            color: textColor,
            fontSize: '18px',
            fontWeight: 700,
            margin: '0 0 8px',
            paddingRight: '32px',
          }}>
            {step.title}
          </h3>
          <p style={{
            color: textSecondary,
            fontSize: '14px',
            margin: '0 0 20px',
            lineHeight: 1.6,
          }}>
            {step.description}
          </p>

          {}
          <div style={{
            display: 'flex',
            gap: '6px',
            marginBottom: '20px',
          }}>
            {tourSteps.map((_, index) => (
              <div
                key={index}
                style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '2px',
                  background: index <= currentStep 
                    ? 'linear-gradient(90deg, #8B5CF6, #6366F1)' 
                    : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>

          {}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
            <button
              onClick={handleSkip}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                borderRadius: '10px',
                color: textSecondary,
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              ข้าม
            </button>
            <button
              onClick={handleNext}
              style={{
                padding: '10px 24px',
                background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                border: 'none',
                borderRadius: '10px',
                color: '#FFF',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
              }}
            >
              {isLastStep ? (
                <>
                  <Check size={16} />
                  เสร็จสิ้น
                </>
              ) : (
                <>
                  ถัดไป
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>

          {}
          <div style={{
            marginTop: '16px',
            textAlign: 'center',
            color: textSecondary,
            fontSize: '12px',
          }}>
            {currentStep + 1} / {tourSteps.length}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};
