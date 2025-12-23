document.addEventListener("DOMContentLoaded", async () => {

  const ambienteId = sessionStorage.getItem("ambiente_id");
  const ambienteCodigo = sessionStorage.getItem("ambiente_codigo");
  const ambienteDescricao = sessionStorage.getItem("ambiente_descricao");

  document.getElementById("tituloAmbiente").textContent =
    `${ambienteCodigo} - ${ambienteDescricao}`;

  const lista = document.getElementById("listaItens");

  const { data: locais, error } = await window.supabaseClient
    .from("locais_ambiente")
    .select(`
      id,
      nome_exibicao,
      ambiente_itens!fk_ambiente_itens_local (
        id,
        nome_item,
        quantidade,
        descricao
      )
    `)
    .eq("ambiente_id", ambienteId)
    .order("nome_exibicao", { ascending: true });

  if (error) {
    alert("Erro ao carregar checklist");
    console.error(error);
    return;
  }

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

    local.ambiente_itens.forEach(item => {

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
            card.querySelector(
              `input[name="local_${local.id}"][value="DIVERGENTE"]`
            ).checked = true;
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
