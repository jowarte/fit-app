import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Lock, LogIn, UserPlus, User, LogOut, ArrowRight } from 'lucide-react';
import { DEFAULT_PLANS } from '../lib/permissions';

export function AuthPage({ session: propSession }) {
  const navigate = useNavigate();
  const [session, setSession] = useState(propSession || null);
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [appName, setAppName] = useState('TreinoApp');
  const [appLogoUrl, setAppLogoUrl] = useState('');

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const planId = searchParams.get('plan');

  useEffect(() => {
    try {
      const local = localStorage.getItem('app_settings_local');
      if (local) {
        const p = JSON.parse(local);
        if (p.app_name) setAppName(p.app_name);
        if (p.app_logo_url) setAppLogoUrl(p.app_logo_url);
        if (p.primary_color) document.documentElement.style.setProperty('--primary-color', p.primary_color);
      }
    } catch(e) {}
    supabase.from('app_settings').select('app_name, app_logo_url, primary_color').eq('id', 1).single().then(({ data }) => {
      if (data) {
        if (data.app_name) setAppName(data.app_name);
        if (data.app_logo_url) setAppLogoUrl(data.app_logo_url);
        if (data.primary_color) document.documentElement.style.setProperty('--primary-color', data.primary_color);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!session) {
      supabase.auth.getSession().then(({ data }) => {
        if (data?.session) setSession(data.session);
      });
    }
  }, []);

  React.useEffect(() => {
    if (planId) {
      setIsLogin(false);
    }
  }, [planId]);

  function getFriendlyErrorMessage(err) {
    const msg = err?.message || String(err || '');
    if (msg.includes('Failed to fetch')) {
      return 'Não foi possível conectar ao servidor. O projeto no Supabase pode estar pausado por inatividade ou sem conexão.';
    }
    if (msg.includes('Invalid login credentials')) {
      return 'E-mail ou senha incorretos.';
    }
    if (msg.includes('User already registered')) {
      return 'Este e-mail já está cadastrado no sistema.';
    }
    if (msg.includes('Email rate limit exceeded')) {
      return 'Limite de envios atingido. Aguarde alguns minutos para tentar novamente.';
    }
    return msg;
  }

  async function handleAuth(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (isForgotPassword) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (error) {
        setError(getFriendlyErrorMessage(error));
      } else {
        setMessage('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
        setIsForgotPassword(false);
      }
    } else if (isLogin) {
      // Se já houver sessão anterior, limpa antes de autenticar a nova conta
      await supabase.auth.signOut();
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(getFriendlyErrorMessage(error));
      } else {
        try {
          if (authData?.user?.id) {
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', authData.user.id).single();
            if (profile && (profile.role === 'admin' || profile.role === 'super_admin')) {
              navigate('/admin');
              return;
            }
          }
        } catch (roleErr) {
          console.error('Erro ao verificar permissão do perfil:', roleErr);
        }
        navigate('/');
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            phone: phone,
            name: name
          }
        }
      });
      if (error) {
        setError(getFriendlyErrorMessage(error));
      } else {
        // Atualiza a tabela profiles com o celular e o nome
        if (data?.user?.id) {
          let updateData = { 
            phone: phone,
            name: name
          };

          // Auto-promoção para novas instalações: primeiro usuário ou e-mail com "admin@" vira Super Admin
          try {
            const { data: existingSuperAdmins } = await supabase.from('profiles').select('id').eq('role', 'super_admin');
            if (!existingSuperAdmins || existingSuperAdmins.length === 0 || email.toLowerCase().startsWith('admin@')) {
              updateData.role = 'super_admin';
            }
          } catch (e) {
            console.error('Verificação de primeiro admin:', e);
          }

          if (planId) {
            let plans = DEFAULT_PLANS;
            try {
              const saved = localStorage.getItem('admin_plans');
              if (saved) plans = JSON.parse(saved);
            } catch(e) {}

            let plan = plans.find(p => p.id === planId);
            if (!plan) {
              try {
                const { data: dbPlans } = await supabase.from('plans').select('*');
                if (dbPlans && dbPlans.length > 0) {
                  plan = dbPlans.find(p => p.id === planId);
                }
              } catch (_) {}
            }

            if (plan) {
              updateData.plan_id = plan.id;
              if (plan.isTrial || plan.is_trial) {
                updateData.status = 'trial';
                const days = plan.trialDays || plan.trial_days || 7;
                const endsAt = new Date();
                endsAt.setDate(endsAt.getDate() + days);
                updateData.trial_ends_at = endsAt.toISOString();
              }
            }
          }

          await supabase.from('profiles').update(updateData).eq('id', data.user.id);

          // Avisa o n8n e Bot Vende sobre o novo cadastro
          try {
            const { data: settings } = await supabase.from('app_settings').select('n8n_webhook_url, bot_vende_webhook_url').eq('id', 1).single();
            if (settings) {
              const payload = {
                event: 'user_registered', 
                email: email, 
                phone: phone,
                name: name
              };

              const dispatchWebhook = async (url) => {
                if (!url) return;
                try {
                  const { error } = await supabase.functions.invoke('send-webhook', { body: { url, payload } });
                  if (error) throw error;
                } catch (_) {
                  // Fallback direto via browser fetch caso a edge function não esteja ativa
                  try {
                    await fetch(url, {
                      method: 'POST',
                      mode: 'no-cors',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload)
                    });
                  } catch (e) {
                    console.warn('Erro ao disparar webhook direto:', e);
                  }
                }
              };

              if (settings.n8n_webhook_url) {
                dispatchWebhook(settings.n8n_webhook_url);
              }
              if (settings.bot_vende_webhook_url) {
                dispatchWebhook(settings.bot_vende_webhook_url);
              }
            }
          } catch(err) {
            console.error("Erro ao buscar config de webhooks", err);
          }
        }
        setMessage('Cadastro realizado com sucesso! Verifique sua caixa de entrada e confirme seu e-mail antes de fazer login.');
        setIsLogin(true);
      }
    }
    setLoading(false);
  }

  return (
    <div className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '2rem 1rem' }}>
      
      {/* Logotipo / Nome do App */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {appLogoUrl ? (
          <img src={appLogoUrl} alt={appName} style={{ maxHeight: '48px', maxWidth: '160px', objectFit: 'contain', marginBottom: '0.4rem' }} onError={(e) => { e.target.style.display = 'none'; }} />
        ) : null}
        <h1 style={{ fontSize: '1.6rem', margin: 0, color: 'white', fontWeight: 'bold' }}>{appName}</h1>
      </div>

      <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-color)' }}>
            {isForgotPassword ? 'Recuperar Senha' : isLogin ? 'Bem-vindo de volta' : 'Criar Conta'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            {isForgotPassword ? 'Enviaremos um link para redefinir sua senha' : isLogin ? 'Faça login para acessar seus treinos' : 'Cadastre-se para começar'}
          </p>
        </div>

        {session?.user && (
          <div style={{ background: 'rgba(0, 210, 255, 0.08)', border: '1px solid rgba(0, 210, 255, 0.25)', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', textAlign: 'left' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Você já está conectado como:
            </p>
            <p style={{ margin: '0 0 0.75rem 0', fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '0.95rem', wordBreak: 'break-all' }}>
              {session.user.email}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
              >
                <span>Acessar App</span>
                <ArrowRight size={14} />
              </button>
              <button
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut();
                  setSession(null);
                }}
                className="btn"
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.08)', color: '#ff6b6b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <LogOut size={14} />
                <span>Desconectar</span>
              </button>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '0.75rem', paddingTop: '0.5rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ou entre com outra conta abaixo:</span>
            </div>
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(255, 68, 68, 0.1)', border: '1px solid #ff4444', color: '#ff4444', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ background: 'rgba(0, 200, 83, 0.1)', border: '1px solid #00c853', color: '#00c853', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLogin && !isForgotPassword && (
            <div style={{ position: 'relative' }}>
              <User size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Nome Completo"
                required={!isLogin && !isForgotPassword}
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <Mail size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="email"
              placeholder="Seu e-mail"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
            />
          </div>

          {!isForgotPassword && (
            <div style={{ position: 'relative' }}>
              <Lock size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                placeholder="Sua senha"
                required={!isForgotPassword}
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              />
            </div>
          )}

          {!isLogin && !isForgotPassword && (
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </div>
              <input
                type="tel"
                placeholder="Seu WhatsApp (ex: 11999999999)"
                required={!isLogin && !isForgotPassword}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
            {loading ? 'Aguarde...' : isForgotPassword ? <><Mail size={18} /> Enviar Link</> : isLogin ? <><LogIn size={18} /> Entrar</> : <><UserPlus size={18} /> Cadastrar</>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {!isForgotPassword && isLogin && (
            <button 
              type="button" 
              onClick={() => setIsForgotPassword(true)} 
              style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              Esqueceu a senha?
            </button>
          )}
          
          <button 
            type="button" 
            onClick={() => { setIsLogin(!isLogin); setIsForgotPassword(false); }} 
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            {isForgotPassword ? 'Voltar para o Login' : isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
          </button>
        </div>
      </div>
    </div>
  );
}
