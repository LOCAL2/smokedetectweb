import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { SensorDataProvider } from './context/SensorDataContext';
import { ThemeProvider } from './context/ThemeContext';
import { Dashboard } from './components/Dashboard';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';
import { MembersPage } from './pages/MembersPage';
import { SensorsPage } from './pages/SensorsPage';
import { GuidePage } from './pages/GuidePage';
import { DownloadPage } from './pages/DownloadPage';
import { ChatBotPage } from './pages/ChatBotPage';
import { UpdatesPage } from './pages/UpdatesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { ChatBot } from './components/ChatBot/ChatBot';
import { UpdateButton } from './components/UpdateButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { useOfflineSupport } from './hooks/useOfflineSupport';
import { useSettingsContext } from './context/SettingsContext';

// Check maintenance mode from environment variable
const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

// Wrapper component to use hooks
const AppContent = () => {
  const { settings } = useSettingsContext();
  
  // Custom smooth scroll - ทำให้การเลื่อนหน้า smooth โดยไม่พึ่ง OS/Browser setting
  useSmoothScroll(settings.enableSmoothScroll);
  
  // Offline support
  const { isOnline, formatCacheAge } = useOfflineSupport();

  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/members" element={<MembersPage />} />
        <Route path="/sensors" element={<SensorsPage />} />
        <Route path="/guide" element={<GuidePage />} />
        <Route path="/download" element={<DownloadPage />} />
        <Route path="/chat" element={<ChatBotPage />} />
        <Route path="/updates" element={<UpdatesPage />} />
        <Route path="/changelog" element={<UpdatesPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Routes>
      <ChatBot />
      <UpdateButton />
      <OfflineIndicator isOnline={isOnline} cacheAge={formatCacheAge()} />
    </>
  );
};

function App() {
  // Show maintenance page if enabled
  if (isMaintenanceMode) {
    return <MaintenancePage />;
  }

  return (
    <BrowserRouter>
      <ThemeProvider>
        <SettingsProvider>
          <SensorDataProvider>
            <AppContent />
          </SensorDataProvider>
        </SettingsProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
