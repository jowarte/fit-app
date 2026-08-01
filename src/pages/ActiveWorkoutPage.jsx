import React, { useState, useEffect, useRef } from 'react';
import { X, Trophy, Play, Timer, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

// Simple confetti burst component
function ConfettiBurst({ show, onDone }) {
  useEffect(() => {
    if (show) {
      const timeout = setTimeout(onDone, 3000);
      return () => clearTimeout(timeout);
    }
  }, [show]);

  if (!show) return null;

  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.5}s`,
    color: ['#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'][i % 5],
    size: `${6 + Math.random() * 8}px`
  }));

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 9999 }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          top: '-10px',
          left: p.left,
          width: p.size,
          height: p.size,
          background: p.color,
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          animation: `confettiFall 3s ${p.delay} ease-in forwards`,
        }} />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// Rest timer component
function RestTimerBanner({ seconds, onSkip }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(interval); onSkip(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  const pct = ((seconds - remaining) / seconds) * 100;

  return (
    <div style={{ position: 'fixed', bottom: '80px', left: '1rem', right: '1rem', background: '#111', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '16px', padding: '1rem 1.2rem', zIndex: 150, display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ position: 'relative', width: '48px', height: '48px', flexShrink: 0 }}>
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
          <circle cx="24" cy="24" r="20" fill="none" stroke="#06b6d4" strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 20}`}
            strokeDashoffset={`${2 * Math.PI * 20 * (1 - pct / 100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
        </svg>
        <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.85rem', fontWeight: 'bold', color: '#06b6d4' }}>{remaining}s</span>
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: '0 0 0.2rem 0', fontWeight: 'bold', color: 'white', fontSize: '0.9rem' }}>Descansando...</p>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Próxima série em {remaining}s</p>
      </div>
      <button onClick={onSkip} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '12px', padding: '0.5rem 0.8rem', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem' }}>
        Pular
      </button>
    </div>
  );
}

export function ActiveWorkoutPage() {
  const navigate = useNavigate();
  const [workoutId, setWorkoutId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [setsCount, setSetsCount] = useState(0);
  const [recordsCount, setRecordsCount] = useState(0);
  const [volume, setVolume] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const [exercises, setExercises] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [addExerciseModal, setAddExerciseModal] = useState(false);
  
  // Set recording
  const [recordingExercise, setRecordingExercise] = useState(null);
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(0);
  const [rir, setRir] = useState('0');
  const [previousBestE1rm, setPreviousBestE1rm] = useState(null);
  const [previousBestWeight, setPreviousBestWeight] = useState(null);
  const [previousBestReps, setPreviousBestReps] = useState(null);

  // PR celebration
  const [showConfetti, setShowConfetti] = useState(false);
  const [prMessage, setPrMessage] = useState('');
  const [lastPrData, setLastPrData] = useState(null);

  // Rest timer
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restDuration, setRestDuration] = useState(() => parseInt(localStorage.getItem('pokas_rest_duration') || '60'));
  const [showRestSettings, setShowRestSettings] = useState(false);

  // Templates
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  
  const e1rm = (weight > 0 && reps > 0) ? (weight * (1 + reps / 30)).toFixed(1) : 0;
  const isNewPR = previousBestE1rm !== null && parseFloat(e1rm) > parseFloat(previousBestE1rm);

  useEffect(() => {
    initWorkout();
    const interval = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  async function initWorkout() {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;

      const { data: existingWorkout } = await supabase
        .from('user_workouts')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'in_progress')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      let activeId = null;
      if (existingWorkout) {
        activeId = existingWorkout.id;
        const start = new Date(existingWorkout.started_at || existingWorkout.created_at).getTime();
        setElapsedTime(Math.floor((Date.now() - start) / 1000));
        setVolume(existingWorkout.volume_kg || 0);
        setRecordsCount(existingWorkout.prs_count || 0);
        // Count sets
        const { count } = await supabase
          .from('user_sets')
          .select('*', { count: 'exact', head: true })
          .eq('workout_exercise_id', activeId);
        setSetsCount(count || 0);
      } else {
        const { data: newWorkout, error } = await supabase
          .from('user_workouts')
          .insert([{ user_id: userId, status: 'in_progress', started_at: new Date().toISOString() }])
          .select()
          .single();
        if (error) throw error;
        activeId = newWorkout.id;
      }
      setWorkoutId(activeId);

      // Load active template if selected
      const activeTemplateJson = localStorage.getItem('pokas_active_template');
      if (activeTemplateJson) {
        try {
          const template = JSON.parse(activeTemplateJson);
          localStorage.removeItem('pokas_active_template');
          if (template.exercises && template.exercises.length > 0) {
            const toInsert = template.exercises.map(e => ({
              workout_id: activeId,
              exercise_id: e.id
            }));
            await supabase.from('workout_exercises').insert(toInsert);
          }
        } catch (err) {
          console.error('Error loading template:', err);
        }
      }

      await fetchWorkoutData(activeId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchWorkoutData(wId) {
    const { data: workoutExs, error: wxErr } = await supabase
      .from('workout_exercises')
      .select('*, user_exercises(*)')
      .eq('workout_id', wId);
    if (wxErr) console.error('workout_exercises error:', wxErr);
    setExercises(workoutExs || []);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      let query = supabase.from('user_exercises').select('*').order('name');
      if (userId) {
        query = query.or(`user_id.is.null,user_id.eq.${userId}`);
      } else {
        query = query.is('user_id', null);
      }
      const { data: catData, error: catErr } = await query;
      if (catErr) console.error('catalog error:', catErr);
      setCatalog(catData || []);
    } catch (err) {
      console.error('fetchCatalog error:', err);
    }
  }

  async function handleSelectExercise(ex) {
    setRecordingExercise(ex);
    setWeight(0); setReps(0); setRir('0');
    setPreviousBestE1rm(null); setPreviousBestWeight(null); setPreviousBestReps(null);

    // Fetch previous best E1RM for this exercise
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data: bestSets } = await supabase
        .from('user_sets')
        .select('weight, reps, e1rm, workout_exercises!inner(exercise_id, user_workouts!inner(user_id))')
        .eq('workout_exercises.exercise_id', ex.exercise_id || ex.id)
        .eq('workout_exercises.user_workouts.user_id', session?.user?.id)
        .order('e1rm', { ascending: false })
        .limit(1);

      if (bestSets && bestSets.length > 0) {
        setPreviousBestE1rm(bestSets[0].e1rm || 0);
        setPreviousBestWeight(bestSets[0].weight);
        setPreviousBestReps(bestSets[0].reps);
        // Pre-fill weight with previous best
        setWeight(bestSets[0].weight || 0);
        setReps(bestSets[0].reps || 0);
      }
    } catch (err) {
      console.error('fetchPreviousBest error:', err);
    }
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleAddExercise = async (exerciseId) => {
    if (!workoutId) return;
    // Check if already added
    const alreadyAdded = exercises.find(e => e.exercise_id === exerciseId);
    if (alreadyAdded) { setAddExerciseModal(false); return; }
    try {
      await supabase.from('workout_exercises').insert([{ workout_id: workoutId, exercise_id: exerciseId }]);
      setAddExerciseModal(false);
      setCatalogSearch('');
      fetchWorkoutData(workoutId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecordSet = async () => {
    if (!recordingExercise || weight <= 0 || reps <= 0) {
      alert('Preencha a carga e as repetições!');
      return;
    }
    try {
      const w = parseFloat(weight);
      const r = parseInt(reps);
      const calculatedE1rm = parseFloat((w * (1 + r / 30)).toFixed(1));
      const is_pr = previousBestE1rm === null || calculatedE1rm > parseFloat(previousBestE1rm);
      
      await supabase.from('user_sets').insert([{
        workout_exercise_id: recordingExercise.id,
        weight: w, reps: r,
        rir: parseInt(rir),
        e1rm: calculatedE1rm,
        is_pr: is_pr
      }]);
      
      const newVolume = volume + (w * r);
      const newPrs = recordsCount + (is_pr ? 1 : 0);
      
      await supabase.from('user_workouts').update({
        volume_kg: newVolume,
        prs_count: newPrs
      }).eq('id', workoutId);
      
      setVolume(newVolume);
      setRecordsCount(newPrs);
      setSetsCount(prev => prev + 1);

      if (is_pr) {
        setPrMessage(`🏆 RECORDE! ${calculatedE1rm} kg E1RM`);
        setLastPrData({ exerciseName: recordingExercise.user_exercises?.name, e1rm: calculatedE1rm, weight: w, reps: r });
        setShowConfetti(true);
      }

      setRecordingExercise(null);
      setWeight(0); setReps(0); setRir('0');
      setShowRestTimer(true);
      
    } catch (err) {
      console.error(err);
      alert('Erro ao registrar série: ' + err.message);
    }
  };

  const handleChangeRestDuration = (secs) => {
    setRestDuration(secs);
    localStorage.setItem('pokas_rest_duration', secs.toString());
    setShowRestSettings(false);
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim() || exercises.length === 0) return;
    const templates = JSON.parse(localStorage.getItem('pokas_templates') || '[]');
    templates.push({
      id: Date.now(),
      name: templateName.trim(),
      exercises: exercises.map(ex => ({
        id: ex.exercise_id,
        name: ex.user_exercises?.name
      }))
    });
    localStorage.setItem('pokas_templates', JSON.stringify(templates));
    setTemplateName('');
    setShowSaveTemplate(false);
    alert(`✅ Modelo "${templateName.trim()}" salvo!`);
  };

  const shareOnWhatsApp = (data) => {
    if (!data) return;
    const text = `🏆 Bati meu recorde no App Good!\n\n💪 Exercício: ${data.exerciseName}\n⚡ ${data.weight}kg × ${data.reps} reps\n📊 E1RM: ${data.e1rm} kg\n\nBatendo recordes todo dia! 🔥`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const copyPrToClipboard = (data) => {
    if (!data) return;
    const text = `🏆 Novo recorde! ${data.exerciseName}: ${data.weight}kg × ${data.reps} reps (E1RM: ${data.e1rm}kg)`;
    navigator.clipboard.writeText(text).then(() => alert('✅ Copiado para a área de transferência!'));
  };

  const finishWorkout = async () => {
    if (!workoutId) return;
    try {
      await supabase.from('user_workouts').update({
        status: 'completed',
        ended_at: new Date().toISOString()
      }).eq('id', workoutId);
      navigate('/pokas');
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCatalog = catalog.filter(ex => 
    ex.name.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  if (loading) return (
    <div className="container" style={{ paddingTop: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
      Carregando treino...
    </div>
  );

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '1.5rem', paddingBottom: '6rem' }}>
      
      <ConfettiBurst show={showConfetti} onDone={() => setShowConfetti(false)} />
      
      {/* PR Toast */}
      {showConfetti && prMessage && (
        <div className="animate-fade-in" style={{ position: 'fixed', top: '5rem', left: '50%', transform: 'translateX(-50%)', background: 'rgba(168,85,247,0.95)', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '25px', zIndex: 9998, fontWeight: 'bold', fontSize: '1rem', whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(168,85,247,0.4)' }}>
          {prMessage}
        </div>
      )}

      {showRestTimer && (
        <RestTimerBanner seconds={60} onSkip={() => setShowRestTimer(false)} />
      )}

      {/* Rest timer settings modal */}
      {showRestSettings && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ background: '#1a1a1a', borderRadius: '20px', padding: '1.5rem', width: '100%', maxWidth: '320px' }}>
            <h3 style={{ margin: '0 0 1rem 0', textAlign: 'center' }}>⏱️ Tempo de descanso</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1rem' }}>
              {[30, 60, 90, 120].map(s => (
                <button key={s} onClick={() => handleChangeRestDuration(s)} style={{ padding: '1rem', borderRadius: '14px', border: `2px solid ${restDuration === s ? '#a855f7' : 'rgba(255,255,255,0.1)'}`, background: restDuration === s ? 'rgba(168,85,247,0.15)' : 'transparent', color: restDuration === s ? '#e9d5ff' : 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
                  {s < 60 ? `${s}s` : `${s/60}min`}
                </button>
              ))}
            </div>
            <button onClick={() => setShowRestSettings(false)} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer' }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* PR Share overlay */}
      {showConfetti && lastPrData && (
        <div style={{ position: 'fixed', bottom: '90px', left: '1rem', right: '1rem', background: 'rgba(168,85,247,0.95)', borderRadius: '20px', padding: '1rem 1.2rem', zIndex: 9997, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: 'white', textAlign: 'center', fontSize: '1.1rem' }}>🏆 {prMessage}</p>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button onClick={() => shareOnWhatsApp(lastPrData)} style={{ flex: 1, padding: '0.7rem', background: '#25D366', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>📱 WhatsApp</button>
            <button onClick={() => copyPrToClipboard(lastPrData)} style={{ flex: 1, padding: '0.7rem', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>📋 Copiar</button>
            <button onClick={() => setShowConfetti(false)} style={{ padding: '0.7rem 0.9rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer' }}>✕</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', animation: 'pulse 1.5s infinite' }}></div>
            EM ANDAMENTO
          </div>
          <h1 style={{ margin: '0.2rem 0', fontSize: '2rem' }}>Treino</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{formatTime(elapsedTime)} • {setsCount} séries</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setShowRestSettings(true)} title={`Descanso: ${restDuration}s`} style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)', color: '#06b6d4', padding: '0.5rem 0.7rem', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}>
            ⏱️ {restDuration}s
          </button>
          {exercises.length > 0 && (
            <button onClick={() => setShowSaveTemplate(true)} title="Salvar modelo" style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', padding: '0.5rem 0.7rem', borderRadius: '12px', cursor: 'pointer', fontSize: '0.85rem' }}>
              💾
            </button>
          )}
          <button onClick={finishWorkout} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
            Encerrar
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', padding: '1.2rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'white' }}>{setsCount}</h2>
          <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>SÉRIES</p>
        </div>
        <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: recordsCount > 0 ? '#a855f7' : 'white' }}>{recordsCount}</h2>
          <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>PRs 🏆</p>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'white' }}>{volume.toFixed(0)}</h2>
          <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>KG VOLUME</p>
        </div>
      </div>

      <div style={{ border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px', padding: exercises.length > 0 ? '1rem' : '2rem', textAlign: 'center', minHeight: '150px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {exercises.length === 0 ? (
          <>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'white' }}>Nenhum exercício ainda</h3>
            <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '250px' }}>Adicione o primeiro exercício da sessão.</p>
          </>
        ) : (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1rem' }}>
            {exercises.map((ex) => (
              <div 
                key={ex.id} 
                onClick={() => handleSelectExercise(ex)}
                style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem 1.2rem', textAlign: 'left', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <h4 style={{ margin: 0, color: 'white' }}>{ex.user_exercises?.name}</h4>
                  <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Toque para registrar série</p>
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>›</span>
              </div>
            ))}
          </div>
        )}
        
        <button onClick={() => setAddExerciseModal(true)} style={{ background: 'white', color: 'black', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '25px', fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer' }}>
          + Adicionar exercício
        </button>
      </div>

      {/* Add Exercise Modal */}
      {addExerciseModal && (
        <div className="animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg-dark)', zIndex: 100, display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Adicionar ao treino</h2>
            <button onClick={() => { setAddExerciseModal(false); setCatalogSearch(''); }} style={{ background: 'none', border: 'none', color: 'white' }}><X size={24} /></button>
          </div>
          <input
            type="text"
            placeholder="Buscar exercício..."
            value={catalogSearch}
            onChange={e => setCatalogSearch(e.target.value)}
            autoFocus
            style={{ padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '1rem', marginBottom: '1rem' }}
          />
          <div style={{ overflowY: 'auto', flex: 1, paddingBottom: '2rem' }}>
            {filteredCatalog.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>Nenhum exercício encontrado.</p>
            ) : filteredCatalog.map(catEx => (
              <div 
                key={catEx.id}
                onClick={() => handleAddExercise(catEx.id)}
                style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <h4 style={{ margin: 0, color: 'white' }}>{catEx.name}</h4>
                  <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{catEx.muscle_group} • {catEx.equipment}</p>
                </div>
                <span style={{ color: 'var(--text-secondary)' }}>+</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Record Set Modal */}
      {recordingExercise && (
        <div className="animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%', background: '#111', borderTopLeftRadius: '28px', borderTopRightRadius: '28px', padding: '1.5rem', maxHeight: '95vh', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.2)' }}></div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.3rem' }}>{recordingExercise.user_exercises?.name}</h2>
              <button onClick={() => setRecordingExercise(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '34px', height: '34px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} />
              </button>
            </div>

            {/* Target suggestion box */}
            <div style={{ background: previousBestE1rm ? 'rgba(168, 85, 247, 0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${previousBestE1rm ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255,255,255,0.05)'}`, padding: '1rem', borderRadius: '14px', marginBottom: '1.5rem', display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
              <div style={{ background: previousBestE1rm ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255,255,255,0.05)', padding: '0.6rem', borderRadius: '10px', flexShrink: 0 }}>
                <Trophy size={18} color={previousBestE1rm ? '#c084fc' : 'var(--text-secondary)'} />
              </div>
              <div>
                {previousBestE1rm ? (
                  <>
                    <p style={{ margin: 0, color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      Alvo: superar {previousBestE1rm} kg E1RM
                    </p>
                    <p style={{ margin: '0.2rem 0 0 0', color: '#e9d5ff', fontSize: '0.8rem', lineHeight: '1.3' }}>
                      Último PR: {previousBestWeight}kg × {previousBestReps} reps — tente aumentar a carga ou reps!
                    </p>
                  </>
                ) : (
                  <>
                    <p style={{ margin: 0, color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Alvo: 6 a 10 reps</p>
                    <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Primeira vez! Registre pra cravar sua linha de base.</p>
                  </>
                )}
              </div>
            </div>

            {/* Weight + Reps */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1rem', textAlign: 'center' }}>
                <p style={{ margin: '0 0 0.8rem 0', fontSize: '0.7rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>CARGA (kg)</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}>
                  <button onClick={() => setWeight(Math.max(0, weight - 1.25))} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '10px', width: '36px', height: '36px', color: 'white', fontSize: '1.3rem', cursor: 'pointer' }}>-</button>
                  <div>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{weight}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}> kg</span>
                  </div>
                  <button onClick={() => setWeight(weight + 1.25)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '10px', width: '36px', height: '36px', color: 'white', fontSize: '1.3rem', cursor: 'pointer' }}>+</button>
                </div>
                <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                  {[0.5, 1.25, 2.5, 5].map(v => (
                    <button key={v} onClick={() => setWeight(w => w + v)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', padding: '0.2rem 0.4rem', color: 'var(--text-secondary)', fontSize: '0.65rem', cursor: 'pointer' }}>+{v}</button>
                  ))}
                </div>
              </div>
              
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1rem', textAlign: 'center' }}>
                <p style={{ margin: '0 0 0.8rem 0', fontSize: '0.7rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>REPS</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}>
                  <button onClick={() => setReps(Math.max(0, reps - 1))} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '10px', width: '36px', height: '36px', color: 'white', fontSize: '1.3rem', cursor: 'pointer' }}>-</button>
                  <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{reps}</span>
                  <button onClick={() => setReps(reps + 1)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '10px', width: '36px', height: '36px', color: 'white', fontSize: '1.3rem', cursor: 'pointer' }}>+</button>
                </div>
              </div>
            </div>

            {/* RIR */}
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>RIR — QUANTAS REPS SOBRARAM</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {['0', '1', '2', '3+'].map(val => (
                <button 
                  key={val} onClick={() => setRir(val)}
                  style={{ flex: 1, padding: '0.8rem 0', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)', background: rir === val ? 'white' : 'rgba(255,255,255,0.03)', color: rir === val ? 'black' : 'white', fontWeight: 'bold', transition: 'all 0.2s', cursor: 'pointer' }}
                >
                  {val}
                </button>
              ))}
            </div>

            {/* E1RM preview */}
            <div style={{ background: isNewPR ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.03)', borderRadius: '14px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', border: `1px solid ${isNewPR ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.05)'}`, transition: 'all 0.3s' }}>
              <div>
                <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.7rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>E1RM ESTIMADO</p>
                <h3 style={{ margin: 0, fontSize: '1.5rem', color: isNewPR ? '#c084fc' : 'white' }}>{e1rm} kg</h3>
              </div>
              {isNewPR && (
                <div style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.4)', padding: '0.5rem 1rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Trophy size={16} color="#c084fc" />
                  <span style={{ color: '#e9d5ff', fontSize: '0.85rem', fontWeight: 'bold' }}>Novo PR!</span>
                </div>
              )}
              {!isNewPR && previousBestE1rm && e1rm > 0 && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  vs {previousBestE1rm} kg
                </span>
              )}
            </div>

            <button onClick={handleRecordSet} style={{ width: '100%', padding: '1.2rem', background: isNewPR ? '#a855f7' : '#06b6d4', color: 'white', border: 'none', borderRadius: '16px', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', transition: 'background 0.3s', cursor: 'pointer' }}>
              <Zap size={20} fill="white" /> {isNewPR ? 'Registrar RECORDE! 🏆' : 'Registrar série'}
            </button>

          </div>
        </div>
      )}

      {/* Save Template Modal */}
      {showSaveTemplate && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ background: '#1a1a1a', borderRadius: '20px', padding: '1.5rem', width: '100%', maxWidth: '340px' }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>💾 Salvar modelo de treino</h3>
            <p style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Exercícios: {exercises.map(e => e.user_exercises?.name).join(', ')}
            </p>
            <input
              type="text"
              placeholder="Nome do modelo (ex: Peito + Tríceps)"
              value={templateName}
              onChange={e => setTemplateName(e.target.value)}
              style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.95rem', marginBottom: '1rem', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button onClick={() => setShowSaveTemplate(false)} style={{ flex: 1, padding: '0.9rem', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleSaveTemplate} style={{ flex: 2, padding: '0.9rem', background: '#a855f7', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>✅ Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
