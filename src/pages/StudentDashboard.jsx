import React, { useState, useEffect } from 'react';
import { Play, Trophy, Activity, Zap, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PokasHelpPage } from './PokasHelpPage';

export function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prsWeek, setPrsWeek] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [volumeWeek, setVolumeWeek] = useState(0);
  const [prRate, setPrRate] = useState(0);
  const [weekDots, setWeekDots] = useState([false, false, false, false, false, false, false]);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [targetExercises, setTargetExercises] = useState([]);
  const [showHelp, setShowHelp] = useState(false);
  const [templates, setTemplates] = useState(() => JSON.parse(localStorage.getItem('pokas_templates') || '[]'));
  const navigate = useNavigate();

  const startWithTemplate = (tmpl) => {
    localStorage.setItem('pokas_active_template', JSON.stringify(tmpl));
    navigate('treinar');
  };

  const deleteTemplate = (id) => {
    const next = templates.filter(t => t.id !== id);
    setTemplates(next);
    localStorage.setItem('pokas_templates', JSON.stringify(next));
  };

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const userId = session.user.id;

      // Get profile
      const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', userId).single();
      setProfile(userProfile);

      // Get last 14 days workouts with sets
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
      const { data: recentWorkouts } = await supabase
        .from('user_workouts')
        .select(`
          *,
          workout_exercises(
            exercise_id,
            user_sets(is_pr, e1rm, weight, reps)
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'completed')
        .gte('created_at', twoWeeksAgo)
        .order('created_at', { ascending: false });

      if (recentWorkouts && recentWorkouts.length > 0) {
        setTotalWorkouts(recentWorkouts.length);

        // Calculate PR rate
        let totalSets = 0, prSets = 0;
        let weekVolume = 0;
        let weekPrs = 0;

        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        recentWorkouts.forEach(w => {
          const isThisWeek = new Date(w.created_at) >= oneWeekAgo;
          w.workout_exercises?.forEach(ex => {
            ex.user_sets?.forEach(s => {
              totalSets++;
              if (s.is_pr) prSets++;
              if (isThisWeek) {
                weekPrs += s.is_pr ? 1 : 0;
              }
            });
          });
          if (isThisWeek) weekVolume += w.volume_kg || 0;
        });

        setPrsWeek(weekPrs);
        setVolumeWeek(Math.round(weekVolume));
        setPrRate(totalSets > 0 ? Math.round((prSets / totalSets) * 100) : 0);

        // Calculate streak (consecutive days)
        const workoutDays = new Set(
          recentWorkouts.map(w => new Date(w.created_at).toDateString())
        );
        let streak = 0;
        let checkDate = new Date();
        for (let i = 0; i < 14; i++) {
          if (workoutDays.has(checkDate.toDateString())) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            if (i > 0) break; // Only break after first day (today may not have workout yet)
            checkDate.setDate(checkDate.getDate() - 1);
          }
        }
        setStreakDays(streak);

        // Week dots (last 7 days Mon-Sun)
        const dots = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return workoutDays.has(d.toDateString());
        });
        setWeekDots(dots);

        // Get best PRs by exercise as "targets for next workout"
        const exerciseMap = {};
        recentWorkouts.forEach(w => {
          w.workout_exercises?.forEach(ex => {
            ex.user_sets?.forEach(s => {
              if (!exerciseMap[ex.exercise_id] || s.e1rm > exerciseMap[ex.exercise_id].e1rm) {
                exerciseMap[ex.exercise_id] = { e1rm: s.e1rm, weight: s.weight, reps: s.reps };
              }
            });
          });
        });

        // Fetch names
        const exerciseIds = Object.keys(exerciseMap).slice(0, 3);
        if (exerciseIds.length > 0) {
          const { data: exNames } = await supabase
            .from('user_exercises')
            .select('id, name')
            .in('id', exerciseIds);

          const targets = exerciseIds.map(id => ({
            id,
            name: exNames?.find(e => e.id === id)?.name || 'Exercício',
            bestE1rm: exerciseMap[id].e1rm,
            bestWeight: exerciseMap[id].weight,
            bestReps: exerciseMap[id].reps,
            targetWeight: (exerciseMap[id].weight + 2.5).toFixed(1)
          }));
          setTargetExercises(targets);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const dayLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const circumference = 2 * Math.PI * 20;

  if (loading) {
    return <div className="container" style={{ paddingTop: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Carregando...</div>;
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '6rem' }}>

      {showHelp && <PokasHelpPage onClose={() => setShowHelp(false)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
        <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Olá, {profile?.name?.split(' ')[0] || 'Aluno'} 👋</h1>
        <button
          onClick={() => setShowHelp(true)}
          title="Como usar"
          style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 'bold', flexShrink: 0 }}
        >
          ?
        </button>
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 1.5rem 0' }}>
        {totalWorkouts === 0 ? 'Nenhum treino registrado ainda' : `${totalWorkouts} treino${totalWorkouts > 1 ? 's' : ''} nos últimos 14 dias`}
      </p>

      {/* PR Rate Card */}
      <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Taxa de recorde</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>últimos 14 dias</p>
          </div>
          <div style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '0.3rem 0.7rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Trophy size={14} color="#a855f7" />
            <span style={{ fontSize: '0.75rem', color: '#e9d5ff', fontWeight: 'bold' }}>{prsWeek} PR na semana</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Circular progress */}
          <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle cx="40" cy="40" r="32" fill="none"
                stroke={prRate > 60 ? '#10b981' : prRate > 30 ? '#f59e0b' : '#a855f7'}
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 32}`}
                strokeDashoffset={`${2 * Math.PI * 32 * (1 - prRate / 100)}`}
                strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white' }}>{prRate}</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', display: 'block' }}>%</span>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            {prRate === 0 ? (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
                Registre a primeira série pra começar a medir.
              </p>
            ) : (
              <p style={{ fontSize: '0.9rem', color: 'white', lineHeight: '1.4', margin: '0 0 0.5rem 0' }}>
                {prRate >= 70 ? '🔥 Semana incrível!' : prRate >= 40 ? '💪 Boa evolução!' : '📈 Continue progredindo!'}
              </p>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
              {weekDots.map((active, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: active ? '#a855f7' : 'rgba(255,255,255,0.15)' }}></div>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>{dayLabels[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
            <Activity size={16} color="#fbbf24" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sequência</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: streakDays > 0 ? '#fbbf24' : 'white', marginLeft: 'auto', paddingRight: '1rem' }}>
              {streakDays} {streakDays === 1 ? 'dia' : 'dias'}
            </span>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', paddingLeft: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Volume 7d</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'white', marginLeft: 'auto' }}>{volumeWeek} kg</span>
          </div>
        </div>
      </div>

      {/* Start Workout Button */}
      <Link to="treinar" className="btn" style={{ 
        width: '100%', background: 'white', color: 'black', 
        padding: '1rem', borderRadius: '14px', 
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        gap: '0.5rem', fontWeight: 'bold', fontSize: '1.05rem',
        marginBottom: '1.5rem', textDecoration: 'none'
      }}>
        <Zap size={20} fill="black" /> Iniciar treino livre
      </Link>

      {/* Saved Templates */}
      {templates.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>📋 Meus Modelos</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{templates.length} salvo{templates.length > 1 ? 's' : ''}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {templates.map(tmpl => (
              <div key={tmpl.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1rem 1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.2rem 0', color: 'white', fontSize: '0.95rem' }}>{tmpl.name}</h4>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    {tmpl.exercises?.map(e => e.name).join(', ')}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button onClick={() => startWithTemplate(tmpl)} style={{ padding: '0.6rem 1rem', background: '#a855f7', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                    ⚡ Usar
                  </button>
                  <button onClick={() => deleteTemplate(tmpl.id)} style={{ padding: '0.6rem', background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: '10px', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Targets for next workout */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Alvos do próximo treino</h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>baseado nos seus PRs</span>
      </div>
      
      {targetExercises.length === 0 ? (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)', background: 'transparent' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Faça seu primeiro treino para ver seus alvos aqui!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          {targetExercises.map(t => (
            <div key={t.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '1rem 1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 0.2rem 0', color: 'white', fontSize: '0.95rem' }}>{t.name}</h4>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>PR: {t.bestWeight}kg × {t.bestReps} reps</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '0 0 0.1rem 0', color: '#a855f7', fontWeight: 'bold', fontSize: '0.95rem' }}>{t.targetWeight} kg</p>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.7rem' }}>alvo sugerido</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
