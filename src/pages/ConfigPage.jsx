import React, { useState, useEffect } from 'react';
import { Settings, Bell, MessageCircle, Phone, CheckCircle2, AlertCircle, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase'; // Para uso futuro quando houver login
import { checkUserPermission, DEFAULT_PLANS, applySimulator } from '../lib/permissions';

export function ConfigPage() {
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [userPhone, setUserPhone] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    // Carregar configurações salvas
    const savedStatus = localStorage.getItem('user_wa_enabled');
    const savedPhone = localStorage.getItem('user_wa_phone');
    const connected = localStorage.getItem('user_wa_connected');
    
    // O número oficial do App (Puxando do localStorage para o teste, 
    // mas num ambiente real viria do banco de dados das configurações do sistema)
    const appNumber = localStorage.getItem('whatsapp_number') || '5511999999999';
    
    if (savedStatus === 'true') setWhatsappEnabled(true);
    if (savedPhone) setUserPhone(savedPhone);
    if (connected === 'true') setIsConnected(true);
    
    setAdminPhone(appNumber);

    async function loadProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          if (!error && data) {
            setUserProfile(applySimulator(data));
            // Se o usuário perdeu acesso premium e o WhatsApp estava ativo, desliga
            const hasWaAccess = checkUserPermission(data, 'access_whatsapp');
            if (!hasWaAccess && savedStatus === 'true') {
              setWhatsappEnabled(false);
              localStorage.setItem('user_wa_enabled', 'false');
            }
          }
        }
      } catch (e) {
        console.error(e);
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

  const handleToggle = () => {
    const hasWhatsappAccess = checkUserPermission(userProfile, 'access_whatsapp');
    if (!hasWhatsappAccess) {
      if (userProfile?.status === 'trial') {
        alert("A ativação de lembretes automáticos no WhatsApp não está inclusa no seu período de teste. Assine um plano completo para habilitar!");
      } else {
        alert("A ativação de lembretes automáticos no WhatsApp é um recurso Premium. Escolha um plano de assinatura para habilitar.");
      }
      return;
    }

    const newValue = !whatsappEnabled;
    setWhatsappEnabled(newValue);
    localStorage.setItem('user_wa_enabled', newValue);
  };

  const handlePhoneChange = (e) => {
    setUserPhone(e.target.value);
    localStorage.setItem('user_wa_phone', e.target.value);
    // Se mudou o número, precisa reconectar
    setIsConnected(false);
    localStorage.setItem('user_wa_connected', 'false');
  };

  const handleConnect = () => {
    if (!userPhone || userPhone.length < 10) {
      alert("Por favor, digite um número de WhatsApp válido com DDD.");
      return;
    }
    
    setIsConnected(true);
    localStorage.setItem('user_wa_connected', 'true');
    
    // Limpar caracteres especiais do número do Admin
    const cleanAdminNum = adminPhone.replace(/\D/g, '');
    const message = encodeURIComponent("Olá! Sou aluno e quero ativar meus lembretes de treino neste número.");
    
    const url = `https://wa.me/${cleanAdminNum}?text=${message}`;
    window.open(url, '_blank');
  };

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '6rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Settings size={28} color="var(--primary-color)" />
        <h2 style={{ margin: 0 }}>Configurações</h2>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <Bell size={20} color="var(--primary-color)" />
          <h3 style={{ margin: 0 }}>Notificações e Lembretes</h3>
        </div>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Mantenha a consistência nos treinos ativando nossos lembretes automáticos diretamente no seu WhatsApp!
        </p>

        {/* Toggle WhatsApp */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(37, 211, 102, 0.1)', padding: '0.6rem', borderRadius: '50%' }}>
              <MessageCircle size={24} color="#25D366" />
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.2rem 0' }}>Lembretes via WhatsApp</h4>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Receba avisos na hora do seu treino</span>
            </div>
          </div>
          
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={whatsappEnabled}
              onChange={handleToggle}
              style={{ width: '22px', height: '22px', accentColor: '#25D366' }}
            />
          </label>
        </div>

        {/* Configuração do Número (Aparece apenas se o toggle estiver ligado) */}
        {whatsappEnabled && (
          <div className="animate-fade-in" style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(37, 211, 102, 0.05)', borderRadius: '12px', border: '1px solid rgba(37, 211, 102, 0.2)' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: 'white' }}>Conecte seu Número</h4>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Seu número de WhatsApp (com DDD)</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', padding: '0 0.8rem' }}>
                <Phone size={18} color="var(--text-secondary)" />
                <input 
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={userPhone}
                  onChange={handlePhoneChange}
                  style={{ 
                    flex: 1, padding: '0.8rem', background: 'transparent', border: 'none', 
                    color: 'white', outline: 'none', fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            {!isConnected ? (
              <>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', color: '#ffb020', fontSize: '0.85rem', marginBottom: '1.5rem', padding: '0.75rem', background: 'rgba(255, 176, 32, 0.1)', borderRadius: '8px' }}>
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <p style={{ margin: 0 }}>Para evitar bloqueios por SPAM, você precisa enviar a primeira mensagem para o nosso assistente virtual autorizando os envios.</p>
                </div>
                
                <button 
                  onClick={handleConnect}
                  className="btn btn-primary animate-scale" 
                  style={{ width: '100%', padding: '0.8rem', background: '#25D366', borderColor: '#25D366', color: 'white', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}
                >
                  <MessageCircle size={18} /> Autorizar no WhatsApp
                </button>
              </>
            ) : (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem', background: 'rgba(37, 211, 102, 0.1)', borderRadius: '8px' }}>
                <CheckCircle2 size={32} color="#25D366" />
                <h4 style={{ margin: 0, color: '#25D366' }}>Tudo Pronto!</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                  Se você enviou a mensagem com sucesso, seu WhatsApp já está habilitado para receber os lembretes de treino.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      
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

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem 0' }}>Sobre o App</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>TreinoApp v1.0</p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Foco, disciplina e resultados.</p>
      </div>
    </div>
  );
}
