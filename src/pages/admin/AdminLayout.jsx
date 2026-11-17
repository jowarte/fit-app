import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, Users, Settings, MessageCircle, CreditCard, ShoppingCart, Bell, Lock, ShieldAlert, Home, Megaphone, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function AdminLayout() {
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkUser();
  }, [location.pathname]);

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsAuthenticated(false);
        setHasSession(false);
        setLoading(false);
        return;
      }
      
      setHasSession(true);
      const { data: profile, error } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      
      if (profile && (profile.role === 'admin' || profile.role === 'super_admin')) {
        setIsAuthenticated(true);
        setUserRole(profile.role);
        setError('');
      } else {
        setIsAuthenticated(false);
        setError('Sua conta logada não possui privilégios de administrador.');
      }
    } catch (err) {
      console.error(err);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setHasSession(false);
    setUserRole(null);
    navigate('/login');
  };

  if (loading) {
    return <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)', alignItems: 'center', justifyContent: 'center' }}>Carregando...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', maxWidth: '420px', textAlign: 'center' }}>
          <Lock size={48} color="var(--primary-color)" style={{ margin: '0 auto 0.5rem auto' }} />
          <h2 style={{ margin: 0, fontSize: '1.6rem' }}>Acesso Restrito</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
            {hasSession 
              ? 'Você está conectado com uma conta de aluno/usuário sem acesso administrativo.' 
              : 'Faça login com uma conta de administrador para acessar o painel.'}
          </p>
          
          {error && (
            <div style={{ background: 'rgba(255,68,68,0.12)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff4444', padding: '0.85rem', borderRadius: '8px', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          {hasSession ? (
            <>
              <button 
                onClick={handleLogout} 
                className="btn btn-primary" 
                style={{ padding: '0.9rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <LogOut size={18} />
                Sair e Fazer Login como Admin
              </button>

              <button 
                onClick={() => navigate('/')} 
                className="btn" 
                style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.06)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Home size={18} />
                Voltar para a Área do Aluno
              </button>
            </>
          ) : (
            <button 
              onClick={() => navigate('/login')} 
              className="btn btn-primary" 
              style={{ padding: '0.9rem', fontSize: '1rem' }}
            >
              Ir para a página de Login
            </button>
          )}
        </div>
      </div>
    );
  }

  const isSuperAdmin = userRole === 'super_admin';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-color)' }}>
      {/* Sidebar for Admin */}
      <aside style={{
        width: '250px',
        background: 'rgba(255,255,255,0.05)',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ padding: '0 1rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--primary-color)', margin: 0 }}>Admin Panel</h2>
          <span style={{ fontSize: '0.8rem', background: isSuperAdmin ? '#ffc107' : 'rgba(255,255,255,0.1)', color: isSuperAdmin ? 'black' : 'white', padding: '0.2rem 0.6rem', borderRadius: '12px', width: 'fit-content', fontWeight: 'bold' }}>
            {isSuperAdmin ? 'SUPER ADMIN' : 'ADMIN'}
          </span>
        </div>

        <Link 
          to="/"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
            padding: '1rem',
            borderRadius: '8px',
            textDecoration: 'none',
            color: '#1a1a1a',
            background: 'var(--primary-color)',
            fontWeight: 'bold',
            marginBottom: '1rem',
            boxShadow: '0 4px 15px rgba(0, 210, 255, 0.3)',
            transition: 'all 0.2s',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          <Home size={20} />
          <span>Voltar ao App</span>
        </Link>

        <Link 
          to="/admin"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            textDecoration: 'none',
            color: path === '/admin' ? 'var(--bg-color)' : 'var(--text-color)',
            background: path === '/admin' ? 'var(--primary-color)' : 'transparent',
            transition: 'all 0.2s'
          }}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>

        <Link 
          to="/admin/exercises"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            textDecoration: 'none',
            color: path === '/admin/exercises' ? 'var(--bg-color)' : 'var(--text-color)',
            background: path === '/admin/exercises' ? 'var(--primary-color)' : 'transparent',
            transition: 'all 0.2s'
          }}
        >
          <Dumbbell size={20} />
          <span>Exercícios</span>
        </Link>

        <Link 
          to="/admin/clients"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            textDecoration: 'none',
            color: path === '/admin/clients' ? 'var(--bg-color)' : 'var(--text-color)',
            background: path === '/admin/clients' ? 'var(--primary-color)' : 'transparent',
            transition: 'all 0.2s'
          }}
        >
          <Users size={20} />
          <span>Clientes</span>
        </Link>
        
        <Link 
          to="/admin/plans"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            textDecoration: 'none',
            color: path === '/admin/plans' ? 'var(--bg-color)' : 'var(--text-color)',
            background: path === '/admin/plans' ? 'var(--primary-color)' : 'transparent',
            transition: 'all 0.2s'
          }}
        >
          <CreditCard size={20} />
          <span>Planos</span>
        </Link>
        
        {/* Funcionalidades de Vendas e Configurações Ocultadas para Admin Comum */}
        {isSuperAdmin && (
          <>
            <Link 
              to="/admin/sales"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                textDecoration: 'none',
                color: path === '/admin/sales' ? 'var(--bg-color)' : 'var(--text-color)',
                background: path === '/admin/sales' ? '#ff4444' : 'transparent',
                transition: 'all 0.2s'
              }}
            >
              <ShoppingCart size={20} />
              <span style={{ color: path === '/admin/sales' ? 'white' : 'var(--text-color)' }}>Página de Vendas</span>
            </Link>
            
            <Link 
              to="/admin/settings"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                textDecoration: 'none',
                color: path === '/admin/settings' ? 'var(--bg-color)' : 'var(--text-color)',
                background: path === '/admin/settings' ? 'var(--primary-color)' : 'transparent',
                transition: 'all 0.2s'
              }}
            >
              <Settings size={20} />
              <span>Configurações</span>
            </Link>

            <Link 
              to="/admin/team"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                textDecoration: 'none',
                color: path === '/admin/team' ? 'var(--bg-color)' : 'var(--text-color)',
                background: path === '/admin/team' ? '#ffc107' : 'transparent',
                transition: 'all 0.2s'
              }}
            >
              <ShieldAlert size={20} />
              <span style={{ color: path === '/admin/team' ? 'black' : 'var(--text-color)' }}>Gerenciar Equipe</span>
            </Link>
          </>
        )}
        
        <Link 
          to="/admin/announcements"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            textDecoration: 'none',
            color: path === '/admin/announcements' ? 'var(--bg-color)' : 'var(--text-color)',
            background: path === '/admin/announcements' ? 'var(--primary-color)' : 'transparent',
            transition: 'all 0.2s'
          }}
        >
          <Megaphone size={20} />
          <span>Anúncios & E-books</span>
        </Link>

        <Link 
          to="/admin/notifications"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            textDecoration: 'none',
            color: path === '/admin/notifications' ? 'var(--bg-color)' : 'var(--text-color)',
            background: path === '/admin/notifications' ? 'var(--primary-color)' : 'transparent',
            transition: 'all 0.2s'
          }}
        >
          <Bell size={20} />
          <span>Sininho Push</span>
        </Link>
        
        <button 
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            color: '#ff4444',
            marginTop: 'auto',
            cursor: 'pointer',
            transition: 'all 0.2s',
            textAlign: 'left'
          }}
        >
          Sair da Conta Admin
        </button>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <Outlet context={{ isSuperAdmin }} />
      </main>
    </div>
  );
}
