import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Proteção contra falhas de atualização: recarrega automaticamente caso um chunk seja atualizado na Vercel
window.addEventListener('vite:preloadError', (event) => {
  console.warn('[Atualização] Nova versão detectada na Vercel. Recarregando bundle...');
  window.location.reload();
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
