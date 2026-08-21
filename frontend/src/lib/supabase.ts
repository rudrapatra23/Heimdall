import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.BUN_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.BUN_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY. Add them to your .env file.');
}

export const supabase = createClient(
  supabaseUrl ?? '',
  supabaseAnonKey ?? ''
);