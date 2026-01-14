import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, Users } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface Member {
  name: string;
  role: string;
  studentId?: string;
  image?: string;
}

export const MembersPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  // แก้ไขข้อมูลสมาชิกตรงนี้
  const leader: Member = {
    name: 'นาย นภัสพล ผู้แสนสะอาด',
    role: 'หัวหน้าโปรเจค',
    studentId: '66209010031',
  };

  const leftMember: Member = {
    name: 'นาย วรเดช พันธ์พืช',
    role: 'Coding',
    studentId: '66209010040',
  };

  const rightMember: Member = {
    name: 'นาย ภูมิรพี พรหมมาศ',
    role: 'Design',
    studentId: '66209010037',
  };

  const MemberCard = ({ member, isLeader = false, delay = 0 }: { member: Member; isLeader?: boolean; delay?: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      style={{
        background: isLeader
          ? (isDark 
              ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)'
              : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)')
          : (isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.9)'),
        borderRadius: 'clamp(16px, 3vw, 24px)',
        padding: isLeader ? 'clamp(28px, 5vw, 40px) clamp(20px, 4vw, 32px)' : 'clamp(24px, 4vw, 32px) clamp(16px, 3vw, 24px)',
        border: isLeader 
          ? '2px solid rgba(59, 130, 246, 0.3)' 
          : (isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)'),
        textAlign: 'center',
        position: 'relative',
        boxShadow: isDark ? 'none' : '0 4px 15px rgba(0, 0, 0, 0.05)',
      }}
    >
      {isLeader && (
        <div style={{
          position: 'absolute',
          top: '-16px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #F59E0B 0%, #EAB308 100%)',
          borderRadius: '50%',
          padding: '10px',
          boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)',
        }}>
          <Crown size={20} color="#FFF" />
        </div>
      )}

      {/* Avatar */}
      <div style={{
        width: isLeader ? 'clamp(90px, 20vw, 120px)' : 'clamp(80px, 18vw, 100px)',
        height: isLeader ? 'clamp(90px, 20vw, 120px)' : 'clamp(80px, 18vw, 100px)',
        borderRadius: '50%',
        background: isLeader
          ? 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)'
          : (isDark ? 'linear-gradient(135deg, #475569 0%, #334155 100%)' : 'linear-gradient(135deg, #94A3B8 0%, #64748B 100%)'),
        margin: '0 auto 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: isLeader ? '0 8px 32px rgba(59, 130, 246, 0.3)' : 'none',
        overflow: 'hidden',
      }}>
        {member.image ? (
          <img src={member.image} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <svg 
            width={isLeader ? '50' : '40'} 
            height={isLeader ? '50' : '40'} 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="8" r="4" fill="rgba(255,255,255,0.6)" />
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </div>

      {/* Info */}
      <h3 style={{
        color: isDark ? '#F8FAFC' : '#0F172A',
        fontSize: isLeader ? 'clamp(18px, 4vw, 22px)' : 'clamp(16px, 3.5vw, 18px)',
        fontWeight: 700,
        margin: '0 0 8px',
      }}>
        {member.name}
      </h3>
      
      <p style={{
        color: isLeader ? '#60A5FA' : (isDark ? '#94A3B8' : '#64748B'),
        fontSize: '14px',
        fontWeight: 600,
        margin: '0 0 8px',
      }}>
        {member.role}
      </p>

      {member.studentId && (
        <p style={{
          color: isDark ? '#64748B' : '#94A3B8',
          fontSize: '13px',
          margin: 0,
        }}>
          {member.studentId}
        </p>
      )}
    </motion.div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: isDark ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)' : 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 50%, #F8FAFC 100%)',
      padding: 'clamp(16px, 4vw, 32px)',
    }}>
      {/* Back Button - Outside container */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '24px' }}
      >
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '14px',
            padding: '14px 24px',
            color: isDark ? '#94A3B8' : '#64748B',
            fontSize: '15px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <ArrowLeft size={20} />
          กลับหน้าหลัก
        </button>
      </motion.div>

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 'clamp(32px, 6vw, 48px)' }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(59, 130, 246, 0.1)',
              padding: 'clamp(10px, 2vw, 12px) clamp(16px, 3vw, 24px)',
              borderRadius: '50px',
              marginBottom: '16px',
            }}>
              <Users size={24} color="#3B82F6" />
              <span style={{ color: '#60A5FA', fontSize: '14px', fontWeight: 600 }}>ทีมพัฒนา</span>
            </div>
            <h1 style={{ color: isDark ? '#F8FAFC' : '#0F172A', fontSize: 'clamp(24px, 6vw, 36px)', fontWeight: 700, margin: '0 0 8px' }}>
              ผู้จัดทำโปรเจค
            </h1>
            <p style={{ color: '#64748B', fontSize: 'clamp(14px, 3vw, 16px)', margin: 0 }}>
              Smoke Detection System | ปวช.3
            </p>
          </div>
        </motion.div>

        {/* Members Grid - Responsive */}
        {/* Desktop: หัวหน้าอยู่ตรงกลาง | Mobile: หัวหน้าอยู่บนสุด */}
        <div className="members-grid" style={{
          display: 'grid',
          gap: 'clamp(16px, 3vw, 24px)',
          alignItems: 'center',
        }}>
          {/* ซ้าย - วรเดช */}
          <div className="member-left">
            <MemberCard member={leftMember} delay={0.2} />
          </div>
          
          {/* กลาง - นภัสพล (หัวหน้า) */}
          <div className="member-center">
            <MemberCard member={leader} isLeader delay={0.1} />
          </div>
          
          {/* ขวา - ภูมิรพี */}
          <div className="member-right">
            <MemberCard member={rightMember} delay={0.3} />
          </div>
        </div>

        <style>{`
          .members-grid {
            grid-template-columns: 1fr;
          }
          .member-left { order: 2; }
          .member-center { order: 1; }
          .member-right { order: 3; }
          
          @media (min-width: 768px) {
            .members-grid {
              grid-template-columns: 1fr 1.2fr 1fr;
            }
            .member-left { order: 1; }
            .member-center { order: 2; }
            .member-right { order: 3; }
          }
        `}</style>

        {/* Project Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            marginTop: 'clamp(32px, 6vw, 48px)',
            textAlign: 'center',
            padding: 'clamp(20px, 4vw, 32px)',
            background: isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.9)',
            borderRadius: '20px',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: isDark ? 'none' : '0 4px 15px rgba(0, 0, 0, 0.05)',
          }}
        >
          <h3 style={{ color: isDark ? '#F8FAFC' : '#0F172A', fontSize: '18px', fontWeight: 600, margin: '0 0 12px' }}>
            โปรเจคจบการศึกษา
          </h3>
          <p style={{ color: '#64748B', fontSize: '14px', margin: 0, lineHeight: 1.8 }}>
            ระบบตรวจจับควันอัจฉริยะ พัฒนาเพื่อการศึกษาระดับประกาศนียบัตรวิชาชีพ ชั้นปีที่ 3
          </p>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            textAlign: 'center',
            color: '#475569',
            fontSize: '13px',
            marginTop: '40px',
          }}
        >
          © 2024 Smoke Detection System
        </motion.p>
      </div>
    </div>
  );
};
