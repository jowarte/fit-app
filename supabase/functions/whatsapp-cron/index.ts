import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const daysMap = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
];

serve(async (req) => {
  try {
    // Only allow POST requests (e.g. from pg_cron)
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 })
    }

    const authHeader = req.headers.get('Authorization')
    if (authHeader !== `Bearer ${supabaseServiceKey}`) {
      // return new Response('Unauthorized', { status: 401 })
      // For now we will allow it or depend on pg_cron's secure invocation
    }

    console.log('Iniciando cron job do WhatsApp...');

    // 1. Get current day and time in UTC-3 (Brazil)
    const now = new Date();
    // Adjust for UTC-3
    const brTime = new Date(now.getTime() - (3 * 60 * 60 * 1000));
    
    const dayOfWeek = daysMap[brTime.getUTCDay()];
    
    const hour = brTime.getUTCHours().toString().padStart(2, '0');
    const minute = brTime.getUTCMinutes().toString().padStart(2, '0');
    const currentTime = `${hour}:${minute}`;

    console.log(`Verificando lembretes para ${dayOfWeek} às ${currentTime}`);

    // 2. Fetch active reminders for today and this time
    // We will match exactly the time, or within a 5 minute window if it's running less frequently.
    // Assuming it runs every minute, exact match is fine, or we match HH:00.
    const { data: reminders, error: remError } = await supabase
      .from('whatsapp_reminders')
      .select('*')
      .eq('active', true)
      .in('day_of_week', [dayOfWeek, 'Todos os dias']);

    if (remError) throw remError;

    // Filter reminders by time (e.g., checking if the hour and minute matches, or just the hour if running hourly)
    // To be safe, if the cron runs every hour, we should only match the hour.
    // If we expect exact matches:
    const activeReminders = reminders.filter(r => r.time === currentTime || r.time.startsWith(`${hour}:`));

    if (activeReminders.length === 0) {
      return new Response(JSON.stringify({ message: 'Nenhum lembrete para agora.' }), { status: 200 })
    }

    // 3. Get Evolution API Settings
    const { data: settings, error: setError } = await supabase
      .from('app_settings')
      .select('evolution_api_url, evolution_api_key, evolution_instance, whatsapp_bot_number')
      .eq('id', 1)
      .single();
      
    if (setError) throw setError;
    
    if (!settings.evolution_api_url || !settings.evolution_instance || !settings.evolution_api_key) {
       console.log('Evolution API não configurada.');
       return new Response(JSON.stringify({ message: 'Evolution API não configurada' }), { status: 200 })
    }

    // 4. Get all users who have WhatsApp enabled and a phone number
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id, wa_phone, is_premium, status')
      .eq('wa_enabled', true)
      .not('wa_phone', 'is', null);

    if (userError) throw userError;

    // Filter users who actually have access (premium or trial)
    const eligibleUsers = users.filter(u => u.is_premium || u.status === 'trial');

    if (eligibleUsers.length === 0) {
       return new Response(JSON.stringify({ message: 'Nenhum usuário elegível para receber.' }), { status: 200 })
    }

    let sentCount = 0;

    // 5. Send messages
    for (const reminder of activeReminders) {
      for (const user of eligibleUsers) {
        // If reminder is personal, only send to the owner
        if (reminder.user_id && reminder.user_id !== user.id) {
          continue;
        }

        // Clean phone number
        const cleanNumber = user.wa_phone.replace(/\D/g, '');
        
        // Evolution API endpoint for sending text message
        const endpoint = `${settings.evolution_api_url.replace(/\/$/, '')}/message/sendText/${settings.evolution_instance}`;
        
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': settings.evolution_api_key
            },
            body: JSON.stringify({
              number: cleanNumber,
              options: {
                delay: 1200,
                presence: 'composing'
              },
              textMessage: {
                text: reminder.message
              }
            })
          });
          
          if (res.ok) {
            sentCount++;
          } else {
            const errBody = await res.text();
            console.error(`Erro ao enviar para ${cleanNumber}:`, errBody);
          }
        } catch (e) {
          console.error(`Falha de rede ao enviar para ${cleanNumber}:`, e);
        }
      }
    }

    return new Response(JSON.stringify({ success: true, sent: sentCount }), { status: 200 })

  } catch (err) {
    console.error('Erro interno:', err.message)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
