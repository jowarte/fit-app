import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://prmmoqipyyvuekxvhspu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybW1vcWlweXl2dWVreHZoc3B1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MzU5NzksImV4cCI6MjEwMDMxMTk3OX0.SL_Iouh5IJnKTKsjaU3cU7pJXzWR2KgR-75Sa2YUNmk';
const supabase = createClient(supabaseUrl, supabaseKey);

const INCLUDES = [
  'abdominal', 'crunch', 'prancha', 'plank',
  'flexão', 'push up', 'push-up',
  'polichinelo', 'jumping jack', 'jumping',
  'mountain climber', 'escalador',
  'burpee',
  'agachamento', 'squat',
  'elevação pélvica', 'ponte', 'glute bridge',
  'superman', 'lombar',
  'alongamento', 'stretching', 'mobilidade', 'mobility',
  'skipping', 'corrida', 'high knees', 'knee',
  'afundo', 'lunge', 'passada',
  'panturrilha', 'calf',
  'cadeira' // <-- Added Cadeira
];

const EXCLUDES = [
  'dumbbell', 'halteres', 'db',
  'barbell', 'barra',
  'smith',
  'kettlebell', 'kb',
  'cable', 'cabo', 'polia', 'pulley', 'cross',
  'machine', 'máquina', 'aparelho',
  'band', 'elástico', 'elastico', 'resistance',
  'leg press', 'extensora', 'flexora', 'hack', 'peck deck', 'voador',
  'peso', 'anilhas', 'weight', 'carga', // <-- Added Carga
  'puxada', 'remada', 'row', 'pulldown'
];

function isHomeWorkout(name) {
  const lowerName = name.toLowerCase();
  
  // Se tiver alguma palavra que exige equipamento, já recusamos na hora
  if (EXCLUDES.some(ex => lowerName.includes(ex))) {
    return false;
  }
  
  // Se não tem equipamento e bate com alguma das palavras de inclusão, aprovamos
  if (INCLUDES.some(inc => lowerName.includes(inc))) {
    return true;
  }
  
  return false;
}

async function fetchAllExercises() {
  let allData = [];
  let from = 0;
  const step = 1000;
  
  while (true) {
    const { data, error } = await supabase.from('exercises').select('*').range(from, from + step - 1);
    if (error) {
      throw error;
    }
    if (!data || data.length === 0) {
      break;
    }
    allData = allData.concat(data);
    from += step;
    
    // Safety break just in case
    if (data.length < step) {
      break;
    }
  }
  return allData;
}

async function main() {
  try {
    console.log("Buscando exercícios cadastrados com paginação...");
    const exercises = await fetchAllExercises();

    console.log(`Encontrados ${exercises.length} exercícios no banco.`);
    
    // Filtra apenas os exercícios originais (não os que já são "Treino em Casa" nem os FOLDER_META)
    const originalExercises = exercises.filter(ex => 
      ex.name !== '_FOLDER_META_' && 
      ex.name !== '_FOLDER_BLOCKED_' &&
      ex.muscle_group !== 'Treino em Casa'
    );

    const homeWorkouts = originalExercises.filter(ex => isHomeWorkout(ex.name));

    console.log(`Foram identificados ${homeWorkouts.length} exercícios que podem ser feitos em casa.`);
    
    // Delete existing 'Treino em Casa' exercises first to avoid duplicates
    console.log("Limpando exercícios existentes de 'Treino em Casa' (que não são FOLDER_META)...");
    await supabase.from('exercises').delete().eq('muscle_group', 'Treino em Casa').neq('name', '_FOLDER_META_');

    if (homeWorkouts.length === 0) {
      console.log("Nenhum exercício encontrado. Encerrando.");
      return;
    }

    // Criar array para inserção (vamos duplicar para a pasta Treino em Casa)
    const toInsert = homeWorkouts.map(ex => {
      // Cria uma cópia ignorando o campo 'id' e 'created_at' para o supabase gerar novos
      return {
        name: ex.name,
        muscle_group: 'Treino em Casa', // A pasta nova
        description: ex.description,
        media_url: ex.media_url,
        media_type: ex.media_type,
        target_gender: ex.target_gender,
        is_premium: ex.is_premium,
        release_date: ex.release_date
      };
    });

    console.log("Iniciando inserção no banco...");
    
    // Supabase permite inserir no máximo alguns milhares de uma vez. Para segurança, faremos em lotes de 500
    const chunkSize = 500;
    let totalInserted = 0;
    for (let i = 0; i < toInsert.length; i += chunkSize) {
      const chunk = toInsert.slice(i, i + chunkSize);
      const { error: insertError } = await supabase.from('exercises').insert(chunk);
      
      if (insertError) {
        console.error("Erro ao inserir lote:", insertError);
      } else {
        totalInserted += chunk.length;
        console.log(`Inseridos ${totalInserted}/${toInsert.length}...`);
      }
    }
    
    console.log(`\nConcluído! ${totalInserted} exercícios copiados para a pasta "Treino em Casa"!`);
    
  } catch (err) {
    console.error("Erro no script:", err);
  }
}

main();
