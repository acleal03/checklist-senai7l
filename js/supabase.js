// js/supabase.js

const SUPABASE_URL = "https://qcfjzmyqpkrylfpbmsxz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjZmp6bXlxcGtyeWxmcGJtc3h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MDA2MTMsImV4cCI6MjA4MTk3NjYxM30.iYRC6U7wu6ZHHwB1Qt0bIMOu0TSwuvKuR0cJoWLaBBw";

window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);