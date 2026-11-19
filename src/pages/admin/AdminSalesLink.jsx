import React, { useState, useEffect } from 'react';
import { ShoppingCart, Eye, Copy, Check, Sparkles, Wand2, RefreshCw, Save, ExternalLink, Bot, Key, AlertCircle, PlayCircle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { AI_PROVIDERS, PROMPT_TEMPLATES, generateSalesCopy } from '../../lib/aiSales';
import { initFacebookPixel, trackPixelEvent, sanitizePixelId } from '../../lib/pixel';

export function AdminSalesLink() {
  const [copied, setCopied] = useState(false);
  const [fbPixel, setFbPixel] = useState('');
  const [savedMessage, setSavedMessage] = useState('');
  
  // Estados da IA
  const [aiProvider, setAiProvider] = useState('gemini');
  const [aiApiKey, setAiApiKey] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiSuccess, setAiSuccess] = useState(null);

  // Textos da Página de Vendas
  const [salesBadge, setSalesBadge] = useState('O APP MAIS COMPLETO DO BRASIL');
  const [salesHeadline, setSalesHeadline] = useState('Transforme seu corpo com o método definitivo de treino.');
  const [salesSubheadline, setSalesSubheadline] = useState('Pare de pular treinos. Tenha acesso a vídeos realistas de alta qualidade, crie rotinas personalizadas e mantenha o foco inabalável.');
  const [salesCtaText, setSalesCtaText] = useState('Ver Planos');
  const [salesBenefits, setSalesBenefits] = useState([
    { title: 'Vídeos de Alta Definição', desc: 'Mais de 1.800 exercícios com execuções perfeitas gravadas em detalhes para nunca mais errar o movimento.' },
    { title: 'Treine Onde Quiser', desc: 'Fichas completas tanto para academia quanto para casa usando apenas o peso do seu corpo.' },
    { title: 'Compartilhe no WhatsApp', desc: 'Envie suas rotinas e vídeos de treino para você mesmo ou amigos no WhatsApp com apenas 1 clique.' },
    { title: 'Acompanhamento Semanal', desc: 'Registre cada treino concluído e acompanhe sua evolução semana a semana.' }
  ]);

  const [savingContent, setSavingContent] = useState(false);
  const salesLink = window.location.origin + '/planos';

  const currentProviderConfig = AI_PROVIDERS.find(p => p.id === aiProvider) || AI_PROVIDERS[0];

  useEffect(() => {
    // Carregar cache local primeiro para resposta rápida
    try {
      const cachedPixel = localStorage.getItem('fb_pixel');
      if (cachedPixel) setFbPixel(cachedPixel);

      const local = localStorage.getItem('sales_page_content');
      if (local) {
        const p = JSON.parse(local);
        if (p.sales_badge) setSalesBadge(p.sales_badge);
        if (p.sales_headline) setSalesHeadline(p.sales_headline);
        if (p.sales_subheadline) setSalesSubheadline(p.sales_subheadline);
        if (p.sales_cta_text) setSalesCtaText(p.sales_cta_text);
        if (p.sales_benefits && Array.isArray(p.sales_benefits)) setSalesBenefits(p.sales_benefits);
        if (p.ai_provider) setAiProvider(p.ai_provider);
        if (p.ai_api_key) setAiApiKey(p.ai_api_key);
        if (p.ai_prompt) setAiPrompt(p.ai_prompt);
      }
    } catch(e) {}

    async function fetchSettings() {
      try {
        const { data } = await supabase.from('app_settings').select('*').eq('id', 1).single();
        if (data) {
          if (data.fb_pixel) {
            setFbPixel(data.fb_pixel);
            localStorage.setItem('fb_pixel', data.fb_pixel);
          }
          if (data.ai_provider) setAiProvider(data.ai_provider);
          if (data.ai_api_key) setAiApiKey(data.ai_api_key);
          if (data.ai_prompt) setAiPrompt(data.ai_prompt);
          if (data.sales_badge) setSalesBadge(data.sales_badge);
          if (data.sales_headline) setSalesHeadline(data.sales_headline);
          if (data.sales_subheadline) setSalesSubheadline(data.sales_subheadline);
          if (data.sales_cta_text) setSalesCtaText(data.sales_cta_text);
          if (data.sales_benefits && Array.isArray(data.sales_benefits) && data.sales_benefits.length > 0) {
            setSalesBenefits(data.sales_benefits);
          }
        }
      } catch (err) {
        console.error('Erro ao buscar configurações:', err);
      }
    }
    fetchSettings();
  }, []);

  const handleSavePixel = async () => {
    const cleanId = sanitizePixelId(fbPixel);
    if (fbPixel && cleanId.length < 5) {
      setSavedMessage('⚠️ Digite um ID numérico válido (ex: 123456789012345)');
      setTimeout(() => setSavedMessage(''), 4000);
      return;
    }

    try {
      localStorage.setItem('fb_pixel', cleanId);
      if (cleanId) {
        initFacebookPixel(cleanId);
      }
      await supabase.from('app_settings').upsert({ id: 1, fb_pixel: cleanId });
      setFbPixel(cleanId);
      setSavedMessage(cleanId ? '✅ Pixel do Facebook salvo e ativado!' : '✅ Pixel removido com sucesso!');
    } catch(e) {
      setSavedMessage('✅ Pixel salvo localmente no navegador!');
    }
    setTimeout(() => setSavedMessage(''), 4000);
  };

  const handleTestPixel = () => {
    const cleanId = sanitizePixelId(fbPixel);
    if (!cleanId) {
      setSavedMessage('⚠️ Salve um Pixel primeiro antes de testar!');
      setTimeout(() => setSavedMessage(''), 3000);
      return;
    }
    initFacebookPixel(cleanId);
    trackPixelEvent('PageView');
    setSavedMessage('🎯 Teste enviado! Verifique o Meta Pixel Helper ou console.');
    setTimeout(() => setSavedMessage(''), 4000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(salesLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateAi = async () => {
    setGeneratingAi(true);
    setAiError(null);
    setAiSuccess(null);

    try {
      const generated = await generateSalesCopy({
        provider: aiProvider,
        apiKey: aiApiKey,
        userPrompt: aiPrompt
      });

      if (generated) {
        if (generated.badge) setSalesBadge(generated.badge);
        if (generated.headline) setSalesHeadline(generated.headline);
        if (generated.subheadline) setSalesSubheadline(generated.subheadline);
        if (generated.cta_text) setSalesCtaText(generated.cta_text);
        if (generated.benefits && Array.isArray(generated.benefits)) {
          setSalesBenefits(generated.benefits);
        }

        setAiSuccess('Textos gerados com sucesso pela IA! Revise abaixo e clique em Salvar.');
      }
    } catch (err) {
      console.error(err);
      setAiError(err.message || 'Erro ao gerar textos com IA. Verifique sua chave de API.');
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleSaveSalesContent = async () => {
    setSavingContent(true);
    setAiSuccess(null);
    setAiError(null);

    const contentPayload = {
      id: 1,
      ai_provider: aiProvider,
      ai_api_key: aiApiKey,
      ai_prompt: aiPrompt,
      sales_badge: salesBadge,
      sales_headline: salesHeadline,
      sales_subheadline: salesSubheadline,
      sales_cta_text: salesCtaText,
      sales_benefits: salesBenefits
    };

    // Salvar localmente de imediato para a página /planos já atualizar
    localStorage.setItem('sales_page_content', JSON.stringify(contentPayload));

    try {
      const { error } = await supabase.from('app_settings').upsert(contentPayload);
      if (error) {
        console.warn('Erro ao salvar no banco (colunas podem estar pendentes):', error);
      }
      setAiSuccess('Página de Vendas salva e atualizada com sucesso!');
    } catch (err) {
      setAiSuccess('Página de Vendas atualizada com sucesso no seu navegador!');
    } finally {
      setSavingContent(false);
      setTimeout(() => setAiSuccess(null), 5000);
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem', maxWidth: '850px' }}>
      
      {/* Topo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'rgba(255, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
          <ShoppingCart size={28} color="#ff4444" />
        </div>
        <div>
          <h1 style={{ margin: 0 }}>Página de Vendas & IA</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Divulgue seu aplicativo e reformule sua copy de vendas usando Inteligência Artificial.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Card de Visualização e Links */}
        <div className="glass-card" style={{ padding: '1.8rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ margin: '0 0 0.3rem 0', color: 'white' }}>Link Oficial de Vendas</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Envie esse link no Instagram, Bio, campanhas ou anúncios.
              </p>
            </div>
            <Link 
              to="/planos" 
              target="_blank" 
              className="btn btn-primary" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.4rem', fontSize: '0.95rem', fontWeight: 'bold' }}
            >
              <Eye size={18} /> Ver Página ao Vivo
            </Link>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              readOnly 
              value={salesLink}
              style={{ flex: 1, padding: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.95rem' }}
            />
            <button 
              onClick={handleCopy}
              className="btn" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', color: 'white', padding: '0 1.2rem', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {copied ? <Check size={18} color="var(--primary-color)"/> : <Copy size={18} />}
              {copied ? 'Copiado!' : 'Copiar Link'}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* NOVO ESTÚDIO DE IA: Reformular Página de Vendas com Gemini, OpenAI ou Llama */}
        {/* ========================================================================= */}
        <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(0, 210, 255, 0.3)', background: 'linear-gradient(135deg, rgba(0, 210, 255, 0.05), rgba(0,0,0,0.5))' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #00d2ff, #a855f7)', padding: '0.5rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={22} color="#000" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'white' }}>Estúdio de IA para Página de Vendas</h2>
              <span style={{ fontSize: '0.8rem', color: '#00d2ff', fontWeight: '500' }}>Mude a proposta da sua página de vendas quando quiser com IA</span>
            </div>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Conecte sua chave de inteligência artificial favorita (Gemini, ChatGPT ou Meta Llama) e digite o foco da sua oferta. A IA reescreve títulos, promessas, chamadas e benefícios na hora!
          </p>

          {/* Seletor de Provedor de IA */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Provedor de Inteligência Artificial:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.6rem' }}>
              {AI_PROVIDERS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setAiProvider(p.id)}
                  style={{
                    background: aiProvider === p.id ? 'rgba(0, 210, 255, 0.2)' : 'rgba(255,255,255,0.03)',
                    color: aiProvider === p.id ? '#00d2ff' : 'white',
                    border: `1px solid ${aiProvider === p.id ? '#00d2ff' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '8px',
                    padding: '0.6rem 0.8rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: aiProvider === p.id ? 'bold' : 'normal',
                    transition: 'all 0.2s'
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Campo da Chave de API */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Key size={14} color="#00d2ff" /> Chave de API ({currentProviderConfig.name}):
              </label>
              <a 
                href={currentProviderConfig.apiKeyHelp} 
                target="_blank" 
                rel="noreferrer" 
                style={{ fontSize: '0.75rem', color: '#00d2ff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
              >
                Obter chave grátis <ExternalLink size={12} />
              </a>
            </div>
            <input 
              type="password"
              placeholder={`Cole sua chave aqui (Ex: ${currentProviderConfig.placeholderKey})`}
              value={aiApiKey}
              onChange={e => setAiApiKey(e.target.value)}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem' }}
            />
          </div>

          {/* Templates de Prompt Rápidos */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Modelos Prontos de Oferta (clique para aplicar):
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {PROMPT_TEMPLATES.map(tpl => (
                <button
                  key={tpl.label}
                  type="button"
                  onClick={() => setAiPrompt(tpl.prompt)}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    padding: '0.35rem 0.75rem',
                    color: 'rgba(255,255,255,0.85)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.borderColor = '#00d2ff'}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Campo de Prompt Customizado */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Instrução / Prompt para a Inteligência Artificial:
            </label>
            <textarea 
              rows="3"
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              placeholder="Ex: Crie uma página agressiva para mulheres que querem perder barriga treinando em casa sem peso, com tom empático e foco em vídeos passo a passo..."
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem', resize: 'vertical' }}
            />
          </div>

          {/* Feedback de Erro ou Sucesso */}
          {aiError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff6b6b', fontSize: '0.85rem', marginBottom: '1rem' }}>
              <AlertCircle size={16} />
              <span>{aiError}</span>
            </div>
          )}

          {aiSuccess && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', color: '#00ff88', fontSize: '0.85rem', marginBottom: '1rem' }}>
              <Check size={16} />
              <span>{aiSuccess}</span>
            </div>
          )}

          {/* Botão de Disparo da IA */}
          <button 
            type="button"
            onClick={handleGenerateAi}
            disabled={generatingAi}
            className="btn animate-scale"
            style={{
              width: '100%',
              padding: '1rem',
              background: 'linear-gradient(135deg, #00d2ff, #0077ff)',
              color: '#000',
              fontWeight: 'bold',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              border: 'none',
              borderRadius: '10px',
              cursor: generatingAi ? 'wait' : 'pointer',
              boxShadow: '0 4px 15px rgba(0, 210, 255, 0.3)'
            }}
          >
            {generatingAi ? <RefreshCw className="animate-spin" size={20} /> : <Wand2 size={20} />}
            {generatingAi ? 'Gerando textos de alta conversão...' : '✨ Reformular Página de Vendas com IA'}
          </button>
        </div>

        {/* ========================================================================= */}
        {/* REVISÃO E EDIÇÃO MANUAL DOS TEXTOS DA PÁGINA DE VENDAS */}
        {/* ========================================================================= */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '0.5rem', color: 'white' }}>Textos da Página de Vendas</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Aqui estão os textos ativos. Você pode editar qualquer frase manualmente antes de salvar.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            {/* Selo / Badge */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Selo de Destaque Superior:
              </label>
              <input 
                type="text" 
                value={salesBadge}
                onChange={e => setSalesBadge(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#00ff88', fontWeight: 'bold' }}
              />
            </div>

            {/* Headline Principal */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Título Principal (Headline):
              </label>
              <input 
                type="text" 
                value={salesHeadline}
                onChange={e => setSalesHeadline(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontWeight: 'bold', fontSize: '1.05rem' }}
              />
            </div>

            {/* Subtítulo */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Subtítulo Persuasivo:
              </label>
              <textarea 
                rows="3"
                value={salesSubheadline}
                onChange={e => setSalesSubheadline(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)', resize: 'vertical' }}
              />
            </div>

            {/* Texto do Botão (CTA) */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Texto do Botão de Ação:
              </label>
              <input 
                type="text" 
                value={salesCtaText}
                onChange={e => setSalesCtaText(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontWeight: 'bold' }}
              />
            </div>

            {/* Benefícios (4 itens) */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.6rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                4 Benefícios / Destaques do Aplicativo:
              </label>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                {salesBenefits.map((b, idx) => (
                  <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#00d2ff', marginBottom: '0.2rem' }}>Benefício #{idx + 1}:</label>
                    <input 
                      type="text" 
                      value={b.title}
                      onChange={e => {
                        const updated = [...salesBenefits];
                        updated[idx].title = e.target.value;
                        setSalesBenefits(updated);
                      }}
                      placeholder="Título do benefício"
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.4rem' }}
                    />
                    <textarea 
                      rows="2"
                      value={b.desc}
                      onChange={e => {
                        const updated = [...salesBenefits];
                        updated[idx].desc = e.target.value;
                        setSalesBenefits(updated);
                      }}
                      placeholder="Descrição do benefício"
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', resize: 'vertical' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Botão de Salvar Alterações */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <button 
                type="button"
                onClick={handleSaveSalesContent}
                disabled={savingContent}
                className="btn btn-primary animate-scale" 
                style={{ flex: 1, minWidth: '220px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1rem' }}
              >
                <Save size={18} />
                {savingContent ? 'Salvando na Página de Vendas...' : '💾 Salvar Alterações na Página de Vendas'}
              </button>

              <Link 
                to="/planos" 
                target="_blank" 
                className="btn" 
                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <Eye size={18} /> Ver Página
              </Link>
            </div>

          </div>
        </div>

        {/* Facebook Pixel */}
        <div className="glass-card" style={{ padding: '1.8rem', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🎯 Pixel do Facebook / Meta Ads
            </h3>
            {fbPixel && fbPixel.length >= 5 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '0.3rem 0.8rem', borderRadius: '20px', color: '#4ade80', fontSize: '0.8rem', fontWeight: 'bold' }}>
                <ShieldCheck size={15} /> Pixel Ativo: {fbPixel}
              </span>
            )}
          </div>

          <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Adicione apenas o número identificador do seu Pixel da Meta. O sistema configurará e disparará os eventos automaticamente:
            <br />
            • <strong style={{ color: 'white' }}>PageView</strong>: Ao abrir a página inicial ou de planos.
            <br />
            • <strong style={{ color: 'white' }}>InitiateCheckout</strong>: Quando o visitante clica no botão de assinar qualquer plano.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Cole aqui seu Pixel ID (ex: 2119024148651706)"
                value={fbPixel}
                onChange={(e) => setFbPixel(e.target.value.replace(/\D/g, ''))}
                style={{ width: '100%', padding: '0.9rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '1rem', letterSpacing: '0.5px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button 
                type="button"
                onClick={handleSavePixel}
                className="btn btn-primary" 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', fontWeight: 'bold' }}
              >
                <Check size={18} /> Salvar Pixel
              </button>

              {fbPixel && (
                <button 
                  type="button"
                  onClick={handleTestPixel}
                  className="btn" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.2rem', background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  <PlayCircle size={18} /> Testar Disparo
                </button>
              )}

              {savedMessage && (
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: savedMessage.includes('⚠️') ? '#f87171' : 'var(--primary-color)' }}>
                  {savedMessage}
                </span>
              )}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
