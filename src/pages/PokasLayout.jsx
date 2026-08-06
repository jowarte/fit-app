import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Dumbbell, Zap, Clock, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { StudentDashboard } from '../pages/StudentDashboard';
import { CatalogPage } from '../pages/CatalogPage';
import { ActiveWorkoutPage } from '../pages/ActiveWorkoutPage';
import { checkUserPermission, applySimulator } from '../lib/permissions';
import { Lock } from 'lucide-react';

function PokasNav() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      background: '#111',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      height: '70px',
      zIndex: 200,
      padding: '0 1rem'
    }}>
      <Link to="/pokas" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
        <Home size={24} color={path === '/pokas' ? 'white' : '#555'} />
        <span style={{ fontSize: '0.6rem', color: path === '/pokas' ? 'white' : '#555' }}>Início</span>
      </Link>
      <Link to="/pokas/exercicios" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
        <Dumbbell size={24} color={path === '/pokas/exercicios' ? 'white' : '#555'} />
        <span style={{ fontSize: '0.6rem', color: path === '/pokas/exercicios' ? 'white' : '#555' }}>Exercícios</span>
      </Link>

      {/* Central floating button */}
      <Link to="/pokas/treinar" style={{
        background: 'white',
        borderRadius: '50%',
        width: '54px',
        height: '54px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: 'translateY(-16px)',
        boxShadow: '0 6px 20px rgba(168, 85, 247, 0.4)',
        flexShrink: 0,
        textDecoration: 'none'
      }}>
        <Zap size={26} color="black" fill="black" />
      </Link>

      <Link to="/pokas/historico" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
        <Clock size={24} color={path === '/pokas/historico' ? 'white' : '#555'} />
        <span style={{ fontSize: '0.6rem', color: path === '/pokas/historico' ? 'white' : '#555' }}>Histórico</span>
      </Link>
      <Link to="/pokas/perfil" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
        <User size={24} color={path === '/pokas/perfil' ? 'white' : '#555'} />
        <span style={{ fontSize: '0.6rem', color: path === '/pokas/perfil' ? 'white' : '#555' }}>Perfil</span>
      </Link>
    </nav>
  );
}

