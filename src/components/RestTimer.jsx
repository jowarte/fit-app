import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { initTimerAudio, playTimerAlarm } from '../lib/audioTimer';

export function RestTimer({ initialSeconds = 60 }) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsActive(false);
            if (soundEnabled) {
              playTimerAlarm();
            }
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, soundEnabled]);

  const toggle = () => {
    initTimerAudio();
    if (timeLeft === 0) setTimeLeft(initialSeconds);
    setIsActive(!isActive);
  };

  const reset = () => {
    setTimeLeft(initialSeconds);
    setIsActive(false);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="glass-card" 
      style={{ 
        padding: '1rem', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginTop: '1rem',
        border: timeLeft === 0 ? '1px solid rgba(239, 68, 68, 0.4)' : undefined,
        background: timeLeft === 0 ? 'rgba(239, 68, 68, 0.08)' : undefined,
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Timer color={timeLeft === 0 ? "var(--danger-color)" : "var(--primary-color)"} size={28} />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>Descanso</h4>
            {soundEnabled && (
              <span title="Alarme sonoro ativo" style={{ fontSize: '0.7rem', color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '1px 5px', borderRadius: '4px', fontWeight: 'bold' }}>
                BIP ON
              </span>
            )}
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: timeLeft === 0 ? 'var(--danger-color)' : 'white' }}>
            {formatTime(timeLeft)}
          </span>
          {timeLeft === 0 && (
            <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>
              ✓ Tempo concluído! Próxima série 💪
            </div>
          )}
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <button 
          onClick={() => {
            initTimerAudio();
            setSoundEnabled(!soundEnabled);
          }}
          title={soundEnabled ? "Desativar apito sonoro" : "Ativar apito sonoro"}
          style={{ 
            background: soundEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.08)',
            color: soundEnabled ? 'var(--accent-color)' : 'var(--text-secondary)',
            border: 'none',
            padding: '0.65rem', 
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        <button 
          onClick={toggle} 
          style={{ 
            background: isActive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
            color: isActive ? 'var(--danger-color)' : 'var(--accent-color)',
            border: 'none',
            padding: '0.75rem', 
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
          title={isActive ? "Pausar" : "Iniciar descanso"}
        >
          {isActive ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button 
          onClick={reset}
          style={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            padding: '0.75rem', 
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            transition: 'background 0.2s'
          }}
          title="Reiniciar cronômetro"
        >
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
}
