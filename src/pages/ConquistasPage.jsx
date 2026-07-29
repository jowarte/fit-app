import React, { useState, useEffect } from 'react';
import { Trophy, Star, Award, Zap, ChevronRight, Lock } from 'lucide-react';
import { getGamificationState, getLevelData, BADGES } from '../lib/gamification';

export function ConquistasPage() {
  const [gameState, setGameState] = useState(null);
  const [levelData, setLevelData] = useState(null);

  useEffect(() => {
    const state = getGamificationState();
    setGameState(state);
    setLevelData(getLevelData(state.totalXP));
  }, []);

  if (!gameState || !levelData) return <div className="container" style={{ paddingTop: '2rem' }}>Carregando...</div>;

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '6rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Trophy size={32} color="var(--primary-color)" />
        <h2 style={{ margin: 0 }}>Suas Conquistas</h2>
      </div>

      {/* Cartão de Nível / Perfil */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.5) 100%)', border: `1px solid ${levelData.rank.color}30` }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', border: `3px solid ${levelData.rank.color}`, boxShadow: `0 0 20px ${levelData.rank.color}40`, position: 'relative' }}>
          <span style={{ fontSize: '2.5rem' }}>🔥</span>
          <div style={{ position: 'absolute', bottom: '-10px', background: levelData.rank.color, color: 'black', padding: '2px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
            NÍVEL {levelData.level}
          </div>
        </div>
        
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.8rem', color: levelData.rank.color }}>{levelData.rank.name}</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{gameState.totalWorkouts} treinos concluídos no total</p>
        
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Progresso do Nível</span>
            <span style={{ color: 'white', fontWeight: 'bold' }}>{gameState.totalXP} / {levelData.nextLevelXP} XP</span>
          </div>
          <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${levelData.progressPercentage}%`, background: levelData.rank.color, transition: 'width 1s ease-out' }}></div>
          </div>
        </div>
      </div>

      {/* Galeria de Medalhas */}
      <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Award size={24} color="var(--primary-color)" /> Mural de Medalhas
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1.5rem' }}>
        {BADGES.map(badge => {
          const isUnlocked = gameState.unlockedBadges.includes(badge.id);
          return (
            <div key={badge.id} className="glass-card" style={{ 
              padding: '1.5rem 1rem', 
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
              opacity: isUnlocked ? 1 : 0.5,
              background: isUnlocked ? 'rgba(0,255,136,0.05)' : 'rgba(255,255,255,0.02)',
              border: isUnlocked ? '1px solid rgba(0,255,136,0.2)' : '1px solid rgba(255,255,255,0.05)',
              filter: isUnlocked ? 'none' : 'grayscale(100%)',
              transition: 'all 0.3s'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', position: 'relative' }}>
                {badge.icon}
                {!isUnlocked && (
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.6)', borderRadius: '50%', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Lock size={20} color="white" />
                  </div>
                )}
              </div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: isUnlocked ? '#00ff88' : 'white' }}>{badge.name}</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>{badge.description}</p>
            </div>
          );
        })}
      </div>
      
    </div>
  );
}
