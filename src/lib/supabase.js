import { createClient } from '@supabase/supabase-js'

// Leemos las variables del archivo .env
const supabaseUrl = import.meta.env.SUPABASE_URL
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY

// Creamos una conexión única
export const supabase = createClient(supabaseUrl, supabaseAnonKey)