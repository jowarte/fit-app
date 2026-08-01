import React, { useState, useEffect } from 'react';
import { MessageCircle, Plus, Trash2, Edit2, Send, Clock, CalendarDays } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function AdminWhatsApp() {
  const [reminders, setReminders] = useState([]);
  const [targetNumber, setTargetNumber] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [instanceName, setInstanceName] = useState('');
  const [activationMessage, setActivationMessage] = useState('Olá! Sou aluno e quero ativar meus lembretes de treino neste número.');
  const [isLoading, setIsLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    dayOfWeek: 'Segunda-feira',
    time: '18:00',
    message: 'Oi! Não esqueça do seu treino de hoje! 💪'
  });

  // Carregar dados do Supabase
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Carregar configurações
        const { data: settings } = await supabase.from('app_settings').select('*').eq('id', 1).single();
        if (settings) {
          setTargetNumber(settings.whatsapp_bot_number || '');
          setApiUrl(settings.evolution_api_url || '');
          setApiKey(settings.evolution_api_key || '');
          setInstanceName(settings.evolution_instance || '');
          if (settings.whatsapp_activation_message) {
            setActivationMessage(settings.whatsapp_activation_message);
          }
        }

        // Carregar lembretes
        const { data: rems } = await supabase.from('whatsapp_reminders').select('*').order('created_at', { ascending: false });
        if (rems) {
          // Ajusta os nomes das propriedades que vêm do banco (snake_case -> camelCase)
          const mappedRems = rems.map(r => ({
            id: r.id,
            title: r.title,
            dayOfWeek: r.day_of_week,
            time: r.time,
            message: r.message,
            active: r.active
          }));
          setReminders(mappedRems);
        }
      } catch (err) {
        console.error("Erro ao carregar dados do WhatsApp", err);
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  const saveNumber = (e) => {
    setTargetNumber(e.target.value);
  };

  const saveCredentials = async () => {
    try {
      const { error } = await supabase.from('app_settings').update({
        whatsapp_bot_number: targetNumber,
        evolution_api_url: apiUrl,
        evolution_api_key: apiKey,
        evolution_instance: instanceName,
        whatsapp_activation_message: activationMessage
      }).eq('id', 1);

      if (error) throw error;
      alert('Credenciais salvas com sucesso!');
    } catch (err) {
      alert('Erro ao salvar credenciais: ' + err.message);
    }
  };

  const handleNew = () => {
    setFormData({
      id: null,
      title: '',
      dayOfWeek: 'Segunda-feira',
      time: '18:00',
      message: 'Oi! Não esqueça do seu treino de hoje! 💪'
    });
    setIsEditing(true);
  };

  const handleEdit = (rem) => {
    setFormData(rem);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este lembrete?')) {
      try {
        await supabase.from('whatsapp_reminders').delete().eq('id', id);
        setReminders(reminders.filter(r => r.id !== id));
      } catch (err) {
        alert('Erro ao excluir: ' + err.message);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        day_of_week: formData.dayOfWeek,
        time: formData.time,
        message: formData.message,
        active: formData.id ? formData.active : true
      };

      if (formData.id) {
        await supabase.from('whatsapp_reminders').update(payload).eq('id', formData.id);
        setReminders(reminders.map(r => r.id === formData.id ? { ...formData, active: r.active } : r));
      } else {
        const { data } = await supabase.from('whatsapp_reminders').insert([payload]).select().single();
        if (data) {
          setReminders([{
            id: data.id,
            title: data.title,
            dayOfWeek: data.day_of_week,
            time: data.time,
            message: data.message,
            active: data.active
          }, ...reminders]);
        }
      }
      setIsEditing(false);
    } catch (err) {
      alert('Erro ao salvar lembrete: ' + err.message);
    }
  };

  const toggleActive = async (id) => {
    const rem = reminders.find(r => r.id === id);
    if (!rem) return;
    try {
      await supabase.from('whatsapp_reminders').update({ active: !rem.active }).eq('id', id);
      setReminders(reminders.map(r => r.id === id ? { ...r, active: !r.active } : r));
    } catch (err) {
      alert('Erro ao alterar status: ' + err.message);
    }
  };

  const testWhatsApp = (message) => {
    if (!targetNumber) {
      alert('Por favor, configure o "Número de Destino" primeiro.');
      return;
    }
    // Formatar número para o padrão internacional
    const cleanNumber = targetNumber.replace(/\D/g, '');
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando dados...</div>;
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(37, 211, 102, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
            <MessageCircle size={28} color="#25D366" />
          </div>
          <h1 style={{ margin: 0 }}>Lembretes WhatsApp</h1>
        </div>
        
        {!isEditing && (
          <button className="btn btn-primary" onClick={handleNew} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#25D366', borderColor: '#25D366', color: 'white' }}>
            <Plus size={18} /> Novo Lembrete
          </button>
        )}
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem', borderLeft: '4px solid #25D366' }}>
        <h3 style={{ margin: '0 0 1rem 0' }}>Integração Evolution API</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Configure as credenciais da sua instância da Evolution API para que o aplicativo possa fazer os disparos no automático, e defina o número oficial que os alunos usarão.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Seu Número Oficial (Robô)</label>
            <input 
              type="text" 
              placeholder="Ex: 5511999999999"
              value={targetNumber}
              onChange={saveNumber}
              style={{ 
                width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', 
                border: '1px solid rgba(255,255,255,0.1)', color: 'white'
              }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.3rem' }}>
              Este é o número que aparecerá para o aluno na hora dele autorizar os lembretes.
            </span>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Evolution API URL</label>
            <input 
              type="text" 
              placeholder="Ex: https://sua-evolution-api.com"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              style={{ 
                width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', 
                border: '1px solid rgba(255,255,255,0.1)', color: 'white'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Global API Key</label>
            <input 
              type="password" 
              placeholder="Sua Global API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{ 
                width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', 
                border: '1px solid rgba(255,255,255,0.1)', color: 'white'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Nome da Instância</label>
            <input 
              type="text" 
              placeholder="Ex: TreinoApp"
              value={instanceName}
              onChange={(e) => setInstanceName(e.target.value)}
              style={{ 
                width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', 
                border: '1px solid rgba(255,255,255,0.1)', color: 'white'
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Mensagem de Ativação do Fluxo</label>
          <input 
            type="text" 
            placeholder="Ex: Olá! Quero ativar meus lembretes..."
            value={activationMessage}
            onChange={(e) => setActivationMessage(e.target.value)}
            style={{ 
              width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)', color: 'white'
            }}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.3rem' }}>
            Mensagem pré-preenchida para o aluno enviar e autorizar as notificações.
          </span>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={saveCredentials} className="btn btn-primary" style={{ padding: '0.5rem 1rem', background: '#25D366', borderColor: '#25D366', color: 'white' }}>
            Salvar Credenciais
          </button>
          
          <button 
            onClick={async () => {
              if (!apiUrl || !apiKey || !instanceName || !targetNumber) {
                alert('Preencha todos os 4 campos (Número, URL, API Key e Nome da Instância) antes de testar.');
                return;
              }
              try {
                const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
                const cleanNumber = targetNumber.replace(/\D/g, '');
                
                const response = await fetch(`${baseUrl}/message/sendText/${instanceName}`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'apikey': apiKey
                  },
                  body: JSON.stringify({
                    number: cleanNumber,
                    text: '✅ *TreinoApp:* Teste de conexão da Evolution API concluído com sucesso!'
                  })
                });

                if (response.ok) {
                  alert('Teste enviado com sucesso! Verifique se a mensagem chegou no WhatsApp de destino.');
                } else {
                  let errMsg = 'Desconhecido';
                  try { const data = await response.json(); errMsg = data.message || data.error || JSON.stringify(data); } catch (e) {}
                  alert(`Falha no teste (Status ${response.status}): ${errMsg}`);
                }
              } catch (err) {
                alert('Erro de conexão ao tentar testar a API: ' + err.message);
              }
            }} 
            className="btn" 
            style={{ padding: '0.5rem 1rem', background: 'rgba(37, 211, 102, 0.1)', color: '#25D366', border: '1px solid #25D366' }}
          >
            <Send size={16} style={{ marginRight: '0.5rem' }}/> Testar Disparo
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="glass-card animate-scale" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>{formData.id ? 'Editar Lembrete' : 'Criar Lembrete Automático'}</h3>
          
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Nome da Rotina / Identificação</label>
              <input 
                type="text" 
                required
                placeholder="Ex: Treino de Perna"
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  <CalendarDays size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                  Dia da Semana
                </label>
                <select 
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                  value={formData.dayOfWeek}
                  onChange={e => setFormData({...formData, dayOfWeek: e.target.value})}
                >
                  <option>Segunda-feira</option>
                  <option>Terça-feira</option>
                  <option>Quarta-feira</option>
                  <option>Quinta-feira</option>
                  <option>Sexta-feira</option>
                  <option>Sábado</option>
                  <option>Domingo</option>
                  <option>Todos os dias</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  <Clock size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                  Horário
                </label>
                <input 
                  type="time" 
                  required
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                  value={formData.time}
                  onChange={e => setFormData({...formData, time: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Mensagem do WhatsApp</label>
              <textarea 
                required
                rows="4"
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', resize: 'vertical' }}
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
              ></textarea>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Dica: Você pode usar emojis para deixar a mensagem mais amigável!</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" style={{ background: '#25D366', borderColor: '#25D366', color: 'white' }}>
                Salvar Lembrete
              </button>
              <button type="button" className="btn" style={{ background: 'rgba(255,255,255,0.1)' }} onClick={() => setIsEditing(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {reminders.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
              <MessageCircle size={48} color="rgba(255,255,255,0.1)" style={{ marginBottom: '1rem' }} />
              <p>Nenhum lembrete configurado ainda.</p>
            </div>
          ) : (
            reminders.map(rem => (
              <div key={rem.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', opacity: rem.active ? 1 : 0.6, transition: 'all 0.3s' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {rem.title}
                    </h3>
                    <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CalendarDays size={14}/> {rem.dayOfWeek}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14}/> {rem.time}</span>
                    </div>
                  </div>
                  
                  {/* Toggle Switch Simples */}
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} title={rem.active ? "Desativar" : "Ativar"}>
                    <input 
                      type="checkbox" 
                      checked={rem.active}
                      onChange={() => toggleActive(rem.id)}
                      style={{ width: '20px', height: '20px', accentColor: '#25D366' }}
                    />
                  </label>
                </div>
                
                <div style={{ background: 'rgba(37, 211, 102, 0.05)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #25D366' }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' }}>
                    "{rem.message}"
                  </p>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <button 
                    onClick={() => testWhatsApp(rem.message)}
                    className="btn" 
                    style={{ background: 'rgba(37, 211, 102, 0.1)', color: '#25D366', padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none' }}
                  >
                    <Send size={14} /> Testar Envio
                  </button>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleEdit(rem)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.4rem' }}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(rem.id)} style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer', padding: '0.4rem' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
