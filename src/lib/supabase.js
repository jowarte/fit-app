import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
  'https://zzjhrngwpzayirqreznx.supabase.co'

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  'sb_publishable_LmfshKn2vgPjubLeCdfNEg_B7JZn2dS'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
