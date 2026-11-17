import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, MessageCircle, CreditCard, LogOut, Shield, User, Share2, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { DEFAULT_PLANS, applySimulator } from '../lib/permissions';

export function ConfigPage() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          if (!error && data) {
            setUserProfile(applySimulator(data));
          }
        }
      } catch (e) {
        console.error("Erro ao carregar perfil:", e);
      }
    }
    loadProfile();

    let savedPlans = [];
    try {
      const saved = localStorage.getItem('admin_plans');
      if (saved) savedPlans = JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    if (savedPlans.length === 0) {
      savedPlans = DEFAULT_PLANS;
    }
    setPlans(savedPlans);
  }, []);

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '6rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Settings size={28} color="var(--primary-color)" />
        <h2 style={{ margin: 0 }}>Configurações & Perfil</h2>
      </div>

      {/* Cartão de Dica: Compartilhar no WhatsApp */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(37, 211, 102, 0.3)', background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.08), rgba(0,0,0,0.4))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.8rem' }}>
          <div style={{ background: '#25D366', padding: '0.5rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageCircle size={22} color="#000" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'white' }}>Compartilhe no WhatsApp</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Envie treinos e exercícios na hora</span>
          </div>
        </div>
        
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', lineHeight: '1.4', margin: 0 }}>
          Você pode enviar qualquer ficha de treino ou vídeo de exercício direto para o seu WhatsApp ou de seus alunos com apenas 1 clique através do botão <strong>WhatsApp</strong> presente nos vídeos e nas rotinas!
        </p>
      </div>

      {/* Cartão da Assinatura */}
      {userProfile && (
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <CreditCard size={20} color="var(--primary-color)" />
            <h3 style={{ margin: 0 }}>Sua Assinatura</h3>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              {userProfile.status === 'trial' ? (
                <>
                  <h4 style={{ margin: '0 0 0.2rem 0', color: '#ffb020' }}>
                    Período de Teste Ativo ({plans.find(p => p.id === userProfile.plan_id)?.name || 'Teste'})
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Expira em: {userProfile.trial_ends_at ? new Date(userProfile.trial_ends_at).toLocaleDateString('pt-BR') : '-'}
                  </span>
                </>
              ) : (
                <>
                  <h4 style={{ margin: '0 0 0.2rem 0', color: 'white' }}>
                    {plans.find(p => p.id === userProfile.plan_id)?.name || (userProfile.is_premium ? 'Plano Premium' : 'Plano Gratuito')}
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {userProfile.plan_id || userProfile.is_premium ? 'Acesso completo liberado' : 'Acesso básico liberado'}
                  </span>
                </>
              )}
            </div>
            
            {(userProfile.status === 'trial' || (!userProfile.plan_id && !userProfile.is_premium)) && (
              <button 
                onClick={() => navigate('/planos')}
                className="btn btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '8px', textTransform: 'none' }}
              >
                Fazer Upgrade
              </button>
            )}
          </div>
        </div>
      )}

      {/* Cartão Minha Conta & Acesso */}
      {userProfile && (
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <User size={20} color="var(--primary-color)" />
            <h3 style={{ margin: 0 }}>Minha Conta & Acesso</h3>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.9rem', color: 'white', marginBottom: '0.3rem', fontWeight: '500' }}>
              {userProfile.name || 'Usuário'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              {userProfile.email}
            </div>
            <span style={{ 
              display: 'inline-block',
              fontSize: '0.75rem', 
              background: (userProfile.role === 'super_admin' ? '#ffc107' : userProfile.role === 'admin' ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)'), 
              color: (userProfile.role === 'super_admin' || userProfile.role === 'admin') ? '#000' : 'white', 
              padding: '0.2rem 0.6rem', 
              borderRadius: '12px', 
              fontWeight: 'bold' 
            }}>
              Nível: {userProfile.role === 'super_admin' ? 'SUPER ADMIN' : userProfile.role === 'admin' ? 'ADMINISTRADOR' : 'ALUNO'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(userProfile.role === 'admin' || userProfile.role === 'super_admin') && (
              <button
                onClick={() => navigate('/admin')}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
              >
                <Shield size={18} />
                <span>Ir para o Painel Administrativo</span>
              </button>
            )}

            <button
              onClick={async () => {
                await supabase.auth.signOut();
                navigate('/login');
              }}
              className="btn"
              style={{ width: '100%', padding: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ff6b6b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}
            >
              <LogOut size={18} />
              <span>Sair da Conta (Logout)</span>
            </button>
          </div>
        </div>
      )}

      {/* Sobre o App */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 0.5rem 0' }}>Sobre o App</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 0.25rem 0' }}>TreinoApp Pro</p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Foco, disciplina e resultados.</p>
      </div>
    </div>
  );
}
