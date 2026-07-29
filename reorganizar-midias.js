import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://prmmoqipyyvuekxvhspu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybW1vcWlweXl2dWVreHZoc3B1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MzU5NzksImV4cCI6MjEwMDMxMTk3OX0.SL_Iouh5IJnKTKsjaU3cU7pJXzWR2KgR-75Sa2YUNmk';
const supabase = createClient(supabaseUrl, supabaseKey);

const baseFolder = 'c:/Users/jow/Documents/TREINO/midia/MAIS DE 3.000 GIFS+ VÍDEOS';
const publicBaseUrl = '/midia/MAIS DE 3.000 GIFS+ VÍDEOS';

// Limpa o nome da pasta (remove número inicial e sufixos)
function cleanCategoryName(folderName) {
  let cleanName = folderName.replace(/^\d+/, '');
  cleanName = cleanName.split('-')[0].split(',')[0].trim();
  return cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();
}

function getMediaType(ext) {
    ext = ext.toLowerCase();
    if (['.gif', '.png', '.jpg', '.jpeg'].includes(ext)) {
        return 'gif';
    } else if (['.mp4', '.webm', '.mov'].includes(ext)) {
        return 'local_video';
    }
    return null;
}

async function insertMedia(name, categoryName, targetGender, mediaType, filePath, folder, subfolder = '') {
  let relativePath = subfolder ? `${folder}/${subfolder}/${filePath}` : `${folder}/${filePath}`;
  const mediaUrl = `${publicBaseUrl}/${relativePath}`;
  
  // A pasta real na UI (muscle_group) será "Categoria Gênero", ex: "Abdominal Homem"
  const muscleGroup = `${categoryName} ${targetGender}`;
  
  const { error } = await supabase
    .from('exercises')
    .insert([{
      name: name,
      muscle_group: muscleGroup,
      media_type: mediaType,
      media_url: mediaUrl,
      target_gender: targetGender,
      description: ''
    }]);

  if (error) {
    console.error(`Erro ao inserir ${name}:`, error.message);
    return false;
  }
  return true;
}

async function main() {
  try {
    console.log("Limpando exercícios existentes para evitar duplicados...");
    const { error: deleteError } = await supabase.from('exercises').delete().not('id', 'is', null);
    if (deleteError) {
        console.error("Erro ao limpar a tabela:", deleteError);
        return;
    }
    console.log("Tabela limpa.");

    const folders = fs.readdirSync(baseFolder, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    console.log(`Encontradas ${folders.length} pastas principais. Iniciando importação...`);

    let totalInserted = 0;

    for (const folder of folders) {
      const folderPath = path.join(baseFolder, folder);
      const cleanName = cleanCategoryName(folder);
      
      const lowerFolder = folder.toLowerCase();
      
      // Checa se o nome da pasta mãe já define o gênero
      let explicitGender = null;
      if (lowerFolder.includes('mulher')) {
          explicitGender = 'Mulher';
      } else if (lowerFolder.includes('homem')) {
          explicitGender = 'Homem';
      }

      console.log(`\nAnalisando pasta: ${folder} (Categoria Base: ${cleanName})`);

      const items = fs.readdirSync(folderPath, { withFileTypes: true });
      
      for (const item of items) {
          if (item.isFile()) {
              const ext = path.extname(item.name);
              const mediaType = getMediaType(ext);
              if (!mediaType) continue;

              let name = path.basename(item.name, ext);
              name = name.charAt(0).toUpperCase() + name.slice(1);

              // Arquivos na raiz da pasta: se a pasta não definir gênero, assumimos Homem
              const gender = explicitGender || 'Homem';
              
              const success = await insertMedia(name, cleanName, gender, mediaType, item.name, folder);
              if (success) totalInserted++;

          } else if (item.isDirectory() && item.name.toLowerCase() === 'mulher') {
              // Subpasta "mulher" encontrada
              const subfolderPath = path.join(folderPath, item.name);
              const subItems = fs.readdirSync(subfolderPath, { withFileTypes: true });
              
              for (const subItem of subItems) {
                  if (subItem.isFile()) {
                      const ext = path.extname(subItem.name);
                      const mediaType = getMediaType(ext);
                      if (!mediaType) continue;

                      let name = path.basename(subItem.name, ext);
                      name = name.charAt(0).toUpperCase() + name.slice(1);

                      const success = await insertMedia(name, cleanName, 'Mulher', mediaType, subItem.name, folder, item.name);
                      if (success) totalInserted++;
                  }
              }
          }
      }
    }
    
    console.log(`\nProcesso concluído! ${totalInserted} novos exercícios importados e divididos por Homem e Mulher.`);
  } catch (err) {
    console.error('Erro no script:', err);
  }
}

main();
