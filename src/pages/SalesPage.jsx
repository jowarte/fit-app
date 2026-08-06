import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Star, Dumbbell, Smartphone, Activity, ArrowRight, X, Clock, Play, Users } from 'lucide-react';

export function SalesPage() {
  const [plans, setPlans] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);

    // Injetar FB Pixel se configurado
    const pixelId = localStorage.getItem('admin_fb_pixel');
    if (pixelId) {
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init', pixelId);
      window.fbq('track', 'PageView');
    }

    const saved = localStorage.getItem('admin_plans');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setPlans(parsed);
        }
      } catch (e) {
        console.error('Erro ao ler admin_plans:', e);
      }
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', paddingBottom: '5rem', overflowX: 'hidden' }}>
      {/* Navbar Minimalista (Apenas para a página de vendas) */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 5%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', position: 'fixed', top: 0, width: '100%', zIndex: 50, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Dumbbell color="var(--primary-color)" size={28} />
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'white' }}>TreinoApp</h2>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="#beneficios" style={{ color: 'white', textDecoration: 'none', fontSize: '0.9rem' }} className="hide-on-mobile">Como Funciona</a>
          <a href="#planos" style={{ color: 'white', textDecoration: 'none', fontSize: '0.9rem' }} className="hide-on-mobile">Planos</a>
          <button onClick={() => navigate('/login')} className="btn" style={{ background: 'transparent', color: 'var(--primary-color)', border: '1px solid var(--primary-color)', fontWeight: 'bold', padding: '0.5rem 1.5rem', borderRadius: '20px' }}>Entrar</button>
        </div>
      </nav>

      {/* BLOCO 1: Hero Section com Imagem de Fundo Gerada pela IA */}
      <section style={{ 
        position: 'relative', 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '6rem 5% 4rem 5%',
        textAlign: 'center',
        background: `url('/hero-bg.png') center/cover no-repeat` 
      }}>
        {/* Overlay Escuro para dar leitura ao texto */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, var(--bg-dark) 100%)', zIndex: 1 }}></div>
        
        <div className="animate-fade-in" style={{ position: 'relative', zIndex: 2, maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ background: 'rgba(0, 255, 136, 0.2)', color: '#00ff88', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', border: '1px solid rgba(0,255,136,0.3)' }}>
            <Star size={14} fill="#00ff88" /> O APP MAIS COMPLETO DO BRASIL
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '900', lineHeight: 1.1, marginBottom: '1.5rem', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            Transforme seu corpo com o <span style={{ color: 'var(--primary-color)' }}>método definitivo</span> de treino.
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.9)', marginBottom: '2.5rem', maxWidth: '700px', margin: '0 auto 2.5rem auto', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            Pare de pular treinos. Tenha acesso a vídeos realistas de alta qualidade, crie rotinas personalizadas e receba avisos no WhatsApp para manter o foco inabalável.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="#planos" className="btn btn-primary animate-scale" style={{ padding: '1rem 2.5rem', fontSize: '1.2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', boxShadow: '0 10px 30px rgba(0,255,136,0.3)' }}>
              Ver Planos <ArrowRight size={20} />
            </a>
            <a href="#beneficios" className="btn" style={{ padding: '1rem 2.5rem', fontSize: '1.2rem', background: 'rgba(255,255,255,0.1)', color: 'white', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              Como funciona
            </a>
          </div>
        </div>
      </section>

      {/* BLOCO 2: Problema vs Solução */}
      <section id="beneficios" style={{ padding: '6rem 5%', background: 'var(--bg-dark)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Por que o TreinoApp funciona?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>Esqueça aquelas planilhas de treino de papel e os aplicativos genéricos com animações 3D sem graça.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* O Problema */}
            <div className="glass-card" style={{ padding: '2.5rem', border: '1px solid rgba(255, 68, 68, 0.2)', background: 'linear-gradient(145deg, rgba(255,68,68,0.05) 0%, rgba(0,0,0,0) 100%)' }}>
              <h3 style={{ color: '#ff4444', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <X size={24} /> O jeito antigo (Falho)
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <li style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-secondary)' }}><X size={20} color="#ff4444" style={{ flexShrink: 0 }}/> Esquecer os dias de treino pela falta de incentivo.</li>
                <li style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-secondary)' }}><X size={20} color="#ff4444" style={{ flexShrink: 0 }}/> Não saber executar o exercício porque a foto no papel não ajuda.</li>
                <li style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-secondary)' }}><X size={20} color="#ff4444" style={{ flexShrink: 0 }}/> Gastar muito dinheiro com planilhas engessadas.</li>
              </ul>
            </div>
            
            {/* A Solução */}
            <div className="glass-card" style={{ padding: '2.5rem', border: '1px solid rgba(0, 255, 136, 0.3)', background: 'linear-gradient(145deg, rgba(0,255,136,0.05) 0%, rgba(0,0,0,0) 100%)', transform: 'scale(1.05)', zIndex: 2, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
              <h3 style={{ color: '#00ff88', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={24} /> O jeito TreinoApp (Resultados)
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <li style={{ display: 'flex', gap: '0.5rem', color: 'white', fontSize: '1.05rem' }}><CheckCircle2 size={22} color="#00ff88" style={{ flexShrink: 0 }}/> Avisos direto no WhatsApp para você não procrastinar.</li>
                <li style={{ display: 'flex', gap: '0.5rem', color: 'white', fontSize: '1.05rem' }}><CheckCircle2 size={22} color="#00ff88" style={{ flexShrink: 0 }}/> +3.000 Vídeos e GIFs realistas ensinando o movimento perfeito.</li>
                <li style={{ display: 'flex', gap: '0.5rem', color: 'white', fontSize: '1.05rem' }}><CheckCircle2 size={22} color="#00ff88" style={{ flexShrink: 0 }}/> Crie suas próprias rotinas para fazer em Casa ou na Academia.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* BLOCO 3: Funcionalidades de Destaque */}
      <section style={{ padding: '6rem 5%', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: 'rgba(0,255,136,0.1)', width: '80px', height: '80px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', transform: 'rotate(-5deg)' }}>
              <Play size={40} color="var(--primary-color)" />
            </div>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Aprenda Vendo</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>Nosso banco de dados conta com vídeos reais e detalhados. Veja o movimento sendo feito por modelos de verdade, não por bonecos 3D.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: 'rgba(0,255,136,0.1)', width: '80px', height: '80px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', transform: 'rotate(5deg)' }}>
              <Smartphone size={40} color="var(--primary-color)" />
            </div>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Lembrete WhatsApp</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>Configure os dias que deseja treinar e nosso sistema avisa você automaticamente pelo seu WhatsApp. Impossível esquecer!</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: 'rgba(0,255,136,0.1)', width: '80px', height: '80px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', transform: 'rotate(-5deg)' }}>
              <Users size={40} color="var(--primary-color)" />
            </div>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Para Todos</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>Separamos o acervo por categorias: Homens, Mulheres, Treino em Casa, Treino de Academia, com Peso, sem Peso, Gifs e Vídeos.</p>
          </div>
        </div>
      </section>

      {/* BLOCO 4: Pricing / Planos (Dynamic) */}
      <section id="planos" style={{ padding: '6rem 5%' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Pronto para começar?</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>Escolha o plano que melhor se adapta à sua rotina e inicie sua transformação hoje. Sem taxas de cancelamento.</p>
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
                  {/* Benefícios Core Ativos */}
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
                      <span style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)' }}>Lembretes via WhatsApp</span>
                    </div>
                  )}

                  {/* Benefícios Customizados (filtrando duplicatas legadas) */}
                  {Array.isArray(plan.features) && plan.features
                    .filter(feat => !['Acesso ao Treino em Casa', 'Acesso ao Treino na Academia', 'Criar Treinos Personalizados', 'Lembretes via WhatsApp', 'Diário de Treino Básico', 'Acesso Total (Casa e Academia)', 'Criação ilimitada de treinos', 'Lembretes automáticos via WhatsApp'].includes(feat))
                    .map((feat, idx) => (
                    <div key={`custom-${idx}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <CheckCircle2 size={22} color="var(--primary-color)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)' }}>{feat}</span>
                    </div>
                  ))}
                  
                  {/* Benefícios barrados se não houver acesso */}
                  {!plan.accessHome && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', opacity: 0.3 }}>
                      <X size={22} color="var(--text-secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '1.05rem', textDecoration: 'line-through' }}>Acesso ao Treino em Casa</span>
                    </div>
                  )}
                  {!plan.accessGym && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', opacity: 0.3 }}>
                      <X size={22} color="var(--text-secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '1.05rem', textDecoration: 'line-through' }}>Acesso à categoria Treino Academia</span>
                    </div>
                  )}
                  {!plan.accessCreate && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', opacity: 0.3 }}>
                      <X size={22} color="var(--text-secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '1.05rem', textDecoration: 'line-through' }}>Criação de Treinos Livres</span>
                    </div>
                  )}
                  {!plan.accessWhatsapp && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', opacity: 0.3 }}>
                      <X size={22} color="var(--text-secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '1.05rem', textDecoration: 'line-through' }}>Lembretes no WhatsApp</span>
                    </div>
                  )}
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
                  onMouseOver={(e) => {
                    if(!plan.isRecommended) e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
                  }}
                  onMouseOut={(e) => {
                    if(!plan.isRecommended) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
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
        <Dumbbell color="var(--text-secondary)" size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
        <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>TreinoApp - Evolua Todos os Dias</p>
        <p style={{ fontSize: '0.8rem' }}>© 2026 Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
