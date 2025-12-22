// js/admin_ambientes.js
console.log("admin_ambientes.js CARREGADO");

let ambienteEditando = null;

document.addEventListener("DOMContentLoaded", () => {
  listarAmbientes();
});

async function listarAmbientes() {
  const { data, error } = await window.supabaseClient
    .from("ambientes")
    .select("*")
    .order("codigo", { ascending: true });

  if (error) {
    alert("Erro ao carregar ambientes.");
    console.error(error);
    return;
  }

  const lista = document.getElementById("listaAmbientes");
  lista.innerHTML = "";

  if (!data || data.length === 0) {
    lista.innerHTML = `<p style="text-align:center; color:#94a3b8;">Nenhum ambiente cadastrado.</p>`;
    return;
  }

  data.forEach(ambiente => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <strong>${ambiente.codigo}</strong><br>
      <span>${ambiente.descricao || ""}</span>

      <div style="margin-top:5px; display:flex; gap:10px;">
        <button class="botao" onclick="editarAmbiente('${ambiente.id}', '${ambiente.codigo}', '${ambiente.descricao || ""}')">
          ✏️ Editar
        </button>
        <button class="botao botao-perigo" onclick="excluirAmbiente('${ambiente.id}')">
          🗑️ Excluir
        </button>
      </div>
    `;

    lista.appendChild(card);
  });
}

async function salvarAmbiente() {
  const inputCodigo = document.getElementById("codigo");
  const inputDescricao = document.getElementById("descricao");

  const codigo = inputCodigo.value.trim().toUpperCase();
  const descricao = inputDescricao.value.trim();

  if (!codigo || !descricao) {
    alert("Preencha todos os campos.");
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
      .insert({ codigo, descricao });
  }

  if (result.error) {
    alert("Erro ao salvar ambiente.");
    console.error(result.error);
    return;
  }

  alert("Ambiente salvo com sucesso!");

  inputCodigo.value = "";
  inputDescricao.value = "";
  ambienteEditando = null;

  listarAmbientes();

  if (confirm("Deseja cadastrar itens para este ambiente agora?")) {
    sessionStorage.setItem("ambiente_codigo", codigo);
    window.location.href = "admin_itens.html";
  }
}

function editarAmbiente(id, codigo, descricao) {
  ambienteEditando = id;
  document.getElementById("codigo").value = codigo;
  document.getElementById("descricao").value = descricao;
}

async function excluirAmbiente(id) {
  if (!confirm("Confirma exclusão deste ambiente?")) return;

  const { error } = await window.supabaseClient
    .from("ambientes")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Erro ao excluir ambiente.");
    console.error(error);
    return;
  }

  listarAmbientes();
}

function voltarAdmin() {
  window.location.href = "admin.html";
}

function sairSistema() {
  sessionStorage.clear();
  window.location.href = "index.html";
}
