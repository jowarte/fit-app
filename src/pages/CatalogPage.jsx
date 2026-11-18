import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Trophy } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function CatalogPage() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [newExercise, setNewExercise] = useState({ name: '', muscle_group: 'Peito', equipment: 'Barra' });
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exerciseSets, setExerciseSets] = useState([]);
  const [goalE1rm, setGoalE1rm] = useState('');
  const [goalInput, setGoalInput] = useState('');

  const categories = ['Todos', 'Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Quadríceps', 'Posterior', 'Glúteo', 'Panturrilha', 'Abdômen', 'Antebraço'];
  const equipments = ['Barra', 'Halter', 'Máquina', 'Cabo', 'Livre'];

  useEffect(() => {
    fetchExercises();
  }, []);

  async function fetchExercises() {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      // Fetch global exercises and user-specific exercises
      const { data, error } = await supabase
        .from('user_exercises')
        .select('*')
        .or(`user_id.is.null,user_id.eq.${session?.user?.id}`)
        .order('name');
        
      if (error) throw error;
      setExercises(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleAddExercise = async () => {
    if (!newExercise.name.trim()) {
      alert('Por favor, preencha o nome do exercício!');
      return;
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase.from('user_exercises').insert([{
        user_id: session?.user?.id,
        name: newExercise.name.trim(),
        muscle_group: newExercise.muscle_group,
        equipment: newExercise.equipment
      }]);
      if (error) {
        console.error('Supabase error:', error);
        alert('Erro ao salvar: ' + (error.message || JSON.stringify(error)));
        return;
      }
      setModalOpen(false);
      setNewExercise({ name: '', muscle_group: 'Peito', equipment: 'Barra' });
      fetchExercises();
    } catch (err) {
      console.error("Erro ao salvar", err);
      alert('Erro ao salvar exercício: ' + err.message);
    }
  };

  const filteredExercises = exercises.filter(ex => 
    (filter === 'Todos' || ex.muscle_group === filter) &&
    ex.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectExercise = async (ex) => {
    setSelectedExercise(ex);
    // Load goal from localStorage
    const savedGoal = localStorage.getItem(`pokas_goal_${ex.id}`) || '';
    setGoalE1rm(savedGoal);
    setGoalInput(savedGoal);
    // Fetch sets for this exercise
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data: sets } = await supabase
        .from('user_sets')
        .select('weight, reps, e1rm, is_pr, created_at, workout_exercises!inner(exercise_id, user_workouts!inner(user_id))')
        .eq('workout_exercises.exercise_id', ex.id)
        .eq('workout_exercises.user_workouts.user_id', session?.user?.id)
        .order('created_at', { ascending: true })
        .limit(20);
      setExerciseSets(sets || []);
    } catch (err) {
      setExerciseSets([]);
    }
  };

  const handleSaveGoal = (exId) => {
    if (!goalInput) return;
    localStorage.setItem(`pokas_goal_${exId}`, goalInput);
    setGoalE1rm(goalInput);
    alert(`🎯 Meta de ${goalInput} kg E1RM salva!`);
  };

  // Simple SVG line chart for E1RM history
  const E1rmChart = ({ sets }) => {
    if (sets.length < 2) return null;
    const values = sets.map(s => parseFloat(s.e1rm || 0));
    const min = Math.min(...values) * 0.95;
    const max = Math.max(...values) * 1.05;
    const width = 300, height = 80;
    
    // Prevent NaN if all values are the same (e.g. 0 kg for bodyweight exercises)
    const range = max - min === 0 ? 1 : max - min;
    
    const points = values.map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');
    return (
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>EVOLUÇÃO E1RM</p>
        <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline points={points} fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {values.map((v, i) => {
            const x = (i / (values.length - 1)) * width;
            const y = height - ((v - min) / range) * height;
            return <circle key={i} cx={x} cy={y} r="4" fill={sets[i].is_pr ? '#a855f7' : '#555'} stroke="#111" strokeWidth="2" />;
          })}
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{new Date(sets[0].created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
          <span style={{ fontSize: '0.7rem', color: '#a855f7', fontWeight: 'bold' }}>Agora: {values[values.length-1].toFixed(1)} kg</span>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '6rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Exercícios</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.2rem 0 0 0' }}>0 com recorde • {exercises.length} no catálogo</p>
        </div>
        <button onClick={() => setModalOpen(true)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
          <Plus size={20} />
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
        <input 
          type="text"
          placeholder="Buscar exercício"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '1rem' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none', msOverflowStyle: 'none', whiteSpace: 'nowrap', WebkitOverflowScrolling: 'touch' }}>
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setFilter(cat)}
            style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '20px', 
              border: '1px solid rgba(255,255,255,0.1)', 
              background: filter === cat ? 'white' : 'transparent', 
              color: filter === cat ? 'black' : 'white',
              cursor: 'pointer',
              fontWeight: filter === cat ? '600' : 'normal',
              transition: 'all 0.2s',
              flexShrink: 0
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>Carregando...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {filteredExercises.map(ex => (
            <div key={ex.id} className="glass-card" onClick={() => handleSelectExercise(ex)} style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1.2rem', color: 'var(--primary-color)' }}>•</span>
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: 'white' }}>{ex.name}</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{ex.muscle_group} • {ex.equipment}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>sem PR</span>
                <span style={{ color: 'var(--text-secondary)' }}>›</span>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {modalOpen && (
        <div 
          className="animate-fade-in" 
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: 'rgba(0,0,0,0.85)', 
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 1000, 
            display: 'flex', 
            alignItems: 'flex-end', 
            justifyContent: 'center' 
          }}
        >
          <div 
            style={{ 
              width: '100%', 
              maxWidth: '540px',
              borderTopLeftRadius: '28px', 
              borderTopRightRadius: '28px', 
              borderBottomLeftRadius: 0, 
              borderBottomRightRadius: 0, 
              padding: '1.5rem', 
              paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom, 16px))',
              background: '#141416',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.8)',
              maxHeight: '88vh',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {/* Barra de arraste visual para mobile */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.2)' }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>Novo exercício</h3>
              <button 
                onClick={() => setModalOpen(false)} 
                style={{ color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            
            <input 
              type="text" 
              placeholder="Nome do exercício" 
              value={newExercise.name}
              onChange={(e) => setNewExercise({...newExercise, name: e.target.value})}
              style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: 'white', marginBottom: '1.5rem', fontSize: '1rem', outline: 'none' }}
            />
            
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.8rem' }}>Grupo</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {categories.filter(c => c !== 'Todos').map(cat => (
                <button 
                  key={cat}
                  onClick={() => setNewExercise({...newExercise, muscle_group: cat})}
                  style={{ 
                    padding: '0.5rem 0.9rem', 
                    borderRadius: '20px', 
                    fontSize: '0.85rem', 
                    border: '1px solid rgba(255,255,255,0.12)', 
                    background: newExercise.muscle_group === cat ? 'white' : 'rgba(255,255,255,0.04)', 
                    color: newExercise.muscle_group === cat ? 'black' : 'var(--text-secondary)',
                    fontWeight: newExercise.muscle_group === cat ? 'bold' : 'normal',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >{cat}</button>
              ))}
            </div>

            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.8rem' }}>Equipamento</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
              {equipments.map(eq => (
                <button 
                  key={eq}
                  onClick={() => setNewExercise({...newExercise, equipment: eq})}
                  style={{ 
                    padding: '0.5rem 0.9rem', 
                    borderRadius: '20px', 
                    fontSize: '0.85rem', 
                    border: '1px solid rgba(255,255,255,0.12)', 
                    background: newExercise.equipment === eq ? 'white' : 'rgba(255,255,255,0.04)', 
                    color: newExercise.equipment === eq ? 'black' : 'var(--text-secondary)',
                    fontWeight: newExercise.equipment === eq ? 'bold' : 'normal',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >{eq}</button>
              ))}
            </div>

            <button 
              onClick={handleAddExercise} 
              className="btn btn-primary animate-scale" 
              style={{ 
                width: '100%', 
                padding: '1.1rem', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '0.5rem',
                fontWeight: 'bold',
                fontSize: '1.05rem',
                borderRadius: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0, 255, 136, 0.3)'
              }}
            >
              <Trophy size={20} /> Salvar Exercício
            </button>
          </div>
        </div>
      )}

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <div 
          className="animate-fade-in" 
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedExercise(null); }}
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: 'rgba(0,0,0,0.85)', 
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 1000, 
            display: 'flex', 
            alignItems: 'flex-end',
            justifyContent: 'center'
          }}
        >
          <div 
            style={{ 
              width: '100%', 
              maxWidth: '540px',
              background: '#141416', 
              borderTopLeftRadius: '28px', 
              borderTopRightRadius: '28px', 
              padding: '1.5rem', 
              paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom, 16px))',
              maxHeight: '85vh', 
              overflowY: 'auto',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.8)',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.2)' }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{selectedExercise.name}</h2>
              <button onClick={() => setSelectedExercise(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: 'white', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>
            <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{selectedExercise.muscle_group} • {selectedExercise.equipment}</p>

            {/* Best PR */}
            <div style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '16px', padding: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'rgba(168, 85, 247, 0.2)', padding: '0.8rem', borderRadius: '12px' }}>
                <Trophy size={22} color="#c084fc" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#c084fc', letterSpacing: '1px' }}>MELHOR RECORDE</p>
                {exerciseSets.length > 0 ? (
                  <h3 style={{ margin: '0.2rem 0 0 0', color: 'white', fontSize: '1.2rem' }}>
                    {Math.max(...exerciseSets.map(s => Number(s.e1rm || 0))).toFixed(1)} kg E1RM
                  </h3>
                ) : (
                  <h3 style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '1rem' }}>Nenhum PR ainda</h3>
                )}
              </div>
              {goalE1rm && (
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.65rem', color: '#fbbf24', letterSpacing: '1px' }}>META</p>
                  <p style={{ margin: 0, color: '#fbbf24', fontWeight: 'bold' }}>{goalE1rm} kg</p>
                </div>
              )}
            </div>

            {/* E1RM Chart */}
            {exerciseSets.length >= 2 && <E1rmChart sets={exerciseSets} />}

            {/* Personal Goal */}
            <div style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: '14px', padding: '1rem', marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 0.6rem 0', fontSize: '0.75rem', color: '#fbbf24', letterSpacing: '1px' }}>🎯 META PESSOAL (E1RM)</p>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <input
                  type="number"
                  placeholder={`Atual: ${exerciseSets.length > 0 ? Math.max(...exerciseSets.map(s => Number(s.e1rm || 0))).toFixed(1) : '0'} kg`}
                  value={goalInput}
                  onChange={e => setGoalInput(e.target.value)}
                  style={{ flex: 1, padding: '0.7rem 0.8rem', borderRadius: '10px', border: '1px solid rgba(251,191,36,0.3)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.9rem' }}
                />
                <button onClick={() => handleSaveGoal(selectedExercise.id)} style={{ padding: '0.7rem 1rem', background: '#fbbf24', border: 'none', borderRadius: '10px', color: 'black', fontWeight: 'bold', cursor: 'pointer' }}>
                  Salvar
                </button>
              </div>
            </div>

            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.8rem' }}>Últimas séries</h4>
            {exerciseSets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                <p style={{ margin: 0 }}>Nenhuma série registrada ainda.</p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem' }}>Inicie um treino e registre este exercício!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
                {exerciseSets.map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {new Date(s.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    <span style={{ color: 'white', fontWeight: 'bold' }}>{s.weight}kg × {s.reps} reps</span>
                    <span style={{ color: s.is_pr ? '#a855f7' : 'var(--text-secondary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      {s.is_pr && <Trophy size={12} />} E1RM {Number(s.e1rm || 0).toFixed(1)}kg
                    </span>
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
