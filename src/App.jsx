import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Dumbbell, Home, Trophy, Settings, Play, Plus, Activity, Check, Copy, X, MessageCircle, Zap, Clock, User, Folder, ArrowLeft, Trash2, Megaphone } from 'lucide-react';
import { VideoPlayer } from './components/VideoPlayer';
import { RestTimer } from './components/RestTimer';
import { WorkoutBuilder } from './pages/WorkoutBuilder';
import { CategoriesPage } from './pages/CategoriesPage';
import { AuthPage } from './pages/AuthPage';
import { supabase } from './lib/supabase';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminExercises } from './pages/admin/AdminExercises';
import { AdminPlans } from './pages/admin/AdminPlans';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminWhatsApp } from './pages/admin/AdminWhatsApp';
import { AdminSalesLink } from './pages/admin/AdminSalesLink';
import { AdminClients } from './pages/admin/AdminClients';
import { AdminNotifications } from './pages/admin/AdminNotifications';
import { AdminAnnouncements } from './pages/admin/AdminAnnouncements';
import { AnnouncementsModal } from './components/AnnouncementsModal';
import { AdminTeam } from './pages/admin/AdminTeam';
import { ConfigPage } from './pages/ConfigPage';
import { SalesPage } from './pages/SalesPage';
import { ConquistasPage } from './pages/ConquistasPage';
import { ConfettiCelebration } from './components/ConfettiCelebration';
import { processWorkoutCompletion } from './lib/gamification';
import { OnboardingModal } from './components/OnboardingModal';
import { applySimulator } from './lib/permissions';
import { NotificationCenter } from './components/NotificationCenter';
import { InstallPrompt } from './components/InstallPrompt';
import { CatalogPage } from './pages/CatalogPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { ActiveWorkoutPage } from './pages/ActiveWorkoutPage';
import { PokasLayout } from './pages/PokasLayout';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import './App.css'; // Limpar o App.css se existir, usando apenas index.css

