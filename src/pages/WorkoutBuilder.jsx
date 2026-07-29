import React, { useState, useEffect } from 'react';
import { Plus, Save, Trash2, Video, Dumbbell, Search, Folder, LayoutGrid, X, Library, ArrowLeft, Check, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { VideoPlayer } from '../components/VideoPlayer';
import { checkUserPermission, applySimulator } from '../lib/permissions';

export function WorkoutBuilder() {
  const navigate = useNavigate();
  const [routineName, setRoutineName] = useState('');
  const [routineCategory, setRoutineCategory] = useState('Geral');
  const [dayOfWeek, setDayOfWeek] = useState('Segunda-feira');
  const [isSaving, setIsSaving] = useState(false);
  
  const [exercises, setExercises] = useState([
    { id: Date.now(), name: '', sets: 3, reps: '10', media_url: '', media_type: 'youtube' }
  ]);

  const [userProfile, setUserProfile] = useState(null);
  const [checkingAccess, setCheckingAccess] = useState(true);

  // Modal states
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [targetExerciseId, setTargetExerciseId] = useState(null);
  const [libraryExercises, setLibraryExercises] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function checkAccessAndFetchLibrary() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          if (!error && data) {
            setUserProfile(applySimulator(data));
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setCheckingAccess(false);
      }

      setLibraryLoading(true);
      const { data, error } = await supabase.from('exercises').select('*').order('name');
      if (!error && data) {
        setLibraryExercises(data);
      }
      setLibraryLoading(false);
    }
    checkAccessAndFetchLibrary();
  }, []);

  const openLibrary = (id) => {
    setTargetExerciseId(id);
    setIsLibraryOpen(true);
    setSelectedCategory(null);
    setSearchQuery('');
  };

  const closeLibrary = () => {
    setIsLibraryOpen(false);
    setTargetExerciseId(null);
  };

  const [toastMessage, setToastMessage] = useState('');
  const [selectedExIds, setSelectedExIds] = useState({});

  const selectLibraryExercise = (libEx) => {
    setExercises(prev => {
      let updated = [...prev];
      const targetIndex = updated.findIndex(ex => ex.id === targetExerciseId);
      
      if (targetIndex >= 0 && !updated[targetIndex].name) {
        // O bloco de destino está vazio, então preenchemos ele
        updated[targetIndex] = { ...updated[targetIndex], name: libEx.name, media_type: libEx.media_type, media_url: libEx.media_url };
        // Muda o target para um valor fantasma para que os próximos cliques sejam anexados (append)
        setTimeout(() => setTargetExerciseId('append'), 0);
      } else {
        // Não há bloco vazio de destino, então adicionamos um novo bloco no final da lista
        updated.push({
          id: Date.now() + Math.random(),
          name: libEx.name,
          sets: 3,
          reps: '10',
          media_url: libEx.media_url,
          media_type: libEx.media_type
        });
      }
      return updated;
    });

    setToastMessage(`"${libEx.name}" adicionado!`);
    setTimeout(() => setToastMessage(''), 2500);
    
    setSelectedExIds(prev => ({ ...prev, [libEx.id]: true }));
  };

  const addExercise = () => {
    setExercises([...exercises, { id: Date.now(), name: '', sets: 3, reps: '10', media_url: '', media_type: 'youtube' }]);
  };

  const removeExercise = (id) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const updateExercise = (id, field, value) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, [field]: value } : ex));
  };

  const handleSave = async () => {
    if (!routineName) {
      alert("Por favor, dê um nome para o treino!");
      return;
    }

    try {
      setIsSaving(true);
      // 1. Salvar o treino com a categoria concatenada no nome
      const finalName = `${routineCategory}|${routineName}`;
      
      const { data: routineData, error: routineError } = await supabase
        .from('routines')
        .insert([{ name: finalName, day_of_week: dayOfWeek }])
        .select()
        .single();

      if (routineError) throw routineError;

      // 2. Salvar os exercícios e linkar com o treino
      for (let i = 0; i < exercises.length; i++) {
        const ex = exercises[i];
        if (!ex.name) continue;

        // Inserir exercício
        const { data: exData, error: exError } = await supabase
          .from('exercises')
          .insert([{ 
            name: ex.name, 
            media_url: ex.media_url || 'https://www.w3schools.com/html/mov_bbb.mp4', 
            media_type: ex.media_type 
          }])
          .select()
          .single();

        if (exError) throw exError;

        // Ligar exercício ao treino
        const { error: relError } = await supabase
          .from('routine_exercises')
          .insert([{
            routine_id: routineData.id,
            exercise_id: exData.id,
            sort_order: i + 1,
            sets: parseInt(ex.sets) || 3,
            reps: ex.reps || '10'
          }]);
          
        if (relError) throw relError;
      }

      alert("Treino salvo com sucesso no banco de dados!");
      navigate('/treinos');
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Ocorreu um erro ao salvar o treino.");
    } finally {
      setIsSaving(false);
    }
  };

  if (checkingAccess) {
    return (
      <div className="container" style={{ paddingTop: '5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Verificando permissões...
      </div>
    );
  }

  const hasCreateAccess = checkUserPermission(userProfile, 'access_create');

  if (!hasCreateAccess) {
    return (
      <div className="container animate-fade-in" style={{ paddingTop: '5rem', paddingBottom: '6rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem', textAlign: 'center', border: '1px solid rgba(255, 176, 32, 0.2)' }}>
          <Lock size={56} color="#ffb020" style={{ marginBottom: '1.5rem', marginLeft: 'auto', marginRight: 'auto' }} />
          <h2 style={{ marginBottom: '1rem', color: 'white' }}>
            {userProfile?.status === 'trial' ? 'Recurso Bloqueado no Teste' : 'Criação de Treinos Exclusiva'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            {userProfile?.status === 'trial' 
              ? 'A criação de treinos personalizados não está disponível no seu período de teste. Assine um plano completo para liberar!' 
              : 'A criação de treinos personalizados é um recurso Premium. Escolha um plano de assinatura para liberar essa e outras funções!'}
          </p>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/planos')}
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            Assinar Agora
          </button>
          <button 
            className="btn" 
            onClick={() => navigate('/')}
            style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', color: 'white' }}
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '6rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <Dumbbell color="var(--primary-color)" size={32} />
        <h2 style={{ margin: 0 }}>Montar Treino</h2>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Nome do Treino</label>
            <input 
              type="text" 
              placeholder="Ex: Treino A - Peito e Tríceps" 
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Categoria / Pasta</label>
              <input 
                type="text" 
                placeholder="Ex: Hipertrofia" 
                value={routineCategory}
                onChange={(e) => setRoutineCategory(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Dia da Semana</label>
              <select 
                value={dayOfWeek} 
                onChange={(e) => setDayOfWeek(e.target.value)}
                style={inputStyle}
              >
                <option>Segunda-feira</option>
                <option>Terça-feira</option>
                <option>Quarta-feira</option>
                <option>Quinta-feira</option>
                <option>Sexta-feira</option>
                <option>Sábado</option>
                <option>Domingo</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>Exercícios</h3>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.1)', padding: '0.3rem 0.8rem', borderRadius: '12px', fontWeight: '500' }}>
          {exercises.filter(ex => ex.name).length} adicionado{exercises.filter(ex => ex.name).length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {exercises.map((ex, index) => (
          <div key={ex.id} className="glass-card" style={{ padding: '1.25rem', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Exercício {index + 1}</h4>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => openLibrary(ex.id)} className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Library size={16} /> Buscar
                </button>
                <button onClick={() => removeExercise(ex.id)} style={{ color: 'var(--danger-color)', padding: '0.25rem' }}>
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                type="text" 
                placeholder="Nome do Exercício" 
                value={ex.name}
                onChange={(e) => updateExercise(ex.id, 'name', e.target.value)}
                style={inputStyle}
              />
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Séries</label>
                  <input 
                    type="number" 
                    value={ex.sets}
                    onChange={(e) => updateExercise(ex.id, 'sets', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Repetições</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 10-12"
                    value={ex.reps}
                    onChange={(e) => updateExercise(ex.id, 'reps', e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Modern Media Indicator with Preview */}
              {ex.media_url ? (
                <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(0, 255, 136, 0.3)', marginTop: '0.5rem', background: 'rgba(0,0,0,0.2)' }}>
                  <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(0, 255, 136, 0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(0, 255, 136, 0.2)' }}>
                    <Check size={16} color="#00ff88" />
                    <span style={{ fontSize: '0.85rem', color: '#00ff88', fontWeight: '500' }}>Vídeo Vinculado</span>
                  </div>
                  <VideoPlayer type={ex.media_type} url={ex.media_url} title={ex.name} />
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    <Video size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '500', color: 'white' }}>Nenhum Vídeo</p>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Use o botão "Buscar" para vincular um vídeo.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button onClick={addExercise} className="btn" style={{ width: '100%', marginTop: '1.5rem', border: '1px dashed var(--primary-color)', color: 'var(--primary-color)' }}>
        <Plus size={20} /> Adicionar Exercício
      </button>

      <div style={{ position: 'fixed', bottom: '80px', left: 0, width: '100%', padding: '1rem', background: 'linear-gradient(to top, var(--bg-dark), transparent)', display: 'flex', justifyContent: 'center', zIndex: 10 }}>
        <button onClick={handleSave} disabled={isSaving} className="btn btn-primary" style={{ width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', opacity: isSaving ? 0.7 : 1 }}>
          <Save size={20} /> {isSaving ? 'Salvando...' : 'Salvar Treino'}
        </button>
      </div>

      {/* Library Modal */}
      {isLibraryOpen && (
        <div className="animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg-dark)', zIndex: 100, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Library size={20} color="var(--primary-color)" /> Biblioteca de Exercícios
            </h3>
            <button onClick={closeLibrary} style={{ color: 'var(--text-secondary)' }}>
              <X size={24} />
            </button>
          </div>

          <div style={{ padding: '1.5rem', flex: 1 }}>
            {libraryLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Carregando biblioteca...</div>
            ) : (
              <>
                {!selectedCategory ? (
                  <>
                    <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                      <Search size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                      <input 
                        type="text" 
                        placeholder="Buscar exercício pelo nome..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ ...inputStyle, paddingLeft: '3rem' }}
                      />
                    </div>

                    {searchQuery ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {libraryExercises.filter(ex => ex.name.toLowerCase().includes(searchQuery.toLowerCase()) && ex.name !== '_FOLDER_META_' && ex.name !== '_FOLDER_BLOCKED_').map(ex => (
                          <div key={ex.id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>{ex.name}</h4>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{ex.muscle_group || 'Sem categoria'}</span>
                              </div>
                              <button 
                                onClick={() => selectLibraryExercise(ex)} 
                                className="btn btn-primary" 
                                style={{ 
                                  padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem',
                                  background: selectedExIds[ex.id] ? '#00ff88' : 'var(--primary-color)',
                                  color: selectedExIds[ex.id] ? '#000' : 'inherit',
                                  transition: 'all 0.2s'
                                }}
                              >
                                <Check size={16} /> {selectedExIds[ex.id] ? 'Adicionado' : 'Selecionar'}
                              </button>
                            </div>
                            {ex.media_url && (
                              <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <VideoPlayer type={ex.media_type} url={ex.media_url} title={ex.name} />
                              </div>
                            )}
                          </div>
                        ))}
                        {libraryExercises.filter(ex => ex.name.toLowerCase().includes(searchQuery.toLowerCase()) && ex.name !== '_FOLDER_META_' && ex.name !== '_FOLDER_BLOCKED_').length === 0 && (
                          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                            Nenhum exercício encontrado com "{searchQuery}".
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                        {[...new Set(libraryExercises.filter(ex => ex.name !== '_FOLDER_META_' && ex.name !== '_FOLDER_BLOCKED_').map(ex => ex.muscle_group).filter(Boolean))].sort().map(cat => {
                          const count = libraryExercises.filter(e => e.muscle_group === cat && e.name !== '_FOLDER_META_' && e.name !== '_FOLDER_BLOCKED_').length;
                          return (
                            <div 
                              key={cat}
                              onClick={() => setSelectedCategory(cat)}
                              className="glass-card"
                              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 1rem', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.05)' }}
                            >
                              <Folder size={32} color="var(--primary-color)" style={{ marginBottom: '0.5rem' }} />
                              <span style={{ fontWeight: '500', textAlign: 'center', fontSize: '0.95rem' }}>{cat}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{count} exercícios</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                      <button onClick={() => setSelectedCategory(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '0.5rem', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <ArrowLeft size={24} />
                      </button>
                      <h3 style={{ margin: 0 }}>{selectedCategory}</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {libraryExercises.filter(ex => ex.muscle_group === selectedCategory && ex.name !== '_FOLDER_META_' && ex.name !== '_FOLDER_BLOCKED_').map(ex => (
                        <div key={ex.id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{ex.name}</h4>
                            <button 
                              onClick={() => selectLibraryExercise(ex)} 
                              className="btn btn-primary" 
                              style={{ 
                                padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem',
                                background: selectedExIds[ex.id] ? '#00ff88' : 'var(--primary-color)',
                                color: selectedExIds[ex.id] ? '#000' : 'inherit',
                                transition: 'all 0.2s'
                              }}
                            >
                              <Check size={16} /> {selectedExIds[ex.id] ? 'Adicionado' : 'Selecionar'}
                            </button>
                          </div>
                          {ex.media_url && (
                            <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                              <VideoPlayer type={ex.media_type} url={ex.media_url} title={ex.name} />
                            </div>
                          )}
                        </div>
                      ))}
                      {libraryExercises.filter(ex => ex.muscle_group === selectedCategory && ex.name !== '_FOLDER_META_' && ex.name !== '_FOLDER_BLOCKED_').length === 0 && (
                        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                          Nenhum exercício nesta categoria.
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)',
          background: '#00ff88', color: '#000', padding: '0.75rem 1.5rem',
          borderRadius: '30px', fontWeight: 'bold', zIndex: 1000, boxShadow: '0 4px 15px rgba(0, 255, 136, 0.4)',
          animation: 'fade-in 0.3s ease-out', pointerEvents: 'none'
        }}>
          {toastMessage}
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(0,0,0,0.3)',
  color: 'white',
  fontSize: '1rem'
};
