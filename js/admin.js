// js/admin.js

function irAmbientesAdmin() {
  window.location.href = "admin_ambientes.html";
}

function irItensAmbientes() {
  window.location.href = "admin_itens.html";
}

function irUsuarios() {
  window.location.href = "admin_usuarios.html";
}

function voltarAmbientes() {
  window.location.href = "ambientes.html";
}

function sairSistema() {
  sessionStorage.clear();
  window.location.href = "index.html";
}
