import { supabase } from "./supabase.js";

async function realizarLogin() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  const { error } = await supabase.auth.signInWithPassword({
    email: email,
    password: senha
  });

  if (error) {
    alert("Usuário ou senha inválidos.");
  } else {
    window.location.href = "dashboard.html";
  }
}

window.realizarLogin = realizarLogin;
