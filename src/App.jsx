import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Dumbbell, Home, Trophy, Settings, Play, Plus, Activity } from 'lucide-react';
import { VideoPlayer } from './components/VideoPlayer';
import { RestTimer } from './components/RestTimer';
import { WorkoutBuilder } from './pages/WorkoutBuilder';
import { supabase } from './lib/supabase';
import './App.css'; // Limpar o App.css se existir, usando apenas index.css

function Navbar() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="bottom-nav">
      <Link to="/" className={`nav-item ${path === '/' ? 'active' : ''}`}>
        <Home size={24} />
        <span>Início</span>
      </Link>
      <Link to="/treinos" className={`nav-item ${path === '/treinos' ? 'active' : ''}`}>
        <Dumbbell size={24} />
        <span>Treinos</span>
      </Link>
      <Link to="/conquistas" className={`nav-item ${path === '/conquistas' ? 'active' : ''}`}>
        <Trophy size={24} />
        <span>Conquistas</span>
      </Link>
      <Link to="/config" className={`nav-item ${path === '/config' ? 'active' : ''}`}>
        <Settings size={24} />
        <span>Config</span>
      </Link>
    </nav>
  );
}

function HomePage() {
  return (
    <>
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
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Nenhum treino ativo</p>
            </div>
            <button className="btn btn-primary" style={{ padding: '0.75rem' }}>
              <Play size={20} fill="black" />
            </button>
          </div>
          
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Activity color="var(--primary-color)" size={32} />
            <div>
              <h4 style={{ fontSize: '1rem' }}>Série Semanal</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>0 / 4 treinos concluídos</p>
            </div>
          </div>
        </div>

        <div className="actions-grid animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <Link to="/montar-treino" className="action-box" style={{ textDecoration: 'none' }}>
            <Plus size={32} />
            <h4>Montar Treino</h4>
            <p>Crie sua rotina</p>
          </Link>
          <div className="action-box">
            <Dumbbell size={32} />
            <h4>Meus Vídeos</h4>
            <p>Upload do PC</p>
          </div>
        </div>
      </div>
    </>
  );
}

function TreinosPage() {
  const [routines, setRoutines] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

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
        <h2>Seus Treinos Salvos</h2>
        <Link to="/montar-treino" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '8px' }}>
          + Novo
        </Link>
      </div>

      {routines.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Nenhum treino salvo ainda.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {routines.map(routine => (
            <div key={routine.id} className="glass-card">
              <h3 style={{ color: 'var(--primary-color)' }}>{routine.name}</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{routine.day_of_week}</p>
              
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/treinos" element={<TreinosPage />} />
            <Route path="/montar-treino" element={<WorkoutBuilder />} />
            <Route path="/conquistas" element={<div className="container" style={{paddingTop: '2rem'}}><h1>Conquistas</h1></div>} />
            <Route path="/config" element={<div className="container" style={{paddingTop: '2rem'}}><h1>Configurações</h1></div>} />
          </Routes>
        </main>
        <Navbar />
      </div>
    </Router>
  );
}

export default App;
