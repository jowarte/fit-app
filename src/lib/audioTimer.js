// Utilitário de som de alarme/apito de descanso usando Web Audio API
// Funciona 100% offline, sem arquivos externos .mp3, sem atraso de rede e sem risco de erro 404/CORS.

let audioCtx = null;

export function initTimerAudio() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch (e) {
    console.warn('Falha ao inicializar AudioContext:', e);
    return null;
  }
}

export function playTimerAlarm() {
  try {
    const ctx = initTimerAudio();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => doPlayBeeps(ctx)).catch(() => {});
    } else {
      doPlayBeeps(ctx);
    }
  } catch (err) {
    console.warn('Erro ao tocar alarme do timer:', err);
  }

  // Vibração no celular
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate([180, 90, 180, 90, 450]);
    } catch (_) {}
  }
}

function doPlayBeeps(ctx) {
  const playBeep = (freq, startOffset, duration, volume = 0.45) => {
    try {
      const now = ctx.currentTime + startOffset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Suavização da curva para evitar estalo no som
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
      gain.gain.setValueAtTime(volume, now + duration - 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn('Erro no oscilador:', e);
    }
  };

  // Padrão de apito de academia: bip, bip, BEEP longo
  // 1º bip: 880Hz (Lá 5)
  playBeep(880, 0, 0.15, 0.45);
  // 2º bip: 880Hz
  playBeep(880, 0.22, 0.15, 0.45);
  // 3º bip finalizador: 1320Hz (Mi 6), mais alto e prolongado
  playBeep(1320, 0.44, 0.5, 0.6);
}
