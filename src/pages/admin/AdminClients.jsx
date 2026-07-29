import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Trash2, Edit2, ShieldAlert, Check, X, ShieldCheck, UserX, Clock, CreditCard } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { DEFAULT_PLANS } from '../../lib/permissions';

export function AdminClients() {
  const [clients, setClients] = useState([]);
  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    status: 'active',
    plan_id: '',
    trial_days: 7,
    access_home_override: null, // null = inherit, true = allowed, false = blocked
    access_gym_override: null,
    access_create_override: null,
    access_whatsapp_override: null
  });

  // Load plans and clients
  useEffect(() => {
    // Load plans from localStorage if present
    const savedPlans = localStorage.getItem('admin_plans');
    if (savedPlans) {
      try {
        setPlans(JSON.parse(savedPlans));
      } catch (e) {
        console.error(e);
      }
    }

    fetchClients();
  }, []);

  async function fetchClients() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
      alert('Erro ao carregar clientes do banco de dados.');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAdd = () => {
    setSelectedClient(null);
    setFormData({
      id: '',
      name: '',
      email: '',
      phone: '',
      status: 'active',
      plan_id: '',
      trial_days: 7,
      access_home_override: null,
      access_gym_override: null,
      access_create_override: null,
      access_whatsapp_override: null
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client) => {
    setSelectedClient(client);
    
    // Calcular dias restantes de teste se for trial
    let tDays = 7;
    if (client.status === 'trial' && client.trial_ends_at) {
      const diff = new Date(client.trial_ends_at) - new Date();
      tDays = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    setFormData({
      id: client.id,
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      status: client.status || 'active',
      plan_id: client.plan_id || '',
      trial_days: tDays,
      access_home_override: client.access_home_override,
      access_gym_override: client.access_gym_override,
      access_create_override: client.access_create_override,
      access_whatsapp_override: client.access_whatsapp_override
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, email) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente "${email}"? Isso removerá o perfil do banco.`)) {
      try {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', id);

        if (error) throw error;
        setClients(clients.filter(c => c.id !== id));
        alert('Cliente excluído com sucesso!');
      } catch (err) {
        console.error(err);
        alert('Erro ao excluir cliente.');
      }
    }
  };

  // Helper helper to generate UUID if not supported natively
  const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.email) return alert('Por favor, informe o e-mail do cliente.');

    setLoading(true);

    // Calcular data de expiração se for Teste
    let trialEnds = null;
    if (formData.status === 'trial') {
      const date = new Date();
      date.setDate(date.getDate() + parseInt(formData.trial_days || 7));
      trialEnds = date.toISOString();
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      status: formData.status,
      plan_id: formData.plan_id || null,
      trial_ends_at: trialEnds,
      access_home_override: formData.access_home_override,
      access_gym_override: formData.access_gym_override,
      access_create_override: formData.access_create_override,
      access_whatsapp_override: formData.access_whatsapp_override
    };

    try {
      if (selectedClient) {
        // Atualizar
        const { error } = await supabase
          .from('profiles')
          .update(payload)
          .eq('id', selectedClient.id);

        if (error) throw error;
        alert('Cliente atualizado com sucesso!');
      } else {
        // Inserir novo
        const newId = generateUUID();
        const { error } = await supabase
          .from('profiles')
          .insert([{ ...payload, id: newId }]);

        if (error) throw error;
        alert('Cliente inserido com sucesso! O cadastro será vinculado quando ele se registrar com este e-mail.');
      }
      setIsModalOpen(false);
      fetchClients();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar cliente: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar clientes
  const filteredClients = clients.filter(client => {
    const term = searchTerm.toLowerCase();
    const nameMatch = (client.name || '').toLowerCase().includes(term);
    const emailMatch = (client.email || '').toLowerCase().includes(term);
    const phoneMatch = (client.phone || '').toLowerCase().includes(term);
    const matchesSearch = nameMatch || emailMatch || phoneMatch;

    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    
    let matchesPlan = true;
    if (planFilter !== 'all') {
      if (planFilter === 'none') {
        matchesPlan = !client.plan_id;
      } else {
        matchesPlan = client.plan_id === planFilter;
      }
    }

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const getStatusBadge = (status, trialEnds) => {
    switch (status) {
      case 'blocked':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.8rem', fontWeight: 'bold' }}>
            <UserX size={14} /> Bloqueado
          </span>
        );
      case 'trial':
        const isExpired = trialEnds && new Date() > new Date(trialEnds);
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', borderRadius: '4px', background: isExpired ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 176, 32, 0.1)', color: isExpired ? '#ef4444' : '#ffb020', fontSize: '0.8rem', fontWeight: 'bold' }}>
            <Clock size={14} /> {isExpired ? 'Teste Expirado' : 'Em Teste'}
          </span>
        );
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.8rem', fontWeight: 'bold' }}>
            <ShieldCheck size={14} /> Ativo
          </span>
        );
    }
  };

  return (
    <div className="animate-fade-in" style={{ color: 'white' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(0, 242, 254, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
            <Users size={28} color="var(--primary-color)" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Gestão de Clientes</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Gerencie acessos, planos, bloqueios e períodos de teste dos usuários.</p>
          </div>
        </div>
        
        <button className="btn btn-primary" onClick={handleOpenAdd} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Adicionar Cliente
        </button>
      </div>

      {/* Busca e Filtros */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative', display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0 0.75rem' }}>
          <Search size={18} color="var(--text-secondary)" style={{ marginRight: '0.5rem' }} />
          <input 
            type="text" 
            placeholder="Buscar por nome, e-mail ou WhatsApp..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ flex: 1, padding: '0.75rem 0', background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.9rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div>
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem' }}
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativos</option>
              <option value="trial">Em Teste</option>
              <option value="blocked">Bloqueados</option>
            </select>
          </div>

          <div>
            <select 
              value={planFilter}
              onChange={e => setPlanFilter(e.target.value)}
              style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem' }}
            >
              <option value="all">Todos os Planos</option>
              <option value="none">Sem Plano</option>
              {plans.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Clientes */}
      <div className="glass-card" style={{ padding: 0, overflowX: 'auto', borderRadius: '12px' }}>
        {loading && clients.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Carregando dados...</div>
        ) : filteredClients.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Nenhum cliente encontrado.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <th style={{ padding: '1rem var(--spacing-lg)' }}>Cliente</th>
                <th style={{ padding: '1rem var(--spacing-lg)' }}>WhatsApp</th>
                <th style={{ padding: '1rem var(--spacing-lg)' }}>Status</th>
                <th style={{ padding: '1rem var(--spacing-lg)' }}>Plano</th>
                <th style={{ padding: '1rem var(--spacing-lg)' }}>Cadastro</th>
                <th style={{ padding: '1rem var(--spacing-lg)', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => {
                const planObj = plans.find(p => p.id === client.plan_id);
                return (
                  <tr key={client.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '1rem var(--spacing-lg)' }}>
                      <div style={{ fontWeight: 'bold' }}>{client.name || 'Sem Nome'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{client.email}</div>
                    </td>
                    <td style={{ padding: '1rem var(--spacing-lg)', color: 'var(--text-secondary)' }}>
                      {client.phone || '-'}
                    </td>
                    <td style={{ padding: '1rem var(--spacing-lg)' }}>
                      {getStatusBadge(client.status, client.trial_ends_at)}
                      {client.status === 'trial' && client.trial_ends_at && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          Até: {new Date(client.trial_ends_at).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem var(--spacing-lg)' }}>
                      <span style={{ fontWeight: '500' }}>
                        {planObj ? planObj.name : client.is_premium ? 'Premium (Legado)' : 'Nenhum / Grátis'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem var(--spacing-lg)', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      {client.created_at ? new Date(client.created_at).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td style={{ padding: '1rem var(--spacing-lg)', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handleOpenEdit(client)}
                          style={{ background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '4px', color: 'var(--primary-color)', display: 'flex', alignItems: 'center' }}
                          title="Editar permissões e plano"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(client.id, client.email)}
                          style={{ background: 'rgba(239, 68, 68, 0.05)', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '4px', color: '#ef4444', display: 'flex', alignItems: 'center' }}
                          title="Excluir cliente"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', zIndex: 1100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1.5rem', overflowY: 'auto'
        }}>
          <div className="glass-card" style={{
            width: '100%', maxWidth: '550px', background: 'var(--bg-dark)',
            border: '1px solid rgba(255,255,255,0.1)', padding: '2rem',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={20} color="var(--primary-color)" /> {selectedClient ? 'Editar Cliente' : 'Adicionar Novo Cliente'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Seção 1: Dados Básicos */}
              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.3rem', marginBottom: '0.8rem' }}>1. Dados do Cliente</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Nome Completo</label>
                    <input 
                      type="text" 
                      placeholder="Ex: João Silva" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '6px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>E-mail (Login)</label>
                      <input 
                        type="email" 
                        placeholder="Ex: joao@email.com" 
                        required
                        disabled={!!selectedClient} // Não muda email de conta já criada para evitar quebra de auth
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '6px', background: formData.id ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: formData.id ? 'var(--text-secondary)' : 'white', fontSize: '0.9rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>WhatsApp (DDD + Número)</label>
                      <input 
                        type="tel" 
                        placeholder="Ex: 11999999999" 
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '6px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção 2: Status & Plano */}
              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.3rem', marginBottom: '0.8rem' }}>2. Status & Plano</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Status da Conta</label>
                    <select 
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                      style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '6px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem' }}
                    >
                      <option value="active">Ativo (Normal)</option>
                      <option value="trial">Em Teste (Trial)</option>
                      <option value="blocked">Bloqueado (Sem Acesso)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Plano Habilitado</label>
                    <select 
                      value={formData.plan_id}
                      onChange={e => {
                        const planId = e.target.value;
                        const planObj = plans.find(p => p.id === planId);
                        if (planObj && planObj.isTrial) {
                          setFormData({
                            ...formData,
                            plan_id: planId,
                            status: 'trial',
                            trial_days: parseInt(planObj.trialDays) || 7
                          });
                        } else {
                          setFormData({
                            ...formData,
                            plan_id: planId
                          });
                        }
                      }}
                      style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '6px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem' }}
                    >
                      <option value="">Nenhum / Gratuito</option>
                      {plans.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {formData.status === 'trial' && (
                  <div className="animate-fade-in" style={{ marginTop: '0.8rem', padding: '0.8rem', borderRadius: '6px', background: 'rgba(255, 176, 32, 0.05)', border: '1px solid rgba(255, 176, 32, 0.2)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#ffb020', marginBottom: '0.2rem' }}>Duração do Teste (Dias)</label>
                      <input 
                        type="number" 
                        min="1" 
                        value={formData.trial_days}
                        onChange={e => setFormData({...formData, trial_days: e.target.value})}
                        style={{ width: '80px', padding: '0.4rem', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255, 176, 32, 0.3)', color: 'white', textAlign: 'center', fontSize: '0.85rem' }}
                      />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      O acesso expira automaticamente após este período.
                    </span>
                  </div>
                )}
              </div>

              {/* Seção 3: Liberação Manual de Funções (Overrides) */}
              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.3rem', marginBottom: '0.8rem' }}>3. Liberação / Bloqueio Manual de Funções</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Permite sobrescrever as permissões do plano para este cliente específico.</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { label: 'Treinos em Casa', key: 'access_home_override' },
                    { label: 'Treinos na Academia', key: 'access_gym_override' },
                    { label: 'Criar Treinos Personalizados', key: 'access_create_override' },
                    { label: 'Lembretes WhatsApp', key: 'access_whatsapp_override' }
                  ].map(item => (
                    <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.8rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{item.label}</span>
                      
                      <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(0,0,0,0.2)', padding: '0.2rem', borderRadius: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, [item.key]: null})}
                          style={{
                            padding: '0.3rem 0.6rem', border: 'none', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer',
                            background: formData[item.key] === null ? 'rgba(255,255,255,0.1)' : 'transparent',
                            color: formData[item.key] === null ? 'white' : 'var(--text-secondary)'
                          }}
                        >
                          Herdar Plano
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, [item.key]: true})}
                          style={{
                            padding: '0.3rem 0.6rem', border: 'none', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer',
                            background: formData[item.key] === true ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                            color: formData[item.key] === true ? '#10b981' : 'var(--text-secondary)'
                          }}
                        >
                          Liberar
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, [item.key]: false})}
                          style={{
                            padding: '0.3rem 0.6rem', border: 'none', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer',
                            background: formData[item.key] === false ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                            color: formData[item.key] === false ? '#ef4444' : 'var(--text-secondary)'
                          }}
                        >
                          Bloquear
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botões */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="btn" 
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'white', flex: 1 }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 1 }}
                >
                  Salvar Cliente
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
      
    </div>
  );
}
