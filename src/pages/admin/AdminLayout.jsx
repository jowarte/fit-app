import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, Users, Settings, MessageCircle, CreditCard, ShoppingCart, Bell } from 'lucide-react';

export function AdminLayout() {
  const location = useLocation();
  const path = location.pathname;

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
        <div style={{ padding: '0 1rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--primary-color)' }}>Admin Panel</h2>
        </div>

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

        <Link 
          to="/admin/whatsapp"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            textDecoration: 'none',
            color: path === '/admin/whatsapp' ? 'var(--bg-color)' : 'var(--text-color)',
            background: path === '/admin/whatsapp' ? '#25D366' : 'transparent', // WhatsApp Green
            transition: 'all 0.2s'
          }}
        >
          <MessageCircle size={20} />
          <span style={{ color: path === '/admin/whatsapp' ? 'white' : 'var(--text-color)' }}>Lembretes WhatsApp</span>
        </Link>
        
        <Link 
          to="/"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            textDecoration: 'none',
            color: 'var(--text-secondary)',
            marginTop: 'auto',
            transition: 'all 0.2s'
          }}
        >
          <span>Sair do Admin</span>
        </Link>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