function ProtectedRoute({ session, children }) {
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function Navbar({ session }) {
  const location = useLocation();
  const path = location.pathname;

  if (!session || path.startsWith('/admin') || path === '/planos' || path === '/login' || path === '/reset-password' || path.startsWith('/pokas')) {
    return null;
  }

  return (
    <nav className="bottom-nav">
      <Link to="/" className={`nav-item ${path === '/' ? 'active' : ''}`}>
        <Home size={24} />
        <span>Início</span>
      </Link>
      <Link to="/treinos" className={`nav-item ${path === '/treinos' ? 'active' : ''}`}>
        <Dumbbell size={24} />
        <span>Exercícios</span>
      </Link>
      <Link to="/conquistas" className={`nav-item ${path === '/conquistas' ? 'active' : ''}`}>
        <Trophy size={24} />
        <span>Conquistas</span>
      </Link>
      <Link to="/config" className={`nav-item ${path === '/config' ? 'active' : ''}`}>
        <MessageCircle size={24} color="#25D366" />
        <span style={{ color: path === '/config' ? '#25D366' : 'inherit' }}>Lembretes</span>
      </Link>
      <Link to="/pokas" className={`nav-item ${path === '/pokas' ? 'active' : ''}`}>
        <Zap size={24} color="#a855f7" />
        <span style={{ color: path === '/pokas' ? '#a855f7' : 'inherit', fontSize: '0.65rem' }}>Treino Avançado</span>
      </Link>
    </nav>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const [todayRoutine, setTodayRoutine] = React.useState(null);
  const [loadingRoutine, setLoadingRoutine] = React.useState(true);
  const [weeklyCompleted, setWeeklyCompleted] = React.useState(0);
  const [weeklyTotal, setWeeklyTotal] = React.useState(0);
  
  // States para o histórico detalhado
  const [weeklyLogs, setWeeklyLogs] = React.useState([]);
  const [historyModalOpen, setHistoryModalOpen] = React.useState(false);
  const [announcementsModalOpen, setAnnouncementsModalOpen] = React.useState(false);
  
  // States para Onboarding pós-cadastro
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState(null);
  
  const daysMap = {
    0: 'Domingo', 1: 'Segunda-feira', 2: 'Terça-feira', 3: 'Quarta-feira',
    4: 'Quinta-feira', 5: 'Sexta-feira', 6: 'Sábado'
  };
  const todayName = daysMap[new Date().getDay()];

  function getWeekString(d) {
    const date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    const weekNumber = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    return `${date.getFullYear()}-W${weekNumber}`;
  }

  React.useEffect(() => {
    async function fetchData() {
      try {
        setLoadingRoutine(true);
        
        // Verifica onboarding do usuário
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          if (profile) {
            setUserProfile(applySimulator(profile));
            if (!profile.fitness_goal || !profile.experience_level || !profile.workout_location) {
              setShowOnboarding(true);
            }
          }
        }

        const { data, error } = await supabase.from('routines').select('*, routine_exercises(*)');
        if (error) throw error;
        
        if (data) {
          const today = data.find(r => r.day_of_week === todayName);
          setTodayRoutine(today || null);
          setWeeklyTotal(data.length);
        }
        
        const currentWeekStr = getWeekString(new Date());
        const storedLogs = JSON.parse(localStorage.getItem('workout_logs') || '{}');
        const currentLogs = storedLogs[currentWeekStr];
        
        if (Array.isArray(currentLogs)) {
          setWeeklyCompleted(currentLogs.length);
          setWeeklyLogs(currentLogs);
        } else {
          setWeeklyCompleted(Number(currentLogs) || 0);
          setWeeklyLogs([]);
        }
        
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingRoutine(false);
      }
    }
    fetchData();
  }, [todayName]);

  return (
    <>
      {showOnboarding && userProfile && (
        <OnboardingModal 
          userId={userProfile.id} 
          userName={userProfile.name} 
          onComplete={() => setShowOnboarding(false)} 
        />
      )}
      <section className="hero-section">
        <img src="/cover.png" alt="Fitness Cover" className="hero-bg" />
        <div className="hero-overlay"></div>
        <div className="container animate-fade-in" style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ marginBottom: '8px' }}>
            Transforme seu <br />
            <span className="gradient-text">Potencial</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Seu treino, suas regras. Em qualquer lugar.
          </p>
        </div>
      </section>

      <div className="container" style={{ marginTop: '-40px', position: 'relative', zIndex: 10 }}>
        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3>Treino de Hoje</h3>
              {loadingRoutine ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Buscando...</p>
              ) : todayRoutine ? (
                <p style={{ color: '#00ff88', fontSize: '0.9rem', fontWeight: '500' }}>
                  {todayRoutine.name.includes('|') ? todayRoutine.name.split('|').slice(1).join('|') : todayRoutine.name} • {todayRoutine.routine_exercises?.length || 0} ex.
                </p>
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Nenhum treino para {todayName.toLowerCase()}</p>
              )}
            </div>
            <Link to="/treinos" className="btn btn-primary" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center' }}>
              <Play size={20} fill="black" />
            </Link>
          </div>
          
          <div 
            onClick={() => setHistoryModalOpen(true)}
            style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <Activity color="var(--primary-color)" size={32} />
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '1rem', margin: '0 0 0.2rem 0' }}>Série Semanal</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>{weeklyCompleted} / {weeklyTotal || 4} treinos concluídos</p>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Ver Detalhes</div>
          </div>
        </div>

        {/* Banner/Card de Anúncios e E-books para os alunos */}
        <div 
          onClick={() => setAnnouncementsModalOpen(true)}
          className="glass-card animate-fade-in"
          style={{
            animationDelay: '0.3s',
            marginTop: '1rem',
            marginBottom: '1rem',
            padding: '1.25rem',
            background: 'linear-gradient(135deg, rgba(0, 210, 255, 0.1), rgba(168, 85, 247, 0.1))',
            border: '1px solid rgba(0, 210, 255, 0.3)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 20px rgba(0, 210, 255, 0.1)'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'var(--primary-color)', padding: '0.8rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Megaphone size={24} color="#000" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'white' }}>Mural de Anúncios & E-books</h4>
                <span style={{ background: '#00ff88', color: '#000', fontSize: '0.65rem', fontWeight: 'bold', padding: '0.15rem 0.5rem', borderRadius: '10px' }}>NOVO</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Avisos importantes, vídeos e materiais exclusivos em PDF
              </p>
            </div>
          </div>
          <span style={{ color: 'var(--primary-color)', fontSize: '1.2rem', fontWeight: 'bold' }}>➔</span>
        </div>

        <div className="actions-grid animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <Link to="/montar-treino" className="action-box" style={{ textDecoration: 'none' }}>
            <Plus size={32} />
            <h4>Montar Treino</h4>
            <p>Crie sua rotina</p>
          </Link>
          <Link to="/categorias" className="action-box" style={{ textDecoration: 'none' }}>
            <Dumbbell size={32} />
            <h4>Categorias de Treinos</h4>
            <p>Explore por foco</p>
          </Link>
        </div>
      </div>

      {/* Modal de Anúncios e Entregáveis */}
      <AnnouncementsModal 
        isOpen={announcementsModalOpen} 
        onClose={() => setAnnouncementsModalOpen(false)} 
      />

      {/* Modal do Histórico Semanal */}
      {historyModalOpen && (
        <div className="animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto', background: 'var(--bg-dark)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', position: 'sticky', top: 0, background: 'var(--bg-dark)', zIndex: 10, paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={20} color="var(--primary-color)" /> Diário de Treino
              </h3>
              <button onClick={() => setHistoryModalOpen(false)} style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            {weeklyLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                Nenhum treino concluído nesta semana ainda. Comece agora!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {weeklyLogs.slice().reverse().map((log, index) => (
                  <div key={index} style={{ borderLeft: '2px solid var(--primary-color)', paddingLeft: '1rem', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-6px', top: 0, width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary-color)' }}></div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {new Date(log.date).toLocaleString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <h4 style={{ margin: '0.2rem 0 0.5rem 0', color: 'white' }}>{log.routineName}</h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px' }}>
                      {log.exercises && log.exercises.map((ex, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{i+1}. {ex.name}</span>
                          <span style={{ color: '#00ff88' }}>{ex.sets}x{ex.reps}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}



function TreinosPage() {
  const [routines, setRoutines] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedFolder, setSelectedFolder] = React.useState(null);
  
  // Gamification state
  const [celebrationResult, setCelebrationResult] = React.useState(null);
  
  // States para Repetir Treino
  const [repeatModalOpen, setRepeatModalOpen] = React.useState(false);
  const [routineToRepeat, setRoutineToRepeat] = React.useState(null);
  const [repeatDay, setRepeatDay] = React.useState('Segunda-feira');
  const [isRepeating, setIsRepeating] = React.useState(false);

  const handleRepeat = async () => {
    if (!routineToRepeat) return;
    setIsRepeating(true);
    try {
      const { data: newRoutine, error: routineError } = await supabase
        .from('routines')
        .insert([{ name: routineToRepeat.name, day_of_week: repeatDay }])
        .select()
        .single();
        
      if (routineError) throw routineError;
      
      if (routineToRepeat.routine_exercises && routineToRepeat.routine_exercises.length > 0) {
        const exercisesToInsert = routineToRepeat.routine_exercises.map(rx => ({
          routine_id: newRoutine.id,
          exercise_id: rx.exercise_id,
          sort_order: rx.sort_order,
          sets: rx.sets,
          reps: rx.reps
        }));
        
        const { error: rxError } = await supabase.from('routine_exercises').insert(exercisesToInsert);
        if (rxError) throw rxError;
      }
      
      const { data, error } = await supabase.from('routines').select('*, routine_exercises(*, exercises(*))');
      if (!error && data) setRoutines(data);
      
      alert('Treino repetido com sucesso!');
      setRepeatModalOpen(false);
      setRoutineToRepeat(null);
    } catch (err) {
      console.error(err);
      alert('Erro ao repetir treino.');
    } finally {
      setIsRepeating(false);
    }
  };

  const handleDeleteRoutine = async (routineId, routineName) => {
    if (!window.confirm(`Tem certeza que deseja excluir o treino "${routineName}"?`)) return;
    
    try {
      await supabase.from('routine_exercises').delete().eq('routine_id', routineId);
      const { error } = await supabase.from('routines').delete().eq('id', routineId);
      if (error) throw error;
      
      const updated = routines.filter(r => r.id !== routineId);
      setRoutines(updated);
      
      const folderRemaining = updated.filter(r => (r.name.includes('|') ? r.name.split('|')[0] : 'Geral') === selectedFolder);
      if (folderRemaining.length === 0) {
        setSelectedFolder(null);
      }
    } catch (err) {
      console.error('Erro ao excluir treino:', err);
      alert('Erro ao excluir treino.');
    }
  };

  React.useEffect(() => {
    async function fetchRoutines() {
      try {
        const { data, error } = await supabase
          .from('routines')
          .select('*, routine_exercises(*, exercises(*))');
        
        if (error) throw error;
        setRoutines(data || []);
      } catch (err) {
        console.error("Erro ao buscar treinos", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRoutines();
  }, []);

  if (loading) return <div className="container" style={{ paddingTop: '2rem' }}>Carregando treinos...</div>;

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '6rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        {selectedFolder ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => setSelectedFolder(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '0.5rem', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <ArrowLeft size={24} />
            </button>
            <h2 style={{ margin: 0 }}>{selectedFolder}</h2>
          </div>
        ) : (
          <h2 style={{ margin: 0 }}>Seus Treinos Salvos</h2>
        )}
        <Link to="/montar-treino" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '8px', marginLeft: 'auto' }}>
          + Novo
        </Link>
      </div>

      {routines.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Nenhum treino salvo ainda.</p>
        </div>
      ) : !selectedFolder ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
          {[...new Set(routines.map(r => r.name.includes('|') ? r.name.split('|')[0] : 'Geral'))].sort().map(cat => {
            const count = routines.filter(r => (r.name.includes('|') ? r.name.split('|')[0] : 'Geral') === cat).length;
            return (
              <div 
                key={cat}
                onClick={() => setSelectedFolder(cat)}
                className="glass-card animate-scale"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <Folder size={40} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
                <span style={{ fontWeight: '600', textAlign: 'center', fontSize: '1.05rem', color: 'white' }}>{cat}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>{count} treino{count !== 1 ? 's' : ''}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {routines.filter(r => (r.name.includes('|') ? r.name.split('|')[0] : 'Geral') === selectedFolder).map(routine => {
            const displayName = routine.name.includes('|') ? routine.name.split('|').slice(1).join('|') : routine.name;
            return (
            <div key={routine.id} className="glass-card animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ color: 'var(--primary-color)', margin: '0 0 0.25rem 0' }}>{displayName}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>{routine.day_of_week}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button 
                    onClick={() => { setRoutineToRepeat({...routine, displayName}); setRepeatModalOpen(true); }} 
                    className="btn" 
                    style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <Copy size={16} /> Repetir
                  </button>
                  <button 
                    onClick={() => handleDeleteRoutine(routine.id, displayName)} 
                    className="btn" 
                    style={{ background: 'rgba(255,68,68,0.15)', color: '#ff4444', padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid rgba(255,68,68,0.3)', cursor: 'pointer' }}
                    title="Excluir este treino"
                  >
                    <Trash2 size={16} /> Excluir
                  </button>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {routine.routine_exercises && routine.routine_exercises.sort((a,b)=>a.sort_order - b.sort_order).map((rx, idx) => {
                  const ex = rx.exercises;
                  return (
                    <div key={rx.id}>
                      <VideoPlayer 
                        type={ex.media_type} 
                        url={ex.media_url} 
                        title={`${idx + 1}. ${ex.name}`} 
                      />
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        Séries: {rx.sets} | Repetições: {rx.reps}
                      </p>
                      <RestTimer initialSeconds={60} />
                    </div>
                  );
                })}
              </div>
              
              <button 
                onClick={() => {
                  const getWeekStr = (d) => {
                    const date = new Date(d.getTime());
                    date.setHours(0, 0, 0, 0);
                    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
                    const w1 = new Date(date.getFullYear(), 0, 4);
                    const wn = 1 + Math.round(((date.getTime() - w1.getTime()) / 86400000 - 3 + (w1.getDay() + 6) % 7) / 7);
                    return `${date.getFullYear()}-W${wn}`;
                  };
                  const currentWeek = getWeekStr(new Date());
                  const logs = JSON.parse(localStorage.getItem('workout_logs') || '{}');
                  
                  if (!Array.isArray(logs[currentWeek])) {
                    logs[currentWeek] = [];
                  }
                  
                  const workoutDate = new Date().toISOString();
                  const workoutDetails = {
                    date: workoutDate,
                    routineName: displayName,
                    dayOfWeek: routine.day_of_week,
                    exercises: routine.routine_exercises ? routine.routine_exercises.sort((a,b)=>a.sort_order - b.sort_order).map(rx => ({
                      name: rx.exercises.name,
                      sets: rx.sets,
                      reps: rx.reps
                    })) : []
                  };
                  
                  logs[currentWeek].push(workoutDetails);
                  localStorage.setItem('workout_logs', JSON.stringify(logs));
                  
                  // Processa Gamificação
                  const gamificationResult = processWorkoutCompletion(workoutDate);
                  setCelebrationResult(gamificationResult);
                }}
                className="btn btn-primary animate-scale" 
                style={{ width: '100%', marginTop: '2rem', padding: '1rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Check size={20} /> Concluir Treino
              </button>
            </div>
            );
          })}
        </div>
      )}

      {/* Modal de Repetir Treino */}
      {repeatModalOpen && (
        <div className="animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px', background: 'var(--bg-dark)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Repetir Treino</h3>
              <button onClick={() => setRepeatModalOpen(false)} style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.95rem' }}>
              Para qual dia da semana você deseja copiar o <strong>{routineToRepeat?.displayName}</strong>?
            </p>
            <select 
              value={repeatDay} 
              onChange={(e) => setRepeatDay(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white', fontSize: '1rem', marginBottom: '1.5rem' }}
            >
              <option>Segunda-feira</option>
              <option>Terça-feira</option>
              <option>Quarta-feira</option>
              <option>Quinta-feira</option>
              <option>Sexta-feira</option>
              <option>Sábado</option>
              <option>Domingo</option>
            </select>
            <button 
              onClick={handleRepeat}
              disabled={isRepeating}
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
            >
              {isRepeating ? 'Copiando...' : 'Confirmar e Duplicar'}
            </button>
          </div>
        </div>
      )}

      {/* Modal de Celebração (Gamificação) */}
      {celebrationResult && (
        <ConfettiCelebration 
          result={celebrationResult} 
          onClose={() => setCelebrationResult(null)} 
        />
      )}
    </div>
  );
}

function App() {
  const [session, setSession] = React.useState(null);
  const [profile, setProfile] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function initPlans() {
      try {
        const { data: plans, error } = await supabase.from('plans').select('*');
        if (!error && plans && plans.length > 0) {
          const formattedPlans = plans.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            cycle: p.cycle,
            checkoutUrl: p.checkout_url,
            isVisible: p.is_visible,
            isRecommended: p.is_recommended,
            isTrial: p.is_trial,
            trialDays: p.trial_days,
            features: p.features,
            accessHome: p.access_home,
            accessGym: p.access_gym,
            accessCreate: p.access_create,
            accessWhatsapp: p.access_whatsapp,
            accessAdvanced: p.access_advanced,
            webhook_product_id: p.webhook_product_id
          }));
          localStorage.setItem('admin_plans', JSON.stringify(formattedPlans));
        }
      } catch (e) {
        console.error("Failed to init plans", e);
      }
    }
    initPlans();

    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (!error && data) {
        setProfile(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', color: 'white' }}>
        Carregando...
      </div>
    );
  }

  // Verificar bloqueio e teste expirado (se não for rota de admin)
  const isBlocked = profile && profile.status === 'blocked';
  const isTrialExpired = profile && profile.status === 'trial' && profile.trial_ends_at && new Date() > new Date(profile.trial_ends_at);
  const isAdminPath = window.location.pathname.startsWith('/admin');

  // Calcular dias restantes de teste
  const isTrial = profile && profile.status === 'trial' && !isTrialExpired;
  let remainingDays = 0;
  if (isTrial && profile.trial_ends_at) {
    const diff = new Date(profile.trial_ends_at) - new Date();
    remainingDays = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  if (session && (isBlocked || isTrialExpired) && !isAdminPath) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-dark)', color: 'white', padding: '2rem', textAlign: 'center'
      }}>
        <div className="glass-card" style={{ maxWidth: '450px', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '2.5rem', boxShadow: '0 0 30px rgba(239, 68, 68, 0.1)', transform: 'none' }}>
          {isBlocked ? (
            <>
              <div style={{ display: 'inline-flex', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem', color: '#ef4444' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Acesso Suspenso</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                Sua conta foi suspensa pelo administrador. Por favor, entre em contato para regularizar seu acesso.
              </p>
            </>
          ) : (
            <>
              <div style={{ display: 'inline-flex', background: 'rgba(255, 176, 32, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem', color: '#ffb020' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              </div>
              <h2 style={{ color: '#ffb020', marginBottom: '1rem' }}>Período de Teste Expirado</h2>
              <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                Seu período de teste gratuito expirou. Para continuar acessando seus treinos, assine um plano.
              </p>
              <button 
                className="btn btn-primary" 
                onClick={() => window.location.href = '/planos'}
                style={{ width: '100%', marginBottom: '1rem' }}
              >
                Ver Planos de Assinatura
              </button>
            </>
          )}
          <button 
            className="btn" 
            onClick={() => supabase.auth.signOut()}
            style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', color: 'white' }}
          >
            Sair da Conta
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container">

        <main>
          <Routes>
            {/* Rotas Protegidas (Exigem Login) */}
            <Route path="/" element={<ProtectedRoute session={session}><HomePage /></ProtectedRoute>} />
            <Route path="/pokas/*" element={<ProtectedRoute session={session}><PokasLayout /></ProtectedRoute>} />
            <Route path="/exercicios" element={<ProtectedRoute session={session}><CatalogPage /></ProtectedRoute>} />
            <Route path="/treinar" element={<ProtectedRoute session={session}><ActiveWorkoutPage /></ProtectedRoute>} />
            <Route path="/treinos" element={<ProtectedRoute session={session}><TreinosPage /></ProtectedRoute>} />
            <Route path="/categorias" element={<ProtectedRoute session={session}><CategoriesPage /></ProtectedRoute>} />
            <Route path="/montar-treino" element={<ProtectedRoute session={session}><WorkoutBuilder /></ProtectedRoute>} />
            <Route path="/conquistas" element={<ProtectedRoute session={session}><ConquistasPage /></ProtectedRoute>} />
            <Route path="/config" element={<ProtectedRoute session={session}><ConfigPage /></ProtectedRoute>} />

            {/* Rotas Públicas */}
            <Route path="/login" element={session ? <Navigate to="/" replace /> : <AuthPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/planos" element={<SalesPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="exercises" element={<AdminExercises />} />
              <Route path="plans" element={<AdminPlans />} />
              <Route path="sales" element={<AdminSalesLink />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="whatsapp" element={<AdminWhatsApp />} />
              <Route path="clients" element={<AdminClients />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="team" element={<AdminTeam />} />
            </Route>

            {/* Redirecionamento padrão */}
            <Route path="*" element={<Navigate to={session ? "/" : "/login"} replace />} />
          </Routes>
        </main>
        {session && <NotificationCenter />}
        <Navbar session={session} />
        <InstallPrompt />
        {localStorage.getItem('simulated_plan_id') && (
          <button 
            onClick={() => { localStorage.removeItem('simulated_plan_id'); window.location.href = '/admin/plans'; }}
            style={{ position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', background: '#ff4444', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '30px', fontWeight: 'bold', zIndex: 9999, border: 'none', boxShadow: '0 4px 15px rgba(255,68,68,0.4)', cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
          >
            <X size={18} /> Sair da Simulação
          </button>
        )}
      </div>
    </Router>
  );
}

export default App;
