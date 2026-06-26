import { createClient } from "@supabase/supabase-js";

// Retrieve Supabase endpoints from Vite environment configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MjY0NTY0MDAsImV4cCI6MTk0MjAzNjQwMH0.placeholder";

// Export initialized client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Validates whether real Supabase environment credentials have been loaded.
 * If not, the application automatically triggers local reactive fallback states,
 * allowing instant reviews, demo clicks, and perfect local prototype operations.
 */
export const isSupabaseConfigured = () => {
  return (
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_URL !== "" &&
    import.meta.env.VITE_SUPABASE_URL !== "https://placeholder-project.supabase.co" &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    import.meta.env.VITE_SUPABASE_ANON_KEY !== ""
  );
};
