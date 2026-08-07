import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Copy, CheckCircle2, Send } from 'lucide-react';

export function AdminSettings() {
  const [n8nUrl, setN8nUrl] = useState('');
  const [botVendeUrl, setBotVendeUrl] = useState('');
  const [n8nName, setN8nName] = useState('Integração 1 (n8n, Make, etc)');
  const [botVendeName, setBotVendeName] = useState('Integração 2 (Bot Vende, etc)');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [copied, setCopied] = useState(false);
  
  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cakto-webhook`;

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestWebhook = async (url) => {
    if (!url) {
      setMessage({ type: 'error', text: 'Preencha a URL antes de testar.' });
      return;
    }
    try {
      const payload = { 
        event: 'user_registered', 
        email: 'teste@exemplo.com', 
        phone: '11999999999',
        name: 'Usuário Teste'
      };

      const { data, error } = await supabase.functions.invoke('send-webhook', {
        body: { url, payload }
      });

      if (error) throw error;
      if (data && !data.success) throw new Error(data.error || 'Erro desconhecido');

      setMessage({ type: 'success', text: 'Webhook de teste enviado com sucesso!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao enviar webhook: ' + error.message });
    }
  };

  useEffect(() => {
    async function fetchSettings() {
      const { data, error } = await supabase.from('app_settings').select('*').eq('id', 1).single();
      if (!error && data) {
        setN8nUrl(data.n8n_webhook_url || '');
        setBotVendeUrl(data.bot_vende_webhook_url || '');
        if (data.n8n_webhook_name) setN8nName(data.n8n_webhook_name);
        if (data.bot_vende_webhook_name) setBotVendeName(data.bot_vende_webhook_name);
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
      n8n_webhook_url: n8nUrl,
      bot_vende_webhook_url: botVendeUrl,
      n8n_webhook_name: n8nName,
      bot_vende_webhook_name: botVendeName
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
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Integrações (Webhooks)</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Configure as URLs de Webhook para suas integrações. Sempre que um aluno se cadastrar, o sistema vai enviar os dados dele (Email e WhatsApp) para esses links automaticamente.
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
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.8rem', gap: '0.8rem' }}>
              <input 
                type="text" 
                value={n8nName}
                onChange={e => setN8nName(e.target.value)}
                placeholder="Nome da Integração 1"
                style={{ flex: 1, padding: '0.5rem 0.8rem', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}
              />
            </div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              URL do Webhook:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="url" 
                placeholder="Ex: https://n8n.seu-dominio.com/..."
                value={n8nUrl}
                onChange={e => setN8nUrl(e.target.value)}
                style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              />
              <button 
                type="button" 
                onClick={() => handleTestWebhook(n8nUrl)}
                className="btn"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 1rem' }}
              >
                <Send size={18} /> Testar
              </button>
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.8rem', gap: '0.8rem' }}>
              <input 
                type="text" 
                value={botVendeName}
                onChange={e => setBotVendeName(e.target.value)}
                placeholder="Nome da Integração 2"
                style={{ flex: 1, padding: '0.5rem 0.8rem', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}
              />
            </div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              URL do Webhook:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="url" 
                placeholder="Ex: https://noeflow.com/api/webhooks/ext/..."
                value={botVendeUrl}
                onChange={e => setBotVendeUrl(e.target.value)}
                style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              />
              <button 
                type="button" 
                onClick={() => handleTestWebhook(botVendeUrl)}
                className="btn"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 1rem' }}
              >
                <Send size={18} /> Testar
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem' }}>
            <Save size={18} />
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </form>
      </div>

      <div className="glass-card" style={{ maxWidth: '600px', marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Recebimento de Vendas (Cakto, Kiwify, etc)</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Copie a URL abaixo e cole nas configurações de <b>Webhook</b> da sua plataforma de vendas. Quando uma venda for Aprovada, a plataforma enviará um aviso para este link, e o app criará automaticamente o acesso do aluno!
        </p>

        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
          Sua URL de Webhook:
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            readOnly
            value={webhookUrl}
            style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}
          />
          <button 
            onClick={handleCopyWebhook}
            className="btn"
            style={{ 
              background: copied ? 'rgba(0, 200, 83, 0.2)' : 'rgba(255,255,255,0.1)', 
              color: copied ? '#00c853' : 'white',
              border: copied ? '1px solid #00c853' : '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0 1rem'
            }}
          >
            {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: '1rem', fontStyle: 'italic' }}>
          * Certifique-se de configurar a plataforma para enviar eventos de "Venda Aprovada" / "Assinatura Ativa" para esta URL.
        </p>
      </div>
    </div>
  );
}
