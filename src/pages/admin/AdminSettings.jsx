import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save } from 'lucide-react';

export function AdminSettings() {
  const [evolutionUrl, setEvolutionUrl] = useState('');
  const [evolutionKey, setEvolutionKey] = useState('');
  const [evolutionInstance, setEvolutionInstance] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    async function fetchSettings() {
      const { data, error } = await supabase.from('app_settings').select('*').eq('id', 1).single();
      if (!error && data) {
        setEvolutionUrl(data.n8n_webhook_url || '');
      }
      setLoading(false);
    }
    fetchSettings();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const { error } = await supabase.from('app_settings').upsert({ 
      id: 1, 
      n8n_webhook_url: evolutionUrl // Usando a coluna que já existia para armazenar a URL do Webhook
    });
    
    if (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar: ' + error.message });
    } else {
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
    }
    setSaving(false);
  }

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: '2rem' }}>Configurações</h1>
      
      <div className="glass-card" style={{ maxWidth: '600px' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Integração com Bot Vende (Webhook)</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Cole aqui a URL de Webhook fornecida pelo seu <b>Bot Vende</b>. Sempre que um aluno se cadastrar, o sistema vai enviar os dados dele (Email e WhatsApp) para esse link automaticamente.
        </p>

        {message && (
          <div style={{ 
            padding: '1rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem',
            background: message.type === 'error' ? 'rgba(255, 68, 68, 0.1)' : 'rgba(0, 200, 83, 0.1)',
            color: message.type === 'error' ? '#ff4444' : '#00c853',
            border: `1px solid ${message.type === 'error' ? '#ff4444' : '#00c853'}`
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              URL do Webhook (Bot Vende):
            </label>
            <input 
              type="url" 
              placeholder="Ex: https://webhook.botvende.com/..."
              value={evolutionUrl}
              onChange={e => setEvolutionUrl(e.target.value)}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem' }}>
            <Save size={18} />
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </form>
      </div>
    </div>
  );
}
