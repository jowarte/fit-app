import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Bell, MessageCircle, Phone, CheckCircle2, AlertCircle, CreditCard, Plus, Clock, CalendarDays, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { checkUserPermission, DEFAULT_PLANS, applySimulator } from '../lib/permissions';

export function ConfigPage() {
  const navigate = useNavigate();
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [userPhone, setUserPhone] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [plans, setPlans] = useState([]);
  const [activationMessage, setActivationMessage] = useState('Olá! Sou aluno e quero ativar meus lembretes de treino neste número.');
  
  // Reminders state
  const [myReminders, setMyReminders] = useState([]);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: 'Meu Treino',
    dayOfWeek: 'Segunda-feira',
    time: '18:00',
    message: 'Oi! Não esqueça do seu treino de hoje! 💪'
  });

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
            
            // Set WhatsApp configs from DB
            setWhatsappEnabled(data.wa_enabled || false);
            if (data.wa_phone) setUserPhone(data.wa_phone);

            // Se o usuário perdeu acesso premium e o WhatsApp estava ativo, desliga
            const hasWaAccess = checkUserPermission(data, 'access_whatsapp');
            if (!hasWaAccess && data.wa_enabled) {
              setWhatsappEnabled(false);
              await supabase.from('profiles').update({ wa_enabled: false }).eq('id', session.user.id);
            }

            // Load user reminders
            const { data: rems } = await supabase.from('whatsapp_reminders').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
            if (rems) setMyReminders(rems);
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
    
    async function loadAdminPhone() {
      const { data } = await supabase.from('app_settings').select('whatsapp_bot_number, whatsapp_activation_message').eq('id', 1).single();
      if (data) {
        if (data.whatsapp_bot_number) setAdminPhone(data.whatsapp_bot_number);
        if (data.whatsapp_activation_message) setActivationMessage(data.whatsapp_activation_message);
      } else {
        setAdminPhone('5511999999999');
      }
    }
    loadAdminPhone();
  }, []);

  const handleToggle = async () => {
    const hasWhatsappAccess = checkUserPermission(userProfile, 'access_whatsapp');
    if (!hasWhatsappAccess) {
      // DEBUG temporário - remover depois
      const debugInfo = {
        status: userProfile?.status,
        plan_id: userProfile?.plan_id,
        is_premium: userProfile?.is_premium,
        access_whatsapp_override: userProfile?.access_whatsapp_override,
        trial_ends_at: userProfile?.trial_ends_at,
        now: new Date().toISOString(),
        expired: userProfile?.trial_ends_at ? new Date() > new Date(userProfile.trial_ends_at) : 'sem data',
        simPlanId: localStorage.getItem('simulated_plan_id'),
        plansCount: plans.length
      };
      alert('DEBUG - Bloqueado! Dados:\n' + JSON.stringify(debugInfo, null, 2));
      return;
    }

    const newValue = !whatsappEnabled;
    setWhatsappEnabled(newValue);
    
    if (userProfile?.id) {
      await supabase.from('profiles').update({ wa_enabled: newValue }).eq('id', userProfile.id);
    }
  };

  const handlePhoneChange = async (e) => {
    const newPhone = e.target.value;
    setUserPhone(newPhone);
    setIsConnected(false);
    
    if (userProfile?.id) {
      await supabase.from('profiles').update({ wa_phone: newPhone }).eq('id', userProfile.id);
    }
  };

  const handleConnect = () => {
    if (!userPhone || userPhone.length < 10) {
      alert("Por favor, digite um número de WhatsApp válido com DDD.");
      return;
    }
    
    setIsConnected(true);
    
    // Limpar caracteres especiais do número do Admin
    const cleanAdminNum = adminPhone.replace(/\D/g, '');
    const message = encodeURIComponent(activationMessage);
    
    const url = `https://wa.me/${cleanAdminNum}?text=${message}`;
    window.open(url, '_blank');
  };

  const handleSaveReminder = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        user_id: userProfile.id,
        title: newReminder.title,
        day_of_week: newReminder.dayOfWeek,
        time: newReminder.time,
        message: newReminder.message,
        active: true
      };
      const { data, error } = await supabase.from('whatsapp_reminders').insert([payload]).select().single();
      if (error) throw error;
      if (data) {
        setMyReminders([data, ...myReminders]);
        setShowAddReminder(false);
      }
    } catch (err) {
      alert('Erro ao salvar lembrete: ' + err.message);
    }
  };

  const handleDeleteReminder = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este horário?')) {
      await supabase.from('whatsapp_reminders').delete().eq('id', id);
      setMyReminders(myReminders.filter(r => r.id !== id));
    }
  };

  const toggleReminderActive = async (id, currentStatus) => {
    await supabase.from('whatsapp_reminders').update({ active: !currentStatus }).eq('id', id);
    setMyReminders(myReminders.map(r => r.id === id ? { ...r, active: !currentStatus } : r));
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
            
            {isConnected && (
              <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0, color: 'white' }}>Meus Horários</h4>
                  {!showAddReminder && (
                    <button onClick={() => setShowAddReminder(true)} style={{ background: 'none', border: 'none', color: '#25D366', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      <Plus size={16} /> Adicionar
                    </button>
                  )}
                </div>

                {showAddReminder && (
                  <form onSubmit={handleSaveReminder} className="animate-scale" style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.5rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Identificação</label>
                      <input 
                        type="text" required
                        value={newReminder.title} onChange={e => setNewReminder({...newReminder, title: e.target.value})}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.85rem' }}
                      />
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Dia da Semana</label>
                        <select 
                          value={newReminder.dayOfWeek} onChange={e => setNewReminder({...newReminder, dayOfWeek: e.target.value})}
                          style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.85rem' }}
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
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Horário</label>
                        <input 
                          type="time" required
                          value={newReminder.time} onChange={e => setNewReminder({...newReminder, time: e.target.value})}
                          style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Mensagem Personalizada</label>
                      <input 
                        type="text" required
                        value={newReminder.message} onChange={e => setNewReminder({...newReminder, message: e.target.value})}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.85rem' }}
                      />
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="submit" className="btn" style={{ flex: 1, padding: '0.5rem', background: '#25D366', color: 'white', fontSize: '0.85rem' }}>Salvar</button>
                      <button type="button" className="btn" onClick={() => setShowAddReminder(false)} style={{ flex: 1, padding: '0.5rem', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '0.85rem' }}>Cancelar</button>
                    </div>
                  </form>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {myReminders.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>Você ainda não criou nenhum horário personalizado. O app também enviará os lembretes gerais configurados pelo seu treinador.</p>
                  ) : (
                    myReminders.map(rem => (
                      <div key={rem.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', opacity: rem.active ? 1 : 0.5 }}>
                        <div>
                          <h5 style={{ margin: '0 0 0.3rem 0', color: 'white', fontSize: '0.9rem' }}>{rem.title}</h5>
                          <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CalendarDays size={12}/> {rem.day_of_week}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12}/> {rem.time}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input 
                              type="checkbox" checked={rem.active} onChange={() => toggleReminderActive(rem.id, rem.active)}
                              style={{ width: '16px', height: '16px', accentColor: '#25D366' }}
                            />
                          </label>
                          <button onClick={() => handleDeleteReminder(rem.id)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', padding: '0.2rem' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
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
