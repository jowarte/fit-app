import React, { useState, useEffect } from 'react';
import { Bell, Send, CheckCircle2, Trash2 } from 'lucide-react';

export function AdminNotifications() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [sentNotifications, setSentNotifications] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('global_notifications');
    if (saved) {
      setSentNotifications(JSON.parse(saved));
    }
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (!title || !message) return alert("Preencha o título e a mensagem.");
    
    let finalDate = new Date();
    if (isScheduled) {
      if (!scheduleDate) return alert("Selecione a data e hora para o disparo.");
      finalDate = new Date(scheduleDate);
      if (finalDate < new Date()) {
        return alert("A data programada não pode ser no passado.");
      }
    }

    const newNotif = {
      id: Date.now().toString(),
      type: 'system',
      title,
      message,
      date: finalDate.toISOString()
    };

    const updated = [newNotif, ...sentNotifications];
    setSentNotifications(updated);
    localStorage.setItem('global_notifications', JSON.stringify(updated));
    
    setTitle('');
    setMessage('');
    setIsScheduled(false);
    setScheduleDate('');
    
    // Dispara evento para atualizar simulador na mesma janela
    window.dispatchEvent(new Event('storage'));
    
    alert(isScheduled ? "Notificação programada com sucesso!" : "Notificação enviada com sucesso para os alunos!");
  };

  const handleDelete = (id) => {
    if(window.confirm('Excluir esta notificação do histórico global?')) {
      const updated = sentNotifications.filter(n => n.id !== id);
      setSentNotifications(updated);
      localStorage.setItem('global_notifications', JSON.stringify(updated));
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px' }}>
          <Bell size={28} color="var(--primary-color)" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Central de Notificações</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Envie avisos para o sininho dentro do app de todos os alunos.</p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Send size={18} /> Disparar Nova Notificação
        </h3>
        
        <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Título (Curto e chamativo)</label>
            <input 
              type="text" 
              placeholder="Ex: Novo Treino Liberado!" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem' }}
              required
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Mensagem (Descrição do aviso)</label>
            <textarea 
              placeholder="Ex: Acabamos de subir uma nova série de alongamentos para vocês. Confiram na aba de exercícios!"
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem', resize: 'vertical' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1rem' }}>
              <input 
                type="checkbox" 
                checked={isScheduled} 
                onChange={e => setIsScheduled(e.target.checked)} 
                style={{ accentColor: 'var(--primary-color)', width: '18px', height: '18px' }}
              />
              <span style={{ color: 'white' }}>Programar envio para o futuro</span>
            </label>

            {isScheduled && (
              <div className="animate-fade-in">
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Data e Hora do Disparo</label>
                <input 
                  type="datetime-local" 
                  value={scheduleDate}
                  onChange={e => setScheduleDate(e.target.value)}
                  style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem', colorScheme: 'dark' }}
                  required={isScheduled}
                />
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
            <Bell size={20} /> {isScheduled ? 'Agendar Notificação' : 'Enviar Notificação Push (In-App)'}
          </button>
        </form>
      </div>

      <h3 style={{ margin: '2rem 0 1rem 0' }}>Histórico e Agendamentos</h3>
      {sentNotifications.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>Nenhuma notificação foi disparada ainda.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sentNotifications.map(notif => {
            const isFuture = new Date(notif.date) > new Date();
            return (
              <div key={notif.id} style={{ background: 'rgba(255,255,255,0.02)', border: isFuture ? '1px dashed rgba(255,176,32,0.5)' : '1px solid rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', opacity: isFuture ? 0.8 : 1 }}>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} color={isFuture ? "#ffb020" : "var(--primary-color)"} /> 
                    {notif.title}
                    {isFuture && <span style={{ fontSize: '0.7rem', background: 'rgba(255,176,32,0.2)', color: '#ffb020', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>AGENDADO</span>}
                  </h4>
                  <p style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{notif.message}</p>
                  <small style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {isFuture ? 'Será enviado em:' : 'Enviado em:'} {new Date(notif.date).toLocaleString('pt-BR')}
                  </small>
                </div>
                <button onClick={() => handleDelete(notif.id)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', opacity: 0.5 }}>
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
