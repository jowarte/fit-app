import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle2, Star, Dumbbell, Smartphone, Activity, ArrowRight, X, Clock, Play, Users, Sparkles, Shield, Zap } from 'lucide-react';

const DEFAULT_PLANS = [
  {
    id: 'plan_free',
    name: 'Free (Iniciante)',
    price: '0,00',
    cycle: 'Mensal',
    isRecommended: false,
    isVisible: true,
    accessHome: true,
    accessGym: false,
    accessCreate: false,
    accessWhatsapp: false,
    accessAdvanced: false,
    checkoutUrl: '',
    features: ['Acesso ao Treino em Casa', 'Diário de Treino Básico']
  },
  {
    id: 'plan_pro',
    name: 'PRO (Recomendado)',
    price: '29,90',
    cycle: 'Mensal',
    isRecommended: true,
    isVisible: true,
    accessHome: true,
    accessGym: true,
    accessCreate: true,
    accessWhatsapp: true,
    accessAdvanced: true,
    checkoutUrl: '',
    features: ['Acesso Total (Casa e Academia)', 'Criação ilimitada de treinos', 'Compartilhar no WhatsApp', 'Gráficos de Evolução', 'Acesso ao Treino Avançado']
  }
];

const mapPlan = (p) => ({
  id: p.id,
  name: p.name,
  price: p.price,
  cycle: p.cycle || 'Mensal',
  checkoutUrl: p.checkoutUrl || p.checkout_url || '',
  isVisible: p.isVisible !== undefined ? p.isVisible : (p.is_visible !== undefined ? p.is_visible : true),
  isRecommended: p.isRecommended !== undefined ? p.isRecommended : (p.is_recommended !== undefined ? p.is_recommended : false),
  accessHome: p.accessHome !== undefined ? p.accessHome : (p.access_home !== undefined ? p.access_home : false),
  accessGym: p.accessGym !== undefined ? p.accessGym : (p.access_gym !== undefined ? p.access_gym : false),
  accessCreate: p.accessCreate !== undefined ? p.accessCreate : (p.access_create !== undefined ? p.access_create : false),
  accessWhatsapp: p.accessWhatsapp !== undefined ? p.accessWhatsapp : (p.access_whatsapp !== undefined ? p.access_whatsapp : false),
  accessAdvanced: p.accessAdvanced !== undefined ? p.accessAdvanced : (p.access_advanced !== undefined ? p.access_advanced : false),
  features: Array.isArray(p.features) ? p.features : []
});

