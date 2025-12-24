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

      card.classList.remove("divergente");
    });

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

      const bloco = input.closest(".item-check");
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
