import { getMediaUrl } from './media';

/**
 * Compartilha um exercício individual no WhatsApp com link direto do vídeo/GIF
 */
export function shareExerciseWhatsApp(exercise) {
  if (!exercise) return;
  const name = exercise.name || 'Exercício';
  const rawUrl = exercise.media_url || exercise.url || '';
  const mediaUrl = rawUrl ? getMediaUrl(rawUrl) : '';
  const muscleGroup = exercise.muscle_group || '';
  
  let msg = `🏋️‍♂️ *EXERCÍCIO: ${name.toUpperCase()}*\n`;
  if (muscleGroup) msg += `🎯 *Foco:* ${muscleGroup}\n`;
  if (exercise.description) msg += `📝 ${exercise.description}\n`;
  
  if (mediaUrl) {
    msg += `\n▶️ *Assista à execução correta em vídeo/GIF:*\n${mediaUrl}\n`;
  }
  msg += `\n💪 *Bons treinos! Foco no resultado!*`;
  
  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
  window.open(waUrl, '_blank');
}

/**
 * Compartilha uma ficha ou rotina de treino completa no WhatsApp
 */
export function shareRoutineWhatsApp(routine) {
  if (!routine) return;
  const rawName = routine.name || 'Treino';
  const displayName = rawName.includes('|') ? rawName.split('|').slice(1).join('|') : rawName;
  const day = routine.day_of_week || '';
  
  let msg = `🔥 *FICHA DE TREINO: ${displayName.toUpperCase()}*\n`;
  if (day) msg += `📅 *Dia:* ${day}\n`;
  msg += `\n🏋️‍♂️ *LISTA DE EXERCÍCIOS:* \n\n`;
  
  const exercises = routine.routine_exercises || [];
  if (exercises.length === 0) {
    msg += `(Nenhum exercício cadastrado)\n`;
  } else {
    const sorted = [...exercises].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    sorted.forEach((rx, idx) => {
      const ex = rx.exercises || {};
      const exName = ex.name || rx.name || `Exercício ${idx + 1}`;
      const sets = rx.sets || '3';
      const reps = rx.reps || '10-12';
      const rawMedia = ex.media_url || '';
      const media = rawMedia ? getMediaUrl(rawMedia) : '';
      
      msg += `${idx + 1}️⃣ *${exName}*\n`;
      msg += `   • ${sets} séries x ${reps} reps\n`;
      if (media) {
        msg += `   ▶️ Ver Execução: ${media}\n`;
      }
      msg += `\n`;
    });
  }
  
  msg += `💪 *Bora treinar! Foco e disciplina!*`;
  
  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
  window.open(waUrl, '_blank');
}
