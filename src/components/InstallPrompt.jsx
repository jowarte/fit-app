import React, { useState, useEffect } from 'react';
import { X, Share, PlusSquare, Download } from 'lucide-react';

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if prompt was already dismissed
    const hasDismissed = localStorage.getItem('installPromptDismissed');
    
    // Check if already in standalone mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    
    if (hasDismissed || isStandalone) {
      return;
    }

    // Detect iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIosDevice);

    if (isIosDevice) {
      // Show immediately for iOS since they don't have beforeinstallprompt
      // Wait a few seconds to not be too aggressive
      setTimeout(() => setShowPrompt(true), 3000);
    }

    // Android/Chrome event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      // We've used the prompt, and can't use it again, throw it away
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('installPromptDismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '5.5rem', // Acima da tab bar
      left: '1rem',
      right: '1rem',
      background: 'var(--bg-dark)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '16px',
      padding: '1.5rem',
      zIndex: 9999,
      boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      animation: 'slideUp 0.5s ease-out forwards'
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <img src="/icon-192.png" alt="App Icon" style={{ width: '48px', height: '48px', borderRadius: '12px' }} />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'white' }}>Instalar TreinoApp</h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Acesse seus treinos mais rápido!</p>
          </div>
        </div>
        <button onClick={handleDismiss} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.2rem' }}>
          <X size={20} />
        </button>
      </div>

      {isIOS ? (
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem', color: 'white', lineHeight: '1.5' }}>
          Para instalar no seu iPhone:<br/>
          1. Toque no ícone de compartilhar <Share size={14} style={{ verticalAlign: 'middle', margin: '0 4px' }} /> abaixo.<br/>
          2. Selecione <strong>"Adicionar à Tela de Início"</strong> <PlusSquare size={14} style={{ verticalAlign: 'middle', margin: '0 4px' }} />.
        </div>
      ) : (
        <button 
          onClick={handleInstallClick}
          style={{
            background: 'var(--primary-color)',
            color: 'black',
            border: 'none',
            borderRadius: '8px',
            padding: '1rem',
            fontWeight: 'bold',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            cursor: 'pointer'
          }}
        >
          <Download size={18} /> Baixar Aplicativo
        </button>
      )}
    </div>
  );
}
