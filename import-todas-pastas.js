import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://prmmoqipyyvuekxvhspu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybW1vcWlweXl2dWVreHZoc3B1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MzU5NzksImV4cCI6MjEwMDMxMTk3OX0.SL_Iouh5IJnKTKsjaU3cU7pJXzWR2KgR-75Sa2YUNmk';
const supabase = createClient(supabaseUrl, supabaseKey);

const foldersToInclude = [
  'EXERCÍCIOS-mulher realista',
  'FAIXA DE RESISTÊNCIA GLÚTEOS-mulher realista',
  'GIFS HOMEM-realistas',
  'DINÂMICO,mulher realista',
  'EXERCICIOS GIRLS'
];

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
    
    if (data.length < step) {
      break;
    }
  }
  return allData;
}

async function main() {
  try {
    console.log("Buscando todos os exercícios...");
    const exercises = await fetchAllExercises();
    console.log(`Encontrados ${exercises.length} exercícios no banco.`);

    // Pegar o que já está no Treino em Casa para não duplicar a mesma mídia
    const currentHomeWorkouts = exercises.filter(ex => ex.muscle_group === 'Treino em Casa');
    const existingMediaUrls = new Set(currentHomeWorkouts.map(ex => ex.media_url));

    // Filtrar os exercícios originais (que não são Treino em Casa) que pertencem às pastas solicitadas
    const originalExercises = exercises.filter(ex => 
      ex.name !== '_FOLDER_META_' && 
      ex.name !== '_FOLDER_BLOCKED_' &&
      ex.muscle_group !== 'Treino em Casa'
    );

    const toAdd = originalExercises.filter(ex => {
      // Se a media_url contém o nome de alguma das pastas solicitadas
      const matchesFolder = foldersToInclude.some(folder => ex.media_url && ex.media_url.includes(folder));
      // E se ainda não foi adicionado ao Treino em Casa
      return matchesFolder && !existingMediaUrls.has(ex.media_url);
    });

    console.log(`Foram identificados ${toAdd.length} NOVOS exercícios dessas pastas para adicionar no Treino em Casa.`);

    if (toAdd.length === 0) {
      console.log("Nenhum exercício novo encontrado. Encerrando.");
      return;
    }

    const toInsert = toAdd.map(ex => {
      return {
        name: ex.name,
        muscle_group: 'Treino em Casa',
        description: ex.description,
        media_url: ex.media_url,
        media_type: ex.media_type,
        target_gender: ex.target_gender,
        is_premium: ex.is_premium,
        release_date: ex.release_date
      };
    });

    console.log("Iniciando inserção no banco...");
    
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
    
    console.log(`\nConcluído! ${totalInserted} exercícios das pastas específicas foram copiados para a pasta "Treino em Casa"!`);
    
  } catch (err) {
    console.error("Erro no script:", err);
  }
}

main();
