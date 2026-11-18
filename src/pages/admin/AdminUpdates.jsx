import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  RefreshCw, CheckCircle2, AlertTriangle, Sparkles, Send, 
  ExternalLink, Rocket, HelpCircle, ShieldCheck, Clock
} from 'lucide-react';
import { checkForUpdates, publishSystemUpdate, triggerVercelDeploy } from '../../lib/updates';
import { CURRENT_VERSION, RELEASE_DATE, CURRENT_CHANGELOG } from '../../version';

export function AdminUpdates() {
  const context = useOutletContext() || {};
  const isSuperAdmin = context.isSuperAdmin;

  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  
  // Vercel Deploy Hook configuration
  const [deployHookUrl, setDeployHookUrl] = useState(() => {
    return localStorage.getItem('fitapp_vercel_deploy_hook') || '';
  });
  const [deploying, setDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);

  // Super Admin Publisher Form
  const [pubVersion, setPubVersion] = useState('');
  const [pubTitle, setPubTitle] = useState('');
  const [pubChangelog, setPubChangelog] = useState('');
  const [pubLink, setPubLink] = useState('https://github.com/jowarte/fit-app');
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState(null);

  useEffect(() => {
    runCheck();
  }, []);

  const runCheck = async () => {
    setChecking(true);
    try {
      const res = await checkForUpdates();
      setUpdateInfo(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setChecking(false);
    }
  };

  const handleSaveDeployHook = (e) => {
    e.preventDefault();
    localStorage.setItem('fitapp_vercel_deploy_hook', deployHookUrl.trim());
    alert('Deploy Hook salvo com sucesso no navegador!');
  };

  const handleTriggerDeploy = async () => {
    if (!deployHookUrl) {
      alert('Por favor, informe seu Deploy Hook da Vercel no campo abaixo.');
      return;
    }
    setDeploying(true);
    setDeploySuccess(false);
    try {
      await triggerVercelDeploy(deployHookUrl.trim());
      setDeploySuccess(true);
    } catch (err) {
      alert('Erro ao disparar atualização: ' + err.message);
    } finally {
      setDeploying(false);
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!pubVersion || !pubTitle) {
      alert('Preencha pelo menos a Versão e o Título.');
      return;
    }

    setPublishing(true);
    setPublishMessage(null);
    try {
      const res = await publishSystemUpdate({
        version: pubVersion,
        title: pubTitle,
        changelog: pubChangelog,
        download_url: pubLink
      });

      if (res.success) {
        setPublishMessage({ type: 'success', text: `Atualização v${pubVersion} enviada com sucesso para todas as cópias!` });
        setPubVersion('');
        setPubTitle('');
        setPubChangelog('');
        runCheck();
      } else {
        setPublishMessage({ type: 'error', text: res.error || 'Erro ao publicar.' });
      }
    } catch (err) {
      setPublishMessage({ type: 'error', text: err.message });
    } finally {
      setPublishing(false);
    }
  };

  const hasUpdate = updateInfo?.hasUpdate;
  const remote = updateInfo?.remoteVersion;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <RefreshCw size={26} color="var(--primary-color)" />
            Central de Atualizações
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.3rem 0 0 0', fontSize: '0.95rem' }}>
            Acompanhe versões, sincronize novidades e envie melhorias para suas cópias.
          </p>
        </div>

        <button 
          onClick={runCheck}
          disabled={checking}
          className="btn"
          style={{ 
            background: 'rgba(255,255,255,0.08)', 
            color: 'white', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            padding: '0.65rem 1.1rem',
            borderRadius: '10px',
            fontSize: '0.9rem',
            cursor: checking ? 'not-allowed' : 'pointer'
          }}
        >
          <RefreshCw size={16} className={checking ? 'animate-spin' : ''} />
          {checking ? 'Verificando...' : 'Verificar Atualizações'}
        </button>
      </div>

      {/* Status Card */}
      {loading ? (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Consultando status das atualizações...</p>
        </div>
      ) : hasUpdate ? (
        <div 
          className="glass-card" 
          style={{ 
            padding: '1.75rem', 
            marginBottom: '2rem', 
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(6, 182, 212, 0.15))',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            borderRadius: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ background: '#06b6d4', padding: '0.75rem', borderRadius: '12px', display: 'flex' }}>
                <Rocket size={28} color="#000" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ background: '#ef4444', color: 'white', fontSize: '0.75rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '6px' }}>
                    NOVA VERSÃO DISPONÍVEL
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Lançada em: {remote?.release_date || 'Recente'}
                  </span>
                </div>
                <h2 style={{ margin: '0.4rem 0 0.2rem 0', fontSize: '1.4rem', color: '#fff' }}>
                  Versão {remote?.version} — {remote?.title}
                </h2>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Sua versão atual instalada é <strong>v{CURRENT_VERSION}</strong>. Clique abaixo para atualizar sua cópia.
                </p>
              </div>
            </div>

            <button 
              onClick={handleTriggerDeploy}
              disabled={deploying}
              className="btn btn-primary"
              style={{ padding: '0.8rem 1.4rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Rocket size={18} />
              {deploying ? 'Atualizando na Vercel...' : 'Atualizar Minha Cópia'}
            </button>
          </div>

          {deploySuccess && (
            <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CheckCircle2 size={20} />
              <div>
                <strong>Comando de deploy enviado com sucesso para a Vercel!</strong>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
                  A Vercel está reconstruindo seu app agora. Aguarde cerca de 1 a 2 minutos e recarregue a página.
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div 
          className="glass-card" 
          style={{ 
            padding: '1.5rem', 
            marginBottom: '2rem', 
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.05))',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.75rem', borderRadius: '12px', display: 'flex' }}>
              <ShieldCheck size={28} color="#10b981" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#10b981' }}>
                Seu aplicativo está na versão mais recente!
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Versão instalada: <strong>v{CURRENT_VERSION}</strong> (Última compilação: {RELEASE_DATE})
              </p>
            </div>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            🟢 Tudo atualizado e operacional
          </span>
        </div>
      )}

      {/* Grid: 2 Colunas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Card: Como Funciona a Atualização */}
        <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Rocket size={20} color="var(--primary-color)" />
            Atualização em 1 Clique (Vercel)
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Configure seu <strong>Deploy Hook</strong> da Vercel uma única vez. Assim, basta clicar em "Atualizar" para seu app baixar as melhorias automaticamente!
          </p>

          <form onSubmit={handleSaveDeployHook} style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                URL do Deploy Hook da Vercel:
              </label>
              <input 
                type="url"
                value={deployHookUrl}
                onChange={(e) => setDeployHookUrl(e.target.value)}
                placeholder="https://api.vercel.com/v1/integrations/deploy/prj_.../..."
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'white',
                  fontSize: '0.85rem'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button 
                type="submit" 
                className="btn" 
                style={{ flex: 1, padding: '0.65rem', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '0.85rem' }}
              >
                Salvar Hook
              </button>
              <button 
                type="button"
                onClick={handleTriggerDeploy}
                disabled={deploying}
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.65rem', fontSize: '0.85rem' }}
              >
                {deploying ? 'Disparando...' : 'Testar Atualização'}
              </button>
            </div>
          </form>

          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <HelpCircle size={14} /> Como pegar meu Deploy Hook na Vercel?
            </span>
            1. Abra seu projeto no painel da Vercel.<br/>
            2. Vá em <strong>Settings</strong> ➔ <strong>Git</strong> ➔ <strong>Deploy Hooks</strong>.<br/>
            3. Dê um nome (ex: "AutoUpdate") e clique em <em>Create Hook</em>. Cole o link aqui!
          </div>
        </div>

        {/* Card: Novidades e Changelog */}
        <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} color="#ffc107" />
            O que há de novo (v{hasUpdate ? remote?.version : CURRENT_VERSION})
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Recursos, melhorias de desempenho e novidades implementadas:
          </p>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {(hasUpdate ? remote?.changelog : CURRENT_CHANGELOG)?.map((item, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.88rem', color: 'white' }}>
                <CheckCircle2 size={16} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <a 
              href="https://github.com/jowarte/fit-app" 
              target="_blank" 
              rel="noreferrer"
              style={{ color: 'var(--primary-color)', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
            >
              Ver repositório oficial no GitHub <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* ÁREA EXCLUSIVA PARA O SUPER ADMIN (VOCÊ) */}
      {isSuperAdmin && (
        <div 
          className="glass-card" 
          style={{ 
            padding: '1.75rem', 
            borderRadius: '16px', 
            border: '1px solid rgba(255, 193, 7, 0.3)',
            background: 'linear-gradient(180deg, rgba(255, 193, 7, 0.05), rgba(0,0,0,0.2))'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <span style={{ background: '#ffc107', color: 'black', fontSize: '0.75rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px' }}>
              EXCLUSIVO SUPER ADMIN
            </span>
            <h2 style={{ margin: 0, fontSize: '1.3rem' }}>Lançar Nova Atualização para Todas as Cópias</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Ao publicar aqui, <strong>todas as pessoas que usam o app receberão um aviso de atualização</strong> no topo dos seus painéis de administração.
          </p>

          {publishMessage && (
            <div style={{ 
              marginBottom: '1rem', 
              padding: '0.85rem 1rem', 
              borderRadius: '8px', 
              fontSize: '0.9rem',
              background: publishMessage.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              border: `1px solid ${publishMessage.type === 'success' ? '#10b981' : '#ef4444'}`,
              color: publishMessage.type === 'success' ? '#10b981' : '#ef4444'
            }}>
              {publishMessage.text}
            </div>
          )}

          <form onSubmit={handlePublish} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Número da Versão (ex: 1.2.1):
                </label>
                <input 
                  type="text"
                  value={pubVersion}
                  onChange={(e) => setPubVersion(e.target.value)}
                  placeholder="1.2.1"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'white',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Título Resumido da Versão:
                </label>
                <input 
                  type="text"
                  value={pubTitle}
                  onChange={(e) => setPubTitle(e.target.value)}
                  placeholder="Ex: Novos Exercícios e Alarme Esportivo"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'white',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Novidades e Melhorias (coloque uma por linha):
              </label>
              <textarea 
                rows={4}
                value={pubChangelog}
                onChange={(e) => setPubChangelog(e.target.value)}
                placeholder="• Alarme sonoro com apito e vibração&#10;• Correção de botões em celulares&#10;• Mais de 50 novos exercícios adicionados"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <button 
              type="submit"
              disabled={publishing}
              className="btn btn-primary"
              style={{
                padding: '0.85rem 1.5rem',
                fontSize: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                alignSelf: 'flex-start',
                background: '#ffc107',
                color: 'black',
                fontWeight: 'bold',
                cursor: publishing ? 'not-allowed' : 'pointer'
              }}
            >
              <Send size={18} />
              {publishing ? 'Disparando Atualização...' : 'Publicar Atualização para Todas as Cópias'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
