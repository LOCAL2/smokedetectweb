/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_KEY: string;
  readonly VITE_POLLING_INTERVAL: string;
  readonly VITE_THRESHOLD_WARNING: string;
  readonly VITE_THRESHOLD_DANGER: string;
  readonly VITE_ENABLE_SOUND_ALERT: string;
  readonly VITE_ENABLE_NOTIFICATION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Electron API
interface ElectronAPI {
  checkUpdate: () => Promise<boolean>;
  isElectron: boolean;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
