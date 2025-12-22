// js/admin_ambientes.js

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("formAmbiente");
    const inputCodigo = document.getElementById("codigo");
    const inputDescricao = document.getElementById("descricao");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const codigo = inputCodigo.value.trim().toUpperCase();
        const descricao = inputDescricao.value.trim();

        if (!codigo || !descricao) {
            alert("Preencha todos os campos.");
            return;
        }

        const { error } = await window.supabaseClient
            .from("ambientes")
            .insert([
                {
                    codigo: codigo,
                    descricao: descricao
                }
            ]);

        if (error) {
            console.error(error);
            alert("Erro ao salvar ambiente.");
            return;
        }

        alert("Ambiente cadastrado com sucesso!");

        // Limpa formulário
        inputCodigo.value = "";
        inputDescricao.value = "";

        // Pergunta se deseja adicionar itens
        if (confirm("Deseja cadastrar itens para este ambiente agora?")) {
            sessionStorage.setItem("novo_ambiente_codigo", codigo);
            window.location.href = "admin_itens.html";
        }
    });

});

function voltarAdmin() {
    window.location.href = "admin.html";
}

function sairSistema() {
    sessionStorage.clear();
    window.location.href = "index.html";
}
