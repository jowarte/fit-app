import React, { useState } from 'react';
import { Plus, Save, Trash2, Video, Dumbbell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function WorkoutBuilder() {
  const navigate = useNavigate();
  const [routineName, setRoutineName] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('Segunda-feira');
  const [isSaving, setIsSaving] = useState(false);
  
  const [exercises, setExercises] = useState([
    { id: Date.now(), name: '', sets: 3, reps: '10', media_url: '', media_type: 'youtube' }
  ]);

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
      // 1. Salvar o treino
      const { data: routineData, error: routineError } = await supabase
        .from('routines')
        .insert([{ name: routineName, day_of_week: dayOfWeek }])
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
          <div>
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

      <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Exercícios</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {exercises.map((ex, index) => (
          <div key={ex.id} className="glass-card" style={{ padding: '1.25rem', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Exercício {index + 1}</h4>
              <button onClick={() => removeExercise(ex.id)} style={{ color: 'var(--danger-color)' }}>
                <Trash2 size={20} />
              </button>
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

              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <Video size={16} /> Mídia do Exercício
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <select 
                    value={ex.media_type}
                    onChange={(e) => updateExercise(ex.id, 'media_type', e.target.value)}
                    style={{ ...inputStyle, width: '40%' }}
                  >
                    <option value="youtube">YouTube</option>
                    <option value="local_video">Vídeo PC/Celular</option>
                    <option value="gif">GIF</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder={ex.media_type === 'youtube' ? "Link do YouTube" : "Link da Mídia (ou clique Upload)"}
                    value={ex.media_url}
                    onChange={(e) => updateExercise(ex.id, 'media_url', e.target.value)}
                    style={{ ...inputStyle, width: '60%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={addExercise} className="btn" style={{ width: '100%', marginTop: '1.5rem', border: '1px dashed var(--primary-color)', color: 'var(--primary-color)' }}>
        <Plus size={20} /> Adicionar Exercício
      </button>

      <div style={{ position: 'fixed', bottom: '80px', left: 0, width: '100%', padding: '1rem', background: 'linear-gradient(to top, var(--bg-dark), transparent)', display: 'flex', justifyContent: 'center' }}>
        <button onClick={handleSave} disabled={isSaving} className="btn btn-primary" style={{ width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', opacity: isSaving ? 0.7 : 1 }}>
          <Save size={20} /> {isSaving ? 'Salvando...' : 'Salvar Treino'}
        </button>
      </div>
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
