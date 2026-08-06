const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Ler chaves do .env.local
const lines = fs.readFileSync('.env.local', 'utf8').split('\n');
const supabaseUrlLine = lines.find(l => l.includes('VITE_SUPABASE_URL='));
const supabaseKeyLine = lines.find(l => l.includes('VITE_SUPABASE_ANON_KEY='));

const url = supabaseUrlLine ? supabaseUrlLine.split('=')[1].trim() : null;
const key = supabaseKeyLine ? supabaseKeyLine.split('=')[1].trim() : null;

if (!url || !key) {
  console.error('Nao foi possivel encontrar as chaves do Supabase em .env');
  process.exit(1);
}

const supabase = createClient(url, key);

async function run() {
  console.log('Buscando exercícios...');
  let allExercises = [];
  let from = 0;
  const step = 1000;
  
  while (true) {
    const { data, error } = await supabase.from('exercises').select('id, name, is_premium').range(from, from + step - 1);
    if (error) {
      console.error('Erro ao buscar:', error);
      process.exit(1);
    }
    if (!data || data.length === 0) break;
    allExercises = allExercises.concat(data);
    from += step;
    if (data.length < step) break;
  }

  console.log(`Encontrados ${allExercises.length} exercícios.`);

  // Resetar todos para is_premium = false antes para ter uma base limpa (opcional, mas seguro)
  // Vamos apenas focar em definir 70 para premium.
  
  const nameMap = new Map();
  const toBlock = new Set();
  
  // Agrupar por nome
  for (const ex of allExercises) {
    if (ex.name === '_FOLDER_META_' || ex.name === '_FOLDER_BLOCKED_') continue;
    
    const normalizedName = ex.name.trim().toLowerCase();
    if (!nameMap.has(normalizedName)) {
      nameMap.set(normalizedName, []);
    }
    nameMap.get(normalizedName).push(ex);
  }

  // Pegar duplicados
  let duplicateCount = 0;
  for (const [name, list] of nameMap.entries()) {
    if (list.length > 1) {
      // Manter o primeiro, bloquear os outros
      for (let i = 1; i < list.length; i++) {
        toBlock.add(list[i].id);
        duplicateCount++;
      }
    }
  }

  console.log(`${duplicateCount} exercícios duplicados encontrados e marcados para bloqueio.`);

  // Se faltar para 70, pegar outros aleatórios
  if (toBlock.size < 70) {
    const remaining = 70 - toBlock.size;
    console.log(`Faltam ${remaining} para atingir 70. Pegando aleatórios não bloqueados...`);
    
    const unblocked = allExercises.filter(ex => 
      !toBlock.has(ex.id) && 
      ex.name !== '_FOLDER_META_' && 
      ex.name !== '_FOLDER_BLOCKED_'
    );
    
    // Shuffle unblocked
    for (let i = unblocked.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [unblocked[i], unblocked[j]] = [unblocked[j], unblocked[i]];
    }

    for (let i = 0; i < remaining && i < unblocked.length; i++) {
      toBlock.add(unblocked[i].id);
    }
  }

  const finalBlockList = Array.from(toBlock).slice(0, 70); // Garantir exatamente 70 se tiver mais
  console.log(`Total a bloquear: ${finalBlockList.length} exercícios.`);

  // Fazer update
  let updatedCount = 0;
  for (const id of finalBlockList) {
    const { error } = await supabase.from('exercises').update({ is_premium: true }).eq('id', id);
    if (error) {
      console.error(`Erro ao bloquear ${id}:`, error);
    } else {
      updatedCount++;
    }
  }

  console.log(`Pronto! ${updatedCount} exercícios bloqueados com sucesso.`);
}

run();
