import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;

// Client-side (anon key, respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side (secret key, bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey);
