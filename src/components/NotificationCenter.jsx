import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle2, Trophy, Flame } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const location = useLocation();

  // Ocultar em telas de admin, login ou planos
  if (location.pathname.startsWith('/admin') || location.pathname === '/login' || location.pathname === '/planos') {
    return null;
  }

  // Carregar notificações do localStorage
  useEffect(() => {
    const loadNotifs = () => {
      const saved = localStorage.getItem('in_app_notifications');
      let current = [];
      
      if (saved) {
        current = JSON.parse(saved);
      } else {
        current = [
          { id: 1, type: 'welcome', title: 'Bem-vindo ao TreinoApp!', message: 'Seu novo estilo de vida começa aqui.', read: false, date: new Date().toISOString() },
          { id: 2, type: 'system', title: 'Treino de Costas liberado', message: 'Dá uma olhada no seu novo treino.', read: false, date: new Date().toISOString() }
        ];
      }

      // Mesclar notificações globais do Admin
      const savedGlobal = localStorage.getItem('global_notifications');
      if (savedGlobal) {
        const globals = JSON.parse(savedGlobal);
        const existingIds = current.map(n => String(n.id));
        const newGlobals = globals
          .filter(g => !existingIds.includes(String(g.id)))
          .map(g => ({ ...g, read: false }));
          
        if (newGlobals.length > 0) {
          current = [...newGlobals, ...current];
          localStorage.setItem('in_app_notifications', JSON.stringify(current));
        }
      }
      
      setNotifications(current);
    };
    
    loadNotifs();
    
    // Atualizar se houver mudanças em outras abas/partes do código
    window.addEventListener('storage', loadNotifs);
    
    // Checar a cada minuto se alguma notificação agendada "venceu" (chegou a hora)
    const interval = setInterval(loadNotifs, 60000);
    
    return () => {
      window.removeEventListener('storage', loadNotifs);
      clearInterval(interval);
    };
  }, []);

  // Filtra apenas as notificações cuja data já passou ou é o momento atual
  const activeNotifications = notifications.filter(n => new Date(n.date) <= new Date());
  const unreadCount = activeNotifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem('in_app_notifications', JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('in_app_notifications', JSON.stringify(updated));
  };

  const getIcon = (type) => {
    switch(type) {
      case 'achievement': return <Trophy size={20} color="#ffb020" />;
      case 'streak': return <Flame size={20} color="#ff4444" />;
      default: return <CheckCircle2 size={20} color="var(--primary-color)" />;
    }
  };

  return (
    <>
      {/* Botão do Sininho (Fixo no topo direito) */}
      <button 
        onClick={() => setIsOpen(true)}
        style={{ 
          position: 'fixed', top: '15px', right: '15px', zIndex: 50,
          background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)',
          width: '45px', height: '45px', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(10px)', color: 'white', cursor: 'pointer'
        }}
        className="animate-scale"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '-2px', right: '-2px',
            background: '#ff4444', color: 'white', fontSize: '0.7rem',
            fontWeight: 'bold', width: '20px', height: '20px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--bg-dark)'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Painel Lateral / Modal de Notificações */}
      {isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
          <div className="animate-fade-in" style={{ width: '100%', maxWidth: '400px', background: 'var(--bg-color)', height: '100%', borderLeft: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell size={20} /> Notificações
              </h2>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.9rem', marginBottom: '1rem', cursor: 'pointer', display: 'block', width: '100%', textAlign: 'right' }}>
                  Marcar todas como lidas
                </button>
              )}

              {activeNotifications.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '3rem' }}>
                  <Bell size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                  <p>Você não tem novas notificações.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {activeNotifications.sort((a,b) => new Date(b.date) - new Date(a.date)).map(notif => (
                    <div 
                      key={notif.id} 
                      onClick={() => markAsRead(notif.id)}
                      style={{ 
                        background: notif.read ? 'rgba(255,255,255,0.02)' : 'rgba(0, 255, 136, 0.05)', 
                        border: notif.read ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0, 255, 136, 0.2)',
                        padding: '1rem', borderRadius: '12px', display: 'flex', gap: '1rem', cursor: 'pointer',
                        transition: 'all 0.2s', position: 'relative'
                      }}
                    >
                      {!notif.read && (
                        <div style={{ position: 'absolute', top: '15px', right: '15px', width: '8px', height: '8px', background: 'var(--primary-color)', borderRadius: '50%' }}></div>
                      )}
                      <div style={{ flexShrink: 0, marginTop: '2px', opacity: notif.read ? 0.5 : 1 }}>
                        {getIcon(notif.type)}
                      </div>
                      <div style={{ opacity: notif.read ? 0.7 : 1 }}>
                        <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '0.95rem' }}>{notif.title}</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{notif.message}</p>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.5rem', display: 'block' }}>
                          {new Date(notif.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} às {new Date(notif.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}
