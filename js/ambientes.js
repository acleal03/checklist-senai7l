// js/ambientes.js

document.addEventListener("DOMContentLoaded", () => {

    const perfil = sessionStorage.getItem("perfil");
    const grid = document.getElementById("gridAmbientes");
    const btnAdmin = document.getElementById("btnAdmin");

    if (perfil === "admin") {
        btnAdmin.style.display = "inline-block";
    }

    carregarAmbientes();

    async function carregarAmbientes() {
        const { data, error } = await window.supabaseClient
            .from("ambientes")
            .select("id, codigo, descricao")
            .order("codigo");

        if (error) {
            alert("Erro ao carregar ambientes.");
            console.error(error);
            return;
        }

        grid.innerHTML = "";

        data.forEach(ambiente => {
            const card = document.createElement("div");
            card.className = "card-ambiente";

            card.innerHTML = `
                <div class="ambiente-codigo">${ambiente.codigo}</div>
                <div class="ambiente-descricao">${ambiente.descricao || ""}</div>
            `;

            card.onclick = () => {
                sessionStorage.setItem("ambiente_id", ambiente.id);
                sessionStorage.setItem("ambiente_codigo", ambiente.codigo);
                sessionStorage.setItem("ambiente_descricao", ambiente.descricao || "");
                window.location.href = "dashboard.html";
            };

            grid.appendChild(card);
        });
    }

    window.abrirAdmin = function () {
        alert("Painel ADMIN em desenvolvimento.");
    };
});
