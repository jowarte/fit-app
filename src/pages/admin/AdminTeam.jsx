import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ShieldAlert, User, Search, Save } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

export function AdminTeam() {
  const { isSuperAdmin } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  }

  async function updateRole(userId, newRole) {
    setSaving(userId);
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      if (error) throw error;
      
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar permissão.');
    } finally {
      setSaving(null);
    }
  }

  if (!isSuperAdmin) {
    return (
      <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#ff4444' }}>
        <ShieldAlert size={48} style={{ margin: '0 auto 1rem auto' }} />
        <h2>Acesso Negado</h2>
        <p>Apenas Super Administradores podem visualizar e gerenciar a equipe.</p>
      </div>
    );
  }

  const filteredUsers = users.filter(u => 
    (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <ShieldAlert size={32} color="#ffc107" />
        <h1 style={{ margin: 0 }}>Gerenciamento de Equipe e Permissões</h1>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Como Super Admin, você pode promover usuários a administradores ou revogar seus acessos. Tenha cuidado ao promover novos Super Administradores.
        </p>
        
        <div style={{ position: 'relative' }}>
          <Search size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Buscar usuário por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', padding: '1rem 1rem 1rem 3rem', 
              borderRadius: '8px', background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)', color: 'white',
              fontSize: '1rem'
            }}
          />
        </div>
      </div>

      <div className="glass-card" style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Carregando usuários...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Usuário</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Email</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Nível de Acesso</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Nenhum usuário encontrado.</td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={16} />
                      </div>
                      <span style={{ fontWeight: '500', color: 'white' }}>{user.name || 'Sem nome'}</span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{user.email}</td>
                    <td style={{ padding: '1rem' }}>
                      <select
                        value={user.role || 'user'}
                        onChange={(e) => updateRole(user.id, e.target.value)}
                        disabled={saving === user.id}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '8px',
                          background: user.role === 'super_admin' ? '#ffc107' : user.role === 'admin' ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                          color: user.role === 'super_admin' || user.role === 'admin' ? 'black' : 'white',
                          border: 'none',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="user">Usuário Comum</option>
                        <option value="admin">Administrador</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {saving === user.id ? (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Salvando...</span>
                      ) : (
                        <span style={{ color: '#00ff88', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                           <Save size={14} /> Salvo
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
