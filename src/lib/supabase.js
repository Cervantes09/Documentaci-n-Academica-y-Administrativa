import { createClient } from '@supabase/supabase-js'

// Leemos las variables del archivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Creamos una conexión única
export const supabase = createClient(supabaseUrl, supabaseAnonKey)