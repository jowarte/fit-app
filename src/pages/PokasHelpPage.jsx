import React, { useState } from 'react';
import { X, Dumbbell, Trophy, Zap, Clock, User, ChevronRight } from 'lucide-react';

const steps = [
  {
    icon: '⚡',
    color: '#a855f7',
    title: 'O que é o Treino Avançado?',
    desc: 'É um módulo especial para quem quer bater recordes pessoais (PRs) a cada treino usando a metodologia Low Volume. Em vez de fazer 5 séries de um exercício, você faz 1 série PERFEITA com tudo que tem, tentando superar sua marca anterior.',
  },
  {
    icon: '1️⃣',
    color: '#06b6d4',
    title: 'Passo 1 — Inicie o treino',
    desc: 'Na tela inicial (Início), clique em "⚡ Iniciar treino". Isso abre a sessão ao vivo com cronômetro, contagem de séries e volume total.',
    tip: 'Você pode pausar e voltar depois — o treino continua de onde parou!'
  },
  {
    icon: '2️⃣',
    color: '#10b981',
    title: 'Passo 2 — Adicione exercícios',
    desc: 'Clique em "+ Adicionar exercício" e escolha os exercícios do catálogo. Se não encontrar o seu exercício, vá em "Exercícios" e crie um novo com o botão "+".',
  },
  {
    icon: '3️⃣',
    color: '#f59e0b',
    title: 'Passo 3 — Registre a série',
    desc: 'Toque em um exercício para abrir o painel de registro. Ajuste a carga (use os botões +0.5 / +1.25 / +2.5 / +5 para precisão) e as repetições.',
    tip: 'O sistema calcula automaticamente o E1RM (força máxima estimada) em tempo real!'
  },
  {
    icon: '🎯',
    color: '#ef4444',
    title: 'O Alvo do dia',
    desc: 'O app mostra automaticamente "Superar X kg E1RM" — que é o seu melhor registro anterior. Tente aumentar a carga OU as repetições para bater esse número.',
    tip: 'Se nunca treinou esse exercício, o alvo é "Registrar sua linha de base". Qualquer valor já conta!'
  },
  {
    icon: '🏆',
    color: '#a855f7',
    title: 'Bateu o PR!',
    desc: 'Quando o E1RM calculado superar o seu recorde, o botão fica roxo e aparece "Novo PR!". Ao registrar, explode confete na tela e o recorde é salvo!',
    tip: 'RIR (Reps in Reserve) = quantas repetições você ainda conseguiria fazer. Mantenha sempre em 0 ou 1 para máximo esforço.'
  },
  {
    icon: '⏱️',
    color: '#06b6d4',
    title: 'Descanse entre as séries',
    desc: 'Após registrar uma série, aparece automaticamente um cronômetro de 60 segundos de descanso. Clique em "Pular" se quiser continuar antes.',
  },
  {
    icon: '📊',
    color: '#10b981',
    title: 'Acompanhe seu progresso',
    desc: 'Na Dashboard (Início), você vê:\n• Taxa de Recorde — % de séries que viraram PR\n• Sequência — dias consecutivos de treino\n• Volume 7d — total de kg movidos\n• Alvos do próximo treino — metas automáticas',
  },
  {
    icon: '📋',
    color: '#f59e0b',
    title: 'Histórico e Perfil',
    desc: '• Histórico: todos os treinos concluídos com exercícios, volume e PRs do dia\n• Perfil: seu ranking pessoal dos 5 maiores PRs de todos os tempos',
  },
];

export function PokasHelpPage({ onClose }) {
  const [current, setCurrent] = useState(0);
  const step = steps[current];
  const isLast = current === steps.length - 1;

  return (
    <div className="animate-fade-in" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'var(--bg-dark)', zIndex: 300, display: 'flex', flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Como usar</h2>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Treino Avançado — Guia passo a passo</p>
        </div>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={18} />
        </button>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', padding: '1rem 0 0.5rem' }}>
        {steps.map((_, i) => (
          <div key={i} onClick={() => setCurrent(i)} style={{ width: i === current ? '20px' : '6px', height: '6px', borderRadius: '3px', background: i === current ? step.color : 'rgba(255,255,255,0.15)', cursor: 'pointer', transition: 'all 0.3s' }} />
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Step card */}
        <div key={current} className="animate-fade-in" style={{ background: `linear-gradient(135deg, ${step.color}18, ${step.color}08)`, border: `1px solid ${step.color}33`, borderRadius: '24px', padding: '2rem 1.5rem', marginBottom: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem', lineHeight: 1 }}>{step.icon}</div>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.3rem', color: 'white', lineHeight: '1.3' }}>{step.title}</h2>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.75)', lineHeight: '1.7', fontSize: '0.95rem', whiteSpace: 'pre-line' }}>{step.desc}</p>
          {step.tip && (
            <div style={{ marginTop: '1.5rem', background: `${step.color}20`, border: `1px solid ${step.color}40`, borderRadius: '14px', padding: '1rem 1.2rem', width: '100%' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: step.color, lineHeight: '1.5' }}>
                💡 <strong>Dica:</strong> {step.tip}
              </p>
            </div>
          )}
        </div>

        {/* Counter */}
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '0 0 1rem 0' }}>
          {current + 1} de {steps.length}
        </p>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          {current > 0 && (
            <button onClick={() => setCurrent(c => c - 1)} style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '14px', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}>
              ← Anterior
            </button>
          )}
          <button onClick={() => isLast ? onClose() : setCurrent(c => c + 1)} style={{ flex: 2, padding: '1rem', background: step.color, border: 'none', borderRadius: '14px', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            {isLast ? '✅ Entendi, bora treinar!' : 'Próximo →'}
          </button>
        </div>
      </div>
    </div>
  );
}
