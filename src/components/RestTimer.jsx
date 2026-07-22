import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';

export function RestTimer({ initialSeconds = 60 }) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Aqui poderíamos tocar um som
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]); // Vibra no celular ao acabar
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggle = () => {
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
    <div className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Timer color={timeLeft === 0 ? "var(--danger-color)" : "var(--primary-color)"} size={28} />
        <div>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Descanso</h4>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: timeLeft === 0 ? 'var(--danger-color)' : 'white' }}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button 
          onClick={toggle} 
          style={{ 
            background: isActive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
            color: isActive ? 'var(--danger-color)' : 'var(--accent-color)',
            padding: '0.75rem', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isActive ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button 
          onClick={reset}
          style={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '0.75rem', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
}
