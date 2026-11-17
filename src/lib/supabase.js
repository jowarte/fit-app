import { createClient } from '@supabase/supabase-js'

const envUrl = import.meta.env.VITE_SUPABASE_URL
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Ignora a URL antiga/inativa 'bzzypmezmzbrcsiwsvhc' que estava salva na Vercel
const isOldBrokenUrl = envUrl && envUrl.includes('bzzypmezmzbrcsiwsvhc')

export const SUPABASE_URL = (envUrl && !isOldBrokenUrl)
  ? envUrl 
  : 'https://zzjhrngwpzayirqreznx.supabase.co'

export const SUPABASE_ANON_KEY = (envKey && !isOldBrokenUrl)
  ? envKey 
  : 'sb_publishable_LmfshKn2vgPjubLeCdfNEg_B7JZn2dS'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
