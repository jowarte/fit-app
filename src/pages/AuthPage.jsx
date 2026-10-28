import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Lock, LogIn, UserPlus, User } from 'lucide-react';
import { DEFAULT_PLANS } from '../lib/permissions';

export function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const planId = searchParams.get('plan');

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
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(getFriendlyErrorMessage(error));
      } else {
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

          if (planId) {
            let plans = DEFAULT_PLANS;
            try {
              const saved = localStorage.getItem('admin_plans');
              if (saved) plans = JSON.parse(saved);
            } catch(e) {}
            
            const plan = plans.find(p => p.id === planId);
            if (plan) {
              updateData.plan_id = plan.id;
              if (plan.isTrial) {
                updateData.status = 'trial';
                const endsAt = new Date();
                endsAt.setDate(endsAt.getDate() + (plan.trialDays || 7));
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

              // Envia para o n8n
              if (settings.n8n_webhook_url) {
                supabase.functions.invoke('send-webhook', {
                  body: { url: settings.n8n_webhook_url, payload }
                }).catch(console.error);
              }

              // Envia para o Bot Vende (Noé)
              if (settings.bot_vende_webhook_url) {
                supabase.functions.invoke('send-webhook', {
                  body: { url: settings.bot_vende_webhook_url, payload }
                }).catch(console.error);
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
    <div className="container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-color)' }}>
            {isForgotPassword ? 'Recuperar Senha' : isLogin ? 'Bem-vindo de volta' : 'Criar Conta'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            {isForgotPassword ? 'Enviaremos um link para redefinir sua senha' : isLogin ? 'Faça login para acessar seus treinos' : 'Cadastre-se para começar'}
          </p>
        </div>

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
