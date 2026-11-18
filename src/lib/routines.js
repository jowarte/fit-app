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

    // Coleta nomes para fallback de correspondência
    const namesToLookup = Array.from(new Set(
      routines.flatMap(r => (r.routine_exercises || []).map(rx => rx.name).filter(Boolean))
    ));

    let exMapById = {};
    let exMapByName = {};

    // 1. Carregar por ID
    if (exerciseIds.length > 0) {
      const { data: exercises, error: exErr } = await supabase
        .from('exercises')
        .select('id, name, media_url, media_type, muscle_group')
        .in('id', exerciseIds);

      if (!exErr && exercises) {
        exercises.forEach(e => { 
          exMapById[e.id] = e;
          if (e.name) exMapByName[e.name.trim().toLowerCase()] = e;
        });
      }
    }

    // 2. Fallback: Se houver algum item sem ID, tentar buscar por nome no catálogo
    const missingNames = namesToLookup.filter(n => !exMapByName[n.trim().toLowerCase()]);
    if (missingNames.length > 0) {
      const { data: moreExercises } = await supabase
        .from('exercises')
        .select('id, name, media_url, media_type, muscle_group')
        .in('name', missingNames);

      if (moreExercises) {
        moreExercises.forEach(e => {
          if (e.name) exMapByName[e.name.trim().toLowerCase()] = e;
        });
      }
    }

    // 3. Enriquecer cada exercício da rotina
    routines.forEach(r => {
      if (r.routine_exercises && Array.isArray(r.routine_exercises)) {
        // Ordenar por order_index ou sort_order
        r.routine_exercises.sort((a, b) => (a.order_index ?? a.sort_order ?? 0) - (b.order_index ?? b.sort_order ?? 0));
        
        r.routine_exercises.forEach(rx => {
          const matchedEx = (rx.exercise_id && exMapById[rx.exercise_id]) || 
                            (rx.name && exMapByName[rx.name.trim().toLowerCase()]);

          rx.exercises = matchedEx || {
            name: rx.name || 'Exercício',
            media_url: '',
            media_type: 'local_video',
            muscle_group: 'Geral'
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
