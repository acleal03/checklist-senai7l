// js/guard.js

(function proteger() {
  const usuario = sessionStorage.getItem("usuario_id");
  if (!usuario) {
    window.location.href = "login.html";
  }
})();

function isAdmin() {
  return sessionStorage.getItem("perfil") === "admin";
}

function usuarioLogado() {
  return {
    id: sessionStorage.getItem("usuario_id"),
    username: sessionStorage.getItem("username"),
    perfil: sessionStorage.getItem("perfil"),
  };
}

function logout() {
  sessionStorage.clear();
  window.location.href = "login.html";
}
