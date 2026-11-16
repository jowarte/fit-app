import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = 'https://zzjhrngwpzayirqreznx.supabase.co'
export const SUPABASE_ANON_KEY = 'sb_publishable_LmfshKn2vgPjubLeCdfNEg_B7JZn2dS'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
