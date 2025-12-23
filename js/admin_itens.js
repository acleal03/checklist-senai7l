// js/admin_itens.js
console.log("admin_itens.js carregado");

let ambienteSelecionado = null;
let locais = [];
let itemEditando = null;

/* ============================= */
/* INIT                          */
/* ============================= */

document.addEventListener("DOMContentLoaded", () => {
  carregarAmbientes();
});

/* ============================= */
/* AMBIENTES                     */
/* ============================= */

async function carregarAmbientes() {
  const { data, error } = await window.supabaseClient
    .from("ambientes")
    .select("id, codigo, descricao")
    .order("codigo");

  if (error) {
    alert("Erro ao carregar ambientes");
    console.error(error);
    return;
  }

  const select = document.getElementById("selectAmbiente");
  data.forEach(a => {
    const opt = document.createElement("option");
    opt.value = a.id;
    opt.textContent = `${a.codigo} - ${a.descricao}`;
    select.appendChild(opt);
  });

  select.addEventListener("change", () => {
    ambienteSelecionado = select.value || null;
    if (ambienteSelecionado) {
      document.getElementById("botoesLocais").style.display = "flex";
      document.getElementById("formItem").style.display = "block";
      garantirLocalPadrao();
      carregarLocais();
    } else {
      document.getElementById("botoesLocais").style.display = "none";
      document.getElementById("formItem").style.display = "none";
      document.getElementById("listaLocais").innerHTML = "";
    }
  });
}

/* ============================= */
/* LOCAIS                        */
/* ============================= */

async function garantirLocalPadrao() {
  const { data } = await window.supabaseClient
    .from("locais_ambiente")
    .select("id")
    .eq("ambiente_id", ambienteSelecionado)
    .eq("tipo_local", "ambiente")
    .limit(1);

  if (!data || data.length === 0) {
    await window.supabaseClient.from("locais_ambiente").insert({
      ambiente_id: ambienteSelecionado,
      tipo_local: "ambiente",
      nome_exibicao: "Itens do Ambiente",
      ordem: 0
    });
  }
}

async function criarLocal(tipo) {
  const { data } = await window.supabaseClient
    .from("locais_ambiente")
    .select("identificador")
    .eq("ambiente_id", ambienteSelecionado)
    .eq("tipo_local", tipo);

  const proximo = (data?.length || 0) + 1;
  const identificador = tipo === "ambiente" ? null : String(proximo).padStart(2, "0");
  const nome = tipo === "ambiente"
    ? "Itens do Ambiente"
    : `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} ${identificador}`;

  await window.supabaseClient.from("locais_ambiente").insert({
    ambiente_id: ambienteSelecionado,
    tipo_local: tipo,
    identificador,
    nome_exibicao: nome,
    ordem: proximo
  });

  carregarLocais();
}

/* ============================= */
/* ITENS                         */
/* ============================= */

async function carregarLocais() {
  const { data, error } = await window.supabaseClient
    .from("locais_ambiente")
    .select(`
      id,
      nome_exibicao,
      ordem,
      itens_ambiente (
        id,
        nome_item,
        quantidade,
        descricao
      )
    `)
    .eq("ambiente_id", ambienteSelecionado)
    .order("ordem");

  if (error) {
    alert("Erro ao carregar locais");
    console.error(error);
    return;
  }

  locais = data || [];
  montarSelectLocais();
  renderizarLista();
}

function montarSelectLocais() {
  const select = document.getElementById("selectLocal");
  select.innerHTML = "";

  locais.forEach(l => {
    const opt = document.createElement("option");
    opt.value = l.id;
    opt.textContent = l.nome_exibicao;
    select.appendChild(opt);
  });
}

