import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, CheckCircle2, Sparkles, 
  ExternalLink, Rocket, ShieldCheck, GitBranch
} from 'lucide-react';
import { checkForUpdates } from '../../lib/updates';
import { CURRENT_VERSION, RELEASE_DATE, CURRENT_CHANGELOG } from '../../version';

export function AdminUpdates() {
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);

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
            Acompanhe o status da sua versão e receba melhorias oficiais do aplicativo.
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

      {/* Status Card Principal */}
      {loading ? (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Consultando status das versões no canal oficial...</p>
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
                  Sua versão atual é <strong>v{CURRENT_VERSION}</strong>. Novas melhorias estão disponíveis!
                </p>
              </div>
            </div>

            <a 
              href={remote?.download_url || "https://github.com/jowarte/fit-app"} 
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

      {/* Grid: Novidades e Como Funciona */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
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
            Como as Atualizações Funcionam?
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <strong style={{ color: 'white', display: 'block', marginBottom: '0.3rem', fontSize: '0.95rem' }}>
                🔄 1. Atualização Automática
              </strong>
              Se a sua hospedagem é mantida pela equipe oficial, todas as melhorias e correções entram <strong>automaticamente</strong> no seu aplicativo sem você precisar fazer nada!
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

    </div>
  );
}
