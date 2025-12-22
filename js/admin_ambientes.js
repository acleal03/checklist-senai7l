// js/admin_ambientes.js

async function salvarAmbiente() {

    const inputCodigo = document.getElementById("codigo");
    const inputDescricao = document.getElementById("descricao");

    if (!inputCodigo || !inputDescricao) {
        alert("Campos não encontrados.");
        return;
    }

    const codigo = inputCodigo.value.trim().toUpperCase();
    const descricao = inputDescricao.value.trim();

    if (!codigo || !descricao) {
        alert("Preencha todos os campos.");
        return;
    }

    console.log("Salvando ambiente:", codigo, descricao);

    const { error } = await supabase
        .from("ambientes")
        .insert({
            codigo,
            descricao
        });

    if (error) {
        console.error(error);
        alert("Erro ao salvar ambiente.");
        return;
    }

    alert("Ambiente cadastrado com sucesso!");

    // Limpa campos
    inputCodigo.value = "";
    inputDescricao.value = "";

    // Fluxo inteligente
    if (confirm("Deseja cadastrar itens para este ambiente agora?")) {
        sessionStorage.setItem("ambiente_codigo", codigo);
        window.location.href = "admin_itens.html";
    }
}

function voltarAdmin() {
    window.location.href = "admin.html";
}

function sairSistema() {
    sessionStorage.clear();
    window.location.href = "index.html";
}
