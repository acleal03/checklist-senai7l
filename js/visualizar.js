// js/visualizar.js

document.addEventListener("DOMContentLoaded", async () => {

    const checklistId = sessionStorage.getItem("checklist_visualizar");

    if (!checklistId) {
        alert("Checklist não identificado.");
        window.location.href = "relatorios.html";
        return;
    }

    // 🔹 CABEÇALHO
    const { data: checklist, error } = await window.supabaseClient
        .from("checklists")
        .select(`
            id,
            data_br,
            hora_br,
            observacoes,
            usuarios!fk_checklists_usuario ( username ),
            ambientes!fk_checklists_ambiente ( codigo, descricao )
        `)
        .eq("id", checklistId)
        .single();

    if (error) {
        alert("Erro ao carregar checklist.");
        console.error(error);
        return;
    }

    document.getElementById("infoChecklist").innerHTML = `
        <div class="card-opcao" style="text-align:left;">
            <strong>Ambiente:</strong> ${checklist.ambientes.codigo} - ${checklist.ambientes.descricao}<br>
            <strong>Usuário:</strong> ${checklist.usuarios.username}<br>
            <strong>Data:</strong> ${checklist.data_br} &nbsp;&nbsp;
            <strong>Hora:</strong> ${checklist.hora_br}<br><br>
            <strong>Observações Gerais:</strong><br>
            ${checklist.observacoes || "—"}
        </div>
    `;

    // 🔹 ITENS
    const { data: itens, error: erroItens } = await window.supabaseClient
        .from("checklist_itens")
        .select("nome_item, status, observacao")
        .eq("checklist_id", checklistId)
        .order("nome_item");

    if (erroItens) {
        alert("Erro ao carregar itens.");
        console.error(erroItens);
        return;
    }

    const lista = document.getElementById("listaItens");
    lista.innerHTML = "";

    itens.forEach(item => {

        const linha = document.createElement("div");

        const isDivergente = item.status === "DIVERGENTE";

        linha.className = isDivergente
            ? "linha-item-simples item-divergente"
            : "linha-item-simples";

        let texto = `• ${item.nome_item} – ${item.status}`;

        if (isDivergente && item.observacao) {
            texto += ` (${item.observacao})`;
        }

        linha.textContent = texto;
        lista.appendChild(linha);
    });
});

function voltarRelatorios() {
    window.location.href = "relatorios.html";
}
