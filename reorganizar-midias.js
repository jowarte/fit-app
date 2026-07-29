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
    
    console.log(`Encontradas ${folders.length} pastas principais. Coletando dados...`);

    const recordsToInsert = [];

    for (const folder of folders) {
      const folderPath = path.join(baseFolder, folder);
      const cleanName = cleanCategoryName(folder);
      
      const lowerFolder = folder.toLowerCase();
      
      let explicitGender = null;
      if (lowerFolder.includes('mulher')) {
          explicitGender = 'Mulher';
      } else if (lowerFolder.includes('homem')) {
          explicitGender = 'Homem';
      }

      const items = fs.readdirSync(folderPath, { withFileTypes: true });
      
      for (const item of items) {
          if (item.isFile()) {
              const ext = path.extname(item.name);
              const mediaType = getMediaType(ext);
              if (!mediaType) continue;

              let name = path.basename(item.name, ext);
              name = name.charAt(0).toUpperCase() + name.slice(1);

              const gender = explicitGender || 'Homem';
              
              recordsToInsert.push({
                  name: name,
                  muscle_group: `${cleanName} ${gender}`,
                  media_type: mediaType,
                  media_url: `${publicBaseUrl}/${folder}/${item.name}`,
                  target_gender: gender,
                  description: ''
              });

          } else if (item.isDirectory() && item.name.toLowerCase() === 'mulher') {
              const subfolderPath = path.join(folderPath, item.name);
              const subItems = fs.readdirSync(subfolderPath, { withFileTypes: true });
              
              for (const subItem of subItems) {
                  if (subItem.isFile()) {
                      const ext = path.extname(subItem.name);
                      const mediaType = getMediaType(ext);
                      if (!mediaType) continue;

                      let name = path.basename(subItem.name, ext);
                      name = name.charAt(0).toUpperCase() + name.slice(1);

                      recordsToInsert.push({
                          name: name,
                          muscle_group: `${cleanName} Mulher`,
                          media_type: mediaType,
                          media_url: `${publicBaseUrl}/${folder}/${item.name}/${subItem.name}`,
                          target_gender: 'Mulher',
                          description: ''
                      });
                  }
              }
          }
      }
    }
    
    console.log(`Total de ${recordsToInsert.length} arquivos prontos para inserção.`);
    console.log("Iniciando inserção em lote...");
    
    const chunkSize = 500;
    let totalInserted = 0;
    for (let i = 0; i < recordsToInsert.length; i += chunkSize) {
      const chunk = recordsToInsert.slice(i, i + chunkSize);
      const { error: insertError } = await supabase.from('exercises').insert(chunk);
      
      if (insertError) {
        console.error("Erro ao inserir lote:", insertError);
      } else {
        totalInserted += chunk.length;
        console.log(`Inseridos ${totalInserted}/${recordsToInsert.length}...`);
      }
    }
    
    console.log(`\nProcesso concluído com SUCESSO! ${totalInserted} exercícios cadastrados.`);
  } catch (err) {
    console.error('Erro no script:', err);
  }
}

main();
