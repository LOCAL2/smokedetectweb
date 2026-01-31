import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'


registerSW({
  onNeedRefresh() {
    if (confirm('มีเวอร์ชันใหม่ ต้องการอัปเดตหรือไม่?')) {
      window.location.reload()
    }
  },
  onOfflineReady() {
    console.log('App พร้อมใช้งานแบบ offline')
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
