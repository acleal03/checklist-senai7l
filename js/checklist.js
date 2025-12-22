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

    carregarItens();

    async function carregarItens() {
        const { data, error } = await window.supabaseClient
            .from("ambiente_itens")
            .select("id, nome_item, quantidade")
            .eq("ambiente_id", ambienteId)
            .order("nome_item");

        if (error) {
            alert("Erro ao carregar itens.");
            console.error(error);
            return;
        }

        lista.innerHTML = "";

        data.forEach(item => {
            const bloco = document.createElement("div");
            bloco.className = "card-opcao";
            bloco.style.textAlign = "left";

            bloco.innerHTML = `
                <strong>${item.nome_item}</strong> (Qtd: ${item.quantidade})

                <div style="margin-top:8px;">
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

                <div class="divergencia" style="display:none; margin-top:8px;">
                    <textarea
                        rows="2"
                        placeholder="Descreva a divergência encontrada"
                        style="width:100%;"
                    ></textarea>
                </div>
            `;

            const radios = bloco.querySelectorAll("input[type=radio]");
            const divDivergencia = bloco.querySelector(".divergencia");

            radios.forEach(radio => {
                radio.addEventListener("change", () => {
                    if (radio.value === "DIVERGENTE") {
                        divDivergencia.style.display = "block";
                    } else {
                        divDivergencia.style.display = "none";
                        divDivergencia.querySelector("textarea").value = "";
                    }
                });
            });

            lista.appendChild(bloco);
        });
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const observacoesGerais = document.getElementById("observacoes").value;

        const agora = new Date();
        const dataBr = agora.toLocaleDateString("pt-BR");
        const horaBr = agora.toLocaleTimeString("pt-BR");

        // Cabeçalho
        const { data: checklist, error } = await window.supabaseClient
            .from("checklists")
            .insert([{
                usuario_id: usuarioId,
                ambiente_id: ambienteId,
                data_br: dataBr,
                hora_br: horaBr,
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

        document.querySelectorAll(".card-opcao").forEach(bloco => {
            const nomeItem = bloco.querySelector("strong").innerText;
            const qtd = parseInt(bloco.innerText.match(/Qtd: (\d+)/)[1]);

            const radioMarcado = bloco.querySelector("input[type=radio]:checked");
            const status = radioMarcado.value;

            const obsItem = bloco.querySelector(".divergencia textarea").value;

            itensSalvar.push({
                checklist_id: checklistId,
                nome_item: nomeItem,
                quantidade: qtd,
                status: status,
                observacao: status === "DIVERGENTE" ? obsItem : null
            });
        });

        const { error: erroItens } = await window.supabaseClient
            .from("checklist_itens")
            .insert(itensSalvar);

        if (erroItens) {
            alert("Checklist salvo, mas erro nos itens.");
            console.error(erroItens);
            return;
        }

        alert("Checklist salvo com sucesso!");
        window.location.href = "dashboard.html";
    });
});

function voltarDashboard() {
    window.location.href = "dashboard.html";
}
