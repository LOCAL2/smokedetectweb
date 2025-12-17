import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { Dashboard } from './components/Dashboard';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';
import { MembersPage } from './pages/MembersPage';
import { SensorsPage } from './pages/SensorsPage';

function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/sensors" element={<SensorsPage />} />
        </Routes>
      </SettingsProvider>
    </BrowserRouter>
  );
}

export default App;
