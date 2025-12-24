// js/checklist.js
document.addEventListener("DOMContentLoaded", async () => {

  const ambienteId = sessionStorage.getItem("ambiente_id");
  const ambienteCodigo = sessionStorage.getItem("ambiente_codigo");
  const ambienteDescricao = sessionStorage.getItem("ambiente_descricao");
  const usuarioId = sessionStorage.getItem("usuario_id");

  document.getElementById("tituloAmbiente").textContent =
    `${ambienteCodigo} - ${ambienteDescricao}`;

  const lista = document.getElementById("listaItens");
  const form = document.getElementById("formChecklist");

  /* ===============================
     BUSCA LOCAIS + ITENS
     =============================== */
  const { data: locais, error } = await window.supabaseClient
    .from("locais_ambiente")
    .select(`
      id,
      nome_exibicao,
      ambiente_itens (
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

  /* ===============================
     RENDERIZAÇÃO
     =============================== */
  locais.forEach(local => {

    const card = document.createElement("div");
    card.className = "card-opcao";

    card.innerHTML = `
      <h3>${local.nome_exibicao}</h3>

      <div class="local-status">
        <label>
          <input type="radio" name="local_${local.id}" value="OK" checked>
          OK
        </label>
        <label>
          <input type="radio" name="local_${local.id}" value="DIVERGENTE">
          Divergente
        </label>
      </div>

      <div class="itens-local"></div>
    `;

    const itensDiv = card.querySelector(".itens-local");

    /* ===============================
       ITENS
       =============================== */
    local.ambiente_itens.forEach(item => {

      const linha = document.createElement("div");
      linha.className = "item-check";

      linha.innerHTML = `
        <strong>${item.nome_item} (${item.quantidade})</strong>
        ${item.descricao ? `<div>${item.descricao}</div>` : ""}

        <div class="item-status">
          <label>
            <input type="radio" name="item_${item.id}" value="OK" checked>
            OK
          </label>
          <label>
            <input type="radio" name="item_${item.id}" value="DIVERGENTE">
            Divergente
          </label>
        </div>

        <div class="divergencia" style="display:none;">
          <textarea rows="2" placeholder="Descreva a divergência"></textarea>
        </div>
      `;

      const radios = linha.querySelectorAll(`input[name="item_${item.id}"]`);
      const divObs = linha.querySelector(".divergencia");

      radios.forEach(radio => {
        radio.addEventListener("change", () => {
          if (radio.value === "DIVERGENTE") {
            divObs.style.display = "block";
            linha.classList.add("divergente");
            card.classList.add("divergente");

            card.querySelector(
              `input[name="local_${local.id}"][value="DIVERGENTE"]`
            ).checked = true;

          } else {
            divObs.style.display = "none";
            divObs.querySelector("textarea").value = "";
            linha.classList.remove("divergente");
          }
        });
      });

      itensDiv.appendChild(linha);
    });

    /* ===============================
       LOCAL OK → LIMPA ITENS
       =============================== */
    const radioLocalOk = card.querySelector(
      `input[name="local_${local.id}"][value="OK"]`
    );

    radioLocalOk.addEventListener("change", () => {
      card.classList.remove("divergente");

      itensDiv.querySelectorAll(".item-check").forEach(item => {
        item.classList.remove("divergente");
        item.querySelector("input[value='OK']").checked = true;

        const div = item.querySelector(".divergencia");
        div.style.display = "none";
        div.querySelector("textarea").value = "";
      });
    });

    lista.appendChild(card);
  });

  /* ===============================
     SALVAR CHECKLIST
     =============================== */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const observacoes = document.getElementById("observacoes").value;
    const agora = new Date();

    const { data: checklist, error } = await window.supabaseClient
      .from("checklists")
      .insert([{
        usuario_id: usuarioId,
        ambiente_id: ambienteId,
        data_br: agora.toLocaleDateString("pt-BR"),
        hora_br: agora.toLocaleTimeString("pt-BR"),
        observacoes
      }])
      .select()
      .single();

    if (error) {
      alert("Erro ao salvar checklist");
      return;
    }

    const itensSalvar = [];

    document.querySelectorAll("[name^='item_']:checked").forEach(input => {

      const bloco = input.closest(".item-check");
      const nomeItem = bloco.querySelector("strong").innerText;
      const qtd = parseInt(nomeItem.match(/\((\d+)\)/)[1]);
      const status = input.value;
      const obs = bloco.querySelector("textarea")?.value || null;

      if (status === "DIVERGENTE" && !obs) {
        alert(`Informe a divergência do item: ${nomeItem}`);
        throw new Error("Checklist inválido");
      }

      itensSalvar.push({
        checklist_id: checklist.id,
        nome_item: nomeItem.replace(/\(\d+\)/, "").trim(),
        quantidade: qtd,
        status,
        observacao: status === "DIVERGENTE" ? obs : null
      });
    });

    await window.supabaseClient
      .from("checklist_itens")
      .insert(itensSalvar);

    alert("Checklist salvo com sucesso!");
    window.location.href = "dashboard.html";
  });

});

function voltarDashboard() {
  window.location.href = "dashboard.html";
}
