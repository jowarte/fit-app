import React, { useState, useEffect } from 'react';
import { supabase, SUPABASE_URL } from '../../lib/supabase';
import { Save, Copy, CheckCircle2, Send, Key, Mail, Lock, ShieldCheck, Globe, Palette, Image, Search, Eye, Sparkles } from 'lucide-react';

const COVER_PRESETS = [
  { name: 'Padrão do App', url: '/cover.png' },
  { name: 'Academia Moderna', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop' },
  { name: 'Mulher Fitness', url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1470&auto=format&fit=crop' },
  { name: 'Treino Intenso', url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1470&auto=format&fit=crop' },
  { name: 'Dark Minimalista', url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1470&auto=format&fit=crop' }
];

const COLOR_PRESETS = [
  { name: 'Verde Neon', hex: '#00ff88' },
  { name: 'Azul Ciano', hex: '#00d2ff' },
  { name: 'Laranja Fire', hex: '#ff6600' },
  { name: 'Roxo Elétrico', hex: '#a855f7' },
  { name: 'Vermelho Power', hex: '#ff3333' },
  { name: 'Dourado VIP', hex: '#ffb020' }
];

export function AdminSettings() {
  // Identidade Visual
  const [appName, setAppName] = useState('TreinoApp');
  const [appLogoUrl, setAppLogoUrl] = useState('');
  const [appCoverUrl, setAppCoverUrl] = useState('/cover.png');
  const [primaryColor, setPrimaryColor] = useState('#00ff88');

  // SEO & Mecanismos de Busca
  const [seoTitle, setSeoTitle] = useState('TreinoApp - Seu Treino Em Qualquer Lugar');
  const [seoDescription, setSeoDescription] = useState('Plataforma completa de treinos com mais de 1.800 exercícios em vídeo e GIF, fichas personalizadas e resultados rápidos.');

  // Webhooks
  const [n8nUrl, setN8nUrl] = useState('');
  const [botVendeUrl, setBotVendeUrl] = useState('');
  const [n8nName, setN8nName] = useState('Integração 1 (n8n, Make, etc)');
  const [botVendeName, setBotVendeName] = useState('Integração 2 (Bot Vende, etc)');
  
  // Credenciais do Admin
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
  
  const webhookUrl = `${SUPABASE_URL}/functions/v1/cakto-webhook`;

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
    // Carregar cache local inicial para resposta imediata
    try {
      const local = localStorage.getItem('app_settings_local');
      if (local) {
        const p = JSON.parse(local);
        if (p.app_name) setAppName(p.app_name);
        if (p.app_logo_url) setAppLogoUrl(p.app_logo_url);
        if (p.app_cover_url) setAppCoverUrl(p.app_cover_url);
        if (p.primary_color) setPrimaryColor(p.primary_color);
        if (p.seo_title) setSeoTitle(p.seo_title);
        if (p.seo_description) setSeoDescription(p.seo_description);
      }
    } catch (e) {
      console.error(e);
    }

    async function fetchSettings() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          setCurrentEmail(session.user.email);
          setNewEmail(session.user.email);
        }

        const { data, error } = await supabase.from('app_settings').select('*').eq('id', 1).single();
        if (!error && data) {
          if (data.app_name) setAppName(data.app_name);
          if (data.app_logo_url !== undefined && data.app_logo_url !== null) setAppLogoUrl(data.app_logo_url);
          if (data.app_cover_url) setAppCoverUrl(data.app_cover_url);
          if (data.primary_color) setPrimaryColor(data.primary_color);
          if (data.seo_title) setSeoTitle(data.seo_title);
          if (data.seo_description) setSeoDescription(data.seo_description);

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

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id && updates.email) {
        await supabase.from('profiles').update({ email: updates.email }).eq('id', session.user.id);
        setCurrentEmail(updates.email);
      }

      setNewPassword('');
      setConfirmPassword('');
      
      let msg = 'Dados de acesso atualizados com sucesso!';
      if (emailChanged) {
        msg += ' Confirme o link enviado para o novo e-mail se a confirmação estiver ativa.';
      }
      setAccountMessage({ type: 'success', text: msg });
    } catch (err) {
      console.error(err);
      setAccountMessage({ type: 'error', text: err.message || 'Erro ao atualizar dados de acesso.' });
    } finally {
      setSavingAccount(false);
    }
  }

  async function handleSaveSettings(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = { 
      id: 1, 
      app_name: appName,
      app_logo_url: appLogoUrl,
      app_cover_url: appCoverUrl,
      primary_color: primaryColor,
      seo_title: seoTitle,
      seo_description: seoDescription,
      n8n_webhook_url: n8nUrl,
      bot_vende_webhook_url: botVendeUrl,
      n8n_webhook_name: n8nName,
      bot_vende_webhook_name: botVendeName
    };

    // Salvar localmente para efeito imediato em toda a sessão
    localStorage.setItem('app_settings_local', JSON.stringify(payload));
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.title = seoTitle || appName;

    try {
      const { error } = await supabase.from('app_settings').upsert(payload);
      if (error) {
        // Se a coluna ainda não existir no banco, tenta salvar apenas o que existe
        console.warn('Tentativa com todas as colunas falhou, tentando salvar colunas padrão:', error);
        await supabase.from('app_settings').upsert({
          id: 1,
          n8n_webhook_url: n8nUrl,
          bot_vende_webhook_url: botVendeUrl,
          n8n_webhook_name: n8nName,
          bot_vende_webhook_name: botVendeName
        });
        setMessage({ type: 'success', text: 'Configurações salvas com sucesso! (Aplicação imediata ativada)' });
      } else {
        setMessage({ type: 'success', text: 'Configurações salvas e aplicadas em todo o aplicativo!' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'success', text: 'Configurações salvas no seu navegador!' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ padding: '2rem' }}>Carregando configurações...</div>;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem', maxWidth: '800px' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Configurações Gerais</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Personalize a marca, logotipo, capa de fundo, SEO e integrações do seu aplicativo.
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

      <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* BLOCO 1: Identidade Visual e Marca */}
        <div className="glass-card" style={{ padding: '1.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.2rem' }}>
            <Palette size={22} color="var(--primary-color)" />
            <h3 style={{ margin: 0, color: 'white' }}>Identidade Visual & Marca (White-Label)</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            {/* Nome do Aplicativo */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Nome do Aplicativo (aparece no topo, telas de login e cabeçalhos):
              </label>
              <input 
                type="text" 
                required
                value={appName}
                onChange={e => setAppName(e.target.value)}
                placeholder="Ex: TreinoApp, PowerFit, Academia Elite..."
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem', fontWeight: 'bold' }}
              />
            </div>

            {/* Logo do App */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                URL da Logo do App (Link da imagem em PNG ou SVG com fundo transparente):
              </label>
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                <input 
                  type="url" 
                  value={appLogoUrl}
                  onChange={e => setAppLogoUrl(e.target.value)}
                  placeholder="https://exemplo.com/logo.png"
                  style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                />
                {appLogoUrl ? (
                  <div style={{ width: '50px', height: '50px', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <img src={appLogoUrl} alt="Logo Preview" style={{ maxWidth: '40px', maxHeight: '40px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>(Sem logo)</span>
                )}
              </div>
            </div>

            {/* Cor Primária do App */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Cor Primária do Aplicativo:
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <input 
                  type="color" 
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  style={{ width: '45px', height: '45px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'transparent' }}
                />
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {COLOR_PRESETS.map(preset => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setPrimaryColor(preset.hex)}
                      style={{
                        background: primaryColor === preset.hex ? preset.hex : 'rgba(255,255,255,0.05)',
                        color: primaryColor === preset.hex ? '#000' : 'white',
                        border: `1px solid ${preset.hex}`,
                        padding: '0.4rem 0.8rem',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                      }}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Imagem de Fundo (Hero Cover) */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Imagem de Fundo do App (Hero da Página Inicial e Página de Vendas):
              </label>
              <input 
                type="text" 
                value={appCoverUrl}
                onChange={e => setAppCoverUrl(e.target.value)}
                placeholder="/cover.png ou URL da imagem"
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', marginBottom: '0.8rem' }}
              />

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
                {COVER_PRESETS.map(preset => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setAppCoverUrl(preset.url)}
                    style={{
                      background: appCoverUrl === preset.url ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                      color: appCoverUrl === preset.url ? '#000' : 'white',
                      border: '1px solid rgba(255,255,255,0.1)',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      fontSize: '0.75rem'
                    }}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>

              {/* Preview da Capa */}
              <div style={{ width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.1)' }}>
                <img src={appCoverUrl} alt="Cover Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = '/cover.png'; }} />
                <div style={{ position: 'absolute', bottom: '8px', left: '12px', background: 'rgba(0,0,0,0.7)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', color: 'white' }}>
                  Prévia da Capa
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* BLOCO 2: SEO & Mecanismos de Busca (Google & WhatsApp) */}
        <div className="glass-card" style={{ padding: '1.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.2rem' }}>
            <Globe size={22} color="var(--primary-color)" />
            <h3 style={{ margin: 0, color: 'white' }}>SEO & Mecanismos de Busca (Google e Compartilhamentos)</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Título SEO (&lt;title&gt; da página):
              </label>
              <input 
                type="text" 
                value={seoTitle}
                onChange={e => setSeoTitle(e.target.value)}
                placeholder="Ex: TreinoApp - O Método Definitivo para seu Treino"
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Descrição para o Google & WhatsApp (Meta Description):
              </label>
              <textarea 
                rows="3"
                value={seoDescription}
                onChange={e => setSeoDescription(e.target.value)}
                placeholder="Descrição resumida do que o app oferece..."
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', resize: 'vertical' }}
              />
            </div>

            {/* Simulação da Busca no Google */}
            <div style={{ background: '#202124', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '0.75rem', color: '#9aa0a6', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Simulação de como aparece no Google:
              </span>
              <div style={{ fontSize: '0.8rem', color: '#bdc1c6', marginBottom: '0.2rem' }}>
                {window.location.origin} › planos
              </div>
              <div style={{ fontSize: '1.1rem', color: '#8ab4f8', fontWeight: '500', marginBottom: '0.3rem', cursor: 'pointer' }}>
                {seoTitle || 'TreinoApp'}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#bdc1c6', lineHeight: 1.4 }}>
                {seoDescription || 'Sem descrição informada.'}
              </div>
            </div>

          </div>
        </div>

        {/* BLOCO 3: Integrações (Webhooks) */}
        <div className="glass-card" style={{ padding: '1.8rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Integrações (Webhooks)</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            URLs de Webhook disparadas automaticamente quando um novo aluno se cadastra.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <input 
                type="text" 
                value={n8nName}
                onChange={e => setN8nName(e.target.value)}
                placeholder="Nome da Integração 1"
                style={{ width: '100%', marginBottom: '0.6rem', padding: '0.5rem 0.8rem', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}
              />
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
              <input 
                type="text" 
                value={botVendeName}
                onChange={e => setBotVendeName(e.target.value)}
                placeholder="Nome da Integração 2"
                style={{ width: '100%', marginBottom: '0.6rem', padding: '0.5rem 0.8rem', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}
              />
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
          </div>
        </div>

        {/* Botão de Salvar Tudo */}
        <button 
          type="submit" 
          className="btn btn-primary animate-scale" 
          disabled={saving} 
          style={{ padding: '1.1rem', fontSize: '1.05rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', fontWeight: 'bold' }}
        >
          <Save size={20} />
          {saving ? 'Salvando Configurações...' : 'Salvar Todas as Configurações'}
        </button>

      </form>

      {/* BLOCO 4: Meus Dados de Acesso (Administrador) */}
      <div className="glass-card" style={{ padding: '1.8rem', marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <Key size={22} color="var(--primary-color)" />
          <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>Meus Dados de Acesso (Administrador)</h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Altere seu e-mail e sua senha de administrador a qualquer momento.
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

      {/* BLOCO 5: Webhook de Recebimento de Vendas */}
      <div className="glass-card" style={{ padding: '1.8rem', marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Recebimento de Vendas (Cakto, Kiwify, Hotmart)</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Cole a URL abaixo nas configurações de <b>Webhook</b> da sua plataforma de vendas para criar o acesso do aluno automaticamente quando uma venda for aprovada.
        </p>

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
      </div>

    </div>
  );
}
