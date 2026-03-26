import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key (first 20 chars):', supabaseAnonKey?.substring(0, 20) + '...')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase credentials are missing. Please add them to your .env file.")
}

// Check if the key looks valid (should start with 'eyJ' for JWT)
if (supabaseAnonKey && !supabaseAnonKey.startsWith('eyJ')) {
  console.warn("WARNING: Your Supabase anon key doesn't look like a valid JWT token. It should start with 'eyJ'. Please check your Supabase dashboard for the correct anon/public key.")
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)
