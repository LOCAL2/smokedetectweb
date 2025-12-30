import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

// Extend Window interface for Electron API
declare global {
  interface Window {
    electronAPI?: {
      isElectron: boolean;
      checkUpdate: () => Promise<void>;
    };
  }
}

export const UpdateButton = () => {
  const [updating, setUpdating] = useState(false);

  // Only show in Electron
  if (!window.electronAPI?.isElectron) {
    return null;
  }

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await window.electronAPI?.checkUpdate();
    } catch (err) {
      console.error('Update failed:', err);
    }
    setUpdating(false);
  };

  return (
    <button
      onClick={handleUpdate}
      disabled={updating}
      style={{
        position: 'fixed',
        bottom: '100px',
        right: '24px',
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        border: 'none',
        cursor: updating ? 'wait' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
        zIndex: 999,
        transition: 'transform 0.2s, opacity 0.2s',
        opacity: updating ? 0.7 : 1,
      }}
      title="อัปเดตแอป"
    >
      <RefreshCw 
        size={22} 
        color="white" 
        style={{ 
          animation: updating ? 'spin 1s linear infinite' : 'none' 
        }} 
      />
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};
