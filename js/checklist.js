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

  let locais = [];

  carregarChecklist();

    async function carregarChecklist() {
        const { data, error } = await window.supabaseClient
            .from("locais_ambiente")
            .select(`
            id,
            nome_exibicao,
            itens_ambiente (
                id,
                nome_item,
                quantidade,
                descricao
            )
            `)
            .eq("ambiente_id", ambienteId)
            .order("nome_exibicao", { ascending: true });

        if (error) {
            alert("Erro ao carregar checklist.");
            console.error(error);
            return;
        }

        locais = data || [];
        renderizar();
    }


  function renderizar() {
    lista.innerHTML = "";

    locais.forEach(local => {

      const bloco = document.createElement("div");
      bloco.className = "card-opcao";
      bloco.style.textAlign = "left";

      bloco.innerHTML = `
        <h3 style="margin-bottom:8px;">${local.nome_exibicao}</h3>

        <div style="margin-bottom:10px;">
          <label>
            <input type="radio" name="local_${local.id}" value="OK">
            OK
          </label>
          &nbsp;&nbsp;
          <label>
            <input type="radio" name="local_${local.id}" value="DIVERGENTE">
            Divergente
          </label>
        </div>

        <div class="itens-local" style="display:none;"></div>
      `;

      const itensDiv = bloco.querySelector(".itens-local");
      const radiosLocal = bloco.querySelectorAll(`input[name="local_${local.id}"]`);

      radiosLocal.forEach(radio => {
        radio.addEventListener("change", () => {
          if (radio.value === "DIVERGENTE") {
            itensDiv.style.display = "block";
          } else {
            itensDiv.style.display = "none";
            itensDiv.querySelectorAll("input[value='DIVERGENTE']").forEach(r => r.checked = false);
          }
        });
      });

      // ITENS DO LOCAL
      local.itens_ambiente.forEach(item => {
        const linha = document.createElement("div");
        linha.style.marginBottom = "10px";

        linha.innerHTML = `
          <strong>${item.nome_item}</strong> (${item.quantidade})
          ${item.descricao ? " - " + item.descricao : ""}

          <div>
            <label>
              <input type="radio" name="item_${item.id}" value="OK" required>
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

        const radiosItem = linha.querySelectorAll(`input[name="item_${item.id}"]`);
        const divObs = linha.querySelector(".divergencia");

        radiosItem.forEach(r => {
          r.addEventListener("change", () => {
            if (r.value === "DIVERGENTE") {
              divObs.style.display = "block";
              itensDiv.style.display = "block";
              bloco.querySelector(`input[value="DIVERGENTE"]`).checked = true;
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

    const checklistId = checklist.id;
    const itensSalvar = [];

   document.querySelectorAll("[name^='item_']").forEach(input => {
    if (!input.checked) return;

        const bloco = input.closest("div");
        const nomeItem = bloco.querySelector("strong").innerText;
        const qtd = parseInt(bloco.innerText.match(/\((\d+)\)/)[1]);
        const status = input.value;
        const obsTextarea = bloco.querySelector("textarea");
        const obs = obsTextarea ? obsTextarea.value.trim() : null;

        // 🔴 REGRA: divergente precisa de observação
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


    await window.supabaseClient.from("checklist_itens").insert(itensSalvar);

    alert("Checklist salvo com sucesso!");
    window.location.href = "dashboard.html";
  });

});

function voltarDashboard() {
  window.location.href = "dashboard.html";
}
