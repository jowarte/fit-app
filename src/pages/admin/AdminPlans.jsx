import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Trash2, Edit2, CheckCircle2, Star, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function AdminPlans() {
  const [plans, setPlans] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    price: '',
    cycle: 'Mensal',
    checkoutUrl: '',
    isVisible: true,
    isRecommended: false,
    isTrial: false,
    trialDays: 7,
    features: [],
    accessHome: true,
    accessCreate: false,
    accessWhatsapp: false,
    accessAdvanced: false,
    webhook_product_id: ''
  });

  const [newFeature, setNewFeature] = useState('');
  const [loading, setLoading] = useState(true);

  // Carregar planos do Supabase ao montar
  useEffect(() => {
    async function loadPlans() {
      setLoading(true);
      const { data, error } = await supabase.from('plans').select('*');
      if (error) {
        console.error('Erro ao carregar planos:', error);
      } else if (data && data.length > 0) {
        // Mapeia do banco (snake_case) para a interface (camelCase)
        const mappedPlans = data.map(plan => ({
          ...plan,
          checkoutUrl: plan.checkout_url,
          isVisible: plan.is_visible,
          isRecommended: plan.is_recommended,
          isTrial: plan.is_trial,
          trialDays: plan.trial_days,
          accessHome: plan.access_home,
          accessGym: plan.access_gym,
          accessCreate: plan.access_create,
          accessWhatsapp: plan.access_whatsapp,
          accessAdvanced: plan.access_advanced,
        }));
        setPlans(mappedPlans);
      } else {
        // Fallback para planos padrão se a tabela estiver vazia
        const defaultPlans = [
          {
            id: '1', name: 'Free (Iniciante)', price: '0,00', cycle: 'Mensal', isRecommended: false, isVisible: true,
            accessHome: true, accessGym: false, accessCreate: false, accessWhatsapp: false, accessAdvanced: false, webhook_product_id: '',
            features: ['Acesso ao Treino em Casa', 'Diário de Treino Básico']
          },
          {
            id: '2', name: 'PRO (Recomendado)', price: '29,90', cycle: 'Mensal', isRecommended: true, isVisible: true,
            accessHome: true, accessGym: true, accessCreate: true, accessWhatsapp: true, accessAdvanced: true, webhook_product_id: '',
            features: ['Acesso Total (Casa e Academia)', 'Criação ilimitada de treinos', 'Lembretes automáticos via WhatsApp', 'Gráficos de Evolução', 'Acesso ao Treino Avançado']
          }
        ];
        setPlans(defaultPlans);
      }
      setLoading(false);
    }
    loadPlans();
  }, []);

  const handleNew = () => {
    setFormData({
      id: null, name: '', price: '', cycle: 'Mensal', checkoutUrl: '', isRecommended: false, isVisible: true,
      isTrial: false, trialDays: 7, webhook_product_id: '',
      features: [], accessHome: true, accessGym: false, accessCreate: false, accessWhatsapp: false, accessAdvanced: false
    });
    setNewFeature('');
    setIsEditing(true);
  };

  const handleEdit = (plan) => {
    // Garantir que todos os campos existam para evitar undefined
    setFormData({
      ...plan,
      webhook_product_id: plan.webhook_product_id || '',
      features: plan.features || []
    });
    setNewFeature('');
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este plano?')) {
      const { error } = await supabase.from('plans').delete().eq('id', id);
      if (error) {
        alert('Erro ao excluir: ' + error.message);
      } else {
        setPlans(plans.filter(p => p.id !== id));
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) return alert('Dê um nome ao plano!');
    
    const finalData = { ...formData };
    
    // Validate trial days
    if (finalData.isTrial) {
      if (finalData.trialDays === 'custom' || !finalData.trialDays || isNaN(finalData.trialDays)) {
        finalData.trialDays = 7;
      } else {
        finalData.trialDays = parseInt(finalData.trialDays);
      }
    }
    
    // Auto-fill features if empty
    if (finalData.features.length === 0) {
      const autoFeat = [];
      if (finalData.accessHome) autoFeat.push('Acesso ao Treino em Casa');
      if (finalData.accessGym) autoFeat.push('Acesso ao Treino na Academia');
      if (finalData.accessCreate) autoFeat.push('Criar Treinos Personalizados');
      if (finalData.accessWhatsapp) autoFeat.push('Lembretes via WhatsApp');
      if (finalData.accessAdvanced) autoFeat.push('Acesso ao Treino Avançado');
      finalData.features = autoFeat;
    }

    // Convert camelCase to snake_case for DB is handled implicitly or we match column names.
    // In SQL script, columns are: id, name, price, cycle, checkout_url, is_visible, is_recommended, is_trial, trial_days, features, access_home, access_gym, access_create, access_whatsapp, access_advanced, webhook_product_id
    const dbPayload = {
      id: finalData.id || Date.now().toString(),
      name: finalData.name,
      price: finalData.price,
      cycle: finalData.cycle,
      checkout_url: finalData.checkoutUrl,
      is_visible: finalData.isVisible,
      is_recommended: finalData.isRecommended,
      is_trial: finalData.isTrial,
      trial_days: finalData.trialDays,
      features: finalData.features,
      access_home: finalData.accessHome,
      access_gym: finalData.accessGym,
      access_create: finalData.accessCreate,
      access_whatsapp: finalData.accessWhatsapp,
      access_advanced: finalData.accessAdvanced,
      webhook_product_id: finalData.webhook_product_id || null
    };

    const { data, error } = await supabase.from('plans').upsert(dbPayload).select();

    if (error) {
      alert('Erro ao salvar no banco: ' + error.message);
    } else {
      // Atualizar o estado local convertendo de volta para o formato camelCase que a UI espera
      const savedPlan = data[0];
      const uiPlan = {
        id: savedPlan.id,
        name: savedPlan.name,
        price: savedPlan.price,
        cycle: savedPlan.cycle,
        checkoutUrl: savedPlan.checkout_url,
        isVisible: savedPlan.is_visible,
        isRecommended: savedPlan.is_recommended,
        isTrial: savedPlan.is_trial,
        trialDays: savedPlan.trial_days,
        features: savedPlan.features,
        accessHome: savedPlan.access_home,
        accessGym: savedPlan.access_gym,
        accessCreate: savedPlan.access_create,
        accessWhatsapp: savedPlan.access_whatsapp,
        accessAdvanced: savedPlan.access_advanced,
        webhook_product_id: savedPlan.webhook_product_id
      };

      if (finalData.id) {
        setPlans(plans.map(p => p.id === uiPlan.id ? uiPlan : p));
      } else {
        setPlans([...plans, uiPlan]);
      }
      setIsEditing(false);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({ ...formData, features: [...formData.features, newFeature.trim()] });
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(255, 176, 32, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
            <CreditCard size={28} color="#ffb020" />
          </div>
          <h1 style={{ margin: 0 }}>Planos & Assinaturas</h1>
        </div>
        
        {!isEditing && (
          <button className="btn btn-primary" onClick={handleNew} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> Criar Plano
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="glass-card animate-scale" style={{ marginBottom: '2rem', padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>{formData.id ? 'Editar Plano' : 'Novo Plano'}</h2>
          
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Informações Básicas */}
            <div>
              <h4 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>1. Informações Básicas</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Nome do Plano</label>
                  <input type="text" placeholder="Ex: Plano PRO" required
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Preço (R$)</label>
                  <input type="text" placeholder="Ex: 29,90"
                    value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                  />
                </div>
                 <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Ciclo de Cobrança</label>
                  {formData.isTrial ? (
                    <input 
                      type="text" 
                      value="Único (Período de Teste)" 
                      readOnly 
                      style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-secondary)', outline: 'none' }}
                    />
                  ) : (
                    <select 
                      value={formData.cycle} onChange={e => setFormData({...formData, cycle: e.target.value})}
                      style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    >
                      <option>Mensal</option>
                      <option>Trimestral</option>
                      <option>Semestral</option>
                      <option>Anual</option>
                      <option>Única (Vitalício)</option>
                    </select>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '2rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.isTrial} 
                    onChange={e => {
                      const trial = e.target.checked;
                      setFormData({
                        ...formData, 
                        isTrial: trial,
                        cycle: trial ? 'Único (Teste)' : 'Mensal'
                      });
                    }} 
                    style={{ accentColor: 'var(--primary-color)', width: '18px', height: '18px' }}
                  />
                  <span>Este é um plano de <strong>Teste (Trial)</strong></span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.isRecommended} onChange={e => setFormData({...formData, isRecommended: e.target.checked})} style={{ accentColor: 'var(--primary-color)', width: '18px', height: '18px' }}/>
                  <span>Destacar como plano <strong>"Recomendado"</strong></span>
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.isVisible !== false} onChange={e => setFormData({...formData, isVisible: e.target.checked})} style={{ accentColor: 'var(--primary-color)', width: '18px', height: '18px' }}/>
                  <span>Plano visível na <strong>Página de Vendas</strong></span>
                </label>
              </div>

              {formData.isTrial && (
                <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem', background: 'rgba(255, 176, 32, 0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 176, 32, 0.1)' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Duração do Teste</label>
                    <select 
                      value={['1', '7', '14'].includes(String(formData.trialDays)) ? formData.trialDays : 'custom'} 
                      onChange={e => {
                        const val = e.target.value;
                        if (val !== 'custom') {
                          setFormData({...formData, trialDays: parseInt(val)});
                        } else {
                          setFormData({...formData, trialDays: 'custom'});
                        }
                      }}
                      style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem' }}
                    >
                      <option value="1">1 Dia</option>
                      <option value="7">7 Dias</option>
                      <option value="14">14 Dias</option>
                      <option value="custom">Outro (Digitar quantidade)</option>
                    </select>
                  </div>
                  
                  {(formData.trialDays === 'custom' || !['1', '7', '14'].includes(String(formData.trialDays))) && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Quantidade de dias de Teste</label>
                      <input 
                        type="number" 
                        min="1" 
                        placeholder="Ex: 3"
                        value={formData.trialDays === 'custom' ? '' : formData.trialDays} 
                        onChange={e => setFormData({...formData, trialDays: parseInt(e.target.value) || ''})}
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem' }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Links do Plano e Webhook */}
            <div>
              <h4 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1rem', marginTop: '2rem' }}>2. Integrações e Vendas</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Link de Checkout (Ex: Cakto, Kiwify)</label>
                  <input type="text" placeholder="https://pay.kiwify.com.br/..." 
                    value={formData.checkoutUrl || ''} onChange={e => setFormData({...formData, checkoutUrl: e.target.value})}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                  />
                  <small style={{ color: 'var(--text-secondary)', marginTop: '0.3rem', display: 'block' }}>Para onde o cliente vai ao clicar em "Assinar Plano"</small>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 'bold', marginBottom: '0.5rem' }}>ID do Produto na Cakto / Kiwify (Webhook)</label>
                  <input type="text" placeholder="Ex: 1234567 ou prod_8910" 
                    value={formData.webhook_product_id || ''} onChange={e => setFormData({...formData, webhook_product_id: e.target.value})}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', color: 'white' }}
                  />
                  <small style={{ color: 'var(--text-secondary)', marginTop: '0.3rem', display: 'block' }}>Se o webhook receber uma venda com este ID, entregará este plano.</small>
                </div>
              </div>
              
              <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Link de Divulgação (Cadastro Direto)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" readOnly 
                    value={formData.id ? `${window.location.origin}/login?plan=${formData.id}` : 'Salve o plano primeiro para gerar o link'}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', color: formData.id ? 'var(--primary-color)' : 'var(--text-secondary)', cursor: 'default' }}
                  />
                  {formData.id && (
                    <button type="button" onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/login?plan=${formData.id}`);
                      alert('Link copiado!');
                    }} style={{ background: 'var(--primary-color)', color: 'black', border: 'none', borderRadius: '8px', padding: '0 1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                      Copiar
                    </button>
                  )}
                </div>
                <small style={{ color: 'var(--text-secondary)', marginTop: '0.3rem', display: 'block' }}>Envie este link para o cliente se cadastrar direto neste plano</small>
              </div>
            </div>

            {/* Permissões no App */}
            <div>
              <h4 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1rem', marginTop: '2rem' }}>3. Liberação de Acesso no App</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.accessHome} onChange={e => setFormData({...formData, accessHome: e.target.checked})} style={{ width: '20px', height: '20px', accentColor: 'var(--primary-color)' }}/>
                  Acesso à categoria "Treino em Casa"
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.accessGym} onChange={e => setFormData({...formData, accessGym: e.target.checked})} style={{ width: '20px', height: '20px', accentColor: 'var(--primary-color)' }}/>
                  Acesso à categoria "Treino Academia"
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.accessCreate} onChange={e => setFormData({...formData, accessCreate: e.target.checked})} style={{ width: '20px', height: '20px', accentColor: 'var(--primary-color)' }}/>
                  Permissão para "Criar Treinos Personalizados"
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.accessWhatsapp} onChange={e => setFormData({...formData, accessWhatsapp: e.target.checked})} style={{ width: '20px', height: '20px', accentColor: '#25D366' }}/>
                  Lembretes automáticos no WhatsApp
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.accessAdvanced} onChange={e => setFormData({...formData, accessAdvanced: e.target.checked})} style={{ width: '20px', height: '20px', accentColor: 'var(--primary-color)' }}/>
                  Acesso à categoria "Treino Avançado"
                </label>
              </div>
            </div>

            {/* Lista de Benefícios (Visual) */}
            <div>
              <h4 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1rem', marginTop: '2rem' }}>4. Lista de Benefícios (Visível pro usuário)</h4>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input 
                  type="text" 
                  placeholder="Ex: Suporte 24h via WhatsApp..."
                  value={newFeature}
                  onChange={e => setNewFeature(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                />
                <button type="button" onClick={addFeature} className="btn btn-primary" style={{ padding: '0 1.5rem' }}>Adicionar</button>
              </div>
              
              {formData.features.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                  {formData.features.map((feature, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--primary-color)"/> {feature}</span>
                      <button type="button" onClick={() => removeFeature(idx)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}><Trash2 size={16}/></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Save size={18}/> Salvar Plano
              </button>
              <button type="button" className="btn" style={{ background: 'rgba(255,255,255,0.1)' }} onClick={() => setIsEditing(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Carregando planos do servidor...</div>
          ) : plans.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Nenhum plano cadastrado.</div>
          ) : (
            plans.map(plan => (
              <div key={plan.id} className="glass-card" style={{ 
                padding: '2rem', 
                display: 'flex', 
                flexDirection: 'column', 
                position: 'relative',
                border: plan.isRecommended ? '2px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.1)',
                transform: plan.isRecommended ? 'scale(1.02)' : 'scale(1)'
              }}>
                {plan.isRecommended && (
                  <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary-color)', color: 'black', padding: '0.2rem 1rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Star size={14} fill="black" /> RECOMENDADO
                  </div>
                )}
                {plan.isVisible === false && (
                  <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255, 68, 68, 0.2)', border: '1px solid #ff4444', color: '#ff4444', padding: '0.2rem 0.5rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                    OCULTO
                  </div>
                )}
                
                <h2 style={{ textAlign: 'center', margin: '0 0 1rem 0' }}>{plan.name}</h2>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: plan.price === '0' || plan.price === '0,00' ? 'white' : 'var(--primary-color)' }}>
                    R$ {plan.price}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {plan.isTrial ? ` (Teste ${plan.trialDays === 'custom' || !plan.trialDays ? 7 : plan.trialDays}D)` : `/${plan.cycle.toLowerCase()}`}
                  </span>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '2rem' }}>
                  {plan.accessHome && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem' }}>
                      <CheckCircle2 size={18} color="var(--primary-color)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ color: 'rgba(255,255,255,0.9)' }}>Acesso ao Treino em Casa</span>
                    </div>
                  )}
                  {plan.accessGym && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem' }}>
                      <CheckCircle2 size={18} color="var(--primary-color)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ color: 'rgba(255,255,255,0.9)' }}>Acesso ao Treino na Academia</span>
                    </div>
                  )}
                  {plan.accessCreate && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem' }}>
                      <CheckCircle2 size={18} color="var(--primary-color)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ color: 'rgba(255,255,255,0.9)' }}>Criar Treinos Personalizados</span>
                    </div>
                  )}
                  {plan.accessWhatsapp && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem' }}>
                      <CheckCircle2 size={18} color="var(--primary-color)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ color: 'rgba(255,255,255,0.9)' }}>Lembretes via WhatsApp</span>
                    </div>
                  )}
                  {plan.accessAdvanced && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem' }}>
                      <CheckCircle2 size={18} color="var(--primary-color)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ color: 'rgba(255,255,255,0.9)' }}>Acesso ao Treino Avançado</span>
                    </div>
                  )}

                  {plan.features && plan.features
                    .filter(feat => !['Acesso ao Treino em Casa', 'Acesso ao Treino na Academia', 'Criar Treinos Personalizados', 'Lembretes via WhatsApp', 'Acesso ao Treino Avançado', 'Diário de Treino Básico', 'Acesso Total (Casa e Academia)', 'Criação ilimitada de treinos', 'Lembretes automáticos via WhatsApp'].includes(feat))
                    .map((feat, i) => (
                    <div key={`custom-${i}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem' }}>
                      <CheckCircle2 size={18} color="var(--primary-color)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ color: 'rgba(255,255,255,0.9)' }}>{feat}</span>
                    </div>
                  ))}
                  
                  {/* Benefícios barrados se não houver acesso */}
                  {!plan.accessHome && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', opacity: 0.4 }}>
                      <X size={18} color="var(--text-secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ textDecoration: 'line-through' }}>Acesso ao Treino em Casa</span>
                    </div>
                  )}
                  {!plan.accessGym && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', opacity: 0.4 }}>
                      <X size={18} color="var(--text-secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ textDecoration: 'line-through' }}>Acesso ao Treino na Academia</span>
                    </div>
                  )}
                  {!plan.accessCreate && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', opacity: 0.4 }}>
                      <X size={18} color="var(--text-secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ textDecoration: 'line-through' }}>Criar Treinos Personalizados</span>
                    </div>
                  )}
                  {!plan.accessWhatsapp && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', opacity: 0.4 }}>
                      <X size={18} color="var(--text-secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ textDecoration: 'line-through' }}>Lembretes via WhatsApp</span>
                    </div>
                  )}
                  {!plan.accessAdvanced && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', opacity: 0.4 }}>
                      <X size={18} color="var(--text-secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ textDecoration: 'line-through' }}>Acesso ao Treino Avançado</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', marginBottom: '0.5rem' }}>
                  <button onClick={() => { localStorage.setItem('simulated_plan_id', plan.id); window.location.href = '/'; }} className="btn animate-scale" style={{ flex: 1, background: 'var(--primary-color)', color: 'black', fontWeight: 'bold', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                    Simular Experiência
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(plan)} className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: 'white', display: 'flex', justifyContent: 'center', gap: '0.4rem', border: 'none' }}>
                    <Edit2 size={16} /> Editar
                  </button>
                  <button onClick={() => handleDelete(plan.id)} className="btn" style={{ background: 'rgba(255, 68, 68, 0.1)', color: '#ff4444', border: 'none', padding: '0.8rem' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
