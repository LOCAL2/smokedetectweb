import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, Users } from 'lucide-react';

interface Member {
  name: string;
  role: string;
  studentId?: string;
  image?: string;
}

export const MembersPage = () => {
  const navigate = useNavigate();

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
          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)'
          : 'rgba(30, 41, 59, 0.6)',
        borderRadius: '24px',
        padding: isLeader ? '40px 32px' : '32px 24px',
        border: isLeader ? '2px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center',
        position: 'relative',
        transform: isLeader ? 'scale(1.05)' : 'scale(1)',
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
        width: isLeader ? '120px' : '100px',
        height: isLeader ? '120px' : '100px',
        borderRadius: '50%',
        background: isLeader
          ? 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)'
          : 'linear-gradient(135deg, #475569 0%, #334155 100%)',
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
        color: '#F8FAFC',
        fontSize: isLeader ? '22px' : '18px',
        fontWeight: 700,
        margin: '0 0 8px',
      }}>
        {member.name}
      </h3>
      
      <p style={{
        color: isLeader ? '#60A5FA' : '#94A3B8',
        fontSize: '14px',
        fontWeight: 600,
        margin: '0 0 8px',
      }}>
        {member.role}
      </p>

      {member.studentId && (
        <p style={{
          color: '#64748B',
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
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
      padding: '32px',
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '48px' }}
        >
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              fontSize: '14px',
              cursor: 'pointer',
              marginBottom: '32px',
            }}
          >
            <ArrowLeft size={18} />
            กลับหน้าหลัก
          </button>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(59, 130, 246, 0.1)',
              padding: '12px 24px',
              borderRadius: '50px',
              marginBottom: '16px',
            }}>
              <Users size={24} color="#3B82F6" />
              <span style={{ color: '#60A5FA', fontSize: '14px', fontWeight: 600 }}>ทีมพัฒนา</span>
            </div>
            <h1 style={{ color: '#F8FAFC', fontSize: '36px', fontWeight: 700, margin: '0 0 8px' }}>
              ผู้จัดทำโปรเจค
            </h1>
            <p style={{ color: '#64748B', fontSize: '16px', margin: 0 }}>
              Smoke Detection System | ปวช.3
            </p>
          </div>
        </motion.div>

        {/* Members Grid - Leader in center */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px',
          alignItems: 'center',
        }}>
          {/* ซ้าย - วรเดช */}
          <MemberCard member={leftMember} delay={0.2} />
          
          {/* กลาง - นภัสพล (หัวหน้า) */}
          <MemberCard member={leader} isLeader delay={0.1} />
          
          {/* ขวา - ภูมิรพี */}
          <MemberCard member={rightMember} delay={0.3} />
        </div>

        {/* Project Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            marginTop: '48px',
            textAlign: 'center',
            padding: '32px',
            background: 'rgba(30, 41, 59, 0.4)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <h3 style={{ color: '#F8FAFC', fontSize: '18px', fontWeight: 600, margin: '0 0 12px' }}>
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
