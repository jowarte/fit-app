import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://prmmoqipyyvuekxvhspu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybW1vcWlweXl2dWVreHZoc3B1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MzU5NzksImV4cCI6MjEwMDMxMTk3OX0.SL_Iouh5IJnKTKsjaU3cU7pJXzWR2KgR-75Sa2YUNmk';
const supabase = createClient(supabaseUrl, supabaseKey);

const folderPath = 'c:/Users/jow/Documents/TREINO/midia/1/abdominal';
const category = 'Abdominal';

async function main() {
  try {
    const files = fs.readdirSync(folderPath);
    
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      
      // Determina o tipo de mídia
      let mediaType = 'local_video';
      if (ext === '.gif' || ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
        mediaType = 'gif';
      }

      // Nome do exercício (remove extensão e capitaliza)
      let name = path.basename(file, ext);
      name = name.charAt(0).toUpperCase() + name.slice(1);

      // URL baseada na rota do Vite a partir da raiz
      const mediaUrl = `/midia/1/abdominal/${file}`;

      const { data, error } = await supabase
        .from('exercises')
        .insert([
          {
            name: name,
            muscle_group: category,
            media_type: mediaType,
            media_url: mediaUrl,
            description: ''
          }
        ]);

      if (error) {
        console.error(`Erro ao inserir ${name}:`, error.message);
      } else {
        console.log(`Inserido com sucesso: ${name}`);
      }
    }
    
    console.log('Processo concluído!');
  } catch (err) {
    console.error('Erro no script:', err);
  }
}

main();
