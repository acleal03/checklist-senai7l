// js/admin_ambientes.js

let ambienteEditando = null;

document.addEventListener("DOMContentLoaded", () => {
  carregarAmbientes();
});

async function carregarAmbientes() {
  const { data, error } = await window.supabaseClient
    .from("ambientes")
    .select("*")
    .order("codigo", { ascending: true });

  if (error) {
    alert("Erro ao carregar ambientes");
    return;
  }

  const lista = document.getElementById("listaAmbientes");
  lista.innerHTML = "";

  data.forEach(ambiente => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <strong>${ambiente.codigo}</strong><br>
      ${ambiente.descricao || ""}<br><br>

      <button class="botao" onclick="editarAmbiente('${ambiente.id}', '${ambiente.codigo}', '${ambiente.descricao || ""}')">✏️ Editar</button>
      <button class="botao botao-perigo" onclick="excluirAmbiente('${ambiente.id}')">🗑️ Excluir</button>
    `;

    lista.appendChild(div);
  });
}

async function salvarAmbiente() {
  const codigo = document.getElementById("codigo").value.trim();
  const descricao = document.getElementById("descricao").value.trim();

  if (!codigo) {
    alert("Informe o código do ambiente.");
    return;
  }

  let result;

  if (ambienteEditando) {
    result = await window.supabaseClient
      .from("ambientes")
      .update({ codigo, descricao })
      .eq("id", ambienteEditando);
  } else {
    result = await window.supabaseClient
      .from("ambientes")
      .insert([{ codigo, descricao }]);
  }

  if (result.error) {
    alert("Erro ao salvar ambiente.");
    return;
  }

  document.getElementById("codigo").value = "";
  document.getElementById("descricao").value = "";
  ambienteEditando = null;

  carregarAmbientes();

  // FLUXO INTELIGENTE
  if (confirm("Ambiente salvo com sucesso.\nDeseja cadastrar itens para este ambiente agora?")) {
    // redireciona já com ambiente selecionado
    sessionStorage.setItem("ambiente_codigo_admin", codigo);
    window.location.href = "admin_itens.html";
  }
}

function editarAmbiente(id, codigo, descricao) {
  ambienteEditando = id;
  document.getElementById("codigo").value = codigo;
  document.getElementById("descricao").value = descricao;
}

async function excluirAmbiente(id) {
  if (!confirm("Confirma exclusão do ambiente?")) return;

  const { error } = await window.supabaseClient
    .from("ambientes")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Não foi possível excluir o ambiente.");
    return;
  }

  carregarAmbientes();
}

function voltarAdmin() {
  window.location.href = "admin.html";
}

function sairSistema() {
  sessionStorage.clear();
  window.location.href = "index.html";
}
