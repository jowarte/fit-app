import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Target, Dumbbell, MapPin, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export function OnboardingModal({ userId, userName, onComplete }) {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const goals = [
    { id: 'Hipertrofia', label: 'Ganho de Massa / Hipertrofia', desc: 'Foco em aumentar a musculatura e força.' },
    { id: 'Emagrecimento', label: 'Emagrecimento / Definição', desc: 'Foco em queima calórica e perda de gordura.' },
    { id: 'Condicionamento', label: 'Saúde e Condicionamento', desc: 'Melhorar resistência e qualidade de vida.' }
  ];

  const levels = [
    { id: 'Iniciante', label: 'Iniciante', desc: 'Nunca treinei ou estou voltando agora.' },
    { id: 'Intermediario', label: 'Intermediário', desc: 'Já treino há alguns meses com frequência.' },
    { id: 'Avancado', label: 'Avançado', desc: 'Treino de forma consistente há mais de 1 ano.' }
  ];

  const locations = [
    { id: 'Academia', label: 'Na Academia', desc: 'Tenho acesso a aparelhos e pesos livres.' },
    { id: 'Casa', label: 'Em Casa', desc: 'Treino com peso corporal ou acessórios simples.' },
    { id: 'Ambos', label: 'Ambos', desc: 'Alterno entre treinar em casa e na academia.' }
  ];

  const handleFinish = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          fitness_goal: goal,
          experience_level: experience,
          workout_location: location
        })
        .eq('id', userId);

      if (error) throw error;
      
      // Dispara o evento para o InstallPrompt
      window.dispatchEvent(new Event('triggerInstallPrompt'));
      
      onComplete();
    } catch (err) {
      console.error('Erro ao salvar onboarding:', err);
      alert('Ocorreu um erro ao salvar suas preferências. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(9, 9, 11, 0.95)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem', backdropFilter: 'blur(8px)'
    }}>
      <div className="glass-card" style={{
        width: '100%', maxWidth: '480px', background: 'rgba(24, 24, 27, 0.8)',
        border: '1px solid rgba(0, 242, 254, 0.2)', padding: '2rem',
        boxShadow: '0 0 30px rgba(0, 242, 254, 0.1)', position: 'relative'
      }}>
        
        {/* Progress Bar */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '2rem' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{
              flex: 1, height: '4px', borderRadius: '2px',
              background: i <= step ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
              transition: 'background-color 0.3s ease'
            }} />
          ))}
        </div>

        {/* Step 1: Welcome & Name check */}
        {step === 1 && (
          <div className="animate-fade-in" style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', background: 'rgba(0, 242, 254, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
              <CheckCircle size={48} color="var(--primary-color)" />
            </div>
            <h2 style={{ marginBottom: '1rem' }}>
              Boas-vindas, <span className="gradient-text">{userName || 'Guerreiro(a)'}</span>!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
              Vamos personalizar o seu treino em menos de 1 minuto para que você atinja seus objetivos mais rápido.
            </p>
            <button className="btn btn-primary" onClick={() => setStep(2)} style={{ width: '100%' }}>
              Começar <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Step 2: Goal selection */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target color="var(--primary-color)" size={20} /> Qual o seu objetivo principal?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Escolha o foco que mais combina com seu momento atual.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '2rem' }}>
              {goals.map((g) => (
                <div
                  key={g.id}
                  onClick={() => setGoal(g.id)}
                  style={{
                    padding: '1rem', borderRadius: '12px', cursor: 'pointer',
                    background: goal === g.id ? 'rgba(0, 242, 254, 0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${goal === g.id ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)'}`,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <h4 style={{ color: goal === g.id ? 'var(--primary-color)' : 'white', margin: '0 0 0.2rem 0', fontSize: '0.95rem' }}>{g.label}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>{g.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn" onClick={() => setStep(1)} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', flex: 1 }}>
                <ArrowLeft size={18} /> Voltar
              </button>
              <button
                className="btn btn-primary"
                disabled={!goal}
                onClick={() => setStep(3)}
                style={{ flex: 1, opacity: goal ? 1 : 0.5 }}
              >
                Avançar <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Experience level selection */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Dumbbell color="var(--primary-color)" size={20} /> Qual o seu nível atual?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Isso ajuda a calibrar a intensidade e os tipos de exercícios.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '2rem' }}>
              {levels.map((l) => (
                <div
                  key={l.id}
                  onClick={() => setExperience(l.id)}
                  style={{
                    padding: '1rem', borderRadius: '12px', cursor: 'pointer',
                    background: experience === l.id ? 'rgba(0, 242, 254, 0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${experience === l.id ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)'}`,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <h4 style={{ color: experience === l.id ? 'var(--primary-color)' : 'white', margin: '0 0 0.2rem 0', fontSize: '0.95rem' }}>{l.label}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>{l.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn" onClick={() => setStep(2)} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', flex: 1 }}>
                <ArrowLeft size={18} /> Voltar
              </button>
              <button
                className="btn btn-primary"
                disabled={!experience}
                onClick={() => setStep(4)}
                style={{ flex: 1, opacity: experience ? 1 : 0.5 }}
              >
                Avançar <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Location selection */}
        {step === 4 && (
          <div className="animate-fade-in">
            <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin color="var(--primary-color)" size={20} /> Onde você prefere treinar?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Filtraremos os treinos ideais para o seu ambiente.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '2rem' }}>
              {locations.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => setLocation(loc.id)}
                  style={{
                    padding: '1rem', borderRadius: '12px', cursor: 'pointer',
                    background: location === loc.id ? 'rgba(0, 242, 254, 0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${location === loc.id ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)'}`,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <h4 style={{ color: location === loc.id ? 'var(--primary-color)' : 'white', margin: '0 0 0.2rem 0', fontSize: '0.95rem' }}>{loc.label}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>{loc.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn" onClick={() => setStep(3)} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', flex: 1 }} disabled={loading}>
                <ArrowLeft size={18} /> Voltar
              </button>
              <button
                className="btn btn-primary"
                disabled={!location || loading}
                onClick={handleFinish}
                style={{ flex: 1, opacity: location ? 1 : 0.5 }}
              >
                {loading ? 'Salvando...' : 'Finalizar!'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
