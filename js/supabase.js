// ========================================
// CONEXÃO COM O SUPABASE
// SISTEMA: SENAI@107A
// ========================================

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// 🔐 SUBSTITUA PELOS DADOS DO SEU PROJETO
const URL_SUPABASE = "https://rwsaqusksbicraimlnri.supabase.co";
const CHAVE_PUBLICA_SUPABASE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3c2FxdXNrc2JpY3JhaW1sbnJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNjg4MjgsImV4cCI6MjA4MTc0NDgyOH0.lOZrAioMQzd7JsV5eIVi35A_tUMdjrq95D0wBtSlhX0";

export const supabase = createClient(
  URL_SUPABASE,
  CHAVE_PUBLICA_SUPABASE
);
