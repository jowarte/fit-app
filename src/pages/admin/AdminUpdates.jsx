import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  RefreshCw, CheckCircle2, Sparkles, Send, 
  ExternalLink, Rocket, ShieldCheck, GitBranch, Copy
} from 'lucide-react';
import { checkForUpdates, publishSystemUpdate } from '../../lib/updates';
import { CURRENT_VERSION, RELEASE_DATE, CURRENT_CHANGELOG } from '../../version';
import { supabase } from '../../lib/supabase';

const SYSTEM_UPDATES_SQL = `CREATE TABLE IF NOT EXISTS public.system_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  changelog JSONB DEFAULT '[]'::jsonb,
  download_url TEXT DEFAULT 'https://github.com/jowarte/fit-app',
  release_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.system_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "system_updates_select_all" ON public.system_updates FOR SELECT USING (true);
CREATE POLICY "system_updates_manage_superadmin" ON public.system_updates FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);`;

export function AdminUpdates() {
  const context = useOutletContext() || {};

  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  // Modo Criador / Publicador
  const [showPublisher, setShowPublisher] = useState(false);
  const [pubVersion, setPubVersion] = useState('');
  const [pubTitle, setPubTitle] = useState('');
  const [pubChangelog, setPubChangelog] = useState('');
  const [pubLink, setPubLink] = useState('https://github.com/jowarte/fit-app');
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState(null);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    runCheck();
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        // Só exibe o painel de publicar se for a conta oficial do criador
        if (session.user.email === 'admin@admin.com') {
          setShowPublisher(true);
        }
      }
    } catch (_) {}
  };

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

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!pubVersion || !pubTitle) {
      alert('Preencha a Versão e o Título da atualização.');
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
        const isTableMissing = res.error && (res.error.includes('system_updates') || res.error.includes('schema cache'));
        setPublishMessage({ 
          type: 'error', 
          text: isTableMissing 
            ? 'A tabela de atualizações ainda não foi criada no seu banco do Supabase. Basta executar o comando SQL abaixo no seu Supabase:' 
            : res.error || 'Erro ao publicar.',
          sqlNeeded: isTableMissing
        });
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
            Acompanhe a versão instalada e as novidades oficiais do aplicativo.
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
          <p>Consultando status das versões...</p>
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
                  Sua versão atual instalada é <strong>v{CURRENT_VERSION}</strong>. Novas melhorias estão disponíveis!
                </p>
              </div>
            </div>

            <a 
              href="https://github.com/jowarte/fit-app" 
              target="_blank" 
              rel="noreferrer"
              className="btn btn-primary"
              style={{ padding: '0.8rem 1.4rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
            >
              <GitBranch size={18} />
              Sincronizar Atualização (GitHub)
            </a>
          </div>
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
                Versão instalada: <strong>v{CURRENT_VERSION}</strong> (Compilação: {RELEASE_DATE})
              </p>
            </div>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            🟢 Nenhuma atualização pendente
          </span>
        </div>
      )}

      {/* Grid: 2 Colunas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Card: Novidades e Changelog */}
        <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} color="#ffc107" />
            O que há de novo (v{hasUpdate ? remote?.version : CURRENT_VERSION})
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Recursos, melhorias e novidades incluídas nesta versão:
          </p>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {(hasUpdate ? remote?.changelog : CURRENT_CHANGELOG)?.map((item, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.88rem', color: 'white' }}>
                <CheckCircle2 size={16} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Card: Como Funcionam as Atualizações */}
        <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GitBranch size={20} color="var(--primary-color)" />
            Como Minha Cópia é Atualizada?
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <strong style={{ color: 'white', display: 'block', marginBottom: '0.3rem', fontSize: '0.95rem' }}>
                🔄 1. Atualização Automática
              </strong>
              Se a sua hospedagem é mantida pela equipe oficial, as melhorias entram <strong>automaticamente</strong> no seu aplicativo sem você precisar fazer nada!
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <strong style={{ color: 'white', display: 'block', marginBottom: '0.3rem', fontSize: '0.95rem' }}>
                🐙 2. Sincronização via GitHub
              </strong>
              Se você possui o repositório no seu próprio GitHub, basta abrir o seu repositório e clicar no botão <strong>"Sync Fork"</strong>. A Vercel atualiza seu aplicativo em 1 minuto.
            </div>

            <div style={{ marginTop: '0.5rem' }}>
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

      </div>

      {/* ÁREA EXCLUSIVA DO CRIADOR DO SOFTWARE (VOCÊ: admin@admin.com) */}
      {showPublisher && (
        <div 
          className="glass-card" 
          style={{ 
            padding: '1.75rem', 
            borderRadius: '16px', 
            border: '1px solid rgba(255, 193, 7, 0.3)',
            background: 'linear-gradient(180deg, rgba(255, 193, 7, 0.05), rgba(0,0,0,0.2))'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ background: '#ffc107', color: 'black', fontSize: '0.75rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px' }}>
                PAINEL DO CRIADOR DO SOFTWARE
              </span>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Publicar Nova Versão para Todas as Cópias</h2>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              🔒 Visível apenas para a conta mestre ({userEmail})
            </span>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            Quando você lançar uma versão nova aqui, <strong>todas as pessoas que compraram o app verão o aviso no painel delas</strong> para atualizar.
          </p>

          {publishMessage && (
            <div style={{ 
              marginBottom: '1.25rem', 
              padding: '1rem', 
              borderRadius: '10px', 
              fontSize: '0.9rem',
              background: publishMessage.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              border: `1px solid ${publishMessage.type === 'success' ? '#10b981' : '#ef4444'}`,
              color: publishMessage.type === 'success' ? '#10b981' : '#ef4444'
            }}>
              <p style={{ margin: 0, fontWeight: 'bold' }}>{publishMessage.text}</p>
              
              {publishMessage.sqlNeeded && (
                <div style={{ marginTop: '0.75rem', background: 'rgba(0,0,0,0.5)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#ffc107', fontWeight: 'bold' }}>
                      Execute este código no SQL Editor do Supabase:
                    </span>
                    <button 
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(SYSTEM_UPDATES_SQL);
                        setCopiedSql(true);
                        setTimeout(() => setCopiedSql(false), 2000);
                      }}
                      className="btn btn-primary"
                      style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <Copy size={12} />
                      {copiedSql ? 'Copiado!' : 'Copiar Código SQL'}
                    </button>
                  </div>
                  <pre style={{ fontSize: '0.72rem', color: '#00d2ff', margin: 0, overflowX: 'auto', whiteSpace: 'pre-wrap', maxHeight: '150px' }}>
                    {SYSTEM_UPDATES_SQL}
                  </pre>
                </div>
              )}
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
                rows={3}
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
                padding: '0.8rem 1.4rem',
                fontSize: '0.95rem',
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
              <Send size={16} />
              {publishing ? 'Disparando Atualização...' : 'Publicar Atualização para Todas as Cópias'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
