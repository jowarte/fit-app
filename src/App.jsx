import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Dumbbell, Home, Trophy, Settings, Play, Plus, Activity } from 'lucide-react';
import { VideoPlayer } from './components/VideoPlayer';
import { RestTimer } from './components/RestTimer';
import { WorkoutBuilder } from './pages/WorkoutBuilder';
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
  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <h2>Treino de Perna (Exemplo)</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>3 Exercícios • 45 min</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Exemplo de Vídeo Local com Loop */}
        <div>
          <VideoPlayer 
            type="local_video" 
            url="https://www.w3schools.com/html/mov_bbb.mp4" 
            title="1. Agachamento Livre" 
          />
          <RestTimer initialSeconds={90} />
        </div>

        {/* Exemplo de Vídeo do YouTube */}
        <div>
          <VideoPlayer 
            type="youtube" 
            url="https://www.youtube.com/watch?v=1Tq3QdYMTkY" 
            title="2. Leg Press 45º" 
          />
          <RestTimer initialSeconds={60} />
        </div>
      </div>
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