export function SalesPage() {
  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const navigate = useNavigate();

  // Configurações e Textos Dinâmicos (IA / Customizáveis)
  const [appName, setAppName] = useState('TreinoApp');
  const [appLogoUrl, setAppLogoUrl] = useState('');
  const [appCoverUrl, setAppCoverUrl] = useState('/hero-bg.png');
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

  useEffect(() => {
    window.scrollTo(0, 0);

    // Acionar evento de PageView para o Facebook Pixel
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }

    // 1. Ler cache local imediatamente
    try {
      const localContent = localStorage.getItem('sales_page_content');
      if (localContent) {
        const parsed = JSON.parse(localContent);
        if (parsed.sales_badge) setSalesBadge(parsed.sales_badge);
        if (parsed.sales_headline) setSalesHeadline(parsed.sales_headline);
        if (parsed.sales_subheadline) setSalesSubheadline(parsed.sales_subheadline);
        if (parsed.sales_cta_text) setSalesCtaText(parsed.sales_cta_text);
        if (parsed.sales_benefits && Array.isArray(parsed.sales_benefits)) setSalesBenefits(parsed.sales_benefits);
      }

      const localSettings = localStorage.getItem('app_settings_local');
      if (localSettings) {
        const s = JSON.parse(localSettings);
        if (s.app_name) setAppName(s.app_name);
        if (s.app_logo_url) setAppLogoUrl(s.app_logo_url);
        if (s.app_cover_url) setAppCoverUrl(s.app_cover_url);
        if (s.primary_color) {
          document.documentElement.style.setProperty('--primary-color', s.primary_color);
        }
        if (s.seo_title) document.title = s.seo_title;
      }
    } catch (e) {
      console.error(e);
    }

    // 2. Ler do Supabase
    async function loadData() {
      try {
        const { data: settings } = await supabase.from('app_settings').select('*').eq('id', 1).single();
        if (settings) {
          if (settings.app_name) setAppName(settings.app_name);
          if (settings.app_logo_url) setAppLogoUrl(settings.app_logo_url);
          if (settings.app_cover_url) setAppCoverUrl(settings.app_cover_url);
          if (settings.sales_badge) setSalesBadge(settings.sales_badge);
          if (settings.sales_headline) setSalesHeadline(settings.sales_headline);
          if (settings.sales_subheadline) setSalesSubheadline(settings.sales_subheadline);
          if (settings.sales_cta_text) setSalesCtaText(settings.sales_cta_text);
          if (settings.sales_benefits && Array.isArray(settings.sales_benefits) && settings.sales_benefits.length > 0) {
            setSalesBenefits(settings.sales_benefits);
          }
          if (settings.primary_color) {
            document.documentElement.style.setProperty('--primary-color', settings.primary_color);
          }
          if (settings.seo_title) document.title = settings.seo_title;
        }

        const { data: plansData, error: plansError } = await supabase.from('plans').select('*').order('created_at', { ascending: true });
        if (plansData && plansData.length > 0) {
          setPlans(plansData.map(mapPlan));
        } else {
          const savedPlans = localStorage.getItem('admin_plans');
          if (savedPlans) {
            try {
              const parsed = JSON.parse(savedPlans);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setPlans(parsed.map(mapPlan));
              } else {
                setPlans(DEFAULT_PLANS);
              }
            } catch (e) {
              setPlans(DEFAULT_PLANS);
            }
          } else {
            setPlans(DEFAULT_PLANS);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados da página de vendas:", err);
      }
    }
    loadData();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', paddingBottom: '5rem', overflowX: 'hidden' }}>
      
      {/* Navbar Minimalista */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 5%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', position: 'fixed', top: 0, width: '100%', zIndex: 50, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {appLogoUrl ? (
            <img src={appLogoUrl} alt={appName} style={{ maxHeight: '35px', maxWidth: '120px', objectFit: 'contain' }} />
          ) : (
            <Dumbbell color="var(--primary-color)" size={28} />
          )}
          <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'white', fontWeight: 'bold' }}>{appName}</h2>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="#beneficios" style={{ color: 'white', textDecoration: 'none', fontSize: '0.9rem' }} className="hide-on-mobile">Como Funciona</a>
          <a href="#planos" style={{ color: 'white', textDecoration: 'none', fontSize: '0.9rem' }} className="hide-on-mobile">Planos</a>
          <button onClick={() => navigate('/login')} className="btn" style={{ background: 'transparent', color: 'var(--primary-color)', border: '1px solid var(--primary-color)', fontWeight: 'bold', padding: '0.4rem 1.4rem', borderRadius: '20px' }}>Entrar</button>
        </div>
      </nav>

      {/* BLOCO 1: Hero Section com Imagem de Fundo e Textos Gerados pela IA */}
      <section style={{ 
        position: 'relative', 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '7rem 5% 4rem 5%',
        textAlign: 'center',
        background: `url('${appCoverUrl || '/hero-bg.png'}') center/cover no-repeat` 
      }}>
        {/* Overlay Escuro para dar leitura ao texto */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 50%, var(--bg-dark) 100%)', zIndex: 1 }}></div>
        
        <div className="animate-fade-in" style={{ position: 'relative', zIndex: 2, maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* Badge / Selo */}
          <div style={{ background: 'rgba(0, 255, 136, 0.15)', color: 'var(--primary-color)', padding: '0.45rem 1.2rem', borderRadius: '25px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(0,255,136,0.3)', letterSpacing: '0.5px' }}>
            <Star size={14} fill="var(--primary-color)" /> {salesBadge}
          </div>

          {/* Headline Principal */}
          <h1 style={{ fontSize: 'clamp(2.3rem, 5vw, 4rem)', fontWeight: '900', lineHeight: 1.15, marginBottom: '1.5rem', textShadow: '0 4px 20px rgba(0,0,0,0.7)', color: 'white' }}>
            {salesHeadline}
          </h1>

          {/* Subtítulo */}
          <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.9)', marginBottom: '2.5rem', maxWidth: '750px', margin: '0 auto 2.5rem auto', textShadow: '0 2px 10px rgba(0,0,0,0.7)', lineHeight: 1.6 }}>
            {salesSubheadline}
          </p>

          {/* Botões de Ação */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="#planos" className="btn btn-primary animate-scale" style={{ padding: '1rem 2.5rem', fontSize: '1.15rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', boxShadow: '0 10px 30px rgba(0,255,136,0.3)' }}>
              {salesCtaText} <ArrowRight size={20} />
            </a>
            <a href="#beneficios" className="btn" style={{ padding: '1rem 2.5rem', fontSize: '1.15rem', background: 'rgba(255,255,255,0.1)', color: 'white', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              Como Funciona
            </a>
          </div>
        </div>
      </section>

      {/* BLOCO 2: Problema vs Solução */}
      <section id="beneficios" style={{ padding: '6rem 5%', background: 'var(--bg-dark)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Por que o {appName} funciona?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
              Esqueça planilhas confusas e treinos engessados. Tenha um método visual, direto ao ponto e focado na sua rotina.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* O Problema */}
            <div className="glass-card" style={{ padding: '2.5rem', border: '1px solid rgba(255, 68, 68, 0.2)', background: 'linear-gradient(145deg, rgba(255,68,68,0.05) 0%, rgba(0,0,0,0) 100%)' }}>
              <h3 style={{ color: '#ff4444', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <X size={24} /> O jeito antigo (Sem Resultados)
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <li style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-secondary)' }}><X size={20} color="#ff4444" style={{ flexShrink: 0 }}/> Esquecer os dias de treino pela falta de incentivo.</li>
                <li style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-secondary)' }}><X size={20} color="#ff4444" style={{ flexShrink: 0 }}/> Não saber executar o exercício porque a foto no papel não ajuda.</li>
                <li style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-secondary)' }}><X size={20} color="#ff4444" style={{ flexShrink: 0 }}/> Gastar muito dinheiro com mensalidades abusivas.</li>
              </ul>
            </div>
            
            {/* A Solução */}
            <div className="glass-card" style={{ padding: '2.5rem', border: '1px solid rgba(0, 255, 136, 0.3)', background: 'linear-gradient(145deg, rgba(0,255,136,0.05) 0%, rgba(0,0,0,0) 100%)', transform: 'scale(1.05)', zIndex: 2, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
              <h3 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={24} /> O jeito {appName} (Resultados)
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <li style={{ display: 'flex', gap: '0.5rem', color: 'white', fontSize: '1.05rem' }}><CheckCircle2 size={22} color="var(--primary-color)" style={{ flexShrink: 0 }}/> Compartilhe fichas e vídeos direto no WhatsApp.</li>
                <li style={{ display: 'flex', gap: '0.5rem', color: 'white', fontSize: '1.05rem' }}><CheckCircle2 size={22} color="var(--primary-color)" style={{ flexShrink: 0 }}/> +1.800 Vídeos e GIFs realistas ensinando o movimento perfeito.</li>
                <li style={{ display: 'flex', gap: '0.5rem', color: 'white', fontSize: '1.05rem' }}><CheckCircle2 size={22} color="var(--primary-color)" style={{ flexShrink: 0 }}/> Crie suas próprias rotinas para fazer em Casa ou na Academia.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* BLOCO 3: 4 Destaques Dinâmicos Gerados por IA */}
      <section style={{ padding: '6rem 5%', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2.5rem' }}>
          {salesBenefits.map((benefit, idx) => (
            <div key={idx} style={{ textAlign: 'center' }}>
              <div style={{ background: 'rgba(0,255,136,0.1)', width: '75px', height: '75px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                {idx === 0 ? <Play size={36} color="var(--primary-color)" /> :
                 idx === 1 ? <Smartphone size={36} color="var(--primary-color)" /> :
                 idx === 2 ? <Zap size={36} color="var(--primary-color)" /> :
                 <Shield size={36} color="var(--primary-color)" />}
              </div>
              <h3 style={{ marginBottom: '0.8rem', fontSize: '1.3rem', color: 'white' }}>{benefit.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BLOCO 3.5: Visualização Muscular com GIFs */}
      <section style={{ padding: '6rem 5%', background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, var(--bg-dark) 100%)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: 'rgba(0, 255, 136, 0.1)', color: '#00ff88', padding: '0.5rem 1.5rem', borderRadius: '30px', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '1.5rem', border: '1px solid rgba(0,255,136,0.2)' }}>
            MÁXIMA PRECISÃO ANATÔMICA
          </div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', lineHeight: 1.2 }}>
            Sinta o músculo certo, <span style={{ color: 'var(--primary-color)' }}>no momento exato.</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '800px', margin: '0 auto 4rem auto', lineHeight: 1.6 }}>
            Chega de treinar "no escuro" e adivinhar se o movimento está correto. O <strong>{appName}</strong> traz vídeos que destacam os grupos musculares exatos que você está ativando. Você vai treinar com a consciência de um atleta de alta performance, maximizando seus resultados e evitando lesões.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div className="glass-card animate-scale" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: '100%', paddingTop: '100%', position: 'relative', borderRadius: '16px', overflow: 'hidden', background: '#000' }}>
                <img src="/muscles/1.gif" alt="Anatomia Muscular 1" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
            <div className="glass-card animate-scale" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: '100%', paddingTop: '100%', position: 'relative', borderRadius: '16px', overflow: 'hidden', background: '#000' }}>
                <img src="/muscles/2.gif" alt="Anatomia Muscular 2" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
            <div className="glass-card animate-scale" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: '100%', paddingTop: '100%', position: 'relative', borderRadius: '16px', overflow: 'hidden', background: '#000' }}>
                <img src="/muscles/3.gif" alt="Anatomia Muscular 3" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
            <div className="glass-card animate-scale" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: '100%', paddingTop: '100%', position: 'relative', borderRadius: '16px', overflow: 'hidden', background: '#000' }}>
                <img src="/muscles/4.gif" alt="Anatomia Muscular 4" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOCO 3.6: Treino em Casa com Vídeos e GIFs */}
      <section style={{ padding: '6rem 5%', background: 'linear-gradient(180deg, var(--bg-dark) 0%, rgba(255,255,255,0.02) 100%)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: 'rgba(255, 165, 0, 0.1)', color: '#ffa500', padding: '0.5rem 1.5rem', borderRadius: '30px', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '1.5rem', border: '1px solid rgba(255,165,0,0.2)' }}>
            TREINO EM QUALQUER LUGAR
          </div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', lineHeight: 1.2 }}>
            Sua academia é <span style={{ color: '#ffa500' }}>onde você estiver.</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '800px', margin: '0 auto 4rem auto', lineHeight: 1.6 }}>
            Falta de tempo, dia de chuva ou academia lotada? Não tem problema. O <strong>{appName}</strong> possui um acervo gigantesco focado em treinos com o peso do próprio corpo. Em poucos minutos na sua sala, você queima gordura, ganha condicionamento e define os músculos sem precisar de nenhum equipamento. Resultados de academia, no seu ritmo e no seu espaço.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div className="glass-card animate-scale" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: '100%', paddingTop: '100%', position: 'relative', borderRadius: '16px', overflow: 'hidden', background: '#000' }}>
                <video src="/home-workout/5.mp4" autoPlay loop muted playsInline style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
            <div className="glass-card animate-scale" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: '100%', paddingTop: '100%', position: 'relative', borderRadius: '16px', overflow: 'hidden', background: '#000' }}>
                <img src="/home-workout/6.gif" alt="Treino em Casa" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
            <div className="glass-card animate-scale" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: '100%', paddingTop: '100%', position: 'relative', borderRadius: '16px', overflow: 'hidden', background: '#000' }}>
                <img src="/home-workout/7.gif" alt="Treino em Casa" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
            <div className="glass-card animate-scale" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: '100%', paddingTop: '100%', position: 'relative', borderRadius: '16px', overflow: 'hidden', background: '#000' }}>
                <video src="/home-workout/8.mp4" autoPlay loop muted playsInline style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOCO 3.7: Treino Avançado (Pokas) */}
      <section style={{ padding: '6rem 5%', background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, var(--bg-dark) 100%)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4rem' }}>
          
          <div style={{ flex: '1 1 500px' }}>
            <div style={{ display: 'inline-block', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', padding: '0.5rem 1.5rem', borderRadius: '30px', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '1.5rem', border: '1px solid rgba(168,85,247,0.3)' }}>
              MÓDULO EXCLUSIVO
            </div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', lineHeight: 1.2 }}>
              <span style={{ color: '#a855f7' }}>Pokas Mode:</span> O Fim do Platô Muscular.
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              A maior dor de quem treina há algum tempo é a <strong>estagnação</strong>. O corpo é inteligente, se acostuma com os mesmos estímulos e simplesmente para de evoluir, gerando frustração.
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
              É aí que entra o nosso sistema de <strong>Treino Avançado (Pokas Mode)</strong>. Ele foi desenvolvido para "quebrar" essa adaptação, utilizando algoritmos avançados para prescrever estímulos de altíssima intensidade no momento exato em que seu corpo precisa. Volte a ver seu corpo mudar no espelho, mês após mês.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'white' }}>
                <CheckCircle2 size={20} color="#a855f7" /> Técnicas avançadas e progressão inteligente.
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'white' }}>
                <CheckCircle2 size={20} color="#a855f7" /> Superação do "efeito platô" (estagnação) em semanas.
              </li>
            </ul>
          </div>

          <div style={{ flex: '1 1 400px', display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            <div className="glass-card animate-scale" style={{ padding: '0.5rem', background: 'rgba(168,85,247,0.05)', borderRadius: '24px', border: '1px solid rgba(168,85,247,0.2)', width: '45%' }}>
              <img src="/advanced/01.png" alt="Pokas Mode Interface 1" style={{ width: '100%', borderRadius: '16px', objectFit: 'cover' }} />
            </div>
            <div className="glass-card animate-scale" style={{ padding: '0.5rem', background: 'rgba(168,85,247,0.05)', borderRadius: '24px', border: '1px solid rgba(168,85,247,0.2)', width: '45%', transform: 'translateY(2rem)', transitionDelay: '0.2s' }}>
              <img src="/advanced/02.png" alt="Pokas Mode Interface 2" style={{ width: '100%', borderRadius: '16px', objectFit: 'cover' }} />
            </div>
          </div>

        </div>
      </section>

      {/* BLOCO 4: Pricing / Planos (Dynamic) */}
      <section id="planos" style={{ padding: '6rem 5%' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Pronto para começar?</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            Escolha o plano que melhor se adapta à sua rotina e inicie sua transformação hoje.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          {Array.isArray(plans) && plans.filter(plan => plan && plan.isVisible !== false).length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)', padding: '4rem', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              Nenhum plano disponível no momento.
            </div>
          ) : (
            Array.isArray(plans) && plans.filter(plan => plan && plan.isVisible !== false).map((plan) => (
              <div key={plan.id} className="glass-card plan-card" style={{ 
                position: 'relative', 
                display: 'flex', flexDirection: 'column', height: '100%',
                border: plan.isRecommended ? '2px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.1)',
                transform: plan.isRecommended ? 'scale(1.05)' : 'scale(1)',
                boxShadow: plan.isRecommended ? '0 20px 50px rgba(0,255,136,0.15)' : 'none',
                zIndex: plan.isRecommended ? 10 : 1
              }}>
                {plan.isRecommended && (
                  <div style={{ position: 'absolute', top: '-16px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary-color)', color: 'black', padding: '0.4rem 1.5rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                    <Star size={16} fill="black" /> RECOMENDADO
                  </div>
                )}
                
                <h3 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', textAlign: 'center' }}>{plan.name}</h3>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ fontSize: '1.2rem', alignSelf: 'flex-start', marginTop: '8px', color: 'var(--text-secondary)' }}>R$</span>
                  <span style={{ fontSize: '4rem', fontWeight: '900', color: plan.price === '0' || plan.price === '0,00' ? 'white' : 'var(--primary-color)', lineHeight: 1, letterSpacing: '-1px' }}>{plan.price}</span>
                  <span style={{ color: 'var(--text-secondary)', marginLeft: '5px' }}>/{plan.cycle?.toLowerCase() || 'mensal'}</span>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '3rem' }}>
                  {plan.accessHome && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <CheckCircle2 size={22} color="var(--primary-color)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)' }}>Acesso ao Treino em Casa</span>
                    </div>
                  )}
                  {plan.accessGym && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <CheckCircle2 size={22} color="var(--primary-color)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)' }}>Acesso ao Treino na Academia</span>
                    </div>
                  )}
                  {plan.accessCreate && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <CheckCircle2 size={22} color="var(--primary-color)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)' }}>Criar Treinos Personalizados</span>
                    </div>
                  )}
                  {plan.accessWhatsapp && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <CheckCircle2 size={22} color="var(--primary-color)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)' }}>Compartilhamento via WhatsApp</span>
                    </div>
                  )}
                  {plan.accessAdvanced && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <CheckCircle2 size={22} color="var(--primary-color)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)' }}>Acesso ao Treino Avançado</span>
                    </div>
                  )}

                  {Array.isArray(plan.features) && plan.features
                    .filter(feat => !['Acesso ao Treino em Casa', 'Acesso ao Treino na Academia', 'Criar Treinos Personalizados', 'Lembretes via WhatsApp', 'Acesso ao Treino Avançado', 'Diário de Treino Básico', 'Acesso Total (Casa e Academia)', 'Criação ilimitada de treinos', 'Lembretes automáticos via WhatsApp'].includes(feat))
                    .map((feat, idx) => (
                    <div key={`custom-${idx}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <CheckCircle2 size={22} color="var(--primary-color)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)' }}>{feat}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => {
                    if (plan.checkoutUrl) {
                      window.open(plan.checkoutUrl, '_blank');
                    } else {
                      navigate(`/login?plan=${plan.id}`);
                    }
                  }}
                  className="btn animate-scale" 
                  style={{ 
                    width: '100%', 
                    padding: '1.2rem', 
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    background: plan.isRecommended ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)', 
                    color: plan.isRecommended ? 'black' : 'white',
                    border: plan.isRecommended ? 'none' : '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                >
                  {plan.price === '0' || plan.price === '0,00' ? 'Começar Grátis' : 'Assinar Agora'}
                </button>
              </div>
            ))
          )}
        </div>
      </section>
      
      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '3rem', borderTop: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.5)' }}>
        {appLogoUrl ? (
          <img src={appLogoUrl} alt={appName} style={{ maxHeight: '40px', maxWidth: '140px', objectFit: 'contain', marginBottom: '1rem', opacity: 0.8 }} />
        ) : (
          <Dumbbell color="var(--text-secondary)" size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
        )}
        <p style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'white' }}>{appName} - Evolua Todos os Dias</p>
        <p style={{ fontSize: '0.8rem' }}>© {new Date().getFullYear()} Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
