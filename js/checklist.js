// js/checklist.js
document.addEventListener("DOMContentLoaded", async () => {

  const ambienteId = sessionStorage.getItem("ambiente_id");
  const ambienteCodigo = sessionStorage.getItem("ambiente_codigo");
  const ambienteDescricao = sessionStorage.getItem("ambiente_descricao");
  const usuarioId = sessionStorage.getItem("usuario_id");

  document.getElementById("tituloAmbiente").textContent =
    `${ambienteCodigo} - ${ambienteDescricao}`;

  const lista = document.getElementById("listaItens");

  /* ===============================
     1️⃣ BUSCAR LOCAIS DO AMBIENTE
     =============================== */
  const { data: locais, error: erroLocais } = await window.supabaseClient
    .from("locais_ambiente")
    .select("id, nome_exibicao")
    .eq("ambiente_id", ambienteId)
    .order("nome_exibicao", { ascending: true });

  if (erroLocais) {
    alert("Erro ao carregar locais");
    console.error(erroLocais);
    return;
  }

  /* ===============================
     2️⃣ BUSCAR ITENS DO AMBIENTE
     =============================== */
  const { data: itens, error: erroItens } = await window.supabaseClient
    .from("ambiente_itens")
    .select("id, nome_item, quantidade, descricao, local_id")
    .eq("ambiente_id", ambienteId);

  if (erroItens) {
    alert("Erro ao carregar itens");
    console.error(erroItens);
    return;
  }

  /* ===============================
     3️⃣ AGRUPAR ITENS POR LOCAL
     =============================== */
  const mapaItensPorLocal = {};
  itens.forEach(item => {
    if (!mapaItensPorLocal[item.local_id]) {
      mapaItensPorLocal[item.local_id] = [];
    }
    mapaItensPorLocal[item.local_id].push(item);
  });

  /* ===============================
     4️⃣ RENDERIZAÇÃO FINAL
     =============================== */
  lista.innerHTML = "";

  locais.forEach(local => {

    const card = document.createElement("div");
    card.className = "card-opcao";
    card.style.textAlign = "left";

    card.innerHTML = `
      <h3>${local.nome_exibicao}</h3>

      <div style="margin-bottom:10px;">
        <label>
          <input type="radio" name="local_${local.id}" value="OK" checked>
          OK
        </label>
        &nbsp;&nbsp;
        <label>
          <input type="radio" name="local_${local.id}" value="DIVERGENTE">
          Divergente
        </label>
      </div>

      <div class="itens-local"></div>
    `;

    const itensDiv = card.querySelector(".itens-local");
    const itensDoLocal = mapaItensPorLocal[local.id] || [];

    if (itensDoLocal.length === 0) {
      itensDiv.innerHTML = `<p style="color:#94a3b8;">Nenhum item cadastrado.</p>`;
    }

    itensDoLocal.forEach(item => {

      const linha = document.createElement("div");
      linha.style.marginBottom = "12px";

      linha.innerHTML = `
        <strong>${item.nome_item}</strong> (${item.quantidade})
        ${item.descricao ? " - " + item.descricao : ""}

        <div>
          <label>
            <input type="radio" name="item_${item.id}" value="OK" checked>
            OK
          </label>
          &nbsp;&nbsp;
          <label>
            <input type="radio" name="item_${item.id}" value="DIVERGENTE">
            Divergente
          </label>
        </div>

        <div class="divergencia" style="display:none; margin-top:6px;">
          <textarea rows="2" placeholder="Descreva a divergência" style="width:100%;"></textarea>
        </div>
      `;

      const radios = linha.querySelectorAll(`input[name="item_${item.id}"]`);
      const divObs = linha.querySelector(".divergencia");

      radios.forEach(r => {
        r.addEventListener("change", () => {
          if (r.value === "DIVERGENTE") {
            divObs.style.display = "block";
            card.querySelector(`input[name="local_${local.id}"][value="DIVERGENTE"]`).checked = true;
          } else {
            divObs.style.display = "none";
            divObs.querySelector("textarea").value = "";
          }
        });
      });

      itensDiv.appendChild(linha);
    });

    lista.appendChild(card);
  });

});

function voltarDashboard() {
  window.location.href = "dashboard.html";
}
