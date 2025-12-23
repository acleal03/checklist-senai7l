// js/checklist.js

document.addEventListener("DOMContentLoaded", () => {

  const ambienteId = sessionStorage.getItem("ambiente_id");
  const ambienteCodigo = sessionStorage.getItem("ambiente_codigo");
  const ambienteDescricao = sessionStorage.getItem("ambiente_descricao");
  const usuarioId = sessionStorage.getItem("usuario_id");

  document.getElementById("tituloAmbiente").textContent =
    `${ambienteCodigo} - ${ambienteDescricao}`;

  const lista = document.getElementById("listaItens");
  const form = document.getElementById("formChecklist");

  carregarChecklist();

    async function carregarChecklist() {

        const { data, error } = await window.supabaseClient
            .from("locais_ambiente")
            .select(`
            id,
            nome_exibicao,
            ambiente_itens:ambiente_itens!local_id (
                id,
                nome_item,
                quantidade,
                descricao
            )
            `)
            .eq("ambiente_id", ambienteId)
            .order("nome_exibicao", { ascending: true });

        if (error) {
            console.error("ERRO SUPABASE:", error);
            alert("Erro ao carregar checklist.");
            return;
        }

        console.log("CHECKLIST CARREGADO:", data);
        renderizar(data || []);
    }

  function renderizar(locais) {
    lista.innerHTML = "";

    locais.forEach(local => {

      const bloco = document.createElement("div");
      bloco.className = "card-opcao";
      bloco.style.textAlign = "left";

      bloco.innerHTML = `
        <h3>${local.nome_exibicao}</h3>

        <div style="margin-bottom:12px;">
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

      const itensDiv = bloco.querySelector(".itens-local");

      if (!local.ambiente_itens || local.ambiente_itens.length === 0) {
        itensDiv.innerHTML = `<p style="color:#94a3b8;">Nenhum item cadastrado.</p>`;
      }

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

        radios.forEach(radio => {
          radio.addEventListener("change", () => {

            if (radio.value === "DIVERGENTE") {
              divObs.style.display = "block";
              bloco.querySelector(`input[name="local_${local.id}"][value="DIVERGENTE"]`).checked = true;
            } else {
              divObs.style.display = "none";
              divObs.querySelector("textarea").value = "";
            }
          });
        });

        itensDiv.appendChild(linha);
      });

      lista.appendChild(bloco);
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const observacoesGerais = document.getElementById("observacoes").value;
    const agora = new Date();

    const { data: checklist, error } = await window.supabaseClient
      .from("checklists")
      .insert([{
        usuario_id: usuarioId,
        ambiente_id: ambienteId,
        data_br: agora.toLocaleDateString("pt-BR"),
        hora_br: agora.toLocaleTimeString("pt-BR"),
        observacoes: observacoesGerais
      }])
      .select()
      .single();

    if (error) {
      alert("Erro ao salvar checklist.");
      return;
    }

    const itensSalvar = [];

    document.querySelectorAll("[name^='item_']:checked").forEach(input => {

      const bloco = input.closest("div");
      const nomeItem = bloco.querySelector("strong").innerText;
      const qtd = parseInt(bloco.innerText.match(/\((\d+)\)/)[1]);
      const status = input.value;
      const obs = bloco.querySelector("textarea")?.value || null;

      if (status === "DIVERGENTE" && !obs) {
        alert(`Informe a divergência do item: ${nomeItem}`);
        throw new Error("Checklist inválido");
      }

      itensSalvar.push({
        checklist_id: checklist.id,
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
