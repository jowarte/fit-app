import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://prmmoqipyyvuekxvhspu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybW1vcWlweXl2dWVreHZoc3B1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MzU5NzksImV4cCI6MjEwMDMxMTk3OX0.SL_Iouh5IJnKTKsjaU3cU7pJXzWR2KgR-75Sa2YUNmk';
const supabase = createClient(supabaseUrl, supabaseKey);

const baseFolder = 'c:/Users/jow/Documents/TREINO/midia/1';

async function main() {
  try {
    const folders = fs.readdirSync(baseFolder, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    console.log(`Encontradas ${folders.length} categorias. Iniciando importação...`);

    let totalInserted = 0;

    for (const folder of folders) {
      // Ignorar a pasta abdominal pois já foi importada
      if (folder.toLowerCase() === 'abdominal') {
        console.log(`Pulando 'abdominal' (já importado)`);
        continue;
      }

      const folderPath = path.join(baseFolder, folder);
      const files = fs.readdirSync(folderPath);
      
      // Capitalizar categoria (ex: "costas" -> "Costas")
      let categoryName = folder.charAt(0).toUpperCase() + folder.slice(1);
      
      console.log(`\nImportando categoria: ${categoryName} (${files.length} arquivos)`);

      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        
        // Determina o tipo de mídia
        let mediaType = 'local_video';
        if (ext === '.gif' || ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
          mediaType = 'gif';
        } else if (ext !== '.mp4' && ext !== '.webm' && ext !== '.mov') {
          console.log(`Ignorando arquivo não suportado: ${file}`);
          continue;
        }

        // Nome do exercício (remove extensão e capitaliza a primeira letra)
        let name = path.basename(file, ext);
        name = name.charAt(0).toUpperCase() + name.slice(1);

        // URL baseada na rota do Vite
        const mediaUrl = `/midia/1/${folder}/${file}`;

        const { data, error } = await supabase
          .from('exercises')
          .insert([
            {
              name: name,
              muscle_group: categoryName,
              media_type: mediaType,
              media_url: mediaUrl,
              description: ''
            }
          ]);

        if (error) {
          console.error(`Erro ao inserir ${name}:`, error.message);
        } else {
          totalInserted++;
        }
      }
    }
    
    console.log(`\nProcesso concluído! ${totalInserted} novos exercícios importados.`);
  } catch (err) {
    console.error('Erro no script:', err);
  }
}

main();
