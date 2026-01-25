import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Sparkles, Rocket, Check, Calendar, 
  Search, Filter, TrendingUp, Clock, Zap, ChevronDown, X,
  GitBranch, Package, Bug, Star
} from 'lucide-react';
import updatesData from '../data/updates.json';
import { useTheme } from '../context/ThemeContext';
import { LampContainer } from '../components/ui/Lamp';

type UpdateType = 'feature' | 'improvement' | 'release' | 'fix';

interface Update {
  version: string;
  date: string;
  title: string;
  type: UpdateType;
  changes: string[];
}

const typeConfig: Record<UpdateType, { color: string; icon: React.ElementType; label: string; gradient: string }> = {
  feature: { color: '#3B82F6', icon: Sparkles, label: 'ฟีเจอร์ใหม่', gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)' },
  improvement: { color: '#10B981', icon: TrendingUp, label: 'ปรับปรุง', gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' },
  release: { color: '#8B5CF6', icon: Rocket, label: 'เปิดตัว', gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)' },
  fix: { color: '#F59E0B', icon: Bug, label: 'แก้ไขบัก', gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' },
};

const formatDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('th-TH', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const getRelativeTime = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'วันนี้';
  if (diffDays === 1) return 'เมื่อวาน';
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} สัปดาห์ที่แล้ว`;
  return `${Math.floor(diffDays / 30)} เดือนที่แล้ว`;
};

export const UpdatesPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const updates: Update[] = updatesData.updates as Update[];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<UpdateType | 'all'>('all');
  const [expandedVersion, setExpandedVersion] = useState<string | null>(updates[0]?.version || null);

  // Theme colors
  const colors = {
    cardBg: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.95)',
    cardBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
    textPrimary: isDark ? '#F8FAFC' : '#0F172A',
    textSecondary: isDark ? '#94A3B8' : '#64748B',
    textMuted: isDark ? '#64748B' : '#94A3B8',
    inputBg: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    inputBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    hoverBg: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
    statBg: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.8)',
  };

  // Statistics
  const stats = useMemo(() => {
    const totalUpdates = updates.length;
    const totalChanges = updates.reduce((sum, u) => sum + u.changes.length, 0);
    const latestVersion = updates[0]?.version || '0.0.0';
    const typeCount = updates.reduce((acc, u) => {
      acc[u.type] = (acc[u.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return { totalUpdates, totalChanges, latestVersion, typeCount };
  }, [updates]);

  // Filtered updates
  const filteredUpdates = useMemo(() => {
    return updates.filter(update => {
      const matchesType = selectedType === 'all' || update.type === selectedType;
      const matchesSearch = searchQuery === '' || 
        update.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        update.changes.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
        update.version.includes(searchQuery);
      return matchesType && matchesSearch;
    });
  }, [updates, selectedType, searchQuery]);

  return (
    <div style={{ minHeight: '100vh', background: isDark ? '#0B0F1A' : '#F1F5F9' }}>
      {/* Back Button - Absolute positioned */}
      <motion.button
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: 'clamp(16px, 4vw, 24px)',
          left: 'clamp(16px, 4vw, 24px)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: '14px',
          padding: '14px 24px',
          color: colors.textSecondary,
          fontSize: '15px',
          fontWeight: 500,
          cursor: 'pointer',
          zIndex: 100,
        }}
      >
        <ArrowLeft size={20} />
        กลับหน้าหลัก
      </motion.button>

      {/* Hero Section */}
      <LampContainer>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          style={{ textAlign: 'center' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 20px 60px rgba(139, 92, 246, 0.4)',
            }}
          >
            <GitBranch size={36} color="#FFF" />
          </motion.div>
          <h1 style={{
            fontSize: 'clamp(32px, 8vw, 56px)',
            fontWeight: 700,
            background: isDark 
              ? 'linear-gradient(to bottom right, #F8FAFC, #94A3B8)'
              : 'linear-gradient(to bottom right, #1E293B, #475569)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 12px',
            letterSpacing: '-0.02em',
          }}>
            Changelog
          </h1>
          <p style={{
            color: colors.textSecondary,
            fontSize: 'clamp(14px, 3vw, 16px)',
            margin: '0 0 16px',
          }}>
            ติดตามการอัพเดทและการปรับปรุงระบบ
          </p>
        </motion.div>
      </LampContainer>

      {/* Main Content */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 32px) 64px' }}>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          {[
            { icon: Package, label: 'เวอร์ชันล่าสุด', value: `v${stats.latestVersion}`, color: '#8B5CF6' },
            { icon: Zap, label: 'อัพเดททั้งหมด', value: stats.totalUpdates.toString(), color: '#3B82F6' },
            { icon: Check, label: 'การเปลี่ยนแปลง', value: stats.totalChanges.toString(), color: '#10B981' },
            { icon: Clock, label: 'อัพเดทล่าสุด', value: getRelativeTime(updates[0]?.date || ''), color: '#F59E0B' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              style={{
                background: colors.statBg,
                backdropFilter: 'blur(20px)',
                borderRadius: '16px',
                padding: '20px',
                border: `1px solid ${colors.cardBorder}`,
                boxShadow: isDark ? 'none' : '0 4px 20px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: `${stat.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <stat.icon size={22} color={stat.color} />
                </div>
                <div>
                  <p style={{ color: colors.textMuted, fontSize: '12px', margin: '0 0 2px', fontWeight: 500 }}>
                    {stat.label}
                  </p>
                  <p style={{ color: colors.textPrimary, fontSize: '20px', fontWeight: 700, margin: 0 }}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            background: colors.cardBg,
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '20px',
            border: `1px solid ${colors.cardBorder}`,
            marginBottom: '24px',
            boxShadow: isDark ? 'none' : '0 4px 20px rgba(0, 0, 0, 0.05)',
          }}
        >
          {/* Search Input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: colors.inputBg,
            borderRadius: '12px',
            padding: '12px 16px',
            border: `1px solid ${colors.inputBorder}`,
            marginBottom: '16px',
          }}>
            <Search size={20} color={colors.textMuted} />
            <input
              type="text"
              placeholder="ค้นหาอัพเดท..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: colors.textPrimary,
                fontSize: '15px',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                }}
              >
                <X size={18} color={colors.textMuted} />
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedType('all')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                background: selectedType === 'all' 
                  ? 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' 
                  : colors.inputBg,
                color: selectedType === 'all' ? '#FFF' : colors.textSecondary,
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Filter size={14} />
              ทั้งหมด
              <span style={{
                background: selectedType === 'all' ? 'rgba(255,255,255,0.2)' : colors.hoverBg,
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '11px',
              }}>
                {updates.length}
              </span>
            </button>
            {(Object.keys(typeConfig) as UpdateType[]).map((type) => {
              const config = typeConfig[type];
              const count = stats.typeCount[type] || 0;
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    background: selectedType === type ? config.gradient : colors.inputBg,
                    color: selectedType === type ? '#FFF' : colors.textSecondary,
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <config.icon size={14} />
                  {config.label}
                  <span style={{
                    background: selectedType === type ? 'rgba(255,255,255,0.2)' : colors.hoverBg,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Results Count */}
        {(searchQuery || selectedType !== 'all') && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              color: colors.textMuted,
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            พบ {filteredUpdates.length} รายการ
            {searchQuery && ` สำหรับ "${searchQuery}"`}
          </motion.p>
        )}

        {/* Updates List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <AnimatePresence mode="popLayout">
            {filteredUpdates.map((update, index) => {
              const config = typeConfig[update.type] || typeConfig.feature;
              const Icon = config.icon;
              const isExpanded = expandedVersion === update.version;
              const isLatest = index === 0 && selectedType === 'all' && !searchQuery;

              return (
                <motion.div
                  key={update.version}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    background: colors.cardBg,
                    backdropFilter: 'blur(20px)',
                    borderRadius: '20px',
                    border: isLatest 
                      ? `2px solid ${config.color}40`
                      : `1px solid ${colors.cardBorder}`,
                    overflow: 'hidden',
                    boxShadow: isLatest 
                      ? `0 8px 40px ${config.color}15`
                      : (isDark ? 'none' : '0 4px 20px rgba(0, 0, 0, 0.05)'),
                    position: 'relative',
                  }}
                >
                  {/* Header - Clickable */}
                  <button
                    onClick={() => setExpandedVersion(isExpanded ? null : update.version)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '20px 24px',
                      paddingRight: isLatest ? '24px' : '24px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '14px',
                      background: config.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: `0 8px 24px ${config.color}30`,
                    }}>
                      <Icon size={24} color="#FFF" />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span style={{
                          background: `${config.color}15`,
                          color: config.color,
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}>
                          v{update.version}
                        </span>
                        {/* Latest Badge - Inline */}
                        {isLatest && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: config.gradient,
                            padding: '4px 10px',
                            borderRadius: '6px',
                            boxShadow: `0 2px 8px ${config.color}30`,
                          }}>
                            <Star size={10} color="#FFF" fill="#FFF" />
                            <span style={{ color: '#FFF', fontSize: '11px', fontWeight: 600 }}>ล่าสุด</span>
                          </span>
                        )}
                        <span style={{
                          color: colors.textMuted,
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}>
                          <Calendar size={12} />
                          {formatDate(update.date)}
                        </span>
                        <span style={{
                          color: colors.textMuted,
                          fontSize: '12px',
                        }}>
                          • {getRelativeTime(update.date)}
                        </span>
                      </div>
                      <h3 style={{
                        color: colors.textPrimary,
                        fontSize: '16px',
                        fontWeight: 600,
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {update.title}
                      </h3>
                    </div>

                    {/* Expand Icon */}
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: colors.inputBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <ChevronDown size={20} color={colors.textMuted} />
                    </motion.div>
                  </button>

                  {/* Expandable Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{
                          padding: '0 24px 24px',
                          borderTop: `1px solid ${colors.cardBorder}`,
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '16px 0 12px',
                          }}>
                            <Check size={16} color={config.color} />
                            <span style={{ color: colors.textSecondary, fontSize: '13px', fontWeight: 500 }}>
                              {update.changes.length} การเปลี่ยนแปลง
                            </span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {update.changes.map((change, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '12px',
                                  padding: '12px 16px',
                                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                  borderRadius: '12px',
                                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                                }}
                              >
                                <div style={{
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '6px',
                                  background: `${config.color}20`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  marginTop: '1px',
                                }}>
                                  <Check size={12} color={config.color} />
                                </div>
                                <span style={{
                                  color: isDark ? '#E2E8F0' : '#334155',
                                  fontSize: '14px',
                                  lineHeight: 1.6,
                                }}>
                                  {change}
                                </span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredUpdates.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: colors.cardBg,
              borderRadius: '20px',
              border: `1px solid ${colors.cardBorder}`,
            }}
          >
            <Search size={48} color={colors.textMuted} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <h3 style={{ color: colors.textPrimary, fontSize: '18px', fontWeight: 600, margin: '0 0 8px' }}>
              ไม่พบผลลัพธ์
            </h3>
            <p style={{ color: colors.textMuted, fontSize: '14px', margin: 0 }}>
              ลองค้นหาด้วยคำอื่น หรือเปลี่ยนตัวกรอง
            </p>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{
            textAlign: 'center',
            marginTop: '48px',
            paddingTop: '24px',
            borderTop: `1px solid ${colors.cardBorder}`,
          }}
        >
          <p style={{ color: colors.textMuted, fontSize: '13px', margin: '0 0 8px' }}>
            Smoke Detect System
          </p>
          <p style={{ color: colors.textMuted, fontSize: '12px', margin: 0, opacity: 0.7 }}>
            มีข้อเสนอแนะ? ติดต่อทีมพัฒนาได้เลย
          </p>
        </motion.div>
      </div>
    </div>
  );
};
