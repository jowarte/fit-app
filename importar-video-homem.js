import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://prmmoqipyyvuekxvhspu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybW1vcWlweXl2dWVreHZoc3B1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MzU5NzksImV4cCI6MjEwMDMxMTk3OX0.SL_Iouh5IJnKTKsjaU3cU7pJXzWR2KgR-75Sa2YUNmk';
const supabase = createClient(supabaseUrl, supabaseKey);

const baseFolder = 'c:/Users/jow/Documents/TREINO/midia/video-homem';
const publicBaseUrl = '/midia/video-homem';

function cleanCategoryName(folderName) {
  let cleanName = folderName.replace(/-homem/i, '').replace(/ homem/i, '').trim();
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
    const folders = fs.readdirSync(baseFolder, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    console.log(`Encontradas ${folders.length} pastas na pasta video-homem. Iniciando importação...`);

    let totalInserted = 0;

    for (const folder of folders) {
      const folderPath = path.join(baseFolder, folder);
      const cleanName = cleanCategoryName(folder);
      
      console.log(`\nAnalisando pasta: ${folder} (Categoria Base: ${cleanName})`);

      const items = fs.readdirSync(folderPath, { withFileTypes: true });
      
      for (const item of items) {
          if (item.isFile()) {
              const ext = path.extname(item.name);
              const mediaType = getMediaType(ext);
              if (!mediaType) continue;

              let name = path.basename(item.name, ext);
              name = name.charAt(0).toUpperCase() + name.slice(1);

              const success = await insertMedia(name, cleanName, 'Homem', mediaType, item.name, folder);
              if (success) totalInserted++;
          }
      }
    }
    
    console.log(`\nProcesso concluído! ${totalInserted} novos exercícios de Homens importados.`);
  } catch (err) {
    console.error('Erro no script:', err);
  }
}

main();
