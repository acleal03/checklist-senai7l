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
    card.style.textAlign = "left";

    card.innerHTML = `
      <h3>${local.nome_exibicao}</h3>

      <div class="local-status">
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

    /* ===============================
       ITENS (SEMPRE VISÍVEIS)
       =============================== */
    local.ambiente_itens.forEach(item => {

      const linha = document.createElement("div");
      linha.className = "item-check";

      linha.innerHTML = `
        <strong>${item.nome_item}</strong> (${item.quantidade})
        ${item.descricao ? " - " + item.descricao : ""}

        <div class="item-status">
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
          } else {
            divObs.style.display = "none";
            divObs.querySelector("textarea").value = "";
            linha.classList.remove("divergente");
          }

        });
      });

      itensDiv.appendChild(linha);
    });

    lista.appendChild(card);
  });

  const radioLocalOk = card.querySelector(
    `input[name="local_${local.id}"][value="OK"]`
  );

  radioLocalOk.addEventListener("change", () => {
    itensDiv.querySelectorAll("input[value='OK']").forEach(r => {
      r.checked = true;
    });

    itensDiv.querySelectorAll(".divergencia").forEach(div => {
      div.style.display = "none";
      const txt = div.querySelector("textarea");
      if (txt) txt.value = "";
    });
  });

  /* ===============================
     SALVAR CHECKLIST
     =============================== */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const observacoes = document.getElementById("observacoes").value;
    const agora = new Date();

    const radiosItens = document.querySelectorAll("[name^='item_']");

    for (let i = 0; i < radiosItens.length; i += 2) {
      const r1 = radiosItens[i];
      const r2 = radiosItens[i + 1];

      if (!r1.checked && !r2.checked) {
        alert("Existem itens sem conferência (OK ou Divergente).");
        return;
      }
    }

    /* 1️⃣ CABEÇALHO */
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

    const checklistId = checklist.id;

    /* 2️⃣ SALVAR STATUS DOS LOCAIS */
    const locaisSalvar = [];

    locais.forEach(local => {
      const status = document.querySelector(
        `input[name="local_${local.id}"]:checked`
      ).value;

      locaisSalvar.push({
        checklist_id: checklistId,
        local_id: local.id,
        status
      });
    });

    await window.supabaseClient
      .from("checklist_locais")
      .insert(locaisSalvar);

    /* 3️⃣ SALVAR ITENS */
    const itensSalvar = [];

    document.querySelectorAll("[name^='item_']:checked").forEach(input => {

      const bloco = input.closest(".item-linha");
      const nomeItem = bloco.querySelector("strong").innerText;
      const qtd = parseInt(bloco.innerText.match(/\((\d+)\)/)[1]);
      const status = input.value;
      const obsTextarea = bloco.querySelector("textarea");
      const obs = obsTextarea ? obsTextarea.value.trim() : null;

      if (status === "DIVERGENTE" && !obs) {
        alert(`Informe a divergência do item: ${nomeItem}`);
        obsTextarea.focus();
        throw new Error("Checklist inválido");
      }

      itensSalvar.push({
        checklist_id: checklistId,
        nome_item: nomeItem,
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
