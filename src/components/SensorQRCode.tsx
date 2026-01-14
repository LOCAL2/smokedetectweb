import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, X, Download, Copy, Check } from 'lucide-react';
import type { SensorData } from '../types/sensor';

interface SensorQRCodeProps {
  sensor: SensorData;
  baseUrl?: string;
}

export const SensorQRCode = ({ sensor, baseUrl = window.location.origin }: SensorQRCodeProps) => {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const sensorUrl = `${baseUrl}/sensors?id=${sensor.id}`;
  
  // Generate QR code using Google Charts API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(sensorUrl)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(sensorUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `sensor-${sensor.id}-qr.png`;
    link.click();
  };

  const modalContent = (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            style={{
              background: '#1E293B',
              borderRadius: '20px',
              padding: '24px',
              maxWidth: '320px',
              width: '100%',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}>
              <h3 style={{ color: '#F8FAFC', fontSize: '16px', fontWeight: 600, margin: 0 }}>
                QR Code - {sensor.location || sensor.id}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#94A3B8',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* QR Code */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <img
                src={qrCodeUrl}
                alt={`QR Code for ${sensor.location || sensor.id}`}
                style={{ width: '200px', height: '200px' }}
              />
            </div>

            {/* URL */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
            }}>
              <p style={{ 
                color: '#64748B', 
                fontSize: '11px', 
                margin: '0 0 4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                URL
              </p>
              <p style={{ 
                color: '#94A3B8', 
                fontSize: '12px', 
                margin: 0,
                wordBreak: 'break-all',
              }}>
                {sensorUrl}
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCopy}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  background: 'rgba(59, 130, 246, 0.1)',
                  color: '#60A5FA',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'คัดลอกแล้ว' : 'คัดลอก URL'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownload}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#34D399',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                <Download size={16} />
                ดาวน์โหลด
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowModal(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(255, 255, 255, 0.05)',
          color: '#94A3B8',
          cursor: 'pointer',
        }}
        title="แสดง QR Code"
      >
        <QrCode size={16} />
      </motion.button>

      {createPortal(modalContent, document.body)}
    </>
  );
};