async function salvarItem() {
  const nome = document.getElementById("nomeItem").value.trim();
  const qtd = parseInt(document.getElementById("quantidadeItem").value);
  const desc = document.getElementById("descricaoItem").value.trim();
  const localId = document.getElementById("selectLocal").value;

  if (!nome || !qtd || !localId) {
    alert("Preencha os campos obrigatórios.");
    return;
  }

  const payload = {
    ambiente_id: ambienteSelecionado,
    local_id: localId,
    nome_item: nome,
    quantidade: qtd,
    descricao: desc || null
  };

  if (itemEditando) {
    await window.supabaseClient
      .from("itens_ambiente")
      .update(payload)
      .eq("id", itemEditando);
  } else {
    await window.supabaseClient
      .from("itens_ambiente")
      .insert(payload);
  }

  itemEditando = null;
  document.getElementById("nomeItem").value = "";
  document.getElementById("quantidadeItem").value = "";
  document.getElementById("descricaoItem").value = "";

  carregarLocais();
}

/* ============================= */
/* UI                            */
/* ============================= */

function renderizarLista() {
  const lista = document.getElementById("listaLocais");
  lista.innerHTML = "";

  locais.forEach(local => {
    const bloco = document.createElement("div");
    bloco.className = "local-bloco";

    // Cabeçalho do local
    bloco.innerHTML = `
      <div class="local-header">
        <div class="local-titulo">${local.nome_exibicao}</div>
        <button
          class="botao botao-perigo botao-local-excluir"
          onclick="excluirLocal('${local.id}', ${local.itens_ambiente.length})"
          title="Excluir local"
        >
          🗑️
        </button>
      </div>
    `;

    // Itens do local
    if (local.itens_ambiente && local.itens_ambiente.length > 0) {
      local.itens_ambiente.forEach(item => {
        const linha = document.createElement("div");
        linha.className = "item-linha";

        linha.innerHTML = `
          <div class="item-info">
            ${item.nome_item} (${item.quantidade})
            ${item.descricao ? " - " + item.descricao : ""}
          </div>

          <div class="item-acoes">
            <button class="botao"
              onclick="editarItem(
                '${item.id}',
                '${item.nome_item}',
                ${item.quantidade},
                '${item.descricao || ""}',
                '${local.id}'
              )">
              ✏️
            </button>

            <button class="botao botao-perigo"
              onclick="excluirItem('${item.id}')">
              🗑️
            </button>
          </div>
        `;

        bloco.appendChild(linha);
      });
    } else {
      bloco.innerHTML += `
        <p style="color:#94a3b8; margin-top:8px;">
          Nenhum item cadastrado.
        </p>
      `;
    }

    lista.appendChild(bloco);
  });
}

function editarItem(id, nome, qtd, desc, localId) {
  itemEditando = id;
  document.getElementById("nomeItem").value = nome;
  document.getElementById("quantidadeItem").value = qtd;
  document.getElementById("descricaoItem").value = desc;
  document.getElementById("selectLocal").value = localId;
}

async function excluirItem(id) {
  if (!confirm("Excluir este item?")) return;

  await window.supabaseClient
    .from("itens_ambiente")
    .delete()
    .eq("id", id);

  carregarLocais();
}

async function excluirLocal(localId, totalItens) {

  if (totalItens > 0) {
    alert("Não é possível excluir este local porque existem itens cadastrados nele.");
    return;
  }

  if (!confirm("Confirma exclusão deste local?")) return;

  const { error } = await window.supabaseClient
    .from("locais_ambiente")
    .delete()
    .eq("id", localId);

  if (error) {
    alert("Erro ao excluir local.");
    console.error(error);
    return;
  }

  carregarLocais();
}

async function excluirLocal(localId, totalItens) {

  if (totalItens > 0) {
    alert("Não é possível excluir este local porque existem itens cadastrados nele.");
    return;
  }

  if (!confirm("Confirma exclusão deste local?")) return;

  const { error } = await window.supabaseClient
    .from("locais_ambiente")
    .delete()
    .eq("id", localId);

  if (error) {
    alert("Erro ao excluir local.");
    console.error(error);
    return;
  }

  carregarLocais();
}