// Placeholder pages for Histórico and Perfil
function PokasHistoricoPage() {
  const [workouts, setWorkouts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from('user_workouts')
        .select(`
          *,
          workout_exercises(
            *,
            user_exercises(name, muscle_group),
            user_sets(weight, reps, e1rm, is_pr)
          )
        `)
        .eq('user_id', session.user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setWorkouts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const formatDuration = (start, end) => {
    if (!start || !end) return '--';
    const mins = Math.round((new Date(end) - new Date(start)) / 60000);
    return mins < 60 ? `${mins}min` : `${Math.floor(mins/60)}h ${mins%60}min`;
  };

  if (loading) return (
    <div className="container" style={{ paddingTop: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
      Carregando histórico...
    </div>
  );

  // Calendar logic
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const trainedDays = new Set(workouts.map(w => new Date(w.created_at).getDate()));
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '6rem' }}>
      <h2 style={{ margin: '0 0 0.3rem 0' }}>Histórico</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 1.5rem 0' }}>{workouts.length} treino{workouts.length !== 1 ? 's' : ''} concluído{workouts.length !== 1 ? 's' : ''}</p>

      {/* Monthly Calendar */}
      <div className="glass-card" style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4 style={{ margin: 0, color: 'white', fontSize: '0.95rem' }}>📅 {monthNames[month]} {year}</h4>
          <span style={{ fontSize: '0.75rem', color: '#a855f7', fontWeight: 'bold' }}>{trainedDays.size} dias treinados</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '0.5rem' }}>
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
            <span key={i} style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{d}</span>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const isTrained = trainedDays.has(day);
            const isToday = day === now.getDate();
            return (
              <div key={day} style={{
                height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '8px', fontSize: '0.8rem', fontWeight: isTrained || isToday ? 'bold' : 'normal',
                background: isTrained ? 'rgba(168,85,247,0.3)' : isToday ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.02)',
                border: isTrained ? '1px solid #a855f7' : isToday ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
                color: isTrained ? '#e9d5ff' : 'white'
              }}>
                {day}
              </div>
            );
          })}
        </div>
      </div>

      {workouts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏋️</div>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Nenhum treino ainda</h3>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Clique no ⚡ para começar seu primeiro treino!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {workouts.map(w => {
            const totalSets = w.workout_exercises?.reduce((acc, ex) => acc + (ex.user_sets?.length || 0), 0) || 0;
            const prs = w.prs_count || 0;
            return (
              <div key={w.id} className="glass-card" style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.2rem 0', color: 'white' }}>
                      {new Date(w.created_at).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {formatDuration(w.started_at || w.created_at, w.ended_at)} • {totalSets} séries
                    </p>
                  </div>
                  {prs > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', color: '#c084fc', padding: '0.3rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      🏆 {prs} PR{prs > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '1rem', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', marginBottom: '0.8rem' }}>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.6rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>VOLUME</p>
                    <p style={{ margin: 0, fontWeight: 'bold', color: 'white' }}>{(w.volume_kg || 0).toFixed(0)} kg</p>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.6rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>SÉRIES</p>
                    <p style={{ margin: 0, fontWeight: 'bold', color: 'white' }}>{totalSets}</p>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.6rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>EXERCÍCIOS</p>
                    <p style={{ margin: 0, fontWeight: 'bold', color: 'white' }}>{w.workout_exercises?.length || 0}</p>
                  </div>
                </div>
                {w.workout_exercises && w.workout_exercises.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {w.workout_exercises.map((ex, i) => (
                      <span key={i} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {ex.user_exercises?.name || 'Exercício'}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PokasPerfilPage() {
  const [profile, setProfile] = React.useState(null);
  const [topPRs, setTopPRs] = React.useState([]);
  const [totalWorkouts, setTotalWorkouts] = React.useState(0);
  const [totalVolume, setTotalVolume] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [reminders, setReminders] = React.useState(() => JSON.parse(localStorage.getItem('pokas_reminders') || '["Seg", "Qua", "Sex"]'));

  const toggleDay = (d) => {
    const next = reminders.includes(d) ? reminders.filter(x => x !== d) : [...reminders, d];
    setReminders(next);
    localStorage.setItem('pokas_reminders', JSON.stringify(next));
  };

  React.useEffect(() => { fetchProfile(); }, []);

  async function fetchProfile() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const userId = session.user.id;

      const { data: p } = await supabase.from('profiles').select('*').eq('id', userId).single();
      setProfile(p);

      const { data: workouts } = await supabase
        .from('user_workouts')
        .select('volume_kg, prs_count, workout_exercises(exercise_id, user_sets(weight, reps, e1rm, is_pr))')
        .eq('user_id', userId)
        .eq('status', 'completed');

      if (workouts) {
        setTotalWorkouts(workouts.length);
        setTotalVolume(Math.round(workouts.reduce((a, w) => a + (w.volume_kg || 0), 0)));

        // Build top PRs
        const exerciseBest = {};
        workouts.forEach(w => {
          w.workout_exercises?.forEach(ex => {
            ex.user_sets?.filter(s => s.is_pr).forEach(s => {
              if (!exerciseBest[ex.exercise_id] || s.e1rm > exerciseBest[ex.exercise_id].e1rm) {
                exerciseBest[ex.exercise_id] = { e1rm: s.e1rm, weight: s.weight, reps: s.reps };
              }
            });
          });
        });

        const topIds = Object.keys(exerciseBest).slice(0, 5);
        if (topIds.length > 0) {
          const { data: names } = await supabase.from('user_exercises').select('id, name').in('id', topIds);
          const prs = topIds
            .map(id => ({ id, name: names?.find(e => e.id === id)?.name || id, ...exerciseBest[id] }))
            .sort((a, b) => b.e1rm - a.e1rm);
          setTopPRs(prs);
        }
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  if (loading) return <div className="container" style={{ paddingTop: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Carregando perfil...</div>;

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '6rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
          {(profile?.name || 'A')[0].toUpperCase()}
        </div>
        <div>
          <h2 style={{ margin: 0 }}>{profile?.name || 'Aluno'}</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{profile?.email || ''}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '1.2rem', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 0.2rem 0', color: 'white', fontSize: '2rem' }}>{totalWorkouts}</h2>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>TREINOS</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '1.2rem', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 0.2rem 0', color: 'white', fontSize: '2rem' }}>{totalVolume}</h2>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>KG TOTAL</p>
        </div>
      </div>

      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>🏆 Seus maiores PRs</h3>
      {topPRs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px', color: 'var(--text-secondary)' }}>
          Nenhum PR registrado ainda. Faça seu primeiro treino!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          {topPRs.map((pr, i) => (
            <div key={pr.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.2rem', width: '28px', textAlign: 'center' }}>{['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</span>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 0.2rem 0', color: 'white', fontSize: '0.95rem' }}>{pr.name}</h4>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{pr.weight}kg × {pr.reps} reps</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, color: '#a855f7', fontWeight: 'bold', fontSize: '1rem' }}>{(pr.e1rm || 0).toFixed(1)} kg</p>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.7rem' }}>E1RM</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Workout Reminders Section */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.2rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
          <div>
            <h4 style={{ margin: '0 0 0.2rem 0', color: 'white' }}>🔔 Lembretes de treino</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Dias que você pretende treinar</p>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold' }}>{reminders.length} dias/semana</span>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'space-between' }}>
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => {
            const active = reminders.includes(day);
            return (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                style={{
                  flex: 1, padding: '0.6rem 0', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer',
                  border: active ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
                  background: active ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.02)',
                  color: active ? '#34d399' : 'var(--text-secondary)'
                }}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      <button onClick={() => supabase.auth.signOut()} style={{ width: '100%', marginTop: '2rem', padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
        Sair da conta
      </button>
    </div>
  );
}

export function PokasLayout() {
  const [hasAccess, setHasAccess] = React.useState(null);
  const [userProfile, setUserProfile] = React.useState(null);

  React.useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (profile) {
          const simProfile = applySimulator(profile);
          setUserProfile(simProfile);
          setHasAccess(true); // O layout principal deve ser acessível por todos
        }
      } else {
        setHasAccess(false);
      }
    }
    check();
  }, []);

  if (hasAccess === null) {
    return <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Carregando...</div>;
  }

  if (!hasAccess) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ position: 'fixed', top: '0.8rem', left: '1rem', zIndex: 201 }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', background: 'rgba(168, 85, 247, 0.25)', border: '1px solid rgba(168, 85, 247, 0.5)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem' }}>← Voltar</Link>
        </div>
        <div className="glass-card animate-fade-in" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '2.5rem', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
          <Lock size={56} color="#a855f7" style={{ marginBottom: '1.5rem', marginLeft: 'auto', marginRight: 'auto' }} />
          <h2 style={{ color: 'white', marginBottom: '1rem' }}>Acesso Restrito</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
            Você precisa estar logado para acessar esta área.
          </p>
          <Link to="/login" className="btn btn-primary" style={{ width: '100%', background: 'linear-gradient(135deg, #a855f7, #6b21a8)', border: 'none', display: 'inline-block', padding: '1rem', textDecoration: 'none' }}>
            Fazer Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', position: 'relative' }}>
      {/* Back button to main app */}
      <div style={{ position: 'fixed', top: '0.8rem', left: '1rem', zIndex: 201 }}>
        <Link to="/" style={{ 
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          color: 'white', textDecoration: 'none',
          background: 'rgba(168, 85, 247, 0.25)',
          border: '1px solid rgba(168, 85, 247, 0.5)',
          padding: '0.5rem 1rem',
          borderRadius: '20px', fontSize: '0.85rem',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(168, 85, 247, 0.2)'
        }}>
          ← App Good
        </Link>
      </div>

      <div style={{ paddingTop: '3.5rem' }}>
        <Routes>
          <Route index element={<StudentDashboard />} />
          <Route path="exercicios" element={<CatalogPage />} />
          <Route path="treinar" element={<ActiveWorkoutPage />} />
          <Route path="historico" element={<PokasHistoricoPage />} />
          <Route path="perfil" element={<PokasPerfilPage />} />
        </Routes>
      </div>

      <PokasNav />
    </div>
  );
}
