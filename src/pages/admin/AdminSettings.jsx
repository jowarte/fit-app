import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Copy, CheckCircle2, Send, Key, Mail, Lock, ShieldCheck, User } from 'lucide-react';

export function AdminSettings() {
  const [n8nUrl, setN8nUrl] = useState('');
  const [botVendeUrl, setBotVendeUrl] = useState('');
  const [n8nName, setN8nName] = useState('Integração 1 (n8n, Make, etc)');
  const [botVendeName, setBotVendeName] = useState('Integração 2 (Bot Vende, etc)');
  
  // Estados para credenciais do Administrador
  const [currentEmail, setCurrentEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingAccount, setSavingAccount] = useState(false);
  const [accountMessage, setAccountMessage] = useState(null);

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
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          setCurrentEmail(session.user.email);
          setNewEmail(session.user.email);
        }

        const { data, error } = await supabase.from('app_settings').select('*').eq('id', 1).single();
        if (!error && data) {
          setN8nUrl(data.n8n_webhook_url || '');
          setBotVendeUrl(data.bot_vende_webhook_url || '');
          if (data.n8n_webhook_name) setN8nName(data.n8n_webhook_name);
          if (data.bot_vende_webhook_name) setBotVendeName(data.bot_vende_webhook_name);
        }
      } catch (err) {
        console.error('Erro ao carregar configurações:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  async function handleUpdateAccount(e) {
    e.preventDefault();
    setSavingAccount(true);
    setAccountMessage(null);

    try {
      if (newPassword && newPassword.length < 6) {
        throw new Error('A nova senha deve conter no mínimo 6 caracteres.');
      }

      if (newPassword && newPassword !== confirmPassword) {
        throw new Error('A confirmação de senha não coincide com a nova senha.');
      }

      const updates = {};
      let emailChanged = false;

      if (newEmail && newEmail.toLowerCase() !== currentEmail.toLowerCase()) {
        updates.email = newEmail.trim().toLowerCase();
        emailChanged = true;
      }

      if (newPassword) {
        updates.password = newPassword;
      }

      if (!updates.email && !updates.password) {
        throw new Error('Nenhuma alteração foi informada.');
      }

      const { data: userResponse, error: authError } = await supabase.auth.updateUser(updates);
      if (authError) throw authError;

      // Se mudou o email, atualiza também a tabela profiles
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id && updates.email) {
        await supabase.from('profiles').update({ email: updates.email }).eq('id', session.user.id);
        setCurrentEmail(updates.email);
      }

      setNewPassword('');
      setConfirmPassword('');
      
      let msg = 'Dados de acesso atualizados com sucesso!';
      if (emailChanged) {
        msg += ' Atenção: se a confirmação de e-mail estiver ativa no Supabase, confirme o link enviado para o novo e-mail.';
      }
      setAccountMessage({ type: 'success', text: msg });
    } catch (err) {
      console.error(err);
      setAccountMessage({ type: 'error', text: err.message || 'Erro ao atualizar dados de acesso.' });
    } finally {
      setSavingAccount(false);
    }
  }

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
      
      {/* Dados de Acesso do Administrador */}
      <div className="glass-card" style={{ maxWidth: '600px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <Key size={22} color="var(--primary-color)" />
          <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>Meus Dados de Acesso (Administrador)</h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Altere aqui seu e-mail e sua senha de acesso ao painel. Se você acabou de instalar o sistema com o login e senha padrão, troque-os agora para proteger o seu painel.
        </p>

        {accountMessage && (
          <div style={{ 
            padding: '1rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem',
            background: accountMessage.type === 'error' ? 'rgba(255, 68, 68, 0.1)' : 'rgba(0, 200, 83, 0.1)',
            color: accountMessage.type === 'error' ? '#ff4444' : '#00c853',
            border: `1px solid ${accountMessage.type === 'error' ? '#ff4444' : '#00c853'}`
          }}>
            {accountMessage.text}
          </div>
        )}

        <form onSubmit={handleUpdateAccount} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              E-mail de Login do Administrador:
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="email" 
                required
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Nova Senha (deixe em branco se não desejar alterar):
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="password" 
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              />
            </div>
          </div>

          {newPassword && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Confirmar Nova Senha:
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="password" 
                  placeholder="Repita a nova senha"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={savingAccount} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem' }}
          >
            <ShieldCheck size={18} />
            {savingAccount ? 'Salvando credenciais...' : 'Salvar Novo E-mail / Senha'}
          </button>
        </form>
      </div>

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
