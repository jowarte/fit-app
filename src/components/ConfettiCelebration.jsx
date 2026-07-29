import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Star, X } from 'lucide-react';

export function ConfettiCelebration({ result, onClose }) {
  useEffect(() => {
    // Dispara confetes assim que o componente for montado
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);

    return () => clearInterval(interval);
  }, []);

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  return (
    <div className="animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass-card animate-scale" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '3rem 2rem', background: 'linear-gradient(145deg, var(--bg-dark) 0%, #1a1a1a 100%)', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
        
        <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <X size={24} />
        </button>

        <div style={{ marginBottom: '1.5rem', animation: 'bounce 2s infinite' }}>
          <Trophy size={80} color={result.newRank ? result.newRank.color : '#ECC94B'} />
        </div>
        
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Treino Destruído!</h2>
        <p style={{ color: '#00ff88', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '2rem' }}>+{result.xpGained} XP</p>
        
        {result.leveledUp && (
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', border: `1px solid ${result.newRank.color}40` }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>🔥</span>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'white' }}>Subiu de Nível!</h3>
            <p style={{ color: result.newRank.color, fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>Você agora é {result.newRank.name} (Nível {result.newLevel})</p>
          </div>
        )}

        {result.newlyUnlockedBadges && result.newlyUnlockedBadges.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Novas Medalhas Desbloqueadas:</h4>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {result.newlyUnlockedBadges.map(b => (
                <div key={b.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', width: '100px' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{b.icon}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{b.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={onClose} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }}>
          Continuar
        </button>
      </div>
    </div>
  );
}
