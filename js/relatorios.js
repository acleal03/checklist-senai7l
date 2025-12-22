// js/relatorios.js

document.addEventListener("DOMContentLoaded", () => {

    const ambienteId = sessionStorage.getItem("ambiente_id");
    const ambienteCodigo = sessionStorage.getItem("ambiente_codigo");
    const ambienteDescricao = sessionStorage.getItem("ambiente_descricao");

    const usuarioId = sessionStorage.getItem("usuario_id");
    const perfil = sessionStorage.getItem("perfil");

    document.getElementById("tituloAmbiente").innerText =
        `Relatórios de Checklist – ${ambienteCodigo} - ${ambienteDescricao}`;

    carregarRelatorios();

    async function carregarRelatorios() {

        let query = window.supabaseClient
            .from("checklists")
            .select(`
                id,
                data_br,
                hora_br,
                usuario_id,
                usuarios!fk_checklists_usuario (
                    username
                )
            `)
            .eq("ambiente_id", ambienteId);

        // usuário simples vê apenas os seus
        if (perfil !== "admin") {
            query = query.eq("usuario_id", usuarioId);
        }

        const { data, error } = await query;

        if (error) {
            alert("Erro ao carregar relatórios.");
            console.error(error);
            return;
        }

        const lista = document.getElementById("listaRelatorios");
        lista.innerHTML = "";

        if (!data || data.length === 0) {
            lista.innerHTML = "<p>Nenhum checklist encontrado.</p>";
            return;
        }

        // ordena por data + hora (BR)
        data.sort((a, b) => {
            const da = new Date(a.data_br.split('/').reverse().join('-') + ' ' + a.hora_br);
            const db = new Date(b.data_br.split('/').reverse().join('-') + ' ' + b.hora_br);
            return db - da;
        });

        data.forEach(reg => {

            const nomeUsuario = reg.usuarios?.username || "—";

            const linha = document.createElement("div");
            linha.className = "linha-relatorio";

            linha.innerHTML = `
                <div class="col-data">
                    ${reg.data_br}<br>
                    <small>${reg.hora_br}</small>
                </div>

                <div class="col-usuario">
                    ${nomeUsuario}
                </div>

                <div class="col-acoes">
                    <button class="botao" onclick="visualizarChecklist('${reg.id}')">
                        Visualizar
                    </button>
                    <button class="botao" onclick="gerarPDF('${reg.id}')">
                        PDF
                    </button>
                    <button class="botao botao-excluir" onclick="excluirChecklist('${reg.id}', '${reg.usuario_id}')">
                        Excluir
                    </button>
                </div>
            `;

            lista.appendChild(linha);
        });
    }

    window.visualizarChecklist = function (id) {
        sessionStorage.setItem("checklist_visualizar", id);
        //alert("Tela de visualização em desenvolvimento.");
        window.location.href = "visualizar.html";
    };

    window.gerarPDF = function (id) {
         gerarPDFChecklist(id);
    };

    window.excluirChecklist = async function (checklistId, donoId) {

        if (perfil !== "admin" && donoId !== usuarioId) {
            alert("Você não pode excluir este checklist.");
            return;
        }

        if (!confirm("Deseja realmente excluir este checklist?")) return;

        const { error } = await window.supabaseClient
            .from("checklists")
            .delete()
            .eq("id", checklistId);

        if (error) {
            alert("Erro ao excluir checklist.");
            console.error(error);
            return;
        }

        carregarRelatorios();
    };

});

function voltarDashboard() {
    window.location.href = "dashboard.html";
}
