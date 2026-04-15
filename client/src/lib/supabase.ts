"use client";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const hasSupabaseConfig =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== "YOUR_SUPABASE_URL" &&
  supabaseAnonKey !== "YOUR_SUPABASE_ANON_KEY";

export const supabase = createClient(
  hasSupabaseConfig ? supabaseUrl : "https://preview.supabase.co",
  hasSupabaseConfig ? supabaseAnonKey : "preview-anon-key",
  {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  },
);
