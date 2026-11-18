import { supabase } from './supabase';

/**
 * Busca todas as rotinas/treinos enriquecidos com seus respectivos exercícios da biblioteca.
 * Evita falhas de foreign key quando a relação entre routine_exercises e exercises não estiver exposta no PostgREST.
 */
export async function fetchRoutinesWithExercises() {
  try {
    const { data: routines, error } = await supabase
      .from('routines')
      .select('*, routine_exercises(*)')
      .order('created_at', { ascending: false });

    if (error || !routines) {
      console.warn('Erro ao buscar rotinas:', error);
      return [];
    }

    // Coleta IDs únicos de exercícios
    const exerciseIds = Array.from(new Set(
      routines.flatMap(r => (r.routine_exercises || []).map(rx => rx.exercise_id).filter(Boolean))
    ));

    let exMap = {};
    if (exerciseIds.length > 0) {
      const { data: exercises } = await supabase
        .from('exercises')
        .select('id, name, media_url, media_type, muscle_group, equipment')
        .in('id', exerciseIds);

      if (exercises) {
        exercises.forEach(e => { exMap[e.id] = e; });
      }
    }

    // Enriquecer cada exercício da rotina
    routines.forEach(r => {
      if (r.routine_exercises && Array.isArray(r.routine_exercises)) {
        // Ordenar por order_index ou sort_order
        r.routine_exercises.sort((a, b) => (a.order_index ?? a.sort_order ?? 0) - (b.order_index ?? b.sort_order ?? 0));
        
        r.routine_exercises.forEach(rx => {
          rx.exercises = exMap[rx.exercise_id] || {
            name: rx.name || 'Exercício',
            media_url: '',
            media_type: 'local_video',
            muscle_group: 'Geral',
            equipment: 'Geral'
          };
        });
      }
    });

    return routines;
  } catch (err) {
    console.error('Falha em fetchRoutinesWithExercises:', err);
    return [];
  }
}
