import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { SensorDataProvider } from './context/SensorDataContext';
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
import { ChatBot } from './components/ChatBot/ChatBot';
import { UpdateButton } from './components/UpdateButton';

function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <SensorDataProvider>
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
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Routes>
          <ChatBot />
          <UpdateButton />
        </SensorDataProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}

export default App;
